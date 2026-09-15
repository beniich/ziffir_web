import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ZeroTrustService } from '../services/zeroTrust.service';

describe('🛡️ ZeroTrustService (Sprint 1 - Zero Trust Core)', () => {
  let mockPrisma: any;
  let service: ZeroTrustService;

  beforeEach(() => {
    mockPrisma = {
      accessPolicy: {
        findFirst: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
      }
    };
    service = new ZeroTrustService(mockPrisma);
  });

  describe('validateAccess', () => {
    it('should grant access when policy exists and allowed is true', async () => {
      mockPrisma.accessPolicy.findFirst.mockResolvedValue({
        id: 'pol-1',
        userId: 'user-123',
        resourceId: 'res-456',
        action: 'read',
        allowed: true,
      });

      const result = await service.validateAccess('user-123', 'res-456', 'read');
      expect(result).toBe(true);
      expect(mockPrisma.accessPolicy.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          resourceId: 'res-456',
          action: { in: ['read', '*'] }
        }
      });
    });

    it('should throw error when policy does not exist (Default Deny)', async () => {
      mockPrisma.accessPolicy.findFirst.mockResolvedValue(null);

      await expect(service.validateAccess('user-unauthorized', 'res-secret'))
        .rejects
        .toThrow('Accès refusé : Politique Zero Trust');
    });

    it('should throw error when policy explicitly denies access (allowed: false)', async () => {
      mockPrisma.accessPolicy.findFirst.mockResolvedValue({
        id: 'pol-2',
        userId: 'user-blacklisted',
        resourceId: 'res-secret',
        allowed: false,
      });

      await expect(service.validateAccess('user-blacklisted', 'res-secret'))
        .rejects
        .toThrow('Accès refusé : Politique Zero Trust');
    });
  });

  describe('setPolicy & revokePolicy', () => {
    it('should upsert access policy correctly', async () => {
      const mockSaved = {
        id: 'pol-new',
        userId: 'u1',
        resourceId: 'r1',
        action: '*',
        allowed: true,
      };
      mockPrisma.accessPolicy.upsert.mockResolvedValue(mockSaved);

      const policy = await service.setPolicy({
        userId: 'u1',
        resourceId: 'r1',
        action: '*',
        allowed: true,
      });

      expect(policy).toEqual(mockSaved);
      expect(mockPrisma.accessPolicy.upsert).toHaveBeenCalledTimes(1);
    });

    it('should revoke access policies for target resource', async () => {
      mockPrisma.accessPolicy.deleteMany.mockResolvedValue({ count: 1 });

      const count = await service.revokePolicy('u1', 'r1');
      expect(count).toBe(1);
      expect(mockPrisma.accessPolicy.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1', resourceId: 'r1' }
      });
    });
  });
});
