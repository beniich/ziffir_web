import { Router } from 'express';
import { billingController } from '../controllers/billing.controller.js';

const router = Router();

// Consultation et opérations de jetons
router.get('/tokens/balance', (req, res) => billingController.getBalance(req, res));
router.post('/tokens/consume', (req, res) => billingController.consume(req, res));
router.post('/tokens/recharge', (req, res) => billingController.recharge(req, res));

export default router;
