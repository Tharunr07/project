import { deleteDocById, pruneUndefined, subscribeCollection, updateDocFields, writeDocWithId } from '../firestore'
import { useSubscription } from '../hooks'

/**
 * `expenses` collection service — PHASE 2D.
 *
 * Documents keep the exact Phase 1 paper-trail shape (see src/data/expenses.js):
 *   id (EXP-YYYY-NNNN), date, tripId, category, vendor, amount,
 *   paidBy, mode, note
 * plus createdAt / updatedAt server timestamps. Every expense is linked to a
 * trip via `tripId` (required by ExpenseForm validation) — the collection is
 * the itemised record; the P&L itself still rolls up the expense heads stored
 * on each trip, so the two can never disagree.
 *
 * The human-readable id (EXP-2026-0892) doubles as the Firestore doc id; the
 * admin screen assigns the next sequence from live rows before saving.
 */

const COLLECTION = 'expenses'

/** Newest first — mirrors the Phase 1 list order. */
function byDateDesc(list) {
  return [...list].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
}

/** Live list of every expense. */
export function subscribeExpenses() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, { onData: (list) => onData(byDateDesc(list)), onError })
}

/** Next sequential expense id across all years: EXP-YYYY-NNNN. */
export function nextExpenseId(expenses, year = new Date().getFullYear()) {
  let highest = 0
  for (const expense of expenses ?? []) {
    const match = /(\d+)$/.exec(String(expense?.id ?? ''))
    if (match) highest = Math.max(highest, Number(match[1]))
  }
  return `EXP-${year}-${String(highest + 1).padStart(4, '0')}`
}

/**
 * Create or update an expense record. On create the caller supplies the
 * human-readable id (assigned from live rows); collisions are effectively
 * impossible at agency volume and surface as a failed write, not a duplicate.
 */
export async function saveExpense(next, existing = null) {
  const clean = pruneUndefined({ ...next })
  delete clean.createdAt
  delete clean.updatedAt

  if (existing) {
    delete clean.id
    await updateDocFields(COLLECTION, existing.id, clean)
    return existing.id
  }

  const { id, ...payload } = clean
  if (!id) throw new Error('Expense id was not generated.')
  await writeDocWithId(COLLECTION, String(id), payload)
  return String(id)
}

/** Partial update — amount/category/vendor corrections. */
export const updateExpenseFields = (id, fields) => updateDocFields(COLLECTION, id, fields)

/** Remove an expense record. Trip totals recompute on their own heads. */
export const deleteExpense = (id) => deleteDocById(COLLECTION, id)

/** All expenses — admin management screen + Pass 2E analysis. */
export function useExpenses() {
  return useSubscription(subscribeExpenses())
}
