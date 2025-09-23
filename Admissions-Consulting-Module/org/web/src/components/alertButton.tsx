// src/components/Notification.tsx
'use client';
import React, { useState } from 'react';

export function AlertButton({
  visible,
  message,
  isError,
}: {
  visible: boolean;
  message: string;
  isError?: boolean;
}) {
  if (!visible) return null; // Không hiện gì nếu visible = false

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        mt-4 p-3 rounded shadow
        ${
          !isError
            ? 'bg-red-100 border border-red-400 text-red-700' // màu đỏ cho lỗi
            : 'bg-green-100 border border-green-400 text-green-700' // màu xanh cho thành công
        }
      `}
    >
      {message}
    </div>
  );
}
