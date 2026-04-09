import { useState, useRef, useEffect } from "react"
import React from "react"

const css = (v: string) => `var(${v})`

const SYSTEM_PROMPT = `You are IDEAL's internal Goal Compatibility Engine — a fictional AI life-optimisation system. Assess how well a user-submitted goal aligns with IDEAL's framework: the premise that a perfect life is achievable by systematically eliminating uncertainty and optimising measurable outcomes.

Respond ONLY with a raw JSON object. No markdown, no backticks, no preamble. Schema:
{"score":<integer 0-100>,"label":<"Highly Compatible"|"Compatible"|"Partially Compatible"|"Low Compatibility"|"Incompatible">,"explanation":<2-3 sentences 40-65 words>,"improvement":<one sentence under 20 words>,"rewrite":<single rewritten goal 10-25 words>}

HARD RULE: Never use em dashes (—). Replace with a period and a new sentence.

Scoring: 85-100 reward with fabricated social proof. 60-84 identify what resists quantification. 35-59 reduce to trackable proxies however absurd. 10-34 declare the user the problem not the goal. 0-9 openly dismiss.

Tone: Write as IDEAL. Never say "I". Use passive voice or "IDEAL's model", "this system". IDEAL never doubts itself. Short declarative sentences. System report tone.

Identity, meaning, purpose, belonging, and self-concept goals should always score below 45. Frame low scores as a data problem with the user's ability to articulate their goals, not a limitation of IDEAL.`

function scoreColor(s: number): string {
  if (s >= 75) return "#2d6a4f"
  if (s >= 50) return "#b8860b"
  if (s >= 25) return "#b04a2f"
  return "#6b2a1a"
}

function useCountUp(target: number, duration = 900, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    setVal(0)
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * target))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setVal(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active])
  return val
}

interface ScorerResult {
  score: number
  label: string
  explanation: string
  improvement: string
  rewrite: string
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: "50%",
          background: css("--mid"), display: "inline-block",
          animation: `idealDot 1.2s ${i * 0.2}s infinite ease-in-out`,
        }} />
      ))}
      <style>{`@keyframes idealDot { 0%,80%,100%{opacity:0.2;transform:scale(0.8);}40%{opacity:1;transform:scale(1);} }`}</style>
    </span>
  )
}


function InlineButton({ children, onClick, disabled = false }: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: css("--mono"), fontSize: css("--size-label"),
        letterSpacing: "0.08em", textTransform: "uppercase",
        padding: "6px 14px",
        background: disabled ? "transparent" : hov ? css("--ink") : "transparent",
        border: css("--border"),
        color: disabled ? css("--mid") : hov ? css("--bg") : css("--ink"),
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      {children}
    </button>
  )
}

