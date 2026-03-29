import { useState } from 'react'

const MOODS = [':)', ':(', '>:(', ":'("]

const RESPONSES = {
  ':)': "glad you're feeling good! memory updated.",
  ':(': "sorry to hear that. hope you feel better soon! memory updated.",
  '>:(': "sorry to hear that. hope you feel better soon! memory updated.",
  ":'(": "sorry to hear that. hope you feel better soon! memory updated.",
}

export default function MoodSelector({ x = 1300, y = 147 }) {
  const [response, setResponse] = useState(null)
  const [askingSure, setAskingSure] = useState(false)

  const handleMood = (mood) => {
    setAskingSure(false)
    setResponse(RESPONSES[mood])
    setTimeout(() => setResponse(null), 4000)
  }

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: '280px',
      zIndex: 20,
      userSelect: 'none',
      border: 'none',
    }}>
      {/* Main black body */}
      <div style={{
        backgroundColor: 'var(--black)',
        padding: '16px 12px 20px',
        borderLeft: '2px solid var(--teal-deep)',
        borderRight: '2px solid var(--teal-deep)',
        borderTop: '2px solid var(--teal-deep)',
      }}>
        <div style={{
          color: 'var(--magenta)',
          fontFamily: 'Arial Narrow, Arial, sans-serif',
          fontSize: '22px',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          HOW ARE WE FEELING???
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => handleMood(mood)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--magenta)',
                fontFamily: 'var(--font-mono)',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom teal section */}
      <div style={{
        backgroundColor: 'var(--teal-deep)',
        padding: '8px 12px',
        borderLeft: '2px solid var(--teal-deep)',
        borderRight: '2px solid var(--teal-deep)',
        borderBottom: '2px solid var(--teal-deep)',
        minHeight: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        {response ? (
          <div style={{
            color: 'var(--green)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
          }}>
            {response}
          </div>
        ) : askingSure ? (
          <div style={{
            color: 'var(--green)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
          }}>
            are you sure?
          </div>
        ) : (
          <div
            onClick={() => setAskingSure(true)}
            style={{
              color: 'var(--green)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            I'm feeling something else
          </div>
        )}
      </div>
    </div>
  )
}