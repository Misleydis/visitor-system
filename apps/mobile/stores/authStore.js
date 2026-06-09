import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setRefreshToken: (token) => set({ refreshToken: token }),
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  setLoading: (status) => set({ loading: status }),

  loadTokens: async () => {
    try {
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedAccessToken && storedRefreshToken && storedUser) {
        set({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          loading: false
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
      set({ loading: false });
    }
  },

  clearTokens: async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  updateTokens: async (newAccessToken, newRefreshToken) => {
    try {
      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      set({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      console.error('Error updating tokens:', error);
    }
  }
}));

export default useAuthStore;
