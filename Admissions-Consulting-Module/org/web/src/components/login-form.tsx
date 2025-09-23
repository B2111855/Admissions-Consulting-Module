// src/components/LoginForm.tsx
'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isError, reset } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous errors
    reset();

    try {
      // Call the `login` function provided by `useAuth`
      const result = await login({ email, password });

      // If login is successful and we have tokens, save them to localStorage
      if (typeof window !== 'undefined' && result && result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
        console.log('Tokens saved to localStorage!');
      }

      console.log('Login successful!');
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed in component:', err);
    }
  };

  return (
    <div className={cn('space-y-6', className)} {...props}>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-white">Đăng nhập hệ thống</h1>
        <p className="text-white/80">
          Nhập email của bạn bên dưới để đăng nhập vào tài khoản của bạn
        </p>
      </div>

      {isError && error && (
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/30 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className="text-sm font-medium text-white"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <a
              href="#"
              className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              Quên mật khẩu?
            </a>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/30 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-2 text-white/60">
            Every Second Counts
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={isLoading}
        className="w-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-4 h-4"
        >
          <path
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            fill="currentColor"
          />
        </svg>
        Đăng nhập với GitHub
      </button>

      <div className="text-center text-sm">
        <span className="text-white/60">Chưa có tài khoản? </span>
        <a href="#" className="text-emerald-300 hover:text-emerald-200 transition-colors underline underline-offset-4">
          Đăng ký
        </a>
      </div>
    </div>
  );
}