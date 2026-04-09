import { useEffect, useRef, useState } from "react"
import React from "react"

function css(v: string) {
  return `var(${v})`
}

function PixelButton({ children, onClick }: {
  children: React.ReactNode
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: css("--mono"),
        fontSize: css("--size-button"),
        fontWeight: 400,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        background: hovered ? css("--ink") : "transparent",
        border: css("--border-strong"),
        borderRadius: css("--radius"),
        padding: "9px 20px",
        color: hovered ? css("--bg") : css("--ink"),
        cursor: "pointer",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      {children}
    </button>
  )
}

function PixelControlButton({ children, onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd, wide = false }: {
  children: React.ReactNode
  onMouseDown?: () => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: () => void
  onTouchEnd?: () => void
  wide?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { setHovered(false); onMouseLeave?.() }}
      onMouseEnter={() => setHovered(true)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        fontFamily: css("--mono"),
        fontSize: css("--size-caption"),
        fontWeight: 400,
        letterSpacing: "0.1em",
        color: hovered ? css("--bg") : css("--ink"),
        background: hovered ? css("--ink") : "transparent",
        border: css("--border"),
        borderRadius: css("--radius"),
        width: wide ? "auto" : 34,
        minWidth: wide ? 64 : 34,
        height: 34,
        padding: wide ? "0 10px" : 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      {children}
    </button>
  )
}

const MITO_SIZE = 37
const SPRITE_SIZE = 30
const BLOCK_SIZE = 40
const SCROLLER_H = 280
const WORLD_W = 2700
const GROUND_Y = SCROLLER_H - 28
const MITO_SPEED = 168
const COLLECT_DIST = 30
const JUMP_FORCE = -650
const GRAVITY = 1900
const ACT2_X = WORLD_W - 620
const ACT2_BLOCK_W = 200
const ACT2_GAP = 80

const SPAWN_ZONES: {
  ground: { x: number }
  platform: { x: number; platformY?: number }
}[] = [
    { ground: { x: 200 }, platform: { x: 200 } },
    { ground: { x: 470 }, platform: { x: 580, platformY: 3 * BLOCK_SIZE } },
    { ground: { x: 700 }, platform: { x: 820, platformY: 2 * BLOCK_SIZE } },
    { ground: { x: 960 }, platform: { x: 1050, platformY: 4 * BLOCK_SIZE } },
    { ground: { x: 1390 }, platform: { x: 1280, platformY: 2 * BLOCK_SIZE } },
    { ground: { x: 1640 }, platform: { x: 1520, platformY: 3 * BLOCK_SIZE } },
    { ground: { x: 1900 }, platform: { x: 1760, platformY: 3 * BLOCK_SIZE } },
  ]

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const assignedSlots = shuffled(
  SPAWN_ZONES.map((zone) => Math.random() < 0.5 ? zone.ground : zone.platform)
)

const TOOL_DEFINITIONS: {
  id: string
  label: string
  description: string
  firstUsed: string
  sprite: string
}[] = [
    { id: "astrology", label: "Astrology", description: "Humanity's earliest attempt to solve uncertainty, by predicting fate from the stars.", firstUsed: "Developed: c. 3000 BCE", sprite: "/sprites/astrology.png" },
    { id: "receipts", label: "Receipts", description: "Physical trails turned the uncertainty of memory into hard evidence.", firstUsed: "Early receipts: c. 2050 BCE", sprite: "/sprites/receipts.png" },
    { id: "contracts", label: "Contracts", description: "By binding the future with words, contracts attempted to eliminate uncertainty from human agreements.", firstUsed: "Contracts: c. 1750 BCE", sprite: "/sprites/contracts.png" },
    { id: "maps", label: "Maps", description: "We began charting the unknown. Maps turned dangerous terrain into navigable paths.", firstUsed: "First known map: c. 600 BCE", sprite: "/sprites/maps.png" },
    { id: "clocks", label: "Clocks", description: "Clocks allowed us to impose strict order on the formless flow of time.", firstUsed: "Mechanical clocks: c. 1300s", sprite: "/sprites/clock.png" },
    { id: "measurements", label: "Measurements", description: "To measure is to control. Standardised units turned the world into something manageable.", firstUsed: "Metric system: c. 1800s", sprite: "/sprites/measurements.png" },
    { id: "statistics", label: "Statistics", description: "With advancements in science, we could now use data to find patterns in the unpredictable.", firstUsed: "Modern statistics: c. 1900s", sprite: "/sprites/statistics.png" },
  ]

