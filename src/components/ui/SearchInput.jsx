import { Search, X } from 'lucide-react'

/**
 * Search box used by public listings and admin tables.
 * Kept separate from FormInput because it carries its own icon, clear button
 * and rounded pill styling rather than the labelled form-field chrome.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label = 'Search',
  className = '',
  size = 'md',
}) {
  const height = size === 'sm' ? 'h-10 text-sm' : 'h-12 text-[0.9375rem]'

  return (
    <div className={`relative ${className}`}>
      <Search
        size={17}
        strokeWidth={2.2}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-navy-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={`w-full rounded-full border border-sand-300 bg-white pr-11 pl-11 font-medium text-navy-900 transition-colors placeholder:text-navy-300 focus:border-crimson-500 focus:outline-none ${height}`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 cursor-pointer place-content-center rounded-full text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
        >
          <X size={15} strokeWidth={2.4} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
