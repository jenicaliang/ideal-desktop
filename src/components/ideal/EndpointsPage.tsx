import { useEffect } from "react"
import React from "react"

const css = (v: string) => `var(${v})`

const DARK_BG = "#1e1e1e"
const DARK_INK = "#f5f3ef"
const DARK_MID = "rgba(245,243,239,0.45)"
const DARK_RED = "#b04a2f"

const DEVICES = [
  { id: "laptop", label: "Laptop & Desktop", description: "Primary directive interface. Full dashboard, scheduling, and goal review." },
  { id: "phone", label: "Mobile", description: "On-the-go nudges, location-aware prompts, and biometric capture." },
  { id: "car", label: "Vehicle", description: "In-transit audio directives. Travel time factored into your daily plan." },
  { id: "watch", label: "Smartwatch", description: "Continuous biometric stream. Directives timed to your biological rhythms." },
  { id: "vision", label: "AR / Vision", description: "Ambient overlays. Directives surface in your field of view at the right moment." },
  { id: "tv", label: "TV & Display", description: "Passive environment integration. Evening review and next-day preview." },
] as const

// Simple pixel SVG icons per device
const ICONS: Record<string, React.ReactNode> = {
  laptop: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="5" width="20" height="13" rx="1" stroke={DARK_MID} strokeWidth="1.5"/>
      <rect x="7" y="8" width="14" height="8" fill={DARK_MID} opacity="0.15"/>
      <path d="M1 18h26v2H1z" stroke={DARK_MID} strokeWidth="1.5"/>
    </svg>
  ),
  phone: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="9" y="3" width="10" height="22" rx="2" stroke={DARK_MID} strokeWidth="1.5"/>
      <circle cx="14" cy="22" r="1" fill={DARK_MID} opacity="0.5"/>
      <rect x="11" y="6" width="6" height="12" fill={DARK_MID} opacity="0.15"/>
    </svg>
  ),
  car: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M5 16l3-7h12l3 7" stroke={DARK_MID} strokeWidth="1.5"/>
      <rect x="3" y="16" width="22" height="7" rx="1" stroke={DARK_MID} strokeWidth="1.5"/>
      <circle cx="8" cy="23" r="2" stroke={DARK_MID} strokeWidth="1.5"/>
      <circle cx="20" cy="23" r="2" stroke={DARK_MID} strokeWidth="1.5"/>
    </svg>
  ),
  watch: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="9" y="7" width="10" height="14" rx="2" stroke={DARK_MID} strokeWidth="1.5"/>
      <path d="M11 7V5h6v2M11 21v2h6v-2" stroke={DARK_MID} strokeWidth="1.5"/>
      <path d="M12 14h4" stroke={DARK_MID} strokeWidth="1.5"/>
    </svg>
  ),
  vision: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M2 14s5-7 12-7 12 7 12 7-5 7-12 7-12-7-12-7z" stroke={DARK_MID} strokeWidth="1.5"/>
      <circle cx="14" cy="14" r="3" stroke={DARK_MID} strokeWidth="1.5"/>
    </svg>
  ),
  tv: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="5" width="22" height="15" rx="1" stroke={DARK_MID} strokeWidth="1.5"/>
      <rect x="6" y="8" width="16" height="9" fill={DARK_MID} opacity="0.15"/>
      <path d="M10 20v3M18 20v3M8 23h12" stroke={DARK_MID} strokeWidth="1.5"/>
    </svg>
  ),
}

export default function EndpointsPage({
  onMount,
  onProceed,
}: {
  onMount: () => void
  onProceed: () => void
}) {
  useEffect(() => {
    onMount?.()
  }, [])

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: DARK_BG,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px 16px",
        borderBottom: `1px solid rgba(245,243,239,0.08)`,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: css("--mono"),
          fontSize: css("--size-label"),
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: DARK_RED,
          marginBottom: 6,
        }}>
          04 — Endpoints
        </div>
        <p style={{
          fontFamily: css("--sans"),
          fontSize: css("--size-body"),
          fontWeight: 300,
          color: DARK_INK,
          lineHeight: css("--lh-body"),
          margin: 0,
          maxWidth: 520,
        }}>
          With our extensive notification system, IDEAL delivers directives across every screen in your life.
        </p>
      </div>

      {/* Device grid */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
        }}>
          {DEVICES.map((device) => (
            <div key={device.id} style={{
              border: `1px solid rgba(245,243,239,0.1)`,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}>
              {ICONS[device.id]}
              <div style={{
                fontFamily: css("--mono"),
                fontSize: css("--size-label"),
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: DARK_INK,
              }}>
                {device.label}
              </div>
              <div style={{
                fontFamily: css("--sans"),
                fontSize: css("--size-label"),
                fontWeight: 300,
                color: DARK_MID,
                lineHeight: 1.5,
              }}>
                {device.description}
              </div>
            </div>
          ))}
        </div>

        {/* Terminal section */}
        <div style={{
          borderTop: `1px solid rgba(245,243,239,0.08)`,
          paddingTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          <div style={{
            fontFamily: css("--mono"),
            fontSize: css("--size-label"),
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: DARK_MID,
          }}>
            IDEAL Terminal
          </div>
          <p style={{
            fontFamily: css("--sans"),
            fontSize: css("--size-label"),
            fontWeight: 300,
            color: DARK_MID,
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 480,
          }}>
            A dedicated hardware endpoint. Plain-text directives on a wraparound display. No notifications. No interface. Just the next right action.
          </p>
          <div>
            <div style={{
              fontFamily: css("--mono"),
              fontSize: css("--size-label"),
              color: DARK_MID,
              letterSpacing: "0.06em",
              opacity: 0.5,
            }}>
              3D model available in your databank → IDEAL_TERMINAL.glb
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        flexShrink: 0,
        borderTop: `1px solid rgba(245,243,239,0.08)`,
        padding: "12px 28px",
        display: "flex",
        justifyContent: "flex-end",
      }}>
        <button
          onClick={onProceed}
          style={{
            fontFamily: css("--mono"),
            fontSize: css("--size-button"),
            fontWeight: 400,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            background: "transparent",
            border: `1.5px solid ${DARK_INK}`,
            padding: "6px 18px",
            color: DARK_INK,
            cursor: "pointer",
          }}
        >
          Continue &gt;
        </button>
      </div>
    </div>
  )
}