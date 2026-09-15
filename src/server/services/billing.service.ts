import { prisma as defaultPrisma } from '../lib/prisma.js';

export class BillingService {
  private db: any;

  constructor(prismaClient: any = defaultPrisma) {
    this.db = prismaClient;
  }

  /**
   * Déduit des jetons du solde utilisateur de manière atomique.
   * Vérifie au préalable la suffisance des crédits.
   */
  async consumeTokens(userId: string, amount: number) {
    if (!userId) {
      throw new Error('Identifiant utilisateur requis');
    }

    if (amount <= 0) {
      throw new Error('Le montant doit être supérieur à zéro');
    }

    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, tokens: true }
    });

    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    const currentBalance = user.tokens ?? 0;
    if (currentBalance < amount) {
      throw new Error(`Solde de jetons insuffisant (${currentBalance} disponible, ${amount} requis)`);
    }

    return await this.db.user.update({
      where: { id: userId },
      data: {
        tokens: { decrement: amount }
      },
      select: { id: true, tokens: true }
    });
  }

  /**
   * Récupère le solde actuel de jetons de l'utilisateur.
   */
  async getBalance(userId: string): Promise<number> {
    if (!userId) {
      throw new Error('Identifiant utilisateur requis');
    }

    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { tokens: true }
    });

    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    return user.tokens ?? 0;
  }

  /**
   * Crédite le compte utilisateur avec un montant de jetons.
   */
  async rechargeTokens(userId: string, amount: number) {
    if (!userId) {
      throw new Error('Identifiant utilisateur requis');
    }

    if (amount <= 0) {
      throw new Error('Le montant de recharge doit être supérieur à zéro');
    }

    return await this.db.user.update({
      where: { id: userId },
      data: {
        tokens: { increment: amount }
      },
      select: { id: true, tokens: true }
    });
  }
}

export const billingService = new BillingService();
