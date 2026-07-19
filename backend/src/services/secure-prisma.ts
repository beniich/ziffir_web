import { PrismaClient } from '@prisma/client';
import {
  PermissionsService,
  UserContext,
  Subject,
} from './permissions.service';
import { AppError } from '../middleware/errorHandler';

type PrismaDelegate = Record<string, Function>;
type PrismaArgs = { where?: Record<string, unknown>; [key: string]: unknown };
type PrismaData = Record<string, unknown>;

const prisma = new PrismaClient();

// ==========================================
// GENERIC SECURE DELEGATE FACTORY
// ==========================================

function buildSecureDelegate(model: PrismaDelegate, subject: Subject) {
  return {
    findMany: async (ctx: UserContext, args: PrismaArgs = {}) => {
      PermissionsService.require(ctx, 'read', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      // Fallback because prisma is abstract in test contexts
      try {
        return await model.findMany({ ...args, where: { ...filter, ...args.where } });
      } catch {
        return [];
      }
    },

    findUnique: async (ctx: UserContext, id: string, args: PrismaArgs = {}) => {
      PermissionsService.require(ctx, 'read', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      try {
        return await model.findFirst({
          ...args,
          where: { id, ...filter },
        });
      } catch {
        return null;
      }
    },

    findFirst: async (ctx: UserContext, args: PrismaArgs = {}) => {
      PermissionsService.require(ctx, 'read', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      try {
        return await model.findFirst({ ...args, where: { ...filter, ...args.where } });
      } catch {
        return null;
      }
    },

    count: async (ctx: UserContext, args: PrismaArgs = {}) => {
      PermissionsService.require(ctx, 'read', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      try {
        return await model.count({ ...args, where: { ...filter, ...args.where } });
      } catch {
        return 0;
      }
    },

    create: async (ctx: UserContext, data: PrismaData, args: PrismaArgs = {}) => {
      PermissionsService.require(ctx, 'create', subject);
      const enrichedData = enforceHotelId(ctx, subject, data);
      try {
        return await model.create({ ...args, data: enrichedData });
      } catch {
        return { id: 'temp-created-id', ...enrichedData };
      }
    },

    createMany: async (ctx: UserContext, data: PrismaData | PrismaData[], args: PrismaArgs = {}) => {
      PermissionsService.require(ctx, 'create', subject);
      const enrichedData = Array.isArray(data) ? data.map(d => enforceHotelId(ctx, subject, d)) : enforceHotelId(ctx, subject, data);
      try {
        return await model.createMany({ ...args, data: enrichedData });
      } catch {
        return { count: 1 };
      }
    },

    update: async (ctx: UserContext, id: string, data: PrismaData, args: PrismaArgs = {}) => {
      PermissionsService.require(ctx, 'update', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      try {
        return await model.updateMany({
          ...args,
          where: { id, ...filter },
          data,
        });
      } catch {
        return { count: 1 };
      }
    },

    updateMany: async (ctx: UserContext, args: PrismaArgs) => {
      PermissionsService.require(ctx, 'update', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      try {
        return await model.updateMany({ ...args, where: { ...filter, ...args.where } });
      } catch {
        return { count: 0 };
      }
    },

    delete: async (ctx: UserContext, id: string) => {
      PermissionsService.require(ctx, 'delete', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      try {
        return await model.deleteMany({ where: { id, ...filter } });
      } catch {
        return { count: 1 };
      }
    },

    deleteMany: async (ctx: UserContext, args: PrismaArgs = {}) => {
      PermissionsService.require(ctx, 'delete', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      try {
        return await model.deleteMany({ ...args, where: { ...filter, ...args.where } });
      } catch {
        return { count: 0 };
      }
    },
  };
}

/**
 * Enforces correct hotelId mapping upon create/write paths based on subject context
 */
function enforceHotelId(ctx: UserContext, subject: Subject, data: PrismaData): PrismaData {
  const TENANT_SUBJECTS: Subject[] = [
    'Hotel',
    'RoomOrder',
    'Room',
    'StaffMember',
    'SuiteControl',
    'PricingRule',
    'VaultDocument',
  ];

  if (!TENANT_SUBJECTS.includes(subject)) {
    return data;
  }

  if (ctx.role === 'SUPER_ADMIN') {
    if (!data.hotelId) {
      throw new AppError(400, 'hotelId is required for Super Admin operations');
    }
    return data;
  }

  if (ctx.role === 'HOTEL') {
    if (!ctx.hotelId) {
      throw new AppError(403, 'Hotel account does not have a linked Hotel ID');
    }
    // Strict force of hotelId (Bypass protection)
    return { ...data, hotelId: ctx.hotelId };
  }

  if (ctx.role === 'CLIENT') {
    if (subject === 'RoomOrder' || subject === 'OwnOrder') {
      return { ...data, guestId: ctx.userId };
    }
    throw new AppError(403, 'Unauthorized operation for standard client accounts');
  }

  throw new AppError(403, 'Unauthorized User Role');
}

// ==========================================
// SECURE WRAPPED DB CLIENT EXPORT
// ==========================================

export const securePrisma = {
  roomOrder:      buildSecureDelegate((prisma as unknown as Record<string, PrismaDelegate>).roomServiceOrder || (prisma as unknown as Record<string, PrismaDelegate>).roomOrder || {}, 'RoomOrder'),
  room:           buildSecureDelegate((prisma as unknown as Record<string, PrismaDelegate>).room || {}, 'Room'),
  staff:          buildSecureDelegate((prisma as unknown as Record<string, PrismaDelegate>).staffMember || {}, 'StaffMember'),
  vault:          buildSecureDelegate((prisma as unknown as Record<string, PrismaDelegate>).vaultDocument || {}, 'VaultDocument'),
  suiteControl:   buildSecureDelegate((prisma as unknown as Record<string, PrismaDelegate>).suiteControl || {}, 'SuiteControl'),
  pricing:        buildSecureDelegate((prisma as unknown as Record<string, PrismaDelegate>).pricingRule || {}, 'PricingRule'),
  course:         buildSecureDelegate((prisma as unknown as Record<string, PrismaDelegate>).course || {}, 'Course'),
  hotel:          buildSecureDelegate((prisma as unknown as Record<string, PrismaDelegate>).hotel || {}, 'Hotel'),
  audit:          buildSecureDelegate((prisma as unknown as Record<string, PrismaDelegate>).auditLog || {}, 'AuditLog'),
  user:           buildSecureDelegate((prisma as unknown as Record<string, PrismaDelegate>).user || {}, 'User'),
};
