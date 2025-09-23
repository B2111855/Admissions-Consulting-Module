import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Matches, Length } from 'class-validator';

// Import trực tiếp các enum từ Prisma client
import {
  studentstatushistory_old_status,
  studentstatushistory_new_status,
} from '@prisma/client';

export class UpdateStudentStatusHistoryDto {
  @IsInt()
  @IsNotEmpty()
  public student_id!: number;

  @IsEnum(studentstatushistory_old_status, { message: 'Trạng thái cũ không hợp lệ.' })
  @IsOptional()
  old_status?: studentstatushistory_old_status | null;

  @IsEnum(studentstatushistory_new_status, { message: 'Trạng thái mới không hợp lệ.' })
  @IsNotEmpty()
  public new_status!: studentstatushistory_new_status;

  @IsInt()
  @IsNotEmpty()
  public changed_by_user_id!: number;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s.,-]*$/, { message: 'Ghi chú chỉ có thể chứa các ký tự chữ và số, khoảng trắng, dấu chấm, dấu phẩy và dấu gạch nối.' })
  @Length(0, 1000, { message: 'Ghi chú không được vượt quá 1000 ký tự.' })
  notes?: string | null;
}