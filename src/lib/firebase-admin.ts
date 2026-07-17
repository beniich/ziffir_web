import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// ============================================================================
// Firebase Admin SDK — Instance principale du serveur Zaphir
// Nommée 'zaphir-server' pour éviter les conflits avec l'instance
// 'microservices' utilisée par microservices.ts.
// En production, définir GOOGLE_APPLICATION_CREDENTIALS avec le chemin
// vers le fichier de compte de service JSON.
// ============================================================================

const APP_NAME = 'zaphir-server';

function getAdminApp(): App {
  const existing = getApps().find(a => a.name === APP_NAME);
  if (existing) return existing;
  return initializeApp({ projectId: firebaseConfig.projectId }, APP_NAME);
}

const adminApp: App = getAdminApp();
export const adminAuth: Auth = getAuth(adminApp);
