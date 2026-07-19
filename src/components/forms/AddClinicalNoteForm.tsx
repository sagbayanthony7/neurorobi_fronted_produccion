import React, { useState } from 'react';
import type { ClinicalSession, SpecialistRole } from '../../types';
import { FileText, Save, ShieldAlert } from 'lucide-react';

interface AddClinicalNoteFormProps {
  session: ClinicalSession;
  onArchive: (notes: string) => void;
  activeRole: SpecialistRole;
}

export const AddClinicalNoteForm: React.FC<AddClinicalNoteFormProps> = ({
  session,
  onArchive,
  activeRole
}) => {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Por favor, redacte una evolución médica final detallada antes de archivar la sesión.');
      return;
    }
    if (notes.trim().length < 15) {
      setError('La nota clínica final debe ser lo suficientemente descriptiva (mínimo 15 caracteres).');
      return;
    }
    setError('');
    onArchive(notes.trim());
  };

  const getRoleLabel = (role: SpecialistRole) => {
    if (role === 'PSICOLOGIA_CLINICA') return 'Psicología Clínica';
    if (role === 'EDUCACION_ESPECIAL') return 'Educación Especial';
    if (role === 'FISIOTERAPIA') return 'Fisioterapia';
    if (role === 'ADMIN') return 'Administración / Auditoría';
    return role;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50 p-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Evolución Clínica Final</h3>
          <p className="text-xs text-slate-500 font-medium">
            Registrado por: <span className="font-bold text-slate-700">{getRoleLabel(activeRole)}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Conclusions Textarea */}
        <div>
          <label htmlFor="notes" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            Evolución Médica, Conclusiones y Tareas Clínicas
          </label>
          <textarea
            id="notes"
            rows={5}
            placeholder="Describa el comportamiento del paciente durante la sesión, su interacción afectiva con Neurorobi, posibles crisis de agitación identificadas y recomendaciones para futuras consultas..."
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (e.target.value.trim().length >= 15) setError('');
            }}
            className={`w-full px-4 py-3 text-sm bg-slate-50 hover:bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
              error 
                ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-400' 
                : 'border-slate-100 focus:ring-teal-500 focus:border-teal-400'
            }`}
          ></textarea>
          {error && (
            <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
              <ShieldAlert size={10} /> {error}
            </p>
          )}
        </div>

        {/* Dynamic Aggregates Quick Summary Box */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Métricas de Auditoría Calculadas</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">FC Promedio</span>
              <span className="text-sm font-black text-slate-700">{session.metrics.avgHeartRate} lpm</span>
            </div>
            
            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Grip Máximo</span>
              <span className="text-sm font-black text-slate-700">{session.metrics.maxHugForce}%</span>
            </div>
            
            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Afecto/Confort</span>
              <span className="text-sm font-black text-rose-600">{session.metrics.comfortIndex}%</span>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Alertas Totales</span>
              <span className="text-sm font-black text-amber-600">{session.metrics.spikesCount}</span>
            </div>
          </div>
        </div>

        {/* Master Action Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-teal-600/20 active:scale-98 transition-all"
        >
          <Save size={14} />
          Archivar en Historial Clínico de Supabase
        </button>

      </form>
      
    </div>
  );
};
