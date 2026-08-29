import { PackageSearch, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PackageCard from '../components/cards/PackageCard'
import CTASection from '../components/sections/CTASection'
import Hero from '../components/sections/Hero'
import Button from '../components/ui/Button'
import FilterPills from '../components/ui/FilterPills'
import SearchInput from '../components/ui/SearchInput'
import { CardSkeletonGrid, EmptyState, ErrorState } from '../components/ui/States'
import { img } from '../data/images'
import { usePublishedDestinations } from '../firebase/collections/destinations'
import { usePublishedPackages } from '../firebase/collections/packages'
import { formatCurrency } from '../utils/format'

const SORTS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'duration-short', label: 'Shortest trip' },
  { value: 'duration-long', label: 'Longest trip' },
  { value: 'rating', label: 'Top rated' },
]

const DURATIONS = [
  { value: 'All', label: 'Any length' },
  { value: 'short', label: '2 – 3 days' },
  { value: 'mid', label: '4 – 5 days' },
  { value: 'long', label: '6 days +' },
]

const BUDGETS = [
  { value: 'All', label: 'Any budget' },
  { value: 'under-10k', label: 'Under ₹10,000' },
  { value: '10k-15k', label: '₹10,000 – ₹15,000' },
  { value: 'above-15k', label: 'Above ₹15,000' },
]

function matchesDuration(pkg, filter) {
  if (filter === 'short') return pkg.days <= 3
  if (filter === 'mid') return pkg.days >= 4 && pkg.days <= 5
  if (filter === 'long') return pkg.days >= 6
  return true
}

function matchesBudget(pkg, filter) {
  if (filter === 'under-10k') return pkg.price < 10000
  if (filter === '10k-15k') return pkg.price >= 10000 && pkg.price <= 15000
  if (filter === 'above-15k') return pkg.price > 15000
  return true
}

