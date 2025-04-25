import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Session API methods
export const fetchSessions = () => api.get('/sessions');
export const fetchSessionById = (id) => api.get(`/sessions/${id}`);
export const createSession = (sessionData) => api.post('/sessions', sessionData);
export const updateSession = (id, sessionData) => api.put(`/sessions/${id}`, sessionData);
export const deleteSession = (id) => api.delete(`/sessions/${id}`);
export const fetchSessionsByBatch = (batchId) => api.get(`/sessions/batch/${batchId}`);

// Batch API methods
export const fetchBatches = () => api.get('/batches');
export const fetchBatchById = (id) => api.get(`/batches/${id}`);
export const createBatch = (batchData) => api.post('/batches', batchData);
export const updateBatch = (id, batchData) => api.put(`/batches/${id}`, batchData);
export const deleteBatch = (id) => api.delete(`/batches/${id}`);

export default api;