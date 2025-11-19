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
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
}

export async function createUser(data: UserData) {
  try {
    const response = await api.post('/user', data);
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
