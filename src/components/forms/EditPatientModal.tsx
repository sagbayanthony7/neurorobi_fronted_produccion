import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { usePatients } from '../../context/PatientContext';
import type { Patient } from '../../types';
import {
  X, User, ShieldAlert, Save, Undo, Camera
} from 'lucide-react';

interface EditPatientModalProps {
  patient: Patient;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  patient,
  onClose,
  onSuccess
}) => {
  const { updatePatient } = usePatients();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const standardDiagnoses = ['TDAH', 'Trastorno de Integración Sensorial', 'Ansiedad Infantil'];

  const [editName, setEditName] = useState(patient.name);
  const [editAge, setEditAge] = useState(patient.age.toString());
  const [editDiagnosis, setEditDiagnosis] = useState(
    standardDiagnoses.includes(patient.diagnosis) ? patient.diagnosis : 'custom'
  );
  const [editCustomDiagnosis, setEditCustomDiagnosis] = useState(
    standardDiagnoses.includes(patient.diagnosis) ? '' : patient.diagnosis
  );
  const [showCustomInput, setShowCustomInput] = useState(
    !standardDiagnoses.includes(patient.diagnosis)
  );
  const [editObservation, setEditObservation] = useState(patient.initialObservation);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    patient.profileImageUrl ? `${import.meta.env.VITE_API_URL}${patient.profileImageUrl}` : null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!editName.trim()) newErrors.name = 'El nombre es requerido.';
    else if (editName.trim().length < 3) newErrors.name = 'Mínimo 3 caracteres.';

    const ageNum = parseInt(editAge);
    if (!editAge) newErrors.age = 'La edad es requerida.';
    else if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) newErrors.age = 'Edad inválida (1–120).';

    if (showCustomInput) {
      if (!editCustomDiagnosis.trim()) newErrors.diagnosis = 'Escriba el diagnóstico.';
    } else {
      if (!editDiagnosis) newErrors.diagnosis = 'Seleccione un diagnóstico.';
    }

    if (!editObservation.trim()) newErrors.observation = 'La observación es requerida.';
    else if (editObservation.trim().length < 15) newErrors.observation = 'Mínimo 15 caracteres.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const finalDiagnosis = showCustomInput ? editCustomDiagnosis.trim() : editDiagnosis;

    const updated = await updatePatient(
      patient.id,
      editName.trim(),
      parseInt(editAge),
      finalDiagnosis,
      editObservation.trim(),
      profileImage
    );

    setSaving(false);
    if (updated) {
      onSuccess(`✓ Expediente de ${updated.name} actualizado`);
      onClose();
    } else {
      setErrors({ global: 'Error al guardar. Intente de nuevo.' });
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            {previewUrl ? (
              <img src={previewUrl} alt={editName} className="h-9 w-9 rounded-xl object-cover border border-slate-100 shadow-xs" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <User size={18} />
              </div>
            )}
            <div>
              <h2 className="text-sm font-bold text-slate-800">Editar Expediente</h2>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[260px]">{patient.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {errors.global && (
            <div className="mb-4 bg-rose-50 text-rose-600 border border-rose-100 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <ShieldAlert size={14} /> {errors.global}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Avatar interactivo */}
            <div className="flex flex-col items-center gap-2 py-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`h-20 w-20 rounded-full overflow-hidden border-4 flex items-center justify-center transition-all ${
                  previewUrl ? 'border-teal-400 shadow-lg shadow-teal-100' : 'border-dashed border-slate-300 bg-white'
                }`}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User size={30} className="text-slate-300" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-teal-600 hover:bg-teal-700 flex items-center justify-center shadow border-2 border-white cursor-pointer"
                >
                  <Camera size={13} className="text-white" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">
                {profileImage ? profileImage.name : 'Clic para cambiar la foto'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Nombre Completo del Niño
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><User size={14} /></span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-400'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1"><ShieldAlert size={10} />{errors.name}</p>}
            </div>

            {/* Edad + Diagnóstico */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Edad (Años)</label>
                <input
                  type="number" min="1" max="120"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.age ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-400'
                  }`}
                />
                {errors.age && <p className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1"><ShieldAlert size={10} />{errors.age}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Diagnóstico</label>
                <select
                  value={showCustomInput ? 'custom' : editDiagnosis}
                  onChange={(e) => {
                    if (e.target.value === 'custom') { setShowCustomInput(true); setEditDiagnosis(''); }
                    else { setShowCustomInput(false); setEditDiagnosis(e.target.value); }
                  }}
                  className={`w-full px-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                    errors.diagnosis ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-400'
                  }`}
                >
                  <option value="" disabled>Seleccione...</option>
                  <option value="TDAH">TDAH</option>
                  <option value="Trastorno de Integración Sensorial">T. Integración Sensorial</option>
                  <option value="Ansiedad Infantil">Ansiedad Infantil</option>
                  <option value="custom">Otro...</option>
                </select>
                {showCustomInput && (
                  <input
                    type="text"
                    placeholder="Diagnóstico personalizado"
                    value={editCustomDiagnosis}
                    onChange={(e) => setEditCustomDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 mt-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                )}
                {errors.diagnosis && <p className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1"><ShieldAlert size={10} />{errors.diagnosis}</p>}
              </div>
            </div>

            {/* Observación */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Observación Clínica Inicial
              </label>
              <textarea
                rows={4}
                value={editObservation}
                onChange={(e) => setEditObservation(e.target.value)}
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 resize-none transition-all ${
                  errors.observation ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-400'
                }`}
              />
              {errors.observation && <p className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1"><ShieldAlert size={10} />{errors.observation}</p>}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wide shadow-md shadow-teal-600/20 transition-all active:scale-98 cursor-pointer disabled:opacity-60"
              >
                {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={14} />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wide transition-all cursor-pointer"
              >
                <Undo size={14} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
