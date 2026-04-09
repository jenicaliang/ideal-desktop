import { useEffect, useRef, useState } from "react"
import React from "react"

const PAGE_BG = "#e8e6e1"
const GITHUB_RAW = "https://raw.githubusercontent.com/jenicaliang/idealassets/main"

function css(v: string) {
  return `var(${v})`
}

const DEVICES = [
  {
    id: "thinkband",
    name: "Thinkband",
    dataType: "Cognitive data",
    description: "A slim headband that monitors electrical activity day and night. Designed to feel like nothing.",
    modelSrc: `${GITHUB_RAW}/Thinkband.glb`,
    modelPlaceholder: "T",
  },
  {
    id: "biopill",
    name: "Biopill",
    dataType: "Internal environmental data",
    description: "A dissolvable capsule that travels through the body and logs essential biodata.",
    modelSrc: `${GITHUB_RAW}/Pills.glb`,
    modelPlaceholder: "B",
  },
  {
    id: "sightlog",
    name: "Sightsync",
    dataType: "Visual & environmental data",
    description: "Eye drops containing micro-sensors that adhere to the lens surface and see what you see.",
    modelSrc: `${GITHUB_RAW}/Eyedropper.glb`,
    modelPlaceholder: "S",
  },
  {
    id: "patchwork",
    name: "Patchwork",
    dataType: "Behavioral data",
    description: "A transparent adhesive patch, changed weekly. Monitors movement, posture, and skin response.",
    modelSrc: `${GITHUB_RAW}/PatchScene.glb`,
    modelPlaceholder: "W",
  },
] as const

const THREE_SCRIPTS = [
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/build/three.min.js",
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/loaders/GLTFLoader.js",
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/loaders/DRACOLoader.js",
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/controls/OrbitControls.js",
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

function DeviceModel({ modelSrc, letter, visible, deviceId }: {
  modelSrc: string
  letter: string
  visible: boolean
  deviceId: string
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const threeRef = useRef<{ renderer: any; controls: any; animId: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!visible || !mountRef.current) return

    setLoading(true)
    let cancelled = false
    const delay = setTimeout(() => { init().catch(console.warn) }, 420)

    async function init() {
      const THREE = await loadThree()
      if (cancelled || !mountRef.current) return
      const el = mountRef.current
      const W = el.clientWidth, H = el.clientHeight
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 100)
      camera.position.set(0, 0, 2.8)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = 3001
      renderer.toneMapping = 4
      renderer.toneMappingExposure = 0.75
      el.appendChild(renderer.domElement)
      renderer.domElement.style.display = "block"
      scene.add(new THREE.AmbientLight(0xffffff, 0.4))
      const key = new THREE.DirectionalLight(0xffffff, 1.2)
      key.position.set(2, 3, 4)
      scene.add(key)
      const fill = new THREE.DirectionalLight(0xc8d0d8, 0.25)
      fill.position.set(-3, 1, -2)
      scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffffff, 0.3)
      rim.position.set(0, -2, -4)
      scene.add(rim)
      const controls = new THREE.OrbitControls(camera, renderer.domElement)
      controls.enableZoom = false
      controls.enablePan = false
      controls.autoRotate = true
      controls.autoRotateSpeed = 1.2
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.minPolarAngle = Math.PI * 0.2
      controls.maxPolarAngle = Math.PI * 0.8
      renderer.domElement.addEventListener("pointerdown", () => { controls.autoRotate = false })
      renderer.domElement.addEventListener("pointerup", () => { controls.autoRotate = true })
      const dracoLoader = new THREE.DRACOLoader()
      dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/libs/draco/")
      const loader = new THREE.GLTFLoader()
      loader.setDRACOLoader(dracoLoader)
      loader.load(modelSrc, (gltf: any) => {
        if (cancelled) return
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const centre = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scaleMultiplier: Record<string, number> = { thinkband: 1.8, pulsepoint: 0.8 }
        const scale = (1.3 / maxDim) * (scaleMultiplier[deviceId] ?? 1)
        model.position.copy(centre.negate())
        model.scale.setScalar(scale)
        if (deviceId === "sightlog" || deviceId === "patchwork") model.rotation.y = -Math.PI / 2 - Math.PI / 6
        else if (deviceId === "thinkband") model.rotation.y = Math.PI - Math.PI / 6
        else model.rotation.y = -Math.PI / 6
        model.traverse((child: any) => {
          if (!child.isMesh) return
          const name: string = child.name || ""
          if (deviceId === "biopill") {
            if (name === "Body") {
              if (child.material) child.material.dispose()
              child.material = new THREE.MeshStandardMaterial({ color: 0xb04a2f, roughness: 0.2, metalness: 0.0, transparent: true, opacity: 0.7, depthWrite: false })
              child.renderOrder = 1
            }
          } else if (deviceId === "sightlog") {
            if (name === "Body") {
              if (child.material) child.material.dispose()
              child.material = new THREE.MeshStandardMaterial({ color: 0xf0efec, roughness: 0.2, metalness: 0.0, transparent: true, opacity: 0.65, depthWrite: false })
              child.renderOrder = 2
            } else if (name === "Liquid") {
              if (child.material) child.material.dispose()
              child.material = new THREE.MeshStandardMaterial({ color: 0xb04a2f, roughness: 0.2, metalness: 0.0, transparent: true, opacity: 0.97, depthWrite: false })
              child.renderOrder = 3
            }
          } else if (deviceId === "patchwork") {
            if (name === "Sticky") {
              if (child.material) child.material.dispose()
              child.material = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.0, metalness: 0.5, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide })
              child.renderOrder = 3
            } else if (name === "Sensors" || name === "Sensors.001") {
              if (child.material) {
                child.material = child.material.clone()
                child.material.emissive = new THREE.Color(0xb04a2f)
                child.material.emissiveIntensity = 0.4
              }
              child.renderOrder = 2
            }
          }
        })
        scene.add(model)
        setLoading(false)
      }, undefined, (err: any) => console.warn("GLB load failed", err))

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
      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.animId)
        threeRef.current.renderer.dispose()
        if (mountRef.current && threeRef.current.renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(threeRef.current.renderer.domElement)
        }
        threeRef.current = null
      }
    }
  }, [visible, modelSrc])

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab", position: "relative" }}>
      {loading && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--mono)",
          fontSize: 12,
          color: "var(--mid)",
          pointerEvents: "none",
        }}>
          Loading...
        </div>
      )}
    </div>
  )
}

