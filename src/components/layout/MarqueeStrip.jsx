const TEXT = "Let\u2019s Make Your Travel Plans Perfect !!!"

export default function MarqueeStrip() {
  return (
    <div className="marquee-strip" aria-hidden="true">
      <div className="marquee-strip__track">
        <span className="marquee-strip__text">{TEXT}</span>
        <span className="marquee-strip__text">{TEXT}</span>
        <span className="marquee-strip__text">{TEXT}</span>
        <span className="marquee-strip__text">{TEXT}</span>
      </div>
    </div>
  )
}
