// apps/api/src/dtos/student/student-update-api.dto.ts
// Hoặc đường dẫn phù hợp với cấu trúc project của bạn

import {
  IsString,
  IsEmail,
  IsUrl,
  IsEnum,
  Length,
  IsDateString,
  Matches,
  IsInt,
  IsOptional, // Giữ IsOptional cho các trường chỉ đọc/tổng hợp nếu client không bắt buộc gửi lại
  IsNumber
} from 'class-validator';
import { Type } from 'class-transformer';

// Định nghĩa lại các Enums từ Prisma schema và bao gồm cả giá trị hiển thị (từ StudentApiResponse)
// Điều này giúp validator có thể kiểm tra cả giá trị gốc của Prisma và giá trị đã được dịch/hiển thị từ API response
enum EducationLevelForUpdate {
  THPT = 'THPT',
  SINH_VIEN = 'SinhVien',
  OTHER = 'Other',
  SINH_VIEN_DISPLAY = 'Sinh viên', // Giá trị hiển thị từ StudentApiResponse
  MUC_KHAC_DISPLAY = 'Khác',       // Giá trị hiển thị từ StudentApiResponse cho 'Other'
}

enum SourceForUpdate {
  MAIL = 'Mail',
  FANPAGE = 'Fanpage',
  ZALO = 'Zalo',
  WEBSITE = 'Website',
  FRIEND = 'Friend',
  SMS = 'SMS',
  BANDEROLE = 'Banderole',
  POSTER = 'Poster',
  BROCHURE = 'Brochure',
  GOOGLE = 'Google',
  BRAND = 'Brand',
  EVENT = 'Event',
  OTHER = 'Other',
  BANG_RON_DISPLAY = 'Băng rôn', // Giá trị hiển thị
  THUONG_HIEU_DISPLAY = 'Thương hiệu', // Giá trị hiển thị
  SU_KIEN_DISPLAY = 'Sự kiện',   // Giá trị hiển thị
  KHAC_DISPLAY = 'Khác',         // Giá trị hiển thị
}

enum NotificationConsentForUpdate {
  AGREE = 'Agree',
  DISAGREE = 'Disagree',
  OTHER = 'Other',
  DONG_Y_DISPLAY = 'Đồng ý',     // Giá trị hiển thị
  KHONG_DONG_Y_DISPLAY = 'Không đồng ý', // Giá trị hiển thị
  KHAC_DISPLAY = 'Khác',         // Giá trị hiển thị
}

enum StudentStatusForUpdate {
  LEAD = 'Lead',
  ENGAGING = 'Engaging',
  REGISTERED = 'Registered',
  DROPPED_OUT = 'Dropped_Out',
  ARCHIVED = 'Archived',
  TIEM_NANG_DISPLAY = 'Tiềm năng', // Giá trị hiển thị
  DANG_TUONG_TAC_DISPLAY = 'Đang tương tác', // Giá trị hiển thị
  DA_DANG_KY_DISPLAY = 'Đã đăng ký',     // Giá trị hiển thị
  THOI_HOC_DISPLAY = 'Thôi học',       // Giá trị hiển thị
  LUU_TRU_DISPLAY = 'Lưu trữ',       // Giá trị hiển thị
}

export class StudentUpdateApiDto {
  // student_id: Thường được lấy từ @Param, nhưng nếu gửi trong body thì là optional
  @IsOptional()
  @IsInt({ message: 'ID sinh viên phải là số nguyên.' })
  @Type(() => Number)
  student_id?: number;

  @IsString({ message: 'Tên sinh viên phải là chuỗi.' })
  @Length(2, 50, { message: 'Tên sinh viên phải từ 2 đến 50 ký tự.' })
  student_name!: string;

  @IsDateString({}, { message: 'Ngày sinh không hợp lệ (định dạng YYYY-MM-DD).' })
  date_of_birth?: string | null;

  @IsEmail({}, { message: 'Email không hợp lệ.' })
  @Length(0, 255, { message: 'Email không được quá 255 ký tự.' })
  email?: string | null;

  @IsString({ message: 'Số điện thoại phải là chuỗi.' })
  @Matches(/^0\d{9}$/, {
    message: 'Số điện thoại phải có định dạng 0xxxxxxxxx (10 chữ số)'
  })
  phone_number!: string;

  @IsString({ message: 'Giới tính phải là chuỗi.' })
  @Length(1, 20, { message: 'Giới tính phải từ 1 đến 20 ký tự.' })
  gender!: string;

