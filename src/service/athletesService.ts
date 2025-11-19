import api from './api';

export interface AthleteData {
  full_name: string;
  birth_date: string;
  marital_status: string;
  gender: string;
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
}

export async function createAthlete(data: AthleteData) {
  try {
    const response = await api.post('/athletes', data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar atleta:', error);
    throw error;
  }
}

export async function getAthletes() {
  try {
    const response = await api.get('/athletes');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar atletas:', error);
    throw error;
  }
}

export async function getAthleteById(id: number) {
  try {
    const response = await api.get(`/athletes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar atleta por ID:', error);
    throw error;
  }
}

export async function updateAthlete(id: number, data: AthleteData) {
  try {
    const response = await api.put(`/athletes/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar atleta:', error);
    throw error;
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
