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
 * `gallery` collection service — PHASE 2C.
 *
 * Documents keep the Phase 1 shape (see src/data/gallery.js):
 *   src, title, category, destination, date
 * plus published (default true), optional storagePath (for uploaded files),
 * sortOrder and timestamps. Document IDs are Firestore auto-IDs — the UI
 * never displays gallery ids.
 *
 * Public pages treat missing `published` as visible so legacy/seeded docs
 * keep rendering without a migration.
 */

const COLLECTION = 'gallery'

/** Live list of every gallery item — date-descending like the Phase 1 list. */
export function subscribeGalleryItems() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, {
      onData: (list) =>
        onData(
          [...list].sort(
            (a, b) =>
              String(b.date ?? '').localeCompare(String(a.date ?? '')) ||
              (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
          ),
        ),
      onError,
    })
}

/**
 * Create a gallery item. Auto-ID document; returns the new doc id.
 * `storagePath` travels alongside the URL when the image was uploaded.
 */
export async function addGalleryItem(item) {
  const payload = {
    ...pruneUndefined(item),
    published: item.published ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  try {
    const reference = await addDoc(collection(db, COLLECTION), payload)
    return reference.id
  } catch (error) {
    throw Object.assign(new Error('Could not save the gallery item.'), { cause: error })
  }
}

/** Partial update — caption/category/destination/published edits. */
export async function updateGalleryItem(id, fields) {
  try {
    await updateDocFields(COLLECTION, id, fields)
  } catch (error) {
    throw Object.assign(new Error('Could not update the gallery item.'), { cause: error })
  }
}

/** Remove a gallery item, then best-effort delete its uploaded file. */
export async function deleteGalleryItem(item) {
  try {
    await deleteDocById(COLLECTION, item.id)
  } catch (error) {
    throw Object.assign(new Error('Could not delete the gallery item.'), { cause: error })
  }
  // Cleanup after the document is safely gone; failures here are non-fatal.
  if (item.storagePath) await deleteImageByPath(item.storagePath).catch(() => {})
  else await deleteImageByUrl(item.src).catch(() => {})
}

/** Every gallery item — admin management screen. */
export function useGallery() {
  return useSubscription(subscribeGalleryItems())
}

/**
 * Published items only — customer gallery page. The filter is enforced
 * SERVER-SIDE so Firestore security rules (public reads require
 * published == true) can evaluate the query. All admin-created items default
 * to published: true, and the seeder stamps it on every seeded doc.
 */
export function usePublishedGallery() {
  return useSubscription((onData, onError) =>
    subscribeCollection(
      COLLECTION,
      {
        filters: [where('published', '==', true)],
        onData: (list) =>
          onData(
            [...list].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? ''))),
          ),
        onError,
      },
    ),
  )
}
