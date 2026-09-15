import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';

const router = Router();
const controller = new AiController();

// Analyse des logs de trafic via Gemini
router.post('/analyze/traffic', controller.analyzeTrafficLogs);

// Detection d'anomalies dans les metriques
router.post('/analyze/anomalies', controller.detectAnomalies);

// Historique des analyses
router.get('/history', controller.getAnalysisHistory);

export default router;
