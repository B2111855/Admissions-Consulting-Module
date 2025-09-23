export interface CourseCategory {
  id: number;
  name: string;
  description: string;
  courses: {
    id: number;
    name: string;
    program_type: string;
    duration: string;
    description: string;
  }[];
}

export async function fetchCourseCategories(): Promise<CourseCategory[]> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const url = `${API_BASE_URL}/api/uploadform/DataCourse`;
  console.log('[fetchCourseCategories] Fetching from:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `❌ Failed to fetch data: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const json = await response.json();

    // ✅ Kiểm tra dữ liệu theo chuẩn API trả về { status: "success", data: { coursecategories: [...] } }
    if (
      json?.status === 'success' &&
      Array.isArray(json.data?.coursecategories)
    ) {
      return json.data.coursecategories as CourseCategory[];
    } else {
      console.error('❌ Unexpected JSON structure:', json);
      throw new Error('❌ Invalid response structure');
    }
  } catch (error) {
    console.error('[fetchCourseCategories] ERROR:', error);
    throw error;
  }
}
