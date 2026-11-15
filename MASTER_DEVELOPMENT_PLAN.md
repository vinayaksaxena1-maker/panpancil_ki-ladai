# 🎯 Production Development Plan: Pen Fight — Desk Wars
**Target Platform:** 100% Offline Android Mobile Game (Touch-First • Portrait 9:16 Layout • Flutter Container)  
**Project Sovereignty:** 100% Standalone Offline Game Repository (`D:\FInal`)  
**Game Title:** **Pen Fight: Desk Wars — The Last Bench Game**  
**Local Asset Root:** `assets/` (All 3D models, textures, rooms, audio 100% self-contained)  
**Active Development Master:** `MASTER_DEVELOPMENT_PLAN.md` & `STITCH_AI_MASTER_PROMPT.md` (Project Root)  

---

## 🛑 Strict Governance & Iron Sovereignty Rules

1. **Rule 1 (Sole Master Driver & Roadmap):**
   - Root plan hi poora roadmap chalayega (`MASTER_DEVELOPMENT_PLAN.MD` aur `STITCH_AI_MASTER_PROMPT.MD`).
   - Game architecture, 11 levels (Naya Khiladi ➔ Last Bench Legend), 6 authorized pens, 16 badges, 7 ranking tiers, aur Stitch 2D UI sirf aur sirf inhi root plans ke hisab se govern honge.
2. **Rule 2 (Silent Emergency Physics Reference Dictionary):**
   - `D:\PAnfight\CLEAN_ROOM_SPECIFICATION.MD` sirf ek silent physics reference dictionary (help desk) ki tarah background me rahega.
   - Agar kisi physics formula, Center of Mass (COM), friction constant, ya math equation me AI kahin phanse, toh wahan se help li ja sakti hai.
   - Par uska koi level, student/opponent name (e.g. Bunty/9A), ya roadmap root game me execute nahi hoga. Help lene par AI chat me explicitly formula declare karega.
3. **Rule 3 (100% Standalone Repository Sovereignty):**
   - Game ka 100% saara data, assets, code, audio, textures, physics aur documentation isi project folder (`D:\FInal`) me local rahega.
   - Root codebase me koi external import ya direct path dependency nahi hogi, taaki GitHub par push karne par yeh repository bina kisi external directory ke 100% complete aur playable rahe.
4. **Rule 4 (Step-by-Step Approval & Gate Execution):**
   - **Step-by-Step Approval:** Har ek single step complete hone ke baad AI document me us step ko `[x] COMPLETED` mark karega, live proof/receipt chat me batayega, aur User se explicitly approval mangega: *"Step X complete ho gaya hai. Kya agle step ke liye APPROVED hai?"* User ke explicitly bole bina agla step shuru **NAHI** hoga.
   - **Phase Gate Approval:** Poora Phase khatam hone par Approval Gate ka comprehensive test pass hoga aur User se final Phase Approval lena mandatory hoga.
5. **Zero Unsolicited Deviation:**
   - AI apne man se koi library, formula, pen count, ya UI structure change/skip nahi karega.
6. **No 44-Pen / External Bloat (Strict 6 Pens & 11 Levels):**
   - Strict 6 pens: *Reynolds Trimax, Reynolds 045, Cello Butterflow, Pilot V5, Nataraj 621, Apsara Platinum*.
   - Strict 11 levels: *Naya Khiladi (0 XP) ➔ Last Bench Legend (3250 XP)*.
   - Strict 16 badges & 7 ranking tiers.
7. **Clean Layer Separation:**
   - **3D World (Three.js + Rapier):** Desk, Pens, Lighting, Physics Collisions, Flick mechanics.
   - **2D UI Layer (HTML/CSS via Stitch):** Top Scoreboard, Power Bar, Menus, Cards, Trophy Cabinet.