  @IsString({ message: 'Số Zalo phải là chuỗi.' })
  @Matches(/^\d{9,20}$/, {
    message: 'Số Zalo không hợp lệ (chỉ chấp nhận chữ số và dài từ 9 đến 20 ký tự).'
  })
  zalo_phone?: string | null;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true
  }, { message: 'Link Facebook không hợp lệ.' })
  link_facebook?: string | null;

  @IsEnum(EducationLevelForUpdate, { message: 'Trình độ học vấn hiện tại không hợp lệ.' })
  current_education_level!: string;

  @IsString({ message: 'Mô tả trình độ học vấn khác phải là chuỗi.' })
  @Length(0, 255, { message: 'Mô tả trình độ học vấn khác không được quá 255 ký tự.' })
  other_education_level_description?: string | null;

  @IsString({ message: 'Tên trường cấp ba phải là chuỗi.' })
  @Length(0, 255, { message: 'Tên trường cấp ba không được quá 255 ký tự.' })
  high_school_name?: string | null;

  @IsString({ message: 'Thành phố phải là chuỗi.' })
  @Length(0, 100, { message: 'Thành phố không được quá 100 ký tự.' })
  city?: string | null;

  @IsEnum(SourceForUpdate, { message: 'Nguồn biết đến không hợp lệ.' })
  source!: string;

  @IsString({ message: 'Mô tả nguồn khác phải là chuỗi.' })
  @Length(0, 255, { message: 'Mô tả nguồn khác không được quá 255 ký tự.' })
  other_source_description?: string | null;

  @IsDateString({}, { message: 'Ngày đăng ký không hợp lệ (định dạngYYYY-MM-DD HH:mm:ss).' })
  registration_date?: string | null;

  @IsString({ message: 'Chi tiết khóa học quan tâm phải là chuỗi.' })
  @Length(0, 500, { message: 'Chi tiết khóa học quan tâm không được quá 500 ký tự.' })
  interested_courses_details?: string | null;

  @IsEnum(NotificationConsentForUpdate, { message: 'Đồng ý nhận thông báo không hợp lệ.' })
  notification_consent!: string;

  @IsString({ message: 'Mô tả đồng ý nhận thông báo khác phải là chuỗi.' })
  @Length(0, 255, { message: 'Mô tả đồng ý nhận thông báo khác không được quá 255 ký tự.' })
  other_notification_consent_description?: string | null;

  @IsEnum(StudentStatusForUpdate, { message: 'Trạng thái hiện tại không hợp lệ.' })
  current_status!: string;

  @IsInt({ message: 'ID tư vấn viên phải là số nguyên.' })
  @Type(() => Number)
  assigned_counselor_id?: number | null; // Để cho phép gán counselor bằng ID trực tiếp
  
  // --- CÁC TRƯỜNG CHỈ ĐỌC HOẶC TỔNG HỢP TỪ StudentApiResponse ---
  // Các trường này thường không nên được cập nhật trực tiếp bởi client
  // và sẽ được bỏ qua hoặc tính toán lại bởi service.
  // Chúng được thêm vào đây để khớp với cấu trúc StudentApiResponse
  // và được đánh dấu là optional (?).

  @IsOptional()
  @IsString({ message: 'Ngày thay đổi trạng thái phải là chuỗi.' })
  status_change_date?: string; // Ví dụ: "2025-06-14 17:04:13"

  @IsOptional()
  @IsString({ message: 'Ngày tạo sinh viên phải là chuỗi.' })
  student_created_at?: string; // Ví dụ: "2025-06-14 17:04:11"

  @IsOptional()
  @IsString({ message: 'Ngày cập nhật sinh viên phải là chuỗi.' })
  student_updated_at?: string; // Ví dụ: "2025-06-15 00:04:13"

  @IsOptional()
  @IsString({ message: 'Tên người tư vấn được gán phải là chuỗi.' })
  assigned_counselor_name?: string;

  @IsOptional()
  @IsString({ message: 'Loại người tư vấn được gán phải là chuỗi.' })
  assigned_counselor_type?: string;

  @IsOptional()
  @IsString({ message: 'Chi tiết khóa học đã đăng ký phải là chuỗi.' })
  enrolled_courses_details?: string | null;

  @IsOptional()
  @IsString({ message: 'Lịch sử trạng thái sinh viên phải là chuỗi.' })
  student_status_history?: string;

  @IsOptional()
  @IsString({ message: 'Ngày tư vấn gần nhất phải là chuỗi.' })
  last_consultation_date?: string | null;

  @IsOptional()
  @IsNumber({}, { message: 'Thời lượng tư vấn gần nhất phải là số.' })
  @Type(() => Number)
  last_consultation_duration_minutes?: number | null;

  @IsOptional()
  @IsString({ message: 'Ghi chú tư vấn gần nhất phải là chuỗi.' })
  last_consultation_notes?: string | null;

  @IsOptional()
  @IsString({ message: 'Loại tư vấn gần nhất phải là chuỗi.' }) // Hoặc IsEnum nếu bạn có enum cho loại này
  last_consultation_type?: string | null;

  @IsOptional()
  @IsString({ message: 'Trạng thái tư vấn gần nhất phải là chuỗi.' }) // Hoặc IsEnum nếu bạn có enum cho trạng thái này
  last_consultation_status?: string | null;

  @IsOptional()
  @IsString({ message: 'Tên tư vấn viên của phiên tư vấn gần nhất phải là chuỗi.' })
  last_consultation_counselor_name?: string | null;
}
