import { Request, Response } from 'express';
import { billingService } from '../services/billing.service.js';

export class BillingController {
  /**
   * Consulter le solde de jetons
   */
  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.query.userId as string) || req.auth?.sub;

      if (!userId) {
        res.status(400).json({ error: 'Identifiant utilisateur requis' });
        return;
      }

      const balance = await billingService.getBalance(userId);
      res.json({ success: true, userId, tokens: balance });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Consommer des jetons (ex: après un appel IA ou processing)
   */
  async consume(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.auth?.sub;
      const { amount } = req.body;

      if (!userId) {
        res.status(400).json({ error: 'Identifiant utilisateur requis' });
        return;
      }

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        res.status(400).json({ error: 'Montant de jetons invalide' });
        return;
      }

      const updated = await billingService.consumeTokens(userId, numAmount);
      res.json({
        success: true,
        consumed: numAmount,
        remainingTokens: updated.tokens
      });
    } catch (error: any) {
      const statusCode = error.message.includes('insuffisant') ? 402 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  }

  /**
   * Recharger des jetons
   */
  async recharge(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.auth?.sub;
      const { amount } = req.body;

      if (!userId) {
        res.status(400).json({ error: 'Identifiant utilisateur requis' });
        return;
      }

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        res.status(400).json({ error: 'Montant de recharge invalide' });
        return;
      }

      const updated = await billingService.rechargeTokens(userId, numAmount);
      res.json({
        success: true,
        recharged: numAmount,
        newBalance: updated.tokens
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const billingController = new BillingController();
