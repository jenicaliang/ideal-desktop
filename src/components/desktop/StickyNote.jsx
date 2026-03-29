import { useState, useRef } from 'react'

export default function StickyNote({ title, items, error, initialX = 300, initialY = 200, fontSize = '12px', zIndex = 20, onFocus }) {
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const [flash, setFlash] = useState(false)
  const dragOffset = useRef(null)

  const onMouseDown = (e) => {
    if (onFocus) onFocus()
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e) => {
    setPos({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    })
  }

  const onMouseUp = () => {
    dragOffset.current = null
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  const onClose = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 2000)
  }

  return (
    <div style={{
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      width: 'auto',
      backgroundColor: 'var(--yellow)',
      border: '2px solid var(--teal-deep)',
      zIndex: zIndex,
      boxShadow: '0px 3px 8px var(--teal-deep)',
      userSelect: 'none',
    }}>
      {/* Title bar */}
      <div
        onMouseDown={onMouseDown}
        style={{
          backgroundColor: 'var(--teal-deep)',
          padding: '5px 17px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'grab',
        }}
      >
        <span style={{
          color: 'var(--teal-bright)',
          fontFamily: 'Arial Narrow, Arial, sans-serif',
          fontSize: '20px',
          fontWeight: '700',
          letterSpacing: '0.05em',
        }}>
          {title}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--yellow)',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0 2px',
          }}
        >
          X
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '15px 17px' }}>
        {items.map((item, i) => (
            item === '' 
                ? <div key={i} style={{ height: '15px' }} />
                : <div key={i} style={{
                    fontFamily: 'var(--font-os)',
                    fontSize: fontSize,
                    lineHeight: '1.2',
                    color: 'var(--black)',
                    marginBottom: '4px',
        }}>
            {item}
      </div>
))}
      </div>

      {/* Pinned flash message */}
      {flash && (
        <div style={{
          position: 'absolute',
          bottom: '-27px',
          left: 0,
          right: 0,
          backgroundColor: 'var(--red)',
          color: 'var(--yellow)',
          fontFamily: 'var(--font-mono)',
          fontSize: '15px',
          padding: '4px 8px',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}
    </div>
  )
}