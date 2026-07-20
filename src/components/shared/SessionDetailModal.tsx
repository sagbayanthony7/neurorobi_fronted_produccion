import React, { useState } from 'react';
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
  X,
  Heart,
  Sparkles,
  Timer,
  ActivitySquare,
  AlertTriangle
} from 'lucide-react';
import type { ClinicalSession } from '../../types';
import { formatDate } from '../../utils/formatDate';

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ClinicalSession;
}

type SegmentTab = 'pressure' | 'heartRate' | 'gyro';

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    PSICOLOGIA_CLINICA: 'Psicología Clínica',
    EDUCACION_ESPECIAL: 'Educación Especial',
    FISIOTERAPIA: 'Fisioterapia',
    ADMIN: 'Administrador'
  };
  return map[role] || role.replace('_', ' ');
};

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  isOpen,
  onClose,
  session
}) => {
  const [activeTab, setActiveTab] = useState<SegmentTab>('pressure');

  if (!isOpen || !session) return null;

  const { metrics, sensorHistory, spikesLog } = session;
  const mins = Math.floor(session.durationSeconds / 60);
  const secs = session.durationSeconds % 60;

  const getFilteredSpikes = () => {
    if (activeTab === 'pressure') return spikesLog.filter(s => s.type === 'Presión');
    if (activeTab === 'heartRate') return spikesLog.filter(s => s.type === 'Frecuencia Cardíaca');
    return spikesLog.filter(s => s.type === 'Cinemática');
  };

  const getTabBorderColor = (tab: SegmentTab) => {
    if (tab === 'pressure') return activeTab === 'pressure' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:bg-slate-50 text-slate-600';
    if (tab === 'heartRate') return activeTab === 'heartRate' ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-slate-100 hover:bg-slate-50 text-slate-600';
    return activeTab === 'gyro' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:bg-slate-50 text-slate-600';
  };

  const calmValue = metrics.calmStatePercentage || 85;
  const ticValue = 100 - calmValue;
  const pieData = [
    { name: 'Calma Estable', value: calmValue, color: '#6366f1' },
    { name: 'Frecuencia de Tics', value: ticValue, color: '#f43f5e' }
  ];

  const filteredSpikes = getFilteredSpikes();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-1">Detalle de Sesión</span>
            <h2 className="text-base font-black text-slate-800 tracking-tight">
              {session.patientName} — {getRoleLabel(session.specialistRole)}
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              {formatDate(session.date)} · Dispositivo: {session.deviceType === 'oso' ? 'Oso' : 'Pulsera'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Duración</span>
              <span className="text-sm font-black text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                <Timer size={12} /> {mins}m {secs}s
              </span>
            </div>
            <div className="bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-rose-400 uppercase block">FC Promedio</span>
              <span className="text-sm font-black text-rose-700 mt-0.5 block">{metrics.avgHeartRate} lpm</span>
            </div>
            <div className="bg-teal-50 border border-teal-100 px-3 py-2.5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-teal-500 uppercase block">Confort</span>
              <span className="text-sm font-black text-teal-700 mt-0.5 block">{metrics.comfortIndex}%</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 px-3 py-2.5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-indigo-400 uppercase block">Spikes</span>
              <span className="text-sm font-black text-indigo-700 flex items-center justify-center gap-1 mt-0.5">
                <AlertTriangle size={12} /> {metrics.spikesCount}
              </span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('pressure')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 border-2 rounded-xl font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-all ${getTabBorderColor('pressure')}`}
            >
              <Sparkles size={14} />
              <div className="flex flex-col items-center leading-none gap-0.5">
                <span>Presión</span>
                <span className="text-[9px] opacity-60">Comfort: {metrics.comfortIndex}%</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('heartRate')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 border-2 rounded-xl font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-all ${getTabBorderColor('heartRate')}`}
            >
              <Heart size={14} fill={activeTab === 'heartRate' ? 'currentColor' : 'none'} />
              <div className="flex flex-col items-center leading-none gap-0.5">
                <span>Cardíaco</span>
                <span className="text-[9px] opacity-60">FC: {metrics.avgHeartRate} lpm</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('gyro')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 border-2 rounded-xl font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-all ${getTabBorderColor('gyro')}`}
            >
              <ActivitySquare size={14} />
              <div className="flex flex-col items-center leading-none gap-0.5">
                <span>Cinemática</span>
                <span className="text-[9px] opacity-60">Estable: {metrics.calmStatePercentage}%</span>
              </div>
            </button>
          </div>

          {/* Chart + Widget Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
                {activeTab === 'pressure' && 'Historial de Fuerza y Agarre'}
                {activeTab === 'heartRate' && 'Historial de Ritmo Cardíaco'}
                {activeTab === 'gyro' && 'Historial Cinemático Giroscópico'}
              </h3>
              <div className="h-56 w-full">
                {sensorHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center border border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                    <p className="text-[11px] text-slate-400 font-medium">Sin datos de sensores grabados.</p>
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

            {/* Side Widget */}
            <div className="lg:col-span-1">
              {activeTab === 'gyro' ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Estabilidad Motriz</h4>
                    <div className="h-32 w-full flex items-center justify-center">
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
                      <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-600 pl-3 shrink-0">
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Calma ({calmValue}%)</div>
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Crisis ({ticValue}%)</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'heartRate' ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Zonas Autonómicas</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-rose-600 mb-1">
                          <span>ESTRÉS (&gt;115 bpm)</span>
                          <span>{metrics.avgHeartRate > 110 ? '30%' : '10%'}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: metrics.avgHeartRate > 110 ? '30%' : '10%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-teal-600 mb-1">
                          <span>ADAPTATIVA (75-95)</span>
                          <span>{metrics.avgHeartRate > 110 ? '55%' : '80%'}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500" style={{ width: metrics.avgHeartRate > 110 ? '55%' : '80%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-indigo-600 mb-1">
                          <span>REPOSO (&lt;75 bpm)</span>
                          <span>{metrics.avgHeartRate > 110 ? '15%' : '10%'}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: metrics.avgHeartRate > 110 ? '15%' : '10%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between">
                  <div className="flex flex-col items-center justify-center my-6">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="38" className="stroke-slate-100" strokeWidth="7" fill="transparent" />
                        <circle cx="48" cy="48" r="38" className="stroke-teal-600" strokeWidth="7" fill="transparent" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 - (metrics.comfortIndex / 100) * (2 * Math.PI * 38)} strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-lg font-black text-slate-800">{metrics.comfortIndex}%</span>
                    </div>
                    <span className="text-[10px] bg-teal-50 border border-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full mt-3">
                      Confort Afectivo
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Spikes Timeline */}
          {filteredSpikes.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">Eventos Registrados</h3>
              <div className="relative border-l border-slate-100 pl-5 space-y-3">
                {filteredSpikes.map(spike => (
                  <div key={spike.id} className="relative flex items-start gap-3">
                    <span className="absolute -left-[27px] bg-white p-0.5 rounded-full border border-slate-100">
                      <span className={`h-2 w-2 rounded-full block ${
                        spike.severity === 'critical' ? 'bg-rose-500' : spike.severity === 'warning' ? 'bg-amber-400' : 'bg-indigo-500'
                      }`}></span>
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                          [{spike.timestamp}]
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          spike.severity === 'critical' ? 'text-rose-600' : spike.severity === 'warning' ? 'text-amber-600' : 'text-indigo-600'
                        }`}>
                          {spike.severity === 'critical' ? 'Crítico' : 'Alerta'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
                        {spike.alertText} <span className="font-bold text-slate-800">Valor: {spike.value}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {session.notes && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notas Clínicas</h4>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{session.notes}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
