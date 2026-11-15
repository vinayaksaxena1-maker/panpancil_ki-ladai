# STITCH AI MASTER PROMPT — COMPLETE 3D PEN FIGHT GAME UI & VISUAL THEME

You are designing the complete visual experience for a mobile game called **“3D Pen Fight — The Last Bench Game.”** Create a consistent, production-oriented design system and all Phase 1 screens, states, reusable components, and 2D visual assets. This is not a request for a few sample screens. Design the entire game from first launch to settings and every important in-game state.

## 1. Product and technical context

- Target: Android mobile game, primarily portrait UI; gameplay must also support a practical landscape layout where the game uses landscape.
- Existing app architecture: Flutter shell + local HTML/CSS/JavaScript UI in WebView + Three.js 3D game canvas + Rapier physics.
- Your responsibility: the complete **2D visual design and UI layer**—all screens, HUD, overlays, menus, badges, profile/level/ranking presentation, icons, decorative illustrations, UI textures, and UI interaction prototype.
- Do NOT build or replace the 3D physics engine.
- Do NOT create a second standalone game.
- Do NOT fake the actual 3D pens/table as flat HTML illustrations on the gameplay screen. The live Three.js canvas supplies the real 3D gameplay; your HTML HUD sits transparently above it.
- Use local placeholder paths for art that will be supplied separately. Clearly name each needed asset.
- Design for offline use. No remote APIs, login, cloud, online multiplayer, external CDNs, external font URLs, or network-dependent UI.

## 2. Overall visual theme: “Desi Indian School Nostalgia”

Create a premium, warm, playful, nostalgic Indian-school visual identity, inspired by an Indian classroom and last-bench culture. It should feel like a beautifully art-directed modern game, not a generic dashboard or a childish cartoon app.

### Palette
- Blackboard green `#183B32`
- Chalk off-white `#F4F0E4`
- Notebook cream `#F3E5C8`
- Kraft brown `#B98555`
- Dark desk wood `#70452E`
- Light desk wood `#B77A49`
- Ink navy `#233B59`
- Uniform navy `#243B5A`
- Chalk yellow `#F2C75C`
- Victory green `#3F8B61`
- Alert red `#C85B4A`

Use the palette consistently, with sufficient contrast. Use dark green for important panels, cream paper for content cards, wood for selected feature surfaces, navy for player/stat elements, yellow for achievement accents, green for wins, and red only for losses/destructive actions.

### Texture and motifs
Use restrained paper grain, ruled notebook lines, brown-paper book-cover texture, chalkboard texture, chalk doodles, pencil underlines, handwritten margin notes, school stamps, report-card borders, merit-list motifs, old wooden desk grain, enamel pins, embroidered school patches, and a trophy shelf. Do not make every component textured; preserve clean reading surfaces.

### Typography
- Display headings: bold condensed school-poster style, e.g. locally bundled Anton or equivalent.
- Body/UI: clean readable rounded sans-serif, e.g. Nunito or equivalent.
- Handwritten accents: Patrick Hand or equivalent only for decorative notes and small labels.
- Use readable sizes and line heights. Never use handwriting fonts for small stats, instructions, or long text.
- Use only fonts that can be bundled locally with appropriate licences.

### Illustration style
Original stylized 2D illustrations, warm hand-painted / clean vector hybrid, soft shadows, lightly textured surfaces, friendly and age-appropriate. Use consistent line weight and lighting. No copyrighted game references, school logos, mascots, or copied artwork.

## 3. Design the complete screen set

Create every screen below, not just a selection. Maintain shared header, spacing, cards, buttons, iconography, typography, and navigation rules.

### A. App launch and onboarding
1. **Splash screen:** game title/logo on a chalkboard or notebook-cover composition; small loading indicator styled like chalk writing or a school stamp.
2. **First-launch welcome:** explain the pen-fight concept in one short panel; CTA to create local profile; clearly state “Offline — saved on this device.”
3. **Create profile:** school admission-form/notebook page; player name input; six selectable original avatar tiles; create profile CTA; inline validation and character count.
4. **Avatar selection detail/state:** selected avatar, selected outline/stamp, accessible labels.

