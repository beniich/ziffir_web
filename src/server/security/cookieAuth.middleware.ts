import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// ============================================================================
// Middleware d'authentification sécurisé — Zaphir
// Vérifie le token JWT depuis le cookie httpOnly. Utilise EXCLUSIVEMENT
// JWT_ACCESS_SECRET depuis les variables d'environnement (requis au démarrage).
// ⚠️ Aucun fallback secret : si la variable est absente, le serveur refuse
//    toutes les requêtes plutôt que d'accepter des tokens forgés.
// ============================================================================
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.zafir_access_token;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing authentication credentials.' });
    }

    // Utilise config.jwt.accessSecret — lancé par config.ts si la variable manque
    const decoded = jwt.verify(token, config.jwt.accessSecret) as any;

    (req as any).auth = {
      sub: decoded.sub,
      role: decoded.role,
      activeHotelId: decoded.activeHotelId,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token.' });
  }
};
