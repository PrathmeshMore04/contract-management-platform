import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

const getUserRole = () => {
  return localStorage.getItem('userRole') || 'admin';
};

api.interceptors.request.use((config) => {
  const userRole = getUserRole();
  config.headers['x-user-role'] = userRole;
  return config;
});

export const getBlueprints = async () => {
  try {
    const response = await api.get('/blueprints');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getBlueprintById = async (blueprintId) => {
  try {
    const response = await api.get(`/blueprints/${blueprintId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createBlueprint = async (blueprintData) => {
  try {
    const response = await api.post('/blueprints', blueprintData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateBlueprint = async (blueprintId, blueprintData) => {
  try {
    const response = await api.put(`/blueprints/${blueprintId}`, blueprintData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteBlueprint = async (blueprintId) => {
  try {
    const response = await api.delete(`/blueprints/${blueprintId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getContracts = async () => {
  try {
    const response = await api.get('/contracts');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createContract = async (contractData) => {
  try {
    const response = await api.post('/contracts', contractData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateContractStatus = async (contractId, status) => {
  try {
    const response = await api.patch(`/contracts/${contractId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
