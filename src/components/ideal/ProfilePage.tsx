import { useEffect, useRef, useState } from "react"
import React from "react"
import PixelButton from "./shared/PixelButton"

// ─── Constants ────────────────────────────────────────────────────────────────

const PAD = 24 // edge margin throughout

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHAINS = [
  {
    id: "sleep",
    label: "Sleep",
    vizLabel: "Sleep stages · 8hr window",
    devices: ["Thinkband", "Biopill"],
    classification: { label: "Late-phase Rester", score: 71 },
    annotation: "Sleep onset delayed 47 min past target window.",
    tooltip:
      "Late-phase resters are more cognitively active at night and slower to engage in the morning. IDEAL schedules high-effort directives in the late window, reducing friction on goals that require sustained focus.",
  },
  {
    id: "output",
    label: "Output",
    vizLabel: "Keystroke cadence · 24hr window",
    devices: ["Thinkband", "Patchwork"],
    classification: { label: "Compressed Focuser", score: 84 },
    annotation: "Peak output concentrated in late evening, low AM engagement.",
    tooltip:
      "Compressed Focusers produce most of their meaningful work in a narrow time window. IDEAL concentrates goal-critical tasks within that window and protects it from low-value interruptions.",
  },
  {
    id: "social",
    label: "Social",
    vizLabel: "Contact frequency · 7 days",
    devices: ["Patchwork", "Sightsync"],
    classification: { label: "Dyadic Connector", score: 63 },
    annotation: "2 high-depth contacts, 3 peripheral. Narrow but stable network.",
    tooltip:
      "Dyadic Connectors maintain a small number of high-quality relationships over a broad network. Accountability structures work best anchored to one or two trusted individuals. IDEAL factors this into its relational directives.",
  },
  {
    id: "self",
    label: "Self",
    vizLabel: "Linguistic pattern · Value weighting",
    devices: ["Biopill", "Sightsync"],
    classification: { label: "Unresolved", score: 41 },
    annotation: "Insufficient signal. Self-concept model below confidence threshold.",
    tooltip:
      "An unresolved classification means current data is insufficient to derive stable identity attributes. IDEAL will continue refining this model through your calibration period before incorporating it into directive generation.",
  },
] as const

// ─── Visualizations ───────────────────────────────────────────────────────────

function SleepViz({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    if (!W || !H) return
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const ink = "#1e1e1e"
    const mid = "#9a9690"
    const red = "#b04a2f"
    const fontSize = 12
    const labelH = fontSize + 8
    const chartH = H - labelH
    ctx.clearRect(0, 0, W, H)

    const stages = [
      { label: "Wake", opacity: 0.05 },
      { label: "Light", opacity: 0.03 },
      { label: "Deep", opacity: 0.08 },
      { label: "REM", opacity: 0.04 },
    ]
    stages.forEach((s, i) => {
      const sh = chartH / stages.length
      ctx.fillStyle = `rgba(30,30,30,${s.opacity})`
      ctx.fillRect(0, i * sh, W, sh)
      ctx.fillStyle = mid
      ctx.font = `400 ${fontSize}px 'Courier New', monospace`
      ctx.textAlign = "left"
      ctx.fillText(s.label, 4, i * sh + sh / 2 + fontSize * 0.35)
    })

    const p = Math.min(progress, 1)
    const strokeInset = 0.75 // half of lineWidth (1.5)
    const drawW = W - strokeInset * 2
    const drawH = chartH - strokeInset * 2

    const hypnogram = [
      { t: 0, stage: 0 },
      { t: 0.08, stage: 0.18 },
      { t: 0.15, stage: 0.52 },
      { t: 0.22, stage: 0.78 },
      { t: 0.28, stage: 0.58 },
      { t: 0.33, stage: 0.82 },
      { t: 0.42, stage: 0.68 },
      { t: 0.48, stage: 0.88 },
      { t: 0.55, stage: 0.58 },
      { t: 0.62, stage: 0.78 },
      { t: 0.7, stage: 0.48 },
      { t: 0.75, stage: 0.68 },
      { t: 0.82, stage: 0.32 },
      { t: 0.88, stage: 0.14 },
      { t: 0.95, stage: 0.04 },
      { t: 1.0, stage: 0 },
    ]

    ctx.beginPath()
    ctx.strokeStyle = ink
    ctx.lineWidth = 1.5

    hypnogram.forEach((pt, i) => {
      const x = strokeInset + pt.t * drawW
      if (x > strokeInset + p * drawW) return
      const y = strokeInset + pt.stage * drawH

      if (i === 0) {
        ctx.moveTo(x, y)
        return
      }

      const prev = hypnogram[i - 1]
      const prevX = strokeInset + prev.t * drawW

      ctx.lineTo(prevX, y)
      ctx.lineTo(x, y)
    })

    ctx.stroke()

    if (p > 0.12) {
      ctx.strokeStyle = red
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      const mx = 0.08 * W
      ctx.beginPath()
      ctx.moveTo(mx, 0)
      ctx.lineTo(mx, chartH)
      ctx.stroke()
      ctx.setLineDash([])
    }

    const hours = ["22:00", "00:00", "03:00", "06:00", "08:00"]
    ctx.fillStyle = mid
    ctx.font = `400 ${fontSize}px 'Courier New', monospace`
    ctx.textAlign = "center"
    hours.forEach((h, i) => {
      const x = (i / (hours.length - 1)) * W
      ctx.textAlign = i === 0 ? "left" : i === hours.length - 1 ? "right" : "center"
      ctx.fillText(h, x, H - 2)
    })
  }, [progress])

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
}