const TOOL_CONFIG = TOOL_DEFINITIONS.map((def, i) => {
  const slot = assignedSlots[i]
  return {
    ...def,
    x: slot.x,
    platformY: (slot as any).platformY,
  }
})

const SPRITE_URLS: Record<string, string> = {
  mito_right: "/sprites/mito_r.png",
  mito_left: "/sprites/mito_l.png",
  mito_stretch_right: "/sprites/mito_r_stretch.png",
  mito_stretch_left: "/sprites/mito_l_stretch.png",
  ...Object.fromEntries(TOOL_DEFINITIONS.map(t => [`${t.id}_1`, t.sprite])),
}

interface BlockStack {
  baseX: number
  rows: number[]
}

const BLOCK_STACKS: BlockStack[] = [
  { baseX: 580, rows: [3, 2, 1] },
  { baseX: 820, rows: [2, 2] },
  { baseX: 1050, rows: [4, 3, 2, 1] },
  { baseX: 1280, rows: [2, 1] },
  { baseX: 1520, rows: [3, 3, 2] },
  { baseX: 1760, rows: [2, 2, 1] },
  { baseX: 2000, rows: [3, 2] },
]

function getStackPlatforms() {
  const platforms: { x: number; yOff: number; w: number }[] = []
  BLOCK_STACKS.forEach((stack) => {
    stack.rows.forEach((count, rowIdx) => {
      platforms.push({ x: stack.baseX, yOff: (rowIdx + 1) * BLOCK_SIZE, w: count * BLOCK_SIZE })
    })
  })
  return platforms
}
const PLATFORMS = getStackPlatforms()

function drawMito(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, facingRight: boolean, mitoFrame: "idle" | "stretch", spriteImages: Record<string, HTMLImageElement>) {
  const dir = facingRight ? "right" : "left"
  const key = mitoFrame === "stretch" ? `mito_stretch_${dir}` : `mito_${dir}`
  const img = spriteImages[key]
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x - size / 2, y, size, size)
  } else {
    const r = size * 0.22
    ctx.strokeStyle = "#1e1e1e"
    ctx.lineWidth = 1.5
    ctx.fillStyle = "#1e1e1e"
    ctx.beginPath()
    ctx.moveTo(x - size / 2 + r, y)
    ctx.lineTo(x + size / 2 - r, y)
    ctx.quadraticCurveTo(x + size / 2, y, x + size / 2, y + r)
    ctx.lineTo(x + size / 2, y + size - r)
    ctx.quadraticCurveTo(x + size / 2, y + size, x + size / 2 - r, y + size)
    ctx.lineTo(x - size / 2 + r, y + size)
    ctx.quadraticCurveTo(x - size / 2, y + size, x - size / 2, y + size - r)
    ctx.lineTo(x - size / 2, y + r)
    ctx.quadraticCurveTo(x - size / 2, y, x - size / 2 + r, y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    const eyeY = y + size * 0.38
    const eyeOff = facingRight ? size * 0.12 : -size * 0.12
    const eyeSpread = size * 0.14
    ctx.fillStyle = "#f5f3ef"
    ctx.fillRect(x + eyeOff - eyeSpread - 1.5, eyeY - 1.5, 3, 3)
    ctx.fillRect(x + eyeOff + eyeSpread - 1.5, eyeY - 1.5, 3, 3)
  }
}

