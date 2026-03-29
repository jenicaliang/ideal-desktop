const HABITS = [
    {
      name: 'EXERCISE',
      color: 'var(--yellow)',
      days: [1,1,0,1,1,0,0,1,1,1,0,1,0,0,1,1,0,1,1,0,0,0,1,1,0,1,0,1],
    },
    {
      name: 'JOURNALING',
      color: 'var(--purple)',
      days: [1,1,1,1,0,0,1,1,1,0,0,0,1,1,1,1,1,0,0,1,1,0,0,0,0,1,0,0],
    },
    {
      name: '7HRS SLEEP',
      color: 'var(--magenta)',
      days: [0,1,1,0,1,0,0,0,0,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0],
    },
  ]
  
  const getCurrentStreak = (days) => {
    let streak = 0
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i] === 1) streak++
      else break
    }
    return streak
  }
  
  const getLongestStreak = (days) => {
    let longest = 0
    let current = 0
    for (const d of days) {
      if (d === 1) {
        current++
        longest = Math.max(longest, current)
      } else {
        current = 0
      }
    }
    return longest
  }
  
  export default function HabitTracker({ x = 900, y = 400 }) {
    return (
      <div style={{
        position: 'absolute',
        left: x,
        top: y,
        width: '20vw',
        height: '328px',
        backgroundColor: 'var(--black)',
        borderRight: '3px solid var(--teal-deep)',
        padding: '10px',
        paddingTop: '10px',
        zIndex: 20,
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
  
        {HABITS.map((habit) => {
          const streak = getCurrentStreak(habit.days)
          const longest = getLongestStreak(habit.days)
  
          return (
            <div key={habit.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
                <span style={{
                  color: habit.color,
                  fontFamily: 'Arial Narrow, Arial, sans-serif',
                  fontSize: '20px',
                  letterSpacing: '0.1em',
                }}>
                  {habit.name}
                </span>
                <span style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                }}>
                  {streak > 0 ? `${streak} day streak` : '0'} · best {longest}
                </span>
              </div>
  
              {/* Grid of squares */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '3px',
              }}>
                {habit.days.map((filled, i) => (
                  <div
                    key={i}
                    style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: filled
                        ? habit.color
                        : 'rgba(255,255,255,0.08)',
                      opacity: filled ? (i === habit.days.length - 1 ? 1 : 0.7) : 1,
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }