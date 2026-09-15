import { Request, Response } from 'express';
import { TrafficService } from '../services/traffic.service';

export class TrafficController {
  private trafficService: TrafficService;

  constructor(trafficService?: TrafficService) {
    this.trafficService = trafficService || new TrafficService();
  }

  recordTraffic = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const { nodeId, bytesTransferred, latency, protocol, sourceIp } = req.body;

      if (!nodeId || bytesTransferred === undefined) {
        return res.status(400).json({
          success: false,
          error: 'nodeId et bytesTransferred sont requis',
        });
      }

      const log = await this.trafficService.recordTrafficLog({
        tenantId,
        nodeId,
        bytesTransferred: Number(bytesTransferred),
        latency: Number(latency || 0),
        protocol,
        sourceIp: sourceIp || req.ip,
      });

      return res.status(201).json({
        success: true,
        data: log,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de l’enregistrement du trafic',
      });
    }
  };

  getBandwidth = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const timeRange = (req.query.timeRange as string) || '24h';

      const usage = await this.trafficService.getBandwidthUsage(tenantId, timeRange);

      return res.json({
        success: true,
        data: usage,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération de la bande passante',
      });
    }
  };

  getTopNodes = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

      const topNodes = await this.trafficService.getTopNodes(tenantId, limit);

      return res.json({
        success: true,
        data: topNodes,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des nœuds de tête',
      });
    }
  };
}