function drawTool(ctx: CanvasRenderingContext2D, tool: typeof TOOL_CONFIG[0], groundY: number, collected: boolean, spriteImages: Record<string, HTMLImageElement>) {
  if (collected) return
  const platformY = tool.platformY ? groundY - tool.platformY - SPRITE_SIZE : groundY - SPRITE_SIZE
  const img = spriteImages[`${tool.id}_1`]
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, tool.x - SPRITE_SIZE / 2, platformY, SPRITE_SIZE, SPRITE_SIZE)
  }
}

function drawBlockStacks(ctx: CanvasRenderingContext2D, ink: string, bg: string) {
  BLOCK_STACKS.forEach((stack) => {
    stack.rows.forEach((count, rowIdx) => {
      const w = count * BLOCK_SIZE
      const x = stack.baseX - w / 2
      const y = GROUND_Y - (rowIdx + 1) * BLOCK_SIZE
      ctx.fillStyle = bg
      ctx.fillRect(x, y, w, BLOCK_SIZE)
      ctx.strokeStyle = ink
      ctx.lineWidth = 0.75
      for (let i = 0; i < count; i++) {
        ctx.strokeRect(x + i * BLOCK_SIZE, y, BLOCK_SIZE, BLOCK_SIZE)
      }
    })
  })
}

function drawSpeechBubble(ctx: CanvasRenderingContext2D, mitoX: number, mitoY: number, mitoSize: number, cameraX: number, text: string, ink: string, bg: string, opacity: number) {
  if (opacity <= 0) return
  ctx.save()
  ctx.globalAlpha = opacity
  const screenX = mitoX - cameraX
  const padding = 8
  const fontSize = 9
  ctx.font = `400 ${fontSize}px 'Reddit Mono', monospace`
  const textW = ctx.measureText(text).width
  const bubbleW = textW + padding * 2
  const bubbleH = fontSize + padding * 2
  const tailH = 7
  const tailW = 8
  const bubbleX = screenX - bubbleW / 2
  const bubbleY = mitoY - bubbleH - tailH - 4
  ctx.fillStyle = bg
  ctx.strokeStyle = ink
  ctx.lineWidth = 1
  const r = 2
  ctx.beginPath()
  ctx.moveTo(bubbleX + r, bubbleY)
  ctx.lineTo(bubbleX + bubbleW - r, bubbleY)
  ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + r)
  ctx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - r)
  ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY + bubbleH, bubbleX + bubbleW - r, bubbleY + bubbleH)
  ctx.lineTo(screenX + tailW / 2, bubbleY + bubbleH)
  ctx.lineTo(screenX, bubbleY + bubbleH + tailH)
  ctx.lineTo(screenX - tailW / 2, bubbleY + bubbleH)
  ctx.lineTo(bubbleX + r, bubbleY + bubbleH)
  ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleH, bubbleX, bubbleY + bubbleH - r)
  ctx.lineTo(bubbleX, bubbleY + r)
  ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + r, bubbleY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = ink
  ctx.textAlign = "center"
  ctx.fillText(text, screenX, bubbleY + padding + fontSize - 1)
  ctx.restore()
}

