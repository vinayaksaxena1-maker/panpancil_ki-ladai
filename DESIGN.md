# 🎨 PEN FIGHT: DESK WARS — MASTER DESIGN SYSTEM (`DESIGN.md`)
**Aesthetic Theme:** 90s Indian Classroom Nostalgia × High-Energy Arcade Juice × Sketchbook Doodle UI  
**Target Platform:** Android Touchscreen Mobile (Portrait 9:16 / 9:20 • 360x800 to 412x915)  
**Design System Master:** `D:\FInal\DESIGN.md` (Root Authority for Stitch AI)  
**Version:** 1.0.0 (Official Production Standard)

---

## 1. 🌈 COLOR PALETTE & SEMANTIC DESIGN TOKENS

```css
:root {
  /* --- Authentic 90s Classroom Heritage --- */
  --color-blackboard-dark: #0f241f;    /* Deep chalkboard shadow & panel backing */
  --color-blackboard-surface: #183b32; /* Classroom chalkboard green surface */
  --color-chalk-white: #f5f5f0;        /* Pure dusty chalk text */
  --color-chalk-yellow: #fde047;       /* Chalk highlight text & doodles */
  --color-notebook-cream: #faf5e8;     /* Ruled notebook paper background */
  --color-notebook-ruled: #cbd5e1;     /* Faint notebook horizontal rule line */
  --color-margin-red: #ef4444;         /* Teacher's red margin line & checked ticks */
  --color-desk-wood: #70452e;          /* Varnished teak classroom dual-bench */
  --color-desk-bevel: #452a1c;         /* Desk edge shadow / bevel */

  /* --- Arcade / Hyper-Casual Juicy Accents --- */
  --color-ink-blue: #1e40af;           /* Reynolds 045 classic ballpoint blue ink */
  --color-ink-blue-glow: #3b82f6;      /* Trimax glowing neon fluid chamber */
  --color-arcade-gold: #f59e0b;        /* Trophy gold / Rank XP fill */
  --color-arcade-amber: #d97706;       /* 3D button base depth shadow */
  --color-arcade-crimson: #dc2626;     /* Danger / Knockout banner / Fall alert */
  --color-arcade-green: #16a34a;       /* Victory / Your Turn / Equipped badge */
  --color-arcade-dark: #111827;        /* 2.5px - 3.5px solid dark outline stroke */

  /* --- Slingshot Trajectory Force Tokens --- */
  --force-low: #22c55e;                /* 0% - 40% Gentle approach / glider push */
  --force-mid: #f59e0b;                /* 41% - 75% Balanced competition duel punch */
  --force-max: #ef4444;                /* 76% - 100% Full power explosive rocket */

  /* --- Tactile 3D Depth Shadows --- */
  --shadow-btn-gold: 0 6px 0 #b45309, 0 8px 14px rgba(0, 0, 0, 0.4);
  --shadow-btn-green: 0 6px 0 #15803d, 0 8px 14px rgba(0, 0, 0, 0.4);
  --shadow-btn-blue: 0 6px 0 #1d4ed8, 0 8px 14px rgba(0, 0, 0, 0.4);
  --shadow-btn-red: 0 6px 0 #991b1b, 0 8px 14px rgba(0, 0, 0, 0.4);
  --shadow-btn-pressed: 0 2px 0 currentColor, 0 3px 6px rgba(0, 0, 0, 0.3);
}
```

---

## 2. 🔤 TYPOGRAPHY & SKETCHBOOK / DOODLE UI SYSTEM

All main titles, game logos, screen headers, badges, and score announcements use an authentic **"Sketchbook / Rough Backbencher Doodle"** aesthetic—as if hand-drawn by a student with ballpoint pens and markers on the back pages of a school rough notebook.

### Typography Hierarchy:
- **Doodle Title Font (Game Logos & Main Headers):** `Permanent Marker`, `Caveat Brush`, `Gochi Hand`, `Fredoka One`, cursive. Hand-sketched, slightly tilted, bold marker strokes with high personality.
- **Classroom Chalkboard & Notes Script:** `Caveat`, `Comic Neue`, `Chalkboard SE`, cursive. For teacher chits, blackboard thoughts, roll numbers, and dialogs.
- **Card Body & Numerical Stats:** `Inter`, system-ui, -apple-system, sans-serif (Clean, bold 700-800 for instant legibility).

