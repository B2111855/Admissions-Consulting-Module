import { PrismaClient, coursecategories } from '@prisma/client';
import Paginator from './paginator';

const prisma = new PrismaClient();

class CourseCategoryService {
  async getAllCourseCategories(page: number | string = 1, limit: number | string = 10): Promise<{ courseCategories: coursecategories[], metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);

      const [totalCount, courseCategories] = await Promise.all([
        prisma.coursecategories.count(),
        prisma.coursecategories.findMany({
          skip: paginator.offset,
          take: paginator.limit,
          include: {
            courses: true
          }
        })
      ]);

      const metadata = paginator.getMetadata(totalCount);
      return { courseCategories, metadata };
    } catch (e) {
      console.error("Error in CourseCategoryService.getAllCourseCategories:", e);
      return null;
    }
  }

  async getCourseCategoryById(id: number): Promise<coursecategories | null> {
    try {
      return await prisma.coursecategories.findUnique({
        where: { id },
        include: {
          courses: true
        }
      });
    } catch (e) {
      console.error("Error in CourseCategoryService.getCourseCategoryById:", e);
      return null;
    }
  }

  async createCourseCategory(data: any): Promise<coursecategories | null> {
    try {
      return await prisma.coursecategories.create({
        data
      });
    } catch (e) {
      console.error("Error in CourseCategoryService.createCourseCategory:", e);
      return null;
    }
  }

  async updateCourseCategory(id: number, data: any): Promise<coursecategories | null> {
    try {
      return await prisma.coursecategories.update({
        where: { id },
        data
      });
    } catch (e) {
      console.error("Error in CourseCategoryService.updateCourseCategory:", e);
      return null;
    }
  }

  async deleteCourseCategory(id: number): Promise<void> {
    try {
      await prisma.coursecategories.delete({
        where: { id }
      });
    } catch (e) {
      console.error("Error in CourseCategoryService.deleteCourseCategory:", e);
    }
  }
}

export default new CourseCategoryService();