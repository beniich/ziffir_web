import { Response } from 'express';
import { requirePlan, PLAN_HIERARCHY } from '../middleware/plan-guard.middleware';

describe('requirePlan Middleware', () => {
  let mockPrisma: any;
  let mockRes: Partial<Response>;
  let nextFn: jest.Mock;

  beforeEach(() => {
    mockPrisma = {
      hotel: {
        findUnique: jest.fn(),
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    nextFn = jest.fn();
  });

  it('devrait retourner 400 si aucun tenantId n est fourni', async () => {
    const middleware = requirePlan('GOLDEN', mockPrisma);
    const req: any = { headers: {} };

    await middleware(req, mockRes as Response, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('devrait retourner 403 si le plan du tenant est inferieur au plan requis', async () => {
    const middleware = requirePlan('GOLDEN', mockPrisma);
    const req: any = { headers: { 'x-tenant-id': 'hotel-001' } };

    mockPrisma.hotel.findUnique.mockResolvedValue({
      id: 'hotel-001',
      plan: 'PREMIUM', // Inférieur à GOLDEN
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    });

    await middleware(req, mockRes as Response, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('devrait retourner 402 si la souscription a un statut impaye ou past_due', async () => {
    const middleware = requirePlan('PREMIUM', mockPrisma);
    const req: any = { headers: { 'x-tenant-id': 'hotel-001' } };

    mockPrisma.hotel.findUnique.mockResolvedValue({
      id: 'hotel-001',
      plan: 'GOLDEN',
      subscriptionStatus: 'PAST_DUE',
      isActive: true,
    });

    await middleware(req, mockRes as Response, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(402);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('devrait appeler next() si le plan est suffisant et actif', async () => {
    const middleware = requirePlan('PLATINIUM', mockPrisma);
    const req: any = { headers: { 'x-tenant-id': 'hotel-001' } };

    mockPrisma.hotel.findUnique.mockResolvedValue({
      id: 'hotel-001',
      plan: 'GOLDEN', // Supérieur à PLATINIUM
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    });

    await middleware(req, mockRes as Response, nextFn);

    expect(nextFn).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });
});
