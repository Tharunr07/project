import { ImageOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/**
 * Image with a skeleton while loading and a branded fallback on failure.
 * Used everywhere instead of a bare <img> so a dead URL never shows a broken
 * icon — which matters in Phase 1, where all imagery is placeholder content.
 *
 * NOTE ON POSITIONING: the wrapper hard-codes `relative`, and Tailwind emits
 * `.relative` after `.absolute`, so a caller passing plain `absolute` is
 * silently overridden. Overlay callers must use the important suffix —
 * `absolute!` — the same convention the project uses for `object-contain!`.
 */
export default function SmartImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  ratio = '',
  loading = 'lazy',
  fetchPriority,
  onReady,
  fallbackSrc = '',
  sizes,
  children,
  ...rest
}) {
  const [status, setStatus] = useState('loading')
  const [failedOver, setFailedOver] = useState(false)
  const imgRef = useRef(null)

  // Show the fallback photo instead of the error card once the primary dies.
  const current = failedOver && fallbackSrc ? fallbackSrc : src

  /** Notify listeners (e.g. the hero's readiness gate) once decoded. */
  const markReady = () => {
    setStatus('ready')
    onReady?.()
  }

  const handleError = () => {
    if (fallbackSrc && current !== fallbackSrc) {
      setFailedOver(true)
      setStatus('loading')
      return
    }
    setStatus('error')
  }

  // A changed src restarts the cycle — matters for the gallery lightbox.
  useEffect(() => {
    setFailedOver(false)
    setStatus('loading')
  }, [src])

  // A cached image can finish decoding before React attaches onLoad, which
  // would leave `status` stuck at 'loading' and the <img> pinned at opacity-0
  // — a permanently blank frame. Reading `complete` after commit catches it.
  useEffect(() => {
    const node = imgRef.current
    if (!node?.complete) return
    if (node.naturalWidth > 0) markReady()
    else handleError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, current])

  return (
    <div
      className={`relative overflow-hidden bg-navy-100 ${ratio} ${className}`}
      {...rest}
    >
      {status === 'loading' && <div className="absolute inset-0 skeleton" aria-hidden="true" />}

      {status === 'error' ? (
        <div
          className="absolute inset-0 grid place-content-center gap-2 justify-items-center bg-linear-to-br from-navy-800 to-navy-950 text-navy-300"
          role="img"
          aria-label={alt}
        >
          <ImageOff size={26} strokeWidth={1.5} aria-hidden="true" />
          <span className="px-4 text-center text-[0.6875rem] font-medium tracking-wide uppercase">
            Image unavailable
          </span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={current}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          sizes={sizes}
          decoding="async"
          onLoad={() => markReady()}
          onError={handleError}
          className={`size-full object-cover transition-opacity duration-700 ${
            status === 'ready' ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}

      {children}
    </div>
  )
}

