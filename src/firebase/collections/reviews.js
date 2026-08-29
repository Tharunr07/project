import { addDoc, collection, serverTimestamp, where } from 'firebase/firestore'
import {
  deleteDocById,
  pruneUndefined,
  subscribeCollection,
  updateDocFields,
} from '../firestore'
import { db } from '../config'
import { useSubscription } from '../hooks'
import { deleteImageByPath, deleteImageByUrl } from '../storage'

/**
 * `reviews` collection service — PHASE 2C.
 *
 * Documents keep the Phase 1 shape (see src/data/reviews.js):
 *   name, hometown, rating, trip, destination, date, groupType, avatar,
 *   review, published, featured
 * plus optional storagePath (uploaded customer photos), sortOrder and
 * timestamps. Document IDs are Firestore auto-IDs — the UI never displays
 * review ids.
 */

const COLLECTION = 'reviews'

/** Newest first, matching the Phase 1 list order. */
function byDateDesc(list) {
  return [...list].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
}

/** Live list of every review (admin screens). */
export function subscribeReviews() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, { onData: (list) => onData(byDateDesc(list)), onError })
}

/** Live list of published reviews only — customer website. */
export function subscribePublishedReviews() {
  return (onData, onError) =>
    subscribeCollection(
      COLLECTION,
      { filters: [where('published', '==', true)], onData: (list) => onData(byDateDesc(list)), onError },
    )
}

/**
 * Create or update a review. Auto-ID on create; returns the doc id.
 * `avatarStoragePath` is stored as `storagePath` when a photo was uploaded.
 */
export async function saveReview(next, existing = null) {
  const clean = pruneUndefined({ ...next })

  if (existing) {
    const { id: ignoredId, ...fields } = clean
    void ignoredId
    await updateDocFields(COLLECTION, existing.id, fields)
    return existing.id
  }

  const payload = {
    ...clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  try {
    const reference = await addDoc(collection(db, COLLECTION), payload)
    return reference.id
  } catch (error) {
    throw Object.assign(new Error('Could not save the review.'), { cause: error })
  }
}

/** Partial update — published/featured toggles and field edits. */
export async function updateReviewFields(id, fields) {
  try {
    await updateDocFields(COLLECTION, id, fields)
  } catch (error) {
    throw Object.assign(new Error('Could not update the review.'), { cause: error })
  }
}

/** Remove a review, then best-effort delete its uploaded avatar file. */
export async function deleteReview(review) {
  try {
    await deleteDocById(COLLECTION, review.id)
  } catch (error) {
    throw Object.assign(new Error('Could not delete the review.'), { cause: error })
  }
  if (review.storagePath) await deleteImageByPath(review.storagePath).catch(() => {})
  else await deleteImageByUrl(review.avatar).catch(() => {})
}

/** Mean rating of a review list, rounded to one decimal (Phase 1 formula). */
export function averageRating(list) {
  if (!list || list.length === 0) return 0
  return Math.round((list.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / list.length) * 10) / 10
}

/* ── React hooks ─────────────────────────────────────────────────────────── */

/** All reviews — admin management screen. */
export function useReviews() {
  return useSubscription(subscribeReviews())
}

/** Published reviews — public reviews page, home testimonials, detail pages. */
export function usePublishedReviews() {
  return useSubscription(subscribePublishedReviews())
}
