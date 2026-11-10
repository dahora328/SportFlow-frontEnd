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
    logger.error('Erro ao criar atleta:', error);
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

export async function getAthletes(
  params: Record<string, unknown> = {},
): Promise<GetAthletesResponse> {
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
    logger.error(
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

export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  skipped: number;
  errors: { line: number; errors: string[] }[];
}

/** Dispara o download de um Blob no navegador. */
function triggerDownload(blob: Blob, fallbackName: string, disposition?: string) {
  // Tenta extrair o nome do arquivo do header Content-Disposition.
  let fileName = fallbackName;
  if (disposition) {
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    if (match?.[1]) fileName = decodeURIComponent(match[1]);
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/** Exporta a lista de atletas (respeitando a busca atual) em .xlsx. */
export async function exportAthletes(search?: string): Promise<void> {
  try {
    const response = await api.get('/athletes/export', {
      params: search ? { search } : {},
      responseType: 'blob',
    });
    triggerDownload(
      response.data,
      'atletas.xlsx',
      response.headers?.['content-disposition'],
    );
  } catch (error: any) {
    logger.error('Erro ao exportar atletas:', error);
    throw {
      status: error.response?.status || 500,
      message: 'Não foi possível exportar os atletas.',
    };
  }
}

/** Baixa o modelo (.xlsx) de importação. */
export async function downloadImportTemplate(): Promise<void> {
  try {
    const response = await api.get('/athletes/import/template', {
      responseType: 'blob',
    });
    triggerDownload(
      response.data,
      'modelo_importacao_atletas.xlsx',
      response.headers?.['content-disposition'],
    );
  } catch (error: any) {
    logger.error('Erro ao baixar o modelo de importação:', error);
    throw {
      status: error.response?.status || 500,
      message: 'Não foi possível baixar o modelo.',
    };
  }
}

/** Importa atletas a partir de um arquivo .csv ou .xlsx. */
export async function importAthletes(file: File): Promise<ImportResult> {
  try {
    const payload = new FormData();
    payload.append('file', file);

    const response = await api.post('/athletes/import', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as ImportResult;
  } catch (error: any) {
    logger.error('Erro ao importar atletas:', error);
    throw {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message || 'Não foi possível importar o arquivo.',
    };
  }
}

export async function getAthleteById(id: number) {
  try {
    const response = await api.get(`/athletes/${id}`);
    return response.data?.data ?? response.data;
  } catch (error) {
    logger.error('Erro ao buscar atleta por ID:', error);
    throw error;
  }
}

export async function getAthletesByName(name: string) {
  try {
    const response = await api.get(`/athletes`, { params: { search: name } });
    return response.data;
  } catch (error) {
    logger.error('Erro ao buscar atletas por nome:', error);
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
    logger.error('Erro ao atualizar atleta:', error);
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
    logger.error('Erro ao deletar atleta:', error);
    throw error;
  }
}
