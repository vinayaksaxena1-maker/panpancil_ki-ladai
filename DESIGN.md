# DESIGN SYSTEM: Pen Fight — Desk Wars
**Aesthetic:** 90s Indian Classroom Nostalgia × High-Energy Arcade Juice (Hot Wheels / Subway Surfers tactile feel)  
**Target Platform:** Mobile-First Touchscreen (Portrait 9:16 / 9:20 • 360x800 to 412x915)  
**Design System Version:** 1.0.0 (Stitch AI Master Foundation)

---

## 1. 🎨 COLOR PALETTE & DESIGN TOKENS

The visual language bridges authentic 90s Indian classroom memories (teak desks, dusty green chalkboards, ruled notebooks) with vibrant, hyper-casual tactile arcade finishes.

### Primary Heritage Colors
- `--color-blackboard-dark`: `#0F241F` — Deep chalkboard shadow & panel backing
- `--color-blackboard-surface`: `#183B32` — Classroom chalkboard green surface
- `--color-chalk-white`: `#F5F5F0` — Dusty handwritten chalk text
- `--color-chalk-yellow`: `#FDE047` — Chalkboard highlights & accented notes
- `--color-notebook-cream`: `#FAF5E8` — Ruled paper card background
- `--color-notebook-ruled`: `#CBD5E1` — Faint blue/gray horizontal notebook guidelines
- `--color-margin-red`: `#EF4444` — Teacher's red ink margin lines & checked ticks
- `--color-desk-wood`: `#70452E` — Varnished dual-bench teak desk surface
- `--color-desk-bevel`: `#452A1C` — Wooden desk shadow and chamfered edges

### Arcade Juicy Accent Colors
- `--color-ink-blue`: `#1E40AF` — Reynolds 045 classic ballpoint blue ink
- `--color-ink-blue-glow`: `#3B82F6` — Glowing neon fluid chamber of the Reynolds Trimax
- `--color-arcade-gold`: `#F59E0B` — Trophy gold, star ratings, XP progression fill
- `--color-arcade-amber`: `#D97706` — 3D button base depth shadow for gold actions
- `--color-arcade-crimson`: `#DC2626` — Danger alerts, knockout banners, edge fall warnings
- `--color-arcade-green`: `#16A34A` — Victory state, "Your Turn" indicator, equip status
- `--color-arcade-dark`: `#111827` — Solid 2.5px - 3.5px dark outline strokes & borders

### Slingshot Force Meter Tokens
- `--force-low`: `#22C55E` — Gentle approach / glider push (0% - 40%)
- `--force-mid`: `#F59E0B` — Balanced competition duel strike (41% - 75%)
- `--force-max`: `#EF4444` — Explosive knockout impulse with subtle vibration (76% - 100%)

---

## 2. 🔤 TYPOGRAPHY & SKETCHBOOK / DOODLE UI SYSTEM

All titles, game logos, screen headers, badges, and score announcements use an authentic **"Sketchbook / Rough Backbencher Doodle"** aesthetic—as if hand-drawn by a 90s student with ballpoint pens and pencils on the back pages of a rough notebook.

