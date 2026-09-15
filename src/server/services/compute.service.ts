import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../lib/prisma.js';

export interface JobInput {
  tenantId: string;
  name: string;
  type: string;
  payload?: Record<string, unknown>;
}

export class ComputeService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  async submitJob(data: JobInput) {
    if (!data.name || !data.type) {
      throw new Error('name et type sont obligatoires');
    }

    return this.prisma.computeJob.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        type: data.type.toUpperCase(),
        status: 'QUEUED',
        payload: data.payload ? JSON.stringify(data.payload) : null,
      },
    });
  }

  async runJob(jobId: string) {
    const job = await this.prisma.computeJob.findUnique({
      where: { id: jobId },
    });

    if (!job) throw new Error('Job introuvable');

    // Mark as RUNNING
    await this.prisma.computeJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    try {
      // Simulate compute logic based on type
      const output = await this.executeJob(job);

      return this.prisma.computeJob.update({
        where: { id: jobId },
        data: {
          status: 'DONE',
          output: JSON.stringify(output),
          finishedAt: new Date(),
        },
      });
    } catch (error: any) {
      await this.prisma.computeJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          errorMsg: error.message,
          finishedAt: new Date(),
        },
      });
      throw error;
    }
  }

  private async executeJob(job: any): Promise<Record<string, unknown>> {
    const payload = job.payload ? JSON.parse(job.payload) : {};

    switch (job.type) {
      case 'BATCH':
        return {
          processed: 1,
          type: 'batch',
          payload,
          completedAt: new Date().toISOString(),
        };
      case 'CRON':
        return {
          nextRun: new Date(Date.now() + 3600 * 1000).toISOString(),
          payload,
          completedAt: new Date().toISOString(),
        };
      case 'SERVERLESS':
        return {
          invocationId: `inv-${Date.now()}`,
          payload,
          completedAt: new Date().toISOString(),
        };
      default:
        return { completedAt: new Date().toISOString() };
    }
  }

  async listJobs(tenantId: string, filters?: { status?: string; type?: string; limit?: number }) {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    return this.prisma.computeJob.findMany({
      where,
      take: filters?.limit || 50,
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelJob(jobId: string) {
    const job = await this.prisma.computeJob.findUnique({ where: { id: jobId } });

    if (!job) throw new Error('Job introuvable');
    if (job.status === 'DONE' || job.status === 'FAILED') {
      throw new Error("Impossible d'annuler un job termine");
    }

    return this.prisma.computeJob.update({
      where: { id: jobId },
      data: { status: 'CANCELLED', finishedAt: new Date() },
    });
  }
}
