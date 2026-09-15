import { Router } from 'express';
import { PayPalWebhookController } from '../controllers/paypal.controller';

const router = Router();
const controller = new PayPalWebhookController();

// Route publique appelée par PayPal
router.post('/webhook', controller.handleWebhook);

export default router;
