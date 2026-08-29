import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { fetchDocById, pruneUndefined, subscribeCollection, updateDocFields } from '../firestore'
import { db } from '../config'
import { useSubscription } from '../hooks'

/**
 * `enquiries` collection service — PHASE 2B.
 *
 * Field names match the Phase 1 UI/mock exactly (do not rename):
 *   name, phone, email, destination, packageName, travelDate, travellers,
 *   days, groupType, requirements, status, assignedTo, receivedAt
 * Phase 2 additions:
 *   referenceNumber  — human-readable "AH-ENQ-2026-K3F9" for display
 *   createdAt / updatedAt — server timestamps
 *
 * Document IDs are Firestore auto-IDs (safe paths); the reference number is
 * display-only. Statuses stay the Phase 1 set: New, Contacted, Quoted,
 * Converted, Closed (see data/constants.js ENQUIRY_STATUSES).
 *
 * An enquiry is a request for contact only — there is NO online booking and
 * NO online payment anywhere in this flow.
 */

const COLLECTION = 'enquiries'

const REFERENCE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no lookalikes (I/L/O/0/1)

/** "AH-ENQ-2026-K3F9" — date + random suffix; unique by construction. */
export function makeEnquiryReference(now = new Date()) {
  let suffix = ''
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  for (const byte of bytes) suffix += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length]
  return `AH-ENQ-${now.getFullYear()}-${suffix}`
}

/** Live list of every enquiry (admin inbox). Newest-first sorting happens in
 * the page exactly as in Phase 1 — via the receivedAt string. */
export function subscribeEnquiries() {
  return (onData, onError) => subscribeCollection(COLLECTION, { onData, onError })
}

/** One-shot read of a single enquiry. */
export const getEnquiry = (id) => fetchDocById(COLLECTION, id)

/**
 * Create an enquiry from the customer form. Values must already be validated.
 * Returns `{ id, referenceNumber }` so the success screen can show the
 * reference immediately.
 */
export async function createEnquiry(values) {
  const receivedAt = new Date().toISOString()
  const payload = {
    ...pruneUndefined(values),
    referenceNumber: makeEnquiryReference(),
    status: 'New',
    assignedTo: null,
    receivedAt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  try {
    const reference = await addDoc(collection(db, COLLECTION), payload)
    return { id: reference.id, referenceNumber: payload.referenceNumber }
  } catch (error) {
    throw normalize(error)
  }
}

/** Partial update — status changes and assignee edits. */
export async function updateEnquiryFields(id, fields) {
  try {
    await updateDocFields(COLLECTION, id, fields)
  } catch (error) {
    throw normalize(error)
  }
}

function normalize(error) {
  if (error?.code === 'permission-denied') {
    return Object.assign(new Error('The enquiry could not be submitted right now. Please call or WhatsApp us instead.'), { cause: error, code: error.code })
  }
  if (error?.code === 'unavailable' || error?.code === 'network-request-failed') {
    return Object.assign(new Error('No internet connection — please check your network and try again.'), { cause: error, code: error.code })
  }
  return Object.assign(new Error('Something went wrong while saving your enquiry. Please try again.'), { cause: error, code: error?.code ?? 'unknown' })
}

/** All enquiries — admin management screen. */
export function useEnquiries() {
  return useSubscription(subscribeEnquiries())
}
