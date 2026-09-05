import { ArrowRight, Camera } from 'lucide-react'
import { useMemo } from 'react'
import { usePublishedGallery } from '../../firebase/collections/gallery'
import Button from '../ui/Button'
import SectionTitle from '../ui/SectionTitle'
import { CardSkeletonGrid } from '../ui/States'
import GalleryReel from './GalleryReel'

/**
 * Homepage photo strip with a continuously moving horizontal reel.
 * Clicking any image opens a full-screen lightbox.
 */

const PREVIEW_COUNT = 6

export default function GalleryPreview({ count = PREVIEW_COUNT, className = '' }) {
  const { data, loading, error } = usePublishedGallery()

  const preview = useMemo(() => (data ?? []).slice(0, count), [data, count])
  const total = (data ?? []).length

  if (!loading && (error || preview.length === 0)) return null

  return (
    <section className={`bg-white py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            eyebrow="From our albums"
            title="Photographs our travellers sent back"
            lead="Unstaged frames from the last few seasons — viewpoints, houseboats, hotel breakfasts and the group photo nobody wanted to pose for."
          />
          <Button to="/gallery" variant="outline" size="md" iconRight={ArrowRight}>
            View Full Gallery
          </Button>
        </div>

        <div className="mt-12">
          {loading ? (
            <CardSkeletonGrid count={count} className="grid-cols-2 lg:grid-cols-3" />
          ) : (
            <>
              <GalleryReel items={preview} />

              {total > preview.length && (
                <p className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-navy-500">
                  <Camera size={16} aria-hidden="true" />
                  Showing {preview.length} of{' '}
                  <span className="font-bold text-navy-900">{total} photographs</span>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
