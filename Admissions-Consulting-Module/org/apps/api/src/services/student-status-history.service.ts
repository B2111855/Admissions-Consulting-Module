// @ts-ignore
import {PrismaClient, studentstatushistory} from '@prisma/client';
import Paginator from "./paginator";
import {UpdateStudentStatusHistoryDto} from "../dtos/student-status-history/student-status-update";
import {CreateStudentStatusHistoryDto} from "../dtos/student-status-history/student-status-create";


const prisma = new PrismaClient();

class StudentStatusHistoryService {

  async getAllStudentStatus(page: number | string = 1, limit: number | string = 10): Promise<{ student_status_history: studentstatushistory[], metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);


      const [totalStudentsCount, student_status_history] = await Promise.all([
        prisma.studentstatushistory.count(),
        prisma.studentstatushistory.findMany({
          skip: paginator.offset,
          take: paginator.limit,
        })])

      const metadata = paginator.getMetadata(totalStudentsCount);
      return {
        student_status_history,
        metadata,
      };
    } catch (e) {
      console.error("Error in StudentService.getAllStudents:", e);
      return null;
    }
  }

  async getStudentStatusById(id : number) {
    try{
      return await prisma.studentstatushistory.findUnique({
        where: {
          id : id,
        }
      });
    }catch (e : any) {
      console.error("Error in StudentService.getStudentStatusById:", e);
      return null;
    }

  }

  async deleteStudentById(id: number) {
    try{
      await prisma.studentstatushistory.delete({
        where: {
          id : id,
        }
      })
    }catch (e : any) {
      console.error("Error in StudentService.getStudentStatusById:", e);
    }
  }

  async updateStudentStatusHistory(id: number, status: UpdateStudentStatusHistoryDto) {
    const existingStudent = await prisma.studentstatushistory.findUnique({
      where: {
        id : id,
      }
    })
    if (!existingStudent) {
      return null;
    }

    try {
      return await prisma.studentstatushistory.update({
        where: {
          id : id,
        },
        data: status,
      });
    }catch (e : any) {
      console.error("Error in StudentService.updateStudentStatusHistory:", e);
      return null;
    }
  }

  async createStudentStatusHistory(status: CreateStudentStatusHistoryDto) {
    try {
      return await prisma.studentstatushistory.create({
        data: status,
      });
    } catch (error: any) {
      console.error("Error in StudentService.createStudentStatusHistory:", error);
      throw new Error(`Failed to create student status history: ${error.message || error}`);
    }
  }
}

export default new StudentStatusHistoryService();
