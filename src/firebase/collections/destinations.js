import { doc, getDoc, where } from 'firebase/firestore'
import {
  deleteDocById,
  fetchCollection,
  fetchDocById,
  pruneUndefined,
  subscribeCollection,
  subscribeDoc,
  updateDocFields,
  writeDocWithId,
} from '../firestore'
import { db } from '../config'
import { useSubscription } from '../hooks'

/**
 * `destinations` collection service — PHASE 2B.
 *
 * Documents keep the exact Phase 1 shape (see src/data/destinations.js):
 *   id, name, state, category, tagline, shortDescription, description,
 *   heroImage, cardImage, gallery[], startingPrice, duration, days,
 *   bestTime, altitude, distanceFromBase, rating, reviewCount,
 *   published, featured, attractions[{name, note}], highlights[]
 * plus sortOrder (stable display order), createdAt and updatedAt.
 *
 * `id` doubles as the URL slug used by /destinations/:id.
 */

const COLLECTION = 'destinations'

/** Stable display order — seeded docs carry their mock index; new ones append. */
function bySortOrder(list) {
  return [...list].sort((a, b) => (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999))
}

/** Live list of every destination (admin screens). */
export function subscribeDestinations() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, { onData: (list) => onData(bySortOrder(list)), onError })
}

/** Live list of published destinations only — customer website. */
export function subscribePublishedDestinations() {
  return (onData, onError) =>
    subscribeCollection(
      COLLECTION,
      { filters: [where('published', '==', true)], onData: (list) => onData(bySortOrder(list)), onError },
    )
}

/** Live single destination by id/slug — emits null when missing or id is empty. */
export function subscribeDestination(id) {
  return (onData, onError) => {
    if (!id) {
      onData(null)
      return undefined
    }
    return subscribeDoc(COLLECTION, id, { onData, onError })
  }
}

/** One-shot read of a single destination. */
export const getDestination = (id) => fetchDocById(COLLECTION, id)

/** Slugify a destination name into its document id / URL slug. */
export function slugifyDestinationId(name) {
  return (
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'destination'
  )
}

/** Guarantee a unique slug doc id (kodaikanal, kodaikanal-2 on clash). */
async function ensureUniqueId(base) {
  let candidate = base
  let suffix = 1
  for (;;) {
    const snapshot = await getDoc(doc(db, COLLECTION, candidate))
    if (!snapshot.exists()) return candidate
    suffix += 1
    candidate = `${base}-${suffix}`
  }
}

/** Highest existing sortOrder + 1, so new destinations append to the list. */
async function nextSortOrder() {
  try {
    const list = await fetchCollection(COLLECTION)
    return list.reduce((max, item) => Math.max(max, Number(item.sortOrder) || 0), 0) + 1
  } catch {
    return Date.now()
  }
}

/**
 * Create or update a destination. On create, guarantees a unique slug and
 * appends to the display order. createdAt is written once and never touched
 * again on updates. Returns the saved document id.
 */
export async function saveDestination(next, existing = null) {
  const clean = pruneUndefined({ ...next })
  delete clean.createdAt
  delete clean.updatedAt

  // Ensure attractions and highlights are always arrays — older Firestore
  // documents may lack these fields entirely, causing the public page to
  // render a blank section.
  if (!Array.isArray(clean.attractions)) clean.attractions = []
  if (!Array.isArray(clean.highlights)) clean.highlights = []

  if (existing) {
    const { id: ignoredId, ...fields } = clean // doc id lives only in the path
    void ignoredId
    await updateDocFields(COLLECTION, existing.id, fields)
    return existing.id
  }

  const id = await ensureUniqueId(slugifyDestinationId(clean.name ?? 'destination'))
  const { id: ignoredId, ...payload } = clean
  void ignoredId
  await writeDocWithId(COLLECTION, id, { ...payload, sortOrder: await nextSortOrder() })
  return id
}

/** Partial update — publish/featured toggles, price or copy edits. */
export const updateDestinationFields = (id, fields) => updateDocFields(COLLECTION, id, fields)

/** Remove a destination. Packages keep their own destinationName copies. */
export const deleteDestination = (id) => deleteDocById(COLLECTION, id)

/**
 * Default attractions & highlights for each destination — used to backfill
 * existing Firestore documents that were created before these fields existed.
 * Sourced from src/data/destinations.js (the static seed catalogue).
 */
