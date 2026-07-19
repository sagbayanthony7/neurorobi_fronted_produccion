import React from 'react';
import { usePatients } from '../../context/PatientContext';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import { 
  UserCheck,
  Menu,
  Shield
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { activePatient } = usePatients();
  const { activeRole } = useRole();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

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

        {isAdmin ? (
          <div className="flex items-center gap-2 bg-amber-50/60 border border-amber-100 px-2.5 md:px-3 py-1.5 rounded-full shadow-sm">
            <Shield size={14} className="text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">
              Panel de Administración
            </span>
          </div>
        ) : activePatient ? (
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

      {/* RIGHT: Active Specialty Badge */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
            {isAdmin ? 'Rol:' : 'Especialidad:'}
          </span>
          <div className="bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl shadow-xs">
            {activeRole}
          </div>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 md:px-2.5 py-1.5 rounded-xl shadow-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider hidden sm:inline">ESP32: ON</span>
          </div>
        )}
      </div>

    </header>
  );
};