8. **Rule 8 (Strict Mobile-First & Touch-First Architecture):**
   - Yeh game **100% Android Mobile Touchscreen (Portrait 9:16 / 9:20)** ke liye ban raha hai.
   - Koi bhi PC desktop pattern jaise physical keyboard shortcuts (`KeyR`), mouse hover effects (`:hover`), ya desktop-style horizontal bars game me nahi chalenge.
   - Saari UI elements, touch targets (minimum 48px), responsive safe areas, aur flick gestures sirf aur sirf Android mobile screen ko dhyan me rakh kar design aur build honge.

---

## 🎖️ Complete Level Ladder & Pen Inventory Specifications

### 📈 11 Levels & Progression (Kahan aur Kaise Banenge)
* **Kahan dikhega:** Player Profile aur dedicated **"Level Journey Ladder"** screen par (School merit list / classroom journey design).
* **Phases ka batwara:**
  * **Phase 2 (Visual UI - Step 2.3):** 11-step visual merit ladder screen banegi (har step tappable hoga, lock/unlocked status aur XP requirement dikhayega).
  * **Phase 4 (Logic & Storage - Step 4.3):** XP calculation engine, level-up trigger, aur `localStorage` save system implement hoga.
* **11 Levels List:**
  1. **Level 1 — Naya Khiladi:** 0 XP (Starting Tier)
  2. **Level 2 — Bench Beginner:** 100 XP
  3. **Level 3 — Pen Rookie:** 250 XP
  4. **Level 4 — Desk Challenger:** 450 XP
  5. **Level 5 — Flick Expert:** 700 XP
  6. **Level 6 — Class Champion:** 1000 XP
  7. **Level 7 — Pen Master:** 1350 XP
  8. **Level 8 — Desk Legend:** 1750 XP
  9. **Level 9 — School Star:** 2200 XP
  10. **Level 10 — Grand Champion:** 2700 XP
  11. **Level 11 — Last Bench Legend:** 3250 XP (Maximum / Grand Finale)

### 🖋️ 6 Authorized Pens & Tin Compass Box (Player Ko Apne Jeete Pen Kahan Dikhenge)
* **Kahan dikhega:** Player ko apne saare unlocked/jeete hue pens **"Tin Compass Box" (Pencil Geometry Box Screen)** ke andar 6 structured slots me dikhenge:
  * Box open hone par 6 pen cards aayenge (3D preview, Weight, Length, Friction, Accuracy stat bars, aur Special Trait).
  * Jo pen player jeet chuka hai wo unlocked aur **"Equip / Select"** karne ke liye ready rahegi.
* **Phases ka batwara:**
  * **Phase 1 (3D Mesh & Physics):** 6 Pens ki 3D geometry aur Rapier rigid-body physics (`js/pens.js`) — *Already Done*.
  * **Phase 2 (Visual UI - Step 2.3):** Nostalgic Tin Compass Box Screen aur Pen selection cards ka UI layout.
  * **Phase 4 (Logic & Dynamic Swapping - Step 4.3):** Pen unlock progression (Levels jeet kar pen unlock hona) aur selected pen ka live 3D table par spawn hona.
* **6 Pens List & Traits:**
  1. **Reynolds 045:** Classic transparent ballpoint (Default Unlocked - Balanced).
  2. **Cello Butterflow:** Smooth glider with rubber grip (Level 3 Unlock - Low Friction).
  3. **Pilot V5:** Needle-point precision pen (Level 5 Unlock - Fast Sharp Cut).
  4. **Nataraj 621:** Classic red-black wooden hexagonal pencil (Level 7 Unlock - Long Lever Arm).
  5. **Apsara Platinum:** Extra dark dense hexagonal pencil (Level 9 Unlock - High Mass Balance).
  6. **Reynolds Trimax:** Heavy triangular tank (Level 11 Grand Prize - Anti-Roll Desk Champion).

---

## 📊 Current Execution Status & Phase Health (Zameeni Haqeeqat)

