# IDEAL — Project Reference

**Live URL:** https://ideal-desktop.vercel.app  
**Stack:** React / Vite / TypeScript  
**Hardware:** 13-inch M2 MacBook Pro at 1280×800  
**Previous version (superseded):** Framer at traditional-data-904043.framer.app

---

## Concept

IDEAL is a speculative design critique presenting a fictional AI life-optimization platform. It interrogates algorithmic optimization and personal agency through a satirical interactive experience structured as a **retro desktop OS**. The user interacts with draggable windows on a desktop full of ambient noise — a surveillance camera feed background, mood widgets, habit trackers, breaking news, a music player — before being prompted by IDEAL's installer.

Guided by **Mito**, a pixel rounded-square character.

**Core thesis:** Rationalization systems construct a convenient imagined subject with no remainder. They don't concede when challenged — they intensify.

**Aesthetic references:** Retro Windows OS chrome (teal/bright teal, magenta, yellow, black) layered over a warm off-white IDEAL content system. The desktop is deliberately overwhelming; the IDEAL window is deliberately calm and clinical.

---

## File Structure

```
src/
  components/
    desktop/          ← OS chrome layer
      AboutWindow.jsx
      BreakingNews.jsx
      CameraLog.jsx
      ColorScroller.jsx
      DevicesWindow.tsx
      FolderWindow.tsx
      HabitTracker.jsx
      IdealLauncher.jsx
      IdealWindow.jsx
      LiveIndicator.jsx
      MoodSelector.jsx
      MusicPlayer.jsx
      NeedsWindow.tsx
      NoteToSelf.jsx
      RoomBackground.jsx
      StickyNote.jsx
      Taskbar.jsx
      Ticker.jsx
      ToolsWindow.tsx
      WorldWindow.tsx
    ideal/            ← IDEAL experience pages
      shared/
        BottomBar.tsx
        PixelButton.tsx
      DevicesPage.tsx
      EnvironmentPage.tsx
      InferencePage.tsx
      LoginPage.tsx
      MitosisLoader.tsx
      NeedsPage.tsx
      PitchPage.tsx
      ToolsPage.tsx
      UncertaintyPage.tsx
      WorldPage.tsx
  pages/
    Desktop.jsx       ← top-level page
  styles/
    variables.css     ← OS design tokens
    ideal.css         ← IDEAL content tokens + utility classes
  App.jsx
  App.css
  index.css
  main.jsx
public/
  sprites/            ← Mito sprites + tool icons
  affirmations_432HZ.mp3
  affirmations_432HZ_cover.webp
  favicon.svg
  hero.png
  icons.svg
  socialscroll.png    ← custom cursor for ColorScroller
  surveillance.webp   ← desktop background
```

---

## Design System

### Two separate token sets

**OS tokens** (`variables.css`) — used by all desktop chrome components:
- `--teal-deep: #1a4a5c` — primary OS surface
- `--teal-bright: #00FFE0` — primary OS accent / borders
- `--green: #7FFF00` — live indicator, unlock notifications
- `--magenta: #FF00FF` — secondary windows (NeedsWindow, ToolsWindow, WorldWindow, DevicesWindow)
- `--purple: #6F21F9` — music player idle state
- `--red: #FF0000` — breaking news, error states
- `--yellow: #FFE44D` — window close buttons, magenta window accents
- `--grey: #808080`, `--grey-light: #C0C0C0`
- `--black: #000000`, `--white: #FFFFFF`
- `--font-os: Arial, sans-serif`
- `--font-mono: 'Courier New', monospace`

**IDEAL content tokens** (`ideal.css`) — used by all IDEAL pages inside IdealWindow:
- `--bg: #f5f3ef`
- `--ink: #1e1e1e`
- `--red: #b04a2f` ← overrides OS red within IDEAL context
- `--mid: #9a9690`
- `--mono: 'Reddit Mono', monospace`
- `--sans: 'DM Sans', sans-serif`
- `--size-label: 14px`, `--size-caption: 14px`, `--size-body: 22px`, `--size-body-mono: 22px`
- `--size-button: 17px`, `--size-tooltip: 19px`, `--size-step-label: 20px`
- `--size-headline: 36px`, `--size-headline-red: 65px`
- `--space-1: 5px` → `--space-8: 86px`
- `--lh-tight: 1.2`, `--lh-body: 1.7`, `--lh-loose: 1.9`
- `--content-width: 780px`, `--page-width: 1080px`
- `--border: 1px solid var(--ink)`, `--border-strong: 1.5px solid var(--ink)`
- `--radius: 0px`

