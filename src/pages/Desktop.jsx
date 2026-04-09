import { useState, useRef, useCallback, useMemo } from 'react'
import Taskbar from '../components/desktop/Taskbar'
import AboutWindow from '../components/desktop/AboutWindow'
import RoomBackground from '../components/desktop/RoomBackground'
import Ticker from '../components/desktop/Ticker'
import StickyNote from '../components/desktop/StickyNote'
import MoodSelector from '../components/desktop/MoodSelector'
import CameraLog from '../components/desktop/CameraLog'
import BreakingNews from '../components/desktop/BreakingNews'
import ColorScroller from '../components/desktop/ColorScroller'
import MusicPlayer from '../components/desktop/MusicPlayer'
import LiveIndicator from '../components/desktop/LiveIndicator'
import HabitTracker from '../components/desktop/HabitTracker'
import NoteToSelf from '../components/desktop/NoteToSelf'
import IdealLauncher from '../components/desktop/IdealLauncher'
import IdealWindow from '../components/desktop/IdealWindow'
import NeedsWindow from '../components/desktop/NeedsWindow'
import ToolsWindow from '../components/desktop/ToolsWindow'
import FolderWindow from '../components/desktop/FolderWindow'
import WorldWindow from '../components/desktop/WorldWindow'
import DevicesWindow from '../components/desktop/DevicesWindow'
import GoalScorerWindow from '../components/desktop/GoalScorerWindow'
import DirectiveNotification from '../components/desktop/DirectiveNotification'
import TerminalWindow from '../components/desktop/TerminalWindow'

