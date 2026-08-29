import { Camera, Images } from 'lucide-react'
import { useMemo, useState } from 'react'
import GalleryGrid from '../components/sections/GalleryGrid'
import CTASection from '../components/sections/CTASection'
import Hero from '../components/sections/Hero'
import Button from '../components/ui/Button'
import FilterPills from '../components/ui/FilterPills'
import { CardSkeletonGrid, EmptyState, ErrorState } from '../components/ui/States'
import { GALLERY_CATEGORIES } from '../data/constants'
import { img } from '../data/images'
import { usePublishedGallery } from '../firebase/collections/gallery'

export default function Gallery() {
  const [category, setCategory] = useState('All')

  // Live Firestore subscription — published items only (legacy docs included).
  const { data, loading, error, reload } = usePublishedGallery()

  const options = useMemo(() => {
    const list = data ?? []
    return [
      { value: 'All', label: 'All photos', count: list.length },
      ...GALLERY_CATEGORIES.filter((name) => list.some((item) => item.category === name)).map(
        (name) => ({
          value: name,
          label: name,
          count: list.filter((item) => item.category === name).length,
        }),
      ),
    ]
  }, [data])

  const visible = useMemo(
    () => (data ?? []).filter((item) => category === 'All' || item.category === category),
    [data, category],
  )

  return (
    <>
      <Hero
        size="page"
        image={img.aerialCoast}
        eyebrow="Gallery"
        title="Scenes from twelve years on the road"
        lead="Destination frames, hotel rooms, group photos and the small in-between moments our travellers send back after every trip."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Gallery' }]}
      />

      <section className="shell py-12 sm:py-16">
        {/* Category filter */}
        <div className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
          <FilterPills
            label="Photo category"
            options={options}
            value={category}
            onChange={setCategory}
          />
        </div>

        <div className="mt-8">
          {loading && <CardSkeletonGrid count={6} />}

          {!loading && error && (
            <ErrorState
              title="Could not load the gallery"
              message="Something went wrong while fetching photos."
              onRetry={reload}
            />
          )}

          {!loading && !error && visible.length === 0 && (
            <EmptyState
              icon={Images}
              title={`No ${category.toLowerCase()} photos yet`}
              message="New albums are added after every season. Check another category or come back soon."
              action={
                <Button variant="outline" size="sm" onClick={() => setCategory('All')}>
                  View all photos
                </Button>
              }
            />
          )}

          {!loading && !error && visible.length > 0 && (
            <>
              <p className="mb-6 flex items-center gap-2 text-sm font-medium text-navy-500">
                <Camera size={15} aria-hidden="true" />
                Showing <span className="font-bold text-navy-900">{visible.length}</span>{' '}
                {visible.length === 1 ? 'photo' : 'photos'}
                {category !== 'All' && (
                  <>
                    {' '}
                    in <span className="font-bold text-navy-900">{category}</span>
                  </>
                )}
              </p>

              <GalleryGrid items={visible} columns="sm:grid-cols-2 lg:grid-cols-3" />
            </>
          )}
        </div>
      </section>

      <CTASection
        eyebrow="Be in the next album"
        title="Your trip could be in this gallery next season"
        lead="Pick a destination and a date — we will handle the rest, right down to the group photo at the viewpoint."
        image={img.campfire}
      />
    </>
  )
}
