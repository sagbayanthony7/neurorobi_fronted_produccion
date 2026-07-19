import React from 'react';
import { X, Printer, Shield, FileText } from 'lucide-react';
import type { ClinicalSession } from '../../types';
import { usePatients } from '../../context/PatientContext';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ClinicalSession | null;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  session
}) => {
  const { patients } = usePatients();

  if (!isOpen || !session) return null;

  // Retrieve patient details from context for complete report info
  const patient = patients.find(p => p.id === session.patientId);
  const age = patient?.age || 7;
  const diagnosis = patient?.diagnosis || 'Diagnóstico Personalizado';
  const registeredAt = patient?.registeredAt || session.date;

  const handlePrint = () => {
    window.print();
  };

  // Format the date field — could be an ISO string from the DB or a locale string
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      // Check if valid date
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch {
      // ignore
    }
    return dateStr; // fallback to raw string
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 py-8 bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-print">
      
      {/* Modal Container - full scroll via parent, content visible */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col border border-slate-100 my-auto">
        
        {/* Header (No print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-teal-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Vista Previa de Informe Clínico Oficial
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-teal-600/10 cursor-pointer"
            >
              <Printer size={14} />
              Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal body containing the printable A4 sheet */}
        <div className="p-4 sm:p-8 bg-slate-100/50 overflow-y-auto max-h-[85vh]">
          
          {/* A4 Sheet Container */}
          <div 
            id="printable-clinical-report"
            className="bg-white mx-auto p-4 sm:p-10 shadow-lg border border-slate-200/80 rounded-sm font-sans text-slate-800 max-w-[210mm] min-h-0 sm:min-h-[297mm] box-border"
          >
            
            {/* 1. DOCUMENT HEADER */}
            <div className="border-b-4 border-teal-600 pb-5 mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="bg-teal-600 text-white rounded-lg px-2.5 py-1 text-base font-extrabold shadow-sm">NR</span>
                  CENTRO DE NEURODESARROLLO NEUROROBI
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                  Reporte Técnico - Clínico de Sesión Terapéutica IoT
                </p>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                  Tecnología de Co-regulación Afectiva y Sensorial ESP32
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                  ID: {session.id.substring(0, 12)}
                </span>
                <p className="text-[10px] text-slate-400 font-semibold mt-2">
                  Fecha Emisión: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* 2. PATIENT AND THERAPIST BIOGRAPHICAL SUMMARY */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Paciente</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">{session.patientName}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Edad / Registro</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">{age} años (Reg: {registeredAt})</span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Diagnóstico Principal</span>
                <span className="text-xs font-black text-teal-700 bg-teal-50/50 px-2 py-0.5 rounded border border-teal-100/50 mt-0.5 inline-block">{diagnosis}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Especialista / Rol</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block uppercase">{session.specialistRole.replace('_', ' ')}</span>
              </div>
            </div>

            {/* 3. THERAPY METADATA */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Fecha de Terapia</span>
                <span className="text-xs font-bold text-slate-700 mt-1 block">{formatDate(session.date)}</span>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Duración de Sesión</span>
                <span className="text-xs font-bold text-slate-700 mt-1 block">{formatDuration(session.durationSeconds)}</span>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Dispositivo Usado</span>
                <span className="text-xs font-bold text-slate-700 mt-1 block uppercase">{session.deviceType === 'oso' ? 'Oso' : 'Pulsera'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Metric A: Heart Rate */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Frecuencia Cardíaca</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-black text-rose-600">{session.metrics.avgHeartRate}</span>
                    <span className="text-[9px] text-slate-400 font-bold">bpm (Promedio)</span>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50 text-[9px] font-bold text-slate-500 uppercase">
                    <span>Mín: {session.metrics.minHeartRate}</span>
                    <span>Máx: {session.metrics.maxHeartRate}</span>
                  </div>
                </div>

                {/* Metric B: Hug Force */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Fuerza de Agarre / Abrazos</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-black text-teal-600">{session.metrics.avgHugForce}%</span>
                    <span className="text-[9px] text-slate-400 font-bold">(Promedio)</span>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50 text-[9px] font-bold text-slate-500 uppercase">
                    <span>Máx: {session.metrics.maxHugForce}%</span>
                  </div>
                </div>

                {/* Metric C: Comfort Index */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Confort Afectivo</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-black text-indigo-600">{session.metrics.comfortIndex}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-indigo-500" style={{ width: `${session.metrics.comfortIndex}%` }}></div>
                  </div>
                </div>

                {/* Metric D: Bilateral Touch Sync */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Sincronización Bilateral</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-black text-emerald-600">{session.metrics.bilateralSync}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-emerald-500" style={{ width: `${session.metrics.bilateralSync}%` }}></div>
                  </div>
                </div>

                {/* Metric E: Motor Stability */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Estabilidad y Calma Motriz</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-black text-indigo-600">{session.metrics.calmStatePercentage}%</span>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50 text-[9px] font-bold text-slate-500 uppercase">
                    <span>Tics: {session.metrics.stereotypicalCount}</span>
                  </div>
                </div>

                {/* Metric F: Motor Fatigue Score */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Puntuación de Fatiga Motora</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-black text-amber-600">{session.metrics.motorFatigueScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-amber-500" style={{ width: `${session.metrics.motorFatigueScore}%` }}></div>
                  </div>
                </div>
            </div>

            {/* 5. SPIKES LOG LISTING */}
            <div className="mb-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <Shield size={10} className="text-teal-600" />
                Historial Cronológico de Anomalías Fisiológicas (Spikes)
              </h3>
              
              <div className="space-y-2.5">
                {session.spikesLog.filter(s => (s.type as string) !== 'Anotación Clínica').length === 0 ? (
                  <p className="text-[11px] text-slate-500 font-semibold py-2">
                    ✓ Sin eventos de spikes ni anomalías fisiológicas. El pulso, abrazos e inclinación del giroscopio se mantuvieron en niveles clínicos totalmente estables.
                  </p>
                ) : (
                  session.spikesLog
                    .filter(s => (s.type as string) !== 'Anotación Clínica')
                    .map(spike => (
                      <div 
                        key={spike.id} 
                        className={`p-3 rounded-xl border flex justify-between items-center text-[10px] ${
                          spike.severity === 'critical' 
                            ? 'bg-rose-50/40 border-rose-100 text-rose-800' 
                            : 'bg-amber-50/40 border-amber-100 text-amber-800'
                        }`}
                      >
                        <div>
                          <span className="font-black uppercase tracking-wider block">
                            [{spike.timestamp}] · Alerta de {spike.type}
                          </span>
                          <span className="font-semibold mt-0.5 block">{spike.alertText}</span>
                        </div>
                        <span className="text-xs font-black self-center mr-2">
                          Valor: {spike.value}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* 6. CLINICAL OBSERVATIONS */}
            <div className="mb-10">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <FileText size={10} className="text-teal-600" />
                Observaciones Clínicas Generales y Evolución
              </h3>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-xs text-slate-700 leading-relaxed font-semibold">
                {session.notes || 'No se registraron observaciones adicionales al finalizar esta sesión terapéutica de telemetría.'}
              </div>
            </div>

            {/* 7. SIGNATURE BLOCK */}
            <div className="mt-16 pt-10 border-t border-slate-100 grid grid-cols-2 gap-16 text-center">
              <div>
                <div className="h-16 flex items-end justify-center">
                  <span className="w-48 border-b border-slate-300"></span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider mt-2">
                  Firma del Especialista
                </span>
                <span className="text-[8px] text-slate-400 font-semibold uppercase block">
                  {session.specialistRole.replace('_', ' ')} Neurorobi
                </span>
              </div>
              
              <div>
                <div className="h-16 flex items-end justify-center">
                  <span className="w-48 border-b border-slate-300"></span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider mt-2">
                  Dirección del Centro
                </span>
                <span className="text-[8px] text-slate-400 font-semibold uppercase block">
                  Control Clínico Neurorobi
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
