import { useState, useRef } from 'react'

export default function AboutWindow({ onClose }) {
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 })
  const dragOffset = useRef(null)

  const onMouseDown = (e) => {
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e) => {
    setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })
  }

  const onMouseUp = () => {
    dragOffset.current = null
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  return (
    <div style={{
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      width: '400px',
      zIndex: 200,
      userSelect: 'none',
    }}>
      {/* Title bar */}
      <div
        onMouseDown={onMouseDown}
        style={{
          backgroundColor: 'var(--teal-deep)',
          borderTop: '2px solid var(--teal-bright)',
          borderLeft: '2px solid var(--teal-bright)',
          borderRight: '2px solid var(--teal-bright)',
          padding: '4px 10px',
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
          letterSpacing: '0.08em',
        }}>
          ABOUT
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--yellow)',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          X
        </button>
      </div>

      {/* Body */}
      <div style={{
        backgroundColor: 'var(--black)',
        border: '2px solid var(--teal-bright)',
        padding: '20px',
      }}>
        <p style={{
          color: 'var(--teal-bright)',
          fontFamily: 'var(--font-mono)',
          fontSize: '15px',
          lineHeight: '1.8',
          marginBottom: '16px',
        }}>
          IDEAL is a speculative design project exploring how algorithmic optimization erodes personal agency.
        </p>
        <p style={{
          color: 'rgba(0,255,224,0.5)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: '1.8',
        }}>
          Created by Jenica Liang · 2026<br />
          Built with React + Vite<br />
          All data is fictional.
        </p>
      </div>
    </div>
  )
}