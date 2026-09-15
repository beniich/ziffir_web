import { Response } from 'express';
import { PayPalWebhookController } from '../controllers/paypal.controller';

describe('PayPalWebhookController', () => {
  let controller: PayPalWebhookController;
  let mockPrisma: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockPrisma = {
      hotel: {
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    controller = new PayPalWebhookController(mockPrisma);
  });

  it('devrait retourner 400 si l id de la ressource PayPal est absent', async () => {
    const req: any = { body: { event_type: 'PAYMENT.SALE.COMPLETED' } };
    await controller.handleWebhook(req, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  it('devrait activer le plan GOLDEN et crediter les tokens lors de BILLING.SUBSCRIPTION.ACTIVATED', async () => {
    const req: any = {
      body: {
        event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
        resource: { id: 'I-SUB12345' },
      },
    };

    mockPrisma.hotel.findFirst.mockResolvedValue({ id: 'hotel-001', name: 'Le Grand Zaphir' });
    mockPrisma.hotel.update.mockResolvedValue({ id: 'hotel-001', plan: 'GOLDEN', subscriptionStatus: 'ACTIVE' });

    await controller.handleWebhook(req, mockRes as Response);

    expect(mockPrisma.hotel.update).toHaveBeenCalledWith({
      where: { id: 'hotel-001' },
      data: expect.objectContaining({
        subscriptionStatus: 'ACTIVE',
        plan: 'GOLDEN',
      }),
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('devrait retrograder en plan FREE et CANCELLED lors de BILLING.SUBSCRIPTION.CANCELLED', async () => {
    const req: any = {
      body: {
        event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
        resource: { id: 'I-SUB12345' },
      },
    };

    mockPrisma.hotel.updateMany.mockResolvedValue({ count: 1 });

    await controller.handleWebhook(req, mockRes as Response);

    expect(mockPrisma.hotel.updateMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { paypalSubscriptionId: 'I-SUB12345' },
          { subscriptionId: 'I-SUB12345' },
        ],
      },
      data: {
        plan: 'FREE',
        subscriptionStatus: 'CANCELLED',
      },
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
