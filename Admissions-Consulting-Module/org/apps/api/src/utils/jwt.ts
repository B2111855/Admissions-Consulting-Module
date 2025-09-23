// src/utils/jwt.utils.ts
import { sign, verify, decode, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { users } from '@prisma/client'; // Import type User từ Prisma

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE || '15m';
const REFRESH_TOKEN_LIFE = process.env.REFRESH_TOKEN_LIFE || '7d';

if (!JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET must be defined in environment variables');
}
if (!JWT_REFRESH_SECRET) {
  throw new Error(
    'JWT_REFRESH_SECRET must be defined in environment variables'
  );
}

// === Cập nhật TokenPayload để chứa thông tin người dùng ===
export interface TokenPayload {
  id: number;
  email: string;
  full_name: string | null;
  user_type: string; // Tùy thuộc vào enum của bạn, có thể là users_user_type
  is_main_consultant: boolean | null;
  kpi_group_id: number | null;
  employment_date: Date | null;
  status: string | null; // Tùy thuộc vào enum của bạn, có thể là users_status
  program_type: string | null; // Tùy thuộc vào enum của bạn, có thể là users_program_type
  // Thêm bất kỳ trường nào khác bạn muốn có trong token (trừ password_hash)
}

// Cập nhật hàm generateAccessToken để nhận User object
export const generateAccessToken = (
  user: Omit<
    users,
    | 'password_hash'
    | 'refresh_token'
    | 'refresh_token_expire'
    | 'created_at'
    | 'updated_at'
  >
): string => {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    user_type: user.user_type,
    is_main_consultant: user.is_main_consultant,
    kpi_group_id: user.kpi_group_id,
    employment_date: user.employment_date,
    status: user.status,
    program_type: user.program_type,
  };

  return sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_LIFE,
  } as SignOptions); // Thêm type assertion ở đây
};

export const generateRefreshToken = (
  user: Omit<
    users,
    | 'password_hash'
    | 'refresh_token'
    | 'refresh_token_expire'
    | 'created_at'
    | 'updated_at'
  >
): string => {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    user_type: user.user_type,
    is_main_consultant: user.is_main_consultant,
    kpi_group_id: user.kpi_group_id,
    employment_date: user.employment_date,
    status: user.status,
    program_type: user.program_type,
  };

  return sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_LIFE,
  } as SignOptions); // Thêm type assertion ở đây
};

// Hàm verify vẫn giữ nguyên, nó sẽ trả về TokenPayload đã được định nghĩa
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    console.log('JWT_UTIL: Attempting to verify token...');
    const decoded = verify(token, JWT_ACCESS_SECRET) as TokenPayload;
    console.log('JWT_UTIL: Token verified successfully.');
    return decoded;
  } catch (error) {
    console.error('JWT_UTIL: Access token verification failed:', error);
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
};

export const getTokenExpirationTime = (token: string): Date | null => {
  try {
    const decoded = decode(token) as any;
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    console.error('Token decoding failed:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return true;
  return expirationTime < new Date();
};
