import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { zeroTrustController } from '../controllers/zeroTrust.controller';
import { zeroTrustService } from '../services/zeroTrust.service';

describe('🛡️ ZeroTrustController Unit Tests', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.restoreAllMocks();
    req = {
      body: {},
      query: {},
      params: {},
      auth: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('validate', () => {
    it('should return 200 and allowed: true when authorized', async () => {
      req.body = { userId: 'u1', resourceId: 'res1', action: 'read' };
      jest.spyOn(zeroTrustService, 'validateAccess').mockResolvedValue(true);

      await zeroTrustController.validate(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        allowed: true,
        userId: 'u1',
        resourceId: 'res1',
      });
    });

    it('should return 403 when access is denied', async () => {
      req.body = { userId: 'u-attacker', resourceId: 'res1' };
      jest.spyOn(zeroTrustService, 'validateAccess').mockRejectedValue(new Error('Accès refusé : Politique Zero Trust'));

      await zeroTrustController.validate(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, allowed: false })
      );
    });

    it('should return 400 when parameters are missing', async () => {
      req.body = {};

      await zeroTrustController.validate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('setPolicy', () => {
    it('should return 201 with created policy', async () => {
      req.body = { userId: 'u1', resourceId: 'res1', allowed: true };
      const mockPolicy = { id: 'p1', userId: 'u1', resourceId: 'res1', allowed: true };
      jest.spyOn(zeroTrustService, 'setPolicy').mockResolvedValue(mockPolicy as any);

      await zeroTrustController.setPolicy(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, policy: mockPolicy });
    });
  });

  describe('revokePolicy', () => {
    it('should return revoked count', async () => {
      req.params = { userId: 'u1', resourceId: 'res1' };
      jest.spyOn(zeroTrustService, 'revokePolicy').mockResolvedValue(1);

      await zeroTrustController.revokePolicy(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, revokedCount: 1 });
    });
  });
});
