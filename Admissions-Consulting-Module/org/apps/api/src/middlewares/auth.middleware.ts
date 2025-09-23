// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt'; // Đảm bảo đường dẫn này đúng
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mở rộng interface Request để phù hợp với model users của Prisma
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        user_type: 'admin' | 'counselor' | 'manager';
        full_name: string;
        is_main_consultant?: boolean | null;
        program_type?: 'Aptech' | 'Arena' | 'Short-term + Steam' | null;
        // Các trường khác từ model users nếu cần
      };
    }
  }
}

export const authenticateToken = (options?: {
  requireAuth?: boolean;
  allowedUserTypes?: Array<'admin' | 'counselor' | 'manager'>;
  requireMainConsultant?: boolean;
  allowedProgramTypes?: Array<'Aptech' | 'Arena' | 'Short-term + Steam'>;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('AUTH_MIDDLEWARE: START for path:', req.path); // LOG 1
      const authHeader = req.headers['authorization'];
      console.log('AUTH_MIDDLEWARE: Raw Authorization Header:', authHeader); // LOG 2
      const token = authHeader?.split(' ')[1];
      console.log(
        'AUTH_MIDDLEWARE: Extracted Token:',
        token ? token.substring(0, 10) + '...' : 'Missing'
      ); // LOG 3

      // Xử lý khi yêu cầu xác thực nhưng không có token
      if (options?.requireAuth !== false && !token) {
        console.log(
          'AUTH_MIDDLEWARE: Access token required but missing. Returning 401.'
        ); // LOG 4
        return res.status(401).json({
          success: false,
          message: 'Access token is required',
        });
      }

      // Cho phép bỏ qua xác thực nếu không bắt buộc
      if (options?.requireAuth === false && !token) {
        console.log(
          'AUTH_MIDDLEWARE: Auth not required and token missing. Skipping auth.'
        ); // LOG 5
        return next();
      }

      console.log('AUTH_MIDDLEWARE: About to call verifyAccessToken...'); // LOG 6
      const decoded = verifyAccessToken(token!); // <-- Hàm verifyAccessToken được gọi ở đây
      console.log(
        'AUTH_MIDDLEWARE: verifyAccessToken returned:',
        decoded ? 'Decoded' : 'Null'
      ); // LOG 7

      if (!decoded) {
        console.log(
          'AUTH_MIDDLEWARE: Invalid or expired access token. Returning 401.'
        ); // LOG 8
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired access token',
        });
      }

      console.log(
        `AUTH_MIDDLEWARE: Decoding successful, user ID: ${decoded.id}. Fetching user from DB...`
      ); // LOG 9
      const user = await prisma.users.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          user_type: true,
          full_name: true,
          is_main_consultant: true,
          program_type: true,
          status: true,
        },
      });
      console.log(
        'AUTH_MIDDLEWARE: Prisma findUnique returned user:',
        user ? user.id : 'None'
      ); // LOG 10

      // Kiểm tra user tồn tại và active
      if (!user || user.status !== 'active') {
        console.log(
          'AUTH_MIDDLEWARE: User not found or inactive. Returning 401.'
        ); // LOG 11
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive',
        });
      }

      // Kiểm tra loại user nếu có yêu cầu
      if (
        options?.allowedUserTypes &&
        !options.allowedUserTypes.includes(user.user_type)
      ) {
        console.log(
          `AUTH_MIDDLEWARE: User type '${user.user_type}' not allowed. Returning 403.`
        ); // LOG 12
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      // Kiểm tra main consultant nếu yêu cầu
      if (options?.requireMainConsultant && !user.is_main_consultant) {
        console.log(
          'AUTH_MIDDLEWARE: Main consultant required but user is not. Returning 403.'
        ); // LOG 13
        return res.status(403).json({
          success: false,
          message: 'Main consultant required',
        });
      }

      // Map DB enum to display string for program_type
      const programTypeMap: Record<
        string,
        'Aptech' | 'Arena' | 'Short-term + Steam'
      > = {
        Aptech: 'Aptech',
        Arena: 'Arena',
        Short_term___Steam: 'Short-term + Steam',
      };
      // Kiểm tra program type nếu yêu cầu
      if (
        options?.allowedProgramTypes &&
        user.program_type &&
        !options.allowedProgramTypes.includes(programTypeMap[user.program_type])
      ) {
        console.log(
          `AUTH_MIDDLEWARE: Program type '${user.program_type}' not allowed. Returning 403.`
        ); // LOG 14
        return res.status(403).json({
          success: true,
          message: 'Invalid program type access',
        });
      }

      // Gán thông tin user vào request
      req.user = {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        full_name: user.full_name,
        is_main_consultant: user.is_main_consultant,
        program_type: user.program_type
          ? programTypeMap[user.program_type]
          : null,
      };

      console.log(
        `AUTH_MIDDLEWARE: User ${req.user.id} authenticated successfully. Calling next().`
      ); // LOG 15
      next();
    } catch (error) {
      console.error(
        'AUTH_MIDDLEWARE: CATCH BLOCK - Unexpected error during authentication:',
        error
      ); // LOG 16
      res.status(500).json({
        success: false,
        message: 'Internal server error during authentication',
      });
    }
  };
};

// Middleware đặc biệt cho admin
export const adminOnly = () => {
  return authenticateToken({
    allowedUserTypes: ['admin'],
  });
};

// Middleware đặc biệt cho counselor
export const counselorOnly = () => {
  return authenticateToken({
    allowedUserTypes: ['counselor'],
  });
};

// Middleware đặc biệt cho main counselor
export const mainCounselorOnly = () => {
  return authenticateToken({
    allowedUserTypes: ['counselor'],
    requireMainConsultant: true,
  });
};

// Middleware cho counselor theo program type
export const programCounselorOnly = (
  programType: 'Aptech' | 'Arena' | 'Short-term + Steam'
) => {
  return authenticateToken({
    allowedUserTypes: ['counselor'],
    allowedProgramTypes: [programType],
  });
};