function OutputViz({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intensity = [
    0.04, 0.02, 0.01, 0.0, 0.0, 0.02, 0.08, 0.14, 0.21, 0.27, 0.3, 0.34, 0.29, 0.24, 0.19, 0.17, 0.21, 0.27, 0.39, 0.54, 0.71, 0.87, 0.94, 0.77,
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    if (!W || !H) return
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const ink = "#1e1e1e"
    const red = "#b04a2f"
    const mid = "#9a9690"
    const fontSize = 12
    const labelH = fontSize + 8
    const chartH = H - labelH
    const p = Math.min(progress, 1)
    const visibleCount = Math.floor(p * 24)
    const gap = 3
    const barW = (W - gap * 23) / 24

    ctx.clearRect(0, 0, W, H)

    intensity.forEach((v, h) => {
      const isHigh = v > 0.6
      const visible = h < visibleCount
      const x = h * (barW + gap)
      const bh = Math.max(v * chartH, 2)
      const y = chartH - bh
      ctx.fillStyle = isHigh ? red : ink
      ctx.globalAlpha = visible ? (isHigh ? 0.85 : 0.15 + v * 0.55) : 0.05
      ctx.fillRect(x, y, barW, bh)
    })

    ctx.globalAlpha = 1
    ctx.fillStyle = mid
    ctx.font = `400 ${fontSize}px 'Courier New', monospace`
    ctx.textAlign = "center"

    const labels = [
      { t: 0, l: "00:00" },
      { t: 0.25, l: "06:00" },
      { t: 0.5, l: "12:00" },
      { t: 0.75, l: "18:00" },
      { t: 1, l: "23:00" },
    ]

    labels.forEach(({ t, l }, i) => {
      ctx.textAlign = i === 0 ? "left" : i === labels.length - 1 ? "right" : "center"
      ctx.fillText(l, t * W, H - 2)
    })

    if (p > 0.85) {
      ctx.fillStyle = red
      ctx.globalAlpha = Math.min((p - 0.85) / 0.15, 1)
      ctx.textAlign = "right"
      ctx.fillText("peak 21:00–01:00", W - 4, fontSize + 2)
      ctx.globalAlpha = 1
    }
  }, [progress])

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
}

