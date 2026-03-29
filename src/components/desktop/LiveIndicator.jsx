export default function LiveIndicator() {
    return (
      <div style={{
        position: 'absolute',
        top: '145px',
        left: '320px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderBottom: '3px solid var(--green)',
        padding: '5px 10px',
        userSelect: 'none',
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: 'var(--green)',
          animation: 'blink 1.2s ease-in-out infinite',
        }} />
        <span style={{
          color: 'var(--green)',
          fontFamily: 'Arial Narrow, Arial, sans-serif',
          fontSize: '40px',
          letterSpacing: '0.08em',
        }}>
          LIVE
        </span>
      </div>
    )
  }