import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:80/api', //URL da API
  timeout: 5000,
});

export default api;
