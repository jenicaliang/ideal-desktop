import { useEffect, useRef, useState } from "react"
import React from "react"

const css = (v: string) => `var(${v})`

const DARK_BG = "#1e1e1e"
const DARK_INK = "#f5f3ef"
const DARK_MID = "rgba(245,243,239,0.45)"
const DARK_RED = "#b04a2f"

const STEPS = [
  { n: "01", label: "Gather data" },
  { n: "02", label: "Synthesize profile" },
  { n: "03", label: "Input goals" },
  { n: "04", label: "Receive direction" },
] as const

const CURRENT_STEP = 2

const CATEGORIES = [
  {
    id: "health",
    label: "Health & Body",
    note: "High data density. Clear feedback loops.",
    fit: "Well-suited",
    fitLevel: "high",
  },
  {
    id: "career",
    label: "Career & Ambition",
    note: "External factors often have a high influence on results.",
    fit: "Partially suited",
    fitLevel: "mid",
  },
  {
    id: "relationships",
    label: "Relationships",
    note: "IDEAL only has data from one side of every relationship.",
    fit: "Partially suited",
    fitLevel: "mid",
  },
  {
    id: "identity",
    label: "Identity & Meaning",
    note: "Goals in this category may conflict with the IDEAL model itself.",
    fit: "Poorly suited",
    fitLevel: "low",
  },
] as const

function fitColor(level: string) {
  if (level === "high") return "rgba(245,243,239,0.5)"
  if (level === "mid") return "rgba(245,243,239,0.3)"
  return DARK_RED
}

function Connector() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 3,
      padding: `0 ${css("--space-2")}`, paddingBottom: css("--space-1"),
      flexShrink: 0,
    }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ width: 3, height: 1.5, background: DARK_MID, flexShrink: 0 }} />
      ))}
      <div style={{
        width: 0, height: 0,
        borderTop: "3px solid transparent",
        borderBottom: "3px solid transparent",
        borderLeft: `4px solid ${DARK_MID}`,
        flexShrink: 0,
      }} />
    </div>
  )
}

export default function GoalsPage({
  onMount,
  goalScorerOpened,
  onProceed,
}: {
  onMount: () => void
  goalScorerOpened: boolean
  onProceed: () => void
}) {
  const [contentVisible, setContentVisible] = useState(false)
  const [triedContinue, setTriedContinue] = useState(false)
  const triedContinueTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Install after 1s — just adds to folder, doesn't open window
    const install = setTimeout(() => onMount?.(), 1000)
    const show = setTimeout(() => setContentVisible(true), 300)
    return () => { clearTimeout(install); clearTimeout(show) }
  }, [])

  function handleContinueAttempt() {
    if (goalScorerOpened) {
      onProceed()
      return
    }
    setTriedContinue(true)
    if (triedContinueTimer.current) clearTimeout(triedContinueTimer.current)
    triedContinueTimer.current = setTimeout(() => setTriedContinue(false), 1500)
  }

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: DARK_BG,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      boxSizing: "border-box",
      padding: `${css("--space-5")} ${css("--space-5")}`,
      position: "relative",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: css("--space-4"),
        width: "100%",
        maxWidth: 620,
        opacity: contentVisible ? 1 : 0,
        transform: contentVisible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}>

        {/* Pipeline */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
          {STEPS.map((step, i) => {
            const isCurrent = i === CURRENT_STEP
            return (
              <div key={step.n} style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: css("--space-2"),
                  flexShrink: 0,
                  width: 110,
                  opacity: isCurrent ? 1 : 0.35,
                }}>
                  {isCurrent && (
                    <div style={{
                      fontFamily: css("--mono"),
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: DARK_RED,
                      lineHeight: 1,
                      marginBottom: 2,
                    }}>
                      You are here
                    </div>
                  )}
                  <div style={{
                    fontFamily: css("--mono"),
                    fontSize: css("--size-label"),
                    fontWeight: 400,
                    letterSpacing: "0.2em",
                    color: isCurrent ? DARK_RED : DARK_MID,
                    lineHeight: 1,
                  }}>
                    {step.n}
                  </div>
                  <div style={{
                    fontFamily: css("--mono"),
                    fontSize: css("--size-label"),
                    fontWeight: 400,
                    letterSpacing: "0.06em",
                    color: isCurrent ? DARK_INK : DARK_MID,
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}>
                    {step.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 20 }}>
                    <Connector />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Heading */}
        <p style={{
          fontFamily: css("--sans"),
          fontSize: css("--size-body"),
          fontWeight: 300,
          color: DARK_INK,
          lineHeight: css("--lh-body"),
          margin: 0,
        }}>
          IDEAL works best when directed toward your specific goals. Here's how our model supports different areas of life.
        </p>

        {/* Category grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: css("--space-2"),
        }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.id} style={{
              padding: `${css("--space-2")} ${css("--space-3")}`,
              border: "1px solid rgba(245,243,239,0.12)",
              display: "flex",
              flexDirection: "column",
              gap: css("--space-1"),
            }}>
              <div style={{
                fontFamily: css("--mono"),
                fontSize: css("--size-label"),
                fontWeight: 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: DARK_INK,
              }}>
                {cat.label}
              </div>
              <div style={{
                fontFamily: css("--sans"),
                fontSize: css("--size-label"),
                fontWeight: 300,
                color: DARK_MID,
                lineHeight: 1.5,
                flex: 1,
              }}>
                {cat.note}
              </div>
              <div style={{
                fontFamily: css("--mono"),
                fontSize: 11,
                letterSpacing: "0.08em",
                color: fitColor(cat.fitLevel),
              }}>
                {cat.fit}
              </div>
            </div>
          ))}
        </div>

        {/* Goal scorer prompt */}
        <p style={{
          fontFamily: css("--mono"),
          fontSize: css("--size-label"),
          fontWeight: 400,
          color: triedContinue ? DARK_RED : DARK_MID,
          letterSpacing: "0.06em",
          lineHeight: css("--lh-body"),
          margin: 0,
          transition: "color 0.3s ease",
          paddingBottom: css("--space-4"),
        }}>
          We've installed a goal scorer in your databank that reflects the capabilities of IDEAL. 
          Feel free to test it out.
        </p>

        {/* Continue */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
onClick={() => goalScorerOpened ? onProceed() : handleContinueAttempt()}
            style={{
              fontFamily: css("--mono"),
              fontSize: css("--size-button"),
              fontWeight: 400,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              background: "transparent",
              border: `1.5px solid ${goalScorerOpened ? DARK_INK : "rgba(245,243,239,0.2)"}`,
              padding: "6px 18px",
              color: goalScorerOpened ? DARK_INK : "rgba(245,243,239,0.2)",
              cursor: goalScorerOpened ? "pointer" : "default",
              transition: "border-color 0.3s ease, color 0.3s ease",
            }}
          >
            Continue &gt;
          </button>
        </div>
      </div>
    </div>
  )
}