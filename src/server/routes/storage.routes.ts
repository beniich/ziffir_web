import { Router } from 'express';
import { storageController } from '../controllers/storage.controller.js';

const router = Router();

// Téléversement & Téléchargement pré-signés R2 / S3
router.post('/upload-url', (req, res) => storageController.getUploadUrl(req, res));
router.get('/download-url/:key', (req, res) => storageController.getDownloadUrl(req, res));

// Gestion des métadonnées
router.post('/metadata', (req, res) => storageController.registerMetadata(req, res));
router.get('/metadata/:key', (req, res) => storageController.getMetadata(req, res));

export default router;
