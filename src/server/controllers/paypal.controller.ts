import { Request, Response } from 'express';
import { prisma as defaultPrisma } from '../lib/prisma.js';
import { PrismaClient } from '@prisma/client';

export class PayPalWebhookController {
  private prisma: PrismaClient;

  constructor(prismaInstance?: PrismaClient) {
    this.prisma = prismaInstance || defaultPrisma;
  }

  handleWebhook = async (req: Request, res: Response) => {
    try {
      const event = req.body;
      const subscriptionId = event.resource?.id;

      if (!subscriptionId) {
        return res.status(400).json({ error: 'Identifiant PayPal resource manquant' });
      }

      switch (event.event_type) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
        case 'PAYMENT.SALE.COMPLETED': {
          const hotel = await this.prisma.hotel.findFirst({
            where: {
              OR: [
                { paypalSubscriptionId: subscriptionId },
                { subscriptionId: subscriptionId },
              ],
            },
            include: { owner: true },
          });

          if (hotel) {
            await this.prisma.hotel.update({
              where: { id: hotel.id },
              data: {
                subscriptionStatus: 'ACTIVE',
                plan: 'GOLDEN',
                owner: {
                  update: {
                    tokens: { increment: 10000 },
                  },
                },
              },
            });
          }
          break;
        }

        case 'BILLING.SUBSCRIPTION.CANCELLED':
        case 'BILLING.SUBSCRIPTION.EXPIRED': {
          await this.prisma.hotel.updateMany({
            where: {
              OR: [
                { paypalSubscriptionId: subscriptionId },
                { subscriptionId: subscriptionId },
              ],
            },
            data: {
              plan: 'FREE',
              subscriptionStatus: 'CANCELLED',
            },
          });
          break;
        }

        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
          await this.prisma.hotel.updateMany({
            where: {
              OR: [
                { paypalSubscriptionId: subscriptionId },
                { subscriptionId: subscriptionId },
              ],
            },
            data: {
              subscriptionStatus: 'PAST_DUE',
            },
          });
          break;
        }

        default:
          break;
      }

      return res.status(200).json({ received: true, eventType: event.event_type });
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors du traitement du webhook PayPal' });
    }
  };
}