### Typography Hierarchy:
- **Doodle Title Font (Primary Game Logo & Big Headers):** `Permanent Marker`, `Caveat Brush`, `Gochi Hand`, `Fredoka One`, cursive. Hand-sketched, slightly tilted, bold marker strokes with high personality.
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
  bottom: -8px;
  width: 110%;
  height: 6px;
  background: radial-gradient(circle, #ef4444 20%, transparent 20%);
  background-size: 8px 6px;
  border-bottom: 3px solid #ef4444;
  transform: rotate(-1deg);
}
```

### 3. Back-of-Notebook Doodles & Stamps
- **Hand-Drawn Stars (⭐):** Chunky 5-point doodle stars drawn with ballpoint pen lines for rank XP and stage ratings.
- **Crossed Pen Swords (⚔️):** Hand-sketched 045 vs Trimax crossed duel doodle.
- **Lightning Bolts (⚡):** Rough jagged lightning sketch for critical knockout hits.
- **Teacher Red Checked Tick (✔️):** Bold, authentic red ink flourish for completed stages.
- **Circled Doodle Badges:** Uneven double-circle ballpoint pen rings circling student roll numbers and turn badges.

---

## 3. 👆 TACTILE 3D PUSH BUTTONS

Every interactive button is styled like a physical arcade machine button or collectible toy push piece:
- **Border:** `3px solid #111827`
- **Corner Radius:** `16px` (Pill / rounded rectangular)
- **Base 3D Depth Shadow:** `box-shadow: 0 6px 0 [darker-shade], 0 8px 14px rgba(0,0,0,0.35)`
- **Active Touch State:** Sinks down instantly by 4px on tap (`transform: translateY(4px); box-shadow: 0 2px 0 [darker-shade];`)
- **Zero Tap Delay:** Mandatory `touch-action: manipulation;`

### Button Hierarchy:
1. **Primary Gold Button (`.btn-arcade-gold`):** High-priority actions ("PLAY MATCH ⚔️", "START DUEL").
   - Gradient: `#FCD34D` ➔ `#F59E0B` | Depth: `#B45309`
2. **Victory Green Button (`.btn-arcade-green`):** Confirmations & unlocks ("EQUIP PEN ✔️", "CLAIM REWARD").
   - Gradient: `#4ADE80` ➔ `#16A34A` | Depth: `#15803D`
3. **Duel Blue Button (`.btn-arcade-blue`):** Mode selectors & secondary actions ("PASS & PLAY 👥", "BATTLE").
   - Gradient: `#60A5FA` ➔ `#2563EB` | Depth: `#1D4ED8`
4. **Red Danger Button (`.btn-arcade-red`):** Resets & exits ("RESET 🔄", "QUIT").
   - Gradient: `#F87171` ➔ `#DC2626` | Depth: `#991B1B`

---

## 4. 📦 CONTAINER CARDS & NOSTALGIA FRAMES

### 1. The Ruled Notebook Card (`.card-notebook`)
- Background: Warm cream paper (`#FAF5E8`) with faint horizontal lines (`#CBD5E1`) and a vertical red margin line (`#EF4444`).
- Border: `3px solid #111827` with rounded 20px corners and an offset 8px bottom 3D shadow.
- Used for: Student ID cards, stage chit modals, pause drawers, result certificates.

### 2. The Tin Compass Box Frame (`.card-tin-box`)
- Background: Brushed steel / metallic aluminum gradient (`#E2E8F0` ➔ `#CBD5E1`) with embossed metallic rim highlights.
- Border: `4px solid #334155` with rounded 24px corners.
- Used for: 6-Pen collection menu, pen equipping slots, pen stat comparisons.

---

## 5. 🎪 FLOATING BANNERS & SPRING ANIMATION

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
```
Banner Pill Variants:
- `"YOUR TURN! 🎯"` — Green gradient pill with glowing outline
- `"ROUND WON! 🎉"` — Gold amber gradient with celebratory stars
- `"OUT OF DESK! 💥"` — Red hazard pill with warning exclamation
- `"KNOCKOUT! ⚡"` — Pulsating crimson banner with electrical sparks

---

## 6. 📱 MOBILE-FIRST TOUCH & PERFORMANCE INVARIANTS

1. **Touch Target Size:** Minimum `48px x 48px` on all tappable elements.
2. **Safe Area Insets:** `padding-top: max(16px, env(safe-area-inset-top)); padding-bottom: max(16px, env(safe-area-inset-bottom));`.
3. **Zero DOM Jank (60 FPS Lock):**
   - Strictly avoid animating `top`, `left`, `width`, or `height`.
   - All animated elements, drawers, and modal transitions must strictly use GPU-accelerated `transform: translate3d()` and `opacity`.
4. **100% Offline Google Play Families Compliance:** Zero external network web font calls or remote analytics. All fonts and textures bundled locally.
