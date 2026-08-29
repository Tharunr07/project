import { MessageSquareQuote, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import ReviewCard from '../components/cards/ReviewCard'
import TestimonialCarousel from '../components/sections/TestimonialCarousel'
import CTASection from '../components/sections/CTASection'
import Hero from '../components/sections/Hero'
import Button from '../components/ui/Button'
import FilterPills from '../components/ui/FilterPills'
import Rating from '../components/ui/Rating'
import SectionTitle from '../components/ui/SectionTitle'
import { CardSkeletonGrid, EmptyState, ErrorState } from '../components/ui/States'
import { GROUP_TYPES } from '../data/constants'
import { img } from '../data/images'
import { averageRating as computeAverage, usePublishedReviews } from '../firebase/collections/reviews'

/** Stable empty-array identity so `data ?? EMPTY_LIST` never breaks memo deps. */
const EMPTY_LIST = []

export default function Reviews() {
  const [groupType, setGroupType] = useState('All')

  // Live Firestore subscription — published reviews only.
  const { data, loading, error, reload } = usePublishedReviews()

  const published = data ?? EMPTY_LIST
  const averageRating = computeAverage(published)

  /** Star histogram, five → one, as a share of all published reviews. */
  const distribution = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: published.filter((review) => review.rating === stars).length,
    }))
    return counts.map((row) => ({
      ...row,
      percent: published.length ? Math.round((row.count / published.length) * 100) : 0,
    }))
  }, [published])

  const options = useMemo(
    () => [
      { value: 'All', label: 'All groups', count: published.length },
      ...GROUP_TYPES.filter((type) => published.some((review) => review.groupType === type)).map(
        (type) => ({
          value: type,
          label: `${type} trips`,
          count: published.filter((review) => review.groupType === type).length,
        }),
      ),
    ],
    [published],
  )

  // Cheap client-side filter (small list) — memoization not required here.
  const visible =
    groupType === 'All' ? published : published.filter((review) => review.groupType === groupType)

  const hasFilters = groupType !== 'All'

  return (
    <>
      <Hero
        size="page"
        image={img.sunriseHill}
        eyebrow="Traveller stories"
        title="Reviews from the road, unedited"
        lead="Families, colleges, schools, friend circles and corporate teams on what worked — and what we could have done better."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Reviews' }]}
      />

      {/* Rating summary */}
      <section className="shell pt-12 sm:pt-16">
        <div className="grid items-center gap-10 rounded-4xl bg-navy-950 px-7 py-10 sm:px-12 lg:grid-cols-[auto_1fr] lg:gap-16 lg:py-12">
          <div className="text-center lg:text-left">
            <p className="font-display text-6xl leading-none font-extrabold text-white tabular-nums sm:text-7xl">
              {averageRating.toFixed(1)}
            </p>
            <Rating value={averageRating} size="md" className="mt-4 justify-center lg:justify-start" />
            <p className="mt-3 text-sm font-semibold text-navy-300">
              Average across{' '}
              <span className="font-bold text-white">{published.length} verified reviews</span>
            </p>
          </div>

          <ul className="space-y-3">
            {distribution.map(({ stars, count, percent }) => (
              <li key={stars} className="flex items-center gap-4">
                <span className="flex w-14 shrink-0 items-center justify-end gap-1 text-sm font-bold text-white tabular-nums">
                  {stars}
                  <Star size={13} className="fill-brand-500 text-brand-500" aria-hidden="true" />
                </span>
                <span
                  aria-hidden="true"
                  className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10"
                >
                  <span
                    className="block h-full rounded-full bg-linear-to-r from-brand-600 to-brand-400 transition-[width] duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right text-xs font-semibold text-navy-300 tabular-nums">
                  {count} · {percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured carousel */}
      <section className="shell py-12 sm:py-16">
        <SectionTitle
          eyebrow="Highlights"
          title="What travellers remember most"
          lead="Swipe through the stories our coordinators hear quoted back to them at the next year's booking."
        />
        <div className="mt-10">
          {loading ? (
            <CardSkeletonGrid count={3} className="sm:grid-cols-2 lg:grid-cols-3" />
          ) : (
            <TestimonialCarousel reviews={published.filter((review) => review.featured)} tone="light" />
          )}
        </div>
      </section>

      {/* All reviews */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="shell">
          <SectionTitle
            eyebrow="Every review"
            title="The full guestbook"
            lead="No curation beyond typos — every published review, filterable by the kind of group that travelled."
          />

          <div className="mt-8 rounded-3xl bg-sand-50 p-5 ring-1 ring-inset ring-sand-200 sm:p-6">
            <FilterPills
              label="Group type"
              options={options}
              value={groupType}
              onChange={setGroupType}
            />
          </div>

          <div className="mt-8">
            {loading && <CardSkeletonGrid count={6} />}

            {!loading && error && (
              <ErrorState
                title="Could not load reviews"
                message="Something went wrong while fetching the review list."
                onRetry={reload}
              />
            )}

            {!loading && !error && visible.length === 0 && (
              <EmptyState
                icon={MessageSquareQuote}
                title={`No ${groupType.toLowerCase()} trip reviews yet`}
                message="We publish new reviews after each season's trips return."
                action={
                  hasFilters ? (
                    <Button variant="outline" size="sm" onClick={() => setGroupType('All')}>
                      Show all reviews
                    </Button>
                  ) : null
                }
              />
            )}

            {!loading && !error && visible.length > 0 && (
              <>
                <p className="mb-6 text-sm font-medium text-navy-500">
                  Showing <span className="font-bold text-navy-900">{visible.length}</span>{' '}
                  {visible.length === 1 ? 'review' : 'reviews'}
                  {hasFilters && (
                    <>
                      {' '}
                      from <span className="font-bold text-navy-900">{groupType}</span> groups
                    </>
                  )}
                </p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((review, index) => (
                    <ReviewCard key={review.id} review={review} delay={(index % 6) * 60} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Add your story"
        title="Join the thousands who have travelled with us"
        lead="Plan the trip first. The review can wait until you are back — we only ask for it once the bus is home safe."
        image={img.familyBeach}
      />
    </>
  )
}
