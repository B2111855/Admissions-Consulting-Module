// @ts-ignore
import {
  PrismaClient,
  users
} from '@prisma/client';
import Paginator from './paginator';

import { CreateUserDto } from '../dtos/user/user.dto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient(); 

class UserService {
  async getAllUsers(
    page: number | string,
    limit: number | string
  ): Promise<{ users: users[]; metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);
      const totalUsersCount = await prisma.users.count();
      const users = await prisma.users.findMany({
        skip: paginator.offset,
        take: paginator.limit,
      });
      const metadata = paginator.getMetadata(totalUsersCount);
      return {
        users,
        metadata,
      };
    } catch (e) {
      console.error('Error in UserService.getAllUsers:', e);
      return null;
    }
  }

  async createUser(userData: CreateUserDto): Promise<users> {
    try {
      const existingUser = await prisma.users.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new Error('Email đã được sử dụng.');
      }

      if (!userData.password) {
        throw new Error('Password is required.');
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);

      let employmentDate: Date | undefined;
      if (
        userData.employment_date !== undefined &&
        userData.employment_date !== null
      ) {
        const parsedDate = new Date(userData.employment_date);
        if (isNaN(parsedDate.getTime())) {
          throw new Error(
            'Invalid employment_date format. Expected a valid date string or Date object.'
          );
        }
        employmentDate = parsedDate;
      }

      let specializationId: number | null = null;
      if (userData.program_type) {
        const programTypeToSpecializationName: Record<string, string> = {
          Aptech: 'Aptech Programs',
          Arena: 'Arena Programs',
          Short_term___Steam: 'Short-term + Steam',
        };

        const specializationName =
          programTypeToSpecializationName[userData.program_type];

        if (specializationName) {
          const specialization =
            await prisma.counselorspecializations.findUnique({
              where: { name: specializationName },
            });

          if (specialization) {
            specializationId = specialization.id;
          } else {
            console.warn(
              `Specialization not found for program_type: ${userData.program_type}`
            );
          }
        }
      }

      const newUser = await prisma.users.create({
        data: {
          email: userData.email,
          password_hash: hashedPassword,
          full_name: userData.full_name,
          user_type: userData.user_type,
          ...(userData.is_main_consultant !== undefined && {
            is_main_consultant: userData.is_main_consultant,
          }),
          ...(userData.kpi_group_id !== undefined && {
            kpi_group_id: userData.kpi_group_id,
          }),
          ...(employmentDate !== undefined && {
            employment_date: employmentDate,
          }),
          ...(userData.status !== undefined && { status: userData.status }),
          ...(userData.program_type !== undefined && {
            program_type: userData.program_type,
          }),
        },
      });

      if (specializationId) {
        await prisma.userspecializations.create({
          data: {
            user_id: newUser.id,
            specialization_id: specializationId,
          },
        });
      }

      return newUser;
    } catch (error) {
      console.error('Error in UserService.createUser:', error);
      throw error;
    }
  }
}

export default new UserService();
