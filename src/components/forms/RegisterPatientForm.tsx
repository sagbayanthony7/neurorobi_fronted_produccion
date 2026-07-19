import React, { useState, useRef } from 'react';
import { usePatients } from '../../context/PatientContext';
import { UserPlus, Sparkles, User, ShieldAlert, Camera, X } from 'lucide-react';

interface RegisterPatientFormProps {
  onSuccess: (patientName: string) => void;
}

export const RegisterPatientForm: React.FC<RegisterPatientFormProps> = ({ onSuccess }) => {
  const { registerPatient } = usePatients();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState<string | ''>('');
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [observation, setObservation] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre completo es requerido.';
    else if (name.trim().length < 3) newErrors.name = 'El nombre debe tener al menos 3 caracteres.';

    const ageNum = parseInt(age);
    if (!age) newErrors.age = 'La edad es requerida.';
    else if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      newErrors.age = 'La edad debe ser un valor válido entre 1 y 120 años.';
    }

    if (showCustomInput) {
      if (!customDiagnosis.trim()) newErrors.diagnosis = 'Escriba el diagnóstico personalizado.';
    } else {
      if (!diagnosis) newErrors.diagnosis = 'Seleccione un diagnóstico clínico.';
    }

    if (!observation.trim()) newErrors.observation = 'Ingrese una breve observación clínica inicial.';
    else if (observation.trim().length < 15) {
      newErrors.observation = 'La observación inicial debe ser más detallada (mínimo 15 caracteres).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const finalDiagnosis = showCustomInput ? customDiagnosis.trim() : diagnosis;

    try {
      const result = await registerPatient(
        name.trim(),
        parseInt(age),
        finalDiagnosis,
        observation.trim(),
        profileImage
      );

      if (result) {
        // Reset Form
        setName('');
        setAge('');
        setDiagnosis('');
        setCustomDiagnosis('');
        setShowCustomInput(false);
        setObservation('');
        setProfileImage(null);
        setPreviewUrl(null);
        setErrors({});
        onSuccess(name);
      } else {
        setErrors({ global: 'Error al registrar el paciente. Intente de nuevo.' });
      }
    } catch {
      setErrors({ global: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50 p-6 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
          <UserPlus size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Registrar Nuevo Paciente</h3>
          <p className="text-xs text-slate-500 font-medium">Ingrese los datos para abrir el expediente clínico.</p>
        </div>
      </div>

      {/* Error global */}
      {errors.global && (
        <div className="mb-4 bg-rose-50 text-rose-600 border border-rose-100 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <ShieldAlert size={14} /> {errors.global}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── FOTO DE PERFIL ── */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className={`h-24 w-24 rounded-full overflow-hidden border-4 flex items-center justify-center transition-all duration-200 ${
              previewUrl ? 'border-teal-400 shadow-lg shadow-teal-100' : 'border-dashed border-slate-200 bg-slate-50'
            }`}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <User size={36} className="text-slate-300" />
              )}
            </div>
            {/* Camera overlay */}
            <div className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={22} className="text-white" />
            </div>
            {/* Camera badge */}
            <div className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-teal-600 flex items-center justify-center shadow-md border-2 border-white">
              <Camera size={13} className="text-white" />
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-500">
              {previewUrl ? profileImage?.name : 'Haz clic para subir foto de perfil'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG o WEBP · Máx. 5 MB · Opcional</p>
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={removeImage}
              className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-semibold hover:bg-rose-50 px-2 py-1 rounded-lg transition-all"
            >
              <X size={12} /> Eliminar foto
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Name (Full Width) */}
        <div>
          <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Nombre Completo del Niño
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <User size={14} />
            </span>
            <input
              id="reg-name"
              type="text"
              placeholder="Ej. Juan Andrés Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.name 
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-400' 
                  : 'border-slate-100 focus:ring-teal-500 focus:border-teal-400'
              }`}
            />
          </div>
          {errors.name && <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1"><ShieldAlert size={10} /> {errors.name}</p>}
        </div>

        {/* Two Columns for Age and Diagnosis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Age */}
          <div>
            <label htmlFor="reg-age" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Edad (Años)
            </label>
            <input
              id="reg-age"
              type="number"
              min="1"
              max="120"
              placeholder="Ej. 8"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={`w-full px-4 py-2 text-sm bg-slate-50 hover:bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.age 
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-400' 
                  : 'border-slate-100 focus:ring-teal-500 focus:border-teal-400'
              }`}
            />
            {errors.age && <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1"><ShieldAlert size={10} /> {errors.age}</p>}
          </div>

          {/* Diagnosis */}
          <div>
            <label htmlFor="reg-diagnosis" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Diagnóstico Clínico
            </label>
            <select
              id="reg-diagnosis"
              value={showCustomInput ? "custom" : diagnosis}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomInput(true);
                  setDiagnosis('');
                } else {
                  setShowCustomInput(false);
                  setDiagnosis(e.target.value);
                }
              }}
              className={`w-full px-4 py-2 text-sm bg-slate-50 hover:bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.diagnosis 
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-400' 
                  : 'border-slate-100 focus:ring-teal-500 focus:border-teal-400'
              }`}
            >
              <option value="" disabled>Seleccione...</option>
              <option value="TDAH">TDAH</option>
              <option value="Trastorno de Integración Sensorial">T. Integración Sensorial</option>
              <option value="Ansiedad Infantil">Ansiedad Infantil</option>
              <option value="custom">Otro (personalizado)...</option>
            </select>

            {showCustomInput && (
              <input
                type="text"
                placeholder="Ej. Trastorno del Espectro Autista (TEA)"
                value={customDiagnosis}
                onChange={(e) => setCustomDiagnosis(e.target.value)}
                className={`w-full px-4 py-2 mt-2 text-sm bg-slate-50 hover:bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.diagnosis 
                    ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-400' 
                    : 'border-slate-100 focus:ring-teal-500 focus:border-teal-400'
                }`}
              />
            )}
            {errors.diagnosis && <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1"><ShieldAlert size={10} /> {errors.diagnosis}</p>}
          </div>

        </div>

        {/* Initial Observations */}
        <div>
          <label htmlFor="reg-observation" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Observaciones Clínicas Iniciales
          </label>
          <textarea
            id="reg-observation"
            rows={3}
            placeholder="Comportamiento del niño, sensibilidad a texturas, nivel de hiperactividad..."
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className={`w-full px-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
              errors.observation 
                ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-400' 
                : 'border-slate-100 focus:ring-teal-500 focus:border-teal-400'
            }`}
          ></textarea>
          {errors.observation && <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1"><ShieldAlert size={10} /> {errors.observation}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-teal-700 shadow-md shadow-teal-600/20 active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Sparkles size={14} />
          )}
          {loading ? 'Registrando...' : 'Registrar Paciente en Neurorobi'}
        </button>

      </form>
    </div>
  );
};