### B. Main navigation
5. **Main Menu / Home:** title and classroom desk hero illustration; two pens staged for a duel; prominent “Play vs PC” CTA; secondary My Profile, Pen Collection, Badges & Ranking, Settings; small player summary showing avatar/name/level/rank; offline label. No online, multiplayer, login, matchmaking, cloud, or global leaderboard buttons.
6. **Navigation states:** active/pressed/disabled buttons, back navigation, confirmation before leaving an active match.

### C. Player identity and progression
7. **Player Profile overview:** player avatar, display name, edit action, current level number/name, total XP, progress to next level, matches played, wins, losses, win rate, rounds won, ranking tier and points, selected/favourite pen, owned pen count, latest badges, Trophy Cabinet shortcut. Visual metaphor: school report card / student identity card / merit sheet.
8. **Edit Profile:** edit name and avatar; save/cancel; validation.
9. **Level Journey / Level Details:** a dedicated visual progression page showing exactly 11 levels as a school-year / classroom achievement path. Show current level, locked future levels, completed previous levels, total XP and next-level XP requirement. Use the exact level names and XP thresholds below. Do not invent Level 12.
   - Level 1 — Naya Khiladi — 0 XP
   - Level 2 — Bench Beginner — 100 XP
   - Level 3 — Pen Rookie — 250 XP
   - Level 4 — Desk Challenger — 450 XP
   - Level 5 — Flick Expert — 700 XP
   - Level 6 — Class Champion — 1000 XP
   - Level 7 — Pen Master — 1350 XP
   - Level 8 — Desk Legend — 1750 XP
   - Level 9 — School Star — 2200 XP
   - Level 10 — Grand Champion — 2700 XP
   - Level 11 — Last Bench Legend — 3250 XP (maximum)
   Show progress visually as a classroom journey, report-card ladder, or 11-step school merit path. Every step must be tappable to reveal level name, XP requirement, status (completed/current/locked), and reward/achievement note if defined. Do not invent extra rewards.
10. **Level-up celebration overlay/page:** previous level → new level; new title; XP; short paper flip / stamp / chalk celebration; continue CTA; show Level 11 max-level state without a next-level bar.
11. **Match statistics detail:** compact match history / stats view if linked from profile; wins/losses/rounds and recent results. If no match history exists, show a designed empty state, not fake records.

### D. Pen collection
12. **Pen Collection:** six pen cards with model preview area, name, owned/locked status, weight in grams, accuracy /100, shape, friction, restitution, and strength/weakness description. Use exact data supplied by the game; show “estimated gameplay value” where appropriate. Do not invent official product specifications.
13. **Pen Detail / Compare:** larger preview panel, stat rows/bars with numeric values, explanation of weight and accuracy, select/equip CTA. Make it clear weight changes momentum/collision behaviour and accuracy changes aim assistance/control tolerance.
14. The six initial entries are: Reynolds Trimax, Reynolds 045, Cello Butterflow, Pilot V5, Nataraj 621 pencil, Apsara Platinum pencil. Do not add other pens in Phase 1.

### E. Match flow
15. **Play vs PC setup:** player card vs friendly PC classmate card; Easy/Normal difficulty only unless Hard is actually implemented; chosen pen preview; match format “First to 3 rounds”; Start Match.
16. **Gameplay HUD overlay:** transparent overlay above a live Three.js canvas. Keep desk and pens unobstructed. Top scoreboard with player/PC names and avatars, round count, score, selected pen labels; turn indicator; flick direction arrow; power meter; short drag instruction; pause button. UI must distinguish the touch interaction zone from tappable controls. Include portrait and landscape responsive layouts.
17. **Pause menu overlay:** Resume, Restart Match (confirmation), Settings, Exit to Main Menu (confirmation). Keep visual style consistent and do not obscure important gameplay unnecessarily.
18. **Round result overlay:** round winner, updated score, next turn/replay indication; appear only after physics settles and game logic confirms result.
19. **Match result:** Win/Loss, final score, XP earned, level progress, ranking points gained/lost, new badges, new ranking tier, Rematch, Main Menu, Trophy Cabinet shortcut. Make rewards visually clear and celebratory without clutter.
20. **Match interruption / confirmation:** restart, exit, and abandoned-match confirmation states; clearly explain that an abandoned match does not count as a win/loss or award ranking points according to game rules.

