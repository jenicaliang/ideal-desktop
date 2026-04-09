import { useState, useRef, useCallback, useEffect } from 'react'
import React from 'react'

const GITHUB_RAW = "https://raw.githubusercontent.com/jenicaliang/idealassets/main"

const THREE_SCRIPTS = [
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/build/three.min.js",
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/loaders/GLTFLoader.js",
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/loaders/DRACOLoader.js",
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/controls/OrbitControls.js",
]

const DIRECTIVES = [
  "BEGIN YOUR DAY EARLIER",
  "DELAY YOUR REPLY\nBY 12 MINUTES",
  "CHOOSE THE\nHIGHER-YIELD OPTION",
  "REDUCE IDLE TIME NOW",
]

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement("script")
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

async function loadThree(): Promise<any> {
  for (const src of THREE_SCRIPTS) await loadScript(src)
  return (window as any).THREE
}

function makeDirectiveTexture(THREE: any, text: string) {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext("2d")!

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const lines = text.split("\n")
  const fontSize = 52
  const lineHeight = 68
  const blockHeight = lines.length * lineHeight

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  // This actually centers the whole text block.
  const firstLineY = centerY - blockHeight / 2 + lineHeight / 2 + 150

  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `700 ${fontSize}px "Reddit Mono", monospace`
  ctx.fillStyle = "rgba(255,255,255,0.92)"
  ctx.shadowColor = "rgba(255,255,255,0.14)"
  ctx.shadowBlur = 10

  const maxWidth = canvas.width * 0.68

  lines.forEach((line, i) => {
    fitAndDrawCenteredLine(
      ctx,
      line,
      centerX,
      firstLineY + i * lineHeight,
      maxWidth,
      fontSize
    )
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.encoding = THREE.sRGBEncoding
  texture.needsUpdate = true
  return texture
}
function fitAndDrawCenteredLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  baseFontSize: number
) {
  let size = baseFontSize
  const family = `"Reddit Mono", monospace`

  ctx.font = `700 ${size}px ${family}`

  while (ctx.measureText(text).width > maxWidth && size > 28) {
    size -= 2
    ctx.font = `700 ${size}px ${family}`
  }

  ctx.fillText(text, x, y)
}

function TerminalModel({ visible }: { visible: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const threeRef = useRef<{ renderer: any; controls: any; animId: number } | null>(null)
  const directiveIntervalRef = useRef<number | null>(null)
  const directiveMaterialRef = useRef<any>(null)
  const currentDirectiveIndexRef = useRef(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!visible || !mountRef.current) return

    setLoading(true)
    setError(false)
    let cancelled = false
    const delay = setTimeout(() => { init().catch(console.warn) }, 420)

    async function init() {
      const THREE = await loadThree()
      if (cancelled || !mountRef.current) return

      const el = mountRef.current
      const W = el.clientWidth
      const H = el.clientHeight

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 100)
      camera.position.set(0, 0, 2.8)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = 3001
      renderer.toneMapping = 1
      renderer.toneMappingExposure = 1.0
      el.appendChild(renderer.domElement)
      renderer.domElement.style.display = "block"

      scene.add(new THREE.AmbientLight(0xffffff, 0.6))
      const key = new THREE.DirectionalLight(0xffffff, 0.8)
      key.position.set(2, 3, 4)
      scene.add(key)

      const fill = new THREE.DirectionalLight(0xc8d0d8, 0.4)
      fill.position.set(-3, 1, -2)
      scene.add(fill)

      const controls = new THREE.OrbitControls(camera, renderer.domElement)
      controls.enableZoom = false
      controls.enablePan = false
      controls.autoRotate = true
      controls.autoRotateSpeed = 1.2
      controls.enableDamping = true
      controls.dampingFactor = 0.08

      const dracoLoader = new THREE.DRACOLoader()
      dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/libs/draco/")

      const loader = new THREE.GLTFLoader()
      loader.setDRACOLoader(dracoLoader)

      loader.load(`${GITHUB_RAW}/IDEAL_Terminal.glb`, (gltf: any) => {
        if (cancelled) return

        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const centre = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)

        model.scale.setScalar(1 / maxDim)
        model.position.copy(centre.negate())

        let screenMesh: any = null

        model.traverse((child: any) => {
          if (!child.isMesh) return

          if (child.name === "Terminal_Screen") {
            screenMesh = child
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0x050505,
              roughness: 0.08,
              metalness: 0.15,
              clearcoat: 1.0,
              clearcoatRoughness: 0.03,
              side: THREE.DoubleSide,
            })
          } else {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xf0efec,
              roughness: 0.85,
              metalness: 0.02,
              side: THREE.DoubleSide,
            })
          }
        })

        scene.add(model)

        // Add directive plane in front of screen
        if (screenMesh) {
          const screenBox = new THREE.Box3().setFromObject(screenMesh)
          const screenSize = screenBox.getSize(new THREE.Vector3())
          const screenCenter = screenBox.getCenter(new THREE.Vector3())

          const textTexture = makeDirectiveTexture(THREE, DIRECTIVES[0])

          const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
          directiveMaterialRef.current = textMaterial

          // slightly smaller than the screen face
          const planeWidth = screenSize.x * 0.68
const planeHeight = planeWidth * (512 / 1024) // match texture aspect ratio exactly
          const textPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeWidth, planeHeight),
            textMaterial
          )

          textPlane.position.copy(screenCenter)