function SocialViz({ progress }: { progress: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contacts = ["A", "B", "C", "D", "E"]
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  const matrix = [
    [0.9, 0.8, 0.85, 0.7, 0.9, 0.3, 0.2],
    [0.7, 0.9, 0.6, 0.8, 0.75, 0.4, 0.1],
    [0.2, 0.0, 0.3, 0.0, 0.1, 0.0, 0.0],
    [0.0, 0.1, 0.0, 0.2, 0.0, 0.0, 0.0],
    [0.1, 0.0, 0.0, 0.0, 0.15, 0.0, 0.0],
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d")!
    const dpr = window.devicePixelRatio || 1
    const W = container.offsetWidth
    const H = container.offsetHeight
    if (!W || !H) return
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    const ink = "#1e1e1e"
    const mid = "#9a9690"
    const p = Math.min(progress, 1)
    const visibleCols = Math.floor(p * 7)
    const fontSize = 12

    const labelCol = 28
    const labelRow = fontSize + 10
    const gap = 4

    const cellW = Math.floor((W - labelCol - gap * 6) / 7)
    const cellH = Math.floor((H - labelRow - gap * 4) / 5)
    const cell = Math.min(cellW, cellH)

    const gridW = 7 * cell + 6 * gap
    const gridH = 5 * cell + 4 * gap
    const ox = labelCol + (W - labelCol - gridW) / 2
    const oy = labelRow + (H - labelRow - gridH) / 2

    ctx.clearRect(0, 0, W, H)
    ctx.font = `400 ${fontSize}px 'Courier New', monospace`

    days.forEach((d, j) => {
      ctx.fillStyle = mid
      ctx.globalAlpha = j < visibleCols ? 0.7 : 0.12
      ctx.textAlign = "center"
      ctx.fillText(d, ox + j * (cell + gap) + cell / 2, oy - 6)
    })

    contacts.forEach((c, i) => {
      ctx.fillStyle = mid
      ctx.globalAlpha = 0.5
      ctx.textAlign = "right"
      ctx.fillText(c, ox - 6, oy + i * (cell + gap) + cell / 2 + fontSize * 0.35)
    })

    contacts.forEach((_, i) => {
      days.forEach((_, j) => {
        const v = matrix[i][j]
        const visible = j < visibleCols
        const x = ox + j * (cell + gap)
        const y = oy + i * (cell + gap)
        ctx.globalAlpha = visible ? (v > 0.5 ? v * 0.8 : Math.max(v * 0.35, 0.03)) : 0.04
        ctx.fillStyle = ink
        ctx.fillRect(x, y, cell, cell)
        ctx.globalAlpha = 0.07
        ctx.strokeStyle = ink
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, cell, cell)
      })
    })

    ctx.globalAlpha = 1
  }, [progress])

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  )
}

function SelfViz({ progress }: { progress: number }) {
  const p = Math.min(progress, 1)
  const terms = [
    { word: "stability", weight: 0.88, x: 0.38, y: 0.28 },
    { word: "direction", weight: 0.72, x: 0.64, y: 0.44 },
    { word: "certainty", weight: 0.65, x: 0.22, y: 0.52 },
    { word: "achievement", weight: 0.58, x: 0.72, y: 0.24 },
    { word: "clarity", weight: 0.52, x: 0.5, y: 0.64 },
    { word: "belonging", weight: 0.31, x: 0.18, y: 0.76 },
    { word: "purpose", weight: 0.28, x: 0.78, y: 0.72 },
    { word: "identity", weight: 0.18, x: 0.44, y: 0.84 },
  ]

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {terms.map((t) => (
        <div
          key={t.word}
          style={{
            position: "absolute",
            left: `${t.x * 100}%`,
            top: `${t.y * 100}%`,
            transform: "translate(-50%, -50%)",
            fontFamily: "var(--mono, 'Reddit Mono')",
            fontSize: `${10 + t.weight * 10}px`,
            fontWeight: 400,
            color: t.weight > 0.6 ? "var(--ink)" : "var(--mid)",
            opacity: p > t.weight * 0.3 ? t.weight * 0.85 : 0,
            transition: "opacity 0.5s ease",
            whiteSpace: "nowrap",
            letterSpacing: "0.04em",
            pointerEvents: "none",
          }}
        >
          {t.word}
        </div>
      ))}
    </div>
  )
}

// ─── Sidebar card ─────────────────────────────────────────────────────────────

