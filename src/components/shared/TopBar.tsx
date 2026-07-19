import React from 'react';
import { usePatients } from '../../context/PatientContext';
import { useRole } from '../../context/RoleContext';
import type { SpecialistRole } from '../../types';
import { 
  Heart, 
  Brain, 
  Sparkles, 
  UserCheck,
  ChevronDown,
  Menu
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { activePatient } = usePatients();
  const { activeRole, setActiveRole, isRoleSelectorEnabled } = useRole();

  const roles: { value: SpecialistRole; label: string; icon: any; color: string }[] = [
    { 
      value: 'PSICOLOGIA_CLINICA', 
      label: 'Psicología Clínica', 
      icon: Heart, 
      color: 'text-rose-500 bg-rose-50 border-rose-100 hover:bg-rose-100/50' 
    },
    { 
      value: 'EDUCACION_ESPECIAL', 
      label: 'Educación Especial', 
      icon: Brain, 
      color: 'text-indigo-500 bg-indigo-50 border-indigo-100 hover:bg-indigo-100/50' 
    },
    { 
      value: 'FISIOTERAPIA', 
      label: 'Fisioterapia', 
      icon: Sparkles, 
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50' 
    }
  ];

  const currentRoleConfig = roles.find(r => r.value === activeRole) || roles[0];
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <header className="h-14 lg:h-16 bg-white border-b border-slate-100 px-3 sm:px-4 md:px-8 flex items-center justify-between shrink-0 overflow-x-auto">
      
      {/* LEFT: Context Active Patient Indicator + Hamburger Menu for Mobile */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-100 transition-all cursor-pointer shrink-0"
          aria-label="Menu"
        >
          <Menu size={18} />
        </button>

        {activePatient ? (
          <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 px-2.5 md:px-3 py-1.5 rounded-full shadow-sm min-w-0">
            <UserCheck size={14} className="text-emerald-600 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-slate-700 hidden sm:inline shrink-0">
              Contexto Activo:
            </span>
            <span className="text-xs font-semibold text-emerald-800 truncate">
              {activePatient.name}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full hidden md:inline truncate">
              {activePatient.diagnosis}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-2.5 md:px-3 py-1.5 rounded-full min-w-0">
            <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0"></span>
            <span className="text-xs font-bold text-slate-500 truncate">
              Modo Consulta Directa
            </span>
          </div>
        )}
      </div>

      {/* RIGHT: Specialist Role Selector Segmented Controller */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0 min-w-0">
        {/* Role Selector Badge with Select dropdown styled nicely */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
            Especialidad Activa:
          </span>
          <div className="relative group/role">
            {isRoleSelectorEnabled ? (
              <>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value as SpecialistRole)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-100 text-xs font-bold text-slate-700 pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-sm transition-all max-w-[160px] sm:max-w-none"
                >
                  <option value="PSICOLOGIA_CLINICA">Psicología Clínica</option>
                  <option value="EDUCACION_ESPECIAL">Educación Especial</option>
                  <option value="FISIOTERAPIA">Fisioterapia</option>
                </select>
                {/* Right arrow decoration for dropdown */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={12} />
                </div>
              </>
            ) : (
              <div className="bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 pl-9 pr-3.5 py-2 rounded-xl shadow-xs">
                {currentRoleConfig.label}
              </div>
            )}
            
            {/* Left custom icon based on active role */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <CurrentIcon size={14} className={currentRoleConfig.color.split(' ')[0]} />
            </div>
          </div>
        </div>

        {/* Device Sync LED Badge */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 md:px-2.5 py-1.5 rounded-xl shadow-xs">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          <span className="text-[10px] font-bold text-slate-500 tracking-wider hidden sm:inline">ESP32: ON</span>
        </div>

      </div>

    </header>
  );
};