const DEFAULT_ATTRACTIONS = {
  ooty: [
    { name: 'Botanical Gardens', note: '55 acres of terraced gardens and a 20-million-year-old fossil tree.' },
    { name: 'Ooty Lake & Boat House', note: 'Pedal and row boats; best light in the late afternoon.' },
    { name: 'Doddabetta Peak', note: 'Highest point in the Nilgiris at 2,637 m, with a telescope house.' },
    { name: 'Nilgiri Mountain Railway', note: 'UNESCO-listed steam ride between Ooty and Coonoor.' },
    { name: 'Tea Factory & Museum', note: 'Live processing floor plus tasting of estate-fresh grades.' },
    { name: 'Pykara Falls & Lake', note: 'Two-tier falls with a short boat run through shola forest.' },
  ],
  kodaikanal: [
    { name: "Coaker's Walk", note: '1 km paved cliff path with valley views and a telescope point.' },
    { name: 'Kodai Lake', note: 'Star-shaped lake; cycle the 5 km perimeter at sunrise.' },
    { name: 'Pillar Rocks', note: 'Three 120 m granite pillars, often half-hidden in cloud.' },
    { name: 'Bryant Park', note: 'Terraced botanical park beside the lake, famous for its glasshouse.' },
    { name: 'Pine Forest', note: 'Planted pine stand that has featured in dozens of films.' },
    { name: 'Silver Cascade Falls', note: '55 m roadside falls on the way up from Madurai.' },
  ],
  munnar: [
    { name: 'Eravikulam National Park', note: 'Home of the endangered Nilgiri tahr; shuttle access only.' },
    { name: 'Mattupetty Dam', note: 'Speedboat rides with tea slopes rising on both banks.' },
    { name: 'Top Station', note: 'Highest viewpoint in Munnar, looking across into Tamil Nadu.' },
    { name: 'Tea Museum, Nallathanni', note: 'Working demonstration factory run by KDHP.' },
    { name: 'Attukad Waterfalls', note: 'Broad cascade set between Munnar and Pallivasal.' },
    { name: 'Kundala Lake', note: 'Arch-dam lake with pedal boats and cherry blossom in season.' },
  ],
  coorg: [
    { name: 'Abbey Falls', note: 'Coffee-estate falls reached by a hanging bridge viewpoint.' },
    { name: "Raja's Seat", note: 'Madikeri sunset garden looking west over layered ridges.' },
    { name: 'Namdroling Monastery', note: 'The Golden Temple at Bylakuppe, with 18 m gilded statues.' },
    { name: 'Dubare Elephant Camp', note: 'Forest-department camp on the Kaveri river.' },
    { name: 'Talakaveri', note: 'Source of the Kaveri at Brahmagiri, 1,276 m.' },
    { name: 'Coffee & Spice Plantation', note: 'Guided walk through arabica, pepper and cardamom.' },
  ],
  wayanad: [
    { name: 'Edakkal Caves', note: 'Neolithic petroglyphs reached by a 45-minute uphill climb.' },
    { name: 'Chembra Peak', note: 'Highest peak in Wayanad with the heart-shaped lake en route.' },
    { name: 'Muthanga Wildlife Sanctuary', note: 'Dawn jeep safari — elephant, gaur and deer.' },
    { name: 'Soochipara Falls', note: 'Three-tier falls with a rock-climbing face beside it.' },
    { name: 'Banasura Sagar Dam', note: 'Largest earth dam in India, with island-speckled backwater.' },
    { name: 'Pookode Lake', note: 'Freshwater lake ringed by evergreen forest.' },
  ],
  mysore: [
    { name: 'Mysore Palace', note: 'Indo-Saracenic Amba Vilas; illuminated on Sundays and holidays.' },
    { name: 'Chamundi Hill', note: '1,000 steps or a road drive to the temple and city viewpoint.' },
    { name: 'Brindavan Gardens', note: 'Terraced gardens below KRS dam with a musical fountain show.' },
    { name: "St. Philomena's Cathedral", note: 'Neo-Gothic cathedral with 175 ft twin spires.' },
    { name: 'Devaraja Market', note: 'Century-old market for silk, sandalwood and flowers.' },
    { name: 'Srirangapatna', note: "Tipu Sultan's island fort, summer palace and Gumbaz." },
  ],
  pondicherry: [
    { name: 'French Quarter (White Town)', note: 'Heritage grid of colonial villas and cafés.' },
    { name: 'Promenade Beach', note: 'Traffic-free 1.5 km seafront; sunrise is the moment.' },
    { name: 'Auroville & Matrimandir', note: 'Experimental township; viewing pass needed in advance.' },
    { name: 'Paradise Beach', note: 'Reached by a 15-minute backwater boat from Chunnambar.' },
    { name: 'Sri Aurobindo Ashram', note: 'Rue de la Marine ashram at the heart of the old town.' },
    { name: 'Basilica of the Sacred Heart', note: 'Gothic revival basilica with stained-glass panels.' },
  ],
  kerala: [
    { name: 'Alleppey Houseboat', note: 'Overnight cruise with onboard cook and sundeck.' },
    { name: 'Fort Kochi', note: 'Chinese fishing nets, Jew Town and the Dutch Palace.' },
    { name: 'Kumarakom Bird Sanctuary', note: '14 acres on Vembanad lake; best at first light.' },
    { name: 'Kovalam Beach', note: 'Three crescent beaches under the Vizhinjam lighthouse.' },
    { name: 'Kathakali Performance', note: 'Full make-up and stagecraft demonstration in Kochi.' },
    { name: 'Marari Village Walk', note: 'Coir-making and toddy-tapping in a working village.' },
  ],
}

