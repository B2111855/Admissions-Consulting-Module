'use client';

import { LoginForm } from '@/components/login-form';
import { GalleryVerticalEnd } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* --- Cột bên trái: Form đăng nhập và nền động --- */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-teal-300/10 to-emerald-300/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '2s', transform: 'translate(-50%, -50%)' }}
        ></div>

        <div className="flex justify-center gap-2 md:justify-start relative z-10">
          <a
            href="#"
            className="flex items-center gap-2 font-medium text-white"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex size-6 items-center justify-center rounded-md shadow-lg">
              <GalleryVerticalEnd className="size-4" />
            </div>
            CUSC.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center relative z-10">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* --- Cột bên phải: Ảnh lấp đầy toàn bộ không gian --- */}
      <div className="relative hidden lg:block overflow-hidden">
        {/* Ảnh nền lấp đầy toàn bộ cột */}
        <img
          src="/cusc3.jpg"
          alt="Modern university building"
          className="absolute inset-0 h-full w-full object-cover "
        />
        

      </div>
    </div>
  );
}