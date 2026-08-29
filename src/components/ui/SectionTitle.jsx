import { useReveal } from '../../hooks'

/**
 * Section heading block: small eyebrow label, headline, optional lead paragraph.
 * `tone="dark"` inverts the colours for use on navy sections.
 */
export default function SectionTitle({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'light',
  as: Heading = 'h2',
  className = '',
  children,
}) {
  const ref = useReveal()
  const centered = align === 'center'

  return (
    <div
      ref={ref}
      className={`reveal ${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}
    >
      {eyebrow && (
        <p
          className={`mb-4 inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.18em] uppercase ${
            tone === 'dark' ? 'text-bone-200' : 'text-crimson-600'
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-px w-8 ${tone === 'dark' ? 'bg-bone-200/50' : 'bg-crimson-600/50'}`}
          />
          {eyebrow}
        </p>
      )}

      <Heading
        className={`text-balance text-3xl leading-[1.12] sm:text-4xl lg:text-[2.75rem] ${
          tone === 'dark' ? 'text-white' : 'text-navy-900'
        }`}
      >
        {title}
      </Heading>

      {lead && (
        <p
          className={`mt-5 text-[1.0625rem] leading-relaxed ${
            tone === 'dark' ? 'text-navy-200' : 'text-navy-600'
          }`}
        >
          {lead}
        </p>
      )}

      {children}
    </div>
  )
}
