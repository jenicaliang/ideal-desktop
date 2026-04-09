import { useState, useRef, useCallback, useEffect } from 'react'
import MitosisLoader from '../ideal/MitosisLoader'
import LoginPage from '../ideal/LoginPage'
import EnvironmentPage from '../ideal/EnvironmentPage'
import UncertaintyPage from '../ideal/UncertaintyPage'
import InferencePage from '../ideal/InferencePage'
import PitchPage from '../ideal/PitchPage'
import ProfilePage from '../ideal/ProfilePage'
import GoalsPage from '../ideal/GoalsPage'
import EndpointsPage from '../ideal/EndpointsPage'
import SocialProofPage from '../ideal/SocialProofPage'
import SampleDaysPage from '../ideal/SampleDaysPage'
import CTAPage from '../ideal/CTAPage'
import RefusePage from '../ideal/RefusePage'


export default function IdealWindow({
  onMinimize, onClose, onReachUncertainty, isMinimized, zIndex, onFocus,
  onOpenFolder, onDownloadCatalog, onThemeChange, chromeColor, chromeBorder,
  onGoalsMount, goalScorerOpened, onEndpointsMount,
  refuseAttempt, onRefuse, onFinalEscape, needsVisited
}) {
  const [pos, setPos] = useState(null)
  const [phase, setPhase] = useState(refuseAttempt > 0 ? 'refuse' : 'mitosis')
  const [showCloseWarning, setShowCloseWarning] = useState(false)
  const [loginStep, setLoginStep] = useState('headline')
  const dragOffset = useRef(null)
  const onMouseMoveRef = useRef(null)
  const onMouseUpRef = useRef(null)

  const isRefusePhase = phase === 'refuse' || phase === 'cta'

  const onMouseUp = useCallback(() => {
    dragOffset.current = null
    if (onMouseMoveRef.current) window.removeEventListener('mousemove', onMouseMoveRef.current)
    if (onMouseUpRef.current) window.removeEventListener('mouseup', onMouseUpRef.current)
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!dragOffset.current) return
    setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })
  }, [])

  useEffect(() => {
    onMouseMoveRef.current = onMouseMove
    onMouseUpRef.current = onMouseUp
  }, [onMouseMove, onMouseUp])

  const onMouseDown = useCallback((e) => {
    onFocus?.()
    const rect = e.currentTarget.parentElement.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    window.addEventListener('mousemove', onMouseMoveRef.current)
    window.addEventListener('mouseup', onMouseUpRef.current)
  }, [onFocus])

  const positionStyle = pos
    ? { position: 'fixed', left: pos.x, top: pos.y }
    : { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

  const handleCloseConfirm = () => {
    setShowCloseWarning(false)
    onClose()
  }

  // X button during refuse phase acts as escape, not close warning
  const handleXClick = (e) => {
    e.stopPropagation()
    if (isRefusePhase) {
      if (refuseAttempt >= 3) {
        onFinalEscape?.()
      } else {
        onRefuse?.()
      }
    } else {
      setShowCloseWarning(true)
    }
  }

  return (
    <>
      <div
        onMouseDown={() => onFocus?.()}
        style={{
          ...positionStyle,
          width: '80vw',
          height: '90vh',
          zIndex: zIndex || 500,
          display: isMinimized ? 'none' : 'flex',
          flexDirection: 'column',
          border: `2px solid ${chromeBorder || 'var(--teal-bright)'}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          userSelect: 'none',
        }}
      >
        {/* Title bar */}
        <div
          onMouseDown={onMouseDown}
          style={{
            backgroundColor: chromeColor || 'var(--teal-deep)',
            borderBottom: `2px solid ${chromeBorder || 'var(--teal-bright)'}`,
            padding: 'clamp(4px, 0.52vw, 9px) clamp(8px, 0.94vw, 16px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'grab',
            flexShrink: 0,
          }}
        >
          <span style={{
            color: chromeBorder || 'var(--teal-bright)',
            fontFamily: 'Arial Narrow, Arial, sans-serif',
            fontSize: 'clamp(12px, 0.9vw, 18px)',
            fontWeight: '700',
            letterSpacing: '0.1em',
          }}>
            IDEAL_LAUNCHER
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
            {!isRefusePhase && (
              <button
                onClick={(e) => { e.stopPropagation(); onMinimize() }}
                style={{ background: 'none', border: 'none', color: chromeBorder || 'var(--teal-bright)', cursor: 'pointer', fontSize: 'clamp(12px, 0.9vw, 18px)', fontWeight: '700', padding: '0 4px', lineHeight: 1 }}
              >
                _
              </button>
            )}
            <button
              onClick={handleXClick}
              style={{ background: 'none', border: 'none', color: 'var(--yellow)', cursor: 'pointer', fontSize: 'clamp(12px, 0.9vw, 18px)', fontWeight: '700', padding: '0 4px', lineHeight: 1 }}
            >
              X
            </button>
          </div>
        </div>

        {/* Content area */}
        <div
          onMouseDown={() => onFocus?.()}
          style={{ flex: 1, backgroundColor: 'var(--bg, #f5f3ef)', overflow: 'hidden', position: 'relative' }}
        >
          {phase === 'mitosis' && <MitosisLoader onDone={() => setPhase('login')} />}

          {phase === 'login' && (
            <LoginPage
              initialStep={loginStep}
              onComplete={() => { setLoginStep('headline'); setPhase('environment') }}
              onCancel={() => setShowCloseWarning(true)}
            />
          )}

          {phase === 'environment' && (
            <EnvironmentPage
              onOpenFolder={onOpenFolder}
              onProceed={() => { onReachUncertainty?.(); setPhase('uncertainty') }}
              onCancel={() => setShowCloseWarning(true)}
              onBack={() => { setLoginStep('webcam'); setPhase('login') }}
            />
          )}

          {phase === 'uncertainty' && (
            <UncertaintyPage
              onProceed={() => setPhase('inference')}
              onCancel={() => setShowCloseWarning(true)}
              onBack={() => setPhase('environment')}
              needsVisited={needsVisited}
            />
          )}

          {phase === 'inference' && <InferencePage onProceed={() => setPhase('pitch')} />}

          {phase === 'pitch' && (
            <PitchPage
              onDownloadCatalog={onDownloadCatalog}
              onThemeChange={onThemeChange}
              onProceed={() => setPhase('profile')}
            />
          )}

          {phase === 'profile' && <ProfilePage onProceed={() => setPhase('goals')} />}

          {phase === 'goals' && (
            <GoalsPage
              onMount={onGoalsMount}
              goalScorerOpened={goalScorerOpened}
              onProceed={() => setPhase('endpoints')}
            />
          )}

          {phase === 'endpoints' && (
            <EndpointsPage
              onMount={onEndpointsMount}
              onProceed={() => setPhase('proof')}
            />
          )}

          {phase === 'proof' && (
            <SocialProofPage
              onProceed={() => setPhase('sampledays')}
              onBack={() => setPhase('endpoints')}
            />
          )}

          {phase === 'sampledays' && (
            <SampleDaysPage
              onProceed={() => setPhase('cta')}
              onBack={() => setPhase('proof')}
            />
          )}

          {phase === 'cta' && (
            <CTAPage
              onProceed={() => setPhase('join')}
              onRefuse={onRefuse}
            />
          )}

          {phase === 'refuse' && (
            <RefusePage
              attempt={refuseAttempt}
              onProceed={() => setPhase('cta')}
              onEscape={refuseAttempt >= 3 ? onFinalEscape : onRefuse}
            />
          )}

          {phase === 'join' && (
            <div style={{ width: '100%', height: '100%', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'var(--mono)', color: 'rgba(255,255,255,0.3)', fontSize: 14, letterSpacing: '0.1em' }}>JOIN ENDING — TBD</p>
            </div>
          )}
        </div>
      </div>

      {/* Close warning — only shown during non-refuse phases */}
      {showCloseWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div style={{ width: 'clamp(300px, 34.7vw, 560px)', backgroundColor: 'var(--black)', border: '2px solid var(--teal-bright)', padding: 'clamp(20px, 2.78vw, 44px)', textAlign: 'center' }}>
            <p style={{ color: 'var(--white)', fontFamily: 'Arial Narrow, Arial, sans-serif', fontSize: 'clamp(16px, 1.75vw, 32px)', fontWeight: '700', letterSpacing: '0.05em', marginBottom: 'clamp(10px, 1.39vw, 22px)' }}>
              Are you sure?
            </p>
            <p style={{ color: 'var(--grey-light)', fontFamily: 'var(--font-mono)', fontSize: 'clamp(15px, 1.2vw, 24px)', lineHeight: '1.8', marginBottom: 'clamp(18px, 2.43vw, 40px)' }}>
              If you close IDEAL now, your progress will be lost and the experience will have to be restarted.
            </p>
            <div style={{ display: 'flex', gap: 'clamp(6px, 0.69vw, 12px)' }}>
              <button onClick={() => setShowCloseWarning(false)} style={{ flex: 1, padding: 'clamp(6px, 0.69vw, 12px)', fontFamily: 'Arial Narrow, Arial, sans-serif', fontSize: 'clamp(16px, 1.5vw, 32px)', fontWeight: '700', letterSpacing: '0.08em', cursor: 'pointer', border: '1px solid var(--teal-bright)', backgroundColor: 'var(--black)', color: 'var(--grey-light)' }}>
                CANCEL
              </button>
              <button onClick={handleCloseConfirm} style={{ flex: 1, padding: 'clamp(6px, 0.69vw, 12px)', fontFamily: 'Arial Narrow, Arial, sans-serif', fontSize: 'clamp(16px, 1.5vw, 32px)', fontWeight: '700', letterSpacing: '0.08em', cursor: 'pointer', border: '1px solid var(--teal-bright)', backgroundColor: 'var(--teal-deep)', color: 'var(--teal-bright)' }}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}