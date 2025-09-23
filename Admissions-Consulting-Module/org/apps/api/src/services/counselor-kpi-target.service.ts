import { PrismaClient, counselorkpi_targets } from '@prisma/client';
import Paginator from './paginator';

const prisma = new PrismaClient();

class CounselorKpiTargetService {
  async getAllCounselorKpiTargets(page: number | string = 1, limit: number | string = 10): Promise<{ counselorKpiTargets: counselorkpi_targets[], metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);

      const [totalCount, counselorKpiTargets] = await Promise.all([
        prisma.counselorkpi_targets.count(),
        prisma.counselorkpi_targets.findMany({
          skip: paginator.offset,
          take: paginator.limit,
          include: {
            users_counselorkpi_targets_counselor_idTousers: true,
            kpi_definitions: true,
            users_counselorkpi_targets_created_by_user_idTousers: true
          }
        })
      ]);

      const metadata = paginator.getMetadata(totalCount);
      return { counselorKpiTargets, metadata };
    } catch (e) {
      console.error("Error in CounselorKpiTargetService.getAllCounselorKpiTargets:", e);
      return null;
    }
  }

  async getCounselorKpiTargetById(id: number): Promise<counselorkpi_targets | null> {
    try {
      return await prisma.counselorkpi_targets.findUnique({
        where: { id },
        include: {
          users_counselorkpi_targets_counselor_idTousers: true,
          kpi_definitions: true,
          users_counselorkpi_targets_created_by_user_idTousers: true
        }
      });
    } catch (e) {
      console.error("Error in CounselorKpiTargetService.getCounselorKpiTargetById:", e);
      return null;
    }
  }

  async getKpiTargetsByCounselorId(counselorId: number): Promise<counselorkpi_targets[] | null> {
    try {
      return await prisma.counselorkpi_targets.findMany({
        where: { counselor_id: counselorId },
        include: {
          kpi_definitions: true
        }
      });
    } catch (e) {
      console.error("Error in CounselorKpiTargetService.getKpiTargetsByCounselorId:", e);
      return null;
    }
  }

  async createCounselorKpiTarget(data: any): Promise<counselorkpi_targets | null> {
    try {
      return await prisma.counselorkpi_targets.create({
        data
      });
    } catch (e) {
      console.error("Error in CounselorKpiTargetService.createCounselorKpiTarget:", e);
      return null;
    }
  }

  async updateCounselorKpiTarget(id: number, data: any): Promise<counselorkpi_targets | null> {
    try {
      return await prisma.counselorkpi_targets.update({
        where: { id },
        data
      });
    } catch (e) {
      console.error("Error in CounselorKpiTargetService.updateCounselorKpiTarget:", e);
      return null;
    }
  }

  async deleteCounselorKpiTarget(id: number): Promise<void> {
    try {
      await prisma.counselorkpi_targets.delete({
        where: { id }
      });
    } catch (e) {
      console.error("Error in CounselorKpiTargetService.deleteCounselorKpiTarget:", e);
    }
  }
}

export default new CounselorKpiTargetService();