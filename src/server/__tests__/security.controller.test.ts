import { Response } from 'express';
import { SecurityController } from '../controllers/security.controller';

describe('SecurityController', () => {
  let controller: SecurityController;
  let mockSecurityService: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockSecurityService = {
      rateLimitCheck: jest.fn(),
      recordWafEvent: jest.fn(),
      getWafEvents: jest.fn(),
      createDnsRecord: jest.fn(),
      listDnsRecords: jest.fn(),
      deleteDnsRecord: jest.fn(),
    };
    controller = new SecurityController(mockSecurityService);

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('checkRateLimit', () => {
    it('renvoie 200 si la limite est respectée', async () => {
      const mockReq: any = {
        auth: { userId: 'user-1' },
        ip: '127.0.0.1',
        query: { limit: '10', windowSec: '60' },
      };

      mockSecurityService.rateLimitCheck.mockReturnValue({
        allowed: true,
        remaining: 9,
        resetAt: Date.now() + 60000,
      });

      await controller.checkRateLimit(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ allowed: true, remaining: 9 }),
        })
      );
    });

    it('renvoie 429 si la limite est dépassée', async () => {
      const mockReq: any = {
        auth: { userId: 'user-1' },
        ip: '127.0.0.1',
        query: {},
      };

      mockSecurityService.rateLimitCheck.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 10000,
      });

      await controller.checkRateLimit(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Trop de requêtes, réessayez plus tard.',
        })
      );
    });
  });

  describe('recordWafEvent', () => {
    it('renvoie 201 avec l’événement WAF consigné', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        ip: '10.0.0.1',
        body: {
          type: 'SQLI',
          targetPath: '/api/admin',
          blocked: true,
        },
      };

      mockSecurityService.recordWafEvent.mockResolvedValue({
        id: 'waf-1',
        type: 'SQLI',
      });

      await controller.recordWafEvent(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: 'waf-1' }),
        })
      );
    });
  });

  describe('createDnsRecord', () => {
    it('renvoie 201 avec le DNS créé', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        body: {
          name: 'app.example.com',
          type: 'A',
          value: '192.0.2.1',
        },
      };

      mockSecurityService.createDnsRecord.mockResolvedValue({
        id: 'dns-1',
        name: 'app.example.com',
      });

      await controller.createDnsRecord(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: 'dns-1' }),
        })
      );
    });
  });
});
