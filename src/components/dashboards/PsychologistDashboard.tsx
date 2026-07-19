import React, { useState } from 'react';
import { Heart, Plus, Tag } from 'lucide-react';

interface PsychologistDashboardProps {
  currentHugForce: number;
  avgHugForce: number;
  onAddTrigger: (trigger: string) => void;
  triggers: string[];
}

export const PsychologistDashboard: React.FC<PsychologistDashboardProps> = ({
  currentHugForce,
  avgHugForce,
  onAddTrigger,
  triggers
}) => {
  const [newTrigger, setNewTrigger] = useState('');

  // Calculate emotional comfort state based on hug force
  let comfortStatus = 'Estable';
  let comfortColor = 'text-teal-600 bg-teal-50 border-teal-100';
  
  if (currentHugForce > 80) {
    comfortStatus = 'Abrazo de Descarga Co-regulación';
    comfortColor = 'text-rose-600 bg-rose-50 border-rose-100';
  } else if (currentHugForce > 50) {
    comfortStatus = 'Buscando Confort/Afecto';
    comfortColor = 'text-amber-600 bg-amber-50 border-amber-100';
  } else if (currentHugForce < 10) {
    comfortStatus = 'Desconexión/Retraimiento';
    comfortColor = 'text-slate-500 bg-slate-50 border-slate-100';
  }

  // Agitation Score derived from sensor changes
  const agitationPercentage = Math.min(100, Math.max(10, Math.round((currentHugForce * 0.4) + (Math.random() * 20))));

  const handleAddTriggerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.trim()) return;
    onAddTrigger(newTrigger.trim());
    setNewTrigger('');
  };

  // Radial progress calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentHugForce / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Widget A: Hug Intensity Circular Gauge & Agitation Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Afecto y Co-regulación</h4>
          <span className="text-rose-500"><Heart size={16} fill="currentColor" /></span>
        </div>

        {/* Circular Gauge */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-rose-500 transition-all duration-300 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800">{currentHugForce}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Fuerza Abrazo</span>
            </div>
          </div>

          <div className={`mt-4 px-3 py-1 rounded-full border text-[10px] font-bold ${comfortColor}`}>
            Status: {comfortStatus}
          </div>
        </div>

        {/* Agitation bar */}
        <div className="mt-4 pt-4 border-t border-slate-50">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Índice de Agitación Emocional</span>
            <span className="text-xs font-bold text-slate-700">{agitationPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                agitationPercentage > 75 
                  ? 'bg-rose-500' 
                  : agitationPercentage > 45 
                  ? 'bg-amber-400' 
                  : 'bg-teal-500'
              }`}
              style={{ width: `${agitationPercentage}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Widget B: In-Session Behavioral Triggers Log */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Triggers Conductuales Activos</h4>
            <span className="text-xs font-bold text-slate-400">Total: {triggers.length}</span>
          </div>

          {/* Trigger Form */}
          <form onSubmit={handleAddTriggerSubmit} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Ej. Evita contacto visual directo..."
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-400 transition-all font-medium"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center transition-all"
            >
              <Plus size={14} />
            </button>
          </form>

          {/* Trigger list */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {triggers.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl">
                <p className="text-[11px] text-slate-400 font-medium">No se han registrado detonantes en esta sesión.</p>
              </div>
            ) : (
              triggers.map((trig, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                  <Tag size={12} className="text-rose-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-700 font-medium leading-tight">{trig}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Avg statistic quick show */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>Abrazo Promedio de Sesión:</span>
          <span className="font-bold text-slate-700">{avgHugForce}%</span>
        </div>
      </div>

    </div>
  );
};
