import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CourseService,
  CreateCategoryWithCoursesData,
  CreateCourseData,
  UpdateCourseData,
} from '../services/course.service';

export const useCourseData = () => {
  const queryClient = useQueryClient();

  /**
   * Query to fetch all categories with pagination.
   * @param {number} page - The page number to fetch (default: 1).
   * @param {number} limit - The number of records per page (default: 10).
   * @returns {object} Tanstack Query object with data, isLoading, isError, error, etc.
   */
  const useGetAllCategories = (page = 1, limit = 10) => {
    return useQuery({
      queryKey: ['categories', page, limit],
      queryFn: () => CourseService.getAllCategories(page, limit),
      placeholderData: (previousData) => previousData,
      staleTime: 1000 * 60 * 5,
    });
  };

  /**
   * Query to fetch all active courses with pagination.
   * @param {number} page - The page number to fetch (default: 1).
   * @param {number} limit - The number of records per page (default: 10).
   * @returns {object} Tanstack Query object with data, isLoading, isError, error, etc.
   */
  const useGetActiveCourses = (page = 1, limit = 10) => {
    return useQuery({
      queryKey: ['activeCourses', page, limit],
      queryFn: () => CourseService.getActiveCourses(page, limit),
      placeholderData: (previousData) => previousData,
      staleTime: 1000 * 60 * 5,
    });
  };

  /**
   * Query to fetch a single course by its ID.
   * @param {number} courseId - The ID of the course to fetch.
   * @returns {object} Tanstack Query object with data, isLoading, isError, error, etc.
   */
  const useGetCourseById = (courseId: any) => {
    return useQuery({
      queryKey: ['course', courseId],
      queryFn: () => CourseService.getCourseById(courseId),
      enabled: !!courseId,
      staleTime: 1000 * 60 * 1,
    });
  };

  // --- Mutations (Data Modification) ---

  /**
   * Mutation to create a new category along with its courses.
   * Invalidates 'categories' and 'activeCourses' queries upon successful creation.
   * @returns {object} Tanstack Query mutation object.
   */
  const useCreateCategoryWithCourses = () => {
    return useMutation({
      mutationFn: (data: CreateCategoryWithCoursesData) =>
        CourseService.createCategoryWithCourses(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['activeCourses'] });
      },
      onError: (error) => {
        console.error('Failed to create category with courses:', error);
      },
    });
  };

  /**
   * Mutation to create courses for an existing category.
   * Invalidates 'categories' and 'activeCourses' queries upon successful creation.
   * @returns {object} Tanstack Query mutation object.
   */
  const useCreateCoursesForExistingCategory = () => {
    return useMutation({
      mutationFn: ({
        categoryId,
        courses,
      }: {
        categoryId: number;
        courses: CreateCourseData[];
      }) => CourseService.createCoursesForExistingCategory(categoryId, courses),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['activeCourses'] });
      },
      onError: (error) => {
        console.error('Failed to create courses for existing category:', error);
      },
    });
  };

  /**
   * Mutation to update an existing course.
   * Invalidates 'course' by ID, 'activeCourses', and 'categories' queries upon success.
   * @returns {object} Tanstack Query mutation object.
   */
  const useUpdateCourse = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: UpdateCourseData }) =>
        CourseService.updateCourse(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['course', variables.id] });

        queryClient.invalidateQueries({ queryKey: ['activeCourses'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      },
      onError: (error) => {
        console.error('Failed to update course:', error);
      },
    });
  };

  /**
   * Mutation to delete a course.
   * Invalidates 'activeCourses' and 'categories' queries upon successful deletion.
   * @returns {object} Tanstack Query mutation object.
   */
  const useDeleteCourse = () => {
    return useMutation({
      mutationFn: (id: number) => CourseService.deleteCourse(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['activeCourses'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      },
      onError: (error) => {
        console.error('Failed to delete course:', error);
      },
    });
  };

  return {
    useGetAllCategories,
    useGetActiveCourses,
    useGetCourseById,
    useCreateCategoryWithCourses,
    useCreateCoursesForExistingCategory,
    useUpdateCourse,
    useDeleteCourse,
  };
};