export default function Packages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [destinationId, setDestinationId] = useState(searchParams.get('destination') ?? 'All')
  const [duration, setDuration] = useState('All')
  const [budget, setBudget] = useState('All')
  const [sort, setSort] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

  const { data, loading, error, reload } = usePublishedPackages()
  const { data: publishedDestinations } = usePublishedDestinations()
  const publishedCount = (data ?? []).length

  const destinationPills = useMemo(() => {
    const list = data ?? []
    return [
      { value: 'All', label: 'All destinations', count: list.length },
      ...(publishedDestinations ?? [])
        .filter((destination) => destination.published)
        .map((destination) => ({
          value: destination.id,
          label: destination.name,
          count: list.filter((pkg) => pkg.destinationId === destination.id).length,
        }))
        .filter((option) => option.count > 0),
    ]
  }, [data, publishedDestinations])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    const list = (data ?? []).filter((pkg) => {
      if (destinationId !== 'All' && pkg.destinationId !== destinationId) return false
      if (!matchesDuration(pkg, duration)) return false
      if (!matchesBudget(pkg, budget)) return false
      if (!term) return true
      return [pkg.name, pkg.destination, pkg.category, pkg.shortDescription, ...(pkg.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })

    const sorted = [...list]
    switch (sort) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'duration-short':
        sorted.sort((a, b) => a.days - b.days)
        break
      case 'duration-long':
        sorted.sort((a, b) => b.days - a.days)
        break
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      default:
        sorted.sort(
          (a, b) => Number(b.popular) - Number(a.popular) || Number(b.featured) - Number(a.featured),
        )
    }
    return sorted
  }, [data, query, destinationId, duration, budget, sort])

  const activeFilters =
    (query.trim() ? 1 : 0) +
    (destinationId !== 'All' ? 1 : 0) +
    (duration !== 'All' ? 1 : 0) +
    (budget !== 'All' ? 1 : 0)

  const priceRange = useMemo(() => {
    if (visible.length === 0) return null
    const prices = visible.map((pkg) => pkg.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [visible])

  const clearAll = () => {
    setQuery('')
    setDestinationId('All')
    setDuration('All')
    setBudget('All')
    setSearchParams({}, { replace: true })
  }

  const chooseDestination = (value) => {
    setDestinationId(value)
    if (value === 'All') setSearchParams({}, { replace: true })
    else setSearchParams({ destination: value }, { replace: true })
  }

  return (
    <>
      <Hero
        size="detail"
        image={img.roadTrip}
        eyebrow="Tour packages"
        title="Costed itineraries, ready to travel"
        lead={`${publishedCount} packages across ${(publishedDestinations ?? []).length} destinations. Every price below is per person on twin sharing and includes stay, private transport, listed meals and entry tickets.`}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Packages' }]}
      />

      <section className="shell py-12 sm:py-16">
        <div className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
            <SearchInput
              value={query}
              onChange={setQuery}
              label="Search packages"
              placeholder="Search a package, destination or theme…"
            />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort packages"
              className="h-12 cursor-pointer rounded-full border border-sand-300 bg-white px-4 text-[0.9375rem] font-medium text-navy-900 focus:border-crimson-500 focus:outline-none lg:w-56"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="md"
              icon={SlidersHorizontal}
              onClick={() => setShowFilters((value) => !value)}
              aria-expanded={showFilters}
            >
              Filters
              {activeFilters > 0 && (
                <span className="ml-1 grid size-5 place-content-center rounded-full bg-crimson-600 text-[0.625rem] font-bold text-white">
                  {activeFilters}
                </span>
              )}
            </Button>
          </div>

          <div className="mt-4 border-t border-sand-200 pt-4">
            <FilterPills
              label="Destination"
              options={destinationPills}
              value={destinationId}
              onChange={chooseDestination}
            />
          </div>

          {showFilters && (
            <div className="mt-4 grid animate-slide-down gap-5 border-t border-sand-200 pt-5 sm:grid-cols-2">
              <div>
                <p className="mb-2.5 text-xs font-bold tracking-wide text-navy-400 uppercase">
                  Trip length
                </p>
                <FilterPills
                  label="Trip length"
                  options={DURATIONS}
                  value={duration}
                  onChange={setDuration}
                />
              </div>
              <div>
                <p className="mb-2.5 text-xs font-bold tracking-wide text-navy-400 uppercase">
                  Budget per person
                </p>
                <FilterPills
                  label="Budget per person"
                  options={BUDGETS}
                  value={budget}
                  onChange={setBudget}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          {loading && <CardSkeletonGrid count={6} />}

          {!loading && error && (
            <ErrorState
              title="Could not load packages"
              message="Something went wrong while fetching the package list."
              onRetry={reload}
            />
          )}

          {!loading && !error && visible.length === 0 && (
            <EmptyState
              icon={PackageSearch}
              title="No packages match those filters"
              message="Try widening the budget or the trip length — or send us an enquiry and we will build a custom itinerary."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear filters
                  </Button>
                  <Button to="/enquire" variant="primary" size="sm">
                    Request a custom trip
                  </Button>
                </div>
              }
            />
          )}

          {!loading && !error && visible.length > 0 && (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm font-medium text-navy-500">
                  Showing <span className="font-bold text-navy-900">{visible.length}</span> of{' '}
                  {(data ?? []).length} packages
                  {priceRange && (
                    <>
                      {' · '}
                      {formatCurrency(priceRange.min)} – {formatCurrency(priceRange.max)} per person
                    </>
                  )}
                </p>
                {activeFilters > 0 && (
                  <Button variant="ghost" size="xs" onClick={clearAll}>
                    Clear all filters
                  </Button>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((pkg, index) => (
                  <PackageCard key={pkg.id} pkg={pkg} delay={index * 60} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <CTASection
        eyebrow="Custom itineraries"
        title="None of these fit? We build trips from scratch every week"
        lead="Tell us the number of travellers, the budget per head and how many days you have. We will send back a costed plan you can actually compare."
        image={img.busJourney}
      />
    </>
  )
}
