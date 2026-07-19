import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  token: string | null;
  user: { id: string; email: string; name: string; role: string; specialtyId?: string; specialty?: { id: string; name: string; color: string; icon: string }; profileImageUrl?: string } | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = `${import.meta.env.VITE_API_URL || 'https://neurorobibackendproduccion-production.up.railway.app'}/api/auth`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('neurorobi_auth_token');
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('neurorobi_auth') === 'true';
  });
  
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('neurorobi_user_email');
  });

  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem('neurorobi_user_id');
  });

  const [userName, setUserName] = useState<string | null>(() => {
    return localStorage.getItem('neurorobi_user_name');
  });

  const [userRole, setUserRole] = useState<string | null>(() => {
    return localStorage.getItem('neurorobi_user_role');
  });

  const [user, setUser] = useState<{ id: string; email: string; name: string; role: string; specialtyId?: string; specialty?: { id: string; name: string; color: string; icon: string }; profileImageUrl?: string } | null>(() => {
    const u = localStorage.getItem('neurorobi_user');
    if (u) {
      try {
        return JSON.parse(u);
      } catch {
        // ignore
      }
    }
    // Fallback for older sessions
    const id = localStorage.getItem('neurorobi_user_id');
    const email = localStorage.getItem('neurorobi_user_email');
    const name = localStorage.getItem('neurorobi_user_name');
    const role = localStorage.getItem('neurorobi_user_role');
    if (id && email && name && role) {
      return { id, email, name, role };
    }
    return null;
  });

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: email.trim(),
        password: pass
      });

      if (response.data && response.data.token) {
        const { token: userToken, user } = response.data as {
          token: string;
          user: { id: string; email: string; name: string; role: string };
        };

        setToken(userToken);
        setIsAuthenticated(true);
        setUserEmail(user.email);
        setUserId(user.id);
        setUserName(user.name);
        setUserRole(user.role);
        setUser(user);

        localStorage.setItem('neurorobi_auth_token', userToken);
        localStorage.setItem('neurorobi_auth', 'true');
        localStorage.setItem('neurorobi_user_email', user.email);
        localStorage.setItem('neurorobi_user_id', user.id);
        localStorage.setItem('neurorobi_user_name', user.name);
        localStorage.setItem('neurorobi_user_role', user.role);
        localStorage.setItem('neurorobi_user', JSON.stringify(user));

        return true;
      }
      return false;
    } catch (error) {
      console.error('[AuthContext login error]', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserId(null);
    setUserName(null);
    setUserRole(null);
    setUser(null);

    localStorage.removeItem('neurorobi_auth_token');
    localStorage.removeItem('neurorobi_auth');
    localStorage.removeItem('neurorobi_user_email');
    localStorage.removeItem('neurorobi_user_id');
    localStorage.removeItem('neurorobi_user_name');
    localStorage.removeItem('neurorobi_user_role');
    localStorage.removeItem('neurorobi_user');
  };

  const getToken = (): string | null => {
    return token;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        userId,
        userName,
        userRole,
        token,
        user,
        login,
        logout,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
