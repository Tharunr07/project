import { EmptyState, ErrorState, TableSkeleton } from '../ui/States'

/**
 * The one admin table. Declarative columns, built-in loading/empty/error
 * states and horizontal scrolling on narrow screens.
 *
 *   columns: [{ key, header, render?(row), align?, minWidth?, emphasis? }]
 *   footer:  rendered as a totals row when provided (array of cells or node)
 */

const ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export function DataTable({
  columns,
  rows,
  keyField = 'id',
  loading = false,
  error = null,
  onRetry,
  emptyIcon,
  emptyTitle = 'Nothing here yet',
  emptyMessage,
  emptyAction,
  footer,
  minWidth = 880,
}) {
  if (loading) return <TableSkeleton rows={7} columns={Math.min(columns.length, 6)} />

  if (error) {
    return (
      <ErrorState title="Could not load records" message="Something went wrong while fetching this list." onRetry={onRetry} />
    )
  }

  if (!rows.length) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} action={emptyAction} />
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-inset ring-sand-200">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-sand-200 bg-sand-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={column.minWidth ? { minWidth: column.minWidth } : undefined}
                  className={`px-5 py-3.5 text-[0.6875rem] font-bold tracking-[0.12em] whitespace-nowrap text-navy-400 uppercase ${
                    ALIGN[column.align] ?? 'text-left'
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-sand-100">
            {rows.map((row, rowIndex) => (
              <tr
                key={row[keyField] ?? `row-${rowIndex}`}
                className="transition-colors hover:bg-sand-50/70"
              >
                {columns.map((column, columnIndex) => (
                  <td
                    key={column.key}
                    className={`px-5 py-4 align-middle text-sm ${
                      ALIGN[column.align] ?? 'text-left'
                    } ${column.emphasis && columnIndex === 0 ? 'font-bold text-navy-900' : 'font-medium text-navy-600'} ${
                      column.className ?? ''
                    }`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          {footer && (
            <tfoot>
              <tr className="border-t-2 border-sand-200 bg-sand-50">
                {footer.map((cell, index) => (
                  <td
                    key={footer.keys?.[index] ?? index}
                    colSpan={cell?.colSpan}
                    className={`px-5 py-3.5 text-sm font-extrabold text-navy-900 tabular-nums ${
                      cell?.align ? ALIGN[cell.align] : index === 0 ? '' : 'text-right'
                    } ${cell?.className ?? ''}`}
                  >
                    {typeof cell === 'object' && cell !== null && 'content' in cell
                      ? cell.content
                      : cell}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

/** Small helper for the common "primary + secondary line" table cell. */
export function CellStack({ primary, secondary }) {
  return (
    <div className="min-w-0 py-0.5">
      <p className="truncate font-semibold text-navy-900">{primary}</p>
      {secondary && <p className="mt-0.5 truncate text-xs text-navy-400">{secondary}</p>}
    </div>
  )
}
