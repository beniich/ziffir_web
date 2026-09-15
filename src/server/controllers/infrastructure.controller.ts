import { Request, Response } from 'express';
import { infrastructureService } from '../services/infrastructure.service.js';

export class InfrastructureController {
  /**
   * Enregistrer une mesure de télémétrie
   */
  async recordTelemetry(req: Request, res: Response): Promise<void> {
    try {
      const { assetId, temperature, vibration, humidity, powerUsage } = req.body;

      if (!assetId || temperature === undefined || vibration === undefined) {
        res.status(400).json({ error: 'assetId, temperature et vibration sont requis' });
        return;
      }

      const telemetry = await infrastructureService.recordTelemetry({
        assetId,
        temperature: Number(temperature),
        vibration: Number(vibration),
        humidity: humidity !== undefined ? Number(humidity) : undefined,
        powerUsage: powerUsage !== undefined ? Number(powerUsage) : undefined,
      });

      res.status(201).json({ success: true, telemetry });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Calcul de maintenance prédictive
   */
  async getPrediction(req: Request, res: Response): Promise<void> {
    try {
      const rawAssetId = req.params.assetId;
      const assetId = Array.isArray(rawAssetId) ? rawAssetId[0] : rawAssetId;

      if (!assetId) {
        res.status(400).json({ error: 'Paramètre assetId requis' });
        return;
      }

      const prediction = await infrastructureService.predictFailure(assetId);
      res.json({ success: true, assetId, prediction });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Synthèse santé d'un équipement
   */
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const rawAssetId = req.params.assetId;
      const assetId = Array.isArray(rawAssetId) ? rawAssetId[0] : rawAssetId;

      if (!assetId) {
        res.status(400).json({ error: 'Paramètre assetId requis' });
        return;
      }

      const health = await infrastructureService.getAssetHealth(assetId);
      res.json({ success: true, health });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Créer un équipement
   */
  async createAsset(req: Request, res: Response): Promise<void> {
    try {
      const { name, type, location, tenantId } = req.body;

      if (!name || !type) {
        res.status(400).json({ error: 'name et type sont requis' });
        return;
      }

      const asset = await infrastructureService.createAsset({
        name,
        type,
        location,
        tenantId: tenantId || (req.auth as any)?.hotelId,
      });

      res.status(201).json({ success: true, asset });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Lister les équipements
   */
  async listAssets(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req.query.tenantId as string) || ((req.auth as any)?.hotelId as string);
      const assets = await infrastructureService.listAssets(tenantId);
      res.json({ success: true, count: assets.length, assets });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const infrastructureController = new InfrastructureController();
