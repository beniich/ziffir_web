import { Router } from 'express';
import { zeroTrustController } from '../controllers/zeroTrust.controller.js';

const router = Router();

// Validation d'accès Zero Trust
router.post('/validate', (req, res) => zeroTrustController.validate(req, res));

// Administration des politiques
router.get('/policies', (req, res) => zeroTrustController.listPolicies(req, res));
router.post('/policies', (req, res) => zeroTrustController.setPolicy(req, res));
router.delete('/policies/:userId/:resourceId', (req, res) => zeroTrustController.revokePolicy(req, res));

export default router;
