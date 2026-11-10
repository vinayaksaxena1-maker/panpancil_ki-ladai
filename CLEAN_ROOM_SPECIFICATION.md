# 🖋️ Clean-Room Specification: Pen Fight (The Last Bench Game)

## 1. System Architecture
- **Shell**: Flutter 3.x Android Application (`d:\PAnfight`)
- **Game Engine**: Three.js (r160+) 3D WebGL Renderer with custom parametric pen geometry (Cylinder, Hexagonal Prism, Triangular Prism).
- **Physics Engine**: 3D Rigid-body Physics with Rapier / 3D deterministic impulse physics for table friction, pen collision, bouncing, rolling resistance, and desk edge falloff.
- **Rendering & Assets**: Bundled locally within Flutter `assets/web/` so the game launches instantaneously, works 100% offline, and can run in both local WebView and Web browser.
- **Packaging & Delivery**: Standalone native Android APK generated via `flutter build apk`.

---

## 2. Desk & Physics Specification
- **Desk Dimensions**:
  - Width: `0.70m` (70 cm)
  - Length: `1.10m` (110 cm)
  - Thickness: `0.035m` (3.5 cm)
  - Surface: Polished classroom wooden desk with school carvings/scratches.
- **Physics Constants**:
  - Gravity: `-9.81 m/s²`
  - Table Surface Friction: `0.45`
  - Table Restitution (Bounciness): `0.20`
  - Linear Damping (Air/Sliding Drag): `1.85`
  - Angular Damping (Rolling/Spin Drag): `2.40`
  - Out of Bounds Condition: Any pen's Center of Mass drops below `desk.y - 0.02m` or leaves horizontal desk boundaries.

---

## 3. Flick Mechanics (Input & Force Transfer)
- **Aim Vector**: Drag back from pen tail or body to calculate flick impulse vector:
  - Drag Vector: $\vec{D} = \vec{P}_{\text{release}} - \vec{P}_{\text{touch}}$
  - Impulse Force: $\vec{F} = \text{clamp}(\|\vec{D}\| \times \text{ForceMultiplier}, 0, \text{MaxForce})$
  - Torque / Spin: Off-center touch generates angular impulse $\vec{\tau} = \vec{r}_{\text{offset}} \times \vec{F}$.
- **Turn Sequence**:
  1. Active player aims and flicks pen.
  2. Physics engine simulates until both pens come to rest ($\|\vec{v}\| < 0.005$ and $\|\vec{\omega}\| < 0.01$).
  3. Boundary check:
     - If Opponent pen falls off desk ➔ Active player scores round point.
     - If Active player pen falls off desk ➔ Opponent scores round point (Foul).
     - If both fall off ➔ Re-flick / Draw.
     - If neither falls off ➔ Turn passes to opponent.
  4. Match Format: Best of 5 rounds (First to 3 points wins the match).

---

## 4. Reverse-Engineered 44 Pens & Pencils Roster
Exact metrics extracted from original decompiled data:

| ID | Name | Shape | Length (m) | Radius (m) | Density (kg/m³) | Friction | Restitution | Flavour / Trait |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `reynolds-trimax` | Reynolds Trimax | Triangular | 0.146 | 0.0069 | 1556 | 0.42 | 0.20 | Triangular, stops rolling, ultimate prize |
| `reynolds-045` | Reynolds 045 | Cylinder | 0.145 | 0.0049 | 1224 | 0.35 | 0.22 | The quintessential classic ballpoint |
| `cello-butterflow` | Cello Butterflow | Cylinder | 0.146 | 0.0053 | 1331 | 0.28 | 0.18 | Smooth glider, low friction glide |
| `pilot-v5` | Pilot V5 | Cylinder | 0.142 | 0.0046 | 1128 | 0.32 | 0.25 | Fast precision strikes |
| `parker-vector` | Parker Vector | Cylinder | 0.140 | 0.0052 | 1703 | 0.30 | 0.35 | Heavyweight metallic body |
| `cello-gripper` | Cello Gripper | Cylinder | 0.145 | 0.0048 | 1409 | 0.45 | 0.20 | Rubber grip absorbs shocks |
| `reynolds-racer-gel`| Reynolds Racer Gel | Cylinder | 0.147 | 0.0062 | 1128 | 0.46 | 0.26 | Grips desk and knocks anything it meets |
| `classmate-octane` | Classmate Octane | Cylinder | 0.143 | 0.0052 | 940 | 0.34 | 0.22 | Lightweight, agile flick response |
| `linc-ocean` | Linc Ocean | Cylinder | 0.145 | 0.0051 | 1403 | 0.33 | 0.58 | Bouncy rubber tip, elastic collisions |
| `nataraj-621` | Nataraj 621 | Hexagonal | 0.176 | 0.0040 | 871 | 0.30 | 0.15 | Brand new pencil, long lever arm |
| `nataraj-621-stub` | Nataraj 621 Stub | Hexagonal | 0.074 | 0.0040 | 871 | 0.31 | 0.14 | Tiny stub, extremely hard to hit |
| `apsara-platinum` | Apsara Platinum | Hexagonal | 0.128 | 0.0040 | 871 | 0.29 | 0.16 | Extra dark lead, steady balance |
| `doms-groove` | DOMS Groove | Triangular | 0.126 | 0.0046 | 871 | 0.38 | 0.13 | Grooved dimples grip desk on landing |
| *(+31 additional models)* | Full database preserved in `assets/web/pens.json` |

---

## 5. Game Modes
1. **The Bench (Campaign Mode)**:
   - Journey through Section 9A to 9E.
   - Beat 11 unique classmates (e.g., Rohit, Bunty, Priya, Kabir, Masterji's favourite).
   - Each classmate has custom AI aggression, aim precision, and their favourite pen.
   - Grand finale: Win back the legendary **Reynolds Trimax**!
2. **Pass & Play (Local 2-Player)**:
   - Hand the phone back and forth on one desk.
   - Select any unlocked pen from your desk pouch.
3. **Practice & Bot Duel**:
   - Quick single-player practice match with instant rematch.

---

## 6. Audio-Visual Design System
- **Fonts**: Patrick Hand (Handwritten school notes) & Anton (Bold match banners).
- **Aesthetic**: School blackboard, wooden bench, brown paper cover, chalk drawings.
- **Audio Effects**:
  - Pen flick click
  - Pen-on-pen impact
  - Desk wood bounce
  - Pen falling off edge thump
  - Bell ring on victory
