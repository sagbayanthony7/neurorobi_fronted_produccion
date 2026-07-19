import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface RoleContextType {
  activeRole: string;
  setActiveRole: (role: string) => void;
  isRoleSelectorEnabled: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRole, user, isAuthenticated } = useAuth();
  
  const [activeRole, setActiveRoleState] = useState<string>(user?.specialty?.name || 'Sin especialidad');
  const isRoleSelectorEnabled = userRole === 'ADMIN';

  useEffect(() => {
    if (!isAuthenticated || !userRole) {
      setActiveRoleState('Sin especialidad');
      return;
    }

    if (userRole === 'ADMIN') {
      const saved = localStorage.getItem('neurorobi_admin_active_role');
      setActiveRoleState(saved || 'Administrador');
    } else {
      setActiveRoleState(user?.specialty?.name || 'Sin especialidad');
    }
  }, [userRole, isAuthenticated, user]);

  const setActiveRole = (role: string) => {
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
