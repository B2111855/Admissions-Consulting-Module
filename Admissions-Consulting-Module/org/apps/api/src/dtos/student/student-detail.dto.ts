export interface StudentDetailResponse {
  student_id: number;
  student_name: string;
  email: string | null;
  phone_number: string;
  zalo_phone: string | null;
  link_facebook: string | null;
  date_of_birth: string | null; // Định dạng "YYYY-MM-DD"
  current_education_level: string;
  other_education_level_description: string | null;
  high_school_name: string | null;
  city: string | null;
  source: string;
  notification_consent: string;
  current_status: string;
  status_change_date: string | null; // Định dạng "YYYY-MM-DD HH:mm:ss"
  registration_date: string | null; // Định dạng "YYYY-MM-DD HH:mm:ss"
  student_created_at: string | null; // Định dạng "YYYY-MM-DD HH:mm:ss"
  student_updated_at: string | null; // Định dạng "YYYY-MM-DD HH:mm:ss"
  assigned_counselor_name: string | null;
  assigned_counselor_type: string | null;
  interested_courses_details: string | null; // Chuỗi định dạng đặc biệt
  enrolled_courses_details: string | null; // Chuỗi định dạng đặc biệt
  student_status_history: string | null; // Chuỗi định dạng đặc biệt
  last_consultation_date: string | null; // Định dạng "YYYY-MM-DD HH:mm:ss"
  last_consultation_duration_minutes: number | null;
  last_consultation_notes: string | null;
  last_consultation_type: string | null;
  last_consultation_status: string | null;
  last_consultation_counselor_name: string | null;
}