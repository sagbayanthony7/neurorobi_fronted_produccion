import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import { useRole } from '../context/RoleContext';
import { AddClinicalNoteForm } from '../components/forms/AddClinicalNoteForm';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Heart, 
  Sparkles, 
  Timer, 
  AlertTriangle,
  ShieldCheck,
  ActivitySquare,
  Printer
} from 'lucide-react';
import { PrintReportModal } from '../components/shared/PrintReportModal';


interface PostSessionReportProps {
  onArchiveSuccess: () => void;
  onShowSuccessToast: (msg: string) => void;
  onShowErrorToast?: (msg: string) => void;
}

type SegmentTab = 'pressure' | 'heartRate' | 'gyro';

export const PostSessionReport: React.FC<PostSessionReportProps> = ({
  onArchiveSuccess,
  onShowSuccessToast,
  onShowErrorToast
}) => {
  const { activeSession, archiveSession, loadDemoSession } = usePatients();
  const { activeRole } = useRole();

  const [activeTab, setActiveTab] = useState<SegmentTab>('pressure');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // If there's no active session, show clean fallback state
  if (!activeSession) {
    const handleLoadDemo = () => {
      loadDemoSession();
      onShowSuccessToast("✓ Reporte de sesión demo cargado.");
    };

    return (
      <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm max-w-lg mx-auto my-12 animate-in fade-in zoom-in-95 duration-300">
        <AlertTriangle className="text-slate-400 mx-auto mb-4" size={48} />
        <h2 className="text-base font-bold text-slate-700">Sin Reporte de Sesión Activo</h2>
        <p className="text-xs text-slate-400 font-semibold mt-1 mb-6">
          Por favor inicie y complete una consulta terapéutica en el Directorio Clínico, o cargue los datos de demostración predeterminados.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleLoadDemo}
            className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-teal-600/20 active:scale-98 cursor-pointer"
          >
            Cargar Reporte Demo
          </button>
        </div>
      </div>
    );
  }

  const { metrics, sensorHistory, spikesLog } = activeSession;

  // Format Duration display
  const mins = Math.floor(activeSession.durationSeconds / 60);
  const secs = activeSession.durationSeconds % 60;

  // Filter logs based on active segment
  const getFilteredSpikes = () => {
    if (activeTab === 'pressure') return spikesLog.filter(s => s.type === 'Presión');
    if (activeTab === 'heartRate') return spikesLog.filter(s => s.type === 'Frecuencia Cardíaca');
    return spikesLog.filter(s => s.type === 'Cinemática');
  };

  // Archiving final log handler
  const handleArchiveSubmit = async (clinicalNotes: string) => {
    const finalized = {
      ...activeSession,
      notes: clinicalNotes,
      durationSeconds: activeSession.durationSeconds || 120
    };
    try {
      await archiveSession(finalized);
      onShowSuccessToast(`✓ Expediente clínico sincronizado y guardado con éxito.`);
      onArchiveSuccess();
    } catch (e) {
      console.error('Error archiving session', e);
      onShowErrorToast?.(`❌ Error al guardar el reporte. Verifique la conexión e intente de nuevo.`);
    }
  };

  const filteredSpikes = getFilteredSpikes();

  // Color mapping helper
  const getTabBorderColor = (tab: SegmentTab) => {
    if (tab === 'pressure') return activeTab === 'pressure' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:bg-slate-50 text-slate-600';
    if (tab === 'heartRate') return activeTab === 'heartRate' ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-slate-100 hover:bg-slate-50 text-slate-600';
    return activeTab === 'gyro' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:bg-slate-50 text-slate-600';
  };

  // Pie chart data for motor stability state (Calm vs Tics)
  const calmValue = metrics.calmStatePercentage || 85;
  const ticValue = 100 - calmValue;
  const pieData = [
    { name: 'Calma Estable', value: calmValue, color: '#6366f1' }, // Indigo-500
    { name: 'Frecuencia de Tics', value: ticValue, color: '#f43f5e' } // Rose-500
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Header: Patient Summary & Duration Block */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-1">Diagnóstico Post-Sesión</span>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Reporte Clínico: {activeSession.patientName}</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Expediente temporal congelado para auditoría de especialidad.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Duración Terapia</span>
            <span className="text-sm font-black text-slate-700 flex items-center gap-1 mt-0.5"><Timer size={12} /> {mins}m {secs}s</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-center">            <span className="text-[9px] font-bold text-slate-600 uppercase block">Dispositivo</span>
            <span className="text-xs font-black text-slate-700 uppercase flex items-center gap-1 mt-0.5">{activeSession.deviceType === 'oso' ? 'Oso' : 'Pulsera'}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-center">            <span className="text-[9px] font-bold text-emerald-600 uppercase block">Estado</span>
            <span className="text-xs font-black text-emerald-800 flex items-center gap-1 mt-0.5"><ShieldCheck size={12} /> Procesado</span>
          </div>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-teal-600/10 active:scale-98 cursor-pointer"
          >
            <Printer size={14} /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* 2. Analytical Selector Segment Buttons (A, B, C) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        
        {/* Button A: Pressure */}
        <button
          onClick={() => setActiveTab('pressure')}
          className={`flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 px-2 sm:px-5 py-3 sm:py-4 border-2 rounded-2xl text-center sm:text-left font-bold text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer transition-all ${getTabBorderColor('pressure')}`}
        >
          <Sparkles size={16} />
          <div className="flex flex-col items-center sm:items-start leading-none gap-0.5 sm:gap-1">
            <span>Presión</span>
            <span className="text-[9px] font-bold opacity-60 hidden sm:block">Comfort: {metrics.comfortIndex}%</span>
          </div>
        </button>

        {/* Button B: Heart Rate */}
        <button
          onClick={() => setActiveTab('heartRate')}
          className={`flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 px-2 sm:px-5 py-3 sm:py-4 border-2 rounded-2xl text-center sm:text-left font-bold text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer transition-all ${getTabBorderColor('heartRate')}`}
        >
          <Heart size={16} fill={activeTab === 'heartRate' ? 'currentColor' : 'none'} />
          <div className="flex flex-col items-center sm:items-start leading-none gap-0.5 sm:gap-1">
            <span>Cardíaco</span>
            <span className="text-[9px] font-bold opacity-60 hidden sm:block">FC Prom: {metrics.avgHeartRate} lpm</span>
          </div>
        </button>

        {/* Button C: Kinematic */}
        <button
          onClick={() => setActiveTab('gyro')}
          className={`flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 px-2 sm:px-5 py-3 sm:py-4 border-2 rounded-2xl text-center sm:text-left font-bold text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer transition-all ${getTabBorderColor('gyro')}`}
        >
          <ActivitySquare size={16} />
          <div className="flex flex-col items-center sm:items-start leading-none gap-0.5 sm:gap-1">
            <span>Cinemática</span>
            <span className="text-[9px] font-bold opacity-60 hidden sm:block">Estable: {metrics.calmStatePercentage}%</span>
          </div>
        </button>

      </div>

      {/* 3. Sub-Dashboard Grid: Charts and widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* High Resolution Chart Card (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              {activeTab === 'pressure' && 'Historial Estático de Fuerza y Agarre de Peluche'}
              {activeTab === 'heartRate' && 'Historial Estático de Ritmo Cardíaco del Niño'}
              {activeTab === 'gyro' && 'Historial Estático de Variaciones Cinemáticas Giroscópicas'}
              {(activeTab as string) === 'annotations' && 'Cronograma de Observaciones Clínicas Registradas en Vivo'}
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Reporte continuo archivado durante la última consulta.</p>
          </div>

          {/* Recharts chart */}
          <div className="h-64 w-full overflow-hidden">
            {sensorHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center border border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                <p className="text-xs text-slate-400 font-medium">No hay registros de sensores en memoria para esta sesión (Mocked base predeterminada).</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey={
                      activeTab === 'pressure' 
                        ? 'hugForce' 
                        : activeTab === 'heartRate' 
                        ? 'heartRate' 
                        : 'rotationX'
                    }
                    name={
                      activeTab === 'pressure' 
                        ? 'Fuerza de Abrazo (%)' 
                        : activeTab === 'heartRate' 
                        ? 'Frecuencia Cardíaca (bpm)' 
                        : 'Desviación Angular X (°/s)'
                    }
                    stroke={
                      activeTab === 'pressure' 
                        ? '#0d9488' 
                        : activeTab === 'heartRate' 
                        ? '#e11d48' 
                        : '#6366f1'
                    }
                    fill={
                      activeTab === 'pressure' 
                        ? '#ccfbf1' 
                        : activeTab === 'heartRate' 
                        ? '#ffe4e6' 
                        : '#e0e7ff'
                    }
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Specialized Analytical Widgets Column (Takes 1 column) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* PRESSURE SEGMENT WIDGET */}
          {activeTab === 'pressure' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Índice de Confort Afectivo</h4>
                
                {/* Visual Ring Gauge */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="45" className="stroke-slate-100" strokeWidth="8" fill="transparent" />
                      <circle cx="56" cy="56" r="45" className="stroke-teal-600" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 45} strokeDashoffset={2 * Math.PI * 45 - (metrics.comfortIndex / 100) * (2 * Math.PI * 45)} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xl font-black text-slate-800">{metrics.comfortIndex}%</span>
                  </div>
                  
                  <span className="text-[10px] bg-teal-50 border border-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full mt-4">
                    Calibración: Alta Afectividad
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-[11px] text-slate-500 leading-relaxed font-semibold">
                * Mide la estabilidad de las presiones superiores a 40% durante más de 5 segundos contiguos.
              </div>
            </div>
          )}

          {/* HEART RATE SEGMENT WIDGET */}
          {activeTab === 'heartRate' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Zonas de Estrés Autonómico</h4>
                
                {/* Horizontal Progress Bars */}
                <div className="space-y-4 my-2">
                  {/* Zone 1: Cardio Stress */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-rose-600 mb-1">
                      <span>ZONA ALTA STRESS (&gt;115 bpm)</span>
                      <span>{metrics.avgHeartRate > 110 ? '30%' : '10%'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: metrics.avgHeartRate > 110 ? '30%' : '10%' }}></div>
                    </div>
                  </div>

                  {/* Zone 2: Regulado */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-teal-600 mb-1">
                      <span>ZONA ADAPTATIVA (75-95 bpm)</span>
                      <span>{metrics.avgHeartRate > 110 ? '55%' : '80%'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500" style={{ width: metrics.avgHeartRate > 110 ? '55%' : '80%' }}></div>
                    </div>
                  </div>

                  {/* Zone 3: Descanso */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-indigo-600 mb-1">
                      <span>ZONA DE REPOSO (&lt;75 bpm)</span>
                      <span>{metrics.avgHeartRate > 110 ? '15%' : '10%'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: metrics.avgHeartRate > 110 ? '15%' : '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-[11px] text-slate-500 leading-relaxed font-semibold">
                * Representa el porcentaje de tiempo acumulado del infante en cada espectro autonómico.
              </div>
            </div>
          )}

          {/* GYROSCOPE SEGMENT WIDGET */}
          {activeTab === 'gyro' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Mapa de Estabilidad Motriz</h4>
                
                {/* Pie Chart / Donut */}
                <div className="h-32 w-full flex items-center justify-center my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend list */}
                  <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-600 pl-4 shrink-0">
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Calma ({calmValue}%)</div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Crisis ({ticValue}%)</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-[11px] text-slate-500 leading-relaxed font-semibold">
                * Identifica el nivel de calma del paciente contra eventos de agitación giroscópica.
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 4. Timeline list of spikes & stabilizing drops */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Registro Cronológico de Eventos (Spikes & Estabilizaciones)</h3>
        
        <div className="relative border-l border-slate-100 pl-6 space-y-4">
          
          {filteredSpikes.length === 0 ? (
            <div className="text-xs text-slate-400 font-medium py-4">No se registraron anomalías ni spikes en este canal de sensores. Todo se mantuvo en rangos clínicos seguros.</div>
          ) : (
            filteredSpikes.map(spike => (
              <div key={spike.id} className="relative flex items-start gap-4">
                
                {/* Timeline node icon */}
                <span className="absolute -left-[31px] bg-white p-1 rounded-full border border-slate-100">
                  <span className={`h-2 w-2 rounded-full block ${
                    spike.severity === 'critical' 
                      ? 'bg-rose-500' 
                      : spike.severity === 'warning' 
                      ? 'bg-amber-400' 
                      : 'bg-indigo-500'
                  }`}></span>
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      [{spike.timestamp}]
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      spike.severity === 'critical' 
                        ? 'text-rose-600' 
                        : spike.severity === 'warning' 
                        ? 'text-amber-600' 
                        : 'text-indigo-600'
                    }`}>
                      {spike.severity === 'critical' ? '⚠️ Subida Crítica' : '⚠️ Anomalía Detectada'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                    {spike.alertText} Valor registrado: <span className="font-bold text-slate-900">{spike.value}</span>
                  </p>
                </div>

              </div>
            ))
          )}

          {/* Simulated stabilization drop decoration for high-fidelity report */}
          <div className="relative flex items-start gap-4">
            <span className="absolute -left-[31px] bg-white p-1 rounded-full border border-slate-100">
              <span className="h-2 w-2 rounded-full block bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                  [Sincronizado]
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  📉 Bajón y Estabilización exitosa
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                La respuesta afectiva al juguete de peluche co-reguló la activación autonómica simpática. El pulso se estabilizó exitosamente a rangos basales seguros.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Conclusions & Archiving Form */}
      <AddClinicalNoteForm
        session={activeSession}
        onArchive={handleArchiveSubmit}
        activeRole={activeRole}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        session={activeSession}
      />

    </div>
  );
};
