
import {
  IsInt,
  IsDateString,
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';


import {
  consultationsessions_session_type,
  consultationsessions_session_status,
} from '@prisma/client';

export class CreateConsultationSessionDto {
  @IsInt({ message: 'ID tư vấn viên phải là số nguyên.' })
  @IsNotEmpty({ message: 'ID tư vấn viên không được để trống.' })
  @Type(() => Number) 
  counselor_id!: number;

  @IsInt({ message: 'ID sinh viên phải là số nguyên.' })
  @IsNotEmpty({ message: 'ID sinh viên không được để trống.' })
  @Type(() => Number)
  student_id!: number;

  @IsDateString({}, { message: 'Ngày phiên tư vấn không hợp lệ (định dạng YYYY-MM-DDTHH:mm:ssZ).' }) 
  @IsNotEmpty({ message: 'Ngày phiên tư vấn không được để trống.' })
  session_date!: string;

  @IsOptional()
  @IsInt({ message: 'Thời lượng phiên tư vấn phải là số nguyên (phút).' })
  @Type(() => Number)
  duration_minutes?: number | null; // Cột này là Int? trong Prisma

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi.' })
  @Length(0, 65535, { message: 'Ghi chú không được vượt quá giới hạn Text.' }) 
  notes?: string | null;

  @IsEnum(consultationsessions_session_type, { message: 'Loại phiên tư vấn không hợp lệ.' })
  @IsNotEmpty({ message: 'Loại phiên tư vấn không được để trống.' })
  session_type!: consultationsessions_session_type;

  @IsEnum(consultationsessions_session_status, { message: 'Trạng thái phiên tư vấn không hợp lệ.' })
  @IsNotEmpty({ message: 'Trạng thái phiên tư vấn không được để trống.' })
  session_status!: consultationsessions_session_status;


}