**IDEAL utility classes** (defined in `ideal.css`):
- `.ideal-label` — mono, 14px, 0.2em tracking, uppercase
- `.ideal-body` — sans, 22px, weight 300, lh-body, ink
- `.ideal-mono-body` — mono, 22px, weight 400
- `.ideal-caption` — mono, 14px, 0.1em tracking
- `.ideal-headline` — sans, 36px, weight 700, lh-tight

**Helper function** used throughout IDEAL pages: `const css = (v: string) => \`var(\${v})\``

---

## Architecture

### App.jsx
Minimal wrapper. Manages `isMonochrome` (grayscale filter toggle) and `showAbout` state. Renders `<Desktop>`. The `phase === 'ideal'` branch is a dead stub — all experience lives inside Desktop.

### Desktop.jsx (pages/Desktop.jsx)
The entire OS. Manages:
- `installedApps` array — gates which windows exist. Apps are added progressively: `needs`/`tools` at 600ms/2800ms after reaching UncertaintyPage, `world` at 4200ms, `folder` on `handleOpenFolder`, `devices` on `handleDownloadCatalog`
- `idealVisible`, `idealMinimized`, `idealClosed`, `idealKey` — IdealWindow lifecycle
- Per-window state: `showNeedsWindow`, `showToolsWindow`, `showWorldWindow`, `showDevicesWindow` + minimized + z-index + resetKey for each
- `folderVisible`, `folderMinimized` — FolderWindow
- `zCounter` ref — shared z-index counter, incremented on focus
- `theme: 'teal' | 'red'` — drives chrome color of IdealWindow + FolderWindow. Set to `'red'` via `onThemeChange` (triggered by PitchPage). Resets to `'teal'` on `handleIdealClose`
- `FOLDER_Z = 9999`, `IDEAL_MAX_Z = FOLDER_Z - 1` — FolderWindow always on top

**Chrome color props** passed to IdealWindow and FolderWindow:
```js
chromeColor  = theme === 'red' ? '#b04a2f'          : 'var(--teal-deep)'
chromeBorder = theme === 'red' ? 'var(--yellow)'    : 'var(--teal-bright)'
chromeButtonColor = theme === 'red' ? '#f5f3ef'     : 'var(--yellow)'
```

**`idealClosed` state** — when IdealWindow is closed, shows a "That's ok." re-entry modal with "I UNDERSTAND" button (sets `idealClosed` back to false).

**`folderInstalledFiles`** — memoized array passed to FolderWindow:
- `MASLOWS_NEEDS.exe` (needs), `PRECEDENTS.exe` (tools), `YOU_N_WRLD.exe` (world), `PRODUCT_CATALOG.exe` (devices)
- Each has `onReset` callback (except devices) that clears localStorage and increments the relevant resetKey

**Desktop folder icon** — appears at `left: 55vw, top: 45vh` when `folder` is in installedApps. Click reopens FolderWindow.

### IdealWindow.jsx
Draggable window (`80vw × 90vh`). Internal phase routing:
```
mitosis → login → environment → uncertainty → inference → pitch
```
- `loginStep` state (`'headline' | 'webcam'`) allows returning to webcam step from environment
- Close warning modal built-in: warns progress will be lost, offers Cancel/Close
- Chrome uses `chromeColor`/`chromeBorder` props from Desktop
- Close button always `var(--yellow)` regardless of theme

### FolderWindow.tsx
Draggable window (`25vw × 45vh`). Initial position: `top: 10%, right: 2%`. Always `zIndex: 9999`. File browser UI — column headers (Name / Type / Action), rows per installed file with hover highlight and Reset button. Uses `visibility: hidden` (not `display: none`) when minimized so layout is preserved.

### Window chrome pattern (NeedsWindow, ToolsWindow, WorldWindow, DevicesWindow)
All follow the same pattern:
- Magenta title bar (`var(--magenta)`) + yellow border/buttons (`var(--yellow)`)
- `65vw × 70vh` (NeedsWindow, ToolsWindow, WorldWindow), `55vw × 70vh` (DevicesWindow)
- Draggable via ref-based mouse handlers
- `visibility: hidden` when minimized
- `visibleKey` prop on NeedsWindow/ToolsWindow increments on un-minimize to force re-measure

