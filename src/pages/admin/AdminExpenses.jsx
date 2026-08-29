import { Pencil, Plus, Trash2, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CellStack, DataTable } from '../../components/admin/DataTable'
import ExpenseForm from '../../components/admin/ExpenseForm'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FilterPills from '../../components/ui/FilterPills'
import SearchInput from '../../components/ui/SearchInput'
import { useToast } from '../../context/AdminToastContext'
import { EXPENSE_CATEGORIES } from '../../data/constants'
import {
  deleteExpense as deleteExpenseDoc,
  nextExpenseId,
  saveExpense as saveExpenseDoc,
  useExpenses,
} from '../../firebase/collections/expenses'
import { formatCurrency, formatDate } from '../../utils/format'

const CATEGORY_TONE = {
  Vehicle: 'navy',
  Hotel: 'crimson',
  Food: 'gold',
  'Entry Fees': 'green',
  Guide: 'neutral',
  Permits: 'navy',
  Miscellaneous: 'neutral',
}

export default function AdminExpenses() {
  const toast = useToast()
  const { rows, loading, error, reload } = useExpenses()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)

  const categoryOptions = useMemo(
    () => [
      { value: 'All', label: 'All', count: rows.length },
      ...EXPENSE_CATEGORIES.map((name) => ({
        value: name,
        label: name,
        count: rows.filter((expense) => expense.category === name).length,
      })),
    ],
    [rows],
  )

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return [...rows]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((expense) => {
        const matchesCategory = category === 'All' || expense.category === category
        const matchesTerm =
          !term ||
          [expense.id, expense.vendor, expense.tripId, expense.note]
            .join(' ')
            .toLowerCase()
            .includes(term)
        return matchesCategory && matchesTerm
      })
  }, [rows, query, category])

  const total = useMemo(
    () => visible.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0),
    [visible],
  )

  /** Persist to Firestore — the live subscription refreshes the table. */
  const saveExpense = async (next) => {
    const id = next.id ?? nextExpenseId(rows)
    setSaving(true)
    try {
      await saveExpenseDoc({ ...next, id }, editing ?? null)
      toast(`Expense ${id} saved`)
      setFormOpen(false)
      setEditing(null)
    } catch (err) {
      toast(err.message ?? 'Could not save the expense', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeExpense = async () => {
    const target = deleting
    try {
      await deleteExpenseDoc(target.id)
      toast(`Expense ${target.id} deleted`, 'info')
    } catch (err) {
      toast(err.message ?? 'Could not delete the expense', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const hasFilters = query.trim() !== '' || category !== 'All'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-500">
          <span className="font-extrabold text-navy-900">{visible.length}</span> of {rows.length}{' '}
          records · totalling{' '}
          <span className="font-extrabold text-navy-900">{formatCurrency(total)}</span>
        </p>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          Add Expense
        </Button>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by vendor, trip reference or note…"
          label="Search expenses"
        />
        <div className="mt-3 border-t border-sand-200 pt-3">
          <FilterPills label="Category" options={categoryOptions} value={category} onChange={setCategory} />
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: 'id',
            header: 'Expense',
            minWidth: 170,
            emphasis: true,
            render: (expense) => (
              <CellStack primary={expense.id} secondary={formatDate(expense.date)} />
            ),
          },
          {
            key: 'category',
            header: 'Category',
            render: (expense) => (
              <Badge tone={CATEGORY_TONE[expense.category] ?? 'neutral'} size="xs">
                {expense.category}
              </Badge>
            ),
          },
          {
            key: 'vendor',
            header: 'Vendor / payee',
            minWidth: 220,
            render: (expense) => (
              <CellStack primary={expense.vendor || '—'} secondary={`${expense.paidBy} · ${expense.mode}`} />
            ),
          },
          {
            key: 'tripId',
            header: 'Trip reference',
            render: (expense) => <span className="font-semibold text-navy-800">{expense.tripId}</span>,
          },
          {
            key: 'note',
            header: 'Note',
            minWidth: 240,
            render: (expense) => (
              <span className="line-clamp-2 text-xs leading-relaxed">{expense.note}</span>
            ),
          },
          {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            render: (expense) => (
              <span className="font-bold text-navy-900 tabular-nums">{formatCurrency(expense.amount)}</span>
            ),
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            minWidth: 100,
            render: (expense) => (
              <span className="inline-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(expense)
                    setFormOpen(true)
                  }}
                  aria-label={`Edit ${expense.id}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(expense)}
                  aria-label={`Delete ${expense.id}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-crimson-50 hover:text-crimson-600"
                >
                  <Trash2 size={16} />
                </button>
              </span>
            ),
          },
        ]}
        rows={visible}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyIcon={Wallet}
        emptyTitle={hasFilters ? 'No expenses match those filters' : 'No expenses recorded yet'}
        emptyMessage={
          hasFilters ? 'Try a different keyword or clear the filters.' : 'Record vendor payments here as the paper trail for each trip.'
        }
        emptyAction={
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
        footer={[
          { content: `${visible.length} records`, colSpan: 5 },
          { content: formatCurrency(total), align: 'right' },
          { content: '', colSpan: 1 },
        ]}
      />

      <ExpenseForm
        open={formOpen}
        initial={editing}
        busy={saving}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSave={saveExpense}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={removeExpense}
        title={`Delete ${deleting?.id ?? 'expense'}?`}
        message={`This removes the ${formatCurrency(deleting?.amount ?? 0)} record against ${deleting?.tripId ?? 'the trip'}.`}
        detail="Trip ledger totals are managed on the trip itself and will not change."
      />
    </div>
  )
}

