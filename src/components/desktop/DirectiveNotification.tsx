import { useState, useEffect, useRef } from 'react'
import React from 'react'

const DIRECTIVE_PROMPT = `You are IDEAL's directive engine. Generate a single, specific, actionable directive for a user based on their goal. 

Rules:
- One sentence only. Maximum 12 words.
- Concrete and time-specific ("this afternoon", "tonight", "tomorrow morning", "in the next 30 minutes")
- No hedging, no explanation, no preamble
- IDEAL voice: authoritative, clinical, precise
- Action verb first
- Never restate the goal itself

Examples:
Goal: get a promotion → "Schedule a performance review conversation with your manager this week."
Goal: lose weight → "Complete a 40-minute cardio session before 18:00 today."
Goal: learn to code → "Complete two JavaScript exercises tonight before sleep."

Respond with ONLY the directive sentence. Nothing else.`

function generatePing() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Main ping — slightly high
    const o1 = ctx.createOscillator()
    const g1 = ctx.createGain()
    o1.connect(g1); g1.connect(ctx.destination)
    o1.frequency.setValueAtTime(880, ctx.currentTime)
    o1.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15)
    g1.gain.setValueAtTime(0, ctx.currentTime)
    g1.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.01)
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    o1.start(ctx.currentTime); o1.stop(ctx.currentTime + 0.5)

    // Dissonant overtone — slightly detuned, gives the jarring quality
    const o2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    o2.connect(g2); g2.connect(ctx.destination)
    o2.frequency.setValueAtTime(934, ctx.currentTime) // detuned from 880
    g2.gain.setValueAtTime(0, ctx.currentTime)
    g2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01)
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    o2.start(ctx.currentTime); o2.stop(ctx.currentTime + 0.25)
  } catch {}
}

async function fetchDirective(apiKey?: string): Promise<string> {
  const goal = localStorage.getItem('ideal_scored_goal')
  if (!goal) return "Your first directive is ready. Open IDEAL to begin."

  const key = apiKey || (import.meta as any).env?.VITE_ANTHROPIC_KEY || ""
  if (!key) return "Begin your first goal-directed action block now."

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 60,
      system: DIRECTIVE_PROMPT,
      messages: [{ role: "user", content: `Goal: "${goal}"` }],
    }),
  })
  const data = await res.json()
  const text = (data.content ?? []).map((b: any) => b.text ?? "").join("").trim()
  return text || "Begin your first goal-directed action block now."
}

export default function DirectiveNotification({ onDismiss, apiKey }: {
  onDismiss: () => void
  apiKey?: string
}) {
  const [visible, setVisible] = useState(false)
  const [directive, setDirective] = useState<string | null>(null)
  const hasFired = useRef(false)

  useEffect(() => {
    fetchDirective(apiKey)
      .then(d => {
        setDirective(d)
        // Small delay after directive is ready before showing
        setTimeout(() => {
          setVisible(true)
          if (!hasFired.current) {
            hasFired.current = true
            generatePing()
          }
        }, 400)
      })
      .catch(() => {
        setDirective("Begin your first goal-directed action block now.")
        setTimeout(() => {
          setVisible(true)
          if (!hasFired.current) {
            hasFired.current = true
            generatePing()
          }
        }, 400)
      })
  }, [])

  function handleClick() {
    setVisible(false)
    setTimeout(onDismiss, 500)
  }

  if (!directive) return null

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute',
        bottom: 'clamp(52px, 6vh, 80px)',
        right: 'clamp(12px, 1.5vw, 24px)',
        width: 'clamp(260px, 22vw, 340px)',
        zIndex: 8000,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        transition: 'opacity 0.35s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{
        background: '#f5f3ef',
        border: '1px solid #1e1e1e',
        padding: '12px 14px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <span style={{
            fontFamily: "'Reddit Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#b04a2f',
          }}>
            IDEAL
          </span>
          <span style={{
            fontFamily: "'Reddit Mono', monospace",
            fontSize: 10,
            color: '#9a9690',
            letterSpacing: '0.06em',
          }}>
            Now
          </span>
        </div>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 300,
          color: '#1e1e1e',
          lineHeight: 1.5,
          margin: '0 0 10px 0',
        }}>
          {directive}
        </p>

        <div style={{
          fontFamily: "'Reddit Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#9a9690',
          opacity: 0.6,
        }}>
          Click to dismiss
        </div>
      </div>
      <div style={{ height: 2, background: '#1e1e1e' }} />
    </div>
  )
}