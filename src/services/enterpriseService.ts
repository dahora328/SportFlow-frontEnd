/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export interface EnterpriseData {
  id?: number;
}

type GetEnterpriseResponse = {
  enterprise: EnterpriseData[];
  meta: any;
  links: any;
  success: boolean;
};

export async function getEnterprises(
  params = {},
): Promise<GetEnterpriseResponse> {
  try {
    const response = await api.get('/enterprises', { params });

    return {
      enterprise: response.data.data,
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
