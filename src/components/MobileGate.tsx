import { useEffect, useState } from "react";

const MIN_WIDTH = 1024;
const MIN_HEIGHT = 600;

export default function MobileGate({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const check = () => {
      setBlocked(window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!blocked) return <>{children}</>;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#1a1a2e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "'Reddit Mono', monospace",
      zIndex: 99999,
      textAlign: "center",
    }}>
      <div style={{
        maxWidth: 360,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
      }}>

        {/* Monitor icon — pure CSS */}
        <div style={{ position: "relative", width: 64, height: 52, marginBottom: 8 }}>
          <div style={{
            width: 64, height: 40,
            border: "2px solid #00FFE0",
            borderRadius: 4,
            boxSizing: "border-box",
          }} />
          <div style={{
            position: "absolute",
            bottom: 8, left: "50%",
            transform: "translateX(-50%)",
            width: 2, height: 10,
            background: "#00FFE0",
          }} />
          <div style={{
            position: "absolute",
            bottom: 0, left: "50%",
            transform: "translateX(-50%)",
            width: 24, height: 2,
            background: "#00FFE0",
          }} />
        </div>

        <p style={{
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#00FFE0",
          margin: 0,
        }}>
          Unsupported Device
        </p>

        <p style={{
          fontSize: 15,
          color: "#e8e6e1",
          lineHeight: 1.6,
          margin: 0,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 400,
        }}>
          This desktop environment wasn't designed for a screen this size. Open it on a laptop or desktop to continue.
        </p>

        <div style={{
          marginTop: "0.5rem",
          padding: "0.75rem 1rem",
          border: "1px solid #1a4a5c",
          borderRadius: 4,
          width: "100%",
          boxSizing: "border-box",
        }}>
          <p style={{
            fontSize: 10,
            color: "#4a7a8a",
            letterSpacing: "0.1em",
            margin: 0,
          }}>
            MIN RESOLUTION — 1024 × 600
          </p>
        </div>

      </div>
    </div>
  );
}