Pehle external references ke confusion ki wajah se phases strictly serial order me execute nahi hue the aur kai hisse adhe chhut gaye the. Yeh raha har phase ka unvarnished audit ledger:

| Phase | Naam | Current Status | Kya Ho Chuka Hai (Done) | Kya Adha / Baki Hai (Pending Debt) |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Core 3D Desk & Physics Engine | 🟢 **100% Complete** | Rapier 120Hz WASM physics, drag flick parabola ($\text{pull}^{1.45}$), 6 procedural 3D pens (`js/pens.js`), cel-shaded outlines, vertical desk ($0.70m \times 1.00m$), out-of-bounds drop settlement, 6-pen sandbox selector, pure decoupling | None (Ready for User Gate 1 Approval) |
| **Phase 2** | Rules, Match Loop & Bot AI | ⚪ **0% (Next Active Phase)** | Physics sandbox ready | Step 2.1 Match Loop (Best of 5), Step 2.2 Mathematical Bot AI (Easy/Norm/Hard), Step 2.3 Local 2-Player Pass & Play, Step 2.4 Progression & XP Engine |
| **Phase 3** | Stitch 2D UI & Nostalgia Screens | ⚪ **0% (Waiting Gate 2)** | Design specs & reference images ready | Step 3.1 DESIGN.md, Step 3.2 Batch A (Splash/Menu), Step 3.3 Batch B (Profile/Compass Box), Step 3.4 Batch C (HUD/Scoreboard/Setup), Step 3.5 Batch D (Cabinet/Settings) |
| **Phase 4** | Audio Synthesizer & SFX | ⚪ **0% (Waiting Gate 3)** | Audio assets preserved in `assets/audio/` | Step 4.1 Standalone Web Audio synth, Step 4.2 SFX slotting to live match events, Step 4.3 Classroom ambiance loop |
| **Phase 5** | Flutter Android APK Packaging | ⚪ **0% (Not Started)** | None (Strict approval gate rule ke tehat intentionally untouched) | Flutter webview container, asset bundling, Android back button, release APK build |

---

## 🗺️ Master Phase Map & Approval Gates

```mermaid
flowchart TD
    G0[Gate 0: Architecture Setup] --> P1[Phase 1: 3D Physics & Flick Engine]
    P1 --> G1{Approval Gate 1: Core Fun & Physics}
    G1 -- Approved --> P2[Phase 2: Rules, Match Loop & Bot AI]
    P2 --> G2{Approval Gate 2: Match Playability & AI}
    G2 -- Approved --> P3[Phase 3: Stitch AI 2D Design System & Screens]
    P3 --> G3{Approval Gate 3: UI Visuals & HUD}
    G3 -- Approved --> P4[Phase 4: Web Audio Synth & Sound FX]
    P4 --> G4{Approval Gate 4: Sound Feedback}
    G4 -- Approved --> P5[Phase 5: Flutter Android APK Packaging & QA]
    P5 --> G5[Final Acceptance]
```

---

## 📱 Mobile-First Sovereignty (Kahan AI Ne Web Ka Kaam Kiya Tha Aur Kahan Sudhaar Hoga)

Yeh game **100% Android Mobile Touchscreen (Portrait 9:16 Layout)** ke liye ban raha hai. Purani AI ne kahan-kahan desktop/web ke patterns inject kiye the, uska exact audit:

1. **PC Keyboard Shortcut (`js/main.js`):**
   * Physical keyboard listener `window.addEventListener('keydown', e => e.code === 'KeyR')` lagaya tha, jabki mobile device me physical keyboard nahi hota.
2. **Desktop HTML `<select>` Dropdowns (`index.html`):**
   * Top bar me standard browser desktop dropdowns lagaye the, jabki mobile UI me thumb-friendly touch cards ya bottom-sheets hoti hain.
3. **PC Landscape Camera Viewport (`js/main.js`):**
   * Camera calculation me `if (aspect >= 1.2)` (PC/Laptop widescreen) ko priority di gayi thi, jabki primary target mobile portrait vertical desk view hai.
