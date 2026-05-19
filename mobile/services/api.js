import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.1.55:5000/api'; // change to your server IP

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});
export const registerUser = (name, email, password, role) => 
    api.post('/auth/register', { name, email, password, role });

export const login = (email, password) => api.post('/auth/login', { email, password });
export const registerVisitor = (data) => api.post('/visitors', data);
export const getVisitorByTicket = (ticketNumber) => api.get(`/visitors/ticket/${ticketNumber}`);
export const recordTimeOut = (id) => api.put(`/visitors/${id}/timeout`);
export const getTodayVisitors = () => api.get('/visitors/today');
export const getAllVisitors = () => api.get('/visitors');
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getPendingUsers = () => api.get('/users/pending');
export const approveUser = (id, role) => api.put(`/users/approve/${id}`, { role });


export default api;