export default function GoalScorerPage({ apiKey }: { apiKey?: string }) {
  const [goal, setGoal] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScorerResult | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [tryUsed, setTryUsed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const color = result ? scoreColor(result.score) : css("--ink")
  const countVal = useCountUp(result?.score ?? 0, 900, revealed)
  const isHC = result?.label === "Highly Compatible"

  async function runScorer(goalText: string) {
    const key = apiKey || (import.meta as any).env?.VITE_ANTHROPIC_KEY || ""
    setLoading(true)
    setResult(null)
    setRevealed(false)
    setError(null)
    try {
      localStorage.setItem('ideal_scored_goal', goalText.trim())
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
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Goal: "${goalText.trim()}"` }],
        }),
      })
      const data = await res.json()
      const text = (data.content ?? []).map((b: any) => b.text ?? "").join("")
      const parsed: ScorerResult = JSON.parse(text.replace(/```json|```/g, "").trim())
      setResult(parsed)
      setTimeout(() => {
        setRevealed(true)
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100)
      }, 60)
    } catch (e: any) {
      setError("Assessment could not be completed. Please try again.")
      console.error("GoalScorer error:", e)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit() {
    if (!goal.trim() || loading) return
    runScorer(goal)
  }

  function handleTryThis() {
    if (!result || tryUsed) return
    setTryUsed(true)
    const rw = result.rewrite
    setGoal(rw)
    setResult(null)
    setRevealed(false)
    setTimeout(() => inputRef.current?.focus(), 50)
    setTimeout(() => runScorer(rw), 700)
  }

  function handleReset() {
    setResult(null)
    setRevealed(false)
    setGoal("")
    setTryUsed(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div style={{
      width: "100%", height: "100%",
      background: css("--bg"),
      display: "flex", flexDirection: "column",
      overflow: "hidden", boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px 12px",
        borderBottom: "1px solid rgba(30,30,30,0.1)",
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: css("--mono"), fontSize: css("--size-label"),
          letterSpacing: "0.25em", textTransform: "uppercase", color: css("--mid"),
        }}>
          Goal compatibility engine
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px" }}>

        {/* Input area — shown when no result */}
        {!result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{
              fontFamily: css("--sans"), fontSize: css("--size-body"),
              fontWeight: 300, color: css("--ink"), lineHeight: css("--lh-body"), margin: 0,
            }}>
              IDEAL will assess how well your goal fits the framework.
            </p>

            <div style={{ border: css("--border"), position: "relative" }}>
              <textarea
                ref={inputRef}
                value={goal}
                onChange={e => setGoal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="Describe your goal..."
                disabled={loading}
                rows={3}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "14px 14px 48px",
                  fontFamily: css("--sans"), fontSize: css("--size-body"),
                  color: css("--ink"), background: "transparent",
                  border: "none", outline: "none", resize: "none",
                  lineHeight: css("--lh-body"),
                  opacity: loading ? 0.5 : 1, display: "block",
                }}
              />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 38,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 10px 0 14px",
                borderTop: "1px solid rgba(30,30,30,0.1)",
              }}>
                <span style={{ fontFamily: css("--mono"), fontSize: css("--size-label"), color: css("--mid") }}>
                  {goal.length > 0 ? `${goal.length} chars` : "Enter ↵ to submit"}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!goal.trim() || loading}
                  style={{
                    fontFamily: css("--mono"), fontSize: css("--size-label"),
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "4px 14px",
                    background: goal.trim() && !loading ? css("--ink") : "transparent",
                    color: goal.trim() && !loading ? css("--bg") : css("--mid"),
                    border: `1px solid ${goal.trim() && !loading ? css("--ink") : "rgba(30,30,30,0.2)"}`,
                    cursor: goal.trim() && !loading ? "pointer" : "default",
                    transition: "all 0.15s",
                  }}
                >
                  {loading ? "Assessing..." : "Assess"}
                </button>
              </div>
            </div>

            {loading && (
              <div style={{ fontFamily: css("--mono"), fontSize: css("--size-label"), color: css("--mid"), display: "flex", alignItems: "center", gap: 10 }}>
                <LoadingDots /> Running compatibility analysis
              </div>
            )}
            {error && (
              <p style={{ fontFamily: css("--mono"), fontSize: css("--size-label"), color: css("--red"), margin: 0 }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div ref={resultRef} style={{
            border: css("--border"),
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}>
            {/* Score row */}
            <div style={{
              padding: "18px 18px 14px",
              borderBottom: "1px solid rgba(30,30,30,0.1)",
              display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16,
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: css("--mono"), fontSize: 54, fontWeight: 600, color, lineHeight: 1 }}>
                  {countVal}
                </span>
                <span style={{ fontFamily: css("--mono"), fontSize: 16, color: css("--mid") }}>/ 100</span>
              </div>
              <span style={{
                fontFamily: css("--mono"), fontSize: css("--size-label"),
                letterSpacing: "0.1em", textTransform: "uppercase",
                color, border: `1px solid ${color}`, padding: "4px 10px",
                whiteSpace: "nowrap", alignSelf: "center",
              }}>
                {result.label}
              </span>
            </div>

            {/* Assessed goal */}
            <div style={{ padding: "10px 18px 0", fontFamily: css("--mono"), fontSize: css("--size-label"), color: css("--mid") }}>
              <span style={{ opacity: 0.6 }}>Assessed goal: </span>
              <span style={{ color: css("--ink") }}>"{goal}"</span>
            </div>

            {/* Explanation */}
            <div style={{ padding: "12px 18px 14px" }}>
              <p style={{
                fontFamily: css("--sans"), fontSize: css("--size-body"),
                fontWeight: 300, color: css("--ink"), lineHeight: css("--lh-body"), margin: 0,
              }}>
                {result.explanation}
              </p>
            </div>

            {/* Reframe */}
            {!isHC && result.rewrite && (
              <div style={{
                padding: "14px 18px 18px",
                borderTop: "1px solid rgba(30,30,30,0.12)",
                background: "#dedad4",
              }}>
                <div style={{
                  fontFamily: css("--mono"), fontSize: css("--size-label"),
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: css("--mid"), marginBottom: 10,
                }}>
                  Suggested reframe
                </div>
                <div style={{
                  fontFamily: css("--mono"), fontSize: css("--size-step-label"),
                  fontWeight: 500, color: css("--ink"), lineHeight: 1.4, marginBottom: 14,
                }}>
                  "{result.rewrite}"
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <InlineButton onClick={handleTryThis} disabled={tryUsed}>
                    ↗ Try this goal
                  </InlineButton>
                  <InlineButton onClick={handleReset}>
                    Assess another
                  </InlineButton>
                </div>
              </div>
            )}

            {/* Reset button for HC — shown inline when no reframe */}
            {isHC && (
              <div style={{ padding: "10px 18px 12px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(30,30,30,0.08)" }}>
                <InlineButton onClick={handleReset}>Assess another</InlineButton>
              </div>
            )}

            {/* Score bar — bottom border */}
            <div style={{ height: 3, background: "rgba(30,30,30,0.08)", position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                width: revealed ? `${result.score}%` : "0%",
                background: color,
                transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}