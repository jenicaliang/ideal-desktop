import { useEffect, useState } from "react"

function css(v: string) {
  return `var(${v})`
}

export default function CTAPage({ onProceed, onRefuse }: {
  onProceed: () => void
  onRefuse: () => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "#0a0a0a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 12%",
      boxSizing: "border-box",
      position: "relative",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.6s ease",
      textAlign: "center",
    }}>

      <p style={{
        fontFamily: css("--mono"),
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.2)",
        margin: "0 0 24px 0",
      }}>
        Initialisation
      </p>

      <h2 style={{
        fontFamily: css("--sans"),
        fontSize: 36,
        fontWeight: 300,
        color: "#ffffff",
        margin: "0 0 48px 0",
        lineHeight: 1.25,
        maxWidth: 480,
      }}>
        The onboarding process is complete. Are you ready to live your ideal life?
      </h2>

      <button
        onClick={onProceed}
        style={{
          background: "var(--red)",
          border: "none",
          color: "#ffffff",
          fontFamily: css("--mono"),
          fontSize: 13,
          letterSpacing: "0.1em",
          padding: "16px 40px",
          cursor: "pointer",
          marginBottom: 24,
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        Let's start.
      </button>

      <button
        onClick={onRefuse}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.2)",
          fontFamily: css("--mono"),
          fontSize: 11,
          letterSpacing: "0.08em",
          padding: "4px 0",
          cursor: "pointer",
          transition: "color 0.2s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
      >
        Not now.
      </button>
    </div>
  )
}