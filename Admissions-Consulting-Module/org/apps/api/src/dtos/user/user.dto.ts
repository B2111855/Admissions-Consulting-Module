// src/dtos/user/user.dto.ts
import {
    IsInt,
    IsString,
    IsEmail,
    MinLength,
    MaxLength,
    IsBoolean,
    IsOptional,
    IsDateString,
    IsEnum,
    IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

// === Import các Enum từ Prisma Client ===
// Đảm bảo rằng các enum này được định nghĩa trong schema.prisma của bạn
// và đã chạy `npx prisma generate` để chúng được tạo ra.
import {
    users_user_type,      // Enum cho user_type
    users_status,         // Enum cho status
    users_program_type,   // Enum cho program_type
    // Nếu bảng của bạn tên là User thay vì users, các enum sẽ là UserType, UserStatus, UserProgramType (viết hoa chữ cái đầu)
    // Bạn cần kiểm tra lại file node_modules/@prisma/client/index.d.ts để biết tên chính xác.
} from '@prisma/client';

export class CreateUserDto {
    @IsNotEmpty({ message: 'Email không được để trống.' })
    @IsEmail({}, { message: 'Email không hợp lệ.' })
    @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự.' })
    email!: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
    @IsString({ message: 'Mật khẩu phải là chuỗi.' })
    @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
    @MaxLength(255, { message: 'Mật khẩu không được vượt quá 255 ký tự.' })
    password!: string;

    @IsNotEmpty({ message: 'Họ và tên không được để trống.' })
    @IsString({ message: 'Họ và tên phải là chuỗi.' })
    @MaxLength(255, { message: 'Họ và tên không được vượt quá 255 ký tự.' })
    full_name!: string;

    // === Sử dụng Enum của Prisma cho user_type ===
    @IsNotEmpty({ message: 'Loại người dùng không được để trống.' })
    @IsEnum(users_user_type, { message: 'Loại người dùng không hợp lệ.' })
    user_type!: users_user_type; // <-- Thay đổi ở đây

    @IsOptional()
    @IsBoolean({ message: 'is_main_consultant phải là kiểu boolean.' })
    is_main_consultant?: boolean;

    @IsOptional()
    @IsInt({ message: 'ID nhóm KPI phải là số nguyên.' })
    @Type(() => Number)
    kpi_group_id?: number; // <-- Thêm '?' vì nó là optional

    // === Xử lý employment_date ===
    // Prisma mong đợi một đối tượng Date hoặc chuỗi ISO-8601 đầy đủ.
    // Nếu bạn muốn client gửi chuỗi ngày dạng "YYYY-MM-DD", bạn cần chuyển đổi nó sang Date object trong service.
    @IsOptional()
    @IsDateString({}, { message: 'Ngày tuyển dụng phải là định dạng ngày hợp lệ (ví dụ: YYYY-MM-DD).' })
    // employment_date có thể là string (từ request body) hoặc Date object (sau khi chuyển đổi)
    // Trong DTO, bạn nên định nghĩa nó là string vì class-validator chỉ kiểm tra string
    employment_date?: string; // <-- Thay đổi kiểu thành 'string' vì @IsDateString kiểm tra chuỗi.
                              // Việc chuyển đổi sang Date object sẽ được thực hiện ở Service.

    // === Sử dụng Enum của Prisma cho status ===
    @IsOptional()
    @IsEnum(users_status, { message: 'Trạng thái người dùng không hợp lệ.' })
    status?: users_status; // <-- Thay đổi ở đây

    // === Sử dụng Enum của Prisma cho program_type ===
    @IsOptional()
    @IsEnum(users_program_type, { message: 'Loại chương trình không hợp lệ.' })
    program_type?: users_program_type; // <-- Thay đổi ở đây
}

// === Xóa các enum tự định nghĩa của bạn vì chúng không cần thiết nữa ===
// export enum UserType { ... }
// export enum UserStatus { ... }
// export enum ProgramType { ... }