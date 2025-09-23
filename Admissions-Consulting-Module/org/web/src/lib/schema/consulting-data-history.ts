

import { z } from 'zod';


export const consultationHistorySchema = z.object({
  consultation_session_id: z.number(),
  session_date: z.string(),
  duration_minutes: z.number().nullable(),
  session_type: z.string(),
  session_status: z.string(),
  session_notes: z.string().nullable(),
  counselor_name: z.string(),
  counseler_email: z.string().email(),
  student_name: z.string(),
  student_email: z.string().email().nullable(),
  student_phone_number: z.string(),
});

export const metadataSchema = z.object({
  totalRecords: z.number(),
  firstPage: z.number(),
  lastPage: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const consultingApiResponseSchemaHistory = z.object({
  status: z.string(),
  data: z.object({
    consultationHistory: z.array(consultationHistorySchema),
    metadata: metadataSchema,
  }),
});

export type ConsultationHistory = z.infer<typeof consultationHistorySchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type ConsultingApiResponseHistory = z.infer<
  typeof consultingApiResponseSchemaHistory
>;
