import axios from 'axios';

// Create base Axios instance pointing to backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get current user role from localStorage (default to 'admin')
const getUserRole = () => {
  return localStorage.getItem('userRole') || 'admin';
};

// Add request interceptor to include user role header
api.interceptors.request.use((config) => {
  const userRole = getUserRole();
  config.headers['x-user-role'] = userRole;
  return config;
});

// Blueprint API functions

/**
 * Get all blueprints
 * @returns {Promise} Response with blueprints array
 */
export const getBlueprints = async () => {
  try {
    const response = await api.get('/blueprints');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get a single blueprint by ID
 * @param {string} blueprintId - ID of the blueprint to retrieve
 * @returns {Promise} Response with blueprint data
 */
export const getBlueprintById = async (blueprintId) => {
  try {
    const response = await api.get(`/blueprints/${blueprintId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create a new blueprint
 * @param {Object} blueprintData - Blueprint data with name and fields
 * @param {string} blueprintData.name - Blueprint name
 * @param {Array} blueprintData.fields - Array of field objects
 * @returns {Promise} Response with created blueprint
 */
export const createBlueprint = async (blueprintData) => {
  try {
    const response = await api.post('/blueprints', blueprintData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update an existing blueprint
 * @param {string} blueprintId - ID of the blueprint to update
 * @param {Object} blueprintData - Blueprint data with name and fields
 * @param {string} blueprintData.name - Blueprint name
 * @param {Array} blueprintData.fields - Array of field objects
 * @returns {Promise} Response with updated blueprint
 */
export const updateBlueprint = async (blueprintId, blueprintData) => {
  try {
    const response = await api.put(`/blueprints/${blueprintId}`, blueprintData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a blueprint by ID
 * @param {string} blueprintId - ID of the blueprint to delete
 * @returns {Promise} Response with deletion confirmation
 */
export const deleteBlueprint = async (blueprintId) => {
  try {
    const response = await api.delete(`/blueprints/${blueprintId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Contract API functions

/**
 * Get all contracts
 * @returns {Promise} Response with contracts array
 */
export const getContracts = async () => {
  try {
    const response = await api.get('/contracts');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create a new contract
 * @param {Object} contractData - Contract data
 * @param {string} contractData.blueprintId - ID of the blueprint to use
 * @param {Object} contractData.data - Field values (optional)
 * @returns {Promise} Response with created contract
 */
export const createContract = async (contractData) => {
  try {
    const response = await api.post('/contracts', contractData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update contract status
 * @param {string} contractId - ID of the contract to update
 * @param {string} status - New status (Created, Approved, Sent, Signed, Revoked)
 * @returns {Promise} Response with updated contract
 */
export const updateContractStatus = async (contractId, status) => {
  try {
    const response = await api.patch(`/contracts/${contractId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