// get screen facing direction
const normal = new THREE.Vector3()
screenMesh.getWorldDirection(normal)

// move slightly outward from the screen surface
textPlane.position.add(normal.multiplyScalar(0.0002))

          scene.add(textPlane)

          directiveIntervalRef.current = window.setInterval(() => {
            if (!directiveMaterialRef.current) return

            currentDirectiveIndexRef.current =
              (currentDirectiveIndexRef.current + 1) % DIRECTIVES.length

            const nextTexture = makeDirectiveTexture(
              THREE,
              DIRECTIVES[currentDirectiveIndexRef.current]
            )

            const oldMap = directiveMaterialRef.current.map
            directiveMaterialRef.current.map = nextTexture
            directiveMaterialRef.current.needsUpdate = true

            if (oldMap) oldMap.dispose()
          }, 3200)
        }

        setLoading(false)
      }, undefined, (err: any) => {
        console.warn("GLB load failed", err)
        if (!cancelled) setError(true)
      })

      function animate() {
        if (cancelled) return
        threeRef.current!.animId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }

      threeRef.current = { renderer, controls, animId: 0 }
      animate()
    }

    return () => {
      cancelled = true
      clearTimeout(delay)

      if (directiveIntervalRef.current !== null) {
        window.clearInterval(directiveIntervalRef.current)
        directiveIntervalRef.current = null
      }

      if (directiveMaterialRef.current?.map) {
        directiveMaterialRef.current.map.dispose()
      }

      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.animId)
        threeRef.current.renderer.dispose()
        if (mountRef.current && threeRef.current.renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(threeRef.current.renderer.domElement)
        }
        threeRef.current = null
      }
    }
  }, [visible])

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab", position: "relative", background: "#e8e6e1" }}>
      {loading && !error && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--mono, 'Reddit Mono')", fontSize: 12,
          color: "var(--mid)", pointerEvents: "none",
        }}>
          Loading...
        </div>
      )}
      {error && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8,
          fontFamily: "var(--mono, 'Reddit Mono')", fontSize: 12,
          color: "var(--mid)", pointerEvents: "none",
        }}>
          <div>IDEAL_Terminal.glb</div>
          <div style={{ opacity: 0.5 }}>Model not yet available</div>
        </div>
      )}
    </div>
  )
}

export default function TerminalWindow({ onClose, onFocus, onMinimize, zIndex, isMinimized }: {
  onClose: () => void
  onFocus: () => void
  onMinimize: () => void
  zIndex: number
  isMinimized: boolean
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const dragOffset = useRef<{ x: number; y: number } | null>(null)
  const onMouseMoveRef = useRef<((e: MouseEvent) => void) | null>(null)
  const onMouseUpRef = useRef<(() => void) | null>(null)

  const onMouseUp = useCallback(() => {
    dragOffset.current = null
    window.removeEventListener('mousemove', onMouseMoveRef.current!)
    window.removeEventListener('mouseup', onMouseUpRef.current!)
  }, [])

  const onMouseMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX - dragOffset.current!.x, y: e.clientY - dragOffset.current!.y })
  }, [])

  useEffect(() => {
    onMouseMoveRef.current = onMouseMove
    onMouseUpRef.current = onMouseUp
  }, [onMouseMove, onMouseUp])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    onFocus()
    const rect = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    window.addEventListener('mousemove', onMouseMoveRef.current!)
    window.addEventListener('mouseup', onMouseUpRef.current!)
  }, [onFocus])

  const positionStyle = pos
    ? { position: 'fixed' as const, left: pos.x, top: pos.y }
    : { position: 'fixed' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

  return (
    <div
      onMouseDown={onFocus}
      style={{
        ...positionStyle,
        width: '55vw', height: '70vh', zIndex,
        display: 'flex', flexDirection: 'column',
        border: '2px solid var(--magenta)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        userSelect: 'none',
        visibility: isMinimized ? 'hidden' : 'visible',
        pointerEvents: isMinimized ? 'none' : 'auto',
      }}
    >
      <div
        onMouseDown={onMouseDown}
        style={{
          backgroundColor: 'var(--magenta)',
          borderBottom: '2px solid var(--yellow)',
          padding: 'clamp(4px,0.52vw,9px) clamp(8px,0.94vw,16px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'grab', flexShrink: 0,
        }}
      >
        <span style={{
          color: 'var(--yellow)',
          fontFamily: 'Arial Narrow, Arial, sans-serif',
          fontSize: 'clamp(12px,0.9vw,18px)',
          fontWeight: '700',
          letterSpacing: '0.1em',
        }}>
          IDEAL_TERMINAL.glb
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
          <button
            onClick={e => { e.stopPropagation(); onMinimize() }}
            style={{ background: 'none', border: 'none', color: 'var(--yellow)', cursor: 'pointer', fontSize: 'clamp(12px,0.9vw,18px)', fontWeight: '700', padding: '0 4px', lineHeight: 1 }}
          >_</button>
          <button
            onClick={e => { e.stopPropagation(); onClose() }}
            style={{ background: 'none', border: 'none', color: 'var(--yellow)', cursor: 'pointer', fontSize: 'clamp(12px,0.9vw,18px)', fontWeight: '700', padding: '0 4px', lineHeight: 1 }}
          >X</button>
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <TerminalModel visible={!isMinimized} />
      </div>
    </div>
  )
}