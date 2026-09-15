import { prisma as defaultPrisma } from '../lib/prisma.js';

export interface TelemetryInput {
  assetId: string;
  temperature: number;
  vibration: number;
  humidity?: number;
  powerUsage?: number;
}

export interface PredictionResult {
  riskLevel: 'Risque Élevé' | 'Risque Modéré' | 'Stable' | 'Données insuffisantes';
  trend: number;
  telemetryPointsAnalyzed: number;
  details?: {
    temperatureTrend: number;
    vibrationTrend: number;
  };
}

export class InfrastructureService {
  private db: any;

  constructor(prismaClient: any = defaultPrisma) {
    this.db = prismaClient;
  }

  /**
   * Enregistre un relevé de télémétrie IoT pour un équipement donné.
   */
  async recordTelemetry(data: TelemetryInput) {
    if (!data.assetId) {
      throw new Error('assetId requis');
    }

    return await this.db.telemetry.create({
      data: {
        assetId: data.assetId,
        temperature: data.temperature,
        vibration: data.vibration,
        humidity: data.humidity,
        powerUsage: data.powerUsage,
      }
    });
  }

  /**
   * Algorithme de Maintenance Prédictive :
   * Analyse les 100 derniers relevés pour détecter les hausses anormales
   * de température ou de vibrations révélatrices d'une défaillance imminente.
   */
  async predictFailure(assetId: string): Promise<PredictionResult> {
    if (!assetId) {
      throw new Error('assetId requis');
    }

    const telemetry = await this.db.telemetry.findMany({
      where: { assetId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    if (!telemetry || telemetry.length < 2) {
      return {
        riskLevel: 'Données insuffisantes',
        trend: 0,
        telemetryPointsAnalyzed: telemetry ? telemetry.length : 0,
      };
    }

    // Séparer les relevés récents (première moitié) des plus anciens (seconde moitié)
    const mid = Math.floor(telemetry.length / 2);
    const recent = telemetry.slice(0, mid);
    const older = telemetry.slice(mid);

    const avgRecentTemp = recent.reduce((sum: number, t: any) => sum + t.temperature, 0) / recent.length;
    const avgOlderTemp = older.reduce((sum: number, t: any) => sum + t.temperature, 0) / older.length;

    const avgRecentVib = recent.reduce((sum: number, t: any) => sum + t.vibration, 0) / recent.length;
    const avgOlderVib = older.reduce((sum: number, t: any) => sum + t.vibration, 0) / older.length;

    // Calcul de la dérive relative
    const tempTrend = avgOlderTemp !== 0 ? (avgRecentTemp - avgOlderTemp) / avgOlderTemp : 0;
    const vibTrend = avgOlderVib !== 0 ? (avgRecentVib - avgOlderVib) / avgOlderVib : 0;

    // Score de tendance combiné
    const overallTrend = Math.max(tempTrend, vibTrend);

    let riskLevel: 'Risque Élevé' | 'Risque Modéré' | 'Stable' = 'Stable';
    if (overallTrend > 0.10) {
      riskLevel = 'Risque Élevé';
    } else if (overallTrend > 0.05) {
      riskLevel = 'Risque Modéré';
    }

    return {
      riskLevel,
      trend: Number(overallTrend.toFixed(4)),
      telemetryPointsAnalyzed: telemetry.length,
      details: {
        temperatureTrend: Number(tempTrend.toFixed(4)),
        vibrationTrend: Number(vibTrend.toFixed(4)),
      }
    };
  }

  /**
   * Synthèse de l'état de santé d'un équipement
   */
  async getAssetHealth(assetId: string) {
    if (!assetId) {
      throw new Error('assetId requis');
    }

    const asset = await this.db.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Équipement introuvable');
    }

    const prediction = await this.predictFailure(assetId);
    const latest = await this.db.telemetry.findFirst({
      where: { assetId },
      orderBy: { timestamp: 'desc' },
    });

    return {
      asset,
      prediction,
      latestTelemetry: latest || null,
    };
  }

  /**
   * Création d'un équipement d'infrastructure
   */
  async createAsset(data: { name: string; type: string; location?: string; hotelId?: string; tenantId?: string }) {
    return await this.db.asset.create({
      data: {
        name: data.name,
        type: data.type,
        location: data.location,
        hotelId: data.hotelId,
        tenantId: data.tenantId,
      }
    });
  }

  /**
   * Liste des équipements
   */
  async listAssets(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};
    return await this.db.asset.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }
}

export const infrastructureService = new InfrastructureService();