### Doodle Title & Text Stroke Rules:
```css
/* Sketchbook / Doodle Headline with Ballpoint Hatch Shadow */
.title-doodle {
  font-family: 'Permanent Marker', 'Caveat Brush', 'Fredoka', cursive, sans-serif;
  font-weight: 900;
  color: #fde047; /* Chalk yellow or White */
  -webkit-text-stroke: 2.5px #111827;
  text-shadow: 
    3px 3px 0 #111827,
    5px 5px 0 rgba(30, 64, 175, 0.45), /* Blue ink scribble shadow */
    0 8px 16px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
  transform: rotate(-1.5deg); /* Organic hand-sketched slight tilt */
  display: inline-block;
}

/* Red Marker Doodle Stamp */
.text-doodle-red {
  color: #ef4444;
  -webkit-text-stroke: 2px #7f1d1d;
  text-shadow: 2px 2px 0 #7f1d1d;
}

/* Blue Ballpoint Doodle Scribble */
.text-doodle-blue {
  color: #3b82f6;
  -webkit-text-stroke: 2px #1e3a8a;
  text-shadow: 2px 2px 0 #1e3a8a;
}

/* General Arcade Dark Stroke Utility */
.text-arcade-stroke {
  font-family: 'Fredoka', 'Titan One', sans-serif;
  -webkit-text-stroke: 2.5px #111827;
  text-shadow: 0 3px 0 #111827, 0 5px 8px rgba(0, 0, 0, 0.45);
  color: #ffffff;
  font-weight: 900;
}
```

---

## 3. ✏️ DOODLE UI EMBELLISHMENTS & SKETCH PATTERNS

Every screen incorporates rough hand-drawn sketchbook embellishments that evoke classroom nostalgia:

### 1. Organic Hand-Sketched Borders (`.border-doodle`)
Instead of rigid geometric boxes, doodle containers use irregular, slightly wobbly border curves:
```css
.border-doodle {
  border: 3px solid #111827;
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px; /* Hand-drawn box */
  box-shadow: 4px 6px 0 #111827;
}
```

### 2. Hand-Drawn Squiggly Underlines (`.underline-doodle`)
Titles feature double-stroked, wavy marker underlines underneath:
```css
.underline-doodle {
  position: relative;
  display: inline-block;
}
.underline-doodle::after {
  content: "";
  position: absolute;
  left: -5%;
  bottom: -6px;
  width: 110%;
  height: 4px;
  background: #ef4444;
  border-radius: 4px;
  transform: rotate(-1.2deg);
}
```

### 3. Back-of-Notebook Doodles & Stamps
- **Hand-Drawn Stars (⭐):** Chunky 5-point doodle stars drawn with ballpoint pen lines for rank XP and stage ratings.
- **Crossed Pen Swords (⚔️):** Hand-sketched 045 vs Trimax crossed duel doodle.
- **Lightning Bolts (⚡):** Rough jagged lightning sketch for critical knockout hits.
- **Teacher Red Checked Tick (✔️):** Bold, authentic red ink flourish for completed stages.
- **Circled Doodle Badges:** Uneven double-circle ballpoint pen rings circling student roll numbers and turn badges.

---

## 4. 👆 TACTILE 3D PUSH BUTTONS

Every interactive button is styled like a physical arcade machine button or collectible toy push piece:
- **Border:** `3px solid #111827`
- **Corner Radius:** `16px` (Pill / rounded rectangular)
- **Base 3D Depth Shadow:** `box-shadow: 0 6px 0 [darker-shade], 0 8px 14px rgba(0, 0, 0, 0.35)`
- **Active Touch State:** Sinks down instantly by 4px on tap (`transform: translateY(4px); box-shadow: 0 2px 0 [darker-shade];`)
- **Zero Tap Delay:** Mandatory `touch-action: manipulation;`

