import { Router } from 'express';
import { ComputeController } from '../controllers/compute.controller';

const router = Router();
const controller = new ComputeController();

// Soumettre un job compute
router.post('/jobs', controller.submitJob);

// Lister les jobs d'un tenant
router.get('/jobs', controller.listJobs);

// Executer un job
router.post('/jobs/:id/run', controller.runJob);

// Annuler un job
router.patch('/jobs/:id/cancel', controller.cancelJob);

export default router;
