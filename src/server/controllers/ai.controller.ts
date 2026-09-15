import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';

export class AiController {
  private aiService: AiService;

  constructor(aiService?: AiService) {
    this.aiService = aiService || new AiService();
  }

  analyzeTrafficLogs = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const { logs } = req.body;

      if (!Array.isArray(logs) || logs.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'logs doit être un tableau non vide',
        });
      }

      const result = await this.aiService.analyzeTrafficLogs(tenantId, logs);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de l\'analyse des logs',
      });
    }
  };

  detectAnomalies = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const { errorRate, avgLatency, totalRequests, topErrors } = req.body;

      if (errorRate === undefined || avgLatency === undefined || totalRequests === undefined) {
        return res.status(400).json({
          success: false,
          error: 'errorRate, avgLatency et totalRequests sont requis',
        });
      }

      const result = await this.aiService.detectAnomalies(tenantId, {
        errorRate: Number(errorRate),
        avgLatency: Number(avgLatency),
        totalRequests: Number(totalRequests),
        topErrors,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la détection d\'anomalies',
      });
    }
  };

  getAnalysisHistory = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const limit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 20;

      const history = await this.aiService.getAnalysisHistory(tenantId, limit);

      return res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération de l\'historique',
      });
    }
  };
}
