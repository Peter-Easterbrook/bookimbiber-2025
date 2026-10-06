import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import {
  collection,
  doc,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

// Public identifiers, not secrets: access is enforced by Firestore security rules.
// Values come from .env locally and from EAS environment variables in builds.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Firebase config missing: set the EXPO_PUBLIC_FIREBASE_* variables in .env (local) or EAS environment variables (builds).'
  );
}

// Guard against re-initialising on Fast Refresh
const isFirstInit = getApps().length === 0;
export const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

// Native: persist the login in AsyncStorage so it survives app restarts.
// Web: getAuth uses the browser's own persistence.
export const auth =
  Platform.OS === 'web' || !isFirstInit
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

// Skip undefined fields (e.g. a book without a description) instead of rejecting the write
export const db = isFirstInit
  ? initializeFirestore(app, { ignoreUndefinedProperties: true })
  : getFirestore(app);

// The Firebase project is shared with other apps, so all Bookimbiber data
// lives under bookimbiber_users/{uid}/... (see docs/firebase-migration.md).
const ROOT_COLLECTION = 'bookimbiber_users';

export const userCollection = (uid, name) =>
  collection(db, ROOT_COLLECTION, uid, name);

export const userDoc = (uid, name, id) =>
  doc(db, ROOT_COLLECTION, uid, name, id);

// Map a Firestore snapshot to a plain object, converting Timestamps to ISO strings
// so screens can keep using `new Date(value)`.
export const fromSnapshot = (snapshot) => {
  // 'estimate' fills in serverTimestamp() fields that are still pending locally
  const data = snapshot.data({ serverTimestamps: 'estimate' });
  const converted = {};
  for (const [key, value] of Object.entries(data)) {
    converted[key] =
      value && typeof value.toDate === 'function'
        ? value.toDate().toISOString()
        : value;
  }
  return { id: snapshot.id, ...converted };
};