4. **Horizontal Overcrowded Header (`index.html`):**
   * Top bar me 5-6 buttons aur controls ek hi line me horizontal flex the jo wide laptop screen ke hisab se the, vertical mobile screen par wo cut/squeeze hote hain.
5. **CSS `:hover` Pseudo-Classes (`index.html`):**
   * Desktop mouse hover states lagaye the jo mobile touch par sticky tap bug ban jate hain.

**Why WebGL/HTML was used:**
Architecture me Three.js + Rapier WASM ko Flutter Android container (`webview_flutter`) ke andar offline APK ke roop me package kiya ja raha hai (Phase 5). Lekin iska UI aur interaction **Desktop Web jaisa nahi, balki 100% Mobile Touch-First** hoga.

---

## 🧭 Feature-to-Phase Mapping (Easy/Normal/Hard & Scorecard Ka Asli Ghar)

Aapke dono sawalon ki poori clarity yeh hai ki yeh dono features kis-kis phase me aane the aur AI ne kahan confusion kiya:

### 1. 🎚️ Easy / Normal / Hard (Difficulty Toggle)
* **AI Logic & Kinematics (Engine me kahan chalega):** **Phase 2 (Step 2.2 — Mathematical PCOpponentController)**
  * *Easy:* High aim error spread ($\pm 16^\circ$), weak punch speed.
  * *Normal:* Realistic human error spread ($\pm 6.5^\circ$), balanced approach.
  * *Hard:* Sharp aim ($\pm 3^\circ$), high speed, aur 60% spin cut-shots.
* **Visual UI (Kahan dikhega):** **Phase 3 (Step 3.4 — Match Setup Screen)**
  * Stitch AI jab match setup screen banayega, wahan player friendly classmate card ke sath **Easy / Normal / Hard** chunega.
* **Phase 1 Resolution & Clean-up (Sahi Kiya Gaya):** Phase 1 ke sandbox se Easy/Norm/Hard buttons aur out-of-order difficulty logic ko 100% hata diya gaya hai. Phase 1 ab sirf pure 3D physics verification ke liye hai. Yeh feature apne nirdharit Phase 2 (Bot Kinematics) aur Phase 3 (UI Setup) me implement hoga.

### 2. 📋 Score Card (Scoreboard & Match Result)
* **Match Rules & Score Counting (State Machine):** **Phase 2 (Step 2.1 — Match Loop State Machine)**
  * Best of 5 format (first to 3 wins), double fall = re-flick, round won logic, aur result save.
* **Visual 2D HUD & Result Modal (Kahan dikhega):** **Phase 3 (Step 3.4 — HUD & Gameplay Overlays)**
  * Transparent top scoreboard (P1 avatar vs Opponent avatar, round indicators, selected pen names) aur Match Win/Loss certificate modal Stitch AI banayega.
* **Phase 1 Resolution & Clean-up (Sahi Kiya Gaya):** 3D blackboard aur HUD se Best-of-5 scoring, player/opponent KO counters, aur result modals ko 100% decouple aur remove kar diya gaya hai. Blackboard par ab sirf pure physics duel chalk info aati hai. Scoreboard ka poora visual card Phase 3 (Step 3.4) aur round-counting logic Phase 2 (Step 2.1) me banegi.

---

## 📋 Phase-by-Phase Detailed Breakdown

### 🧱 Phase 1: Core 3D Desk, Pens & Rapier Physics Engine
*Goal: 1 single barebones page jisme desk par do pen flick ho sakein aur physics realistic feel de.*

