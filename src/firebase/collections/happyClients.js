import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import {
  deleteDocById,
  pruneUndefined,
  subscribeCollection,
  updateDocFields,
} from '../firestore'
import { db } from '../config'
import { useSubscription } from '../hooks'

/**
 * `happyClients` collection service.
 *
 * Each document represents one Happy Client / institutional testimonial
 * shown in the Home Page marquee carousel.
 *
 * Fields:
 *   organizationName   — college / school / corporate name
 *   organizationType   — College | School | University | Institution | Corporate | Group | Family | Other
 *   logoUrl            — institution logo URL (object-fit: contain)
 *   imageUrl           — trip / testimonial photo (object-fit: cover)
 *   review             — short testimonial text
 *   destination        — trip destination name
 *   tripType           — e.g. College Tour, School Trip, Family Holiday
 *   location           — city / region of the institution
 *   displayOrder       — numeric sort key (ascending)
 *   isFeatured         — boolean, prioritised on Home Page
 *   isActive           — boolean, visible on Home Page only when true
 *   createdAt          — server timestamp
 *   updatedAt          — server timestamp
 */

const COLLECTION = 'happyClients'

const ORGANIZATION_TYPES = [
  'College',
  'School',
  'University',
  'Institution',
  'Corporate',
  'Group',
  'Family',
  'Other',
]

export { ORGANIZATION_TYPES }

function byOrder(list) {
  return [...list].sort((a, b) => (a.displayOrder ?? 999999) - (b.displayOrder ?? 999999))
}

/** All happy clients — admin screen. */
export function subscribeHappyClients() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, { onData: (list) => onData(byOrder(list)), onError })
}

/** Active happy clients for the public Home Page marquee. */
export function subscribeActiveHappyClients() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, {
      filters: [where('isActive', '==', true)],
      onData: (list) => onData(byOrder(list)),
      onError,
    })
}

/** Create or update a happy client. Auto-ID on create. */
export async function saveHappyClient(next, existing = null) {
  const clean = pruneUndefined({ ...next })

  if (existing) {
    const { id: ignoredId, ...fields } = clean
    void ignoredId
    try {
      await updateDocFields(COLLECTION, existing.id, fields)
    } catch (error) {
      throw Object.assign(new Error('Could not update the happy client.'), { cause: error })
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
    throw Object.assign(new Error('Could not save the happy client.'), { cause: error })
  }
}

/** Partial update. */
export async function updateHappyClientFields(id, fields) {
  try {
    await updateDocFields(COLLECTION, id, fields)
  } catch (error) {
    throw Object.assign(new Error('Could not update the happy client.'), { cause: error })
  }
}

/** Delete a happy client. */
export async function deleteHappyClient(id) {
  try {
    await deleteDocById(COLLECTION, id)
  } catch (error) {
    throw Object.assign(new Error('Could not delete the happy client.'), { cause: error })
  }
}

/**
 * DEMO / PLACEHOLDER DATA — temporary institutional testimonials for UI
 * demonstration only. These are NOT real customer reviews. Replace from
 * Admin once genuine testimonials are available.
 */
const SEED_HAPPY_CLIENTS = [
  {
    organizationName: 'ABC College of Engineering',
    organizationType: 'College',
    review: 'Avengers Holidays made our college trip smooth, comfortable and truly memorable.',
    destination: 'Ooty',
    tripType: 'College Tour',
    location: 'Chennai, Tamil Nadu',
    imageUrl: '/1.jpeg',
  },
  {
    organizationName: 'Green Valley Matriculation School',
    organizationType: 'School',
    review: 'Our students enjoyed a safe and well-organized trip with excellent travel support.',
    destination: 'Kodaikanal',
    tripType: 'School Trip',
    location: 'Chennai, Tamil Nadu',
    imageUrl: '/2.jpeg',
  },
  {
    organizationName: 'Sunrise Technologies',
    organizationType: 'Corporate',
    review: 'Everything was planned perfectly, from transportation to accommodation. A wonderful experience.',
    destination: 'Coorg',
    tripType: 'Corporate Outing',
    location: 'Bengaluru, Karnataka',
    imageUrl: '/3.jpeg',
  },
  {
    organizationName: 'City Arts & Science College',
    organizationType: 'College',
    review: 'The entire journey was well coordinated and our students had an amazing experience.',
    destination: 'Munnar',
    tripType: 'Educational Trip',
    location: 'Coimbatore, Tamil Nadu',
    imageUrl: '/4.jpeg',
  },
  {
    organizationName: 'Happy Family Tours',
    organizationType: 'Family',
    review: 'Our family holiday was comfortable, enjoyable and beautifully organized from start to finish.',
    destination: 'Wayanad',
    tripType: 'Family Holiday',
    location: 'Chennai, Tamil Nadu',
    imageUrl: '/5.jpeg',
  },
  {
    organizationName: 'NextGen Solutions',
    organizationType: 'Corporate',
    review: 'Professional service, comfortable travel and excellent coordination throughout the trip.',
    destination: 'Pondicherry',
    tripType: 'Corporate Travel',
    location: 'Chennai, Tamil Nadu',
    imageUrl: '/1.jpeg',
  },
]

/**
 * Seed demo happy clients. Skips any organisation that already exists.
 * Returns the number of records inserted.
 */
export async function seedHappyClients() {
  try {
    const existing = await getDocs(query(collection(db, COLLECTION)))
    const existingNames = new Set(existing.docs.map((d) => d.data().organizationName))

    let inserted = 0
    for (let i = 0; i < SEED_HAPPY_CLIENTS.length; i++) {
      const item = SEED_HAPPY_CLIENTS[i]
      if (existingNames.has(item.organizationName)) continue

      await addDoc(collection(db, COLLECTION), {
        ...item,
        displayOrder: i,
        isActive: true,
        isFeatured: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      inserted++
    }
    console.log(`[HappyClients] Seeded ${inserted} of ${SEED_HAPPY_CLIENTS.length} demo clients`)
    return inserted
  } catch (error) {
    console.error('[HappyClients] Seed failed:', error.code ?? error.message, error)
    throw Object.assign(new Error('Could not seed Happy Clients.'), { cause: error })
  }
}

/* ── React hooks ─────────────────────────────────────────────────────────── */

/** All happy clients — admin. */
export function useHappyClients() {
  return useSubscription(subscribeHappyClients())
}

/** Active happy clients — public Home Page marquee. */
export function useActiveHappyClients() {
  return useSubscription(subscribeActiveHappyClients())
}
