import { Request, Response } from 'express';
import { storageService } from '../services/storage.service.js';

export class StorageController {
  /**
   * Générer une URL pré-signée de téléversement vers R2/S3
   */
  async getUploadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { fileName, mimeType, expiresIn } = req.body;

      if (!fileName) {
        res.status(400).json({ error: 'fileName requis' });
        return;
      }

      const tenantId = req.body.tenantId || (req.auth as any)?.hotelId || 'default';
      const uploaderId = req.auth?.sub;

      const result = await storageService.getUploadUrl({
        fileName,
        mimeType: mimeType || 'application/octet-stream',
        tenantId,
        uploaderId,
        expiresIn: expiresIn ? Number(expiresIn) : 3600,
      });

      res.json({
        success: true,
        uploadUrl: result.uploadUrl,
        key: result.key,
        bucket: result.bucket,
        expiresIn: result.expiresIn,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Générer une URL pré-signée de téléchargement
   */
  async getDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const rawKey = req.params.key;
      const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
      const expiresIn = req.query.expiresIn ? Number(req.query.expiresIn) : 3600;

      if (!key) {
        res.status(400).json({ error: 'key requise' });
        return;
      }

      const downloadUrl = await storageService.getDownloadUrl(key, expiresIn);
      res.json({ success: true, downloadUrl, key, expiresIn });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Enregistrer les métadonnées après complétion du téléversement
   */
  async registerMetadata(req: Request, res: Response): Promise<void> {
    try {
      const { key, fileName, mimeType, sizeBytes, publicUrl, bucket } = req.body;

      if (!key || !fileName) {
        res.status(400).json({ error: 'key et fileName sont requis' });
        return;
      }

      const tenantId = req.body.tenantId || (req.auth as any)?.hotelId;
      const uploaderId = req.auth?.sub;

      const file = await storageService.registerFile({
        key,
        fileName,
        mimeType: mimeType || 'application/octet-stream',
        sizeBytes,
        publicUrl,
        bucket,
        tenantId,
        uploaderId,
      });

      res.status(201).json({ success: true, file });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Consulter les métadonnées d'un fichier
   */
  async getMetadata(req: Request, res: Response): Promise<void> {
    try {
      const rawKey = req.params.key;
      const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;

      if (!key) {
        res.status(400).json({ error: 'key requise' });
        return;
      }

      const file = await storageService.getFile(key);
      if (!file) {
        res.status(404).json({ error: 'Fichier introuvable' });
        return;
      }

      res.json({ success: true, file });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const storageController = new StorageController();
