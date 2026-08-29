import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  User,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { whatsappLink } from '../../data/company'
import { GROUP_TYPES } from '../../data/constants'
import { createEnquiry } from '../../firebase/collections/enquiries'
import { usePublishedDestinations } from '../../firebase/collections/destinations'
import { usePublishedPackages } from '../../firebase/collections/packages'
import { formatDate } from '../../utils/format'
import { enquiryRules, validate } from '../../utils/validation'
import Button from '../ui/Button'
import FormInput from '../ui/FormInput'
import Modal from '../ui/Modal'
import SelectInput from '../ui/SelectInput'
import TextArea from '../ui/TextArea'

/**
 * The single enquiry form in the app — used by /enquire and /contact.
 *
 * PHASE 2B: submitting validates, writes a real Firestore enquiry via
 * `createEnquiry()` and shows the generated reference number in the success
 * modal. Failures keep every filled value on screen with an inline error.
 * There is NO online booking and NO online payment — this only requests a
 * call-back from a coordinator.
 */

const NOT_SURE = 'Not decided yet'

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  destination: '',
  packageName: '',
  travelDate: '',
  travellers: '',
  days: '',
  groupType: '',
  requirements: '',
}

export default function EnquiryForm({
  defaultDestination = '',
  defaultPackage = '',
  defaultGroupType = '',
  compact = false,
  className = '',
}) {
  const [values, setValues] = useState({
    ...EMPTY,
    destination: defaultDestination,
    packageName: defaultPackage,
    groupType: defaultGroupType,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  // Live catalogue data — same Firestore subscriptions the public pages use.
  const { data: publishedDestinations } = usePublishedDestinations()
  const { data: publishedPackages } = usePublishedPackages()

  const destinationOptions = useMemo(
    () => [
      ...(publishedDestinations ?? []).map((destination) => ({
        value: destination.name,
        label: destination.name,
      })),
      { value: 'Multiple destinations', label: 'Multiple destinations / custom circuit' },
      { value: NOT_SURE, label: 'Not decided yet — please advise' },
    ],
    [publishedDestinations],
  )

  // Packages narrow to the chosen destination so the two fields never disagree.
  const packageChoices = useMemo(() => {
    const matching = (publishedPackages ?? [])
      .filter((pkg) => !values.destination || pkg.destination === values.destination)
      .map((pkg) => ({ value: pkg.name, label: `${pkg.name} · ${pkg.duration}` }))

    return [...matching, { value: NOT_SURE, label: 'Not decided yet / custom itinerary' }]
  }, [publishedPackages, values.destination])

  const update = (field) => (event) => {
    const { value } = event.target
    setValues((current) => {
      // Changing destination invalidates a package from a different destination.
      if (field === 'destination') {
        const stillValid =
          current.packageName === NOT_SURE ||
          (publishedPackages ?? []).some(
            (pkg) => pkg.name === current.packageName && pkg.destination === value,
          )
        return {
          ...current,
          destination: value,
          packageName: stillValid ? current.packageName : '',
        }
      }
      return { ...current, [field]: value }
    })

    // Clear a field's error as soon as the visitor edits it.
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
    setSubmitError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = validate(values, enquiryRules)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      // Move focus to the first problem so keyboard and screen-reader users land on it.
      const firstField = Object.keys(found)[0]
      document.getElementById(`enq-${firstField}`)?.focus()
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const { referenceNumber } = await createEnquiry({
        ...values,
        travellers: Number(values.travellers),
        days: Number(values.days),
      })
      setSubmitted({ ...values, reference: referenceNumber })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const closeSuccess = () => {
    setSubmitted(null)
    setValues({
      ...EMPTY,
      destination: defaultDestination,
      packageName: defaultPackage,
      groupType: defaultGroupType,
    })
    setErrors({})
    setSubmitError(null)
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`rounded-3xl bg-white p-6 shadow-panel sm:p-8 ${className}`}
      >
        <div className={`grid gap-5 ${compact ? '' : 'sm:grid-cols-2'}`}>
          <FormInput
            id="enq-name"
            name="name"
            label="Full name"
            required
            icon={User}
            value={values.name}
            onChange={update('name')}
            error={errors.name}
            placeholder="e.g. Karthik Subramanian"
            autoComplete="name"
          />

          <FormInput
            id="enq-phone"
            name="phone"
            type="tel"
            label="Phone / WhatsApp number"
            required
            icon={Phone}
            value={values.phone}
            onChange={update('phone')}
            error={errors.phone}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            hint="We call back on this number, usually the same day."
          />

          <FormInput
            id="enq-email"
            name="email"
            type="email"
            label="Email address"
            required
            icon={Mail}
            value={values.email}
            onChange={update('email')}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
            className={compact ? '' : 'sm:col-span-2'}
          />

          <SelectInput
            id="enq-destination"
            name="destination"
            label="Destination"
            required
            icon={MapPin}
            value={values.destination}
            onChange={update('destination')}
            options={destinationOptions}
            error={errors.destination}
            placeholder="Where would you like to go?"
          />

          <SelectInput
            id="enq-packageName"
            name="packageName"
            label="Package"
            value={values.packageName}
            onChange={update('packageName')}
            options={packageChoices}
            error={errors.packageName}
            placeholder="Pick a package (optional)"
            hint={
              values.destination
                ? `${packageChoices.length - 1} packages available for ${values.destination}`
                : 'Choose a destination first to narrow this list.'
            }
          />

          <FormInput
            id="enq-travelDate"
            name="travelDate"
            type="date"
            label="Preferred travel date"
            required
            icon={CalendarDays}
            value={values.travelDate}
            onChange={update('travelDate')}
            error={errors.travelDate}
          />

          <SelectInput
            id="enq-groupType"
            name="groupType"
            label="Group type"
            required
            icon={Users}
            value={values.groupType}
            onChange={update('groupType')}
            options={GROUP_TYPES}
            error={errors.groupType}
            placeholder="Who is travelling?"
          />

          <FormInput
            id="enq-travellers"
            name="travellers"
            type="number"
            label="Number of travellers"
            required
            min="1"
            max="500"
            value={values.travellers}
            onChange={update('travellers')}
            error={errors.travellers}
            placeholder="e.g. 42"
            suffix="pax"
          />

          <FormInput
            id="enq-days"
            name="days"
            type="number"
            label="Number of days"
            required
            min="1"
            max="30"
            icon={Clock}
            value={values.days}
            onChange={update('days')}
            error={errors.days}
            placeholder="e.g. 3"
            suffix="days"
          />

          <TextArea
            id="enq-requirements"
            name="requirements"
            label="Additional requirements"
            value={values.requirements}
            onChange={update('requirements')}
            error={errors.requirements}
            rows={4}
            maxLength={600}
            placeholder="Budget per head, hotel preference, pick-up point, meal requirements, accessibility needs, anything else we should plan around."
            className={compact ? '' : 'sm:col-span-2'}
          />
        </div>

        {submitError && (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-crimson-200 bg-crimson-50 px-4 py-3 text-sm font-semibold text-crimson-700"
          >
            {submitError} You can also reach us directly on WhatsApp or by phone.
          </p>
        )}

        <div className="mt-7 flex flex-col gap-4 border-t border-sand-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-navy-400">
            No payment is collected on this website. A coordinator confirms availability and pricing
            with you before anything is booked.
          </p>

          <div className="flex shrink-0 flex-wrap gap-2.5">
            <Button
              href={whatsappLink()}
              variant="whatsapp"
              size="md"
              icon={MessageCircle}
              className="sm:order-2"
            >
              WhatsApp
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Submit Enquiry'}
            </Button>
          </div>
        </div>
      </form>

      {/* Success — frontend confirmation only */}
      <Modal
        open={Boolean(submitted)}
        onClose={closeSuccess}
        size="lg"
        footer={
          <>
            <Button variant="subtle" size="sm" onClick={closeSuccess}>
              Send another enquiry
            </Button>
            <Button
              href={whatsappLink(
                `Hi Avengers Holidays, I just submitted enquiry ${submitted?.reference ?? ''} for ${submitted?.destination ?? ''}.`,
              )}
              variant="whatsapp"
              size="sm"
              icon={MessageCircle}
            >
              Continue on WhatsApp
            </Button>
          </>
        }
      >
        {submitted && (
          <div className="text-center">
            <span
              aria-hidden="true"
              className="mx-auto grid size-16 place-content-center rounded-full bg-emerald-50 text-emerald-600"
            >
              <CheckCircle2 size={34} strokeWidth={1.8} />
            </span>

            <h2 className="mt-5 text-2xl text-navy-900">Enquiry received</h2>
            <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-navy-500">
              Thank you, {submitted.name.split(' ')[0]}. A trip coordinator will call you on{' '}
              <span className="font-semibold text-navy-800">{submitted.phone}</span> with a costed
              itinerary — usually within a few working hours.
            </p>

            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-sm font-bold text-navy-800">
              Reference
              <span className="font-display text-crimson-600">{submitted.reference}</span>
            </p>

            <dl className="mt-7 grid gap-px overflow-hidden rounded-2xl bg-sand-200 text-left sm:grid-cols-2">
              {[
                { label: 'Destination', value: submitted.destination },
                { label: 'Package', value: submitted.packageName || 'To be advised' },
                { label: 'Travel date', value: formatDate(submitted.travelDate, { long: true }) },
                { label: 'Group type', value: submitted.groupType },
                { label: 'Travellers', value: `${submitted.travellers} people` },
                { label: 'Days', value: `${submitted.days} days` },
              ].map((row) => (
                <div key={row.label} className="bg-white px-4 py-3">
                  <dt className="text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-navy-900">{row.value}</dd>
                </div>
              ))}
            </dl>

            {submitted.requirements && (
              <div className="mt-4 rounded-2xl bg-sand-50 p-4 text-left">
                <p className="text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">
                  Your notes
                </p>
                <p className="mt-1 text-sm leading-relaxed text-navy-600">
                  {submitted.requirements}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
