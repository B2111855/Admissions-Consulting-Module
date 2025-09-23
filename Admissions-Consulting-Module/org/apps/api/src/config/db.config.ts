// db/database.ts
import { PrismaClient } from '@prisma/client';

class Database {
  private static instance: Database;
  public prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('📦 Connected to Prisma database successfully!');
    } catch (error) {
      console.error('❌ Could not connect to Prisma database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('🔌 Disconnected from Prisma database.');
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const database = Database.getInstance();
export const prisma = database.prisma;
