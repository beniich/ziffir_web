import { Router } from 'express';
import { infrastructureController } from '../controllers/infrastructure.controller.js';

const router = Router();

// Gestion des équipements CAFM
router.get('/assets', (req, res) => infrastructureController.listAssets(req, res));
router.post('/assets', (req, res) => infrastructureController.createAsset(req, res));
router.get('/assets/:assetId/health', (req, res) => infrastructureController.getHealth(req, res));
router.get('/assets/:assetId/prediction', (req, res) => infrastructureController.getPrediction(req, res));

// Télémétrie IoT
router.post('/telemetry', (req, res) => infrastructureController.recordTelemetry(req, res));

export default router;
