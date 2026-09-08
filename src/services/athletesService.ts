/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';
import { logger } from '../utils/logger';

export interface AthleteData {
  id?: number;
  full_name: string;
  birth_date: string;
  marital_status: string;
  gender: string;
  position?: string;
  document: string;
  address: string;
  number: string;
  neighborhood: string;
  zip_code: string;
  state: string;
  city: string;
  mobile_phone: string;
  secondary_phone: string;
  email: string;
  mother_name: string;
  father_name: string;
  owner_id: number;
  photo_path?: string | File | null;
  observations?: string;
}

type GetAthletesResponse = {
  athletes: AthleteData[];
  meta: any;
  links: any;
  success: boolean;
};

export async function createAthlete(data: AthleteData) {
  try {
    const payload = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'photo_path') {
        if (value instanceof File) {
          payload.append('photo_path', value);
        }
        return;
      }

      if (value !== null && value !== undefined) {
        payload.append(key, String(value));
      }
    });

    const response = await api.post('/athletes', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    logger.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar atleta:', error);
    if (error.response?.status === 422) {
      throw {
        status: 422,
        message: error.response.data.message || 'Dados inválidos',
        errors: error.response.data.errors || {},
      };
    }
    throw { status: error.response?.status || 500, message: 'Erro interno no servidor' };
  }
}

export async function getAthletes(params = {}): Promise<GetAthletesResponse> {
  try {
    const response = await api.get('/athletes', { params });
    const resData = response.data;

    return {
      athletes: Array.isArray(resData) ? resData : resData?.data || [],
      meta: resData?.meta,
      links: resData?.links,
      success: resData?.success ?? true,
    };
  } catch (error: any) {
    console.error(
      'Erro ao buscar atletas:',
      error.response?.data || error.message,
    );

    throw {
      message: error.response?.data?.message || 'Erro ao buscar atletas',
      status: error.response?.status,
      errors: error.response?.data?.errors || null,
    };
  }
}

export async function getAthleteById(id: number) {
  try {
    const response = await api.get(`/athletes/${id}`);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Erro ao buscar atleta por ID:', error);
    throw error;
  }
}

export async function getAthletesByName(name: string) {
  try {
    const response = await api.get(`/athletes`, { params: { search: name } });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar atletas por nome:', error);
    throw error;
  }
}

export async function updateAthlete(id: number, data: AthleteData) {
  try {
    const payload = new FormData();

    payload.append('_method', 'PUT');

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'photo_path') {
        if (value instanceof File) {
          payload.append('photo_path', value);
        }
        return;
      }

      if (value !== null && value !== undefined) {
        payload.append(key, String(value));
      }
    });

    const response = await api.post(`/athletes/${id}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao atualizar atleta:', error);
    if (error.response?.status === 422) {
      throw {
        status: 422,
        message: error.response.data.message || 'Dados inválidos',
        errors: error.response.data.errors || {},
      };
    }
    throw { status: error.response?.status || 500, message: 'Erro interno no servidor' };
  }
}

export async function deleteAthlete(id: number) {
  try {
    const response = await api.delete(`/athletes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar atleta:', error);
    throw error;
  }
}
