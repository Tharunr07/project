import { addDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore'
import {
  deleteDocById,
  pruneUndefined,
  subscribeCollection,
  updateDocFields,
} from '../firestore'
import { db } from '../config'
import { useSubscription } from '../hooks'

/**
 * `routeDestinations` collection service.
 *
 * Each document represents one stop on the "South India by Road" journey.
 *
 * Fields:
 *   id              — auto-generated Firestore ID
 *   name            — destination display name, e.g. "Ooty"
 *   state           — state / UT label, e.g. "Tamil Nadu"
 *   image           — img registry key, e.g. "greenHills" (resolved at render)
 *   duration        — trip duration string, e.g. "2N / 3D"
 *   price           — display price string, e.g. "₹9,500"
 *   routeProgress   — 0–100, how far along the bus route this stop sits (evenly spread by default)
 *   order           — display order (1-based, ascending)
 *   isActive        — boolean, whether this stop shows on the public site
 *   createdAt       — server timestamp
 *   updatedAt       — server timestamp
 */

const COLLECTION = 'routeDestinations'

const SEED_ROUTE_DESTINATIONS = [
  {
    name: 'Ooty',
    state: 'Tamil Nadu',
    image: 'greenHills',
    duration: '2N / 3D',
    price: '₹9,500',
    description: 'Colonial-era gardens, toy-train ridgelines and tea slopes that run all the way to the horizon.',
    slug: 'ooty',
  },
  {
    name: 'Kodaikanal',
    state: 'Tamil Nadu',
    image: 'heroMist',
    duration: '2N / 3D',
    price: '₹8,800',
    description: 'Mist-clad valleys, rocky outcrops and shola forests wrapped around a star-shaped lake.',
    slug: 'kodaikanal',
  },
  {
    name: 'Munnar',
    state: 'Kerala',
    image: 'teaEstate',
    duration: '3N / 4D',
    price: '₹11,200',
    description: 'Rolling tea estates at 1,600 m with crisp mountain air and sunrise viewpoints.',
    slug: 'munnar',
  },
  {
    name: 'Coorg',
    state: 'Karnataka',
    image: 'forestPath',
    duration: '2N / 3D',
    price: '₹10,500',
    description: 'Coffee plantations, forest trails and the quiet warmth of Kodagu hospitality.',
    slug: 'coorg',
  },
  {
    name: 'Pondicherry',
    state: 'Puducherry',
    image: 'beach',
    duration: '2N / 3D',
    price: '₹8,200',
    description: 'French-colonial lanes, turquoise beaches and the spiritual calm of Auroville.',
    slug: 'pondicherry',
  },
  {
    name: 'Kerala Backwaters',
    state: 'Kerala',
    image: 'keralaBoat',
    duration: '4N / 5D',
    price: '₹13,500',
    description: 'Houseboat drift through palm-lined canals and still lagoons of the Alleppey backwaters.',
    slug: 'kerala',
  },
]

const ROUTE_STATS_DEFAULTS = [
  { value: '723 km', label: 'Total Distance', icon: '↗' },
  { value: '19.5 hrs', label: 'Total Drive Time', icon: '◷' },
  { value: '6', label: 'Destinations', icon: '◉' },
  { value: '1', label: 'Epic Journey', icon: '◆' },
]

export { SEED_ROUTE_DESTINATIONS, ROUTE_STATS_DEFAULTS }

function byOrder(list) {
  return [...list].sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999))
}

/** All route destinations — admin screen. No server-side filters. */
export function subscribeRouteDestinations() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, { onData: (list) => onData(byOrder(list)), onError })
}

/** Only active route destinations — public site. */
export function subscribeActiveRouteDestinations() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, {
      onData: (list) => onData(byOrder(list.filter((d) => d.isActive === true))),
      onError,
    })
}

/** Create or update a route destination. Auto-ID on create. */
export async function saveRouteDestination(next, existing = null) {
  const clean = pruneUndefined({ ...next })

  if (existing) {
    const { id: ignoredId, ...fields } = clean
    void ignoredId
    try {
      await updateDocFields(COLLECTION, existing.id, fields)
    } catch (error) {
      throw Object.assign(new Error('Could not update the route destination.'), { cause: error })
    }
    return existing.id
  }

  const payload = {
    ...clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  try {
    const reference = await addDoc(collection(db, COLLECTION), payload)
    return reference.id
  } catch (error) {
    throw Object.assign(new Error('Could not save the route destination.'), { cause: error })
  }
}

/** Partial update. */
export async function updateRouteDestinationFields(id, fields) {
  try {
    await updateDocFields(COLLECTION, id, fields)
  } catch (error) {
    throw Object.assign(new Error('Could not update the route destination.'), { cause: error })
  }
}

/** Delete a route destination. */
export async function deleteRouteDestination(id) {
  try {
    await deleteDocById(COLLECTION, id)
  } catch (error) {
    throw Object.assign(new Error('Could not delete the route destination.'), { cause: error })
  }
}

/**
 * Seed the default route destinations. Skips any name that already exists.
 * Returns the number of records inserted.
 */
export async function seedRouteDestinations() {
  try {
    const existing = await getDocs(query(collection(db, COLLECTION)))
    const existingNames = new Set(existing.docs.map((d) => d.data().name))

    let inserted = 0
    for (let i = 0; i < SEED_ROUTE_DESTINATIONS.length; i++) {
      const item = SEED_ROUTE_DESTINATIONS[i]
      if (existingNames.has(item.name)) continue

      await addDoc(collection(db, COLLECTION), {
        ...item,
        routeProgress: Math.round((i / (SEED_ROUTE_DESTINATIONS.length - 1)) * 100),
        order: i + 1,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      inserted++
    }
    console.log(`[RouteDestinations] Seeded ${inserted} of ${SEED_ROUTE_DESTINATIONS.length} default stops`)
    return inserted
  } catch (error) {
    console.error('[RouteDestinations] Seed failed:', error.code ?? error.message, error)
    throw Object.assign(new Error('Could not seed route destinations.'), { cause: error })
  }
}

/* ── React hooks ─────────────────────────────────────────────────────────── */

/** All route destinations — admin. */
export function useRouteDestinations() {
  return useSubscription(subscribeRouteDestinations())
}

/** Active route destinations — public site. */
export function useActiveRouteDestinations() {
  return useSubscription(subscribeActiveRouteDestinations())
}
