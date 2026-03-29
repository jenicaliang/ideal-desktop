import { useState, useRef, useCallback } from 'react'

const playDing = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const o1 = ctx.createOscillator()
  const o2 = ctx.createOscillator()
  const gain = ctx.createGain()
  o1.connect(gain)
  o2.connect(gain)
  gain.connect(ctx.destination)
  o1.frequency.setValueAtTime(880, ctx.currentTime)
  o2.frequency.setValueAtTime(1100, ctx.currentTime)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
  o1.start(ctx.currentTime)
  o2.start(ctx.currentTime)
  o1.stop(ctx.currentTime + 0.6)
  o2.stop(ctx.currentTime + 0.6)
}

const MONOCHROME = [
  { name: 'void', bg: '#000000', text: '#ffffff' },
  { name: 'ash', bg: '#1a1a1a', text: '#ffffff' },
  { name: 'slate', bg: '#333333', text: '#ffffff' },
  { name: 'mist', bg: '#999999', text: '#000000' },
  { name: 'chalk', bg: '#dddddd', text: '#000000' },
  { name: 'bone', bg: '#eeeeee', text: '#000000' },
]

const SOLIDS = [
  { name: 'rust', bg: '#8B3A2A', text: '#ffffff' },
  { name: 'forest', bg: '#1a3a1a', text: '#ffffff' },
  { name: 'ocean', bg: '#1a4a6a', text: '#ffffff' },
  { name: 'moss', bg: '#2a3a1a', text: '#ffffff' },
  { name: 'clay', bg: '#7a4a3a', text: '#ffffff' },
  { name: 'midnight', bg: '#1a1a3a', text: '#ffffff' },
  { name: 'sand', bg: '#c8a878', text: '#000000' },
  { name: 'pine', bg: '#1a4a2a', text: '#ffffff' },
  { name: 'dusk', bg: '#3a2a4a', text: '#ffffff' },
  { name: 'ember', bg: '#6b2a1a', text: '#ffffff' },
  { name: 'dew', bg: '#aaccaa', text: '#000000' },
  { name: 'wheat', bg: '#d4aa60', text: '#000000' },
]

const GRADIENTS = [
  { name: 'lava', bg: 'linear-gradient(135deg, #cc3300, #ff6600)', text: '#ffffff' },
  { name: 'sunrise', bg: 'linear-gradient(135deg, #ff6600, #ffcc00)', text: '#000000' },
  { name: 'storm', bg: 'linear-gradient(135deg, #2a2a4a, #4a4a6a)', text: '#ffffff' },
  { name: 'tide', bg: 'linear-gradient(135deg, #1a6a8a, #4acaca)', text: '#ffffff' },
  { name: 'cascade', bg: 'linear-gradient(135deg, #ff00ff, #00ffff, #ffff00)', text: '#000000' },
  { name: 'prism', bg: 'linear-gradient(135deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff)', text: '#ffffff' },
  { name: 'dusk fade', bg: 'linear-gradient(135deg, #3a2a4a, #ff6600)', text: '#ffffff' },
  { name: 'seafoam', bg: 'linear-gradient(135deg, #1a6a4a, #aaffcc)', text: '#000000' },
]

const PATTERNS = [
  {
    name: 'static',
    text: '#ffffff',
    pattern: 'repeating-linear-gradient(45deg, #111 0px, #111 2px, #333 2px, #333 4px, #222 4px, #222 6px)',
  },
  {
    name: 'grid',
    text: '#00ffe0',
    patternBg: '#0a0a0a',
    patternImage: 'linear-gradient(#1a4a5c 1px, transparent 1px), linear-gradient(90deg, #1a4a5c 1px, transparent 1px)',
    patternSize: '30px 30px',
  },
  {
    name: 'pulse',
    text: '#ff00ff',
    patternBg: '#111',
    patternImage: 'radial-gradient(circle, #ff00ff 1px, transparent 1px)',
    patternSize: '20px 20px',
  },
  {
    name: 'weave',
    text: '#ffffff',
    patternBg: '#0a0a0a',
    patternImage: 'repeating-linear-gradient(45deg, #333 0px, #333 2px, transparent 2px, transparent 8px), repeating-linear-gradient(-45deg, #222 0px, #222 2px, transparent 2px, transparent 8px)',
    patternSize: '12px 12px',
  },
]

const PHASES = [MONOCHROME, SOLIDS, GRADIENTS, PATTERNS]
const PHASE_THRESHOLDS = [0, 15, 35, 60]

const generateCard = (totalScrolled, lastWasNew, unlockedNames) => {
  const phaseWeights = PHASE_THRESHOLDS.map((threshold, i) => {
    if (totalScrolled < threshold) return 0
    const progress = Math.min((totalScrolled - threshold) / 20, 1)
    if (i < PHASES.length - 1 && totalScrolled > PHASE_THRESHOLDS[i + 1] + 20) {
      return Math.max(0.1, progress - 0.3)
    }
    return progress
  })

  const total = phaseWeights.reduce((a, b) => a + b, 0)
  const normalized = phaseWeights.map(w => w / total)

  const rand = Math.random()
  let cumulative = 0
  let phaseIndex = 0
  for (let i = 0; i < normalized.length; i++) {
    cumulative += normalized[i]
    if (rand < cumulative) {
      phaseIndex = i
      break
    }
  }

  const pool = PHASES[phaseIndex]

  // if last was new, force a known card
  if (lastWasNew) {
    const known = pool.filter(c => unlockedNames.has(c.name))
    if (known.length > 0) {
      const card = known[Math.floor(Math.random() * known.length)]
      return { ...card, isNew: false }
    }
  }

  const card = pool[Math.floor(Math.random() * pool.length)]
  const isNew = !unlockedNames.has(card.name)
  return { ...card, isNew }
}

