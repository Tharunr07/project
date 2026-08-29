import { Eye, EyeOff, Package as PackageIcon, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CellStack, DataTable } from '../../components/admin/DataTable'
import PackageForm from '../../components/admin/PackageForm'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FilterPills from '../../components/ui/FilterPills'
import SearchInput from '../../components/ui/SearchInput'
import SmartImage from '../../components/ui/SmartImage'
import { useToast } from '../../context/AdminToastContext'
import { PACKAGE_CATEGORIES } from '../../data/constants'
import {
  deletePackage as deletePackageDoc,
  savePackage as savePackageDoc,
  updatePackageFields,
  usePackages,
} from '../../firebase/collections/packages'
import { formatCurrency } from '../../utils/format'

export default function AdminPackages() {
  const toast = useToast()
  const { rows, loading, error, reload } = usePackages()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)

  const categories = useMemo(
    () => [
      { value: 'All', label: 'All', count: rows.length },
      ...PACKAGE_CATEGORIES.map((name) => ({
        value: name,
        label: name,
        count: rows.filter((pkg) => pkg.category === name).length,
      })),
    ],
    [rows],
  )

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rows.filter((pkg) => {
      const matchesCategory = category === 'All' || pkg.category === category
      const matchesStatus =
        status === 'All' || (status === 'Published' ? pkg.published : !pkg.published)
      const matchesTerm =
        !term ||
        [pkg.name, pkg.destination, pkg.category].join(' ').toLowerCase().includes(term)
      return matchesCategory && matchesStatus && matchesTerm
    })
  }, [rows, query, category, status])

  /** Persist to Firestore — the live subscription refreshes the table. */
  const savePackage = async (next) => {
    setSaving(true)
    try {
      await savePackageDoc(next, editing ?? null)
      toast(`${next.name} saved`)
      setFormOpen(false)
      setEditing(null)
    } catch (err) {
      toast(err.message ?? 'Could not save the package', 'error')
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = (pkg) => {
    updatePackageFields(pkg.id, { published: !pkg.published })
      .then(() => toast(`${pkg.name} ${pkg.published ? 'unpublished' : 'published'}`, 'info'))
      .catch((err) => toast(err.message ?? 'Could not update the package', 'error'))
  }

  const deletePackage = async () => {
    const target = deleting
    try {
      await deletePackageDoc(target.id)
      toast(`${target.name} deleted`, 'info')
    } catch (err) {
      toast(err.message ?? 'Could not delete the package', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const hasFilters = query.trim() !== '' || category !== 'All' || status !== 'All'

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-500">
          <span className="font-extrabold text-navy-900">{visible.length}</span> of {rows.length}{' '}
          packages
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
          Add Package
        </Button>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_14rem]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name or destination…"
            label="Search packages"
          />
          <select
            id="pkg-status"
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 cursor-pointer rounded-xl border border-sand-300 bg-white px-3.5 text-sm font-semibold text-navy-900 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 focus:outline-none"
          >
            <option value="All">All statuses</option>
            <option value="Published">Published</option>
            <option value="Unpublished">Unpublished</option>
          </select>
        </div>
        <div className="mt-3 border-t border-sand-200 pt-3">
          <FilterPills label="Category" options={categories} value={category} onChange={setCategory} />
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: 'name',
            header: 'Package',
            minWidth: 280,
            emphasis: true,
            render: (pkg) => (
              <div className="flex items-center gap-3.5 py-0.5">
                <SmartImage
                  src={pkg.image}
                  alt=""
                  ratio="aspect-square"
                  className="size-12 shrink-0 rounded-xl"
                />
                <CellStack primary={pkg.name} secondary={`${pkg.id} · ${pkg.duration}`} />
              </div>
            ),
          },
          {
            key: 'destination',
            header: 'Destination',
            render: (pkg) => (
              <CellStack
                primary={pkg.destination}
                secondary={<Badge tone="navy" size="xs">{pkg.category}</Badge>}
              />
            ),
          },
          {
            key: 'price',
            header: 'Price / person',
            align: 'right',
            render: (pkg) => (
              <span className="font-bold text-navy-900 tabular-nums">{formatCurrency(pkg.price)}</span>
            ),
          },
          {
            key: 'flags',
            header: 'Flags',
            align: 'center',
            render: (pkg) => (
              <span className="flex justify-center gap-1.5">
                {pkg.featured && <Badge tone="gold" size="xs">Featured</Badge>}
                {pkg.popular && <Badge tone="crimson" size="xs">Popular</Badge>}
                {!pkg.featured && !pkg.popular && <span className="text-navy-300">—</span>}
              </span>
            ),
          },
          {
            key: 'published',
            header: 'Status',
            align: 'center',
            render: (pkg) => (
              <button
                type="button"
                onClick={() => togglePublished(pkg)}
                title={pkg.published ? 'Click to unpublish' : 'Click to publish'}
                className="cursor-pointer"
              >
                <Badge status={pkg.published ? 'Published' : 'Unpublished'} dot />
              </button>
            ),
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            minWidth: 120,
            render: (pkg) => (
              <span className="inline-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => togglePublished(pkg)}
                  aria-label={pkg.published ? `Unpublish ${pkg.name}` : `Publish ${pkg.name}`}
                  title={pkg.published ? 'Unpublish' : 'Publish'}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  {pkg.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(pkg)
                    setFormOpen(true)
                  }}
                  aria-label={`Edit ${pkg.name}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(pkg)}
                  aria-label={`Delete ${pkg.name}`}
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
        emptyIcon={PackageIcon}
        emptyTitle={hasFilters ? 'No packages match those filters' : 'No packages yet'}
        emptyMessage={
          hasFilters
            ? 'Try a different search term or clear the filters.'
            : 'Create your first tour package to start selling trips.'
        }
        emptyAction={
          hasFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery('')
                setCategory('All')
                setStatus('All')
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setFormOpen(true)}>
              Add Package
            </Button>
          )
        }
      />

      <PackageForm
        open={formOpen}
        initial={editing}
        busy={saving}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSave={savePackage}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={deletePackage}
        title={`Delete ${deleting?.name ?? 'package'}?`}
        message="The package will be removed from the catalogue and the customer website immediately."
        detail="Past trips keep their own agreed prices, so historical records are not affected."
      />
    </div>
  )
}
