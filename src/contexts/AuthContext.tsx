import { createContext, useEffect, useState } from 'react';
import api from '../services/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react-refresh/only-export-components
export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  /**
   * Carrega tokens salvos ao iniciar o app
   */
  useEffect(() => {
    const storedAccess = localStorage.getItem('access_token');
    const storedRefresh = localStorage.getItem('refresh_token');

    if (storedAccess) {
      setAccessToken(storedAccess);
      api.defaults.headers.Authorization = `Bearer ${storedAccess}`;
    }

    if (storedRefresh) {
      setRefreshToken(storedRefresh);
    }
  }, []);

  /**
   * Login — salva tokens e configura Axios
   */
  function login(access: string, refresh: string) {
    setAccessToken(access);
    setRefreshToken(refresh);

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    api.defaults.headers.Authorization = `Bearer ${access}`;
  }

  /**
   * Logout — remove tudo
   */
  function logout() {
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    api.defaults.headers.Authorization = '';

    window.location.href = '/';
  }

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
        login,
        logout,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
