import { Router } from 'express';
import { TrafficController } from '../controllers/traffic.controller';

const router = Router();
const controller = new TrafficController();

// Enregistrement d'un log de trafic edge
router.post('/log', controller.recordTraffic);

// Statistiques de bande passante et latence agrégée
router.get('/bandwidth', controller.getBandwidth);

// Nœuds les plus sollicités
router.get('/top-nodes', controller.getTopNodes);

export default router;
