import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore,
  collection, 
  getDocs, 
  setDoc,
  doc,
  getDoc
} from 'firebase/firestore';

import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific databaseId from config
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || "ai-studio-c03eed34-6b98-437a-b865-3de7e2a9ecd6"
);

// Initialize Auth
export const auth = getAuth(app);

// Configure Google OAuth Provider with Workspace Sheets and Drive scopes
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

// Cache the access token in memory
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Register a new user with standard email/password credentials
export const registerWithEmail = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    try {
      await getOrCreateUserProfile({ ...user, displayName });
    } catch (profileErr) {
      console.warn("Could not pre-create user profile in Firestore:", profileErr);
    }
    return user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Log in a user with standard email/password credentials
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export const getOrCreateUserProfile = async (user: User): Promise<any> => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }

    // Try finding by email across all users in case of pre-seeded users
    const querySnap = await getDocs(collection(db, 'users'));
    let foundUser: any = null;
    querySnap.forEach(d => {
      const data = d.data();
      if (data.email && data.email.toLowerCase() === user.email?.toLowerCase()) {
        foundUser = { id: d.id, ...data };
      }
    });

    if (foundUser) {
      // Migrate old pre-seeded document ID to user's UID to make it consistent
      const oldDocRef = doc(db, 'users', foundUser.id);
      await setDoc(userDocRef, {
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        status: foundUser.status,
        createdAt: foundUser.createdAt || new Date().toISOString(),
        departmentOrCompany: foundUser.departmentOrCompany || ''
      });
      // Optionally delete the old pre-seeded record if its ID was different
      if (foundUser.id !== user.uid) {
        try {
          const { deleteDoc } = await import('firebase/firestore');
          await deleteDoc(oldDocRef);
        } catch (e) {
          console.warn("Could not clean up old pre-seeded user doc:", e);
        }
      }
      return { id: user.uid, ...foundUser };
    }

    // Determine default role based on email domain / content
    const emailLower = (user.email || '').toLowerCase();
    let role: 'administrateur' | 'client' | 'hotel' = 'client';
    let dept = 'Premium Guest';
    if (emailLower.endsWith('@zafir.academy') || emailLower.includes('admin')) {
      role = 'administrateur';
      dept = 'Registry Headquarters';
    } else if (emailLower.endsWith('@sapphir.academy') || emailLower.includes('hotel') || emailLower.includes('staff')) {
      role = 'hotel';
      dept = 'Front Desk Office';
    }

    const newProfile = {
      name: user.displayName || user.email?.split('@')[0] || 'New User',
      email: user.email || '',
      role,
      status: 'Active',
      createdAt: new Date().toISOString(),
      departmentOrCompany: dept,
      lastActivity: new Date().toISOString()
    };

    await setDoc(userDocRef, newProfile);
    return { id: user.uid, ...newProfile };
  } catch (err) {
    console.error("Error in getOrCreateUserProfile:", err);
    // Return a fallback profile in case of offline/rules error
    const emailLower = (user.email || '').toLowerCase();
    let role: 'administrateur' | 'client' | 'hotel' = 'client';
    if (emailLower.endsWith('@zafir.academy') || emailLower.includes('admin')) {
      role = 'administrateur';
    } else if (emailLower.endsWith('@sapphir.academy') || emailLower.includes('hotel')) {
      role = 'hotel';
    }
    return {
      id: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'New User',
      email: user.email || '',
      role,
      status: 'Active'
    };
  }
};

// --- Firestore Secure Operations and Error Handlers ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helpers to read/write Firestore
export const firestoreService = {
  // Save demo requests from the marketing landing page
  async saveDemoRequest(request: { name: string; email: string; hotel: string; notes: string; plan: string }) {
    const path = `demo_requests/${request.email || 'anonymous'}`;
    try {
      await setDoc(doc(db, 'demo_requests', request.email || 'anonymous'), {
        ...request,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Save/Update configuration parameters
  async saveConfig(config: { sheetId: string; sheetName: string; liveSync: boolean }) {
    const path = 'settings/config';
    try {
      await setDoc(doc(db, 'settings', 'config'), {
        ...config,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Get saved configuration
  async getConfig(): Promise<{ sheetId: string; sheetName: string; liveSync: boolean } | null> {
    const path = 'settings/config';
    try {
      const snap = await getDocs(collection(db, 'settings'));
      const configItem = snap.docs.find(d => d.id === 'config');
      if (configItem) {
        return configItem.data() as any;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  }
};
