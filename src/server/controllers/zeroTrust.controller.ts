import { Request, Response } from 'express';
import { zeroTrustService } from '../services/zeroTrust.service.js';

export class ZeroTrustController {
  /**
   * Endpoint de validation d'accès (Zero Trust Challenge)
   */
  async validate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.auth?.sub;
      const { resourceId, action } = req.body;

      if (!userId || !resourceId) {
        res.status(400).json({ error: 'userId et resourceId requis' });
        return;
      }

      await zeroTrustService.validateAccess(userId, resourceId, action || '*');
      res.json({ success: true, allowed: true, userId, resourceId });
    } catch (error: any) {
      res.status(403).json({ success: false, allowed: false, error: error.message });
    }
  }

  /**
   * Création / mise à jour d'une politique Zero Trust
   */
  async setPolicy(req: Request, res: Response): Promise<void> {
    try {
      const { userId, resourceId, action, allowed, conditions, tenantId } = req.body;

      if (!userId || !resourceId) {
        res.status(400).json({ error: 'userId et resourceId sont requis' });
        return;
      }

      const policy = await zeroTrustService.setPolicy({
        userId,
        resourceId,
        action,
        allowed,
        conditions,
        tenantId: tenantId || (req.auth as any)?.hotelId,
      });

      res.status(201).json({ success: true, policy });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Révocation d'une politique
   */
  async revokePolicy(req: Request, res: Response): Promise<void> {
    try {
      const rawUserId = req.params.userId;
      const rawResourceId = req.params.resourceId;
      const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
      const resourceId = Array.isArray(rawResourceId) ? rawResourceId[0] : rawResourceId;

      if (!userId || !resourceId) {
        res.status(400).json({ error: 'Paramètres userId et resourceId requis' });
        return;
      }

      const deletedCount = await zeroTrustService.revokePolicy(userId, resourceId);
      res.json({ success: true, revokedCount: deletedCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Liste des politiques
   */
  async listPolicies(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.query.userId as string) || (req.auth?.sub as string);
      const tenantId = (req.query.tenantId as string) || ((req.auth as any)?.hotelId as string);

      const policies = await zeroTrustService.listPolicies(userId, tenantId);
      res.json({ success: true, count: policies.length, policies });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const zeroTrustController = new ZeroTrustController();
