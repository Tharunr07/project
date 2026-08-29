import {
  Check,
  CloudUpload,
  ImageIcon,
  Images,
  Link2,
  Loader2,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { imageKeys, img } from '../../data/images'
import { deleteImageByPath, listFolderImages, uploadImage, validateImageFile } from '../../firebase/storage'
import Button from '../ui/Button'
import FormInput from '../ui/FormInput'
import Modal from '../ui/Modal'
import SmartImage from '../ui/SmartImage'

/**
 * Media picker — PHASE 2C.
 *
 * Three ways to choose, one identical `onSelect(url)` contract:
 *   • Upload   — file → Firebase Storage (progress bar) → download URL
 *   • Library  — uploaded files in the folder + the branded demo registry
 *   • URL      — paste any external image link (Phase 1 behaviour preserved)
 *
 * `folder` routes uploads to packages/ destinations/ gallery/ reviews/
 * company/; pass `entityId` for per-document subfolders. The visual design
 * language of the Phase 1 picker is preserved.
 */

const TABS = [
  { id: 'upload', label: 'Upload', icon: CloudUpload },
  { id: 'library', label: 'Library', icon: Images },
  { id: 'url', label: 'Paste URL', icon: Link2 },
]

export default function ImagePickerModal({
  open,
  onClose,
  onSelect,
  title = 'Choose an image',
  folder = 'packages',
  entityId = null,
}) {
  const [tab, setTab] = useState('upload')

  // Upload state
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  // Library state
  const [uploads, setUploads] = useState([])
  const [loadingUploads, setLoadingUploads] = useState(false)

  // URL state
  const [url, setUrl] = useState('')

  const registryChoices = useMemo(
    () => imageKeys.map((key) => ({ key, url: img[key] })),
    [],
  )

  const refreshLibrary = useCallback(async () => {
    setLoadingUploads(true)
    try {
      setUploads(await listFolderImages(folder, entityId))
    } catch {
      setUploads([]) // empty/unavailable folder — registry images still usable
    } finally {
      setLoadingUploads(false)
    }
  }, [folder, entityId])

  useEffect(() => {
    if (!open) return
    // Reset transient state each time the picker opens.
    setTab('upload')
    setFile(null)
    setPreviewUrl('')
    setProgress(0)
    setError(null)
    setUrl('')
    refreshLibrary()
  }, [open, refreshLibrary])

  /**
   * Commit the chosen image. `meta` carries `{ storagePath }` when the image
   * lives in our Storage bucket so callers can persist it alongside the URL;
   * registry/URL picks pass no meta. Callers that only care about the URL
   * keep working unchanged.
   */
  const commit = (value, meta = null) => {
    if (!value) return
    onSelect(value, meta)
    onClose()
  }

  const pickFile = (next) => {
    setError(null)
    setProgress(0)
    if (!next) {
      setFile(null)
      setPreviewUrl('')
      return
    }
    try {
      validateImageFile(next)
      setFile(next)
      setPreviewUrl(URL.createObjectURL(next))
    } catch (caught) {
      setFile(null)
      setPreviewUrl('')
      setError(caught.message)
    }
  }

  const startUpload = async () => {
    if (!file || uploading) return
    setUploading(true)
    setError(null)
    try {
      const { url: downloadUrl, storagePath } = await uploadImage({
        file,
        folder,
        entityId,
        onProgress: setProgress,
      })
      commit(downloadUrl, { storagePath })
    } catch (caught) {
      setError(caught.message)
    } finally {
      setUploading(false)
    }
  }

  const removeUpload = async (item) => {
    try {
      await deleteImageByPath(item.storagePath)
      setUploads((current) => current.filter((entry) => entry.storagePath !== item.storagePath))
    } catch (caught) {
      setError(caught.message ?? 'Could not delete that image.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="xl" title={title} description="Upload a photo to Firebase Storage, pick a previously uploaded image, or paste any image URL.">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl bg-sand-100 p-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id)
              setError(null)
            }}
            aria-pressed={tab === id}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              tab === id ? 'bg-navy-900 text-white shadow-card' : 'text-navy-600 hover:bg-white'
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border border-crimson-200 bg-crimson-50 px-4 py-3 text-sm font-semibold text-crimson-700">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* ── Upload ─────────────────────────────────────────────────────────── */}
      {tab === 'upload' && (
        <div className="mt-5">
          <label
            htmlFor="picker-file"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              pickFile(event.dataTransfer.files?.[0])
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-sand-300 bg-sand-50 px-6 py-10 text-center transition-colors hover:border-crimson-300 hover:bg-crimson-50/40"
          >
            <span className="grid size-12 place-content-center rounded-2xl bg-white text-crimson-600 shadow-card">
              <CloudUpload size={22} aria-hidden="true" />
            </span>
            <span className="text-sm font-bold text-navy-900">
              Drop an image here, or click to browse
            </span>
            <span className="text-xs font-medium text-navy-400">
              JPG · PNG · WEBP — up to 5 MB · stored in <code>{entityId ? `${folder}/${entityId}/` : `${folder}/`}</code>
            </span>
            <input
              id="picker-file"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={(event) => pickFile(event.target.files?.[0])}
            />
          </label>

          {previewUrl && (
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-inset ring-sand-200">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="size-20 shrink-0 rounded-2xl object-cover shadow-card"
              />
              <div className="min-w-40 flex-1">
                <p className="truncate text-sm font-bold text-navy-900">{file?.name}</p>
                <p className="text-xs text-navy-400">{Math.ceil((file?.size ?? 0) / 1024)} KB</p>

                {(uploading || progress > 0) && (
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-sand-200"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-crimson-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                {uploading && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-navy-500">
                    <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                    Uploading… {progress}%
                  </p>
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={CloudUpload}
                onClick={startUpload}
                loading={uploading}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : progress >= 100 ? 'Finishing…' : 'Upload image'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Library ────────────────────────────────────────────────────────── */}
      {tab === 'library' && (
        <div className="mt-5 max-h-[26rem] overflow-y-auto pr-1">
          {loadingUploads ? (
            <p className="flex items-center gap-2 py-8 text-center text-sm font-semibold text-navy-400">
              <Loader2 size={15} className="animate-spin" aria-hidden="true" /> Loading uploaded images…
            </p>
          ) : (
            uploads.length > 0 && (
              <>
                <p className="mb-2 text-xs font-bold tracking-wide text-navy-400 uppercase">
                  Uploaded ({uploads.length}) — stored in this project's Storage
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {uploads.map((item) => (
                    <div key={item.storagePath} className="group relative">
                      <button
                        type="button"
                        onClick={() => commit(item.url, { storagePath: item.storagePath })}
                        title={item.name}
                        className="block w-full cursor-pointer overflow-hidden rounded-2xl ring-1 ring-sand-200 transition-all hover:-translate-y-0.5 hover:ring-2 hover:ring-crimson-500"
                      >
                        <SmartImage src={item.url} alt={item.name} ratio="aspect-4/3" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => removeUpload(item)}
                        className="absolute -top-1.5 -right-1.5 grid size-6 cursor-pointer place-content-center rounded-full bg-white text-crimson-600 opacity-0 shadow-card transition-opacity group-hover:opacity-100 hover:bg-crimson-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )
          )}

          <p className={`mb-2 text-xs font-bold tracking-wide text-navy-400 uppercase ${uploads.length > 0 ? 'mt-5 border-t border-sand-200 pt-4' : ''}`}>
            Demo photo library
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {registryChoices.map(({ key, url: thumb }) => (
              <button
                key={key}
                type="button"
                onClick={() => commit(thumb)}
                title={key}
                className="group relative cursor-pointer overflow-hidden rounded-2xl ring-1 ring-sand-200 transition-all hover:-translate-y-0.5 hover:ring-2 hover:ring-crimson-500"
              >
                <SmartImage src={thumb} alt={key} ratio="aspect-4/3" />
                <span className="absolute inset-x-0 bottom-0 truncate bg-navy-950/70 px-2 py-1 text-[0.625rem] font-bold text-white">
                  {key}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── URL ────────────────────────────────────────────────────────────── */}
      {tab === 'url' && (
        <div className="mt-6 flex items-end gap-3">
          <FormInput
            id="picker-url"
            label="Or paste an image URL"
            icon={ImageIcon}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://…"
            className="flex-1"
          />
          <Button variant="primary" icon={Check} disabled={!url.trim()} onClick={() => commit(url.trim())}>
            Use URL
          </Button>
        </div>
      )}
    </Modal>
  )
}
