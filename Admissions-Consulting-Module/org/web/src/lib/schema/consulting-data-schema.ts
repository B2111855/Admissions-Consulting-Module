import { z } from 'zod';

export const consultingDataSchema = z.object({
  student_id: z.number(),
  student_name: z.string(),
  email: z.string().email().nullable(),
  phone_number: z.string(),
  zalo_phone: z.string().nullable(),
  link_facebook: z
    .string()
    .url()
    .nullable()
    .or(z.literal(''))
    .or(z.string().regex(/^fb\.com\/.+/)),
  date_of_birth: z.string().nullable(),
  current_education_level: z.string(),
  other_education_level_description: z.string().nullable(),
  high_school_name: z.string().nullable(),
  city: z.string(),
  source: z.string(),
  assigned_counselor_id: z.string().optional(),

  notification_consent: z.string(),
  current_status: z.string(),
  status_change_date: z.string().nullable(),
  registration_date: z.string().nullable(),
  student_created_at: z.string(),
  student_updated_at: z.string(),
  assigned_counselor_name: z.string(),
  assigned_counselor_type: z.string(),
  interested_courses_details: z.string().nullable(),
  enrolled_courses_details: z.string().nullable(),
  student_status_history: z.string().nullable(),
  last_consultation_date: z.string().nullable(),
  last_consultation_duration_minutes: z.number().nullable(),
  last_consultation_notes: z.string().nullable(),
  last_consultation_type: z.string().nullable(),
  last_consultation_status: z.string().nullable(),
  last_consultation_counselor_name: z.string().nullable(),
  gender: z.string().nullable(),
  other_source_description: z.string().nullable(),
  other_notification_consent_description: z.string().nullable(),
});

export type ConsultingTableRow = z.infer<typeof consultingDataSchema>;

export const metadataSchema = z
  .object({
    totalRecords: z.number().optional(),
    firstPage: z.number().optional(),
    lastPage: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  })
  .transform((data) => {
    return {
      totalRecords: data.totalRecords ?? 0,
      firstPage: data.firstPage ?? 1,
      lastPage: data.lastPage ?? 1,
      page: data.page ?? 1,
      limit: data.limit ?? 10,
    };
  });

export const metadataSchemaAlternative = z.preprocess(
  (data: any) => {
    if (!data || Object.keys(data).length === 0) {
      return {
        totalRecords: 0,
        firstPage: 1,
        lastPage: 1,
        page: 1,
        limit: 10,
      };
    }
    return data;
  },
  z.object({
    totalRecords: z.number(),
    firstPage: z.number(),
    lastPage: z.number(),
    page: z.number(),
    limit: z.number(),
  })
);

export type Metadata = z.infer<typeof metadataSchema>;

export const consultingApiResponseSchema = z.object({
  status: z.string(),
  data: z.object({
    consultingInformation: z.array(consultingDataSchema),
    metadata: metadataSchema,
    status: z.string().optional(),
  }),
});

export type ConsultingApiResponse = z.infer<typeof consultingApiResponseSchema>;
