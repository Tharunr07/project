import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

/**
 * Firebase bootstrap — PHASE 2.
 *
 * Configuration comes from Vite environment variables (.env.local, see
 * .env.example). The web API key is a public identifier by design — real
 * security is enforced by Firestore/Storage rules plus Authentication
 * (configured in later passes), never by hiding this key.
 */

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

for (const key of REQUIRED_KEYS) {
  if (!import.meta.env[key]) {
    throw new Error(
      `[firebase] Missing ${key}. Copy .env.example to .env.local and fill in the Firebase web config.`,
    )
  }
}

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
    : {}),
}

const app = initializeApp(firebaseConfig)

/** Firestore instance — all collections live here. */
export const db = getFirestore(app)

/** Firebase Authentication (Email/Password admin + staff accounts). */
export const auth = getAuth(app)

/** Cloud Storage — image files only; Firestore stores metadata + URLs. */
export const storage = getStorage(app)

export default app