export default function ToolsPage({ visibleKey }: { visibleKey?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const rafRef = useRef<number | null>(null)
  const spriteImagesRef = useRef<Record<string, HTMLImageElement>>({})

  const stateRef = useRef({
    mitoX: 80,
    mitoY: GROUND_Y - MITO_SIZE,
    velY: 0,
    onGround: true,
    wasOnGround: true,
    cameraX: 0,
    facingRight: true,
    mitoFrame: "idle" as "idle" | "stretch",
    mitoFrameTimer: 0,
    collected: new Set<string>(),
    collectFlash: false,
    collectFlashTimer: 0,
    act2Opacity: 0,
    allCollected: false,
    nearAct2: false,
    lastTime: 0,
    hasMoved: false,
    bubbleOpacity: 1,
    bubbleFading: false,
    celebrationBubbleOpacity: 0,
    celebrationBubbleFading: false,
    celebrationBubbleTimer: 0,
  })

  const [collected, setCollected] = useState<Set<string>>(new Set())
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)
  const [showAct2Text, setShowAct2Text] = useState(false)
  const [canvasW, setCanvasW] = useState(0)
  const [showHoverHint, setShowHoverHint] = useState(false)
  const [notification, setNotification] = useState<{ label: string; key: number } | null>(null)
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load sprites
  useEffect(() => {
    const images: Record<string, HTMLImageElement> = {}
    Object.entries(SPRITE_URLS).forEach(([key, src]) => {
      const img = new Image()
      img.src = src
      images[key] = img
    })
    spriteImagesRef.current = images
  }, [])

  // Measure canvas width from container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setCanvasW(containerRef.current.offsetWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [visibleKey])

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'INPUT') return
      if (["ArrowLeft", "ArrowRight", "Space", " "].includes(e.key)) {
        e.preventDefault()
        keysRef.current.add(e.key === " " ? "Space" : e.key)
      }
    }
    const up = (e: KeyboardEvent) => { keysRef.current.delete(e.key === " " ? "Space" : e.key) }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (!canvasW) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasW * dpr
    canvas.height = SCROLLER_H * dpr
    canvas.style.width = `${canvasW}px`
    canvas.style.height = `${SCROLLER_H}px`
    ctx.scale(dpr, dpr)

    const style = getComputedStyle(document.documentElement)
    const ink = style.getPropertyValue("--ink").trim() || "#1e1e1e"
    const bg = style.getPropertyValue("--bg").trim() || "#f5f3ef"

    let jumpQueued = false
    const jumpHandler = (e: KeyboardEvent) => { if (e.key === " ") jumpQueued = true }
    window.addEventListener("keydown", jumpHandler)

    function loop(timestamp: number) {
      const s = stateRef.current
      let dt = 0
      if (s.lastTime > 0) dt = Math.min(timestamp - s.lastTime, 50) / 1000
      s.lastTime = timestamp
      s.wasOnGround = s.onGround

      const moving = keysRef.current.has("ArrowRight") || keysRef.current.has("ArrowLeft")
      if (moving && !s.hasMoved) { s.hasMoved = true; s.bubbleFading = true }
      if (s.bubbleFading && s.bubbleOpacity > 0) s.bubbleOpacity = Math.max(0, s.bubbleOpacity - dt * 2.5)
      if (s.celebrationBubbleFading && s.celebrationBubbleOpacity > 0) s.celebrationBubbleOpacity = Math.max(0, s.celebrationBubbleOpacity - dt * 2.5)
      if (s.allCollected && s.celebrationBubbleOpacity > 0 && !s.celebrationBubbleFading) {
        s.celebrationBubbleTimer += dt
        if (s.celebrationBubbleTimer >= 5) {
          s.celebrationBubbleFading = true
        }
      }

      if (keysRef.current.has("ArrowRight")) { s.mitoX += MITO_SPEED * dt; s.facingRight = true }
      if (keysRef.current.has("ArrowLeft")) { s.mitoX -= MITO_SPEED * dt; s.facingRight = false }
      s.mitoX = Math.max(MITO_SIZE / 2, Math.min(s.mitoX, WORLD_W - MITO_SIZE / 2))

      let justJumped = false
      if ((keysRef.current.has("Space") || jumpQueued) && s.onGround) {
        s.velY = JUMP_FORCE
        s.onGround = false
        justJumped = true
        jumpQueued = false
        keysRef.current.delete("Space")
      }
      jumpQueued = false

      s.velY += GRAVITY * dt
      s.mitoY += s.velY * dt
      s.onGround = false

      if (!justJumped) {
        if (s.mitoY + MITO_SIZE >= GROUND_Y) {
          s.mitoY = GROUND_Y - MITO_SIZE
          s.velY = 0
          s.onGround = true
        }
        PLATFORMS.forEach((p) => {
          const py = GROUND_Y - p.yOff
          const mitoBottom = s.mitoY + MITO_SIZE
          const mitoLeft = s.mitoX - MITO_SIZE / 2
          const mitoRight = s.mitoX + MITO_SIZE / 2
          const platLeft = p.x - p.w / 2
          const platRight = p.x + p.w / 2
          if (s.velY >= 0 && mitoBottom >= py && mitoBottom <= py + 12 && mitoRight > platLeft && mitoLeft < platRight) {
            s.mitoY = py - MITO_SIZE
            s.velY = 0
            s.onGround = true
          }
        })
      }

      if (justJumped) { s.mitoFrame = "stretch"; s.mitoFrameTimer = 0.45 }
      if (s.mitoFrameTimer > 0) {
        s.mitoFrameTimer = Math.max(0, s.mitoFrameTimer - dt)
        if (s.mitoFrameTimer === 0) s.mitoFrame = "idle"
      }
      if (s.onGround && s.mitoFrameTimer <= 0) s.mitoFrame = "idle"

      const targetCam = s.mitoX - canvasW / 2
      s.cameraX = Math.max(0, Math.min(targetCam, WORLD_W - canvasW))

      TOOL_CONFIG.forEach((tool) => {
        if (s.collected.has(tool.id)) return
        const toolSurfaceY = tool.platformY ? GROUND_Y - tool.platformY : GROUND_Y
        const dist = Math.hypot(s.mitoX - tool.x, s.mitoY + MITO_SIZE - toolSurfaceY)
        if (dist < COLLECT_DIST) {
          const isFirst = s.collected.size === 0
          s.collected = new Set([...s.collected, tool.id])
          s.collectFlash = true
          s.collectFlashTimer = 8
          setCollected(new Set(s.collected))
          if (notifTimerRef.current) clearTimeout(notifTimerRef.current)
          setNotification({ label: tool.label, key: Date.now() })
          notifTimerRef.current = setTimeout(() => setNotification(null), 2200)
          if (isFirst) setShowHoverHint(true)
          if (s.collected.size === TOOL_CONFIG.length) {
            s.allCollected = true
            s.bubbleFading = true
            s.celebrationBubbleOpacity = 1
            s.celebrationBubbleTimer = 0
            s.celebrationBubbleFading = false
            setTimeout(() => setShowAct2Text(true), 1800)
          }
        }
      })

      if (s.collectFlashTimer > 0) {
        s.collectFlashTimer--
        if (s.collectFlashTimer === 0) s.collectFlash = false
      }
      if (s.allCollected && s.act2Opacity < 1) s.act2Opacity = Math.min(s.act2Opacity + 0.012, 1)

      ctx.clearRect(0, 0, canvasW, SCROLLER_H)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvasW, SCROLLER_H)
      ctx.save()
      ctx.translate(-s.cameraX, 0)
      ctx.strokeStyle = ink
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, GROUND_Y)
      ctx.lineTo(WORLD_W, GROUND_Y)
      ctx.stroke()
      drawBlockStacks(ctx, ink, bg)
      TOOL_CONFIG.forEach((tool) => drawTool(ctx, tool, GROUND_Y, s.collected.has(tool.id), spriteImagesRef.current))

      if (s.allCollected) {
        ctx.globalAlpha = s.act2Opacity
        ctx.strokeStyle = ink
        ctx.lineWidth = 1.5
        const blockH = SCROLLER_H * 0.52
        const blockY = GROUND_Y - blockH
        ctx.strokeRect(ACT2_X, blockY, ACT2_BLOCK_W, blockH)
        ctx.strokeRect(ACT2_X + ACT2_BLOCK_W + ACT2_GAP, blockY, ACT2_BLOCK_W, blockH)
        ctx.fillStyle = ink
        ctx.font = `400 8px 'Reddit Mono', monospace`
        ctx.textAlign = "center"
        ctx.fillText("Datafied Self", ACT2_X + ACT2_BLOCK_W / 2, blockY + blockH / 2)
        ctx.fillText("Assistive AI", ACT2_X + ACT2_BLOCK_W + ACT2_GAP + ACT2_BLOCK_W / 2, blockY + blockH / 2)
        ctx.globalAlpha = 1
      }

      drawMito(ctx, s.mitoX, s.mitoY, MITO_SIZE, s.facingRight, s.mitoFrame, spriteImagesRef.current)
      ctx.restore()

      if (s.bubbleOpacity > 0) {
        drawSpeechBubble(ctx, s.mitoX, s.mitoY, MITO_SIZE, s.cameraX, "Hi! I'm Mito.", ink, bg, s.bubbleOpacity)
      }
      if (s.celebrationBubbleOpacity > 0) {
        drawSpeechBubble(ctx, s.mitoX, s.mitoY, MITO_SIZE, s.cameraX, "Yay! You did it!", ink, bg, s.celebrationBubbleOpacity)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("keydown", jumpHandler)
    }
  }, [canvasW])

  function pressKey(k: string) { keysRef.current.add(k) }
  function releaseKey(k: string) { keysRef.current.delete(k) }
  function jump() {
    const s = stateRef.current
    if (s.onGround) { s.velY = JUMP_FORCE; s.onGround = false }
  }

  const ICON_SIZE = 34

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: css("--bg"),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      boxSizing: "border-box",
      gap: css("--space-4"),
      position: "relative",
    }}>

      {/* Intro text */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: css("--space-2"), width: "90%" }}>
        <p style={{
          fontFamily: css("--sans"),
          fontSize: css("--size-body"),
          fontWeight: 300,
          color: css("--ink"),
          lineHeight: css("--lh-body"),
          letterSpacing: "0.01em",
          textAlign: "center",
          margin: 0,
        }}>
          Humans have always tried to eliminate uncertainty.
        </p>
        <p style={{
          fontFamily: css("--mono"),
          fontSize: css("--size-caption"),
          fontWeight: 400,
          color: css("--mid"),
          letterSpacing: "0.08em",
          textAlign: "center",
          margin: 0,
        }}>
          Use the on-screen buttons or arrow keys to control Mito.
        </p>
      </div>

      {/* Game canvas + controls */}
      <div style={{
        width: "80%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: css("--space-3"),
      }}>
        <div
          ref={containerRef}
          style={{
            width: "100%",
            position: "relative",
            border: css("--border"),
            borderRadius: css("--radius"),
            overflow: "hidden",
            background: css("--bg"),
          }}
        >
          {/* Top left instruction */}
          <div style={{
            position: "absolute",
            top: css("--space-2"),
            left: css("--space-3"),
            fontFamily: css("--mono"),
            fontSize: css("--size-caption"),
            fontWeight: 400,
            letterSpacing: "0.1em",
            color: css("--ink"),
            background: css("--bg"),
            border: css("--border"),
            borderRadius: css("--radius"),
            padding: "4px 8px",
            zIndex: 10,
            pointerEvents: "none",
          }}>
            Collect all the tools to continue.
          </div>

          {/* Top right count + notification */}
          <div style={{
            position: "absolute",
            top: css("--space-2"),
            right: css("--space-3"),
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
            zIndex: 10,
            pointerEvents: "none",
          }}>
            <span style={{
              fontFamily: css("--mono"),
              fontSize: css("--size-caption"),
              fontWeight: 400,
              letterSpacing: "0.15em",
              color: css("--mid"),
            }}>
              {collected.size} / {TOOL_CONFIG.length}
            </span>
            {notification && (
              <span key={notification.key} style={{
                fontFamily: css("--mono"),
                fontSize: css("--size-caption"),
                fontWeight: 400,
                letterSpacing: "0.1em",
                color: css("--red"),
                animation: "notifFadeUp 2.2s ease forwards",
              }}>
                Obtained {notification.label}
              </span>
            )}
          </div>

          <style>{`
          @keyframes notifFadeUp {
            0%   { opacity: 0; transform: translateY(6px); }
            15%  { opacity: 1; transform: translateY(0); }
            70%  { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-6px); }
          }
        `}</style>

          <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>

        {/* Controls row */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: "100%",
          gap: css("--space-4"),
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <PixelControlButton onMouseDown={() => pressKey("ArrowLeft")} onMouseUp={() => releaseKey("ArrowLeft")} onMouseLeave={() => releaseKey("ArrowLeft")} onTouchStart={() => pressKey("ArrowLeft")} onTouchEnd={() => releaseKey("ArrowLeft")}>←</PixelControlButton>
            <PixelControlButton onMouseDown={() => pressKey("ArrowRight")} onMouseUp={() => releaseKey("ArrowRight")} onMouseLeave={() => releaseKey("ArrowRight")} onTouchStart={() => pressKey("ArrowRight")} onTouchEnd={() => releaseKey("ArrowRight")}>→</PixelControlButton>
            <PixelControlButton wide onMouseDown={jump} onTouchStart={jump}>Jump</PixelControlButton>
          </div>

          {/* Inventory */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, marginLeft: "auto" }}>
            <div style={{ display: "flex", gap: 5, position: "relative" }}>
              {TOOL_CONFIG.map((tool) => {
                const isCollected = collected.has(tool.id)
                return (
                  <div
                    key={tool.id}
                    onMouseEnter={() => setHoveredTool(tool.id)}
                    onMouseLeave={() => setHoveredTool(null)}
                    style={{
                      position: "relative",
                      width: ICON_SIZE,
                      height: ICON_SIZE,
                      border: `1px solid ${isCollected ? css("--ink") : css("--mid")}`,
                      borderRadius: css("--radius"),
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "border-color 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    {isCollected ? (
                      <img src={tool.sprite} alt={tool.label} style={{ width: ICON_SIZE - 8, height: ICON_SIZE - 8, objectFit: "contain", imageRendering: "pixelated", display: "block" }} />
                    ) : (
                      <span style={{ fontFamily: css("--mono"), fontSize: css("--size-caption"), color: css("--mid") }}>?</span>
                    )}

                    {hoveredTool === tool.id && (
                      <div style={{
                        position: "absolute",
                        bottom: ICON_SIZE + 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 180,
                        background: css("--bg"),
                        border: css("--border"),
                        borderRadius: css("--radius"),
                        padding: "10px 12px",
                        zIndex: 20,
                        pointerEvents: "none",
                      }}>
                        <p style={{ fontFamily: css("--mono"), fontSize: 12, fontWeight: 400, letterSpacing: "0.15em", textTransform: "uppercase", color: css("--ink"), margin: "0 0 5px 0" }}>
                          {isCollected ? tool.label : "???"}
                        </p>
                        {isCollected ? (
                          <>
                            <p style={{ fontFamily: css("--sans"), fontSize: 13, fontWeight: 300, color: css("--mid"), margin: "0 0 8px 0", lineHeight: 1.5 }}>{tool.description}</p>
                            <p style={{ fontFamily: css("--mono"), fontSize: 8, fontWeight: 400, letterSpacing: "0.1em", color: css("--ink"), margin: 0, borderTop: `1px solid var(--mid)`, paddingTop: 6 }}>{tool.firstUsed}</p>
                          </>
                        ) : (
                          <p style={{ fontFamily: css("--sans"), fontSize: 12, fontWeight: 300, color: css("--mid"), margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>Not yet collected.</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p style={{
              fontFamily: css("--mono"),
              fontSize: css("--size-caption"),
              fontWeight: 400,
              color: css("--mid"),
              letterSpacing: "0.08em",
              margin: 0,
              opacity: showHoverHint ? 1 : 0,
              transform: showHoverHint ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
              pointerEvents: "none",
            }}>
              Hover over each tool to learn more.
            </p>
          </div>
        </div>
      </div>

      {/* Act 2 text */}
      {showAct2Text && (
        <p style={{
          fontFamily: css("--sans"),
          fontSize: css("--size-body"),
          fontWeight: 300,
          color: css("--ink"),
          letterSpacing: "0.01em",
          lineHeight: css("--lh-body"),
          margin: 0,
          textAlign: "center",
          width: "90%",
          opacity: 1,
          transition: "opacity 0.75s ease",
        }}>
          These two new fields are what IDEAL is built on.
        </p>
      )}
    </div>
  )
}