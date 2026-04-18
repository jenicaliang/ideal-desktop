import { useState, useEffect, useRef } from 'react'

const BOOT_MESSAGES = [
  'Mounting file system...',
  'Loading kernel modules...',
  'Initializing display driver...',
  'Starting desktop environment...',
  'Loading user preferences...',
  'Desktop OS 56 ready.',
]

function Scanlines() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
      pointerEvents: 'none',
      zIndex: 1,
    }} />
  )
}

function BootPhase({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [messageIdx, setMessageIdx] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const DURATION = 4000

  useEffect(() => {
    startRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = now - (startRef.current ?? now)
      const p = Math.min(elapsed / DURATION, 1)
      setProgress(p)
      setMessageIdx(Math.min(Math.floor(p * BOOT_MESSAGES.length), BOOT_MESSAGES.length - 1))

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setTimeout(onDone, 400)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--teal-deep)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Scanlines />

      <div style={{
        border: '2px solid var(--teal-bright)',
        backgroundColor: 'var(--black)',
        width: 'clamp(320px, 55vw, 720px)',
        padding: 'clamp(32px, 4vw, 60px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(24px, 3vw, 40px)',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          color: 'var(--teal-bright)',
          fontSize: 'clamp(28px, 4vw, 56px)',
          fontFamily: 'Arial Narrow, Arial, sans-serif',
          fontWeight: '700',
          letterSpacing: '0.04em',
          lineHeight: 1,
        }}>
          Desktop OS 56
        </div>

        <div style={{
          border: '1px solid var(--teal-bright)',
          padding: 'clamp(16px, 2vw, 28px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 1.2vw, 18px)',
        }}>
          <div style={{
            width: '100%',
            height: 'clamp(6px, 0.7vw, 12px)',
            border: '1px solid var(--teal-bright)',
            position: 'relative',
            backgroundColor: 'transparent',
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress * 100}%`,
              backgroundColor: 'var(--teal-bright)',
              transition: 'width 0.1s linear',
            }} />
          </div>

          <div style={{
            color: 'var(--teal-bright)',
            fontSize: 'clamp(11px, 0.9vw, 15px)',
            letterSpacing: '0.06em',
            opacity: 0.7,
            minHeight: '1.4em',
          }}>
            {BOOT_MESSAGES[messageIdx]}
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 'clamp(12px, 1.5vw, 20px)',
        right: 'clamp(16px, 2vw, 28px)',
        color: 'rgba(0,255,224,0.25)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(9px, 0.65vw, 12px)',
        letterSpacing: '0.12em',
        zIndex: 2,
      }}>
        v56.0.1
      </div>
    </div>
  )
}

function SettingsPhase({ enableAudio, onToggleAudio, enableMonochrome, onToggleMonochrome, onDone }: {
  enableAudio: boolean
  onToggleAudio: () => void
  enableMonochrome: boolean
  onToggleMonochrome: () => void
  onDone: () => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const optionStyle = (active: boolean): React.CSSProperties => ({
    background: 'none',
    border: `1px solid ${active ? 'var(--teal-bright)' : 'rgba(0,255,224,0.25)'}`,
    color: active ? 'var(--teal-bright)' : 'rgba(0,255,224,0.35)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(11px, 0.85vw, 15px)',
    letterSpacing: '0.1em',
    padding: 'clamp(8px, 0.8vw, 14px) clamp(16px, 1.5vw, 28px)',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    transition: 'all 0.15s',
    width: '100%',
    textAlign: 'left' as const,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  })

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--teal-deep)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Scanlines />

      <div style={{
        border: '2px solid var(--teal-bright)',
        backgroundColor: 'var(--black)',
        width: 'clamp(320px, 55vw, 720px)',
        padding: 'clamp(32px, 4vw, 60px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(24px, 3vw, 40px)',
        position: 'relative',
        zIndex: 2,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{
            color: 'rgba(0,255,224,0.4)',
            fontSize: 'clamp(9px, 0.65vw, 12px)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            System configuration
          </div>
          <div style={{
            color: 'var(--teal-bright)',
            fontSize: 'clamp(20px, 2.5vw, 36px)',
            fontFamily: 'Arial Narrow, Arial, sans-serif',
            fontWeight: '700',
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}>
            Your Desktop Display Settings
          </div>
        </div>

        <div style={{
          border: '1px solid var(--teal-bright)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <button onClick={onToggleAudio} style={optionStyle(enableAudio)}>
            <span>Audio</span>
            <span style={{ opacity: enableAudio ? 1 : 0.4 }}>{enableAudio ? 'ON' : 'OFF'}</span>
          </button>
          <div style={{ height: '1px', backgroundColor: 'rgba(0,255,224,0.2)' }} />
          <button onClick={onToggleMonochrome} style={optionStyle(enableMonochrome)}>
            <span>Monochrome mode</span>
            <span style={{ opacity: enableMonochrome ? 1 : 0.4 }}>{enableMonochrome ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <button
          onClick={onDone}
          style={{
            background: 'var(--teal-deep)',
            border: '1px solid var(--teal-bright)',
            color: 'var(--teal-bright)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(11px, 0.85vw, 15px)',
            letterSpacing: '0.15em',
            padding: 'clamp(10px, 1vw, 16px)',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'background 0.15s',
            width: '100%',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,255,224,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--teal-deep)')}
        >
          Start Desktop →
        </button>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 'clamp(12px, 1.5vw, 20px)',
        right: 'clamp(16px, 2vw, 28px)',
        color: 'rgba(0,255,224,0.25)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(9px, 0.65vw, 12px)',
        letterSpacing: '0.12em',
        zIndex: 2,
      }}>
        v56.0.1
      </div>
    </div>
  )
}

export default function BootScreen({ onComplete, enableAudio, onToggleAudio, enableMonochrome, onToggleMonochrome }: {
  onComplete: () => void
  enableAudio: boolean
  onToggleAudio: () => void
  enableMonochrome: boolean
  onToggleMonochrome: () => void
}) {
  const [phase, setPhase] = useState<'boot' | 'settings'>('boot')

  return phase === 'boot'
    ? <BootPhase onDone={() => setPhase('settings')} />
    : <SettingsPhase
        enableAudio={enableAudio}
        onToggleAudio={onToggleAudio}
        enableMonochrome={enableMonochrome}
        onToggleMonochrome={onToggleMonochrome}
        onDone={onComplete}
      />
}