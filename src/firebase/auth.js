import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './config'
import { fetchDocById } from './firestore'

/**
 * Admin/staff authentication — PHASE 2C.
 *
 * Firebase Email/Password ONLY. There is no public registration anywhere in
 * the app: the ~4 authorised accounts are created manually in
 * Firebase Console → Authentication → Users, and each one needs a matching
 * Firestore `users/{uid}` document:
 *
 *   { name: "Admin 1", email: "admin1@…", role: "admin" | "staff", active: true }
 *
 * A successful Firebase sign-in WITHOUT a valid users/{uid} document (missing,
 * active:false, or role outside admin|staff) is signed out immediately — the
 * login screen reports it as an unauthorised account.
 */

const VALID_ROLES = ['admin', 'staff']

/** Map raw Firebase Auth codes to clear, non-technical messages. */
export function friendlyAuthError(error) {
  const code = error?.code ?? ''
  const messages = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/invalid-login-credentials': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'Incorrect email or password.',
    'auth/invalid-email': 'That email address does not look right.',
    'auth/user-disabled': 'This account has been disabled. Contact an administrator.',
    'auth/too-many-requests':
      'Too many attempts. Please wait a few minutes before trying again.',
    'auth/network-request-failed':
      'No internet connection — check your network and try again.',
    'auth/popup-blocked': 'The browser blocked the request. Allow pop-ups and retry.',
  }
  return Object.assign(new Error(messages[code] ?? 'Sign-in failed. Please try again.'), {
    cause: error,
    code: code || 'unknown',
  })
}

/**
 * Sign in and authorise.
 * Returns the app profile `{ uid, email, name, role }` or throws a friendly
 * Error. Unauthorised accounts (no users doc / inactive / wrong role) are
 * rejected AND signed out so no half-authenticated state lingers.
 */
export async function signIn(email, password) {
  let user
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
    user = credential.user
  } catch (error) {
    throw friendlyAuthError(error)
  }

  /** Sign out first, then surface a clear rejection to the login screen. */
  const reject = async (message) => {
    await signOut(auth).catch(() => {})
    throw new Error(message)
  }

  let profile
  try {
    profile = await fetchDocById('users', user.uid)
  } catch {
    return reject('Could not verify this account against the user registry. Try again shortly.')
  }

  if (!profile || profile.active === false || !VALID_ROLES.includes(profile.role)) {
    return reject(
      profile?.active === false
        ? 'This account is inactive. Contact an administrator.'
        : 'This account is not authorised for the admin portal.',
    )
  }

  return {
    uid: user.uid,
    email: profile.email ?? user.email,
    name: profile.name ?? (user.email ?? '').split('@')[0],
    role: profile.role,
  }
}

/** Sign out of the admin portal. */
export async function signOutUser() {
  await signOut(auth)
}

/**
 * Verify a RESTORED Firebase session against users/{uid} (page refresh).
 * Returns the app profile, or signs out + returns null when unauthorisable.
 * Silent — used by AdminAuthProvider's onAuthStateChanged listener.
 */
export async function authorizeSession(firebaseUser) {
  try {
    const profile = await fetchDocById('users', firebaseUser.uid)
    if (!profile || profile.active === false || !VALID_ROLES.includes(profile.role)) {
      await signOut(auth).catch(() => {})
      return null
    }
    return {
      uid: firebaseUser.uid,
      email: profile.email ?? firebaseUser.email,
      name: profile.name ?? (firebaseUser.email ?? '').split('@')[0],
      role: profile.role,
    }
  } catch {
    // Cannot verify (offline / rules) — never trust an unverified session.
    return null
  }
}

/**
 * Subscribe to Firebase session restores. The callback fires once with null
 * immediately when nobody is signed in, then on every sign-in/out. Returns
 * the unsubscribe function.
 */
export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

/** Send a password-reset link to an authorised admin email. */
export async function sendResetEmail(email) {
  try {
    await sendPasswordResetEmail(auth, email.trim())
  } catch (error) {
    throw friendlyAuthError(error)
  }
}
