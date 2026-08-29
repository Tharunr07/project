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
 * `packages` collection service — PHASE 2A.
 *
 * Documents keep the exact Phase 1 shape (see src/data/packages.js):
 *   id, name, destinationId, destination, category, price, days, nights,
 *   duration, minGroupSize, rating, reviewCount, published, featured,
 *   popular, tags[], image, gallery[], shortDescription, overview,
 *   itinerary[], hotels[], transport{}, inclusions[], exclusions[], terms[]
 * plus sortOrder (stable display order), createdAt and updatedAt.
 *
 * IMPORTANT: `price` is the CURRENT selling price. Historical trips and bills
 * snapshot their own agreed pricePerPerson and never read this field.
 */

const COLLECTION = 'packages'

/** Stable display order — seeded docs carry their mock index; new ones append. */
function bySortOrder(list) {
  return [...list].sort((a, b) => (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999))
}

/** Live list of every package, sorted for display. */
export function subscribePackages() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, { onData: (list) => onData(bySortOrder(list)), onError })
}

/** Live list of published packages only — used by the customer website. */
export function subscribePublishedPackages() {
  return (onData, onError) =>
    subscribeCollection(
      COLLECTION,
      { filters: [where('published', '==', true)], onData: (list) => onData(bySortOrder(list)), onError },
    )
}

/** Live single package by id — emits null when missing or id is empty. */
export function subscribePackage(id) {
  return (onData, onError) => {
    if (!id) {
      onData(null)
      return undefined
    }
    return subscribeDoc(COLLECTION, id, { onData, onError })
  }
}

/** One-shot read of a single package. */
export const getPackage = (id) => fetchDocById(COLLECTION, id)

/** Slugify a package name into its human-readable document id. */
export function slugifyPackageId(name) {
  return (
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'package'
  )
}

/** Guarantee a unique human-readable doc id (ooty-classic-3d, …-2 on clash). */
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

/** Highest existing sortOrder + 1, so new packages append to the list. */
async function nextSortOrder() {
  try {
    const list = await fetchCollection(COLLECTION)
    return list.reduce((max, item) => Math.max(max, Number(item.sortOrder) || 0), 0) + 1
  } catch {
    return Date.now()
  }
}

/**
 * Create or update a package. On create, guarantees a unique human-readable
 * id derived from the name and appends to the display order. Returns the
 * saved document id.
 */
export async function savePackage(next, existing = null) {
  const clean = pruneUndefined({ ...next })
  delete clean.createdAt
  delete clean.updatedAt

  if (existing) {
    const { id: ignoredId, ...fields } = clean // doc id lives only in the path
    void ignoredId
    await updateDocFields(COLLECTION, existing.id, fields)
    return existing.id
  }

  const id = await ensureUniqueId(slugifyPackageId(clean.name ?? 'package'))
  const { id: ignoredId, ...payload } = clean // doc id lives only in the path
  void ignoredId
  await writeDocWithId(COLLECTION, id, { ...payload, sortOrder: await nextSortOrder() })
  return id
}

/** Partial field update — publish/featured/popular toggles, quick price edits. */
export const updatePackageFields = (id, fields) => updateDocFields(COLLECTION, id, fields)

/** Remove a package from the catalogue. Past trips/bills are untouched. */
export const deletePackage = (id) => deleteDocById(COLLECTION, id)

/* ── React hooks (same `{data|rows, loading, error, reload}` contracts) ──── */

/** All packages — admin management screens. */
export function usePackages() {
  return useSubscription(subscribePackages())
}

/** Published packages only — customer-facing screens. */
export function usePublishedPackages() {
  return useSubscription(subscribePublishedPackages())
}

/** Single package — customer detail page / admin edit prefill. */
export function usePackage(id) {
  return useSubscription(subscribePackage(id), [id])
}
