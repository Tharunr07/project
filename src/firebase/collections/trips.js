import { doc, getDoc } from 'firebase/firestore'
import {
  deleteDocById,
  fetchCollection,
  fetchDocById,
  pruneUndefined,
  subscribeDoc,
  subscribeCollection,
  updateDocFields,
  writeDocWithId,
} from '../firestore'
import { db } from '../config'
import { useSubscription } from '../hooks'
import { deriveTripTotals } from '../../data/trips'

/**
 * `trips` collection service — PHASE 2D.
 *
 * Documents keep the exact Phase 1 ledger shape (see src/data/trips.js):
 *   id (TRP-YYYY-NNN), date, status, startingLocation, destination,
 *   packageName, customerName, groupType, days, travellers, pricePerPerson,
 *   vehicleExpense, hotelExpense, foodExpense, entryFeeExpense,
 *   otherExpenses, notes
 * plus createdAt / updatedAt server timestamps.
 *
 * ── HISTORICAL PRICE RULE ──────────────────────────────────────────────────
 * `pricePerPerson` is the price actually AGREED for that trip on the day it
 * was sold. It is snapshotted onto the trip document at creation and is NEVER
 * re-read from the packages collection. Changing a package price later must
 * not rewrite any trip. Derived figures (totalRevenue / totalExpenses /
 * profit / margin / year / month) are NEVER stored — every screen recomputes
 * them client-side via deriveTripTotals() so the maths can never disagree.
 */

const COLLECTION = 'trips'

/** Matches human-readable trip ids: TRP-2026-041 */
export const TRIP_ID_RE = /^TRP-(\d{4})-(\d+)$/

/** Newest first — mirrors the Phase 1 ledger order. */
function byDateDesc(list) {
  return [...list].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
}

/**
 * Attach client-side derived figures to a raw trip row:
 *   totalRevenue = travellers × pricePerPerson (the trip's OWN snapshot)
 *   totalExpenses = Σ five expense heads · profit = revenue − expenses
 *   margin, year, month
 * Firestore rows never store these — every screen derives them here so the
 * maths can never disagree between Trip Management, History and analytics.
 */
export function withDerivedTrip(trip) {
  return {
    ...trip,
    travellers: Number(trip.travellers),
    pricePerPerson: Number(trip.pricePerPerson),
    ...deriveTripTotals(trip),
    year: Number(String(trip.date ?? '').slice(0, 4)),
    month: Number(String(trip.date ?? '').slice(5, 7)),
  }
}

/** Live list of every trip. */
export function subscribeTrips() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, { onData: (list) => onData(byDateDesc(list)), onError })
}

/** Live single trip by id — emits null when missing or id is empty. */
export function subscribeTrip(id) {
  return (onData, onError) => {
    if (!id) {
      onData(null)
      return undefined
    }
    return subscribeDoc(COLLECTION, id, { onData, onError })
  }
}

/** One-shot read of a single trip. */
export const getTrip = (id) => fetchDocById(COLLECTION, id)

/**
 * Next sequential id across ALL years, exactly like the Phase 1 generator:
 * scan every TRP-YYYY-NNN, take the highest sequence + 1, stamp with `year`.
 */
export function nextTripId(trips, year) {
  let highest = 0
  for (const trip of trips ?? []) {
    const match = TRIP_ID_RE.exec(String(trip?.id ?? ''))
    if (match) highest = Math.max(highest, Number(match[2]))
  }
  return `TRP-${year}-${String(highest + 1).padStart(3, '0')}`
}

/**
 * Collision-safe create. Two admins saving at once both aim at the same next
 * id; the loser bumps the sequence instead of appending a suffix that would
 * break the TRP-YYYY-NNN pattern TripHistory parses.
 */
async function ensureUniqueId(base) {
  let candidate = base
  for (;;) {
    const snapshot = await getDoc(doc(db, COLLECTION, candidate))
    if (!snapshot.exists()) return candidate
    const match = TRIP_ID_RE.exec(candidate)
    if (!match) return `${candidate}-${Date.now()}`
    candidate = `TRP-${match[1]}-${String(Number(match[2]) + 1).padStart(3, '0')}`
  }
}

/** Derived values are computed on read — never persisted twice. */
function stripDerived(trip) {
  const clean = pruneUndefined({ ...trip })
  delete clean.id // doc id lives only in the path
  delete clean.createdAt
  delete clean.updatedAt
  delete clean.totalRevenue
  delete clean.totalExpenses
  delete clean.profit
  delete clean.margin
  delete clean.year
  delete clean.month
  return clean
}

/**
 * Create or update a trip. On create, guarantees a unique TRP-…-… id
 * (caller-supplied or generated from the trip date's year). Returns the
 * saved document id.
 */
export async function saveTrip(next, existing = null) {
  const payload = stripDerived(next)

  if (existing) {
    await updateDocFields(COLLECTION, existing.id, payload)
    return existing.id
  }

  let base = String(next.id ?? '').trim()
  if (!base) {
    const year = Number(String(next.date ?? '').slice(0, 4)) || new Date().getFullYear()
    let all = []
    try {
      all = await fetchCollection(COLLECTION)
    } catch {
      all = []
    }
    base = nextTripId(all, year)
  }

  const id = await ensureUniqueId(base)
  await writeDocWithId(COLLECTION, id, payload)
  return id
}

/** Partial update — status changes and field edits (price only ever moves by explicit edit). */
export const updateTripFields = (id, fields) => updateDocFields(COLLECTION, id, fields)

/** Remove a trip. Expenses/bills referencing it keep their own snapshots. */
export const deleteTrip = (id) => deleteDocById(COLLECTION, id)

/* ── React hooks (same `{rows/data, loading, error, reload}` contracts) ──── */

/** All trips — admin operations screens + analytics (Pass 2E). */
export function useTrips() {
  return useSubscription(subscribeTrips())
}

/** Single trip — detail views / edit prefill. */
export function useTrip(id) {
  return useSubscription(subscribeTrip(id), [id])
}