export default function Desktop({
  isMonochrome,
  onMonochrome,
  showAbout,
  onAbout,
  onCloseAbout,
}) {
  const [topNote, setTopNote] = useState(null)
  const [installedApps, setInstalledApps] = useState([])
  const [showNeedsWindow, setShowNeedsWindow] = useState(false)
  const [showToolsWindow, setShowToolsWindow] = useState(false)
  const [toolsZ, setToolsZ] = useState(510)
  const [toolsMinimized, setToolsMinimized] = useState(false)
  const [idealVisible, setIdealVisible] = useState(false)
  const [idealMinimized, setIdealMinimized] = useState(false)
  const [needsMinimized, setNeedsMinimized] = useState(false)
  const [folderVisible, setFolderVisible] = useState(false)
  const [folderMinimized, setFolderMinimized] = useState(false)

  const [idealClosed, setIdealClosed] = useState(false)
  const [idealKey, setIdealKey] = useState(0)

  const [toolsResetKey, setToolsResetKey] = useState(0)
  const [needsResetKey, setNeedsResetKey] = useState(0)
  const [needsZ, setNeedsZ] = useState(510)

  const [showWorldWindow, setShowWorldWindow] = useState(false)
  const [worldMinimized, setWorldMinimized] = useState(false)
  const [worldZ, setWorldZ] = useState(510)
  const [worldResetKey, setWorldResetKey] = useState(0)

  const [showDevicesWindow, setShowDevicesWindow] = useState(false)
  const [devicesMinimized, setDevicesMinimized] = useState(false)
  const [devicesZ, setDevicesZ] = useState(510)

  const [showGoalScorerWindow, setShowGoalScorerWindow] = useState(false)
  const [goalScorerMinimized, setGoalScorerMinimized] = useState(false)
  const [goalScorerZ, setGoalScorerZ] = useState(510)
  const [goalScorerOpened, setGoalScorerOpened] = useState(false)

  const [showDirective, setShowDirective] = useState(false)
  const [showTerminalWindow, setShowTerminalWindow] = useState(false)
  const [terminalMinimized, setTerminalMinimized] = useState(false)
  const [terminalZ, setTerminalZ] = useState(510)

  const FOLDER_Z = 9999
  const IDEAL_MAX_Z = FOLDER_Z - 1

  const [idealZ, setIdealZ] = useState(500)
  const zCounter = useRef(500)

  const [theme, setTheme] = useState('teal') // 'teal' | 'red'

  const handleAccept = useCallback(() => {
    setIdealVisible(true)
    setIdealClosed(false)
  }, [])

  const handleReachUncertainty = useCallback(() => {
    setTimeout(() => {
      setInstalledApps(prev => (prev.includes('needs') ? prev : [...prev, 'needs']))
    }, 600)

    setTimeout(() => {
      setInstalledApps(prev => (prev.includes('tools') ? prev : [...prev, 'tools']))
    }, 2800)

    setTimeout(() => {
      setInstalledApps(prev => (prev.includes('world') ? prev : [...prev, 'world']))
    }, 4200)
  }, [])

  const handleIdealClose = useCallback(() => {
    setTheme('teal')
    setIdealClosed(true)
    setIdealVisible(false)
    setIdealMinimized(false)
    setInstalledApps([])
    setFolderVisible(false)
    setFolderMinimized(false)
    setIdealKey(k => k + 1)
  }, [])

  const handleIdealRestore = useCallback(() => {
    setIdealMinimized(false)
    setIdealVisible(true)
  }, [])

  const handleOpenFolder = useCallback(() => {
    setInstalledApps(prev => (prev.includes('folder') ? prev : [...prev, 'folder']))
    setFolderVisible(true)
    setFolderMinimized(false)
    zCounter.current += 1
  }, [])

  const handleDownloadCatalog = useCallback(() => {
    setInstalledApps(prev => prev.includes('devices') ? prev : [...prev, 'devices'])
    setShowDevicesWindow(true)
    setDevicesMinimized(false)
    zCounter.current += 1
    setDevicesZ(zCounter.current)
  }, [])
  const handleInstallGoalScorer = useCallback(() => {
    setInstalledApps(prev => prev.includes('goalscorer') ? prev : [...prev, 'goalscorer'])
  }, [])
  const handleEndpointsMount = useCallback(() => {
  setShowDirective(true)
  setInstalledApps(prev => prev.includes('terminal') ? prev : [...prev, 'terminal'])
}, [])

  const folderInstalledFiles = useMemo(
    () =>
      [
        installedApps.includes('needs')
          ? {
            id: 'needs',
            label: 'MASLOWS_NEEDS',
            type: '.exe',
            onReset: () => setNeedsResetKey(k => k + 1),
          }
          : null,
        installedApps.includes('tools')
          ? {
            id: 'tools',
            label: 'PRECEDENTS',
            type: '.exe',
            onReset: () => setToolsResetKey(k => k + 1),
          }
          : null,
        installedApps.includes('world')
          ? {
            id: 'world',
            label: 'YOU_N_WRLD',
            type: '.exe',
            onReset: () => {
              localStorage.removeItem('ideal_world_selections')
              localStorage.removeItem('ideal_world_values')
              localStorage.removeItem('ideal_world_fears')
              setWorldResetKey(k => k + 1)
            },
          }
          : null,
        installedApps.includes('devices') ? {
          id: 'devices',
          label: 'PRODUCT_CATALOG',
          type: '.exe',
        } : null,
        installedApps.includes('goalscorer') ? { id: 'goalscorer', label: 'GOAL_SCORER', type: '.exe' } : null,
        installedApps.includes('terminal') ? { id: 'terminal', label: 'IDEAL_TERMINAL', type: '.glb' } : null,
      ].filter(Boolean),
    [installedApps]
  )

  const handleFolderFileClick = useCallback(id => {
    if (id === 'needs') {
      setShowNeedsWindow(true)
      setNeedsMinimized(false)
      zCounter.current += 1
      setNeedsZ(zCounter.current)
    } else if (id === 'tools') {
      setShowToolsWindow(true)
      setToolsMinimized(false)
      zCounter.current += 1
      setToolsZ(zCounter.current)
    } else if (id === 'world') {
      setShowWorldWindow(true)
      setWorldMinimized(false)
      zCounter.current += 1
      setWorldZ(zCounter.current)
    } else if (id === 'devices') {
      setShowDevicesWindow(true)
      setDevicesMinimized(false)
      zCounter.current += 1
      setDevicesZ(zCounter.current)
    } else if (id === 'goalscorer') {
      setShowGoalScorerWindow(true)
      setGoalScorerOpened(true)
      setGoalScorerMinimized(false)
      zCounter.current += 1
      setGoalScorerZ(zCounter.current)
    } else if (id === 'terminal') {
  setShowTerminalWindow(true)
  setTerminalMinimized(false)
  zCounter.current += 1
  setTerminalZ(zCounter.current)
}
  }, [])


  const ICON_SIZE = 'clamp(36px, 4vw, 64px)'
  const ICON_FONT = 'clamp(12px, 0.9vw, 18px)'

  const chromeColor = theme === 'red' ? '#b04a2f' : 'var(--teal-deep)'
  const chromeBorder = theme === 'red' ? 'var(--yellow)' : 'var(--teal-bright)'
  const chromeButtonColor = theme === 'red' ? '#f5f3ef' : 'var(--yellow)'

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--teal-deep)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <RoomBackground />
      <Ticker />

      <StickyNote
        title="TO-DO LIST"
        initialX={0.26}
        initialY={0.37}
        fontSize="clamp(15px, 1vw, 24px)"
        zIndex={topNote === 'todo' ? 30 : 20}
        onFocus={() => setTopNote('todo')}
        items={[
          'URGENT',
          'O Call Mom',
          'O Apply to AT LEAST 10 jobs',
          'O Meal prep',
          'O Email landlord about leak',
          '',
          'DO BY END OF WEEK!!!',
          'O User journey outline',
          'O Finish paper edits',
          'O Sign up for volunteering',
          'O Book dentist appointment',
        ]}
        error="nice try."
      />

      <StickyNote
        title="!!!"
        initialX={0.37}
        initialY={0.22}
        fontSize="clamp(16px, 1.5vw, 32px)"
        zIndex={topNote === 'affirmation' ? 30 : 20}
        onFocus={() => setTopNote('affirmation')}
        items={[
          '"Become addicted',
          'to constant and',
          'never-ending self',
          'improvement."',
        ]}
        error="you need this one."
      />

      <MoodSelector />
      <CameraLog />
      <BreakingNews />
      <ColorScroller />
      <MusicPlayer />
      <LiveIndicator />
      <HabitTracker />
      <NoteToSelf />

      <Taskbar
        isMonochrome={isMonochrome}
        onMonochrome={onMonochrome}
        onAbout={onAbout}
        idealActive={idealMinimized}
        onRestoreIdeal={handleIdealRestore}
        needsActive={needsMinimized}
        onRestoreNeeds={() => setNeedsMinimized(false)}
        toolsActive={toolsMinimized}
        onRestoreTools={() => setToolsMinimized(false)}
        worldActive={worldMinimized}
        onRestoreWorld={() => setWorldMinimized(false)}
        folderActive={folderMinimized}
        onRestoreFolder={() => {
          setFolderMinimized(false)
          setFolderVisible(true)
          zCounter.current += 1
        }}
        devicesActive={devicesMinimized}
        onRestoreDevices={() => setDevicesMinimized(false)}
        goalScorerActive={goalScorerMinimized}
        onRestoreGoalScorer={() => setGoalScorerMinimized(false)}
      />

      {showAbout && <AboutWindow onClose={onCloseAbout} />}

      {installedApps.includes('folder') && (
        <div
          onClick={() => {
            setFolderVisible(true)
            setFolderMinimized(false)
            zCounter.current += 1
          }}
          style={{
            position: 'absolute',
            left: '55vw',
            top: '45vh',
            zIndex: 50,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5vh',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ display: 'block' }}>
              <path
                d="M6 18h22l6 6h24v28H6z"
                fill="var(--teal-deep)"
                stroke="var(--teal-bright)"
                strokeWidth="3"
                shapeRendering="crispEdges"
              />
              <path
                d="M6 18h22l4 4H6z"
                fill="var(--teal-deep)"
                stroke="var(--teal-bright)"
                strokeWidth="3"
                shapeRendering="crispEdges"
              />
            </svg>
          </div>

          <span
            style={{
              color: 'var(--white)',
              fontFamily: 'var(--font-mono)',
              fontSize: ICON_FONT,
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: '1px 0.31vw',
            }}
          >
            YOUR_IDEAL_LIFE
          </span>
        </div>
      )}

      <IdealLauncher
        onAccept={handleAccept}
        onDecline={() => { }}
        onRestoreWindow={idealVisible || idealMinimized ? handleIdealRestore : null}
      />

      {idealVisible && !idealClosed && (
        <IdealWindow
          key={idealKey}
          onMinimize={() => setIdealMinimized(true)}
          onClose={handleIdealClose}
          onReachUncertainty={handleReachUncertainty}
          isMinimized={idealMinimized}
          onDownloadCatalog={handleDownloadCatalog}
          onEndpointsMount={handleEndpointsMount}
          zIndex={idealZ}
          onFocus={() => {
            zCounter.current += 1
            setIdealZ(Math.min(zCounter.current, IDEAL_MAX_Z))
          }}
          onOpenFolder={handleOpenFolder}
          onThemeChange={() => setTheme('red')}
          chromeColor={chromeColor}
          chromeBorder={chromeBorder}
          onGoalsMount={handleInstallGoalScorer}
          onGoalScorerOpened={() => setGoalScorerOpened(true)}
          goalScorerOpened={goalScorerOpened}

        />
      )}

      {installedApps.includes('folder') && (
        <FolderWindow
          installedFiles={folderInstalledFiles}
          onFileClick={handleFolderFileClick}
          onClose={() => {
            setFolderVisible(false)
            setFolderMinimized(false)
          }}
          onFocus={() => { }}
          onMinimize={() => setFolderMinimized(true)}
          zIndex={FOLDER_Z}
          isMinimized={folderMinimized || !folderVisible}
          chromeColor={chromeColor}
          chromeBorder={chromeBorder}
          chromeButtonColor={chromeButtonColor}
        />
      )}

      {installedApps.includes('needs') && (
        <NeedsWindow
          key={`needs-${needsResetKey}`}
          onClose={() => setShowNeedsWindow(false)}
          onFocus={() => {
            zCounter.current += 1
            setNeedsZ(zCounter.current)
          }}
          onMinimize={() => setNeedsMinimized(true)}
          zIndex={needsZ}
          isMinimized={needsMinimized || !showNeedsWindow}
        />
      )}

      {installedApps.includes('tools') && (
        <ToolsWindow
          key={`tools-${toolsResetKey}`}
          onClose={() => setShowToolsWindow(false)}
          onFocus={() => {
            zCounter.current += 1
            setToolsZ(zCounter.current)
          }}
          onMinimize={() => setToolsMinimized(true)}
          zIndex={toolsZ}
          isMinimized={toolsMinimized || !showToolsWindow}
        />
      )}

      {installedApps.includes('world') && (
        <WorldWindow
          key={`world-${worldResetKey}`}
          onClose={() => setShowWorldWindow(false)}
          onFocus={() => {
            zCounter.current += 1
            setWorldZ(zCounter.current)
          }}
          onMinimize={() => setWorldMinimized(true)}
          zIndex={worldZ}
          isMinimized={worldMinimized || !showWorldWindow}
        />
      )}

      {installedApps.includes('devices') && (
        <DevicesWindow
          onClose={() => setShowDevicesWindow(false)}
          onFocus={() => { zCounter.current += 1; setDevicesZ(zCounter.current) }}
          onMinimize={() => setDevicesMinimized(true)}
          zIndex={devicesZ}
          isMinimized={devicesMinimized || !showDevicesWindow}
        />
      )}

      {installedApps.includes('goalscorer') && (
        <GoalScorerWindow
          onClose={() => setShowGoalScorerWindow(false)}
          onFocus={() => { zCounter.current += 1; setGoalScorerZ(zCounter.current) }}
          onMinimize={() => setGoalScorerMinimized(true)}
          onOpen={() => setGoalScorerOpened(true)}
          zIndex={goalScorerZ}
          isMinimized={goalScorerMinimized || !showGoalScorerWindow}
          apiKey={import.meta.env.VITE_ANTHROPIC_KEY}
        />
      )}

      {showDirective && (
  <DirectiveNotification
    onDismiss={() => setShowDirective(false)}
    apiKey={import.meta.env.VITE_ANTHROPIC_KEY}
  />
)}
{installedApps.includes('terminal') && (
  <TerminalWindow
    onClose={() => setShowTerminalWindow(false)}
    onFocus={() => { zCounter.current += 1; setTerminalZ(zCounter.current) }}
    onMinimize={() => setTerminalMinimized(true)}
    zIndex={terminalZ}
    isMinimized={terminalMinimized || !showTerminalWindow}
  />
)}

      {idealClosed && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.85)',
          }}
        >
          <div
            style={{
              width: 'clamp(300px, 34.7vw, 560px)',
              backgroundColor: 'var(--black)',
              border: '2px solid var(--teal-bright)',
              padding: 'clamp(20px, 2.78vw, 44px)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                color: 'var(--white)',
                fontFamily: 'Arial Narrow, Arial, sans-serif',
                fontSize: 'clamp(16px, 1.75vw, 32px)',
                fontWeight: '700',
                letterSpacing: '0.05em',
                marginBottom: 'clamp(10px, 1.39vw, 22px)',
              }}
            >
              That's ok.
            </p>

            <p
              style={{
                color: 'var(--grey-light)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(15px, 1.2vw, 24px)',
                lineHeight: '1.8',
                marginBottom: 'clamp(18px, 2.43vw, 40px)',
              }}
            >
              Take your time. IDEAL will be here when you're ready.
            </p>

            <button
              onClick={() => setIdealClosed(false)}
              style={{
                width: '100%',
                padding: 'clamp(6px, 0.69vw, 12px)',
                fontFamily: 'Arial Narrow, Arial, sans-serif',
                fontSize: 'clamp(16px, 1.5vw, 32px)',
                fontWeight: '700',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                border: '1px solid var(--teal-bright)',
                backgroundColor: 'var(--teal-deep)',
                color: 'var(--teal-bright)',
              }}
            >
              I UNDERSTAND
            </button>
          </div>
        </div>
      )}
    </div>
  )
}