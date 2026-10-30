import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, inMemoryPersistence, browserPopupRedirectResolver, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const configured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain);
const app = configured ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)) : null;
// Firebase is only the Google token broker; RentzyPro's backend JWT persists the app session.
// Avoid IndexedDB restoration/third-party storage waits before issuing a Google token.
let auth = null;
if (app && typeof window !== 'undefined') {
  try { auth = initializeAuth(app, { persistence: inMemoryPersistence, popupRedirectResolver: browserPopupRedirectResolver }); }
  catch (error) {
    if (error.code !== 'auth/already-initialized') throw error;
    auth = getAuth(app); // Fast Refresh may have initialized this app already.
  }
}
const googleProvider = app ? new GoogleAuthProvider() : null;
googleProvider?.setCustomParameters({ prompt: 'select_account' });

export { auth, googleProvider };
