import { useState, useEffect } from 'react'

export default function Taskbar({ onMonochrome, isMonochrome, onAbout, idealActive }) {
  const [time, setTime] = useState('')
  const [hovering, setHovering] = useState(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const iconBtnStyle = (id) => ({
    background: 'none',
    border: 'none',
    color: 'var(--teal-deep)',
    fontFamily: 'Arial Narrow, Arial, sans-serif',
    fontSize: '15px',
    padding: '0 15px',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    whiteSpace: 'nowrap',
  })

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      right: 0,
      height: '28px',
      backgroundColor: 'var(--teal-deep)',
      borderTop: '2px solid var(--teal-bright)',
      zIndex: 20,
      width: '80vw',
      display: 'flex',
      alignItems: 'stretch',
    }}>

      {/* About — XP start button style */}
      <button
        onClick={onAbout}
        style={{
          backgroundColor: 'var(--magenta)',
          border: 'none',
          borderRight: 'none',
          borderRadius: '0 12px 12px 0',
          color: 'var(--yellow)',
          fontFamily: 'Arial Narrow, Arial, sans-serif',
          fontSize: '20px',
          fontWeight: '700',
          letterSpacing: '0.08em',
          padding: '0 16px',
          paddingLeft: '10px',
          cursor: 'pointer',
          height: '100%',
          flexShrink: 0,
        }}
      >
        ABOUT
      </button>

      {/* Center — IDEAL installer slot */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: '4px',
      }}>
        {idealActive && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid var(--teal-bright)',
            color: 'var(--teal-bright)',
            fontFamily: 'Arial Narrow, Arial, sans-serif',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            padding: '2px 16px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
          }}>
            IDEAL_LAUNCHER
          </div>
        )}
      </div>

      {/* Right — system tray area in teal-bright */}
      <div style={{
        backgroundColor: 'var(--teal-bright)',
        display: 'flex',
        alignItems: 'stretch',
        flexShrink: 0,
      }}>
        {/* Restart icon button */}
        <div
          onClick={() => window.location.reload()}
          onMouseEnter={() => setHovering('restart')}
          onMouseLeave={() => setHovering(null)}
          style={iconBtnStyle('restart')}
        >
          ⏻
          {hovering === 'restart' && (
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--black)',
              color: 'var(--teal-bright)',
              fontFamily: 'var(--font-mono)',
              fontSize: '15px',
              padding: '3px 6px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              border: '2px solid var(--teal-deep)',
            }}>
              RESTART
            </div>
          )}
        </div>

        {/* Mono icon button */}
        <div
          onClick={onMonochrome}
          onMouseEnter={() => setHovering('mono')}
          onMouseLeave={() => setHovering(null)}
          style={{
            ...iconBtnStyle('mono'),
          }}
        >
          ◑
          {hovering === 'mono' && (
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--black)',
              color: 'var(--teal-bright)',
              fontFamily: 'var(--font-mono)',
              fontSize: '15px',
              padding: '3px 6px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              border: '2px solid var(--teal-deep)',
            }}>
              {isMonochrome ? 'COLOR MODE' : 'B/W MODE'}
            </div>
          )}
        </div>

        {/* Time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          color: 'var(--teal-deep)',
          fontFamily: 'var(--font-mono)',
          fontSize: '15px',
          fontWeight: '700',
        }}>
          {time}
        </div>
      </div>
    </div>
  )
}