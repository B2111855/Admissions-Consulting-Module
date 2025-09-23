import { PrismaClient, studentenrollments } from '@prisma/client';
import Paginator from './paginator';

const prisma = new PrismaClient();

class StudentEnrollmentService {
  async getAllStudentEnrollments(page: number | string = 1, limit: number | string = 10): Promise<{ studentEnrollments: studentenrollments[], metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);

      const [totalCount, studentEnrollments] = await Promise.all([
        prisma.studentenrollments.count(),
        prisma.studentenrollments.findMany({
          skip: paginator.offset,
          take: paginator.limit,
          include: {
            students: true,
            courses: true,
            users: true,
            consultationsessions: true
          }
        })
      ]);

      const metadata = paginator.getMetadata(totalCount);
      return { studentEnrollments, metadata };
    } catch (e) {
      console.error("Error in StudentEnrollmentService.getAllStudentEnrollments:", e);
      return null;
    }
  }

  async getStudentEnrollmentById(id: number): Promise<studentenrollments | null> {
    try {
      return await prisma.studentenrollments.findUnique({
        where: { id },
        include: {
          students: true,
          courses: true,
          users: true,
          consultationsessions: true
        }
      });
    } catch (e) {
      console.error("Error in StudentEnrollmentService.getStudentEnrollmentById:", e);
      return null;
    }
  }

  async getEnrollmentsByStudentId(studentId: number): Promise<studentenrollments[] | null> {
    try {
      return await prisma.studentenrollments.findMany({
        where: { student_id: studentId },
        include: {
          courses: true,
          users: true
        }
      });
    } catch (e) {
      console.error("Error in StudentEnrollmentService.getEnrollmentsByStudentId:", e);
      return null;
    }
  }

  async createStudentEnrollment(data: any): Promise<studentenrollments | null> {
    try {
      return await prisma.studentenrollments.create({
        data
      });
    } catch (e) {
      console.error("Error in StudentEnrollmentService.createStudentEnrollment:", e);
      return null;
    }
  }

  async updateStudentEnrollment(id: number, data: any): Promise<studentenrollments | null> {
    try {
      return await prisma.studentenrollments.update({
        where: { id },
        data
      });
    } catch (e) {
      console.error("Error in StudentEnrollmentService.updateStudentEnrollment:", e);
      return null;
    }
  }

  async deleteStudentEnrollment(id: number): Promise<void> {
    try {
      await prisma.studentenrollments.delete({
        where: { id }
      });
    } catch (e) {
      console.error("Error in StudentEnrollmentService.deleteStudentEnrollment:", e);
    }
  }
}

export default new StudentEnrollmentService();
