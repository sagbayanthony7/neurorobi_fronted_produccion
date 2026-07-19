import React from 'react';
import { Sparkles, AlertCircle, Fingerprint } from 'lucide-react';

interface OccupationalDashboardProps {
  currentHugForce: number;
  maxGripForce: number;
  bilateralTouchSync: number;
  fatigueCheckmarks: Record<string, boolean>;
  onToggleFatigueCheckmark: (key: string) => void;
}

export const OccupationalDashboard: React.FC<OccupationalDashboardProps> = ({
  currentHugForce,
  maxGripForce,
  bilateralTouchSync,
  fatigueCheckmarks,
  onToggleFatigueCheckmark
}) => {

  const fatigueItems = [
    { key: 'forceLoss', label: 'Pérdida súbita de fuerza de agarre' },
    { key: 'tremors', label: 'Temblores leves detectados en extremidades' },
    { key: 'slowCoordination', label: 'Coordinación motora lenta o asincrónica' },
    { key: 'digitRigidity', label: 'Rigidez perceptible en falanges/dedos' }
  ];

  // Calculate fatigue score (0-100) based on checkboxes selected
  const activeCount = Object.values(fatigueCheckmarks).filter(Boolean).length;
  const calculatedFatigueScore = activeCount * 25;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Widget A: Grip Force & Bilateral Capacitive Sync */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Integración Motora e Interacción</h4>
            <span className="text-emerald-500"><Sparkles size={16} /></span>
          </div>

          {/* Grip Force indicator */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-3.5 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fuerza Actual</span>
              <span className="text-2xl font-black text-slate-800 mt-1">{currentHugForce} kg/cm²</span>
            </div>
            
            <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Pico Máximo</span>
              <span className="text-2xl font-black text-emerald-800 mt-1">{maxGripForce} kg/cm²</span>
            </div>
          </div>

          {/* Bilateral Touch Sync Slider/Scale */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Fingerprint size={14} className="text-emerald-600" />
                <span className="text-xs font-bold">Sincronía Capacitiva Bilateral</span>
              </div>
              <span className="text-xs font-bold text-emerald-700">{bilateralTouchSync}%</span>
            </div>

            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
              {/* Left hand indicator */}
              <div className="bg-slate-300 h-full flex-1 transition-all duration-300"></div>
              {/* Center overlapping sync index */}
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${bilateralTouchSync}%` }}
              ></div>
              {/* Right hand indicator */}
              <div className="bg-slate-300 h-full flex-1 transition-all duration-300"></div>
            </div>

            <p className="text-[10px] text-slate-400 font-semibold mt-2 text-center leading-normal">
              Mide la colocación coordinada y sincrónica de ambas manos en los sensores táctiles.
            </p>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-medium mt-4 pt-4 border-t border-slate-50 flex items-center gap-1">
          <AlertCircle size={10} className="text-emerald-500" /> Sensor capacitivo calibrado a 50Hz.
        </div>
      </div>

      {/* Widget B: Motor Fatigue Observation Checklist */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fatiga y Tono Muscular</h4>
            <span className="text-xs font-bold text-slate-400">Puntaje: {calculatedFatigueScore}/100</span>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            {fatigueItems.map(item => (
              <label 
                key={item.key} 
                className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!fatigueCheckmarks[item.key]}
                  onChange={() => onToggleFatigueCheckmark(item.key)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700 leading-tight">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Fatigue Index Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Índice de Fatiga Coordinativa</span>
            <span className="font-black text-slate-800">{calculatedFatigueScore}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                calculatedFatigueScore >= 75 
                  ? 'bg-rose-500' 
                  : calculatedFatigueScore >= 50 
                  ? 'bg-amber-400' 
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${calculatedFatigueScore}%` }}
            ></div>
          </div>
        </div>

      </div>

    </div>
  );
};
