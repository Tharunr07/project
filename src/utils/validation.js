/**
 * Form validation.
 *
 * Pure functions — no framework, no dependency. `validate(values, rules)` returns
 * an `{ field: message }` object which is empty when the form is valid.
 */

const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

export const rules = {
  required: (label) => (value) =>
    value === null || value === undefined || String(value).trim() === ''
      ? `${label} is required`
      : null,

  minLength: (label, min) => (value) =>
    value && String(value).trim().length < min
      ? `${label} must be at least ${min} characters`
      : null,

  phone: () => (value) =>
    value && !PHONE_RE.test(String(value).replace(/\s|-/g, ''))
      ? 'Enter a valid 10-digit Indian mobile number'
      : null,

  // Trim before testing — pasted values often carry leading/trailing spaces
  // (or non-breaking spaces) that must not fail an otherwise valid address.
  email: () => (value) => (value && !EMAIL_RE.test(String(value).trim()) ? 'Enter a valid email address' : null),

  min: (label, min) => (value) =>
    value !== '' && Number(value) < min ? `${label} must be at least ${min}` : null,

  max: (label, max) => (value) =>
    value !== '' && Number(value) > max ? `${label} cannot be more than ${max}` : null,

  integer: (label) => (value) =>
    value !== '' && !Number.isInteger(Number(value)) ? `${label} must be a whole number` : null,

  notPast: (label) => (value) => {
    if (!value) return null
    // Compare as plain strings — avoids any timezone interpretation.
    const today = new Date().toISOString().slice(0, 10)
    return value < today ? `${label} cannot be in the past` : null
  },

  oneOf: (label, allowed) => (value) =>
    value && !allowed.includes(value) ? `Choose a valid ${label.toLowerCase()}` : null,
}

/**
 * Run a rule map over a values object.
 * @param {object} values  the form state
 * @param {object} ruleMap { fieldName: [ruleFn, ruleFn] }
 * @returns {object} { fieldName: 'first failing message' }
 */
export function validate(values, ruleMap) {
  const errors = {}
  for (const [field, fieldRules] of Object.entries(ruleMap)) {
    for (const rule of fieldRules) {
      const message = rule(values[field], values)
      if (message) {
        errors[field] = message
        break
      }
    }
  }
  return errors
}

/** Rule map for the public enquiry form — shared by the page and the contact form. */
export const enquiryRules = {
  name: [rules.required('Name'), rules.minLength('Name', 3)],
  phone: [rules.required('Phone number'), rules.phone()],
  email: [rules.required('Email'), rules.email()],
  destination: [rules.required('Destination')],
  travelDate: [rules.required('Travel date'), rules.notPast('Travel date')],
  travellers: [
    rules.required('Number of travellers'),
    rules.integer('Number of travellers'),
    rules.min('Number of travellers', 1),
    rules.max('Number of travellers', 500),
  ],
  days: [
    rules.required('Number of days'),
    rules.integer('Number of days'),
    rules.min('Number of days', 1),
    rules.max('Number of days', 30),
  ],
  groupType: [rules.required('Group type')],
}
