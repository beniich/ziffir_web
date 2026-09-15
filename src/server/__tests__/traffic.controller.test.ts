import { Response } from 'express';
import { TrafficController } from '../controllers/traffic.controller';

describe('TrafficController', () => {
  let controller: TrafficController;
  let mockTrafficService: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockTrafficService = {
      recordTrafficLog: jest.fn(),
      getBandwidthUsage: jest.fn(),
      getTopNodes: jest.fn(),
    };
    controller = new TrafficController(mockTrafficService);

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('recordTraffic', () => {
    it('renvoie 201 avec le log créé', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        body: {
          nodeId: 'edge-eu-1',
          bytesTransferred: 2048,
          latency: 12.3,
          protocol: 'HTTPS',
        },
      };

      mockTrafficService.recordTrafficLog.mockResolvedValue({
        id: 'log-1',
        nodeId: 'edge-eu-1',
        bytesTransferred: 2048,
      });

      await controller.recordTraffic(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: 'log-1' }),
        })
      );
    });

    it('renvoie 400 si nodeId ou bytesTransferred manquent', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        body: { latency: 12.3 },
      };

      await controller.recordTraffic(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'nodeId et bytesTransferred sont requis',
        })
      );
    });
  });

  describe('getBandwidth', () => {
    it('renvoie 200 avec les métriques d’usage agrégées', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        query: { timeRange: '24h' },
      };

      mockTrafficService.getBandwidthUsage.mockResolvedValue({
        totalBytes: 5000000,
        averageLatencyMs: 25.1,
        requestCount: 400,
        timeRange: '24h',
      });

      await controller.getBandwidth(mockReq, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ totalBytes: 5000000 }),
        })
      );
    });
  });

  describe('getTopNodes', () => {
    it('renvoie 200 avec le classement des nœuds', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        query: { limit: '3' },
      };

      mockTrafficService.getTopNodes.mockResolvedValue([
        { nodeId: 'edge-1', totalBytes: 1000, requestCount: 20 },
      ]);

      await controller.getTopNodes(mockReq, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([expect.objectContaining({ nodeId: 'edge-1' })]),
        })
      );
    });
  });
});
