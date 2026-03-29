import { useRef, useEffect, useState } from 'react'

const TICKER_ITEMS = [
  "YOU CAN DO IT! TOMORROW IS A NEW DAY",
  "CONSISTENCY IS THE KEY TO SUCCESS",
  "YOU ARE CAPABLE OF AMAZING THINGS",
]

export default function Ticker() {
  const innerRef = useRef(null)
  const [duration, setDuration] = useState(20)

  useEffect(() => {
    if (innerRef.current) {
      const width = innerRef.current.scrollWidth / 2
      const speed = 150 // pixels per second, adjust for faster/slower
      setDuration(width / speed)
    }
  }, [])

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '120px',
      background: 'linear-gradient(to bottom, var(--magenta) 0%, var(--magenta) 60%, var(--purple) 100%)',
      borderTop: '3px solid var(--yellow)',
      borderBottom: '1px solid var(--teal-deep)',
      borderRight: '3px solid var(--teal-deep)',
      boxShadow: '0 4px 4px var(--teal-deep)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      <div
        ref={innerRef}
        style={{
          display: 'flex',
          gap: '80px',
          animation: `ticker ${duration}s linear infinite`,
          whiteSpace: 'nowrap',
        }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} style={{
            color: 'var(--yellow)',
            fontFamily: 'Arial Narrow, Arial, sans-serif',
            fontSize: '110px',
            fontWeight: '300',
            letterSpacing: '0.08em',
            fontStretch: 'condensed',
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}