```css
.btn-arcade-3d {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 10px 20px;
  border-radius: 16px;
  border: 3px solid #111827;
  font-weight: 800;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}

/* Primary Gold Button */
.btn-arcade-gold {
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
  color: #111827;
  box-shadow: 0 6px 0 #b45309, 0 8px 14px rgba(0, 0, 0, 0.35);
}

.btn-arcade-gold:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #b45309, 0 3px 6px rgba(0, 0, 0, 0.3);
}

/* Victory Green Button */
.btn-arcade-green {
  background: linear-gradient(180deg, #4ade80 0%, #16a34a 100%);
  color: #ffffff;
  box-shadow: 0 6px 0 #15803d, 0 8px 14px rgba(0, 0, 0, 0.35);
}

.btn-arcade-green:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #15803d, 0 3px 6px rgba(0, 0, 0, 0.3);
}

/* Duel Blue Button */
.btn-arcade-blue {
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 6px 0 #1d4ed8, 0 8px 14px rgba(0, 0, 0, 0.35);
}

.btn-arcade-blue:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #1d4ed8, 0 3px 6px rgba(0, 0, 0, 0.3);
}

/* Red Danger / Reset Button */
.btn-arcade-red {
  background: linear-gradient(180deg, #f87171 0%, #dc2626 100%);
  color: #ffffff;
  box-shadow: 0 6px 0 #991b1b, 0 8px 14px rgba(0, 0, 0, 0.35);
}

.btn-arcade-red:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #991b1b, 0 3px 6px rgba(0, 0, 0, 0.3);
}
```

---

## 5. 📦 CONTAINER CARDS & NOSTALGIA FRAMES

### 1. The Ruled Notebook Card (`.card-notebook`)
- Background: Warm cream paper (`#FAF5E8`) with faint horizontal lines (`#CBD5E1`) and a vertical red margin line (`#EF4444`).
- Border: `3px solid #111827` with rounded 20px corners and an offset 8px bottom 3D shadow.
- Used for: Student ID cards, stage chit modals, pause drawers, result certificates.

### 2. The Tin Compass Box Frame (`.card-tin-box`)
- Background: Brushed steel / metallic aluminum gradient (`#E2E8F0` ➔ `#CBD5E1`) with embossed metallic rim highlights.
- Border: `4px solid #334155` with rounded 24px corners.
- Used for: 6-Pen collection menu, pen equipping slots, pen stat comparisons.

---

## 6. 🎪 FLOATING BANNERS & SPRING ANIMATION

Match events enter with an exaggerated, high-energy spring bounce:
```css
@keyframes springPopIn {
  0% {
    opacity: 0;
    transform: translate3d(-50%, -50%, 0) scale(0.35);
  }
  65% {
    opacity: 1;
    transform: translate3d(-50%, -50%, 0) scale(1.18);
  }
  85% {
    transform: translate3d(-50%, -50%, 0) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translate3d(-50%, -50%, 0) scale(1.0);
  }
}

.banner-spring {
  animation: springPopIn 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  will-change: transform, opacity;
}
```

Banner Pill Variants:
- `"YOUR TURN! 🎯"` — Green gradient pill with glowing outline
- `"ROUND WON! 🎉"` — Gold amber gradient with celebratory stars
- `"OUT OF DESK! 💥"` — Red hazard pill with warning exclamation
- `"KNOCKOUT! ⚡"` — Pulsating crimson banner with electrical sparks

---

## 7. 🎯 COLOR-SHIFTING SLINGSHOT ARC

Touch-and-drag ke samay pen ke piche trajectory aur power-fill dynamic color-shift karegi:
* **0% - 40% (Gentle Glider):** Neon Green (`#22C55E`)
* **41% - 75% (Duel Punch):** Amber Gold (`#F59E0B`)
* **76% - 100% (Explosive Blast):** Crimson Red (`#EF4444`) with subtle pulse vibration

---

## 8. 📱 MOBILE-FIRST TOUCH & PERFORMANCE INVARIANTS

1. **Touch Target Size:** Minimum `48px x 48px` on all tappable elements.
2. **Safe Area Insets:** `padding-top: max(16px, env(safe-area-inset-top)); padding-bottom: max(16px, env(safe-area-inset-bottom));`.
3. **Zero DOM Jank (60 FPS Lock):**
   - Strictly avoid animating `top`, `left`, `width`, or `height`.
   - All animated elements, drawers, and modal transitions must strictly use GPU-accelerated `transform: translate3d()` and `opacity`.
4. **100% Offline Google Play Families Compliance:** Zero external network web font calls or remote analytics. All fonts and textures bundled locally.