export default function DevicesPage() {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)

  const device = DEVICES[idx]

  function navigate(dir: "prev" | "next") {
    setFading(true)
    setTimeout(() => {
      setIdx(dir === "next"
        ? (idx + 1) % DEVICES.length
        : (idx - 1 + DEVICES.length) % DEVICES.length
      )
      setFading(false)
    }, 180)
  }

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "#e8e6e1",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Main content area */}
      <div style={{
        flex: 1,
        background: PAGE_BG,
        margin: "0 12px 12px 12px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* 3D model */}
        <div style={{
          flex: 1,
          opacity: fading ? 0 : 1,
          transition: "opacity 0.18s ease",
          position: "relative",
        }}>
          <DeviceModel
            modelSrc={device.modelSrc}
            letter={device.modelPlaceholder}
            visible={!fading}
            deviceId={device.id}
          />
          <div style={{
            position: "absolute",
            bottom: 14,
            left: 18,
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(30,30,30,0.28)",
            pointerEvents: "none",
          }}>
            drag to inspect
          </div>
        </div>

        {/* Device info */}
        <div style={{
          padding: "20px 24px 24px",
          borderTop: "1px solid var(--mid)",
          opacity: fading ? 0 : 1,
          transition: "opacity 0.18s ease",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <p style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--red)",
            margin: 0,
          }}>
            {device.dataType}
          </p>
          <h2 style={{
            fontFamily: "var(--mono)",
            fontSize: 22,
            fontWeight: 400,
            color: "#1e1e1e",
            letterSpacing: "-0.01em",
            margin: 0,
            lineHeight: 1.2,
          }}>
            {device.name}
          </h2>
          <p style={{
            fontFamily: "var(--sans)",
            fontSize: "var(--size-body)",
            fontWeight: 300,
            color: "#1e1e1e",
            lineHeight: "var(--lh-body)",
            margin: 0,
          }}>
            {device.description}
          </p>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px 12px",
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate("prev")}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← Prev
        </button>
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--ink)",
        }}>
          {idx + 1} / {DEVICES.length}
        </span>
        <button
          onClick={() => navigate("next")}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
