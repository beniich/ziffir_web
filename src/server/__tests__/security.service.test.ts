import { SecurityService } from '../services/security.service';

describe('SecurityService', () => {
  let service: SecurityService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      wafEvent: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      dnsRecord: {
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new SecurityService(mockPrisma);
  });

  describe('rateLimitCheck', () => {
    it('autorise les requêtes sous la limite', () => {
      const key = 'user-test-1';
      const limit = 3;
      const windowSec = 10;

      const r1 = service.rateLimitCheck(key, limit, windowSec);
      const r2 = service.rateLimitCheck(key, limit, windowSec);
      const r3 = service.rateLimitCheck(key, limit, windowSec);

      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);
    });

    it('bloque les requêtes au-delà de la limite', () => {
      const key = 'user-test-2';
      const limit = 2;
      const windowSec = 10;

      service.rateLimitCheck(key, limit, windowSec);
      service.rateLimitCheck(key, limit, windowSec);
      const r3 = service.rateLimitCheck(key, limit, windowSec);

      expect(r3.allowed).toBe(false);
      expect(r3.remaining).toBe(0);
    });
  });

  describe('recordWafEvent', () => {
    it('enregistre une alerte WAF', async () => {
      const eventData = {
        tenantId: 'tenant-1',
        type: 'SQLI',
        severity: 'HIGH',
        sourceIp: '1.2.3.4',
        targetPath: '/api/login',
        blocked: true,
        details: 'UNION SELECT detected',
      };

      mockPrisma.wafEvent.create.mockResolvedValue({
        id: 'waf-1',
        ...eventData,
        timestamp: new Date(),
      });

      const res = await service.recordWafEvent(eventData);

      expect(mockPrisma.wafEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ type: 'SQLI', sourceIp: '1.2.3.4' }),
      });
      expect(res.id).toBe('waf-1');
    });
  });

  describe('getWafEvents', () => {
    it('liste les événements WAF filtrés', async () => {
      mockPrisma.wafEvent.findMany.mockResolvedValue([
        { id: 'waf-1', type: 'XSS', blocked: true },
        { id: 'waf-2', type: 'SQLI', blocked: true },
      ]);

      const events = await service.getWafEvents('tenant-1', { blocked: true, limit: 10 });

      expect(mockPrisma.wafEvent.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', blocked: true },
        take: 10,
        orderBy: { timestamp: 'desc' },
      });
      expect(events).toHaveLength(2);
    });
  });

  describe('dnsOperations', () => {
    it('crée un enregistrement DNS', async () => {
      mockPrisma.dnsRecord.create.mockResolvedValue({
        id: 'dns-1',
        tenantId: 'tenant-1',
        name: 'api.example.com',
        type: 'A',
        value: '1.2.3.4',
        ttl: 300,
        proxied: true,
      });

      const res = await service.createDnsRecord({
        tenantId: 'tenant-1',
        name: 'api.example.com',
        type: 'A',
        value: '1.2.3.4',
      });

      expect(res.id).toBe('dns-1');
      expect(res.name).toBe('api.example.com');
    });

    it('liste les enregistrements DNS par tenant', async () => {
      mockPrisma.dnsRecord.findMany.mockResolvedValue([
        { id: 'dns-1', name: 'api.example.com' },
      ]);

      const records = await service.listDnsRecords('tenant-1');
      expect(records).toHaveLength(1);
    });
  });
});
