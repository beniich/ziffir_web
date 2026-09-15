import { AiService } from '../services/ai.service';

// Mock Gemini SDK
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () =>
              JSON.stringify({
                summary: 'Analyse complete des logs detectant 2 anomalies critiques.',
                anomalies: [
                  { type: 'SPIKE_LATENCY', severity: 'HIGH', nodeId: 'edge-eu-1' },
                  { type: 'HIGH_ERROR_RATE', severity: 'MEDIUM', path: '/api/auth' },
                ],
                recommendations: ['Augmenter la capacite du noeud edge-eu-1', 'Investiguer /api/auth'],
              }),
            usageMetadata: { promptTokenCount: 250, candidatesTokenCount: 180 },
          },
        }),
      }),
    })),
  };
});

describe('AiService', () => {
  let service: AiService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      aiAnalysis: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    service = new AiService(mockPrisma);
  });

  describe('analyzeTrafficLogs', () => {
    it('envoie les logs a Gemini et sauvegarde avec statut DONE', async () => {
      const createdRecord = { id: 'ai-1', status: 'PENDING', tenantId: 'tenant-1' };

      mockPrisma.aiAnalysis.create.mockResolvedValue(createdRecord);
      mockPrisma.aiAnalysis.update.mockResolvedValue({ ...createdRecord, status: 'DONE', result: '{}' });

      const logs = [
        { nodeId: 'edge-eu-1', latency: 980, bytesTransferred: 5000000, timestamp: new Date() },
        { nodeId: 'edge-us-1', latency: 24, bytesTransferred: 1000000, timestamp: new Date() },
      ];

      const result = await service.analyzeTrafficLogs('tenant-1', logs);

      expect(mockPrisma.aiAnalysis.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          type: 'LOG_ANALYSIS',
          status: 'PENDING',
        }),
      });
      expect(mockPrisma.aiAnalysis.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ai-1' },
          data: expect.objectContaining({ status: 'DONE' }),
        })
      );
      expect(result.summary).toBeDefined();
    });

    it('marque FAILED si Gemini echoue', async () => {
      mockPrisma.aiAnalysis.create.mockResolvedValue({ id: 'ai-2', status: 'PENDING' });
      mockPrisma.aiAnalysis.update.mockResolvedValue({ id: 'ai-2', status: 'FAILED' });

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockImplementationOnce(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockRejectedValue(new Error('Quota exceeded')),
        }),
      }));

      const freshService = new AiService(mockPrisma);

      await expect(freshService.analyzeTrafficLogs('tenant-1', [])).rejects.toThrow();

      expect(mockPrisma.aiAnalysis.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED' }),
        })
      );
    });
  });

  describe('detectAnomalies', () => {
    it('retourne les anomalies detectees par Gemini', async () => {
      mockPrisma.aiAnalysis.create.mockResolvedValue({ id: 'ai-3', status: 'PENDING' });
      mockPrisma.aiAnalysis.update.mockResolvedValue({ id: 'ai-3', status: 'DONE', result: '{}' });

      const metrics = {
        errorRate: 0.15,
        avgLatency: 850,
        totalRequests: 10000,
        topErrors: [{ path: '/api/login', count: 1500 }],
      };

      const result = await service.detectAnomalies('tenant-1', metrics);
      expect(result.anomalies).toBeDefined();
      expect(Array.isArray(result.anomalies)).toBe(true);
    });
  });

  describe('getAnalysisHistory', () => {
    it("liste l'historique des analyses pour un tenant", async () => {
      mockPrisma.aiAnalysis.findMany.mockResolvedValue([
        { id: 'ai-1', type: 'LOG_ANALYSIS', status: 'DONE' },
        { id: 'ai-2', type: 'ANOMALY_DETECTION', status: 'DONE' },
      ]);

      const history = await service.getAnalysisHistory('tenant-1', 10);

      expect(mockPrisma.aiAnalysis.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(history).toHaveLength(2);
    });
  });
});