const DEFAULT_HIGHLIGHTS = {
  ooty: [
    'Toy-train ride on the UNESCO Nilgiri Mountain Railway',
    'Tea-estate walk with a factory tasting session',
    'Sunrise slot at Doddabetta before the crowds arrive',
  ],
  kodaikanal: [
    "Sunrise walk along Coaker's Walk before the mist lifts",
    'Guided shola-forest trail with a local naturalist',
    'Homemade chocolate and eucalyptus-oil market stop',
  ],
  munnar: [
    'Sunrise at Top Station above the cloud line',
    'Working tea estate walk plus factory tasting',
    'Cardamom and spice plantation tour with a grower',
  ],
  coorg: [
    'Overnight in a working coffee-plantation homestay',
    'White-water rafting on the Barapole (seasonal)',
    'Kodava-style lunch with pandi curry and akki roti',
  ],
  wayanad: [
    'Dawn jeep safari inside Muthanga Sanctuary',
    'Guided trek to Chembra heart-shaped lake',
    'Bamboo-rafting and zip-line activity block',
  ],
  mysore: [
    'Sunday-evening palace illumination slot',
    'Guided heritage walk through Devaraja market',
    'Musical fountain show at Brindavan Gardens',
  ],
  pondicherry: [
    'Sunrise cycle ride through the French Quarter',
    'Backwater boat crossing to Paradise Beach',
    'Café-hopping trail with a heritage-walk guide',
  ],
  kerala: [
    'Overnight Alleppey houseboat with all meals aboard',
    'Sunrise canoe ride through the narrow canals',
    'Traditional Keralan sadya served on a banana leaf',
  ],
}

/**
 * Backfill attractions & highlights for Firestore destinations that are
 * missing them. Called once from the admin seed UI — safe to re-run.
 * Returns the number of documents updated.
 */
export async function seedDestinationContent() {
  try {
    const all = await fetchCollection(COLLECTION)
    let updated = 0

    for (const dest of all) {
      const defaults = DEFAULT_ATTRACTIONS[dest.id]
      if (!defaults) continue

      const fields = {}
      if (!Array.isArray(dest.attractions) || dest.attractions.length === 0) {
        fields.attractions = defaults
      }
      if (!Array.isArray(dest.highlights) || dest.highlights.length === 0) {
        fields.highlights = DEFAULT_HIGHLIGHTS[dest.id] ?? []
      }

      if (Object.keys(fields).length > 0) {
        await updateDocFields(COLLECTION, dest.id, fields)
        updated++
      }
    }

    console.log(`[Destinations] Backfilled content for ${updated} of ${all.length} destinations`)
    return updated
  } catch (error) {
    console.error('[Destinations] Content seed failed:', error.code ?? error.message, error)
    throw Object.assign(new Error('Could not backfill destination content.'), { cause: error })
  }
}

/* ── React hooks (same `{data, loading, error, reload}` contracts) ────────── */

/** All destinations — admin management screens. */
export function useDestinations() {
  return useSubscription(subscribeDestinations())
}

/** Published destinations only — customer-facing screens. */
export function usePublishedDestinations() {
  return useSubscription(subscribePublishedDestinations())
}

/** Single destination — customer detail page / admin edit prefill. */
export function useDestination(id) {
  return useSubscription(subscribeDestination(id), [id])
}
