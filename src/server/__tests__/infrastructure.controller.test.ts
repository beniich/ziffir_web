import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { infrastructureController } from '../controllers/infrastructure.controller';
import { infrastructureService } from '../services/infrastructure.service';

describe('🏢 InfrastructureController Unit Tests', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.restoreAllMocks();
    req = { body: {}, query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('recordTelemetry', () => {
    it('should return 201 on recorded telemetry', async () => {
      req.body = { assetId: 'a1', temperature: 45.0, vibration: 0.05 };
      jest.spyOn(infrastructureService, 'recordTelemetry').mockResolvedValue({ id: 'tel-1' } as any);

      await infrastructureController.recordTelemetry(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, telemetry: { id: 'tel-1' } });
    });

    it('should return 400 when assetId is missing', async () => {
      req.body = { temperature: 45.0 };

      await infrastructureController.recordTelemetry(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getPrediction', () => {
    it('should return prediction for asset', async () => {
      req.params = { assetId: 'a1' };
      jest.spyOn(infrastructureService, 'predictFailure').mockResolvedValue({
        riskLevel: 'Stable',
        trend: 0.01,
        telemetryPointsAnalyzed: 10,
      });

      await infrastructureController.getPrediction(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        assetId: 'a1',
        prediction: expect.objectContaining({ riskLevel: 'Stable' }),
      });
    });
  });
});
