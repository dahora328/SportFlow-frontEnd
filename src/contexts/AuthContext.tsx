import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
    // Ao iniciar o app, verifica se já existe token no localStorage
    const storedToken = localStorage.getItem('access_token');
    
    if (storedToken) {
      setAccessToken(storedToken);
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      // Busca os dados do usuário para garantir que o token ainda é válido
      fetchUserData(storedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Listener para o evento customizado de logout disparado pelo interceptor do Axios
    const handleLogout = () => {
      setAccessToken(null);
      setUser(null);
      api.defaults.headers.Authorization = '';
      localStorage.removeItem('auth_user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/');
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string): Promise<AuthUser | null> {
    // Chama a API do Laravel em vez do Supabase
    const response = await api.post('/login', { email, password });
    
    if (response.data && response.data.access_token) {
      const { access_token, refresh_token } = response.data;
      
      // Salva os tokens no localStorage (necessário para o api.ts interceptor)
      localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }
      
      setAccessToken(access_token);
      return await fetchUserData(access_token);
    }
    
    return null;
  }

  async function logout() {
    try {
      // Opcional: bate na rota de logout da API para invalidar o token
      if (accessToken) {
        await api.post('/logout');
      }
    } catch (error) {
      console.error('Erro ao fazer logout na API', error);
    } finally {
      // Limpa os dados locais
      setAccessToken(null);
      setUser(null);
      api.defaults.headers.Authorization = '';
      localStorage.removeItem('auth_user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/');
    }
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
};;
