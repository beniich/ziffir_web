import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../lib/prisma.js';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface WafEventInput {
  tenantId: string;
  type: string;
  severity?: string;
  sourceIp: string;
  targetPath: string;
  blocked?: boolean;
  details?: string;
}

export interface DnsRecordInput {
  tenantId: string;
  name: string;
  type: string;
  value: string;
  ttl?: number;
  proxied?: boolean;
}

interface BucketRecord {
  count: number;
  resetAt: number;
}

export class SecurityService {
  private prisma: PrismaClient;
  private static rateLimitBuckets: Map<string, BucketRecord> = new Map();

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  rateLimitCheck(key: string, limit: number, windowSec: number): RateLimitResult {
    const now = Date.now();
    const bucket = SecurityService.rateLimitBuckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      const resetAt = now + windowSec * 1000;
      SecurityService.rateLimitBuckets.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: Math.max(0, limit - 1),
        resetAt,
      };
    }

    if (bucket.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: bucket.resetAt,
      };
    }

    bucket.count += 1;
    return {
      allowed: true,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt,
    };
  }

  async recordWafEvent(data: WafEventInput) {
    if (!data.tenantId || !data.type || !data.sourceIp || !data.targetPath) {
      throw new Error('Champs obligatoires manquants pour WAF Event');
    }

    return this.prisma.wafEvent.create({
      data: {
        tenantId: data.tenantId,
        type: data.type,
        severity: data.severity || 'MEDIUM',
        sourceIp: data.sourceIp,
        targetPath: data.targetPath,
        blocked: data.blocked !== undefined ? data.blocked : true,
        details: data.details,
      },
    });
  }

  async getWafEvents(
    tenantId: string,
    filters?: { blocked?: boolean; type?: string; limit?: number }
  ) {
    const where: any = { tenantId };
    if (filters?.blocked !== undefined) {
      where.blocked = filters.blocked;
    }
    if (filters?.type) {
      where.type = filters.type;
    }

    return this.prisma.wafEvent.findMany({
      where,
      take: filters?.limit || 50,
      orderBy: { timestamp: 'desc' },
    });
  }

  async createDnsRecord(data: DnsRecordInput) {
    if (!data.tenantId || !data.name || !data.type || !data.value) {
      throw new Error('Champs obligatoires manquants pour DNS Record');
    }

    return this.prisma.dnsRecord.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        type: data.type.toUpperCase(),
        value: data.value,
        ttl: data.ttl || 300,
        proxied: data.proxied !== undefined ? data.proxied : true,
      },
    });
  }

  async listDnsRecords(tenantId: string) {
    return this.prisma.dnsRecord.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async deleteDnsRecord(tenantId: string, id: string) {
    return this.prisma.dnsRecord.delete({
      where: { id },
    });
  }
}
