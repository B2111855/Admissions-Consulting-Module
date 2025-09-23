import { PrismaClient, counselorspecializations } from '@prisma/client';
import Paginator from './paginator';

const prisma = new PrismaClient();

class CounselorSpecializationService {
  async getAllCounselorSpecializations(page: number | string = 1, limit: number | string = 10): Promise<{ counselorSpecializations: counselorspecializations[], metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);

      const [totalCount, counselorSpecializations] = await Promise.all([
        prisma.counselorspecializations.count(),
        prisma.counselorspecializations.findMany({
          skip: paginator.offset,
          take: paginator.limit,
          include: {
            userspecializations: {
              include: {
                users: true
              }
            }
          }
        })
      ]);

      const metadata = paginator.getMetadata(totalCount);
      return { counselorSpecializations, metadata };
    } catch (e) {
      console.error("Error in CounselorSpecializationService.getAllCounselorSpecializations:", e);
      return null;
    }
  }

  async getCounselorSpecializationById(id: number): Promise<counselorspecializations | null> {
    try {
      return await prisma.counselorspecializations.findUnique({
        where: { id },
        include: {
          userspecializations: {
            include: {
              users: true
            }
          }
        }
      });
    } catch (e) {
      console.error("Error in CounselorSpecializationService.getCounselorSpecializationById:", e);
      return null;
    }
  }

  async createCounselorSpecialization(data: any): Promise<counselorspecializations | null> {
    try {
      return await prisma.counselorspecializations.create({
        data
      });
    } catch (e) {
      console.error("Error in CounselorSpecializationService.createCounselorSpecialization:", e);
      return null;
    }
  }

  async updateCounselorSpecialization(id: number, data: any): Promise<counselorspecializations | null> {
    try {
      return await prisma.counselorspecializations.update({
        where: { id },
        data
      });
    } catch (e) {
      console.error("Error in CounselorSpecializationService.updateCounselorSpecialization:", e);
      return null;
    }
  }

  async deleteCounselorSpecialization(id: number): Promise<void> {
    try {
      await prisma.counselorspecializations.delete({
        where: { id }
      });
    } catch (e) {
      console.error("Error in CounselorSpecializationService.deleteCounselorSpecialization:", e);
    }
  }
}

export default new CounselorSpecializationService();