> [!IMPORTANT]
> **Pen Design & 3D Geometry Division of Labor:**
> - **Three.js Code (Hamara Engine):** 6 Pens ki actual **3D Parametric Meshes** (Hexagonal body for Nataraj/Apsara, Cylindrical plastic for Trimax/045/Butterflow, Cone nib, metal clip, cap geometry) aur unke exact physics colliders hum Three.js + Rapier me procedural code se generate karenge (zero external 3D file bloat, 100% offline).
> - **Stitch AI (2D UI Cards):** Stitch in pens ke 2D presentation cards banayega (Pen selection menu, stat bars: Weight, Accuracy, Friction, Description, aur Pencil Box layout).

- [x] **Step 1.1 (COMPLETED):** Setup self-contained local web container (`index.html`, Three.js r160, `@dimforge/rapier3d-compat` WASM).
- [x] **Step 1.2 (COMPLETED):** Procedural Classroom Desk (`0.70m x 1.00m x 0.030m`) with wood finish and boundary colliders.
- [x] **Step 1.3 (COMPLETED):** 3D Pen Geometries for Player & Opponent:
  - Custom weight distribution: Cap/Tip Center of Mass (COM) offset.
  - Rapier RigidBody setup (Cylinder + Cone nib).
- [x] **Step 1.4 (COMPLETED):** Flick Drag Mechanics:
  - Backwards touch/drag gesture vector $\vec{D}$.
  - Force clamping + Off-center torque impulse $\vec{\tau} = \vec{r}_{\text{offset}} \times \vec{F}$.
- [x] **Step 1.5 (COMPLETED):** Desk Edge Teetering & Out-of-Bounds Detection:
  - Velocity rest threshold check ($\|\vec{v}\| < 0.015$, $\|\vec{\omega}\| < 0.08$).
  - Pen drops below $desk.y - 0.02m$ ➔ Fall detection and settlement timer.
- [x] **Step 1.6 (COMPLETED):** Pure Sequencing Quarantine & Reset to Zero:
  - Premature Phase 3 (audio hooks) aur Phase 4 (match loops, fake XP modals) ko Phase 1 ke core physics engine se cleanly decouple kar diya gaya.
  - Live 6-Pen sandbox selector HUD me integrate kiya gaya jisse user sabhi 6 pens (Reynolds 045, Trimax, Butterflow, Pilot V5, Nataraj 621, Apsara Platinum) ki physical bounciness aur roll resistance live test kar sake. Keyboard 'R' shortcut se instant reset enabled.
- 🎯 **APPROVAL GATE 1 (CURRENT VERIFICATION):** User runs and tests flicking on browser/mobile. "Kya pen ka slide, takkar aur kone par latakna real school pen-fight jaisa laga? Zero UI/audio bloat."

---

### 🧠 Phase 2: Rules, Match Loop & Bot AI
*(Current Status: ⚪ 0% — Next Active Phase after Gate 1 Approval)*
*Goal: Turn system, Best-of-5 rounds, mathematical Bot AI, 2-player Pass & Play, aur 11-level XP progression.*

- [ ] **Step 2.1:** Match Loop State Machine:
  - Turn order flow (Player turn ➔ Opponent turn ➔ Resolution).
  - Best-of-5 format (first to 3 round wins).
  - Double fall = re-flick, round winner score increment, match completion trigger.
- [ ] **Step 2.2:** Mathematical `PCOpponentController`:
  - Raycasting target vector $\vec{D}_{\text{target}}$ from Bot pen to Player pen.
  - 3 Difficulty Tiers:
    - *Easy:* High angular spread ($\pm 16^\circ$), weak force, low tactical awareness.
    - *Normal:* Human-like spread ($\pm 6.5^\circ$), balanced force calculation.
    - *Hard:* Razor aim ($\pm 3^\circ$), edge cut-shots, aggressive torque spin.
- [ ] **Step 2.3:** Local 2-Player "Pass & Play" Engine:
  - Ek hi phone par 2 dost khel sakein bina internet ke.
  - Player 1 (Bottom desk) aur Player 2 (Top desk) alternate turns with 180° flick interaction.
