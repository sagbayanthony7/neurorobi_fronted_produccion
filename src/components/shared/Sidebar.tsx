import React from 'react';
import { Logo } from '../brand/Logo';
import { usePatients } from '../../context/PatientContext';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import { imageUrl } from '../../utils/imageUrl';
import { 
  Users, 
  Activity, 
  FilePieChart, 
  Settings,
  LogOut,
  ClipboardList,
  X
} from 'lucide-react';
import { EditProfileForm } from '../forms/EditProfileForm';


interface SidebarProps {
  currentScreen: 'directory' | 'patients' | 'telemetry' | 'report';
  setScreen: (screen: 'directory' | 'patients' | 'telemetry' | 'report') => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, setScreen, isOpen = false, onClose }) => {
  const { activePatient, activeSession } = usePatients();
  const { activeRole } = useRole();
  const { logout, userName, user } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);

  const isSessionRunning = activeSession !== null && activePatient !== null && activeSession.durationSeconds === 0;
  const hasFinishedSessionPendingReport = activeSession !== null && activeSession.durationSeconds > 0;

  const getRoleDisplayName = (role: string) => {
    if (role === 'PSICOLOGIA_CLINICA') return 'Psicología Clínica';
    if (role === 'EDUCACION_ESPECIAL') return 'Educación Especial';
    if (role === 'FISIOTERAPIA') return 'Fisioterapia';
    if (role === 'ADMIN') return 'Administrador';
    return role;
  };

  const roleLabel = getRoleDisplayName(activeRole);

  // Render navigation item helper
  const renderNavItem = (
    screenId: 'directory' | 'patients' | 'telemetry' | 'report',
    label: string,
    IconComponent: React.ComponentType<any>,
    disabled: boolean,
    lockedReason?: string
  ) => {
    const isActive = currentScreen === screenId;
    
    let btnStyle = "flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ";
    if (disabled) {
      btnStyle += "text-slate-400 bg-transparent cursor-not-allowed opacity-50";
    } else if (isActive) {
      btnStyle += "bg-teal-50 text-teal-700 shadow-sm shadow-teal-50/50 border-l-4 border-teal-600";
    } else {
      btnStyle += "text-slate-600 hover:text-slate-900 hover:bg-slate-50";
    }

    const handleClick = () => {
      if (!disabled) {
        setScreen(screenId);
        if (onClose) onClose(); // Auto-close drawer on mobile
      }
    };

    return (
      <div className="relative group/nav mb-1.5" key={screenId}>
        <button
          onClick={handleClick}
          disabled={disabled}
          className={btnStyle}
        >
          <IconComponent size={18} className={isActive ? "text-teal-600" : "text-slate-500 group-hover/nav:text-slate-800"} />
          <span className="flex-1 text-left">{label}</span>
          
          {/* Live Indicator Dot for Telemetry */}
          {screenId === 'telemetry' && isSessionRunning && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}

          {/* Pending report dot */}
          {screenId === 'report' && hasFinishedSessionPendingReport && (
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}

          {/* Lock Icon */}
          {disabled && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase font-bold tracking-wider">
              Bloq.
            </span>
          )}
        </button>
        
        {disabled && lockedReason && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-48 p-2 bg-slate-800 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
            {lockedReason}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-64 bg-white border-r border-slate-100 flex flex-col h-screen shrink-0 transition-transform duration-300 overflow-y-auto ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Header Logo */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <Logo size={42} />
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Specialist Profile Summary — clickeable para editar */}
      <button
        onClick={() => setIsEditProfileOpen(true)}
        className="group mx-4 my-4 w-[calc(100%-2rem)] bg-slate-50/80 hover:bg-teal-50/60 rounded-2xl border border-slate-100/60 hover:border-teal-100 transition-all duration-200 cursor-pointer p-4 text-left"
        title="Editar mi perfil"
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {user?.profileImageUrl ? (
              <img 
                src={imageUrl(user.profileImageUrl)}
                alt={userName || 'Especialista'} 
                className="h-11 w-11 rounded-xl object-cover shadow-md border-2 border-white" 
              />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md uppercase">
                {roleLabel.substring(0, 2)}
              </div>
            )}
            {/* Badge de cámara que aparece en hover */}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow border border-white">
              <Settings size={10} className="text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-teal-700 transition-colors">
              {userName || 'Especialista Neurorobi'}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase truncate block">
              {roleLabel}
            </span>
            <span className="text-[10px] text-teal-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Editar perfil →
            </span>
          </div>
        </div>
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 block mb-3">
          Módulos Principales
        </span>
        
        {renderNavItem('directory', 'Inicio y Consultas', ClipboardList, false)}
        
        {renderNavItem('patients', 'Gestión de Pacientes', Users, false)}
        
        {renderNavItem(
          'telemetry', 
          'Telemetría en Vivo', 
          Activity, 
          false
        )}
        
        {renderNavItem(
          'report', 
          'Auditoría y Reporte', 
          FilePieChart, 
          false
        )}
      </nav>

      {/* Connected ESP32 Status Quick Widget */}
      {activePatient && (
        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${isSessionRunning ? 'bg-emerald-500 animate-live-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-xs font-bold text-slate-700">Canal: ESP32-Toy</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal truncate">
            Paciente: <span className="font-semibold text-slate-700">{activePatient.name}</span>
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-50 flex items-center justify-between gap-2">
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all text-xs font-bold cursor-pointer"
          title="Cerrar Sesión"
        >
          <LogOut size={14} />
          Salir
        </button>
        <span className="text-[10px] font-medium text-slate-300 tracking-wide">v1.2.0-IoT</span>
      </div>

      {isEditProfileOpen && (
        <EditProfileForm 
          onClose={() => setIsEditProfileOpen(false)} 
          onSuccess={() => setIsEditProfileOpen(false)} 
        />
      )}
    </aside>
  );
};
