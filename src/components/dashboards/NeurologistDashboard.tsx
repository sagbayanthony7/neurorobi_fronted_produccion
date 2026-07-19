import React from 'react';
import { Brain, Activity, AlertTriangle } from 'lucide-react';

interface NeurologistDashboardProps {
  currentHeartRate: number;
  avgHeartRate: number;
  stereotypicalTicks: number;
  secondsElapsed: number;
}

export const NeurologistDashboard: React.FC<NeurologistDashboardProps> = ({
  currentHeartRate,
  avgHeartRate,
  stereotypicalTicks,
  secondsElapsed
}) => {
  // Simulate live HRV (SDNN) based on current heart rate fluctuations
  // Healthy HRV has higher variability (e.g. 50-80 ms), stress/agitation reduces variability (<35 ms)
  const isHeartRateSpiked = currentHeartRate > 115;
  const simulatedHRV = isHeartRateSpiked 
    ? Math.max(15, Math.round(25 + Math.sin(secondsElapsed) * 5)) // Low HRV under stress
    : Math.round(62 + Math.cos(secondsElapsed) * 12); // Normal healthy HRV

  let hrvStatus = 'Normal / Adaptativo';
  let hrvColor = 'text-indigo-600 bg-indigo-50 border-indigo-100';
  if (simulatedHRV < 30) {
    hrvStatus = 'Bajo / Activación Simpática Alta (Estrés)';
    hrvColor = 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse';
  } else if (simulatedHRV < 50) {
    hrvStatus = 'Moderado / Transición de Estrés';
    hrvColor = 'text-amber-600 bg-amber-50 border-amber-100';
  }

  // Calculate ticks per minute rate
  const minutes = Math.max(1, secondsElapsed) / 60;
  const tickRatePerMinute = (stereotypicalTicks / minutes).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Widget A: Stereotypical Motion Frequency Counter */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patrones de Movimiento Estereotipado</h4>
            <span className="text-indigo-500"><Brain size={16} /></span>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
            {/* Digital Ticker Counter */}
            <div className="h-16 w-16 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shadow-inner">
              <span className="text-3xl font-mono font-black text-indigo-400 tracking-wider">
                {String(stereotypicalTicks).padStart(2, '0')}
              </span>
            </div>
            
            <div className="flex-1">
              <h5 className="text-xs font-bold text-slate-700 uppercase">Frecuencia Total</h5>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase">Tics repetitivos identificados</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  {tickRatePerMinute} / min
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-medium leading-normal">
            * Se activa automáticamente un contador cada vez que el giroscopio 3D del peluche registra variaciones angulares bruscas (&gt;130°/s) que indican agitación o aleteo repetitivo.
          </p>
        </div>

        {stereotypicalTicks > 5 && (
          <div className="mt-4 p-2 bg-rose-50 border border-rose-100/60 rounded-xl flex items-center gap-2 text-rose-700 text-[10px] font-bold">
            <AlertTriangle size={12} className="shrink-0 animate-bounce" /> Agitación estereotipada sobre el límite clínico sugerido.
          </div>
        )}
      </div>

      {/* Widget B: Autonomic HRV Tracker */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Variabilidad Cardíaca (HRV)</h4>
            <span className="text-indigo-500"><Activity size={16} /></span>
          </div>

          {/* HRV status metrics */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pulso Instantáneo</span>
              <span className="text-2xl font-black text-slate-800">{currentHeartRate} <span className="text-xs text-slate-400">lpm</span></span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SDNN (Live HRV)</span>
              <span className="text-2xl font-black text-indigo-600">{simulatedHRV} <span className="text-xs text-indigo-400">ms</span></span>
            </div>
          </div>

          {/* Dynamic dial represent */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Tono Autonómico Regulación</span>
            
            <div className={`px-3 py-1 rounded-full border text-[10px] font-bold ${hrvColor}`}>
              {hrvStatus}
            </div>

            <div className="w-full grid grid-cols-3 gap-1 mt-4 text-[9px] font-bold text-center text-slate-400">
              <span className="text-rose-500">Estresado</span>
              <span className="text-amber-500">Moderado</span>
              <span className="text-indigo-500">Regulado</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>Pulso Promedio de Sesión:</span>
          <span className="font-bold text-slate-700">{avgHeartRate} lpm</span>
        </div>
      </div>

    </div>
  );
};
