import { useState, useEffect } from 'react'

const HEADLINES = [
  "PRESIDENT ONCE AGAIN DECLARES STATE OF EMERGENCY",
  "MARKETS HIT ALL TIME HIGH DESPITE RECORD UNEMPLOYMENT",
  "NEW STUDY FINDS PRODUCTIVITY APP USERS 40% MORE ANXIOUS",
  "TECH COMPANY ANNOUNCES MANDATORY WELLNESS PROGRAM FOR ALL EMPLOYEES",
  "SCIENTISTS CONFIRM OPTIMAL MORNING ROUTINE NOW 4 HOURS LONG",
]

export default function BreakingNews() {
  const [hidden, setHidden] = useState(false)
  const [countdown, setCountdown] = useState(null)

  const handleIgnore = () => {
    setHidden(true)
    setCountdown(5)
  }

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      setHidden(false)
      setCountdown(null)
      return
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  if (hidden) return (
    <div style={{
      position: 'absolute',
      bottom: '28px',
      left: '20vw',
      right: 0,
      height: '30px',
      backgroundColor: 'var(--red)',
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      justifyContent: 'space-between',
    }}>
      <span style={{
        color: 'var(--yellow)',
        fontFamily: 'Arial Narrow, Arial, sans-serif',
        fontSize: '20px',
      }}>
        BREAKING NEWS
      </span>
      <span style={{
        color: 'var(--yellow)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
      }}>
        returning in {countdown}s
      </span>
    </div>
  )

  return (
    <div style={{
      position: 'absolute',
      bottom: '28px',
      left: '20vw',
      right: 0,
      zIndex: 20,
    }}>
      {/* Top bar */}
      <div style={{
        backgroundColor: 'var(--red)',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
      }}>
        <span style={{
          color: 'var(--yellow)',
          fontFamily: 'Arial Narrow, Arial, sans-serif',
          fontSize: '22px',
        }}>
          BREAKING NEWS
        </span>
        <button
          onClick={handleIgnore}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--yellow)',
            fontFamily: 'Arial Narrow, Arial, sans-serif',
            fontSize: '22px',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          IGNORE
        </button>
      </div>

      {/* Scrolling headline */}
      <div style={{
        backgroundColor: 'var(--black)',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          gap: '120px',
          animation: 'ticker 30s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {[...HEADLINES, ...HEADLINES].map((h, i) => (
            <span key={i} style={{
              color: 'var(--red)',
              fontFamily: 'Arial Narrow, Arial, sans-serif',
              fontSize: '50px',
              letterSpacing: '0.08em',
            }}>
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}