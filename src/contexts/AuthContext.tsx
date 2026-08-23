import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { supabase } from '../services/supabase';

export type UserRole = 'superadmin' | 'gestor' | 'funcionario';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  enterprise_id: number | null;
}

// eslint-disable-next-line react-refresh/only-export-components
export function getUserRole(user: AuthUser | null): UserRole {
  if (!user) return 'funcionario';
  if (user.is_admin && user.enterprise_id === null) return 'superadmin';
  if (user.is_admin && user.enterprise_id !== null) return 'gestor';
  return 'funcionario';
}

interface AuthContextType {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserData = async (token: string): Promise<AuthUser | null> => {
    try {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      const response = await api.get('/user');
      const userData: AuthUser = response.data;
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.warn('Não foi possível buscar dados adicionais do usuário.', error);
      return null;
    }
  };

  useEffect(() => {
    // Escuta as mudanças de estado de autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setAccessToken(session.access_token);
        // Só busca os dados se o usuário não estiver em state (evitar requests extras logo após o login manual)
        if (!user) {
          await fetchUserData(session.access_token);
        }
      } else {
        setAccessToken(null);
        setUser(null);
        api.defaults.headers.Authorization = '';
        localStorage.removeItem('auth_user');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    
    if (data.session) {
      setAccessToken(data.session.access_token);
      return await fetchUserData(data.session.access_token);
    }
    return null;
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  if (loading) {
    return <div className="h-screen flex justify-center items-center">Carregando...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        login,
        logout,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
