import { Router } from 'express';
import { SecurityController } from '../controllers/security.controller';

const router = Router();
const controller = new SecurityController();

// Rate limiting check
router.get('/rate-limit', controller.checkRateLimit);

// WAF Events
router.post('/waf/events', controller.recordWafEvent);
router.get('/waf/events', controller.getWafEvents);

// DNS Management
router.post('/dns', controller.createDnsRecord);
router.get('/dns', controller.listDnsRecords);
router.delete('/dns/:id', controller.deleteDnsRecord);

export default router;
