import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dtos/auth/auth.dto';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    fullName: string | null;
    userType: any; // Or specific enum type from Prisma, e.g., $Enums.users_user_type
    isMainConsultant: boolean | null;
    kpiGroupId: number | null;
    employmentDate: Date | null;
    status: any; // Or specific enum type from Prisma, e.g., $Enums.users_status
    programType: any | null; // Or specific enum type from Prisma, e.g., $Enums.users_program_type
  };
}

class AuthService {
  private prisma = new PrismaClient();

  private readonly JWT_SECRET: string =
    process.env.JWT_ACCESS_SECRET ?? 'access_token';
  private readonly JWT_REFRESH_SECRET: string =
    process.env.JWT_REFRESH_SECRET ?? 'refresh_token';
  private readonly JWT_REFRESH_EXPIRES_IN: string =
    process.env.REFRESH_TOKEN_LIFE ?? '7d';

  async login(loginData: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.users.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng.');
    }

    if (user.status !== 'active') {
      throw new Error('Tài khoản đã bị khóa');
    }

    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new Error('Email hoặc mật khẩu không đúng.');
    }

    // --- Thay đổi ở đây ---
    const { accessToken, refreshToken } = this.generateTokens(user.id);
    // --- Kết thúc thay đổi ---

    const refreshTokenExpiry = new Date(
      Date.now() + this.parseExpiryTime(this.JWT_REFRESH_EXPIRES_IN) * 1000
    );

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        refresh_token: refreshToken,
        refresh_token_expire: refreshTokenExpiry,
        updated_at: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        userType: user.user_type,
        isMainConsultant: user.is_main_consultant,
        kpiGroupId: user.kpi_group_id,
        employmentDate: user.employment_date,
        status: user.status,
        programType: user.program_type,
      },
    };
  }

  async register(registerData: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.users.findUnique({
      where: { email: registerData.email },
    });

    if (existingUser) {
      throw new Error('Email đã được sử dụng.');
    }

    const hashedPassword = await bcrypt.hash(registerData.password, 12);

    const newUser = await this.prisma.users.create({
      data: {
        email: registerData.email,
        password_hash: hashedPassword,
        full_name: registerData.fullName,
        user_type: registerData.userType as any,
        is_main_consultant: registerData.isMainConsultant || false,
        kpi_group_id: registerData.kpiGroupId,
        employment_date: registerData.employmentDate,
        program_type: registerData.programType as any,
        status: 'active' as any,
      },
    });

    // --- Thay đổi ở đây ---
    const { accessToken, refreshToken } = this.generateTokens(newUser.id);
    // --- Kết thúc thay đổi ---

    const refreshTokenExpiry = new Date(
      Date.now() + this.parseExpiryTime(this.JWT_REFRESH_EXPIRES_IN) * 1000
    );

    await this.prisma.users.update({
      where: { id: newUser.id },
      data: {
        refresh_token: refreshToken,
        refresh_token_expire: refreshTokenExpiry,
        updated_at: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        userType: newUser.user_type,
        isMainConsultant: newUser.is_main_consultant,
        kpiGroupId: newUser.kpi_group_id,
        employmentDate: newUser.employment_date,
        status: newUser.status,
        programType: newUser.program_type,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      // --- Thay đổi ở đây ---
      // Nếu bạn muốn verifyAccessToken của bạn trả về { id: number }, thì bạn cần thay đổi cách này
      // Hiện tại nó đang mong đợi { userId: number }, nên không cần thay đổi ở đây nếu jwt.verify trả về { userId: number }
      // Nhưng nếu verifyAccessToken trả về {id: number}, thì decoded.userId sẽ là undefined
      // Vấn đề là ở chỗ decoded.id trong auth.middleware
      const decoded = jwt.verify(
        refreshTokenDto.refreshToken,
        this.JWT_REFRESH_SECRET
      ) as { id: number }; // <-- THAY ĐỔI TỪ userId THÀNH id Ở ĐÂY

      const user = await this.prisma.users.findUnique({
        where: { id: decoded.id }, // <-- VÀ Ở ĐÂY
      });
      // --- Kết thúc thay đổi ---

      if (
        !user ||
        user.refresh_token !== refreshTokenDto.refreshToken ||
        !user.refresh_token_expire ||
        user.refresh_token_expire < new Date()
      ) {
        throw new Error('Refresh token không hợp lệ hoặc đã hết hạn.');
      }

      // --- Thay đổi ở đây ---
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        this.generateTokens(user.id);
      // --- Kết thúc thay đổi ---

      const refreshTokenExpiry = new Date(
        Date.now() + this.parseExpiryTime(this.JWT_REFRESH_EXPIRES_IN) * 1000
      );

      await this.prisma.users.update({
        where: { id: user.id },
        data: {
          refresh_token: newRefreshToken,
          refresh_token_expire: refreshTokenExpiry,
          updated_at: new Date(),
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          userType: user.user_type,
          isMainConsultant: user.is_main_consultant,
          kpiGroupId: user.kpi_group_id,
          employmentDate: user.employment_date,
          status: user.status,
          programType: user.program_type,
        },
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Refresh token không hợp lệ.');
      }
      throw error;
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      // --- Thay đổi ở đây ---
      const decoded = jwt.verify(token, this.JWT_SECRET) as { id: number }; // <-- THAY ĐỔI TỪ userId THÀNH id Ở ĐÂY

      const user = await this.prisma.users.findUnique({
        where: { id: decoded.id }, // <-- VÀ Ở ĐÂY
        include: {
          userspecializations: true,
        },
      });
      // --- Kết thúc thay đổi ---

      if (!user) {
        throw new Error('Token không hợp lệ.');
      }

      return user;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token không hợp lệ hoặc đã hết hạn.');
      }
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.users.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return;
    }

    const resetToken = jwt.sign(
      { id: user.id, type: 'password_reset' }, // <-- THAY ĐỔI TỪ userId THÀNH id Ở ĐÂY
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        refresh_token: resetToken,
        refresh_token_expire: new Date(Date.now() + 60 * 60 * 1000),
        updated_at: new Date(),
      },
    });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    try {
      const decoded = jwt.verify(resetPasswordDto.token, this.JWT_SECRET) as {
        id: number; // <-- THAY ĐỔI TỪ userId THÀNH id Ở ĐÂY
        type: string;
      };

      if (decoded.type !== 'password_reset') {
        throw new Error('Token đặt lại mật khẩu không hợp lệ.');
      }

      const user = await this.prisma.users.findUnique({
        where: { id: decoded.id }, // <-- VÀ Ở ĐÂY
      });

      if (
        !user ||
        user.refresh_token !== resetPasswordDto.token ||
        !user.refresh_token_expire ||
        user.refresh_token_expire < new Date()
      ) {
        throw new Error('Token đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.');
      }

      const hashedPassword = await bcrypt.hash(
        resetPasswordDto.newPassword,
        12
      );

      await this.prisma.users.update({
        where: { id: user.id },
        data: {
          password_hash: hashedPassword,
          refresh_token: null,
          refresh_token_expire: null,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      }
      throw error;
    }
  }

  async logout(userId: number): Promise<void> {
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        refresh_token: null,
        refresh_token_expire: null,
        updated_at: new Date(),
      },
    });
  }

  // --- Thay đổi ở đây: Quan trọng nhất ---
  private generateTokens(id: number): {
    // Đổi userId thành id
    accessToken: string;
    refreshToken: string;
  } {
    const now = Math.floor(Date.now() / 1000);

    const accessExpiry = this.parseExpiryTime(
      process.env.ACCESS_TOKEN_LIFE || '15m'
    );
    const refreshExpiry = this.parseExpiryTime(
      process.env.REFRESH_TOKEN_LIFE || '7d'
    );

    const accessPayload = {
      id, // <-- THAY ĐỔI TỪ userId THÀNH id
      exp: now + accessExpiry,
    };

    const refreshPayload = {
      id, // <-- VÀ Ở ĐÂY CŨNG VẬY
      exp: now + refreshExpiry,
    };

    const accessToken = jwt.sign(accessPayload, this.JWT_SECRET);
    const refreshToken = jwt.sign(refreshPayload, this.JWT_REFRESH_SECRET);

    return { accessToken, refreshToken };
  }
  // --- Kết thúc thay đổi ---

  private parseExpiryTime(timeStr: string): number {
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 15 * 60;
    }
  }
}

export default new AuthService();
