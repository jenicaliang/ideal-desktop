export default function DateDisplay() {
    const now = new Date()
    const date = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    }).toUpperCase()
  
    return (
      <div style={{
        position: 'absolute',
        left: 0,
        width: 'auto',
        backgroundColor: 'var(--teal-deep)',
        padding: '30px 30px',
        zIndex: 10,
      }}>
        <div style={{
          color: 'var(--teal-bright)',
          fontFamily: 'Arial Narrow, Arial, sans-serif',
          fontSize: '50px',
          lineHeight: '0.8',
        }}>
          {date}
        </div>
      </div>
    )
  }