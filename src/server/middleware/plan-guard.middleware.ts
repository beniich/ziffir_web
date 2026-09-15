import { Request, Response, NextFunction } from 'express';
import { prisma as defaultPrisma } from '../lib/prisma.js';
import { Plan, PrismaClient } from '@prisma/client';

export const PLAN_HIERARCHY: Record<Plan, number> = {
  FREE: 0,
  FREE_TRIAL: 1,
  PREMIUM: 2,
  PLATINIUM: 3,
  GOLDEN: 4,
  ENTERPRISE: 5,
};

export const requirePlan = (minimumPlan: Plan, prismaInstance?: PrismaClient) => {
  const db = prismaInstance || defaultPrisma;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = 
        (req.headers['x-tenant-id'] as string) || 
        (req as any).user?.activeHotelId ||
        (req as any).user?.hotelId;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant non spécifié (header x-tenant-id requis).' });
      }

      const hotel = await db.hotel.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          plan: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          isActive: true,
        },
      });

      if (!hotel || !hotel.isActive) {
        return res.status(404).json({ error: 'Tenant inexistant ou inactif.' });
      }

      // 1. Contrôle période d'essai expirée
      if (hotel.plan === 'FREE_TRIAL' && hotel.trialEndsAt && new Date() > hotel.trialEndsAt) {
        return res.status(402).json({
          error: 'Période d essai expirée',
          message: 'Veuillez souscrire un abonnement actif pour continuer.',
        });
      }

      // 2. Contrôle impayé / suspendu
      if (hotel.subscriptionStatus === 'PAST_DUE' || hotel.subscriptionStatus === 'UNPAID') {
        return res.status(402).json({
          error: 'Paiement en attente',
          message: 'Votre compte présente un défaut de paiement.',
        });
      }

      // 3. Contrôle de hiérarchie de plan
      const currentLevel = PLAN_HIERARCHY[hotel.plan] ?? 0;
      const requiredLevel = PLAN_HIERARCHY[minimumPlan] ?? 0;

      if (currentLevel < requiredLevel) {
        return res.status(403).json({
          error: 'Plan insuffisant',
          message: `Cette fonctionnalité requiert au minimum le plan ${minimumPlan}. Plan actuel : ${hotel.plan}`,
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la vérification de l abonnement.' });
    }
  };
};
