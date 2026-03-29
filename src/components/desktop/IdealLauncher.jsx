import { useState, useEffect, useRef } from 'react'

const GlitchOverlay = ({ onDone }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 400,
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        animation: 'glitchBars 0.15s steps(1) infinite',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,255,224,0.08) 40px, rgba(0,255,224,0.08) 42px)',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        animation: 'glitchShift 0.2s steps(1) infinite',
        backgroundColor: 'rgba(255,0,255,0.12)',
        mixBlendMode: 'screen',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        animation: 'glitchFlash 0.3s steps(1) infinite',
        background: 'linear-gradient(transparent 0%, rgba(0,255,224,0.15) 50%, transparent 100%)',
      }} />
    </div>
  )
}

export default function IdealLauncher({ onAccept, onDecline }) {
  const [phase, setPhase] = useState('waiting')
  const [showIcon, setShowIcon] = useState(false)
  const [showGlitch, setShowGlitch] = useState(false)
  const [showExitMsg, setShowExitMsg] = useState(false)
  const [showBlack, setShowBlack] = useState(false)
  const interactionCount = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes glitchBars {
        0% { transform: translateX(0) scaleY(1); }
        20% { transform: translateX(-8px) scaleY(1.02); }
        40% { transform: translateX(6px) scaleY(0.99); }
        60% { transform: translateX(-5px) scaleY(1.01); }
        80% { transform: translateX(8px) scaleY(1); }
        100% { transform: translateX(0) scaleY(1); }
      }
      @keyframes glitchShift {
        0% { opacity: 0; transform: translateX(0); }
        15% { opacity: 0.8; transform: translateX(12px); }
        30% { opacity: 0; transform: translateX(-8px); }
        45% { opacity: 0.6; transform: translateX(6px); }
        60% { opacity: 0.9; transform: translateX(-10px); }
        75% { opacity: 0; transform: translateX(4px); }
        100% { opacity: 0; }
      }
      @keyframes glitchFlash {
        0% { transform: translateY(-100%); opacity: 0; }
        20% { transform: translateY(10%); opacity: 0.9; }
        40% { transform: translateY(25%); opacity: 0.4; }
        55% { transform: translateY(50%); opacity: 0.8; }
        70% { transform: translateY(70%); opacity: 0.3; }
        100% { transform: translateY(100%); opacity: 0; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    const handleInteraction = () => {
      interactionCount.current += 1
      if (interactionCount.current === 2) {
        timerRef.current = setTimeout(() => {
          setShowGlitch(true)
          window.removeEventListener('click', handleInteraction)
          window.removeEventListener('wheel', handleInteraction)
        }, 5000)
      }
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('wheel', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('wheel', handleInteraction)
      clearTimeout(timerRef.current)
    }
  }, [])

  const handleGlitchDone = () => {
    setShowGlitch(false)
    setShowBlack(true)
    setTimeout(() => {
      setShowBlack(false)
      setPhase('popup')
      setShowIcon(true)
    }, 1000)
  }

  const handleOk = () => {
    setPhase('gone')
    onAccept()
  }

  const handleNo = () => {
    setShowExitMsg(true)
  }

  const handleRemember = () => {
    setPhase('remember')
  }

  const handleIconClick = () => {
    setPhase('popup')
  }

  const handleUnderstand = () => {
    setShowExitMsg(false)
    setPhase('idle')
  }

  const titleBarStyle = {
    backgroundColor: 'var(--teal-deep)',
    borderBottom: '2px solid var(--teal-bright)',
    padding: '6px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const bodyStyle = {
    backgroundColor: 'var(--black)',
    padding: '24px',
  }

  const btnStyle = {
    flex: 1,
    padding: '8px',
    fontFamily: 'Arial Narrow, Arial, sans-serif',
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    border: '1px solid var(--teal-bright)',
  }

  return (
    <>
      {showGlitch && <GlitchOverlay onDone={handleGlitchDone} />}

      {showBlack && (
  <div style={{
    position: 'fixed',
    inset: 0,
    zIndex: 450,
    backgroundColor: 'var(--black)',
  }} />
)}

      {/* Desktop icon */}
      {showIcon && phase !== 'popup' && phase !== 'remember' && (
        <div
          onClick={handleIconClick}
          style={{
            position: 'absolute',
            top: '450px',
            right: '500px',
            zIndex: 50,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: '45px',
            height: '45px',
            backgroundColor: 'var(--teal-deep)',
            border: '2px solid var(--teal-bright)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--green)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: '700',
          }}>
            ID
          </div>
          <span style={{
            color: 'var(--white)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '1px 4px',
          }}>
            IDEAL_LAUNCHER
          </span>
        </div>
      )}

      {/* Exit message overlay */}
      {showExitMsg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.85)',
        }}>
          <div style={{
            width: '400px',
            backgroundColor: 'var(--black)',
            border: '2px solid var(--teal-bright)',
            padding: '32px',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'var(--white)',
              fontFamily: 'Arial Narrow, Arial, sans-serif',
              fontSize: '20px',
              fontWeight: '700',
              letterSpacing: '0.05em',
              marginBottom: '16px',
            }}>
              that's ok.
            </p>
            <p style={{
              color: 'var(--grey-light)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: '1.8',
              marginBottom: '28px',
            }}>
              we'll always be here when you're ready. IDEAL will remain on your desktop — just in case.
            </p>
            <button
              onClick={handleUnderstand}
              style={{
                ...btnStyle,
                backgroundColor: 'var(--teal-deep)',
                color: 'var(--teal-bright)',
                width: '100%',
              }}
            >
              I UNDERSTAND
            </button>
          </div>
        </div>
      )}

      {/* Main popup */}
      {phase === 'popup' && !showExitMsg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}>
          <div style={{
            width: '600px',
            border: '2px solid var(--teal-bright)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={titleBarStyle}>
              <span style={{
                color: 'var(--teal-bright)',
                fontFamily: 'Arial Narrow, Arial, sans-serif',
                fontSize: '15px',
                fontWeight: '700',
                letterSpacing: '0.1em',
              }}>
                USER ACCOUNT CONTROL
              </span>
              <span
                onClick={handleNo}
                style={{
                  color: 'var(--yellow)',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                X
              </span>
            </div>
            <div style={bodyStyle}>
              <div style={{
                borderBottom: '1px solid var(--teal-deep)',
                paddingBottom: '16px',
                marginBottom: '16px',
              }}>
                <p style={{
                  color: 'var(--white)',
                  fontFamily: 'Arial Narrow, Arial, sans-serif',
                  fontSize: '25px',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  marginBottom: '20px',
                }}>
                  Do you want to allow this app to make changes to your device?
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    backgroundColor: 'var(--teal-deep)',
                    border: '1px solid var(--teal-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--green)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '15px',
                    fontWeight: '700',
                    flexShrink: 0,
                  }}>
                    ID
                  </div>
                  <div>
                    <div style={{
                      color: 'var(--white)',
                      fontFamily: 'Arial Narrow, Arial, sans-serif',
                      fontSize: '15px',
                      fontWeight: '700',
                      letterSpacing: '0.05em',
                    }}>
                      IDEAL_LAUNCHER.exe
                    </div>
                    <div style={{
                      color: 'var(--grey)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      marginTop: '6px',
                    }}>
                      Publisher: IDEAL Systems Inc.
                    </div>
                    <div style={{
                      color: 'var(--grey)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                    }}>
                      File origin: Unknown
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={handleOk}
                  style={{
                    ...btnStyle,
                    backgroundColor: 'var(--teal-deep)',
                    color: 'var(--teal-bright)',
                  }}
                >
                  OK
                </button>
                <button
                  onClick={handleNo}
                  style={{
                    ...btnStyle,
                    backgroundColor: 'var(--black)',
                    color: 'var(--grey-light)',
                  }}
                >
                  NO
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span
                  onClick={handleRemember}
                  style={{
                    color: 'var(--grey)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  I don't remember installing this
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remember popup */}
      {phase === 'remember' && !showExitMsg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}>
          <div style={{
            width: '600px',
            border: '2px solid var(--teal-bright)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={titleBarStyle}>
              <span style={{
                color: 'var(--teal-bright)',
                fontFamily: 'Arial Narrow, Arial, sans-serif',
                fontSize: '15px',
                fontWeight: '700',
                letterSpacing: '0.1em',
              }}>
                USER ACCOUNT CONTROL
              </span>
              <span
                onClick={handleNo}
                style={{
                  color: 'var(--yellow)',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                X
              </span>
            </div>
            <div style={bodyStyle}>
              <p style={{
                color: 'var(--white)',
                fontFamily: 'Arial Narrow, Arial, sans-serif',
                fontSize: '20px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                marginBottom: '12px',
              }}>
                You've been selected as a beta tester.
              </p>
              <p style={{
                color: 'var(--grey-light)',
                fontFamily: 'var(--font-mono)',
                fontSize: '15px',
                lineHeight: '1.7',
                marginBottom: '20px',
              }}>
                IDEAL was automatically installed on your device as part of a limited beta program. You were chosen based on behavior patterns.
              </p>
              <p style={{
                color: 'var(--grey-light)',
                fontFamily: 'var(--font-mono)',
                fontSize: '15px',
                lineHeight: '1.7',
                marginBottom: '20px',
              }}>
                Would you like to continue to the onboarding experience?
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleOk}
                  style={{
                    ...btnStyle,
                    backgroundColor: 'var(--teal-deep)',
                    color: 'var(--teal-bright)',
                  }}
                >
                  YES, CONTINUE
                </button>
                <button
                  onClick={handleNo}
                  style={{
                    ...btnStyle,
                    backgroundColor: 'var(--black)',
                    color: 'var(--grey-light)',
                  }}
                >
                  NO THANKS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}