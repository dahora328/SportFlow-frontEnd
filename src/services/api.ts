// src/services/api.ts
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.local.VITE_API_URL || 'http://localhost:8080/api/',
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
      window.dispatchEvent(new Event('auth:logout'));
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
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      // --- Caminho 1: é a primeira requisição a detectar o token expirado ---
      // Ela assume a responsabilidade de fazer o refresh.
      if (!isRefreshing) {
        isRefreshing = true;
        console.log('🔄 Atualizando token...');

        return new Promise((resolve, reject) => {
          api
            .post('/refresh', { refresh_token: refreshToken })
            .then(refreshResponse => {
              const newAccess = refreshResponse.data.access_token;
              const newRefresh = refreshResponse.data.refresh_token;

              console.log('✅ Novo access token:', newAccess);

              // Salvar novos tokens
              localStorage.setItem('access_token', newAccess);
              if (newRefresh) {
                localStorage.setItem('refresh_token', newRefresh);
              }

              // Atualizar axios padrão
              api.defaults.headers.Authorization = `Bearer ${newAccess}`;

              // Resolver a fila de requisições que estavam esperando
              failedRequestsQueue.forEach(req => req.resolve(newAccess));
              failedRequestsQueue = [];

              // Refazer a própria requisição original que iniciou o refresh
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
              }
              resolve(api(originalRequest));
            })
            .catch(err => {
              console.error('❌ Erro no refresh:', err);
              failedRequestsQueue.forEach(req => req.reject(err as AxiosError));
              failedRequestsQueue = [];
              localStorage.clear();
              window.dispatchEvent(new Event('auth:logout'));
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }

      // --- Caminho 2: refresh já está em andamento por outra requisição ---
      // Esta requisição entra na fila e aguarda o resultado.
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
    }

    return Promise.reject(error);
  },
);

export default api;
