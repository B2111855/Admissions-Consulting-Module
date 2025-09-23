import apiClient from '@/lib/axios.lib';

// Types for better type safety
export interface Category {
  id: number;
  name: string;
  description?: string;
  courses?: Course[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  duration_text: string;
  price: string;
  is_active: boolean;
  program_type: string;
  created_at: string;
  updated_at: string;
  coursecategories?: {
    id: number;
    name: string;
    description: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    totalRecords: number;
    firstPage: number;
    lastPage: number;
    page: number;
    limit: number;
  };
}

export interface CategoriesResponse {
  categories: Category[];
  metadata: {
    totalRecords: number;
    firstPage: number;
    lastPage: number;
    page: number;
    limit: number;
  };
}

export interface CoursesResponse {
  courses: Course[];
  metadata: {
    totalRecords: number;
    firstPage: number;
    lastPage: number;
    page: number;
    limit: number;
  };
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}

export interface CreateCategoryWithCoursesData {
  name: string;
  description?: string;
}

export interface CreateCourseData {
  name: string;
  description?: string;
  category_id: number;
  duration_text: string;
  price: string;
  is_active?: boolean;
  program_type: string;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {}

export const CourseService = {

  async getAllCategories(page: number = 1, limit: number = 10): Promise<CategoriesResponse> {
    try {
      const response = await apiClient.get<ApiResponse<CategoriesResponse>>('/courses/cate', {
        params: { page, limit }
      });
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch categories');
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch categories');
    }
  },

  async getActiveCourses(page: number = 1, limit: number = 10): Promise<CoursesResponse> {
    try {
      const response = await apiClient.get<ApiResponse<CoursesResponse>>('/courses/active', {
        params: { page, limit }
      });
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch active courses');
    } catch (error: any) {
      console.error('Error fetching active courses:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch active courses');
    }
  },

 
  async getCourseById(id: number): Promise<Course> {
    try {
      const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Course not found');
    } catch (error: any) {
      console.error(`Error fetching course ${id}:`, error);
      if (error.response?.status === 404) {
        throw new Error('Course not found');
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch course');
    }
  },


  async createCategoryWithCourses(data: CreateCategoryWithCoursesData): Promise<Category> {
    try {
      const response = await apiClient.post<ApiResponse<Category>>('/courses/categories/with-courses', data);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to create category');
    } catch (error: any) {
      console.error('Error creating category with courses:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create category');
    }
  },


  async createCoursesForExistingCategory(categoryId: number, courses: CreateCourseData[]): Promise<Course[]> {
    try {
      const response = await apiClient.post<ApiResponse<Course[]>>(`/courses/categories/${categoryId}/courses`, courses);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to create courses');
    } catch (error: any) {
      console.error(`Error creating courses for category ${categoryId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create courses');
    }
  },


  async updateCourse(id: number, data: UpdateCourseData): Promise<Course> {
    try {
      const response = await apiClient.put<ApiResponse<Course>>(`/courses/${id}`, data);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update course');
    } catch (error: any) {
      console.error(`Error updating course ${id}:`, error);
      if (error.response?.status === 404) {
        throw new Error('Course not found');
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to update course');
    }
  },

 
  async deleteCourse(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(`/courses/${id}`);
      
      if (response.data.status === 'success') {
        return;
      }
      
      throw new Error(response.data.message || 'Failed to delete course');
    } catch (error: any) {
      console.error(`Error deleting course ${id}:`, error);
      if (error.response?.status === 404) {
        throw new Error('Course not found');
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete course');
    }
  }
};