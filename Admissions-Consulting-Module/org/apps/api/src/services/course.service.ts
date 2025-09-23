import { PrismaClient, coursecategories, courses, courses_program_type } from '@prisma/client';
import Paginator from './paginator';
import {
  CreateCourseCategoryDto,
  CreateCourseDto,
} from '../dtos/course/course-create.dto';
import { CourseUpdateDto } from '../dtos/course/course-update.dto';

const prisma = new PrismaClient();

class CourseService {
  async getAllCourse(
    page: number | string = 1,
    limit: number | string = 10
  ): Promise<{ course: courses[]; metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);

      const [totalCourseCount, course] = await Promise.all([
        prisma.courses.count(),
        prisma.courses.findMany({
          skip: paginator.offset,
          take: paginator.limit,
          include: {
            coursecategories: true, // Include category info
          },
        }),
      ]);

      const metadata = paginator.getMetadata(totalCourseCount);
      return {
        course,
        metadata,
      };
    } catch (e) {
      console.error('Error in Course.getAllCourse:', e);
      return null;
    }
  }

  async getCourseById(courseId: number) {
    try {
      return await prisma.courses.findUnique({
        where: {
          id: courseId,
        },
        include: {
          coursecategories: true, // Include category info
        },
      });
    } catch (e) {
      console.error('Error in Course.getCourseById:', e);
      return null;
    }
  }

  async deleteCourse(courseId: number) {
    const existingCourse = await prisma.courses.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!existingCourse) {
      return null;
    }

    try {
      await prisma.courses.delete({
        where: {
          id: courseId,
        },
      });
      return existingCourse;
    } catch (e) {
      console.error('Error in Course.deleteCourse:', e);
      return null;
    }
  }

  async createCourse(courseData: CreateCourseDto & { category_id: number }) {
    try {
      // Kiểm tra category tồn tại trước
      const categoryExists = await prisma.coursecategories.findUnique({
        where: { id: courseData.category_id },
      });

      if (!categoryExists) {
        throw new Error('Category ID không tồn tại.');
      }

      const result = await prisma.courses.create({
        data: {
          ...courseData,
          price: courseData.price ? parseFloat(courseData.price) : null,
        },
        include: {
          coursecategories: true,
        },
      });

      return result;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Tên khóa học đã tồn tại.');
      }
      if (error.code === 'P2003') {
        throw new Error('Category ID không tồn tại.');
      }

      throw new Error(`Không thể tạo khóa học: ${error.message || error}`);
    }
  }

  async createCategory(categoryData: CreateCourseCategoryDto) {
    try {
      const result = await prisma.coursecategories.create({
        data: categoryData,
      });

      return result;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Tên danh mục đã tồn tại.');
      }

      throw new Error(`Không thể tạo danh mục: ${error.message || error}`);
    }
  }

  async getAllCategories(
    page: number | string = 1,
    limit: number | string = 10
  ): Promise<{ categories: coursecategories[]; metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);

      const [totalCategoryCount, categories] = await Promise.all([
        prisma.coursecategories.count(),
        prisma.coursecategories.findMany({
          skip: paginator.offset,
          take: paginator.limit,
        }),
      ]);

      const metadata = paginator.getMetadata(totalCategoryCount);
      return {
        categories,
        metadata,
      };
    } catch (e) {
      console.error('Error in Category.getAllCategories:', e);
      return null;
    }
  }

  // Method mới: Tạo courses cho category có sẵn
  async createCoursesForExistingCategory(
    categoryId: number,
    coursesData: CreateCourseDto[]
  ) {
    try {
      // Kiểm tra category tồn tại
      const categoryExists = await prisma.coursecategories.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        throw new Error('Category không tồn tại.');
      }

      const result = await prisma.$transaction(async (tx) => {
        // Chuẩn bị data cho courses
        const coursesCreateData = coursesData.map((course) => ({
          name: course.name,
          description: course.description,
          duration_text: course.duration_text,
          price: course.price ? parseFloat(course.price) : null,
          is_active: course.is_active ?? true,
          program_type: course.program_type as courses_program_type, // Giả sử mặc định là SHORT_TERM_STEAM
          category_id: categoryId,
        }));

        // Tạo courses
        await tx.courses.createMany({
          data: coursesCreateData,
        });

        // Lấy lại category với courses
        const categoryWithCourses = await tx.coursecategories.findUnique({
          where: { id: categoryId },
          include: {
            courses: true,
          },
        });

        return categoryWithCourses;
      });

      return result;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Tên khóa học đã tồn tại.');
      }

      throw new Error(`Không thể tạo courses: ${error.message || error}`);
    }
  }

  // Method mới: Lấy tất cả categories với courses
  // async getAllCategories(
  //   page: number | string = 1,
  //   limit: number | string = 10
  // ) {
  //   try {
  //     const paginator = new Paginator(page, limit);

  //     const [totalCount, categories] = await Promise.all([
  //       prisma.coursecategories.count(),
  //       prisma.coursecategories.findMany({
  //         skip: paginator.offset,
  //         take: paginator.limit,
  //         include: {
  //           courses: true,
  //           _count: {
  //             select: {
  //               courses: true,
  //             },
  //           },
  //         },
  //       }),
  //     ]);

  //     const metadata = paginator.getMetadata(totalCount);
  //     return {
  //       categories,
  //       metadata,
  //     };
  //   } catch (e) {
  //     console.error('Error in Course.getAllCategories:', e);
  //     return null;
  //   }
  // }

  // Method mới: Lấy category theo ID với courses
  async getCategoryById(categoryId: number) {
    try {
      return await prisma.coursecategories.findUnique({
        where: {
          id: categoryId,
        },
        include: {
          courses: true,
          _count: {
            select: {
              courses: true,
            },
          },
        },
      });
    } catch (e) {
      console.error('Error in Course.getCategoryById:', e);
      return null;
    }
  }

  async updateCourse(id: number, course: CourseUpdateDto) {
    const existingCourse = await prisma.courses.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingCourse) {
      return null;
    }

    try {
      return await prisma.courses.update({
        where: {
          id: id,
        },
        data: {
          ...course,
          price: course.price ? course.price : undefined,
        },
        include: {
          coursecategories: true,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to update course: ${error.message || error}`);
    }
  }

  // Method mới: Cập nhật category
  async updateCategory(
    id: number,
    categoryData: Partial<CreateCourseCategoryDto>
  ) {
    const existingCategory = await prisma.coursecategories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return null;
    }

    try {
      return await prisma.coursecategories.update({
        where: { id },
        data: categoryData,
        include: {
          courses: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Tên danh mục đã tồn tại.');
      }
      throw new Error(`Failed to update category: ${error.message || error}`);
    }
  }

  // Method mới: Xóa category (chỉ khi không có courses)
  async deleteCategory(categoryId: number) {
    const existingCategory = await prisma.coursecategories.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return null;
    }

    if (existingCategory._count.courses > 0) {
      throw new Error(
        'Không thể xóa danh mục vì vẫn còn khóa học trong danh mục này.'
      );
    }

    try {
      await prisma.coursecategories.delete({
        where: { id: categoryId },
      });
      return existingCategory;
    } catch (e) {
      console.error('Error in Course.deleteCategory:', e);
      return null;
    }
  }

  async getActiveCourses(
    page: number | string = 1,
    limit: number | string = 10
  ): Promise<{ courses: courses[]; metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);

      const [totalActiveCourseCount, activeCourses] = await Promise.all([
        prisma.courses.count({
          where: {
            is_active: true,
          },
        }),
        prisma.courses.findMany({
          where: {
            is_active: true,
          },
          skip: paginator.offset,
          take: paginator.limit,
          include: {
            coursecategories: true, // Include category info
          },
        }),
      ]);

      const metadata = paginator.getMetadata(totalActiveCourseCount);
      return {
        courses: activeCourses,
        metadata,
      };
    } catch (e) {
      console.error('Error in Course.getActiveCourses:', e);
      return null;
    }
  }
}

export default new CourseService();
