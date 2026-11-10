import api from './api';
import { logger } from '../utils/logger';

export interface CepAddress {
  address: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Busca o endereço de um CEP no backend (que usa ViaCEP com fallback BrasilAPI).
 *
 * Retorna os dados normalizados, ou `null` quando o CEP não existe ou o serviço
 * está indisponível — nos dois casos o usuário preenche o endereço na mão, então
 * a falha nunca propaga nem bloqueia o cadastro.
 */
export async function buscarCep(cep: string): Promise<CepAddress | null> {
  const digits = String(cep ?? '').replace(/\D/g, '');

  if (digits.length !== 8) {
    return null;
  }

  try {
    const response = await api.get(`/cep/${digits}`);
    return (response.data?.data as CepAddress) ?? null;
  } catch (error) {
    logger.warn('Falha ao buscar CEP', error);
    return null;
  }
}
