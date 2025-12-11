// src/services/api.ts
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

// Instância global
export const api = axios.create({
  baseURL: 'http://localhost:80/api/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Controle interno do refresh
let isRefreshing = false;
let failedRequestsQueue: {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}[] = [];

/**
 * Interceptor de requisição — adiciona Bearer Token automaticamente
 */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Interceptor de resposta — tenta refresh quando receber 401
 */
api.interceptors.response.use(
  response => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Se chegou 401 no refresh → desloga imediatamente
    if (originalRequest?.url?.includes('/refresh')) {
      console.warn('❌ Refresh falhou → logout');
      localStorage.clear();
      //window.location.href = '/';
      return Promise.reject(error);
    }

    // Se for token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      console.log('🔍 Refresh token:', refreshToken);

      if (!refreshToken) {
        console.warn('❌ Nenhum refresh_token encontrado → logout');
        localStorage.clear();
        //window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          console.log('🔄 Atualizando token...');

          const refreshResponse = await api.post('/refresh', {
            refresh_token: refreshToken,
          });

          const newAccess = refreshResponse.data.access_token;

          console.log('✅ Novo access token:', newAccess);

          // Salvar novo token
          localStorage.setItem('access_token', newAccess);

          // Atualizar axios padrão
          api.defaults.headers.Authorization = `Bearer ${newAccess}`;

          // Enviar respostas às requisições esperando
          failedRequestsQueue.forEach(req => req.resolve(newAccess));
          failedRequestsQueue = [];
        }

        // Aguarda novo token e refaz requisição original
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: token => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      } catch (err) {
        console.error('❌ Erro no refresh:', err);

        failedRequestsQueue.forEach(req => req.reject(err as AxiosError));
        failedRequestsQueue = [];

        localStorage.clear();
        //window.location.href = '/';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
