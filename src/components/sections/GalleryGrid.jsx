import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import SmartImage from '../ui/SmartImage'

/**
 * Responsive photo grid with a keyboard-navigable lightbox.
 * Shared by the Gallery page, destination details and package details, so the
 * viewing experience is identical everywhere.
 *
 * `items` accepts plain URL strings or objects: { id?, src, title?, category?, destination?, date? }
 */

function normalise(item, index) {
  if (typeof item === 'string') return { id: `${index}-${item}`, src: item, title: '' }
  return { id: item.id ?? `${index}-${item.src}`, ...item }
}

export default function GalleryGrid({ items = [], columns = 'sm:grid-cols-2 lg:grid-cols-3' }) {
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
    const onKey = (event) => {
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  if (photos.length === 0) return null

  const active = open ? photos[activeIndex] : null

  return (
    <>
      <ul className={`grid gap-4 ${columns}`}>
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View photo${photo.title ? `: ${photo.title}` : ''}`}
              className="group relative block w-full cursor-pointer overflow-hidden rounded-3xl shadow-card transition-all duration-400 hover:-translate-y-1 hover:shadow-lift"
            >
              <SmartImage
                src={photo.src}
                alt={photo.title || ''}
                ratio="aspect-4/3"
                imgClassName="transition-transform duration-700 ease-out group-hover:scale-107"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-navy-950/80 via-navy-950/5 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="absolute top-3 right-3 grid size-9 place-content-center rounded-full bg-white/90 text-navy-900 opacity-0 backdrop-blur transition-all duration-400 group-hover:opacity-100"
              >
                <Expand size={16} strokeWidth={2.2} />
              </span>

              {(photo.title || photo.destination) && (
                <span className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-left opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                  {photo.title && (
                    <span className="block font-display text-base font-bold text-white">
                      {photo.title}
                    </span>
                  )}
                  {photo.destination && (
                    <span className="mt-0.5 block text-xs font-semibold text-navy-200">
                      {photo.destination}
                      {photo.category ? ` · ${photo.category}` : ''}
                    </span>
                  )}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={open}
        onClose={() => setActiveIndex(null)}
        size="full"
        bare
        className="bg-transparent! shadow-none! max-h-[94vh] rounded-none! sm:rounded-none!"
      >
        {active && (
          <div className="relative">
            <SmartImage
              src={active.src}
              alt={active.title || ''}
              loading="eager"
              ratio="aspect-16/10"
              className="max-h-[74vh] rounded-2xl bg-navy-950"
              imgClassName="object-contain!"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-navy-950/85 px-5 py-4 backdrop-blur">
              <div className="min-w-0">
                {active.title && (
                  <p className="truncate font-display text-lg font-bold text-white">
                    {active.title}
                  </p>
                )}
                <p className="mt-0.5 text-xs font-semibold text-navy-300">
                  {[active.destination, active.category].filter(Boolean).join(' · ')}
                  {active.destination || active.category ? ' · ' : ''}
                  {activeIndex + 1} of {photos.length}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="grid size-10 cursor-pointer place-content-center rounded-full bg-white/12 text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/25"
                >
                  <ChevronLeft size={18} strokeWidth={2.2} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="grid size-10 cursor-pointer place-content-center rounded-full bg-white/12 text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/25"
                >
                  <ChevronRight size={18} strokeWidth={2.2} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  aria-label="Close photo viewer"
                  className="grid size-10 cursor-pointer place-content-center rounded-full bg-crimson-600 text-white transition-colors hover:bg-crimson-700"
                >
                  <X size={18} strokeWidth={2.2} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
