const LOG_ENTRIES = [
    '5:06PM dogs barking',
    '5:07PM delivery made',
    '5:12PM motion detected',
    '5:19PM no activity',
    '5:34PM motion detected',
  ]
  
  export default function CameraLog() {
    return (
      <div style={{
        position: 'absolute',
        bottom: '140px',
        right: 0,
        width: '220px',
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderBottom: '2px solid var(--green)',
        borderTop: '1px solid var(--grey)',
        padding: '10px 12px',
        zIndex: 10,
      }}>
        <div style={{
          color: 'var(--grey-light)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          marginBottom: '8px',
        }}>
          currently showing: Living Room
        </div>
        <div style={{
          color: 'var(--grey)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          marginBottom: '6px',
          letterSpacing: '0.03em',
        }}>
          recent activity:
        </div>
        {LOG_ENTRIES.map((entry, i) => (
          <div key={i} style={{
            color: 'var(--grey-light)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            marginBottom: '3px',
          }}>
            {entry}
          </div>
        ))}
      </div>
    )
  }