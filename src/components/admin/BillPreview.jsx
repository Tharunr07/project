import { company } from '../../data/company'
import { deriveBillTotals } from '../../data/bills'
import { LogoMark } from '../ui/Logo'
import Badge from '../ui/Badge'
import { formatCurrency, formatDate } from '../../utils/format'

/**
 * Printable A4-style invoice sheet. Pure presentation — every rupee comes from
 * deriveBillTotals(bill), and pricePerPerson was snapshotted onto the bill at
 * issue time so old bills never drift when package prices change later.
 */
export default function BillPreview({ bill }) {
  const totals = deriveBillTotals(bill)

  const meta = [
    ['Destination', bill.destination],
    ['Package', bill.packageName],
    ['Travel date', formatDate(bill.travelDate, { long: true })],
    ['Trip duration', `${bill.days} day${bill.days === 1 ? '' : 's'}`],
    ['Travellers', `${bill.travellers} pax`],
    ['Group type', bill.groupType],
  ]

  return (
    <article className="print-sheet mx-auto w-full max-w-3xl bg-white p-8 text-navy-900 sm:p-10">
      {/* Letterhead */}
      <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-navy-900 pb-6">
        <div className="flex items-center gap-3">
          <LogoMark size={46} />
          <div>
            <p className="font-display text-xl font-extrabold tracking-tight">
              Avengers<span className="text-crimson-600"> Holidays</span>
            </p>
            <p className="mt-0.5 text-[0.5625rem] font-bold tracking-[0.22em] text-navy-400 uppercase">
              South India Specialists
            </p>
            <p className="mt-2 text-xs leading-relaxed text-navy-500">
              {company.address.line1}, {company.address.line2},<br />
              {company.address.city} – {company.address.pincode} · {company.phonePrimary}
            </p>
            <p className="mt-1 text-xs text-navy-500">
              GSTIN {company.gstin} · Reg. {company.registration}
            </p>
          </div>
        </div>

        <div className="text-right">
          <h1 className="font-display text-2xl font-extrabold tracking-tight uppercase">Invoice</h1>
          <p className="mt-1 font-mono text-sm font-bold">{bill.id}</p>
          <p className="mt-1 text-xs text-navy-500">Issued {formatDate(bill.date, { long: true })}</p>
          <div className="mt-2 flex justify-end">
            <Badge status={bill.status} dot />
          </div>
        </div>
      </header>

      {/* Parties */}
      <section className="grid gap-6 border-b border-sand-200 py-6 sm:grid-cols-2">
        <div>
          <p className="text-[0.625rem] font-bold tracking-[0.16em] text-navy-400 uppercase">
            Billed to
          </p>
          <p className="mt-2 font-display text-base font-extrabold">{bill.customerName}</p>
          {bill.customerAddress && (
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-navy-500">{bill.customerAddress}</p>
          )}
          <p className="mt-1 text-xs text-navy-500">
            {[bill.customerPhone, bill.customerEmail].filter(Boolean).join(' · ')}
          </p>
          {bill.customerGstin && (
            <p className="mt-1 text-xs font-semibold text-navy-600">GSTIN {bill.customerGstin}</p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 self-start sm:border-l sm:border-sand-200 sm:pl-6">
          {meta.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[0.5625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">
                {label}
              </dt>
              <dd className="mt-0.5 truncate text-xs font-bold" title={value}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Charges */}
      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-navy-900 text-left">
            <th className="pb-2 text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">
              Description
            </th>
            <th className="pb-2 text-right text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">
          <tr>
            <td className="py-3">
              <p className="font-semibold">
                {bill.packageName} — {bill.destination}
              </p>
              <p className="mt-0.5 text-xs text-navy-500 tabular-nums">
                {bill.travellers} travellers × {formatCurrency(bill.pricePerPerson)} per person
                {' '}· {bill.days} days
              </p>
            </td>
            <td className="py-3 text-right font-semibold tabular-nums">
              {formatCurrency(totals.subtotal)}
            </td>
          </tr>

          {(bill.extraCharges ?? []).map((charge) => (
            <tr key={charge.label}>
              <td className="py-3">
                <p className="font-medium">{charge.label}</p>
                <p className="mt-0.5 text-xs text-navy-400 uppercase">Add-on</p>
              </td>
              <td className="py-3 text-right font-semibold tabular-nums">
                {formatCurrency(charge.amount)}
              </td>
            </tr>
          ))}

          {totals.discount > 0 && (
            <tr>
              <td className="py-3 font-medium text-emerald-700">Discount applied</td>
              <td className="py-3 text-right font-semibold text-emerald-700 tabular-nums">
                − {formatCurrency(totals.discount)}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <dl className="w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-500">Subtotal</dt>
            <dd className="font-semibold tabular-nums">{formatCurrency(totals.subtotal)}</dd>
          </div>
          {totals.extras > 0 && (
            <div className="flex justify-between">
              <dt className="text-navy-500">Add-ons</dt>
              <dd className="font-semibold tabular-nums">{formatCurrency(totals.extras)}</dd>
            </div>
          )}
          {totals.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-navy-500">Discount</dt>
              <dd className="font-semibold text-emerald-700 tabular-nums">
                − {formatCurrency(totals.discount)}
              </dd>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-navy-900 pt-2.5">
            <dt className="font-display font-extrabold">Grand total</dt>
            <dd className="font-display text-lg font-extrabold tabular-nums">
              {formatCurrency(totals.grandTotal)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-500">Advance received ({bill.paymentMode})</dt>
            <dd className="font-semibold tabular-nums">{formatCurrency(totals.advancePaid)}</dd>
          </div>
          <div
            className={`flex justify-between rounded-xl px-3.5 py-2.5 ${
              totals.balanceDue <= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-gold-100 text-gold-700'
            }`}
          >
            <dt className="font-bold">{totals.balanceDue <= 0 ? 'Balance settled' : 'Balance due'}</dt>
            <dd className="font-extrabold tabular-nums">
              {formatCurrency(Math.max(totals.balanceDue, 0))}
            </dd>
          </div>
        </dl>
      </div>

      {/* Payment + notes */}
      {(bill.paymentRef || bill.notes) && (
        <section className="mt-7 grid gap-5 border-t border-sand-200 pt-5 sm:grid-cols-2">
          {bill.paymentRef && (
            <div>
              <p className="text-[0.625rem] font-bold tracking-[0.16em] text-navy-400 uppercase">
                Payment details
              </p>
              <p className="mt-1.5 text-sm font-semibold">{bill.paymentMode}</p>
              <p className="mt-0.5 font-mono text-xs text-navy-500">{bill.paymentRef}</p>
            </div>
          )}
          {bill.notes && (
            <div>
              <p className="text-[0.625rem] font-bold tracking-[0.16em] text-navy-400 uppercase">
                Notes
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-navy-600">{bill.notes}</p>
            </div>
          )}
        </section>
      )}

      <footer className="mt-8 border-t border-sand-200 pt-5 text-center">
        <p className="font-display text-sm font-bold">Thank you for travelling with us!</p>
        <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-navy-400">
          This is a computer-generated invoice · {company.legalName} · {company.emailGeneral} ·{' '}
          {company.phoneSecondary}
          <br />
          Prices on this bill were agreed at the time of booking and are independent of any later
          revisions to our published packages.
        </p>
      </footer>
    </article>
  )
}
