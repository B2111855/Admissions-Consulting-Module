// Định nghĩa kiểu dữ liệu cho ConsultationHistory
export interface ConsultationHistory {
  consultation_session_id: number;
  session_date: string; // Chắc chắn sẽ là string sau khi formatDateTime
  duration_minutes: number | null; // Cột này trong Prisma có 'Int?'
  session_type: string; // Chắc chắn sẽ là string sau khi map
  session_status: string; // Chắc chắn sẽ là string sau khi map
  session_notes: string | null; // Cột này trong Prisma có 'String?'
  counselor_name: string;
  counseler_email: string;
  student_name: string;
  student_email: string | null; // Cột này trong Prisma có 'String?'
  student_phone_number: string;
}