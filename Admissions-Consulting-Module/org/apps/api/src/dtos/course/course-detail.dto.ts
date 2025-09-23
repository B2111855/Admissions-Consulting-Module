export interface CourseDetailResponse {
    course_category_id: number;
    course_category_name: string;
    course_category_description: string | null;
    course_id: number;
    course_name: string ;
    course_description: string | null;
    course_duration_text: string | null; // e.g., "4 weeks", "3 months"
    course_price: string | null; // e.g., "1000000", "5000000"
    course_is_active: boolean;
    course_program_type: string; // e.g., "SHORT_TERM_STEAM", "LONG_TERM_STEAM"
    course_created_at: string | null; // e.g., "2025-06-14 17:04:11"
}