function AttributeCard({
  chain,
  visible,
}: {
  chain: (typeof CHAINS)[number]
  visible: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const isLow = chain.classification.score < 50

  function handleMouseEnter() {
    setHovered(true)
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setTooltipPos({ top: rect.top, left: rect.left })
    }
  }

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease, background 0.15s ease",
          background: hovered
            ? isLow
              ? "rgba(176,74,47,0.1)"
              : "rgba(30,30,30,0.08)"
            : isLow
              ? "rgba(176,74,47,0.05)"
              : "rgba(30,30,30,0.04)",
          borderLeft: `2px solid ${isLow ? "var(--red)" : "var(--ink)"}`,
          padding: "8px 10px",
          cursor: "default",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "var(--mono, 'Reddit Mono')",
              fontSize: "var(--size-label, 14px)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: isLow ? "var(--red)" : "var(--mid)",
            }}
          >
            {chain.label}
          </span>
          <span
            style={{
              fontFamily: "var(--mono, 'Reddit Mono')",
              fontSize: "var(--size-label, 14px)",
              color: isLow ? "var(--red)" : "var(--ink)",
              opacity: 0.5,
            }}
          >
            {chain.classification.score}
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--mono, 'Reddit Mono')",
            fontSize: "var(--size-step-label, 20px)",
            fontWeight: 400,
            color: isLow ? "var(--mid)" : "var(--ink)",
            fontStyle: isLow ? "italic" : "normal",
            marginBottom: 6,
            lineHeight: 1.2,
          }}
        >
          {chain.classification.label}
        </div>
        <div style={{ height: 2, background: "rgba(30,30,30,0.08)" }}>
          <div
            style={{
              height: "100%",
              width: `${chain.classification.score}%`,
              background: isLow ? "var(--red)" : "var(--ink)",
              opacity: 0.3,
            }}
          />
        </div>
      </div>

      {hovered && visible && tooltipPos && (
        <div
          style={{
            position: "fixed",
            top: tooltipPos.top,
            left: tooltipPos.left - 275,
            width: 268,
            background: "var(--ink)",
            padding: "14px 16px",
            zIndex: 9999,
            pointerEvents: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--sans, 'DM Sans')",
              fontSize: "var(--size-label, 14px)",
              fontWeight: 300,
              color: "var(--bg, #f5f3ef)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {chain.tooltip}
          </p>
        </div>
      )}
    </>
  )
}

// ─── Intro screen ─────────────────────────────────────────────────────────────