- [ ] **Step 2.4:** Local Persistence & Progression Engine (`localStorage`):
  - 11-Level XP ladder ($0 \rightarrow 3250$ XP) with match win/loss XP awards.
  - 16 Badges ledger with automatic unlock triggers.
  - Dynamic pen unlock system based on XP level.
- 🎯 **APPROVAL GATE 2:** Sandbox me Bot ke khilaf poora Best-of-5 match khel kar test karna. "Kya Bot realistic shots le raha hai aur round score/winner properly determine ho raha hai?"

---

### 🎨 Phase 3: Stitch AI 2D UI & Nostalgia Visual System
*(Current Status: ⚪ 0% — Execution starts after Phase 2 Gate Approval)*
*Goal: Desi Indian School Nostalgia UI layers banwana using tumhari existing images, aur unhe Phase 2 ke live engine se wire karna.*

- [ ] **Step 3.1:** Author `DESIGN.md` (Design tokens: Blackboard Green `#183B32`, Notebook Cream `#F3E5C8`, Desk Wood `#70452E`, typography and card frames matching nostalgic 90s school themes).
- [ ] **Step 3.2:** Batch A (Core Flow Screens):
  - Splash screen + First Launch onboarding / Admission Form.
  - Main Menu Home Screen (with hero desk duel illustration, Mode selection: Story / Pass & Play / Practice).
- [ ] **Step 3.3:** Batch B (Identity, Collection & Levels):
  - Player Profile report card & 11-Level Merit Ladder visual journey ($0 \rightarrow 3250$ XP).
  - Pen Collection Tin Compass Box Screen (6 pen slots, stat bars, equip action).
- [ ] **Step 3.4:** Batch C (HUD, Match Setup & Score Overlays):
  - Transparent in-game HUD (Top Scoreboard connected to Phase 2 state machine, turn badge, power meter).
  - Play vs PC Match Setup (Classmate card, Easy/Normal/Hard selector).
  - Pause menu + Match Win/Loss result certificate.
- [ ] **Step 3.5:** Batch D (Cabinet & Settings):
  - 16-Badge Trophy Cabinet shelf (monochrome locked vs enamel pin earned states).
  - 7 Ranking tiers details + Offline Settings.
- 🎯 **APPROVAL GATE 3:** All 11 screens visually inspected. "Kya theme 90s classroom jaisi hai aur HUD transparent Three.js canvas ke sath match kar raha hai?"

---

### 🔊 Phase 4: Audio Synthesis & Sound Effects
*(Current Status: ⚪ Reset to 0% — Execution starts after Phase 3 Gate Approval)*
*Goal: Zero-latency tactile feedback without broken remote URLs, connecting sound triggers to live Phase 2 match events.*

- [ ] **Step 4.1:** 20-line standalone Web Audio API synthesizer for instant mechanical audio (`synth_flick`, `synth_clack`, `synth_thud`).
- [ ] **Step 4.2:** Local assets slotting for the 10 core sounds (`assets/audio/`: flick, impact, slide, fall, UI click, round win, round loss, victory bell, level up, badge unlock).
- [ ] **Step 4.3:** Sound manager with audio toggles, ambient classroom chatter loop, & fallback.
- 🎯 **APPROVAL GATE 4:** Sound triggers verified during flick, collision, button clicks, round win, and match victory.

---

### 📱 Phase 5: Flutter Android APK Packaging & Delivery
*(Current Status: ⚪ 0% — Strict Gate-by-Gate Policy)*
*Goal: 60 FPS offline Android APK.*

- [ ] **Step 5.1:** Flutter project integration (`webview_flutter` container).
- [ ] **Step 5.2:** Bundle all WebGL, Rapier WASM, HTML, and assets in `assets/web/`.
- [ ] **Step 5.3:** Android back-button handling, full-screen immersive mode, and touch calibration.
- [ ] **Step 5.4:** Build Release APK (`flutter build apk --release`).
- 🎯 **APPROVAL GATE 5:** Final APK installed and verified on physical Android phone.
