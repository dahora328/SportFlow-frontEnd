import api from './api';

export interface UserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  user_id: number;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
}

export async function createUser(data: UserData) {
  try {
    const response = await api.post('/register', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  try {
    const response = await api.post('/login', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

export async function refresh(data: LoginData): Promise<LoginResponse> {
  try {
    const response = await api.post('/refresh', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    throw error;
  }
}

export function getUserIdFromToken(): number | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}

export async function getUserById(id: number) {
  try {
    const response = await api.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    throw error;
  }
}

export async function updateUser(id: number, data: UserData) {
  try {
    const response = await api.put(`/user/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

export async function deleteUser(id: number) {
  try {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    const response = await api.post('/logout');
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}
