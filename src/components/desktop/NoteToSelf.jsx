export default function NoteToSelf({ x = 500, y = 400 }) {
    return (
      <div style={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: 15,
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'flex-start',
      }}>
        <span style={{
          color: 'var(--green)',
          fontFamily: 'var(--font-mono)',
          fontSize: '20px',
          letterSpacing: '0.05em',
          textDecoration: 'underline',
          backgroundColor: 'var(--black)',
          padding: '1px 4px',
        }}>
          note to self:
        </span>
        <span style={{
          color: 'var(--green)',
          fontFamily: 'var(--font-mono)',
          fontSize: '20px',
          letterSpacing: '0.05em',
          textDecoration: 'underline',
          backgroundColor: 'var(--black)',
          padding: '1px 4px',
        }}>
          try clicking around!
        </span>
      </div>
    )
  }