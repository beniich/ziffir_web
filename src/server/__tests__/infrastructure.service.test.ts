import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { InfrastructureService } from '../services/infrastructure.service';

describe('🏢 InfrastructureService (Sprint 2 - CAFM & Predictive Maintenance)', () => {
  let mockPrisma: any;
  let service: InfrastructureService;

  beforeEach(() => {
    mockPrisma = {
      asset: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      telemetry: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      }
    };
    service = new InfrastructureService(mockPrisma);
  });

  describe('recordTelemetry', () => {
    it('should create a telemetry record and return it', async () => {
      const mockRecord = {
        id: 'tel-1',
        assetId: 'asset-100',
        temperature: 42.5,
        vibration: 0.04,
        timestamp: new Date(),
      };
      mockPrisma.telemetry.create.mockResolvedValue(mockRecord);

      const result = await service.recordTelemetry({
        assetId: 'asset-100',
        temperature: 42.5,
        vibration: 0.04,
      });

      expect(result).toEqual(mockRecord);
      expect(mockPrisma.telemetry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assetId: 'asset-100',
          temperature: 42.5,
          vibration: 0.04,
        })
      });
    });
  });

  describe('predictFailure', () => {
    it('should return "Données insuffisantes" when less than 2 points are available', async () => {
      mockPrisma.telemetry.findMany.mockResolvedValue([
        { temperature: 40.0, vibration: 0.02, timestamp: new Date() }
      ]);

      const prediction = await service.predictFailure('asset-100');
      expect(prediction.riskLevel).toBe('Données insuffisantes');
      expect(prediction.trend).toBe(0);
    });

    it('should classify as "Risque Élevé" when temperature trend exceeds 10%', async () => {
      // Recent points (descending order by timestamp)
      const telemetries = [
        { temperature: 55.0, vibration: 0.02, timestamp: new Date('2026-09-14T12:00:00Z') }, // newest
        { temperature: 45.0, vibration: 0.02, timestamp: new Date('2026-09-14T11:00:00Z') }, // oldest
      ];
      mockPrisma.telemetry.findMany.mockResolvedValue(telemetries);

      const prediction = await service.predictFailure('asset-100');
      expect(prediction.riskLevel).toBe('Risque Élevé');
      expect(prediction.trend).toBeGreaterThan(0.1);
    });

    it('should classify as "Risque Modéré" when trend is between 5% and 10%', async () => {
      const telemetries = [
        { temperature: 42.8, vibration: 0.02, timestamp: new Date('2026-09-14T12:00:00Z') },
        { temperature: 40.0, vibration: 0.02, timestamp: new Date('2026-09-14T11:00:00Z') },
      ];
      mockPrisma.telemetry.findMany.mockResolvedValue(telemetries);

      const prediction = await service.predictFailure('asset-100');
      expect(prediction.riskLevel).toBe('Risque Modéré');
    });

    it('should classify as "Stable" when temperature and vibration are steady', async () => {
      const telemetries = [
        { temperature: 40.2, vibration: 0.02, timestamp: new Date('2026-09-14T12:00:00Z') },
        { temperature: 40.0, vibration: 0.02, timestamp: new Date('2026-09-14T11:00:00Z') },
      ];
      mockPrisma.telemetry.findMany.mockResolvedValue(telemetries);

      const prediction = await service.predictFailure('asset-100');
      expect(prediction.riskLevel).toBe('Stable');
    });
  });

  describe('getAssetHealth', () => {
    it('should return asset summary with latest telemetry and prediction', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue({
        id: 'asset-100',
        name: 'Cooling Unit 1',
        type: 'CHILLER',
        status: 'OPERATIONAL',
      });

      mockPrisma.telemetry.findMany.mockResolvedValue([
        { temperature: 40.0, vibration: 0.02, timestamp: new Date() },
        { temperature: 39.8, vibration: 0.02, timestamp: new Date() }
      ]);

      const health = await service.getAssetHealth('asset-100');
      expect(health.asset.name).toBe('Cooling Unit 1');
      expect(health.prediction.riskLevel).toBe('Stable');
      expect(health.latestTelemetry).toBeDefined();
    });
  });
});