### F. Trophy Cabinet and badges
21. **Trophy Cabinet main page:** school trophy shelf / badge board; exactly 16 badge tiles; category tabs or section headers; earned counter such as 8/16; new/unviewed badge highlights; responsive grid.
22. **Badge detail modal:** artwork, title, description, exact unlock condition, unlock date if earned, earned/locked state.
23. **Locked badge state:** silhouette/embossed monochrome version, exact unlock requirement, no misleading claim that it is earned.
24. **Earned badge state:** full-colour enamel pin / embroidered school patch / merit medal with consistent outline and lighting.
25. **New badge notification:** small, celebratory stamp/pop overlay; must not interrupt active flick input.

Use exactly these 16 badge definitions:
- First Victory — win 1 completed match.
- Hat-trick — reach 3 total completed match wins.
- Five-Star Player — reach 5 total completed match wins.
- Perfect Flick — win a round where own pen stays on desk and opponent pen falls.
- Comeback King — win a match after trailing in round score during that match.
- Winning Streak — win 3 completed matches consecutively.
- Pen Collector — own all 6 Phase 1 pens.
- Level 5 Achiever — reach Level 5.
- Level 8 Achiever — reach Level 8.
- Last Bench Legend — reach Level 11.
- Rookie Badge — reach Rookie ranking tier for the first time.
- Skilled Badge — reach Skilled ranking tier for the first time.
- Expert Badge — reach Expert ranking tier for the first time.
- Champion Badge — reach Champion ranking tier for the first time.
- Master Badge — reach Master ranking tier for the first time.
- Legend Badge — reach Legend ranking tier for the first time.

Group into Match Achievements, Level Achievements, Ranking Badges, and Collection Achievements. Do not create additional badges.

### G. Ranking
26. **Ranking overview/details:** school merit list / class ranking report. Show current tier, points, progress to next tier, all seven tiers, recent points changes if data exists, permanent badges already earned. Clearly label ranking as local Phase 1 ranking, not global.
- Beginner: 0–99
- Rookie: 100–249
- Skilled: 250–449
- Expert: 450–699
- Champion: 700–999
- Master: 1000–1399
- Legend: 1400+
27. **Ranking tier detail state:** selected tier description and points requirement; no fake global players or leaderboard.

### H. Settings and support states
28. **Settings page:** sound on/off, volume, music toggle only if music exists, haptics if supported, reduced motion, reset progress with two-step confirmation, app version, offline status.
29. **Reset confirmation:** strong destructive warning and Cancel/Confirm.
30. **Help / How to Play:** illustrated short rules: take turns, drag backwards to flick, knock opponent off while keeping own pen on desk, first to 3 rounds wins. Explain double-fall replay and no-fall turn switch.
31. **Empty, loading, error, and disabled states:** design these for profile, match history, pen collection, badges, and local-save failure. Never fill the UI with fake player stats or fake match records.

## 4. Exact design system deliverables

Create a small design system page/style guide that documents:
- Colour tokens and semantic usage.
- Font families, sizes, weights, line heights.
- Spacing scale and layout grid.
- Corner radius, border, shadow, and elevation rules.
- Button variants and interaction states.
- Card types: paper, chalkboard, wood plaque, stat tile.
- Input fields, selectors, tabs, progress bars, tooltips, toasts, modals, confirmation dialogs.
- Badge states and level states.
- Icon style and icon sizing.
- Portrait and landscape responsive breakpoints.
- Accessibility: contrast, focus states, touch targets, readable text, reduced motion.

Create reusable components for every repeated visual pattern. Do not draw each page as an unrelated one-off design.

## 5. Asset inventory and exact deliverables

Create a visual asset inventory with descriptive filenames and intended use.

### 3D assets (design references only; actual model production is separate)
- 6 pen/pencil model preview references matching the six named pens.
- 1 wooden school desk model reference.
- Desk material and edge detail reference.
- Optional classroom prop references: bench, blackboard, chair, window, chalk, duster, ruler, school bell. Optional only.

The actual 3D game models must be delivered separately as GLB/GLTF or Three.js geometry. Do not pretend HTML or an SVG illustration is a 3D model.

