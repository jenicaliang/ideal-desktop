import { useEffect, useRef, useState } from "react"
import React from "react"

function css(v: string) { return `var(${v})` }

const DARK_BG = "#1e1e1e"
const DARK_INK = "#f5f3ef"
const DARK_MID = "rgba(245,243,239,0.45)"
const DARK_RED = "#b04a2f"

function PixelButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: css("--mono"), fontSize: css("--size-button"),
        fontWeight: 400, letterSpacing: "0.25em", textTransform: "uppercase",
        background: hov ? DARK_INK : "transparent",
        border: `1.5px solid ${DARK_INK}`,
        borderRadius: css("--radius"), padding: "9px 20px",
        color: hov ? DARK_BG : DARK_INK,
        cursor: "pointer", transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      {children}
    </button>
  )
}

const DIGIT_W = 5, DIGIT_H = 7
const DIGITS: Record<string, number[]> = {
  "1": [0,0,1,0,0, 0,1,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,1,1,0],
  "2": [0,1,1,1,0, 1,0,0,0,1, 0,0,0,0,1, 0,0,1,1,0, 0,1,0,0,0, 1,0,0,0,0, 1,1,1,1,1],
  "3": [1,1,1,1,0, 0,0,0,0,1, 0,0,0,0,1, 0,1,1,1,0, 0,0,0,0,1, 0,0,0,0,1, 1,1,1,1,0],
  "4": [0,0,0,1,0, 0,0,1,1,0, 0,1,0,1,0, 1,0,0,1,0, 1,1,1,1,1, 0,0,0,1,0, 0,0,0,1,0],
}

function PixelDigit({ digit, pixelSize, color, animate, delay }: {
  digit: string; pixelSize: number; color: string; animate: boolean; delay: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const filledRef = useRef<Set<number>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const startedRef = useRef(false)
  const W = DIGIT_W * pixelSize, H = DIGIT_H * pixelSize
  const bitmap = DIGITS[digit] || DIGITS["1"]
  const onPixels = bitmap.map((v, i) => v ? i : -1).filter(i => i >= 0)

  function draw(filled: Set<number>) {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, W * dpr, H * dpr)
    ctx.save(); ctx.scale(dpr, dpr); ctx.fillStyle = color
    onPixels.forEach(idx => {
      if (!filled.has(idx)) return
      ctx.fillRect((idx % DIGIT_W) * pixelSize, Math.floor(idx / DIGIT_W) * pixelSize, pixelSize - 2, pixelSize - 2)
    })
    ctx.restore()
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
    return a
  }

  function startFill() {
    filledRef.current = new Set()
    const order = shuffle(onPixels); let i = 0
    const stepDelay = 600 / order.length
    function step() {
      if (i < order.length) { filledRef.current.add(order[i]); i++; draw(filledRef.current); timerRef.current = setTimeout(step, stepDelay) }
    }
    step()
  }

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
    draw(new Set())
    if (animate && !startedRef.current) { startedRef.current = true; timerRef.current = setTimeout(startFill, delay) }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [color, animate, delay])

  return <canvas ref={canvasRef} style={{ display: "block" }} />
}

const STEPS = [
  { n: "1", label: "Gather data" },
  { n: "2", label: "Synthesize profile" },
  { n: "3", label: "Input goals" },
  { n: "4", label: "Receive direction" },
] as const

function Connector({ visible }: { visible: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      opacity: visible ? 1 : 0, transition: "opacity 0.5s ease",
      flexShrink: 0, gap: 3,
      padding: `0 ${css("--space-2")}`, paddingBottom: css("--space-1"),
    }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ width: 3, height: 1.5, background: DARK_MID, flexShrink: 0 }} />
      ))}
      <div style={{
        width: 0, height: 0,
        borderTop: "3px solid transparent", borderBottom: "3px solid transparent",
        borderLeft: `4px solid ${DARK_MID}`, flexShrink: 0,
      }} />
    </div>
  )
}

