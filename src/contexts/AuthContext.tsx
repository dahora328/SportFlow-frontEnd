import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/** Papéis possíveis no sistema */
export type UserRole = 'superadmin' | 'gestor' | 'funcionario';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  enterprise_id: number | null;
}

/**
 * Deriva o papel do usuário a partir dos campos is_admin e enterprise_id.
 * - superadmin: is_admin=true e sem empresa (dono do SportFlow)
 * - gestor:     is_admin=true com empresa (dono/gestor da empresa cliente)
 * - funcionario: is_admin=false com empresa (equipe da empresa)
 */
export function getUserRole(user: AuthUser | null): UserRole {
  if (!user) return 'funcionario';
  if (user.is_admin && user.enterprise_id === null) return 'superadmin';
  if (user.is_admin && user.enterprise_id !== null) return 'gestor';
  return 'funcionario';
}

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  /**
   * Carrega tokens e dados do usuário salvos ao iniciar o app
   */
  useEffect(() => {
    const storedAccess = localStorage.getItem('access_token');
    const storedRefresh = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedAccess) {
      setAccessToken(storedAccess);
      api.defaults.headers.Authorization = `Bearer ${storedAccess}`;
    }

    if (storedRefresh) {
      setRefreshToken(storedRefresh);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  /**
   * Login — salva tokens, configura Axios e busca dados do usuário logado
   */
  async function login(access: string, refresh: string) {
    setAccessToken(access);
    setRefreshToken(refresh);

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    api.defaults.headers.Authorization = `Bearer ${access}`;

    // Busca os dados do usuário (is_admin, enterprise_id, etc.)
    try {
      const response = await api.get('/user');
      const userData: AuthUser = response.data;
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch {
      // Se falhar ao buscar o usuário, o login ainda funciona — dados virão depois
      console.warn('Não foi possível buscar dados do usuário após login.');
    }
  }

  /**
   * Logout — remove tudo
   */
  function logout() {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');

    api.defaults.headers.Authorization = '';

    navigate('/');
  }

  /**
   * Escuta o evento 'auth:logout' disparado pelo Axios (api.ts)
   * quando o refresh token falha — navega sem recarregar a página
   */
  useEffect(() => {
    const handleForceLogout = () => {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      api.defaults.headers.Authorization = '';
      navigate('/');
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [navigate]);

  /**
   * Quando accessToken mudar, sempre atualizar Axios
   */
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
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
