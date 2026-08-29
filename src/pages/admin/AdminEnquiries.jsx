import { Mail, MessagesSquare, Phone } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CellStack, DataTable } from '../../components/admin/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FilterPills from '../../components/ui/FilterPills'
import Modal from '../../components/ui/Modal'
import SearchInput from '../../components/ui/SearchInput'
import SelectInput from '../../components/ui/SelectInput'
import { useToast } from '../../context/AdminToastContext'
import { ENQUIRY_STATUSES, GROUP_TYPES } from '../../data/constants'
import { telLink, whatsappLink } from '../../data/company'
import { updateEnquiryFields, useEnquiries } from '../../firebase/collections/enquiries'
import { formatDate, formatDateTime } from '../../utils/format'

/** Seeded legacy rows carry ENQ-… ids; new submissions get AH-ENQ-… refs. */
const refOf = (enquiry) => enquiry.referenceNumber ?? enquiry.id

export default function AdminEnquiries() {
  const toast = useToast()
  const { rows, loading, error, reload } = useEnquiries()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [groupType, setGroupType] = useState('All')
  // The detail modal tracks an id; the live subscription keeps the object fresh.
  const [viewingId, setViewingId] = useState(null)

  const viewing = useMemo(
    () => rows.find((row) => row.id === viewingId) ?? null,
    [rows, viewingId],
  )

  const statusOptions = useMemo(
    () => [
      { value: 'All', label: 'All', count: rows.length },
      ...ENQUIRY_STATUSES.map((name) => ({
        value: name,
        label: name,
        count: rows.filter((enquiry) => enquiry.status === name).length,
      })),
    ],
    [rows],
  )

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rows
      .filter((enquiry) => {
        const matchesStatus = status === 'All' || enquiry.status === status
        const matchesGroup = groupType === 'All' || enquiry.groupType === groupType
        const matchesTerm =
          !term ||
          [
            refOf(enquiry),
            enquiry.name,
            enquiry.phone,
            enquiry.email,
            enquiry.destination,
            enquiry.packageName,
          ]
            .join(' ')
            .toLowerCase()
            .includes(term)
        return matchesStatus && matchesGroup && matchesTerm
      })
      .sort((a, b) => String(b.receivedAt ?? '').localeCompare(String(a.receivedAt ?? '')))
  }, [rows, query, status, groupType])

  /** Persist to Firestore — the live subscription refreshes table and modal. */
  const setStatusFor = (enquiry, nextStatus) => {
    updateEnquiryFields(enquiry.id, { status: nextStatus })
      .then(() => toast(`${refOf(enquiry)} marked ${nextStatus}`, 'info'))
      .catch((err) => toast(err.message ?? 'Could not update the status', 'error'))
  }

  /** Assignee commits on blur / Enter rather than on every keystroke. */
  const commitAssignee = (value) => {
    const next = value.trim() || null
    if ((viewing?.assignedTo ?? null) === next) return
    updateEnquiryFields(viewing.id, { assignedTo: next })
      .then(() => toast(`Assignee updated for ${refOf(viewing)}`, 'info'))
      .catch((err) => toast(err.message ?? 'Could not save the assignee', 'error'))
  }

  const hasFilters = query.trim() !== '' || status !== 'All' || groupType !== 'All'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-500">
          <span className="font-extrabold text-navy-900">{visible.length}</span> of {rows.length}{' '}
          enquiries
        </p>
        {viewing && (
          <p className="hidden text-xs font-semibold text-navy-400 sm:block">
            Tip: update the status from inside an enquiry — it feeds the funnel report.
          </p>
        )}
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_14rem]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name, phone, email or destination…"
            label="Search enquiries"
          />
          <select
            id="enq-group"
            aria-label="Filter by group type"
            value={groupType}
            onChange={(event) => setGroupType(event.target.value)}
            className="h-12 cursor-pointer rounded-full border border-sand-300 bg-white px-4 text-sm font-semibold text-navy-900 focus:border-navy-500 focus:outline-none"
          >
            <option value="All">All groups</option>
            {GROUP_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 border-t border-sand-200 pt-3">
          <FilterPills label="Enquiry status" options={statusOptions} value={status} onChange={setStatus} />
        </div>
      </div>

      <DataTable
        minWidth={960}
        columns={[
          {
            key: 'id',
            header: 'Enquiry',
            minWidth: 180,
            emphasis: true,
            render: (enquiry) => (
              <CellStack primary={refOf(enquiry)} secondary={formatDateTime(enquiry.receivedAt)} />
            ),
          },
          {
            key: 'name',
            header: 'Customer',
            minWidth: 210,
            render: (enquiry) => (
              <CellStack primary={enquiry.name} secondary={`${enquiry.travellers} pax · ${formatDate(enquiry.travelDate)}`} />
            ),
          },
          {
            key: 'destination',
            header: 'Destination · package',
            minWidth: 230,
            render: (enquiry) => (
              <CellStack primary={enquiry.destination} secondary={enquiry.packageName} />
            ),
          },
          {
            key: 'groupType',
            header: 'Group',
            align: 'center',
            render: (enquiry) => <Badge tone="navy" size="xs">{enquiry.groupType}</Badge>,
          },
          {
            key: 'assignedTo',
            header: 'Assigned',
            render: (enquiry) => enquiry.assignedTo ?? <span className="text-navy-300">Unassigned</span>,
          },
          {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (enquiry) => <Badge status={enquiry.status} dot />,
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            render: (enquiry) => (
              <Button variant="outline" size="xs" onClick={() => setViewingId(enquiry.id)}>
                Open
              </Button>
            ),
          },
        ]}
        rows={visible}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyIcon={MessagesSquare}
        emptyTitle={hasFilters ? 'No enquiries match those filters' : 'The inbox is empty'}
        emptyMessage={
          hasFilters
            ? 'Try a different search term or clear the filters.'
            : 'New website enquiries will appear here with full trip requirements.'
        }
        emptyAction={
          hasFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery('')
                setStatus('All')
                setGroupType('All')
              }}
            >
              Clear filters
            </Button>
          ) : null
        }
      />

      {/* Detail modal — `viewing` derives from live rows, so edits reflect instantly */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewingId(null)}
        size="lg"
        title={`Enquiry ${viewing ? refOf(viewing) : ''}`}
        description={viewing && `Received ${formatDateTime(viewing.receivedAt)}`}
      >
        {viewing && (
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="space-y-4">
              <h3 className="text-xs font-bold tracking-[0.14em] text-navy-400 uppercase">Customer</h3>
              <p className="font-display text-lg font-extrabold text-navy-900">{viewing.name}</p>

              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <a href={`tel:${viewing.phone.replace(/\s/g, '')}`} className="flex items-center gap-2.5 text-navy-700 transition-colors hover:text-crimson-600">
                    <Phone size={15} className="text-navy-400" aria-hidden="true" />
                    {viewing.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${viewing.email}`} className="flex items-center gap-2.5 break-all text-navy-700 transition-colors hover:text-crimson-600">
                    <Mail size={15} className="shrink-0 text-navy-400" aria-hidden="true" />
                    {viewing.email}
                  </a>
                </li>
              </ul>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  href={whatsappLink(`Hi ${viewing.name.split(' ')[0]}, regarding your Avengers Holidays enquiry ${refOf(viewing)} for ${viewing.destination}.`)}
                  variant="whatsapp"
                  size="xs"
                >
                  WhatsApp
                </Button>
                <Button href={telLink} variant="dark" size="xs">
                  Call now
                </Button>
              </div>

              <dl className="space-y-2.5 rounded-2xl bg-sand-50 p-4 text-sm ring-1 ring-inset ring-sand-200">
                {[
                  ['Destination', viewing.destination],
                  ['Package', viewing.packageName],
                  ['Travel date', formatDate(viewing.travelDate, { long: true })],
                  ['Travellers', `${viewing.travellers} pax`],
                  ['Days', `${viewing.days} days`],
                  ['Group type', viewing.groupType],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-3">
                    <dt className="text-navy-400">{label}</dt>
                    <dd className="text-right font-bold text-navy-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="flex min-w-0 flex-col gap-5">
              <div>
                <h3 className="mb-2 text-xs font-bold tracking-[0.14em] text-navy-400 uppercase">
                  Additional requirements
                </h3>
                <blockquote className="rounded-2xl bg-sand-100 p-4 text-sm leading-relaxed text-navy-700">
                  {viewing.requirements || <span className="text-navy-400">None provided.</span>}
                </blockquote>
              </div>

              <SelectInput
                id="enq-status-update"
                label="Enquiry status"
                value={viewing.status}
                onChange={(event) => setStatusFor(viewing, event.target.value)}
                options={ENQUIRY_STATUSES}
              />

              <label className="block">
                <span className="mb-1.5 block text-[0.8125rem] font-semibold text-navy-800">Assigned to</span>
                <input
                  key={viewing.id}
                  type="text"
                  defaultValue={viewing.assignedTo ?? ''}
                  onBlur={(event) => commitAssignee(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      event.currentTarget.blur()
                    }
                  }}
                  placeholder="e.g. Priya (Sales)"
                  className="h-11 w-full rounded-xl border border-sand-300 bg-white px-3.5 text-sm font-medium text-navy-900 placeholder:text-navy-300 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 focus:outline-none"
                />
                <span className="mt-1.5 block text-xs text-navy-400">
                  Saves when you click away or press Enter.
                </span>
              </label>
            </section>
          </div>
        )}
      </Modal>
    </div>
  )
}
