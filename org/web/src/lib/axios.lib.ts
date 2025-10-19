'use client';
import axios from 'axios';

// Prefer NEXT_PUBLIC_API_BASE_URL if provided. Otherwise, build from NEXT_PUBLIC_API_URL with /api
const resolvedBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;

const apiClient = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    // Ensure we always hit the API prefix if caller passed an absolute path without it
    if (config.url && config.url.startsWith('/') && !config.baseURL?.endsWith('/api') && !resolvedBaseUrl.endsWith('/api')) {
      // No-op: resolvedBaseUrl already includes /api; callers should use relative paths like /auth/login
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(
      `❌ Error from ${error.config?.url}:`,
      error.response?.status
    );

    if (error.response?.status === 401) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
