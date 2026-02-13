import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined;

try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!getApps().length && projectId && clientEmail && privateKey) {
        app = initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        });
    } else if (getApps().length) {
        app = getApps()[0];
    }
} catch (e) {
    console.warn('Firebase Admin initialization failed:', e);
}

const notConfiguredProxy = (methodName: string) => new Proxy({} as any, {
    get(_, prop) {
        if (prop === methodName) {
            return () => { throw new Error('Firebase Admin not configured — set FIREBASE_ADMIN_* env vars'); };
        }
        return undefined;
    }
});

// Export lazy getters that throw clear errors when admin is not configured
export const adminAuth: Auth = app ? getAuth(app) : notConfiguredProxy('verifyIdToken');
export const adminDb: Firestore = app ? getFirestore(app) : notConfiguredProxy('collection');
