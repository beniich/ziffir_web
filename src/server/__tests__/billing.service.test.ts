import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BillingService } from '../services/billing.service';

describe('💳 BillingService (Sprint 1 - Manage & Tokens)', () => {
  let mockPrisma: any;
  let service: BillingService;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      }
    };
    service = new BillingService(mockPrisma);
  });

  describe('consumeTokens', () => {
    it('should decrement tokens atomically when balance is sufficient', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-100',
        tokens: 50,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 'u-100',
        tokens: 40,
      });

      const updated = await service.consumeTokens('u-100', 10);
      expect(updated.tokens).toBe(40);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-100' },
        data: { tokens: { decrement: 10 } },
        select: { id: true, tokens: true }
      });
    });

    it('should throw error when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.consumeTokens('u-not-found', 10))
        .rejects
        .toThrow('Utilisateur introuvable');
    });

    it('should throw error when token balance is insufficient', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-100',
        tokens: 5,
      });

      await expect(service.consumeTokens('u-100', 20))
        .rejects
        .toThrow('Solde de jetons insuffisant');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should reject non-positive token amounts', async () => {
      await expect(service.consumeTokens('u-100', 0))
        .rejects
        .toThrow('Le montant doit être supérieur à zéro');
      await expect(service.consumeTokens('u-100', -5))
        .rejects
        .toThrow('Le montant doit être supérieur à zéro');
    });
  });

  describe('getBalance', () => {
    it('should return token balance for user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-100',
        tokens: 350,
      });

      const balance = await service.getBalance('u-100');
      expect(balance).toBe(350);
    });

    it('should default to 0 if tokens is undefined or null', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-100',
        tokens: null,
      });

      const balance = await service.getBalance('u-100');
      expect(balance).toBe(0);
    });
  });

  describe('rechargeTokens', () => {
    it('should increment tokens balance', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: 'u-100',
        tokens: 500,
      });

      const result = await service.rechargeTokens('u-100', 200);
      expect(result.tokens).toBe(500);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-100' },
        data: { tokens: { increment: 200 } },
        select: { id: true, tokens: true }
      });
    });
  });
});
