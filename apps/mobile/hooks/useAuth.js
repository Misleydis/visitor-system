import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Custom hook for authentication
 * Provides login, logout, register, and user state
 */
export const useAuth = () => {
  return useAuthContext();
};
