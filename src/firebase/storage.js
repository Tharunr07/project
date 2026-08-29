import { deleteObject, getDownloadURL, listAll, ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from './config'

/**
 * Cloud Storage image pipeline — PHASE 2C.
 *
 * Image FILES live in Storage; Firestore stores metadata + download URLs.
 * Folder layout (kept shallow — entityId subfolders where the caller has one):
 *
 *   packages/{packageId}/…     destinations/{destinationId}/…
 *   gallery/…                  reviews/{reviewId}/…        company/…
 *
 * User-supplied filenames are NEVER used as paths — every upload gets a
 * generated safe name. Deletion helpers are prefix-guarded so a malformed URL
 * can never wipe an unrelated folder.
 */

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const MAX_IMAGE_MB = 5

/** Only paths under these folders may be deleted by the app. */
const DELETABLE_PREFIXES = ['packages/', 'destinations/', 'gallery/', 'reviews/', 'company/']

/** Validate before uploading; throws a friendly Error on rejection. */
export function validateImageFile(file) {
  if (!file) return
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type. Please choose a JPG, PNG or WEBP image.')
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`That image is too large. Maximum size is ${MAX_IMAGE_MB} MB.`)
  }
}

/** "{timestamp}-{random6}.jpg" — original names never reach Storage paths. */
function safeFileName(originalName) {
  const extension = String(originalName ?? '').includes('.')
    ? String(originalName).split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5)
    : 'jpg'
  const random = Math.random().toString(36).slice(2, 8)
  return `${Date.now()}-${random}.${extension || 'jpg'}`
}

/** "packages/ooty-classic-3d" / "gallery" — trimmed, no leading/trailing slashes. */
function buildPath(folder, entityId, fileName) {
  const cleanFolder = String(folder ?? 'misc').replace(/^\/+|\/+$/g, '')
  const base = entityId ? `${cleanFolder}/${String(entityId).replace(/[^a-zA-Z0-9._-]/g, '-')}` : cleanFolder
  return `${base}/${fileName}`
}

/**
 * Upload with progress.
 * @param {{ file: File, folder: string, entityId?: string|null,
 *           onProgress?: (percent:number)=>void }} options
 * @returns {Promise<{url:string, storagePath:string, fileName:string}>}
 */
export function uploadImage({ file, folder, entityId = null, onProgress }) {
  return new Promise((resolveUpload, rejectUpload) => {
    try {
      validateImageFile(file)
    } catch (error) {
      rejectUpload(error)
      return
    }

    const storagePath = buildPath(folder, entityId, safeFileName(file.name))
    const task = uploadBytesResumable(ref(storage, storagePath), file)

    task.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          const percent =
            snapshot.totalBytes > 0
              ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
              : 0
          onProgress(percent)
        }
      },
      (error) => {
        const friendly =
          error?.code === 'storage/unauthorized'
            ? 'You do not have permission to upload images.'
            : error?.code === 'storage/canceled'
              ? 'The upload was cancelled.'
              : error?.code === 'storage/retry-limit-exceeded'
                ? 'The network dropped during upload — please try again.'
                : 'The image could not be uploaded. Please try again.'
        rejectUpload(Object.assign(new Error(friendly), { cause: error }))
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref)
          resolveUpload({ url, storagePath, fileName: task.snapshot.ref.name })
        } catch {
          rejectUpload(new Error('Upload finished but the link could not be created.'))
        }
      },
    )
  })
}

/**
 * Derive a Storage path from any Firebase download URL. Returns null for
 * URLs that are not from this bucket (CDN/external images).
 */
export function extractStoragePath(downloadUrl) {
  if (!downloadUrl || !downloadUrl.includes('/o/')) return null
  try {
    const encoded = downloadUrl.split('/o/')[1].split('?')[0]
    return decodeURIComponent(encoded)
  } catch {
    return null
  }
}

/** Delete a Storage object by explicit path — refuses anything outside our folders. */
export async function deleteImageByPath(storagePath) {
  if (!storagePath || !DELETABLE_PREFIXES.some((prefix) => storagePath.startsWith(prefix))) {
    return false
  }
  try {
    await deleteObject(ref(storage, storagePath))
    return true
  } catch (error) {
    // Already gone is fine — deletion is always best-effort cleanup.
    if (error?.code === 'storage/object-not-found') return false
    throw Object.assign(new Error('The image file could not be deleted.'), { cause: error })
  }
}

/**
 * Best-effort delete from a stored download URL (legacy docs that never saved
 * storagePath). Silently ignores non-Storage URLs such as CDN placeholders.
 */
export async function deleteImageByUrl(downloadUrl) {
  const path = extractStoragePath(downloadUrl)
  if (!path) return false
  return deleteImageByPath(path)
}

/** List every image currently in a folder (picker library view). */
export async function listFolderImages(folder, entityId = null) {
  const cleanFolder = String(folder ?? '').replace(/^\/+|\/+$/g, '')
  const path = entityId ? `${cleanFolder}/${entityId}` : cleanFolder
  try {
    const listing = await listAll(ref(storage, path))
    const items = await Promise.all(
      listing.items.map(async (item) => ({
        name: item.name,
        storagePath: item.fullPath,
        url: await getDownloadURL(item),
      })),
    )
    // Newest first — generated names start with Date.now().
    return items.sort((a, b) => b.name.localeCompare(a.name))
  } catch (error) {
    if (error?.code === 'storage/object-not-found') return [] // empty folder
    throw Object.assign(new Error('Could not load uploaded images.'), { cause: error })
  }
}
