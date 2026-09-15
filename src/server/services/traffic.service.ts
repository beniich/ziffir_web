import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../lib/prisma.js';

export interface TrafficLogInput {
  tenantId: string;
  nodeId: string;
  bytesTransferred: number;
  latency: number;
  protocol?: string;
  sourceIp?: string;
}

export interface BandwidthUsageResult {
  totalBytes: number;
  averageLatencyMs: number;
  requestCount: number;
  timeRange: string;
}

export interface TopNodeResult {
  nodeId: string;
  totalBytes: number;
  requestCount: number;
}

export class TrafficService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  async recordTrafficLog(data: TrafficLogInput) {
    if (!data.tenantId || !data.nodeId) {
      throw new Error('tenantId et nodeId obligatoires');
    }

    const created = await this.prisma.trafficLog.create({
      data: {
        tenantId: data.tenantId,
        nodeId: data.nodeId,
        bytesTransferred: BigInt(data.bytesTransferred || 0),
        latency: data.latency,
        protocol: data.protocol || 'HTTPS',
        sourceIp: data.sourceIp,
      },
    });

    return {
      ...created,
      bytesTransferred: Number(created.bytesTransferred),
    };
  }

  async getBandwidthUsage(tenantId: string, timeRange: string = '24h'): Promise<BandwidthUsageResult> {
    const now = new Date();
    let startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (timeRange === '1h') {
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (timeRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const aggregation = await this.prisma.trafficLog.aggregate({
      where: {
        tenantId,
        timestamp: { gte: startDate },
      },
      _sum: { bytesTransferred: true },
      _avg: { latency: true },
      _count: { id: true },
    });

    return {
      totalBytes: aggregation._sum.bytesTransferred ? Number(aggregation._sum.bytesTransferred) : 0,
      averageLatencyMs: aggregation._avg.latency ? Math.round(aggregation._avg.latency * 100) / 100 : 0,
      requestCount: aggregation._count.id || 0,
      timeRange,
    };
  }

  async getTopNodes(tenantId: string, limit: number = 5): Promise<TopNodeResult[]> {
    const groups = await this.prisma.trafficLog.groupBy({
      by: ['nodeId'],
      where: { tenantId },
      _sum: { bytesTransferred: true },
      _count: { id: true },
      orderBy: {
        _sum: {
          bytesTransferred: 'desc',
        },
      },
      take: limit,
    });

    return groups.map((g) => ({
      nodeId: g.nodeId,
      totalBytes: g._sum.bytesTransferred ? Number(g._sum.bytesTransferred) : 0,
      requestCount: g._count.id || 0,
    }));
  }
}
