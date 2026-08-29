import { MapPinned } from 'lucide-react'
import { useMemo, useState } from 'react'
import DestinationCard from '../components/cards/DestinationCard'
import CTASection from '../components/sections/CTASection'
import Hero from '../components/sections/Hero'
import Button from '../components/ui/Button'
import FilterPills from '../components/ui/FilterPills'
import SearchInput from '../components/ui/SearchInput'
import { CardSkeletonGrid, EmptyState, ErrorState } from '../components/ui/States'
import { img } from '../data/images'
import { usePublishedDestinations } from '../firebase/collections/destinations'

const SORTS = [
  { value: 'featured', label: 'Featured first' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'A – Z' },
]

export default function Destinations() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('featured')

  // Live Firestore subscription — published destinations only.
  const { data, loading, error, reload } = usePublishedDestinations()

  const categories = useMemo(() => {
    const list = data ?? []
    const counts = list.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1
      return acc
    }, {})
    return [
      { value: 'All', label: 'All destinations', count: list.length },
      ...Object.entries(counts).map(([value, count]) => ({ value, label: value, count })),
    ]
  }, [data])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    let list = (data ?? []).filter((destination) => {
      const matchesCategory = category === 'All' || destination.category === category
      const matchesTerm =
        !term ||
        [destination.name, destination.state, destination.tagline, destination.shortDescription]
          .join(' ')
          .toLowerCase()
          .includes(term)
      return matchesCategory && matchesTerm
    })

    list = [...list]
    switch (sort) {
      case 'price-low':
        list.sort((a, b) => a.startingPrice - b.startingPrice)
        break
      case 'price-high':
        list.sort((a, b) => b.startingPrice - a.startingPrice)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured))
    }
    return list
  }, [data, query, category, sort])

  const hasFilters = query.trim() !== '' || category !== 'All'
  const publishedCount = (data ?? []).length

  return (
    <>
      <Hero
        size="detail"
        image={img.valley}
        eyebrow="Where we travel"
        title={`${publishedCount || 'South India'} destination${publishedCount === 1 ? '' : 's'} we know street by street`}
        lead="Hill stations, backwaters, wildlife reserves and heritage towns across Tamil Nadu, Kerala and Karnataka — all within a comfortable drive of Coimbatore."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Destinations' }]}
      />

      <section className="shell py-12 sm:py-16">
        {/* Filter bar */}
        <div className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <SearchInput
              value={query}
              onChange={setQuery}
              label="Search destinations"
              placeholder="Search a destination, state or experience…"
            />
            <div className="flex items-center gap-3">
              <label
                htmlFor="destination-sort"
                className="shrink-0 text-sm font-semibold text-navy-500"
              >
                Sort
              </label>
              <select
                id="destination-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-12 w-full cursor-pointer rounded-full border border-sand-300 bg-white px-4 text-[0.9375rem] font-medium text-navy-900 focus:border-crimson-500 focus:outline-none lg:w-56"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 border-t border-sand-200 pt-4">
            <FilterPills
              label="Destination category"
              options={categories}
              value={category}
              onChange={setCategory}
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          {loading && <CardSkeletonGrid count={6} />}

          {!loading && error && (
            <ErrorState
              title="Could not load destinations"
              message="Something went wrong while fetching the destination list."
              onRetry={reload}
            />
          )}

          {!loading && !error && visible.length === 0 && (
            <EmptyState
              icon={MapPinned}
              title="No destinations match that search"
              message={
                hasFilters
                  ? 'Try a different keyword, or clear the filters to see every destination.'
                  : 'The destination list is empty right now.'
              }
              action={
                hasFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery('')
                      setCategory('All')
                    }}
                  >
                    Clear filters
                  </Button>
                ) : null
              }
            />
          )}

          {!loading && !error && visible.length > 0 && (
            <>
              <p className="mb-6 text-sm font-medium text-navy-500">
                Showing <span className="font-bold text-navy-900">{visible.length}</span>{' '}
                {visible.length === 1 ? 'destination' : 'destinations'}
                {category !== 'All' && (
                  <>
                    {' '}
                    in <span className="font-bold text-navy-900">{category}</span>
                  </>
                )}
              </p>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((destination, index) => (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    delay={index * 60}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <CTASection
        eyebrow="Not on the list?"
        title="Tell us where you want to go and we will build the trip"
        lead="We run custom circuits across South India every season — Rameswaram, Hampi, Gokarna, Chikmagalur and further. If it is drivable, we can plan it."
        image={img.mountainRoad}
      />
    </>
  )
}
