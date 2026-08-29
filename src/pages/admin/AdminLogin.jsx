import {
  ArrowRight,
  CircleCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Logo, { LogoMark } from '../../components/ui/Logo'
import Button from '../../components/ui/Button'
import FormInput from '../../components/ui/FormInput'
import Modal from '../../components/ui/Modal'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { company } from '../../data/company'
import { img } from '../../data/images'
import { sendResetEmail } from '../../firebase/auth'
import { rules, validate } from '../../utils/validation'

const loginRules = {
  email: [rules.required('Email'), rules.email()],
  password: [rules.required('Password')],
}

/**
 * Admin sign-in — PHASE 2C.
 *
 * Real Firebase Email/Password authentication against the manually-created
 * accounts in Firebase Console, further authorised by users/{uid} (role +
 * active checks in firebase/auth.js). Failures surface as a friendly inline
 * error; the pending state is genuine network latency.
 */
export default function AdminLogin() {
  const { isAuthenticated, login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const redirectTo = useMemo(() => location.state?.from ?? '/admin/dashboard', [location.state])

  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
    setFormError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = validate(values, loginRules)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    setFormError(null)
    try {
      await login(values.email.trim(), values.password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-navy-950 lg:grid-cols-[1.1fr_1fr]">
      {/* Branding panel */}
      <div className="relative hidden isolate overflow-hidden lg:block">
        <img
          src={img.heroValley}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-navy-950 via-navy-950/80 to-crimson-900/40" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo size="md" tone="light" to="/" />

          <div>
            <p className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.16em] text-bone-200 uppercase ring-1 ring-inset ring-white/20 backdrop-blur-sm">
              <ShieldCheck size={14} aria-hidden="true" />
              Internal operations portal
            </p>
            <h2 className="mt-6 max-w-md text-balance font-display text-4xl leading-tight font-extrabold text-white">
              Trips, bills and travellers — the whole operation on one screen.
            </h2>
            <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-navy-200">
              Manage packages, run trip P&amp;L, issue invoices and track every enquiry for{' '}
              {company.name}.
            </p>

            <ul className="mt-10 grid max-w-md gap-3">
              {[
                'Live trip P&L with automatic totals',
                'One-click printable customer bills',
                'Destination and group-type reports',
              ].map((line) => (
                <li key={line} className="flex items-center gap-3 text-sm font-semibold text-navy-100">
                  <CircleCheck size={17} className="shrink-0 text-brand-400" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs font-semibold text-navy-400">
            © {new Date().getFullYear()} {company.legalName}
          </p>
        </div>
      </div>

      {/* Login form panel */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md rounded-4xl bg-white p-7 shadow-lift sm:p-9">
          <div className="lg:hidden">
            <Logo size="md" to="/" />
          </div>

          <span
            aria-hidden="true"
            className="mt-6 hidden size-12 place-content-center rounded-2xl bg-crimson-50 text-crimson-600 lg:grid"
          >
            <LogoMark size={30} />
          </span>

          <h1 className="mt-6 font-display text-2xl font-extrabold text-navy-900 lg:mt-5">
            Admin sign-in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-navy-500">
            Authorised staff accounts only — access is managed through Firebase Authentication.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <FormInput
              id="login-email"
              name="email"
              type="email"
              label="Email or username"
              required
              icon={UserRound}
              value={values.email}
              onChange={update('email')}
              error={errors.email}
              placeholder="admin@avengersholidays.in"
              autoComplete="username"
            />

            <FormInput
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              required
              icon={LockKeyhole}
              value={values.password}
              onChange={update('password')}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="current-password"
              labelSuffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-navy-400 transition-colors hover:text-navy-900"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              }
            />

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded border-sand-300 text-crimson-600 accent-crimson-600"
                />
                Keep me signed in
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="cursor-pointer text-sm font-bold text-crimson-600 transition-colors hover:text-crimson-700"
              >
                Forgot password?
              </button>
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-2xl border border-crimson-200 bg-crimson-50 px-4 py-3 text-sm font-semibold text-crimson-700"
              >
                {formError}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={submitting}
              iconRight={ArrowRight}
            >
              {submitting ? 'Signing in…' : 'Sign in to Dashboard'}
            </Button>
          </form>

          <p className="mt-7 rounded-2xl bg-sand-100 px-4 py-3 text-xs leading-relaxed text-navy-500">
            <strong className="font-bold text-navy-800">Note:</strong> only accounts created by the
            agency in Firebase Console can sign in. There is no public registration. Forgot your
            password? Use the reset link above.
          </p>
        </div>
      </div>

      {/* Forgot password — sends a real reset email via Firebase Auth */}
      <ResetModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  )
}

function ResetModal({ open, onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | error message

  const send = async () => {
    if (!email.trim()) {
      setStatus('Enter the email registered with your account.')
      return
    }
    setStatus('sending')
    try {
      await sendResetEmail(email)
      setStatus('sent')
    } catch (error) {
      // Deliberately vague for unknown addresses so accounts cannot be probed.
      setStatus(
        error.code === 'auth/user-not-found'
          ? 'If that email is registered, a reset link is on its way.'
          : error.message,
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Reset your password"
      description="We will email a secure reset link to your registered address."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={send}
            loading={status === 'sending'}
            disabled={status === 'sending' || status === 'sent'}
          >
            {status === 'sent' ? 'Link sent' : 'Send reset link'}
          </Button>
        </>
      }
    >
      {status === 'sent' || status === 'If that email is registered, a reset link is on its way.' ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          If that email is registered, a reset link is on its way. Check the inbox and spam folder.
        </p>
      ) : (
        <div className="space-y-4">
          <FormInput
            id="reset-email"
            type="email"
            label="Registered email"
            icon={UserRound}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (status !== 'sending') setStatus(null)
            }}
            placeholder="admin1@avengersholidays.in"
            autoComplete="email"
          />
          {status && status !== 'sending' && (
            <p role="alert" className="text-sm font-semibold text-crimson-700">
              {status}
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}
