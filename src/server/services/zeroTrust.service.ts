import { prisma as defaultPrisma } from '../lib/prisma.js';

export interface SetPolicyInput {
  userId: string;
  resourceId: string;
  action?: string;
  allowed?: boolean;
  tenantId?: string;
  conditions?: Record<string, unknown>;
}

export class ZeroTrustService {
  private db: any;

  constructor(prismaClient: any = defaultPrisma) {
    this.db = prismaClient;
  }

  /**
   * Valide l'accès Zero Trust pour un utilisateur et une ressource.
   * Modèle 'Default Deny' : sans politique explicite autorisée, l'accès est rejeté.
   */
  async validateAccess(userId: string, resourceId: string, action: string = '*'): Promise<boolean> {
    if (!userId || !resourceId) {
      throw new Error('Accès refusé : Identifiants manquants');
    }

    const policy = await this.db.accessPolicy.findFirst({
      where: {
        userId,
        resourceId,
        action: { in: [action, '*'] }
      }
    });

    if (!policy || !policy.allowed) {
      throw new Error('Accès refusé : Politique Zero Trust');
    }

    return true;
  }

  /**
   * Crée ou met à jour une politique d'accès pour un utilisateur / ressource / action.
   */
  async setPolicy(input: SetPolicyInput) {
    const action = input.action || '*';
    const allowed = input.allowed !== undefined ? input.allowed : true;
    const conditionsStr = input.conditions ? JSON.stringify(input.conditions) : null;

    return await this.db.accessPolicy.upsert({
      where: {
        userId_resourceId_action: {
          userId: input.userId,
          resourceId: input.resourceId,
          action
        }
      },
      create: {
        userId: input.userId,
        resourceId: input.resourceId,
        action,
        allowed,
        tenantId: input.tenantId,
        conditions: conditionsStr
      },
      update: {
        allowed,
        tenantId: input.tenantId,
        conditions: conditionsStr
      }
    });
  }

  /**
   * Révoque les politiques d'accès pour une ressource donnée.
   */
  async revokePolicy(userId: string, resourceId: string): Promise<number> {
    const result = await this.db.accessPolicy.deleteMany({
      where: { userId, resourceId }
    });
    return result.count;
  }

  /**
   * Liste les politiques associées à un utilisateur ou tenant.
   */
  async listPolicies(userId?: string, tenantId?: string) {
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (tenantId) where.tenantId = tenantId;

    return await this.db.accessPolicy.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const zeroTrustService = new ZeroTrustService();
