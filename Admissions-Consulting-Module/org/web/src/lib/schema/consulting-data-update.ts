
import { z } from 'zod';

export const consultingUpdateSchema = z.object({
  student_id: z.number(), 
  student_name: z.string().optional(),
  email: z.string().email().nullable().optional(),
  phone_number: z.string().optional(),
  zalo_phone: z.string().nullable().optional(),
  link_facebook: z.string().url().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  current_education_level: z.string().optional(),
  other_education_level_description: z.string().nullable().optional(),
  high_school_name: z.string().nullable().optional(),
  city: z.string().optional(),
  source: z.string().optional(),
  notification_consent: z.string().optional(),
  current_status: z.string().optional(),
  status_change_date: z.string().nullable().optional(),
  registration_date: z.string().nullable().optional(),
  assigned_counselor_name: z.string().optional(),
  assigned_counselor_type: z.string().optional(),
  interested_courses_details: z.string().nullable().optional(),
  enrolled_courses_details: z.string().nullable().optional(),
  student_status_history: z.string().nullable().optional(),
  last_consultation_date: z.string().nullable().optional(),
  last_consultation_duration_minutes: z.number().nullable().optional(),
  last_consultation_notes: z.string().nullable().optional(),
  last_consultation_type: z.string().nullable().optional(),
  last_consultation_status: z.string().nullable().optional(),
  last_consultation_counselor_name: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  other_source_description: z.string().nullable().optional(),
  other_notification_consent_description: z.string().nullable().optional()
}).refine(data => Object.keys(data).length >= 0, {
  message: "Phải cung cấp ít nhất một trường để cập nhật"
});

export type ConsultingUpdateInput = z.infer<typeof consultingUpdateSchema>;