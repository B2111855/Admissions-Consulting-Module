export class LoginDto {
    email!: string;
    password!: string;
}

export class RefreshTokenDto {
    refreshToken!: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        email: string;
        fullName: string;
        userType: string;
        isMainConsultant?: boolean;
        kpiGroupId?: number | null;
        employmentDate?: Date | null;
        status?: string;
        programType?: string;
    };
}

// Optional: DTO for registration if needed
export class RegisterDto {
    email!: string;
    password!: string;
    fullName!: string;
    userType!: string;
    isMainConsultant?: boolean;
    kpiGroupId?: number;
    employmentDate?: Date;
    programType?: string;
}

// Optional: DTO for password reset
export class ForgotPasswordDto {
    email!: string;
}

export class ResetPasswordDto {
    token!: string;
    newPassword!: string;
}