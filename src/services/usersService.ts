import api from './api';

export interface UserData {
  id?: number;
  name: string;
  email: string;
  is_admin?: boolean;
  password?: string;
  enterprise_id?: number | null;
  created_at?: string;
}

export async function getUsers(page = 1, params: any = {}): Promise<{ data: UserData[], last_page: number, total: number }> {
  try {
    const response = await api.get('/users', { params: { page, ...params } });
    if (response.data && response.data.data) {
        return response.data;
    }
    // Handle case where 'all' is passed
    if (Array.isArray(response.data) || (response.data && response.data.data && Array.isArray(response.data.data))) {
        // Some backends wrap with 'data'
        const dataArray = Array.isArray(response.data) ? response.data : response.data.data;
        return { data: dataArray, last_page: 1, total: dataArray.length };
    }
    return { data: [], last_page: 1, total: 0 };
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
}

export async function getUserById(id: number | string): Promise<UserData> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
}

export async function createUser(data: UserData): Promise<UserData> {
  try {
    const response = await api.post('/users', data);
    return response.data.user;
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function updateUser(id: number, data: Partial<UserData>): Promise<UserData> {
  try {
    const response = await api.put(`/users/${id}`, data);
    return response.data.user;
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

export async function deleteUser(id: number): Promise<void> {
  try {
    await api.delete(`/users/${id}`);
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  }
}
