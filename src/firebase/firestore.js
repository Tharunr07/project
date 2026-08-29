import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './config'

/**
 * Thin generic layer over the Firestore modular SDK.
 *
 * Every collection service in `collections/` builds on these helpers so error
 * mapping, timestamping and doc→object conversion stay consistent across the
 * app. UI components never import 'firebase/firestore' directly.
 */

/** Convert one document snapshot to a plain object carrying its id. */
export function mapDoc(snapshot) {
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

/** Convert a query snapshot to an array of plain objects. */
export function mapDocs(querySnapshot) {
  return querySnapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

/**
 * Map a Firebase error to a user-facing message. Keeps "permission denied"
 * and offline states from surfacing as raw SDK codes in ErrorState panels.
 */
export function normalizeError(error) {
  const friendly = {
    'permission-denied':
      'You do not have permission to read this data. Sign in with an authorised admin account.',
    unavailable: 'Cannot reach the database. Check your internet connection and try again.',
    'failed-precondition': 'The database is not available right now. Please try again shortly.',
    aborted: 'The operation was interrupted. Please try again.',
    cancelled: 'The operation was cancelled.',
    'deadline-exceeded': 'The database took too long to respond. Please try again.',
    unauthenticated: 'Your session has expired. Please sign in again.',
  }
  const code = error?.code ?? ''
  return Object.assign(new Error(friendly[code] ?? 'Something went wrong while loading data.'), {
    cause: error,
    code: code || 'unknown',
  })
}

/** Recursively strip undefined values — Firestore rejects them outright. */
export function pruneUndefined(value) {
  if (Array.isArray(value)) return value.map(pruneUndefined)
  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, pruneUndefined(item)]),
    )
  }
  return value
}

/**
 * Live listener on a collection with optional query constraints.
 * Returns an unsubscribe function — designed for useSubscription().
 *
 * @param {string} collectionName
 * @param {{ filters?: Array, onData?: Function, onError?: Function }} options
 */
export function subscribeCollection(collectionName, { filters = [], onData, onError } = {}) {
  const base = collection(db, collectionName)
  const scoped = filters.length > 0 ? query(base, ...filters) : base
  return onSnapshot(
    scoped,
    (snapshot) => onData?.(mapDocs(snapshot)),
    (error) => onError?.(normalizeError(error)),
  )
}

/** Live listener on a single document; emits null when it does not exist. */
export function subscribeDoc(collectionName, id, { onData, onError } = {}) {
  return onSnapshot(
    doc(db, collectionName, id),
    (snapshot) => onData?.(mapDoc(snapshot)),
    (error) => onError?.(normalizeError(error)),
  )
}

/** One-shot read of every document (optionally filtered). */
export async function fetchCollection(collectionName, ...filters) {
  try {
    const scoped = filters.length > 0 ? query(collection(db, collectionName), ...filters) : collection(db, collectionName)
    return mapDocs(await getDocs(scoped))
  } catch (error) {
    throw normalizeError(error)
  }
}

/** One-shot read of a single document by id. */
export async function fetchDocById(collectionName, id) {
  try {
    return mapDoc(await getDoc(doc(db, collectionName, id)))
  } catch (error) {
    throw normalizeError(error)
  }
}

/**
 * Create or overwrite a document with a known human-readable id.
 * Idempotent by design — safe for the seeder and for upsert-style saves.
 * Sets createdAt only when the document is new, always refreshes updatedAt.
 */
export async function writeDocWithId(collectionName, id, data) {
  const payload = pruneUndefined(data)
  try {
    const reference = doc(db, collectionName, id)
    const existing = await getDoc(reference)
    const stamp = existing.exists()
      ? { updatedAt: serverTimestamp() }
      : { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
    await setDoc(reference, { ...payload, ...stamp }, { merge: true })
    return id
  } catch (error) {
    throw normalizeError(error)
  }
}

/** Partial update — merges the given fields plus updatedAt. */
export async function updateDocFields(collectionName, id, fields) {
  try {
    await updateDoc(doc(db, collectionName, id), {
      ...pruneUndefined(fields),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    throw normalizeError(error)
  }
}

/** Remove a document by id. */
export async function deleteDocById(collectionName, id) {
  try {
    await deleteDoc(doc(db, collectionName, id))
  } catch (error) {
    throw normalizeError(error)
  }
}
