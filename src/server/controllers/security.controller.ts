import { Request, Response } from 'express';
import { SecurityService } from '../services/security.service';

export class SecurityController {
  private securityService: SecurityService;

  constructor(securityService?: SecurityService) {
    this.securityService = securityService || new SecurityService();
  }

  checkRateLimit = async (req: Request, res: Response) => {
    try {
      const key = (req as any).auth?.userId || req.ip || 'anonymous';
      const limit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 60;
      const windowSec = req.query?.windowSec ? parseInt(req.query.windowSec as string, 10) : 60;

      const result = this.securityService.rateLimitCheck(key, limit, windowSec);

      if (!result.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Trop de requêtes, réessayez plus tard.',
          data: result,
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la vérification du rate limit',
      });
    }
  };

  recordWafEvent = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const { type, severity, targetPath, blocked, details } = req.body;

      if (!type || !targetPath) {
        return res.status(400).json({
          success: false,
          error: 'type et targetPath sont requis',
        });
      }

      const event = await this.securityService.recordWafEvent({
        tenantId,
        type,
        severity,
        sourceIp: req.ip || '0.0.0.0',
        targetPath,
        blocked: blocked !== undefined ? Boolean(blocked) : true,
        details,
      });

      return res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de l’enregistrement WAF',
      });
    }
  };

  getWafEvents = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const blocked = req.query.blocked !== undefined ? req.query.blocked === 'true' : undefined;
      const type = req.query.type as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const events = await this.securityService.getWafEvents(tenantId, { blocked, type, limit });

      return res.json({
        success: true,
        data: events,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des événements WAF',
      });
    }
  };

  createDnsRecord = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const { name, type, value, ttl, proxied } = req.body;

      if (!name || !type || !value) {
        return res.status(400).json({
          success: false,
          error: 'name, type et value sont requis',
        });
      }

      const record = await this.securityService.createDnsRecord({
        tenantId,
        name,
        type,
        value,
        ttl: ttl ? parseInt(ttl, 10) : 300,
        proxied: proxied !== undefined ? Boolean(proxied) : true,
      });

      return res.status(201).json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la création de l’enregistrement DNS',
      });
    }
  };

  listDnsRecords = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const records = await this.securityService.listDnsRecords(tenantId);

      return res.json({
        success: true,
        data: records,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des enregistrements DNS',
      });
    }
  };

  deleteDnsRecord = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).auth?.hotelId || (req as any).auth?.tenantId || (req as any).auth?.userId || 'default';
      const id = String(req.params.id);

      await this.securityService.deleteDnsRecord(tenantId, id);

      return res.json({
        success: true,
        message: 'Enregistrement DNS supprimé',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la suppression de l’enregistrement DNS',
      });
    }
  };
}
