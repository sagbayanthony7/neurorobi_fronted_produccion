import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import { 
  Users, 
  Activity, 
  History, 
  Heart, 
  Brain, 
  Sparkles,
  Printer,
  FileText,
  UserPlus,
  PlayCircle,
  LayoutDashboard
} from 'lucide-react';
import { PrintReportModal } from '../components/shared/PrintReportModal';
import type { ClinicalSession } from '../types';

interface PatientDirectoryProps {
  onStartSessionSuccess: () => void;
  onShowSuccessToast: (msg: string) => void;
  onNavigate: (screen: 'directory' | 'patients' | 'telemetry' | 'report') => void;
}

export const PatientDirectory: React.FC<PatientDirectoryProps> = ({
  onStartSessionSuccess,
  onShowSuccessToast,
  onNavigate
}) => {
  const { patients, startSession, sessions } = usePatients();

  // Selected patient for quick session start
  const [quickPatientId, setQuickPatientId] = useState('');
  const [selectedSessionForPrint, setSelectedSessionForPrint] = useState<ClinicalSession | null>(null);

  const handleStartSession = () => {
    if (!quickPatientId) return;
    const patient = patients.find(p => p.id === quickPatientId);
    if (!patient) return;
    startSession(quickPatientId);
    onShowSuccessToast(`✓ Sesión terapéutica iniciada para ${patient.name}`);
    onStartSessionSuccess();
  };

  // Calculate statistics
  const totalPatients = patients.length;
  const totalSessions = sessions.length;
  
  const avgComfortIndex = totalSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.metrics?.comfortIndex || 0), 0) / totalSessions)
    : 0;

  const getRoleIcon = (role: string) => {
    if (role === 'PSICÓLOGO' || role === 'PSICOLOGIA_CLINICA') return <Heart size={12} className="text-rose-500" fill="currentColor" />;
    if (role === 'NEURÓLOGO' || role === 'NEUROLOGIA') return <Brain size={12} className="text-indigo-500" />;
    return <Sparkles size={12} className="text-emerald-500" />;
  };

  return (
    <div className="space-y-8 animate-all duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="text-teal-600" size={24} />
            Panel de Inicio Clínico
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Consola Neurorobi: Accesos rápidos y telemetría de soporte terapéutico</p>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Patients count */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-slate-200/60 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Users size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pacientes Activos</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{totalPatients}</span>
          </div>
        </div>

        {/* KPI 2: Sessions count */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-slate-200/60 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Sesiones Realizadas</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{totalSessions}</span>
          </div>
        </div>

        {/* KPI 3: Avg Comfort */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-slate-200/60 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Índice de Confort Ø</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{avgComfortIndex}%</span>
          </div>
        </div>

      </div>

      {/* Main Shortcuts Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Iniciar Sesión Rápida */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <PlayCircle size={18} />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Nueva Sesión Terapéutica</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seleccione un paciente registrado en Neurorobi para iniciar la transmisión y registro de telemetría de sensores en vivo.
            </p>
            <div>
              <label htmlFor="quick-patient" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Paciente</label>
              <select
                id="quick-patient"
                value={quickPatientId}
                onChange={(e) => setQuickPatientId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer font-semibold"
              >
                <option value="">Seleccione un paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.diagnosis})</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleStartSession}
            disabled={!quickPatientId}
            className={`w-full mt-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all ${
              quickPatientId
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/10 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Activity size={13} className={quickPatientId ? "animate-pulse" : ""} />
            Iniciar Consulta
          </button>
        </div>

        {/* Card 2: Gestión de Pacientes */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <UserPlus size={18} />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Gestión de Expedientes</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consola centralizada para registrar nuevos pacientes, editar información clínica, ver observaciones detalladas y eliminar registros históricos de forma segura.
            </p>
          </div>
          <button
            onClick={() => onNavigate('patients')}
            className="w-full mt-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/10 active:scale-98 transition-all cursor-pointer"
          >
            <Users size={13} />
            Administrar Pacientes
          </button>
        </div>

        {/* Card 3: Auditoría y Reporte */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                <FileText size={18} />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Auditoría de Reportes</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consulte y audite las gráficas completas de frecuencia cardíaca, giroscopio y nivel de fuerza de abrazo de las últimas sesiones realizadas por los pacientes.
            </p>
          </div>
          <button
            onClick={() => onNavigate('report')}
            className="w-full mt-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/10 active:scale-98 transition-all cursor-pointer"
          >
            <History size={13} />
            Ver Reportes y Gráficas
          </button>
        </div>

      </div>

      {/* BOTTOM CONTAINER: Clinical Archival Historial Clínico de Consultas */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
            <History size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Historial Clínico de Sesiones de Juguete Terapéutico</h3>
            <p className="text-xs text-slate-500 font-medium">Últimas consultas registradas y archivadas en el sistema.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {sessions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-100 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Aún no se han archivado reportes de consultas.</p>
            </div>
          ) : (
            <>
              {/* Desktop: Table view */}
              <table className="w-full text-left text-xs border-collapse hidden md:table">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Fecha</th>
                    <th className="pb-3">Paciente</th>
                    <th className="pb-3">Especialista</th>
                    <th className="pb-3">Duración</th>
                    <th className="pb-3">Métricas</th>
                    <th className="pb-3">Observaciones</th>
                    <th className="pb-3 text-right pr-2">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sessions.slice(0, 5).map(sess => (
                    <tr key={sess.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-2 font-semibold text-slate-600">{sess.date}</td>
                      <td className="py-4 font-bold text-slate-800">{sess.patientName}</td>
                      <td className="py-4 font-bold text-slate-700">
                        <span className="flex items-center gap-1 text-[11px]">
                          {getRoleIcon(sess.specialistRole)}
                          {sess.specialistRole.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 font-medium text-slate-500">{sess.durationSeconds} s</td>
                      <td className="py-4">
                        <div className="flex gap-1.5 text-[10px] font-bold uppercase">
                          <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">FC {sess.metrics?.avgHeartRate || 0}</span>
                          <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">{sess.metrics?.comfortIndex || 0}%</span>
                        </div>
                      </td>
                      <td className="py-4 max-w-xs truncate text-slate-500 font-medium pr-2" title={sess.notes}>
                        {sess.notes}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button
                          onClick={() => setSelectedSessionForPrint(sess)}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-[11px] uppercase tracking-wide border border-transparent hover:border-teal-100"
                        >
                          <Printer size={13} />
                          Reporte
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile: Card view */}
              <div className="md:hidden space-y-3">
                {sessions.slice(0, 5).map(sess => (
                  <div key={sess.id} className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{sess.patientName}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{sess.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        {getRoleIcon(sess.specialistRole)}
                        {sess.specialistRole.replace('_', ' ')}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>{sess.durationSeconds}s</span>
                    </div>
                    <div className="flex gap-1.5 text-[10px] font-bold uppercase">
                      <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">FC {sess.metrics?.avgHeartRate || 0}</span>
                      <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">{sess.metrics?.comfortIndex || 0}%</span>
                      {sess.metrics?.spikesCount ? <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">Alts: {sess.metrics.spikesCount}</span> : null}
                    </div>
                    {sess.notes && <p className="text-[11px] text-slate-500 truncate">{sess.notes}</p>}
                    <button
                      onClick={() => setSelectedSessionForPrint(sess)}
                      className="w-full mt-1 py-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 font-bold text-[11px] uppercase border border-slate-100 hover:border-teal-200"
                    >
                      <Printer size={13} />
                      Ver Reporte
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <PrintReportModal
        isOpen={selectedSessionForPrint !== null}
        onClose={() => setSelectedSessionForPrint(null)}
        session={selectedSessionForPrint}
      />

    </div>
  );
};
