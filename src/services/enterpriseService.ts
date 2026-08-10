/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export interface EnterpriseData {
  id?: number;
  name?: string;
  social_reason?: string;
  fantasy_name?: string;
  document?: string;
  foundation_date?: string;
  IE?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  logo_path?: string;
  active?: boolean;
}

export async function getEnterprises(
  params: any = {},
): Promise<EnterpriseData[]> {
  try {
    const response = await api.get('/enterprises', { params });

    if (response.data && !Array.isArray(response.data) && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return response.data;
  } catch (error: any) {
    console.error(
      'Erro ao buscar empresas:',
      error.response?.data || error.message,
    );

    throw {
      message: error.response?.data?.message || 'Erro ao buscar empresas',
      status: error.response?.status,
      errors: error.response?.data?.errors || null,
    };
  }
}