export default function PitchPage({ onDownloadCatalog, onThemeChange, onProceed }: {
  onDownloadCatalog: () => void
  onThemeChange: () => void
  onProceed: () => void
}) {
  const [splashPhase, setSplashPhase] = useState<'light' | 'dark' | 'done'>('light')
  const [presentingText, setPresentingText] = useState("")
  const [idealText, setIdealText] = useState("")
  const [splashDone, setSplashDone] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const [btnVisible, setBtnVisible] = useState(false)
  const [catalogDownloaded, setCatalogDownloaded] = useState(false)

  useEffect(() => {
    const PRES = "Presenting..."
    const IDEAL = "IDEAL"
    let i = 0
    let t2: ReturnType<typeof setInterval> | undefined

    const t1 = setInterval(() => {
      i++
      setPresentingText(PRES.slice(0, i))
      if (i >= PRES.length) {
        clearInterval(t1)
        setTimeout(() => {
          let j = 0
          t2 = setInterval(() => {
            j++
            setIdealText(IDEAL.slice(0, j))
            if (j >= IDEAL.length) {
              clearInterval(t2)
              setSplashDone(true)
              setTimeout(() => {
                setSplashPhase('dark')
                onThemeChange()
                setTimeout(() => setSplashPhase('done'), 1200)
              }, 800)
            }
          }, 600)
        }, 300)
      }
    }, 150)

    return () => { clearInterval(t1); if (t2) clearInterval(t2) }
  }, [])

  useEffect(() => {
    if (splashPhase !== 'done') return
    const stepTimers: ReturnType<typeof setTimeout>[] = []
    let tText: ReturnType<typeof setTimeout> | undefined
    let tBtn: ReturnType<typeof setTimeout> | undefined

    tText = setTimeout(() => setTextVisible(true), 300)
    STEPS.forEach((_, idx) => {
      const timer = setTimeout(() => setVisibleSteps(prev => [...prev, idx]), 500 + idx * 600)
      stepTimers.push(timer)
    })
    tBtn = setTimeout(() => setBtnVisible(true), 500 + STEPS.length * 600 + 400)

    return () => {
      if (tText) clearTimeout(tText)
      if (tBtn) clearTimeout(tBtn)
      stepTimers.forEach(clearTimeout)
    }
  }, [splashPhase])

  // ── SPLASH ──
  if (splashPhase !== 'done') {
    const isLight = splashPhase === 'light'
    const bg = isLight ? css("--bg") : DARK_BG
    const inkColor = isLight ? css("--ink") : DARK_INK
    const redColor = isLight ? css("--ink") : DARK_RED

    return (
      <div style={{
        width: "100%", height: "100%", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.6s ease", overflow: "hidden",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <p style={{
            fontFamily: css("--mono"), fontSize: css("--size-label"), fontWeight: 400,
            letterSpacing: "0.25em", textTransform: "uppercase", color: inkColor,
            margin: "0 0 4px 0", lineHeight: 1, transition: "color 0.6s ease", minHeight: "1em",
          }}>
            {presentingText}
            {!splashDone && idealText.length === 0 && presentingText.length > 0 && (
              <span style={{
                display: "inline-block", width: "0.05em", height: "0.85em", background: inkColor,
                marginLeft: 2, verticalAlign: "middle", animation: "blink 0.6s step-end infinite",
                transition: "background 0.6s ease",
              }} />
            )}
          </p>
          <h1 style={{
            fontFamily: css("--mono"), fontSize: "clamp(48px, 7vw, 96px)", fontWeight: 400,
            color: redColor, letterSpacing: "-0.02em", lineHeight: 1, margin: 0,
            minHeight: "1.1em", transition: "color 0.6s ease",
          }}>
            {idealText}
            {!splashDone && idealText.length > 0 && (
              <span style={{
                display: "inline-block", width: "0.05em", height: "0.85em", background: redColor,
                marginLeft: 4, verticalAlign: "middle", animation: "blink 0.6s step-end infinite",
                transition: "background 0.6s ease",
              }} />
            )}
          </h1>
        </div>
        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
      </div>
    )
  }

  // ── CONTENT PAGE ──
  return (
    <div style={{
      width: "100%", height: "100%", background: DARK_BG,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      overflow: "hidden", boxSizing: "border-box",
      padding: `${css("--space-7")} ${css("--space-5")}`, position: "relative",
    }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        gap: css("--space-7"), width: "100%", maxWidth: 620,
      }}>

        {/* Body text */}
        <div style={{
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <p style={{
            fontFamily: css("--sans"), fontSize: css("--size-body"), fontWeight: 300,
            color: DARK_INK, lineHeight: css("--lh-body"),
            margin: `0 0 ${css("--space-2")} 0`,
            display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: "0.3em",
          }}>
            <span style={{
              fontFamily: css("--mono"), fontSize: css("--size-headline-red"), fontWeight: 400,
              color: DARK_RED, letterSpacing: "-0.02em", lineHeight: 1,
            }}>
              IDEAL
            </span>
            <span>is a service that uses your unique datafied identity to determine the most statistically likely path to achieving your goals.</span>
          </p>
          <p style={{
            fontFamily: css("--mono"), fontSize: css("--size-label"), fontWeight: 400,
            letterSpacing: "0.25em", textTransform: "uppercase", color: DARK_MID, margin: 0,
          }}>
            Here's how it works.
          </p>
        </div>

        {/* Steps */}
        <div style={{ width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
          {STEPS.map((step, i) => {
            const isVisible = visibleSteps.includes(i)
            const nextVisible = visibleSteps.includes(i + 1)
            return (
              <div key={step.n} style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: css("--space-3"), flexShrink: 0,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                  width: 120,
                }}>
                  <PixelDigit digit={step.n} pixelSize={9} color={DARK_INK} animate={isVisible} delay={80} />
                  <p style={{
                    fontFamily: css("--mono"), fontSize: css("--size-step-label"), fontWeight: 400,
                    letterSpacing: "0.08em", color: DARK_INK, textAlign: "center", lineHeight: 1.6, margin: 0,
                  }}>
                    {step.label}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 18 }}>
                    <Connector visible={nextVisible} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Buttons — Download left, Continue right */}
        <div style={{
          opacity: btnVisible ? 1 : 0,
          transform: btnVisible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <PixelButton onClick={() => { onDownloadCatalog(); setCatalogDownloaded(true) }}>
            Download Catalog
          </PixelButton>
          <div style={{
            opacity: catalogDownloaded ? 1 : 0,
            transition: "opacity 0.5s ease 0.3s",
            pointerEvents: catalogDownloaded ? "auto" : "none",
          }}>
            <PixelButton onClick={onProceed}>{"Continue >"}</PixelButton>
          </div>
        </div>

      </div>
      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </div>
  )
}