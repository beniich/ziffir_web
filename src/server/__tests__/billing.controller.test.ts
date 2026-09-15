import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { billingController } from '../controllers/billing.controller';
import { billingService } from '../services/billing.service';

describe('💳 BillingController Unit Tests', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.restoreAllMocks();
    req = {
      body: {},
      query: {},
      params: {},
      auth: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('getBalance', () => {
    it('should return 200 and token balance', async () => {
      req.query = { userId: 'u-100' };
      jest.spyOn(billingService, 'getBalance').mockResolvedValue(250);

      await billingController.getBalance(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        userId: 'u-100',
        tokens: 250,
      });
    });

    it('should return 400 when userId is absent', async () => {
      req.query = {};

      await billingController.getBalance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('consume', () => {
    it('should return 200 and consumed tokens info', async () => {
      req.body = { userId: 'u-100', amount: 50 };
      jest.spyOn(billingService, 'consumeTokens').mockResolvedValue({ id: 'u-100', tokens: 200 } as any);

      await billingController.consume(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        consumed: 50,
        remainingTokens: 200,
      });
    });

    it('should return 402 if balance is insufficient', async () => {
      req.body = { userId: 'u-100', amount: 500 };
      jest.spyOn(billingService, 'consumeTokens').mockRejectedValue(new Error('Solde de jetons insuffisant'));

      await billingController.consume(req, res);

      expect(res.status).toHaveBeenCalledWith(402);
      expect(res.json).toHaveBeenCalledWith({ error: 'Solde de jetons insuffisant' });
    });

    it('should return 400 if amount is invalid', async () => {
      req.body = { userId: 'u-100', amount: -10 };

      await billingController.consume(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('recharge', () => {
    it('should return 200 and new balance on recharge', async () => {
      req.body = { userId: 'u-100', amount: 150 };
      jest.spyOn(billingService, 'rechargeTokens').mockResolvedValue({ id: 'u-100', tokens: 400 } as any);

      await billingController.recharge(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        recharged: 150,
        newBalance: 400,
      });
    });
  });
});