function IntroScreen({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: `${PAD * 2}px ${PAD * 2}px`,
        boxSizing: "border-box",
        zIndex: 10,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            fontFamily: "var(--mono, 'Reddit Mono')",
            fontSize: "var(--size-label, 14px)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--red)",
          }}
        >
          Profile synthesis
        </div>
        <p
          style={{
            fontFamily: "var(--sans, 'DM Sans')",
            fontSize: "var(--size-body, 22px)",
            fontWeight: 300,
            color: "var(--ink)",
            lineHeight: "var(--lh-body, 1.7)",
            margin: 0,
          }}
        >
          After adopting IDEAL's devices, users undergo a two-week calibration period. Data is collected continuously and synthesized into a personal profile that informs every directive you receive.
        </p>
        <p
          style={{
            fontFamily: "var(--sans, 'DM Sans')",
            fontSize: "var(--size-body, 22px)",
            fontWeight: 300,
            color: "var(--mid)",
            lineHeight: "var(--lh-body, 1.7)",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          The following is a demonstration of the types of data that may be collected, and what attributes may be derived.
        </p>
        <div>
          <PixelButton onClick={onDismiss}>{"Next >"}</PixelButton>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage({ onProceed }: { onProceed: () => void }) {
  const [showIntro, setShowIntro] = useState(true)
  const [introVisible, setIntroVisible] = useState(false)
  const [vizReady, setVizReady] = useState(false)
  const [activeChain, setActiveChain] = useState(0)
  const [stage, setStage] = useState<"signal" | "classification">("signal")
  const [vizProgress, setVizProgress] = useState(0)
  const [completedChains, setCompletedChains] = useState<number[]>([])
  const [allDone, setAllDone] = useState(false)
  const [synthVisible, setSynthVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const [nextEnabled, setNextEnabled] = useState(false)
  const [annotationVisible, setAnnotationVisible] = useState(false)

  const rafRef = useRef<number | null>(null)
  const chainRef = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => setIntroVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  function dismissIntro() {
    setShowIntro(false)
    setVizReady(true)
    setTimeout(() => setHeaderVisible(true), 200)
    setTimeout(() => startChain(0), 600)
  }

  function startChain(idx: number) {
    chainRef.current = idx
    setNextEnabled(false)
    setAnnotationVisible(false)
    setSynthVisible(false)
    setAllDone(false)
    setActiveChain(idx)
    setVizProgress(0)
    setStage("signal")

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const duration = 2400
    const start = performance.now()
    const isFinal = idx === CHAINS.length - 1

    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      setVizProgress(p)

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          setStage("classification")
          setAnnotationVisible(true)
          setCompletedChains((prev) => (prev.includes(idx) ? prev : [...prev, idx]))

          if (isFinal) {
            setAllDone(true)
            setTimeout(() => {
              setSynthVisible(true)
              setNextEnabled(true)
            }, 400)
          } else {
            setNextEnabled(true)
          }
        }, 500)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  function handleNext() {
    if (!nextEnabled) return

    if (activeChain === CHAINS.length - 1) {
      onProceed()
      return
    }

    const next = chainRef.current + 1
    if (next < CHAINS.length) {
      startChain(next)
    }
  }

  function handlePrev() {
    const prev = chainRef.current - 1
    if (prev >= 0) startChain(prev)
  }

  const chain = CHAINS[activeChain]
  const isLastChain = activeChain === CHAINS.length - 1
  const VizComponent = [SleepViz, OutputViz, SocialViz, SelfViz][activeChain]
  const isLow = chain.classification.score < 50

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        userSelect: "none",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {showIntro && <IntroScreen visible={introVisible} onDismiss={dismissIntro} />}

      <div
        style={{
          padding: `${PAD * 0.6}px ${PAD}px`,
          borderBottom: "1px solid rgba(30,30,30,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          opacity: headerVisible ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono, 'Reddit Mono')",
            fontSize: "var(--size-label, 14px)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--mid)",
          }}
        >
          Identity profile
        </span>
        <span
          style={{
            fontFamily: "var(--mono, 'Reddit Mono')",
            fontSize: "var(--size-label, 14px)",
            letterSpacing: "0.1em",
            color: "var(--mid)",
          }}
        >
          {completedChains.length} / {CHAINS.length}
        </span>
      </div>

      {vizReady && (
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              borderRight: "1px solid rgba(30,30,30,0.1)",
              padding: `${PAD}px ${PAD}px 0 ${PAD}px`,
            }}
          >
            <div style={{ flexShrink: 0, marginBottom: PAD * 0.75 }}>
              <div
                style={{
                  fontFamily: "var(--mono, 'Reddit Mono')",
                  fontSize: "var(--size-headline, 36px)",
                  fontWeight: 400,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  marginBottom: 20,
                }}
              >
                {chain.label}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {chain.devices.map((d) => (
                  <span
                    key={d}
                    style={{
                      fontFamily: "var(--mono, 'Reddit Mono')",
                      fontSize: "var(--size-label, 14px)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--mid)",
                      border: "1px solid var(--mid)",
                      padding: "2px 8px",
                    }}
                  >
                    {d}
                  </span>
                ))}
                <span
                  style={{
                    fontFamily: "var(--mono, 'Reddit Mono')",
                    fontSize: "var(--size-label, 14px)",
                    color: "var(--mid)",
                    letterSpacing: "0.04em",
                    paddingLeft: 12,
                    opacity: 0.55,
                  }}
                >
                  {chain.vizLabel}
                </span>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
              <VizComponent progress={vizProgress} />
            </div>

            <div style={{ flexShrink: 0, height: 36, display: "flex", alignItems: "center", marginTop: 20 }}>
              <span
                key={activeChain}
                style={{
                  fontFamily: "var(--mono, 'Reddit Mono')",
                  fontSize: "var(--size-label, 14px)",
                  color: isLow ? "var(--red)" : "var(--mid)",
                  letterSpacing: "0.04em",
                  opacity: annotationVisible ? 1 : 0,
                  transition: "opacity 0.4s ease",
                }}
              >
                {chain.annotation}
              </span>
            </div>

            <div
              style={{
                flexShrink: 0,
                borderTop: "1px solid rgba(30,30,30,0.12)",
                padding: `${PAD * 0.5}px 0`,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ display: "flex" }}>
                <PixelButton onClick={handlePrev} disabled={activeChain === 0} position="left">
                  {"< Back"}
                </PixelButton>

                <PixelButton onClick={handleNext} disabled={!nextEnabled} position="right">
                  {isLastChain ? "Continue >" : "Next >"}
                </PixelButton>
              </div>
            </div>
          </div>

          <div
            style={{
              width: 240,
              flexShrink: 0,
              padding: `${PAD}px ${PAD * 0.75}px`,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              overflowY: "auto",
              overflowX: "visible",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono, 'Reddit Mono')",
                fontSize: "var(--size-label, 14px)",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--mid)",
                marginBottom: 8,
                flexShrink: 0,
              }}
            >
              Attributes
            </div>

            {CHAINS.map((c, i) => (
              <AttributeCard key={c.id} chain={c} visible={completedChains.includes(i)} />
            ))}

            <div
              style={{
                marginTop: 4,
                padding: "8px 10px",
                border: "1px solid var(--mid)",
                opacity: synthVisible ? 1 : 0,
                transform: synthVisible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono, 'Reddit Mono')",
                  fontSize: "var(--size-label, 14px)",
                  color: "var(--mid)",
                  letterSpacing: "0.06em",
                  lineHeight: 1.6,
                }}
              >
                Profile synthesis complete.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}