import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'http://192.168.1.55:5000/api';  // CHANGE THIS

const api = axios.create({ baseURL: API_BASE });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['x-auth-token'] = token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
        
        processQueue(null, accessToken);
        
        originalRequest.headers['x-auth-token'] = accessToken;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Clear tokens on refresh failure
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        
        // Redirect to login (you might want to use navigation here)
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const registerUser = (name, email, password) => api.post('/auth/register', { name, email, password });
export const refreshToken = (refreshToken) => api.post('/auth/refresh', { refreshToken });
export const logout = (refreshToken) => api.post('/auth/logout', { refreshToken });
export const logoutAll = () => api.post('/auth/logout-all');

// Visitors
export const registerVisitor = (data) => api.post('/visitors', data);
export const getVisitorByTicket = (ticketNumber) => api.get(`/visitors/ticket/${ticketNumber}`);
export const recordTimeOut = (id) => api.put(`/visitors/${id}/timeout`);
export const cancelVisitor = (id) => api.put(`/visitors/${id}/cancel`);
export const editVisitor = (id, data) => api.put(`/visitors/${id}`, data);
export const getTodayVisitors = () => api.get('/visitors/today');
export const getAllVisitors = () => api.get('/visitors');
export const getReturningVisitors = () => api.get('/visitors/returning');
export const deleteVisitor = (id) => api.delete(`/visitors/${id}`);
export const getActivityLogs = () => api.get('/visitors/logs');

// Users (admin)
export const getUsers = () => api.get('/users');
export const getPendingUsers = () => api.get('/users/pending');
export const approveUser = (id, role) => api.put(`/users/approve/${id}`, { role });
export const createUser = (data) => api.post('/users', data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Occurrence Book
export const getNextEntryNumber = (site) => api.get(`/occurrence-book/next-entry/${site}`);
export const createOBEntry = (data) => api.post('/occurrence-book', data);
export const getMyOBEntries = (startDate, endDate) => api.get('/occurrence-book/my-entries', { params: { startDate, endDate } });
export const getAllOBEntries = (startDate, endDate, securityId, site) => api.get('/occurrence-book/all', { params: { startDate, endDate, securityId, site } });
export const signOffOBEntries = (data) => api.post('/occurrence-book/sign-off', data);
export const getSecurityGuards = () => api.get('/occurrence-book/security-guards');

export default api;