import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

function normalise(item, index) {
  if (typeof item === 'string') return { id: `${index}-${item}`, src: item, title: '' }
  return { id: item.id ?? `${index}-${item.src}`, ...item }
}

export default function GalleryReel({ items = [] }) {
  const photos = items.map(normalise)
  const [activeIndex, setActiveIndex] = useState(null)
  const open = activeIndex !== null

  const step = useCallback(
    (direction) => {
      setActiveIndex((current) => {
        if (current === null) return current
        return (current + direction + photos.length) % photos.length
      })
    },
    [photos.length],
  )

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  if (photos.length === 0) return null

  const active = open ? photos[activeIndex] : null

  return (
    <>
      {/* ── Continuously moving reel ────────────────────────────── */}
      <div className="gallery-reel" aria-hidden="true">
        <div className="gallery-reel__track">
          {[...photos, ...photos].map((photo, i) => (
            <button
              key={`${photo.id}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i % photos.length)}
              aria-label={`View photo${photo.title ? `: ${photo.title}` : ''}`}
              className="gallery-reel__item"
            >
              <img
                src={photo.src}
                alt={photo.title || ''}
                className="gallery-reel__img"
                loading="lazy"
              />
              <span className="gallery-reel__overlay" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Lightbox ────────────────────────────────────────────── */}
      {open && active && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close photo viewer"
            onClick={() => setActiveIndex(null)}
            className="gallery-lightbox__backdrop"
          />

          {/* Content */}
          <div className="gallery-lightbox__content">
            {/* Image */}
            <div className="gallery-lightbox__image-wrap">
              <img
                src={active.src}
                alt={active.title || ''}
                className="gallery-lightbox__img"
              />
            </div>

            {/* Info bar */}
            <div className="gallery-lightbox__bar">
              <div className="gallery-lightbox__info">
                {active.title && (
                  <p className="gallery-lightbox__title">{active.title}</p>
                )}
                <p className="gallery-lightbox__meta">
                  {[active.destination, active.category].filter(Boolean).join(' \u00b7 ')}
                  {(active.destination || active.category) ? ' \u00b7 ' : ''}
                  {activeIndex + 1} of {photos.length}
                </p>
              </div>

              <div className="gallery-lightbox__controls">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="gallery-lightbox__btn"
                >
                  <ChevronLeft size={18} strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="gallery-lightbox__btn"
                >
                  <ChevronRight size={18} strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  aria-label="Close photo viewer"
                  className="gallery-lightbox__close"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
