import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SpecialistRole } from '../types';
import { useAuth } from './AuthContext';

interface RoleContextType {
  activeRole: SpecialistRole;
  setActiveRole: (role: SpecialistRole) => void;
  isRoleSelectorEnabled: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRole, isAuthenticated } = useAuth();
  
  // Set default active clinical role
  const [activeRole, setActiveRoleState] = useState<SpecialistRole>('PSICOLOGIA_CLINICA');

  // Determine if user can manually toggle roles (only if they are an ADMIN)
  const isRoleSelectorEnabled = userRole === 'ADMIN';

  // Synchronize active role with user's role upon login/logout or change
  useEffect(() => {
    if (!isAuthenticated || !userRole) {
      setActiveRoleState('PSICOLOGIA_CLINICA');
      return;
    }

    if (userRole === 'ADMIN') {
      // Admin can switch, so default to previously saved role or PSICOLOGIA_CLINICA
      const saved = localStorage.getItem('neurorobi_admin_active_role');
      if (saved && ['PSICOLOGIA_CLINICA', 'EDUCACION_ESPECIAL', 'FISIOTERAPIA'].includes(saved)) {
        setActiveRoleState(saved as SpecialistRole);
      } else {
        setActiveRoleState('PSICOLOGIA_CLINICA');
      }
    } else {
      // Regular user's active role is strictly bound to their profile role
      setActiveRoleState(userRole as SpecialistRole);
    }
  }, [userRole, isAuthenticated]);

  const setActiveRole = (role: SpecialistRole) => {
    // Only allow updating the role if the user is ADMIN
    if (userRole === 'ADMIN') {
      setActiveRoleState(role);
      localStorage.setItem('neurorobi_admin_active_role', role);
    }
  };

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole, isRoleSelectorEnabled }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