### 2D UI art
- Main menu classroom/desk hero illustration.
- Reusable classroom background.
- Chalkboard panel texture.
- Notebook/ruled-paper texture.
- Kraft-paper texture.
- Paper grain texture.
- Wooden desk grain texture.
- Trophy shelf / badge-board illustration.
- Report-card / merit-list frame.
- School stamp and chalk doodle decoration set.
- Six original avatar illustrations.
- Exactly 16 badge master artworks, each with earned colour and locked monochrome states.
- UI icon set for play, profile, pens, badges, ranking, settings, back, close, pause, resume, restart, sound, music, haptics, help, lock, unlock, star, XP, level, win, loss, round, turn, weight, accuracy, shape, friction, restitution.
- Lightweight UI effects: stamp pop, chalk underline, badge shine, level-up burst, button press, transition.
- 10 sound effect placeholders / named audio slots: button tap, pen flick, pen collision, desk bounce, pen fall, turn change, round win, match win, level-up, badge unlock. Audio files themselves are supplied separately.

### Asset naming examples
Use stable names such as:
- `ui_main_menu_hero.webp`
- `ui_classroom_background.webp`
- `texture_chalkboard.webp`
- `texture_notebook_paper.webp`
- `texture_kraft_paper.webp`
- `texture_wood_desk.webp`
- `ui_trophy_shelf.webp`
- `avatar_01.webp` through `avatar_06.webp`
- `badge_first_victory.svg` through individually named badge files
- `icon_profile.svg`, `icon_pen_collection.svg`, etc.

Provide an asset manifest listing filename, format, dimensions, intended screen, and placeholder/final status.

## 6. Prototype behaviour and interactions

Do not produce static pictures only. Make the screen prototype navigable:
- Main menu buttons open their correct pages.
- Back buttons return to the previous logical page.
- Profile edit fields and avatar selection work in the prototype.
- Pen cards can be selected and comparison/details opened.
- Level path steps open level detail states.
- Badge categories filter or navigate to the correct groups.
- Badge tile opens its detail modal.
- Settings controls visibly toggle and update.
- Confirmation dialogs have Cancel and Confirm states.
- Gameplay buttons call named integration hooks; they do not fake physics.
- Use clearly named placeholder data and visibly label it as prototype data. Never present fake stats as real.

## 7. Integration and code output

Preferred output: clean HTML/CSS/JavaScript, locally runnable and compatible with Flutter WebView.
- Separate HTML, CSS, JS, and asset folders.
- Use CSS variables for design tokens.
- Use semantic HTML and reusable components.
- Avoid external CDN packages, remote images, and remote fonts.
- Keep UI separate from game rules and physics.
- Gameplay screen should have a dedicated Three.js canvas mount area and a separate transparent HUD layer.
- Expose documented UI hooks for: `startMatch`, `selectPen`, `pauseMatch`, `resumeMatch`, `restartMatch`, `exitToMenu`, `setSoundEnabled`, `setVolume`, `openProfile`, `openPenCollection`, `openTrophyCabinet`, `openRanking`, `openSettings`.
- Listen for game/application events: `profileLoaded`, `matchStarted`, `turnChanged`, `roundResolved`, `matchCompleted`, `xpUpdated`, `levelUp`, `badgeUnlocked`, `rankingUpdated`, `settingsUpdated`.
- Document bridge message names, payload shapes, and error handling. The actual game/application logic remains the source of truth for profile, levels, XP, badges, ranking, match state, and saved data.
- If the tool emits React or another framework, provide the required build/export instructions and locally bundled output; do not assume raw framework source runs directly in WebView.

## 8. Quality acceptance checklist

The design is not complete until:
1. Every numbered screen/state above is represented.
2. All screens use the same design system.
3. All 11 levels and exactly 16 badges are represented with correct names and thresholds/conditions.
4. Profile overview shows all requested player statistics and progression details.
5. All visible controls have a clear interaction and destination/action.
6. Gameplay HUD is transparent and does not obstruct the live 3D game.
7. Portrait layouts are polished; gameplay landscape layout is also handled.
8. All artwork is original, locally bundled, and licence-safe.
9. The prototype has no login, network, cloud, multiplayer, or global leaderboard UI.
10. Deliver the complete source code, asset manifest, design system/style guide, and integration README—not screenshots alone.

**Final instruction:** Design the complete visual theme and every Phase 1 page/state as one cohesive game. Do not stop after the home page or a handful of mockups. If the tool cannot generate all screens in one pass, generate them in clearly named batches while preserving the exact same design tokens and components, and continue until the entire screen list and asset inventory are covered.
