import { Response } from 'express';
import { AiController } from '../controllers/ai.controller';

describe('AiController', () => {
  let controller: AiController;
  let mockAiService: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockAiService = {
      analyzeTrafficLogs: jest.fn(),
      detectAnomalies: jest.fn(),
      getAnalysisHistory: jest.fn(),
    };
    controller = new AiController(mockAiService);

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('analyzeTrafficLogs', () => {
    it('renvoie 200 avec le resultat de Gemini', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        body: {
          logs: [
            { nodeId: 'edge-eu-1', latency: 200, bytesTransferred: 10000, timestamp: new Date() },
          ],
        },
      };

      mockAiService.analyzeTrafficLogs.mockResolvedValue({
        summary: 'Trafic stable',
        anomalies: [],
        recommendations: [],
      });

      await controller.analyzeTrafficLogs(mockReq, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ summary: 'Trafic stable' }),
        })
      );
    });

    it('renvoie 400 si logs est vide', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        body: { logs: [] },
      };

      await controller.analyzeTrafficLogs(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('renvoie 400 si logs est absent', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        body: {},
      };

      await controller.analyzeTrafficLogs(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('detectAnomalies', () => {
    it('renvoie 200 avec les anomalies detectees', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        body: { errorRate: 0.05, avgLatency: 300, totalRequests: 5000 },
      };

      mockAiService.detectAnomalies.mockResolvedValue({
        summary: 'Latence moderement elevee',
        anomalies: [{ type: 'LATENCY', severity: 'MEDIUM' }],
        recommendations: ['Verifier les timeouts'],
      });

      await controller.detectAnomalies(mockReq, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ anomalies: expect.any(Array) }),
        })
      );
    });

    it('renvoie 400 si errorRate manquant', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        body: { avgLatency: 300, totalRequests: 5000 },
      };

      await controller.detectAnomalies(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAnalysisHistory', () => {
    it('renvoie 200 avec la liste des analyses', async () => {
      const mockReq: any = {
        auth: { hotelId: 'tenant-1' },
        query: { limit: '5' },
      };

      mockAiService.getAnalysisHistory.mockResolvedValue([
        { id: 'ai-1', type: 'LOG_ANALYSIS', status: 'DONE' },
      ]);

      await controller.getAnalysisHistory(mockReq, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ id: 'ai-1' }),
          ]),
        })
      );
    });
  });
});
