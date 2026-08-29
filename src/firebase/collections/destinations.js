import { doc, getDoc, where } from 'firebase/firestore'
import {
  deleteDocById,
  fetchCollection,
  fetchDocById,
  pruneUndefined,
  subscribeCollection,
  subscribeDoc,
  updateDocFields,
  writeDocWithId,
} from '../firestore'
import { db } from '../config'
import { useSubscription } from '../hooks'

/**
 * `destinations` collection service — PHASE 2B.
 *
 * Documents keep the exact Phase 1 shape (see src/data/destinations.js):
 *   id, name, state, category, tagline, shortDescription, description,
 *   heroImage, cardImage, gallery[], startingPrice, duration, days,
 *   bestTime, altitude, distanceFromBase, rating, reviewCount,
 *   published, featured, attractions[{name, note}], highlights[]
 * plus sortOrder (stable display order), createdAt and updatedAt.
 *
 * `id` doubles as the URL slug used by /destinations/:id.
 */

const COLLECTION = 'destinations'

/** Stable display order — seeded docs carry their mock index; new ones append. */
function bySortOrder(list) {
  return [...list].sort((a, b) => (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999))
}

/** Live list of every destination (admin screens). */
export function subscribeDestinations() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, { onData: (list) => onData(bySortOrder(list)), onError })
}

/** Live list of published destinations only — customer website. */
export function subscribePublishedDestinations() {
  return (onData, onError) =>
    subscribeCollection(
      COLLECTION,
      { filters: [where('published', '==', true)], onData: (list) => onData(bySortOrder(list)), onError },
    )
}

/** Live single destination by id/slug — emits null when missing or id is empty. */
export function subscribeDestination(id) {
  return (onData, onError) => {
    if (!id) {
      onData(null)
      return undefined
    }
    return subscribeDoc(COLLECTION, id, { onData, onError })
  }
}

/** One-shot read of a single destination. */
export const getDestination = (id) => fetchDocById(COLLECTION, id)

/** Slugify a destination name into its document id / URL slug. */
export function slugifyDestinationId(name) {
  return (
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'destination'
  )
}

/** Guarantee a unique slug doc id (kodaikanal, kodaikanal-2 on clash). */
async function ensureUniqueId(base) {
  let candidate = base
  let suffix = 1
  for (;;) {
    const snapshot = await getDoc(doc(db, COLLECTION, candidate))
    if (!snapshot.exists()) return candidate
    suffix += 1
    candidate = `${base}-${suffix}`
  }
}

/** Highest existing sortOrder + 1, so new destinations append to the list. */
async function nextSortOrder() {
  try {
    const list = await fetchCollection(COLLECTION)
    return list.reduce((max, item) => Math.max(max, Number(item.sortOrder) || 0), 0) + 1
  } catch {
    return Date.now()
  }
}

/**
 * Create or update a destination. On create, guarantees a unique slug and
 * appends to the display order. createdAt is written once and never touched
 * again on updates. Returns the saved document id.
 */
export async function saveDestination(next, existing = null) {
  const clean = pruneUndefined({ ...next })
  delete clean.createdAt
  delete clean.updatedAt

  if (existing) {
    const { id: ignoredId, ...fields } = clean // doc id lives only in the path
    void ignoredId
    await updateDocFields(COLLECTION, existing.id, fields)
    return existing.id
  }

  const id = await ensureUniqueId(slugifyDestinationId(clean.name ?? 'destination'))
  const { id: ignoredId, ...payload } = clean
  void ignoredId
  await writeDocWithId(COLLECTION, id, { ...payload, sortOrder: await nextSortOrder() })
  return id
}

/** Partial update — publish/featured toggles, price or copy edits. */
export const updateDestinationFields = (id, fields) => updateDocFields(COLLECTION, id, fields)

/** Remove a destination. Packages keep their own destinationName copies. */
export const deleteDestination = (id) => deleteDocById(COLLECTION, id)

/* ── React hooks (same `{data, loading, error, reload}` contracts) ────────── */

/** All destinations — admin management screens. */
export function useDestinations() {
  return useSubscription(subscribeDestinations())
}

/** Published destinations only — customer-facing screens. */
export function usePublishedDestinations() {
  return useSubscription(subscribePublishedDestinations())
}

/** Single destination — customer detail page / admin edit prefill. */
export function useDestination(id) {
  return useSubscription(subscribeDestination(id), [id])
}
