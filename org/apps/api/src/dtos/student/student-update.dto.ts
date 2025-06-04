import { IsString, IsEmail, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsInt, Matches, Length } from 'class-validator';
import { Type } from 'class-transformer';

// Định nghĩa các Enum tương ứng với ENUM trong DB của bạn
export enum EducationLevel {
  THPT = 'THPT',
  SinhVien = 'SinhVien',
  Other = 'Other',
}

export enum Source {
  Mail = 'Mail',
  Fanpage = 'Fanpage',
  Zalo = 'Zalo',
  Website = 'Website',
  Friend = 'Friend',
  SMS = 'SMS',
  Banderole = 'Banderole',
  Poster = 'Poster',
  Brochure = 'Brochure',
  Google = 'Google',
  Brand = 'Brand',
  Event = 'Event',
  Other = 'Other',
}

export enum NotificationConsent {
  Agree = 'Agree',
  Disagree = 'Disagree',
  Other = 'Other',
}

// StudentCreateDTO cho việc tạo mới sinh viên
export class StudentUpdateDTO {
  @IsNotEmpty({ message: 'Tên sinh viên không được để trống.' })
  @IsString({ message: 'Tên sinh viên phải là chuỗi.' })
  @Length(1, 255, { message: 'Tên sinh viên phải từ 1 đến 255 ký tự.' })
  public student_name!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  @Length(0, 255, { message: 'Email không được quá 255 ký tự.' })
  public email?: string | null;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống.' })
  @IsString({ message: 'Số điện thoại phải là chuỗi.' })
  @Matches(/^\d{10,20}$/, { message: 'Số điện thoại không hợp lệ (chỉ chấp nhận chữ số và dài từ 10 đến 20 ký tự).' })
  public phone_number!: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại Zalo phải là chuỗi.' })
  @Matches(/^\d{10,20}$/, { message: 'Số điện thoại Zalo không hợp lệ (chỉ chấp nhận chữ số và dài từ 10 đến 20 ký tự).' })
  public zalo_phone?: string | null;

  @IsOptional()
  @IsString({ message: 'Link Facebook phải là chuỗi.' })
  @Length(0, 255, { message: 'Link Facebook không được quá 255 ký tự.' })
  public link_facebook?: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ (định dạng YYYY-MM-DD).' })
  public date_of_birth?: string | null;

  @IsNotEmpty({ message: 'Trình độ học vấn hiện tại không được để trống.' })
  @IsEnum(EducationLevel, { message: 'Trình độ học vấn hiện tại không hợp lệ.' })
  public current_education_level!: EducationLevel;

  @IsOptional()
  @IsString({ message: 'Mô tả trình độ học vấn khác phải là chuỗi.' })
  @Length(0, 255, { message: 'Mô tả trình độ học vấn khác không được quá 255 ký tự.' })
  public other_education_level_description?: string | null;

  @IsOptional()
  @IsString({ message: 'Tên trường cấp ba phải là chuỗi.' })
  @Length(0, 255, { message: 'Tên trường cấp ba không được quá 255 ký tự.' })
  public high_school_name?: string | null;

  @IsOptional()
  @IsString({ message: 'Thành phố phải là chuỗi.' })
  @Length(0, 100, { message: 'Thành phố không được quá 100 ký tự.' })
  public city?: string | null;

  @IsNotEmpty({ message: 'Nguồn biết đến không được để trống.' })
  @IsEnum(Source, { message: 'Nguồn biết đến không hợp lệ.' })
  public source!: Source;

  @IsOptional()
  @IsString({ message: 'Mô tả nguồn khác phải là chuỗi.' })
  @Length(0, 255, { message: 'Mô tả nguồn khác không được quá 255 ký tự.' })
  public other_source_description?: string | null;

  @IsNotEmpty({ message: 'Đồng ý nhận thông báo không được để trống.' })
  @IsEnum(NotificationConsent, { message: 'Đồng ý nhận thông báo không hợp lệ.' })
  public notification_consent!: NotificationConsent;

  @IsOptional()
  @IsString({ message: 'Mô tả đồng ý nhận thông báo khác phải là chuỗi.' })
  @Length(0, 255, { message: 'Mô tả đồng ý nhận thông báo khác không được quá 255 ký tự.' })
  public other_notification_consent_description?: string | null;



  @IsOptional()
  @IsInt({ message: 'ID tư vấn viên phải là số nguyên.' })
  @Type(() => Number)
  public assigned_counselor_id?: number | null;


  @IsOptional()
  @IsDateString({}, { message: 'Ngày đăng ký không hợp lệ (định dạng YYYY-MM-DD).' })
  public registration_date?: string | null;

  @IsOptional()
  @IsString({ message: 'Lĩnh vực khóa học dự định phải là chuỗi.' })
  @Length(0, 255, { message: 'Lĩnh vực khóa học dự định không được quá 255 ký tự.' })
  public intended_course_area?: string | null;
}
