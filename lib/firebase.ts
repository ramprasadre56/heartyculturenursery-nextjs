import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder').replace(/["\n\r]/g, '').trim(),
    authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '').replace(/["\n\r]/g, '').trim(),
    projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '').replace(/["\n\r]/g, '').trim(),
    storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '').replace(/["\n\r]/g, '').trim(),
    messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '').replace(/["\n\r]/g, '').trim(),
    appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '').replace(/["\n\r]/g, '').trim(),
};

let app: FirebaseApp;

if (getApps().length) {
    app = getApp();
} else {
    app = initializeApp(firebaseConfig);
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
