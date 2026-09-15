import { TrafficService } from '../services/traffic.service';

describe('TrafficService', () => {
  let service: TrafficService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      trafficLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
    };
    service = new TrafficService(mockPrisma);
  });

  describe('recordTrafficLog', () => {
    it('enregistre un log de trafic avec succès', async () => {
      const data = {
        tenantId: 'tenant-1',
        nodeId: 'edge-eu-west-1',
        bytesTransferred: 1048576,
        latency: 14.5,
        protocol: 'HTTPS',
        sourceIp: '192.168.1.1',
      };

      mockPrisma.trafficLog.create.mockResolvedValue({
        id: 'log-1',
        ...data,
        bytesTransferred: BigInt(data.bytesTransferred),
        timestamp: new Date(),
      });

      const result = await service.recordTrafficLog(data);

      expect(mockPrisma.trafficLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          nodeId: 'edge-eu-west-1',
        }),
      });
      expect(result.id).toBe('log-1');
      expect(result.bytesTransferred).toBe(1048576);
    });

    it('rejette si les paramètres obligatoires sont absents', async () => {
      await expect(
        service.recordTrafficLog({
          tenantId: '',
          nodeId: 'edge-1',
          bytesTransferred: 100,
          latency: 10,
        })
      ).rejects.toThrow('tenantId et nodeId obligatoires');
    });
  });

  describe('getBandwidthUsage', () => {
    it('agrège le volume total et la latence moyenne', async () => {
      mockPrisma.trafficLog.aggregate.mockResolvedValue({
        _sum: { bytesTransferred: BigInt(5000000) },
        _avg: { latency: 22.4 },
        _count: { id: 150 },
      });

      const result = await service.getBandwidthUsage('tenant-1', '24h');

      expect(mockPrisma.trafficLog.aggregate).toHaveBeenCalled();
      expect(result.totalBytes).toBe(5000000);
      expect(result.averageLatencyMs).toBe(22.4);
      expect(result.requestCount).toBe(150);
    });

    it('gère le cas où aucun log n’existe', async () => {
      mockPrisma.trafficLog.aggregate.mockResolvedValue({
        _sum: { bytesTransferred: null },
        _avg: { latency: null },
        _count: { id: 0 },
      });

      const result = await service.getBandwidthUsage('tenant-1', '7d');

      expect(result.totalBytes).toBe(0);
      expect(result.averageLatencyMs).toBe(0);
      expect(result.requestCount).toBe(0);
    });
  });

  describe('getTopNodes', () => {
    it('retourne les nœuds triés par volume', async () => {
      mockPrisma.trafficLog.groupBy.mockResolvedValue([
        {
          nodeId: 'edge-eu-1',
          _sum: { bytesTransferred: BigInt(3000) },
          _count: { id: 10 },
        },
        {
          nodeId: 'edge-us-1',
          _sum: { bytesTransferred: BigInt(1000) },
          _count: { id: 5 },
        },
      ]);

      const result = await service.getTopNodes('tenant-1', 5);

      expect(result).toHaveLength(2);
      expect(result[0].nodeId).toBe('edge-eu-1');
      expect(result[0].totalBytes).toBe(3000);
      expect(result[0].requestCount).toBe(10);
    });
  });
});
