import apiClient from '@/lib/axios.lib';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data.data;
      return { accessToken, refreshToken, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
};
