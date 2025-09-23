// src/hooks/useAuth.ts
'use client'; // This is important for client-side hooks

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

// Types (Keep these types here or in a separate types file)
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    userType: string;
    isMainConsultant: boolean;
    kpiGroupId: number;
    employmentDate: string;
    status: string;
    programType: string;
  };
}

interface LoginError {
  message: string;
  status?: number;
}

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, LoginError, LoginCredentials>({
    mutationFn: async ({ email, password }) => {
      return await authService.login(email, password);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['protected-data'] });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

// Main authentication hook
export const useAuth = () => {
  const [isClient, setIsClient] = useState(false);
  const loginMutation = useLoginMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await loginMutation.mutateAsync(credentials);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    queryClient.clear();
  };

  const isAuthenticated = () => {
    if (!isClient || typeof window === 'undefined') {
      return false;
    }
    return !!localStorage.getItem('accessToken');
  };

  return {
    login,
    logout,
    isAuthenticated,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    isError: loginMutation.isError,
    isSuccess: loginMutation.isSuccess,
    reset: loginMutation.reset,
  };
};

export const useUser = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<LoginResponse['user']>(['user']);
};
