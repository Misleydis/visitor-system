import io from 'socket.io-client';
import { API_BASE } from './api';

const SOCKET_URL = API_BASE.replace('/api', '');
let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL);
    console.log('🔌 Connecting socket to:', SOCKET_URL);
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket disconnected');
  }
};