const buildInitialDeck = () => {
  const firstCard = { ...MONOCHROME[0], isNew: false }
  const unlocked = new Set([firstCard.name])
  const cards = [firstCard]
  let lastWasNew = false
  for (let i = 1; i < 5; i++) {
    const card = generateCard(i, lastWasNew, unlocked)
    if (card.isNew) unlocked.add(card.name)
    lastWasNew = card.isNew
    cards.push(card)
  }
  return { cards, unlocked }
}

const { cards: INITIAL_CARDS, unlocked: INITIAL_UNLOCKED } = buildInitialDeck()

function Card({ card, offset }) {
  const bgStyle = card.patternImage
    ? {
        backgroundColor: card.patternBg,
        backgroundImage: card.patternImage,
        backgroundSize: card.patternSize,
      }
    : card.pattern
    ? { background: card.pattern }
    : { background: card.bg }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      transform: `translateY(${offset * 100}%)`,
      transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      ...bgStyle,
    }}>
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '16px',
        color: card.text,
        fontFamily: 'Arial Narrow, Arial, sans-serif',
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        {card.name}
      </div>
    </div>
  )
}

export default function ColorScroller() {
  const [cards, setCards] = useState(INITIAL_CARDS)
  const [current, setCurrent] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [popup, setPopup] = useState(null)
  const [totalScrolled, setTotalScrolled] = useState(0)
  const [unlockedCount, setUnlockedCount] = useState(1)
  const unlockedRef = useRef(new Set(INITIAL_UNLOCKED))
  const lastWasNewRef = useRef(false)
  const scrollAccum = useRef(0)
  const lastScroll = useRef(0)
  const COOLDOWN = 1000

  const appendCard = useCallback((index) => {
    const card = generateCard(index, lastWasNewRef.current, unlockedRef.current)
    if (card.isNew) {
      unlockedRef.current.add(card.name)
      setUnlockedCount(unlockedRef.current.size)
    } 
    lastWasNewRef.current = card.isNew
    setCards(prev => [...prev, card])
    return card
  }, [])

  const handleWheel = (e) => {
    e.preventDefault()
    const now = Date.now()
    if (now - lastScroll.current < COOLDOWN) return

    scrollAccum.current += e.deltaY

    if (scrollAccum.current > 50) {
      scrollAccum.current = 0
      lastScroll.current = now
      const next = current + 1

      // ensure card exists at next index
      if (next >= cards.length) {
        appendCard(next)
      }

      // check landing card for new color
      const landingCard = cards[next]
      if (landingCard?.isNew) {
        playDing()
        setPopup(landingCard.name)
        setTimeout(() => setPopup(null), 2000)
      }

      setCurrent(next)
      setTotalScrolled(t => t + 1)

      // pre-generate one ahead
      if (next >= cards.length - 1) {
        appendCard(next + 1)
      }

    } else if (scrollAccum.current < -50) {
      scrollAccum.current = 0
      lastScroll.current = now
      if (current > 0) {
        setCurrent(c => c - 1)
        setTotalScrolled(t => Math.max(0, t - 1))
      }
    }
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '0px',
      left: '0px',
      zIndex: 20,
      userSelect: 'none',
    }}>
      <div
        onWheel={handleWheel}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          width: '20vw',
          height: '550px',
          backgroundColor: '#111',
          borderTop: '3px solid var(--teal-deep)',
          borderRight: '3px solid var(--teal-deep)',
          overflow: 'hidden',
          position: 'relative',
          cursor: hovering
            ? `url('/src/assets/socialscroll.png') 32 32, auto`
            : 'default',
        }}
      >
        {cards.map((card, i) => {
          const offset = i - current
          if (Math.abs(offset) > 1) return null
          return <Card key={i} card={card} offset={offset} />
        })}

        {/* Total scrolled — top left */}
<div style={{
  position: 'absolute',
  top: '10px',
  left: '10px',
  color: cards[current]?.text || '#ffffff',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  zIndex: 10,
  pointerEvents: 'none',
  transition: 'color 0.4s',
}}>
  {totalScrolled} scrolled
</div>

{/* Unique unlocked — top right */}
<div style={{
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: cards[current]?.text || '#ffffff',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  zIndex: 10,
  pointerEvents: 'none',
  transition: 'color 0.4s',
}}>
  {unlockedCount} unlocked
</div>

        {popup && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.85)',
            border: '1px solid var(--green)',
            color: 'var(--green)',
            fontFamily: 'var(--font-mono)',
            fontSize: '15px',
            padding: '8px 14px',
            textAlign: 'center',
            zIndex: 20,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}>
            new color unlocked<br />
            <span style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em' }}>
              {popup.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}