### Taskbar.jsx
`position: absolute, bottom: 0, right: 0, height: 3.3vh, width: 80vw`  
Left: magenta ABOUT button (rounded right corners). Center: minimized window slots (teal for IdealWindow/FolderWindow, magenta for NeedsWindow/ToolsWindow/WorldWindow/DevicesWindow). Right: teal-bright system tray with restart (⏻), monochrome toggle (◑), live clock.

---

## Desktop Ambient Components

All `position: absolute`, `zIndex: ~10–30`, non-interactive except as noted.

| Component | Position | Description |
|-----------|----------|-------------|
| `RoomBackground` | inset 0, zIndex 0 | `surveillance.webp` with `hue-rotate(270deg) brightness(0.7)` + CRT scanlines overlay |
| `Ticker` | top 0, full width, height 12vh | Magenta→purple gradient, yellow border. Scrolling affirmations text |
| `StickyNote` | draggable, two instances | Yellow sticky notes. Close button triggers red error flash ("nice try." / "you need this one.") |
| `MoodSelector` | right 1.5vw, top 15vh | "HOW ARE WE FEELING???" with :) :( >:( :'( buttons. Response fades after 4s |
| `CameraLog` | bottom 15vh, right 0 | "showing: Your Living Room" with fake motion log entries |
| `BreakingNews` | bottom 3.2vh, left 20vw | Red BREAKING NEWS bar + scrolling headline ticker. IGNORE button hides it for 5s countdown |
| `ColorScroller` | bottom 0, left 0, 20vw × 55vh | Scroll-to-cycle color cards. "Dopamine Simulator." Custom cursor (`socialscroll.png`). Unlocks new colors progressively. Plays two-oscillator ding on new unlock |
| `MusicPlayer` | right ~6vw, top 33vh | Circular scrubber, plays `affirmations_432HZ.mp3` on loop. Purple→magenta on play. Drag knob to scrub |
| `LiveIndicator` | top 15vh, left 21.5vw | Blinking green dot + "LIVE" |
| `HabitTracker` | left 0, top 12.2vh, 20vw × 32.8vh | EXERCISE (yellow) + JOURNALING (purple) habit grids. Current streak + best streak |
| `NoteToSelf` | right 25vw, top 58vh | "note to self: try clicking around!" — pointer-events none |
| `AboutWindow` | centered modal, zIndex 200 | Draggable. Project description + "Created by Jenica Liang / 2026" |
| `IdealLauncher` | various | See below |

### IdealLauncher.jsx
The entry point trigger. Phases:
1. **waiting** — listens for 2 interactions, then after 5s triggers glitch overlay
2. **Glitch** (`GlitchOverlay`) — 2.5s animation (scan lines + magenta shift + flash), then black flash
3. **popup** — Windows UAC-style dialog: "Do you want to allow this app to make changes to your device?" → IDEAL_LAUNCHER.exe, Publisher: IDEAL Systems Inc., File origin: Unknown. OK / NO buttons. "I don't remember installing this" link
4. **remember** — "You've been selected as a beta tester. IDEAL was automatically installed based on behavior patterns." YES, CONTINUE / NO THANKS
5. **gone** — calls `onAccept()`, launcher disappears
6. **idle** — after declining, shows desktop icon at top 45vh / right 40vh

Declining at any point shows "That's ok. Take your time." modal.  
If `onRestoreWindow` prop is set (IdealWindow already open/minimized), clicking the icon calls that instead.

---

## IDEAL Pages (inside IdealWindow)

### Shared components

**`PixelButton`** (`ideal/shared/PixelButton.tsx`)  
Mono font, uppercase, 0.25em tracking. Ink/bg invert on hover. `position` prop: `'solo'` (full border), `'left'` (no right border), `'right'` (full border). Used for joined button pairs (Back + Next in BottomBar).

**`BottomBar`** (`ideal/shared/BottomBar.tsx`)  
`position: absolute, bottom: 0`. Contains Back+Next joined pair (left/right position) + solo Cancel button. Thin divider line inset from sides. `backDisabled` prop grays out Back.

---

### MitosisLoader
Canvas animation. Rounded-square cell divides through 5 generations (1→2→4→8→16 cells) over 2800ms, then calls `onDone`. Uses `easeInOut`. Renders on `--bg` with `--ink` stroke.

### LoginPage
Three steps: `headline → id → webcam`  
- **Headline:** Full-screen click-anywhere to continue
- **ID:** Scramble animation resolves to `USR-XXXXXXX` (stored in `localStorage('ideal_visitor_id')`)  
- **Webcam:** Pixel-art greyscale live capture (64×64 native, scaled to 160px). Must capture before proceeding. Error: "Identity verification required to proceed." in `--red`. Stream stops after capture.  
`initialStep` prop allows returning directly to `'webcam'` from EnvironmentPage back button.

### EnvironmentPage
On mount, fires `onOpenFolder?.()` — this installs the folder and opens FolderWindow. Shows: "This is your IDEAL databank. Everything we explore together will be kept here." Static copy, BottomBar nav.

### UncertaintyPage
Static copy page. "I think we're on the same page." Copy explains IDEAL chose the user because they've been failing to improve themselves. Introduces *uncertainty* in red italic. "Three resources have been installed in your databank." BottomBar nav.

### InferencePage
Reads `localStorage('ideal_world_values')` and `localStorage('ideal_world_fears')` to infer top value + fear.  
Staggered entrance: Mito sprite at 200ms → speech bubble at 700ms → options at 1400ms.  
Speech bubble: "Based on what you've let us know, you value **[value]**, but fear **[fear]**. So what do you want to do about it?"  
Fallback if skipped: "So you didn't get through the resources. That's alright. We know you value time, and fear inefficiency."  
4 choice buttons in 2×2 grid. On select: redirect text fades in, then PixelButton "Tell me more" appears at 800ms.  
Saves `ideal_goal_option` to localStorage. Calls `onProceed()`.

### PitchPage
**Phase 1 — splash (light):**  
Typewriter "Presenting..." (150ms/char) → pause → typewriter "IDEAL" (600ms/char) → 800ms hold → fade to dark, calls `onThemeChange()` → 1200ms transition → phase 'done'

**Phase 2 — content (dark, `#1e1e1e` bg):**  
- Body text fades in at 300ms: large red `IDEAL` inline with body text "is a service that uses your unique datafied identity..."
- 4 pipeline steps stagger in at 500ms + (idx × 600ms), each with `PixelDigit` canvas animation + label. Connectors appear when next step becomes visible
- "Download Catalog" button fades in at end
- `onDownloadCatalog` callback opens DevicesWindow and adds `devices` to installedApps

**PixelDigit:** Canvas-drawn 5×7 pixel digits (1–4). Pixels fill in random order over 600ms on mount.

### DevicesPage
4 devices: Thinkband, Biopill, Sightsync, Patchwork (Ring.glb removed from this version — 4 devices not 5).  
Three.js r128 via UMD script tags (CDN: `cdn.jsdelivr.net/gh/mrdoob/three.js@r128/`).  
Model hosting: `raw.githubusercontent.com/jenicaliang/idealassets/main/`  
GLBs: `Thinkband.glb`, `Pills.glb`, `Eyedropper.glb`, `PatchScene.glb`  
Init delayed 420ms. Scale `1.3/maxDim` with per-device multipliers (`thinkband: 1.8`, `pulsepoint: 0.8`).  
Camera `z=2.8`, exposure `0.75`, autoRotate speed `1.2`. OrbitControls (no zoom/pan).  
Material overrides: Biopill Body `#b04a2f` opacity 0.7; Sightlog Body `#f0efec` opacity 0.65, Liquid `#b04a2f` opacity 0.97 renderOrder 3; Patchwork Sticky `#f0ede8` opacity 0.2 DoubleSide, Sensors cloned emissive `#b04a2f` 0.4.  
Prev/Next nav with 180ms opacity fade. Shows: data type label (red), device name, description.

### NeedsPage
Drag-and-drop Maslow's Hierarchy card sort. Rendered inside NeedsWindow (`visibleKey` prop triggers re-measure on un-minimize).  
- Canvas SVG triangle with 5 tiers. Tier labels centered, hover turns red. Tier 4 (Self-Actualization) has pixel-fill pattern, custom `?` cursor on hover
- `OnboardingOverlay` shown on mount (dark modal, "How to play")
- Cards scatter to left/right of triangle avoiding overlap (120-attempt placement algorithm)
- `generate()` called up to 2 times, adds 6–8 cards each. Excludes actualization cards from generation
- Correct drop: card removed, text appears inside tier. Wrong drop: red flash 600ms
- `autosort()` places cards sequentially with 240ms delay each
- `actDisclaimer` modal on click/hover of actualization tier: "We're still working on what uncertainties fall in this tier."
- Top-right: "How to play" pill + "?" pill (Maslow info tooltip)
- Bottom: Generate / Autosort buttons. "Sorting complete." when all placed after 2 generates

### ToolsPage
Pixel side-scroller. Rendered inside ToolsWindow (`visibleKey` prop).  
7 tools oldest→newest: Astrology (c.3000 BCE), Receipts (c.2050 BCE), Contracts (c.1750 BCE), Maps (c.600 BCE), Clocks (c.1300s), Measurements (c.1800s), Statistics (c.1900s).  
Sprites from `/sprites/` folder. Mito sprites: `mito_r.png`, `mito_l.png`, `mito_r_stretch.png`, `mito_l_stretch.png`.  
Block stacks as platforms. Physics: `GRAVITY=1900`, `JUMP_FORCE=-650`, `MITO_SPEED=168`.  
On collect: red "Obtained [label]" notification (2.2s), inventory slot fills.  
Speech bubble "Hi! I'm Mito." fades on first move. Celebration bubble "Yay! You did it!" on all collected — **5-second fixed timer** via `celebrationBubbleTimer` in `stateRef`, independent of movement.  
Hover hint "Hover over each tool to learn more." fades in after first collect.  
Act 2: after all collected, "Datafied Self" + "Assistive AI" blocks fade in. "These two new fields are what IDEAL is built on." text appears.  
Controls: ← → arrow buttons + Jump button. Also keyboard arrows + space.

### WorldPage
3×3 grid of thought cards. Click to toggle selected state.  
On click: card text replaced with "[N,NNN] others feel this way." (fabricated count). Border/text turns red.  
Selections saved to `localStorage('ideal_world_selections')`. Values/fears saved to `localStorage('ideal_world_values')` and `localStorage('ideal_world_fears')` for InferencePage.  
"You're not alone in feeling this way. We're all exhausted." fades in after first click.

---

## Key Technical Patterns

### Window dragging (all windows)
Ref-based pattern: `dragOffset` ref stores cursor offset from window corner. `onMouseMove`/`onMouseUp` stored in refs and re-assigned each render to avoid stale closure issues. `window.addEventListener` / `removeEventListener` on mousedown/mouseup.

### z-index stacking
`zCounter` ref in Desktop increments on any window focus. Each window's z-index is set to the current counter value. `FOLDER_Z = 9999` is hardcoded — FolderWindow is never overridden.

### installedApps gating
Windows only render when their id is in `installedApps`. This means React never mounts them until they're "installed." Reset keys (`needsResetKey`, `toolsResetKey`, `worldResetKey`) force full remount via the `key` prop.

### Three.js loading
UMD script injection: `loadScript()` checks for existing script tag before injecting. Scripts loaded sequentially via async/await. `loadThree()` returns `window.THREE`. Init delayed 420ms after component mounts.

### localStorage keys
- `ideal_visitor_id` — persists across sessions
- `ideal_world_selections` — selected thought card IDs
- `ideal_world_values` — array of value strings from selected cards
- `ideal_world_fears` — array of fear strings from selected cards
- `ideal_goal_option` — selected InferencePage option ID

---

## Public Assets

| File | Used by |
|------|---------|
| `surveillance.webp` | RoomBackground (hue-rotate filter) |
| `affirmations_432HZ.mp3` | MusicPlayer |
| `affirmations_432HZ_cover.webp` | MusicPlayer album art |
| `socialscroll.png` | ColorScroller custom cursor |
| `sprites/mito_r.png` | ToolsPage, InferencePage |
| `sprites/mito_l.png` | ToolsPage |
| `sprites/mito_r_stretch.png` | ToolsPage (jump frame) |
| `sprites/mito_l_stretch.png` | ToolsPage (jump frame) |
| `sprites/astrology.png` … `sprites/statistics.png` | ToolsPage tool sprites |

---

## Working Principles

- **Surgical edits only:** Never touch surrounding code, whitespace, or formatting unintentionally. Flag immediately when edits cause unintended side effects
- **Skeleton-first builds:** Structure before detail, then iterative refinement passes
- **Conceptual coherence:** Every visual and interaction choice connects back to IDEAL's critique — not decoration
- **File delivery:** Full file rewrites or exact targeted replacements. No partial diffs unless clearly scoped
- **Memory rule:** Always store important project updates, code edits, interaction details, visual/conceptual decisions, and user-specified notes in project memory after each working session