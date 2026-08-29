import { deleteDocById, pruneUndefined, subscribeCollection, updateDocFields, writeDocWithId } from '../firestore'
import { useSubscription } from '../hooks'

/**
 * `bills` collection service — PHASE 2D.
 *
 * ── BILL = HISTORICAL SNAPSHOT ─────────────────────────────────────────────
 * A bill freezes the commercial terms of the day it was issued. The generator
 * snapshots travellers / days / pricePerPerson FROM THE TRIP (never the
 * package) and the whole payload is persisted verbatim; later package or trip
 * edits can never re-rate an old invoice.
 *
 * ── DOCUMENT IDS ───────────────────────────────────────────────────────────
 * Human bill numbers contain slashes (AH/2026-27/0148), which are unsafe as
 * Firestore path segments. Documents therefore use the dash-safe form
 * (AH-2026-27-0148) while the original number travels in the `billNumber`
 * field for display and printing:
 *
 *   doc id:  AH-2026-27-0148      billNumber: "AH/2026-27/0148"
 *
 * Other fields mirror src/data/bills.js exactly: tripId, date, status,
 * customerName/Address/Phone/Email/Gstin, groupType, destination,
 * packageName, travelDate, travellers, days, pricePerPerson, extraCharges[],
 * discount, advancePaid, paymentMode, paymentRef, notes.
 */

const COLLECTION = 'bills'

/** "AH/2026-27/0148" → "AH-2026-27-0148" (path-safe document id). */
export function billDocId(billNumber) {
  return String(billNumber ?? '').replaceAll('/', '-')
}

/** The displayable human-readable number on any bill-shaped object. */
export function billNumberOf(bill) {
  return bill?.billNumber ?? bill?.id ?? ''
}

/** Newest first — mirrors the Phase 1 prepend-newest list order. */
function byDateDesc(list) {
  return [...list].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
}

/** Live list of every bill. */
export function subscribeBills() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, { onData: (list) => onData(byDateDesc(list)), onError })
}

/**
 * Next sequential bill number across all years: AH/{currentYear}-27/{NNNN}.
 * Scans both the safe doc ids and legacy slash-form numbers so nothing can
 * collide after migration. Kept client-side like Phase 1 — agency volume.
 */
export function nextBillNumber(bills, year = new Date().getFullYear()) {
  let highest = 0
  for (const bill of bills ?? []) {
    const source = String(bill?.billNumber ?? bill?.id ?? '')
    const match = /(\d+)$/.exec(source)
    if (match) highest = Math.max(highest, Number(match[1]))
  }
  return `AH/${year}-27/${String(highest + 1).padStart(4, '0')}`
}

/**
 * Persist a bill. The payload is stored EXACTLY as supplied (snapshot rule);
 * only the path-safe doc id is derived and `billNumber` is guaranteed present.
 * Returns the saved document id.
 */
export async function saveBill(bill) {
  const clean = pruneUndefined({ ...bill })
  const incomingNumber = String(clean.billNumber ?? clean.id ?? '').trim()
  if (!incomingNumber) throw new Error('Bill number was not generated.')

  const { id: ignoredId, ...payload } = clean // doc id lives only in the path
  void ignoredId
  if (!payload.billNumber) payload.billNumber = incomingNumber
  await writeDocWithId(COLLECTION, billDocId(incomingNumber), payload)
  return billDocId(incomingNumber)
}

/** Partial update — status cycling (Draft → Issued → Paid → Cancelled). */
export const updateBillFields = (id, fields) => updateDocFields(COLLECTION, id, fields)

/** Remove a draft/cancelled bill. The underlying trip is never touched. */
export const deleteBill = (id) => deleteDocById(COLLECTION, id)

/** All bills — admin billing screen. */
export function useBills() {
  return useSubscription(subscribeBills())
}
