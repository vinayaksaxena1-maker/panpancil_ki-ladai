import * as THREE from 'three';

// 1. Procedural Varnished Teak Desk Texture + Roughness/Bump Map (Saraswati Vidyalaya 1998 Style)
export function createProceduralDeskTextures() {
  const width = 1024;
  const height = 1460; // Matches 0.70m x 1.00m vertical duel desk

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rCtx = roughCanvas.getContext('2d');

  // Base roughness (varnished semi-gloss wood)
  rCtx.fillStyle = '#686868';
  rCtx.fillRect(0, 0, width, height);

  // Rich golden-teak / honey-oak base gradient
  const baseGrad = ctx.createLinearGradient(0, 0, width, 0);
  baseGrad.addColorStop(0, '#a66224');
  baseGrad.addColorStop(0.25, '#c47b35');
  baseGrad.addColorStop(0.5, '#b86f2c');
  baseGrad.addColorStop(0.75, '#c88038');
  baseGrad.addColorStop(1, '#9e5b1e');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Vertical wood plank seams (3 planks across the desk)
  const planks = [340, 684];
  planks.forEach(px => {
    ctx.fillStyle = 'rgba(55, 25, 8, 0.55)';
    ctx.fillRect(px - 2, 0, 4, height);
    ctx.fillStyle = 'rgba(235, 175, 105, 0.25)';
    ctx.fillRect(px + 2, 0, 2, height);

    rCtx.fillStyle = '#d0d0d0'; // Rough seam
    rCtx.fillRect(px - 2, 0, 4, height);
  });

  // Natural vertical teak wood grain fibers
  for (let x = 0; x < width; x += 2) {
    const streakAlpha = (Math.sin(x * 0.08) + 1) * 0.045 + Math.random() * 0.03;
    ctx.strokeStyle = x % 4 === 0
      ? `rgba(72, 34, 10, ${streakAlpha})`
      : `rgba(225, 155, 78, ${streakAlpha * 0.8})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= height; y += 60) {
      const wave = Math.sin(y * 0.008 + x * 0.03) * 4;
      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();
  }

  // Subtle wood knots
  const drawKnot = (kx, ky, rx, ry) => {
    for (let r = 1; r <= 6; r++) {
      ctx.strokeStyle = `rgba(68, 30, 8, ${0.22 - r * 0.025})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(kx, ky, rx * r * 0.35, ry * r * 0.35, 0.1, 0, Math.PI * 2);
      ctx.stroke();
    }
  };
  drawKnot(210, 420, 18, 45);
  drawKnot(810, 980, 16, 40);

  // Hand-drawn slightly smudged white chalk arena boundary box
  const marginX = 95;
  const marginY = 125;
  ctx.save();
  ctx.strokeStyle = 'rgba(248, 248, 242, 0.88)';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
  ctx.shadowBlur = 6;
  ctx.strokeRect(marginX, marginY, width - marginX * 2, height - marginY * 2);

  // Chalk dust texture along the line
  for (let i = 0; i < 450; i++) {
    const side = i % 4;
    let cx, cy;
    if (side === 0) { cx = marginX + Math.random() * (width - marginX * 2); cy = marginY + (Math.random() - 0.5) * 14; }
    else if (side === 1) { cx = marginX + Math.random() * (width - marginX * 2); cy = height - marginY + (Math.random() - 0.5) * 14; }
    else if (side === 2) { cx = marginX + (Math.random() - 0.5) * 14; cy = marginY + Math.random() * (height - marginY * 2); }
    else { cx = width - marginX + (Math.random() - 0.5) * 14; cy = marginY + Math.random() * (height - marginY * 2); }

    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.45})`;
    ctx.fillRect(cx, cy, 3, 3);
  }
  ctx.restore();

  // Chalk is matte on roughnessMap
  rCtx.strokeStyle = '#e5e5e5';
  rCtx.lineWidth = 10;
  rCtx.strokeRect(marginX, marginY, width - marginX * 2, height - marginY * 2);

  // Authentic Royal-Blue Fountain Pen Ink Splatters (like reference bottom corners)
  const drawInkSplatter = (ix, iy, radius, droplets) => {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const inkGrad = ctx.createRadialGradient(ix, iy, radius * 0.1, ix, iy, radius);
    inkGrad.addColorStop(0, 'rgba(12, 24, 138, 0.92)');
    inkGrad.addColorStop(0.65, 'rgba(18, 38, 168, 0.78)');
    inkGrad.addColorStop(1, 'rgba(25, 50, 185, 0)');
    ctx.fillStyle = inkGrad;

    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.25) {
      const rVar = radius * (0.65 + Math.sin(a * 5 + ix) * 0.25 + Math.random() * 0.25);
      const px = ix + Math.cos(a) * rVar;
      const py = iy + Math.sin(a) * rVar;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Micro ink droplets around main blotch
    for (let d = 0; d < droplets; d++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius * (0.9 + Math.random() * 1.4);
      const dropR = 2 + Math.random() * 7;
      ctx.beginPath();
      ctx.arc(ix + Math.cos(angle) * dist, iy + Math.sin(angle) * dist, dropR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  drawInkSplatter(815, 1305, 52, 22); // Bottom-right main ink blot
  drawInkSplatter(155, 1290, 26, 12); // Bottom-left ink smudge
  drawInkSplatter(220, 145, 22, 10);  // Top-left ink blot

  // Compass & Pen Scratched Carvings in Wood ("7B", "ROHIT", "PRIYA", tally marks)
  const drawCarving = (text, x, y, angle, size = 34) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `bold ${size}px "Courier New", monospace`;
    // Light wood inner scratch
    ctx.fillStyle = 'rgba(242, 204, 152, 0.42)';
    ctx.fillText(text, 2, 2);
    // Dark carved groove
    ctx.fillStyle = 'rgba(58, 26, 7, 0.55)';
    ctx.fillText(text, 0, 0);
    ctx.restore();

    rCtx.save();
    rCtx.translate(x, y);
    rCtx.rotate(angle);
    rCtx.font = `bold ${size}px "Courier New", monospace`;
    rCtx.fillStyle = '#c8c8c8';
    rCtx.fillText(text, 0, 0);
    rCtx.restore();
  };

  drawCarving('7B', 540, 1410, -0.04, 42);
  drawCarving('ROHIT', 50, 1120, Math.PI / 2 - 0.05, 30);
  drawCarving('PRIYA', 975, 1060, -Math.PI / 2 + 0.04, 30);
  drawCarving('1998', 480, 1370, 0.02, 28);

  // Random compass & pen scratches across surface
  for (let k = 0; k < 110; k++) {
    const sx = Math.random() * width;
    const sy = Math.random() * height;
    ctx.strokeStyle = Math.random() > 0.45
      ? 'rgba(65, 30, 10, 0.28)'
      : 'rgba(245, 210, 165, 0.28)';
    ctx.lineWidth = Math.random() * 1.8 + 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (Math.random() - 0.5) * 65, sy + (Math.random() - 0.5) * 55);
    ctx.stroke();
  }

  // Edge wear & varnish darkening along borders
  const edgeGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.42, width / 2, height / 2, height * 0.62);
  edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
  edgeGrad.addColorStop(1, 'rgba(42, 18, 4, 0.32)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, width, height);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.anisotropy = 4;

  return { map, roughnessMap };
}

// 2. Weathered Indian School IPS / Concrete Cement Floor Texture
export function createProceduralFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Weathered cement grey base
  ctx.fillStyle = '#6f716c';
  ctx.fillRect(0, 0, 512, 512);

  // Mottled concrete patches & wear
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 12 + Math.random() * 48;
    ctx.fillStyle = Math.random() > 0.5
      ? 'rgba(85, 88, 82, 0.14)'
      : 'rgba(135, 138, 132, 0.12)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle IPS floor expansion joint lines
  ctx.strokeStyle = 'rgba(48, 50, 46, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 510, 510);

  // Hairline concrete cracks
  ctx.strokeStyle = 'rgba(45, 46, 43, 0.25)';
  ctx.lineWidth = 1;
  for (let c = 0; c < 6; c++) {
    let cx = Math.random() * 512;
    let cy = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) {
      cx += (Math.random() - 0.5) * 45;
      cy += (Math.random() - 0.5) * 45;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// 3. Dynamic Procedural Blackboard Texture ("Saraswati Vidyalaya 1998")
let bbCanvas = null;
let bbCtx = null;
let bbTexture = null;

export function renderBlackboardChalk(announcement = null) {
  if (!bbCtx) return;

  // Deep matte slate green chalkboard
  bbCtx.fillStyle = '#183629';
  bbCtx.fillRect(0, 0, 1024, 512);

  // Eraser smudge clouds (realistic chalk dust)
  for (let i = 0; i < 42; i++) {
    const cx = (i * 151.3) % 1024;
    const cy = (i * 97.7) % 512;
    const grad = bbCtx.createRadialGradient(cx, cy, 5, cx, cy, 85);
    grad.addColorStop(0, 'rgba(230, 240, 232, 0.055)');
    grad.addColorStop(1, 'rgba(230, 240, 232, 0)');
    bbCtx.fillStyle = grad;
    bbCtx.fillRect(cx - 85, cy - 85, 170, 170);
  }

  // Chalk Header Row (Matches Reference Image)
  bbCtx.fillStyle = 'rgba(246, 248, 242, 0.92)';
  bbCtx.font = 'bold 34px "Courier New", monospace';
  bbCtx.fillText('DATE: 18-08-1998 • CLASS: 7TH-B', 48, 82);

  // School Title with Double Chalk Underline
  bbCtx.font = 'bold 46px "Courier New", monospace';
  bbCtx.fillStyle = 'rgba(252, 252, 246, 0.96)';
  bbCtx.fillText('SARASWATI VIDYALAYA', 225, 165);

  bbCtx.strokeStyle = 'rgba(246, 248, 242, 0.78)';
  bbCtx.lineWidth = 3;
  bbCtx.beginPath();
  bbCtx.moveTo(220, 180);
  bbCtx.lineTo(805, 180);
  bbCtx.moveTo(235, 188);
  bbCtx.lineTo(790, 188);
  bbCtx.stroke();

  // Thought of the day & Period
  bbCtx.font = 'italic 30px Georgia, serif';
  bbCtx.fillStyle = 'rgba(242, 246, 238, 0.90)';
  bbCtx.fillText('THOUGHT: Work is Worship  •  PERIOD: RECESS', 110, 255);

  // Live Match Status / Chalk Announcement Banner at bottom of board
  if (announcement) {
    bbCtx.strokeStyle = 'rgba(245, 208, 97, 0.85)';
    bbCtx.lineWidth = 3;
    bbCtx.strokeRect(140, 310, 744, 115);

    bbCtx.font = 'bold 36px "Courier New", monospace';
    bbCtx.fillStyle = '#f7d560';
    bbCtx.textAlign = 'center';
    bbCtx.fillText(announcement, 512, 380);
    bbCtx.textAlign = 'left';
  } else {
    bbCtx.font = '24px "Courier New", monospace';
    bbCtx.fillStyle = 'rgba(245, 248, 242, 0.62)';
    bbCtx.textAlign = 'center';
    bbCtx.fillText('~ BENCH #4 CHAMPIONSHIP • DRAG PEN TO FLICK ~', 512, 385);
    bbCtx.textAlign = 'left';
  }

  if (bbTexture) {
    bbTexture.needsUpdate = true;
  }
}

export function updateBlackboardDisplay(announcement = null) {
  renderBlackboardChalk(announcement);
}

export function createProceduralBlackboardTexture() {
  bbCanvas = document.createElement('canvas');
  bbCanvas.width = 1024;
  bbCanvas.height = 512;
  bbCtx = bbCanvas.getContext('2d');
  bbTexture = new THREE.CanvasTexture(bbCanvas);
  bbTexture.colorSpace = THREE.SRGBColorSpace;

  renderBlackboardChalk(null);
  return bbTexture;
}

// 4. Two-Tone 1990s Indian Classroom Wall Texture (Cream Plaster + Green Dado)
function createTwoToneWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Top 62%: Warm sunlit cream lime-plaster wall
  ctx.fillStyle = '#dfd5bc';
  ctx.fillRect(0, 0, 512, 318);

  // Bottom 38%: Classic Indian school dark teal-green oil-paint dado
  ctx.fillStyle = '#245844';
  ctx.fillRect(0, 318, 512, 194);

  // Dark border stripe separating cream & green paint
  ctx.fillStyle = '#183d2f';
  ctx.fillRect(0, 315, 512, 6);

  // Subtle wall plaster texture & aging scuffs
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 4 + Math.random() * 24;
    ctx.fillStyle = y < 318
      ? 'rgba(175, 160, 130, 0.08)'
      : 'rgba(15, 40, 30, 0.14)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 5. Central Duel Desk + Authentic 1990s Saraswati Vidyalaya Classroom Environment
export function createDeskMesh(width, depth, thickness) {
  const group = new THREE.Group();
  const { map: deskTexture, roughnessMap: deskRoughness } = createProceduralDeskTextures();

  // Shared Teak Wood Material for Desk Frame & Side Benches
  const teakWoodMat = new THREE.MeshStandardMaterial({
    color: 0x8c4d19,
    roughness: 0.48,
    metalness: 0.04
  });

  // 1. Central Duel Desk Top Board (EXACT dimensions preserved for Rapier sync)
  const topGeo = new THREE.BoxGeometry(width, thickness, depth);
  const topMat = new THREE.MeshStandardMaterial({
    map: deskTexture,
    roughnessMap: deskRoughness,
    bumpMap: deskRoughness,
    bumpScale: 0.002,
    roughness: 0.46,
    metalness: 0.04
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = -thickness / 2;
  top.receiveShadow = true;
  top.castShadow = true;
  group.add(top);

  // 2. Sturdy Wooden Apron Frame & 4 Square Teak Legs (Matches Reference Table)
  const legHeight = 0.72;
  const legSize = 0.042;
  const legGeo = new THREE.BoxGeometry(legSize, legHeight, legSize);

  const legPositions = [
    [-width / 2 + 0.045, -legHeight / 2 - thickness, -depth / 2 + 0.045],
    [width / 2 - 0.045, -legHeight / 2 - thickness, -depth / 2 + 0.045],
    [-width / 2 + 0.045, -legHeight / 2 - thickness, depth / 2 - 0.045],
    [width / 2 - 0.045, -legHeight / 2 - thickness, depth / 2 - 0.045],
  ];

  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, teakWoodMat);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    leg.receiveShadow = true;
    group.add(leg);
  });

  // Under-table wooden apron beams
  const sideApronGeo = new THREE.BoxGeometry(0.025, 0.075, depth - 0.09);
  const leftApron = new THREE.Mesh(sideApronGeo, teakWoodMat);
  leftApron.position.set(-width / 2 + 0.045, -thickness - 0.037, 0);
  group.add(leftApron);

  const rightApron = new THREE.Mesh(sideApronGeo, teakWoodMat);
  rightApron.position.set(width / 2 - 0.045, -thickness - 0.037, 0);
  group.add(rightApron);

  const frontApronGeo = new THREE.BoxGeometry(width - 0.09, 0.075, 0.025);
  const frontApron = new THREE.Mesh(frontApronGeo, teakWoodMat);
  frontApron.position.set(0, -thickness - 0.037, depth / 2 - 0.045);
  group.add(frontApron);

  // Wooden H-stretcher footrest bars near bottom
  const hBarGeo = new THREE.BoxGeometry(width - 0.09, 0.032, 0.032);
  const frontStretcher = new THREE.Mesh(hBarGeo, teakWoodMat);
  frontStretcher.position.set(0, -legHeight * 0.78 - thickness, depth / 2 - 0.045);
  group.add(frontStretcher);

  const centerStretcherGeo = new THREE.BoxGeometry(0.032, 0.032, depth - 0.09);
  const centerStretcher = new THREE.Mesh(centerStretcherGeo, teakWoodMat);
  centerStretcher.position.set(0, -legHeight * 0.78 - thickness, 0);
  group.add(centerStretcher);

  // 3. Weathered Cement Classroom Floor
  const floorGeo = new THREE.PlaneGeometry(9, 9);
  const floorMat = new THREE.MeshStandardMaterial({
    map: createProceduralFloorTexture(),
    roughness: 0.78,
    metalness: 0.02
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -legHeight - thickness, 0);
  floor.receiveShadow = true;
  group.add(floor);

  // 4. Two-Tone Front Wall + Left Sunlit Window Wall
  const wallTex = createTwoToneWallTexture();
  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    roughness: 0.88
  });

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.2), wallMat);
  frontWall.position.set(0, 0.55, -1.65);
  frontWall.receiveShadow = true;
  group.add(frontWall);

  // Left Wall with bright sunlit school window glow
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.2), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-1.75, 0.55, 0);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Sunlit Classroom Window Frame on Left Wall
  const winGlowMat = new THREE.MeshBasicMaterial({ color: 0xfff8e7 });
  const winPane = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.05), winGlowMat);
  winPane.rotation.y = Math.PI / 2;
  winPane.position.set(-1.73, 0.55, -0.55);
  group.add(winPane);

  // Window wooden bars
  for (let b = -0.35; b <= 0.35; b += 0.35) {
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.08, 0.03), teakWoodMat);
    vBar.position.set(-1.72, 0.55, -0.55 + b);
    group.add(vBar);
  }

  // 5. Large Wooden-Framed Green Chalkboard on Front Wall
  const boardWidth = 1.48;
  const boardHeight = 0.68;
  const boardGeo = new THREE.BoxGeometry(boardWidth, boardHeight, 0.02);
  const boardMat = new THREE.MeshStandardMaterial({
    map: createProceduralBlackboardTexture(),
    roughness: 0.65
  });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0.08, 0.44, -1.62);
  group.add(board);

  // Teak Wooden Frame & Chalk Ledge Tray
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x6b3a16,
    roughness: 0.5
  });
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(boardWidth + 0.06, boardHeight + 0.06, 0.025),
    frameMat
  );
  frame.position.set(0.08, 0.44, -1.63);
  group.add(frame);

  // Bottom chalk ledge + wooden duster + chalk sticks
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(boardWidth + 0.08, 0.025, 0.065), frameMat);
  ledge.position.set(0.08, 0.44 - boardHeight / 2 - 0.02, -1.60);
  group.add(ledge);

  const duster = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.028, 0.042),
    new THREE.MeshStandardMaterial({ color: 0xa86b32, roughness: 0.7 })
  );
  duster.position.set(-0.22, 0.44 - boardHeight / 2 + 0.005, -1.59);
  group.add(duster);

  const chalkStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.045, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  chalkStick.rotation.z = Math.PI / 2;
  chalkStick.position.set(0.32, 0.44 - boardHeight / 2 - 0.004, -1.59);
  group.add(chalkStick);

  // Tube light above chalkboard
  const tubeFixture = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.025, 0.03),
    new THREE.MeshBasicMaterial({ color: 0xf7f9fc })
  );
  tubeFixture.position.set(0.28, 0.92, -1.62);
  group.add(tubeFixture);

  // 6. Teacher's Desk in Front of Blackboard (Matches Reference Image)
  const teacherDesk = new THREE.Group();
  const tTop = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 0.45), teakWoodMat);
  tTop.castShadow = true;
  tTop.receiveShadow = true;
  teacherDesk.add(tTop);

  const tModesty = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.42, 0.02), teakWoodMat);
  tModesty.position.set(0, -0.22, 0.18);
  teacherDesk.add(tModesty);

  [[-0.38, -0.18], [0.38, -0.18], [-0.38, 0.18], [0.38, 0.18]].forEach(([lx, lz]) => {
    const tLeg = new THREE.Mesh(legGeo, teakWoodMat);
    tLeg.position.set(lx, -legHeight / 2, lz);
    teacherDesk.add(tLeg);
  });
  teacherDesk.position.set(0.02, -thickness / 2, -1.05);
  group.add(teacherDesk);

  // 7. Clean Wooden Student Side Benches (No Blocky Boxes)
  const createWoodenSideBench = (x, z) => {
    const sideDesk = new THREE.Group();
    const sTop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.03, 0.68), teakWoodMat);
    sTop.castShadow = true;
    sTop.receiveShadow = true;
    sideDesk.add(sTop);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.68), teakWoodMat);
    seat.position.set(x > 0 ? 0.34 : -0.34, -0.22, 0);
    sideDesk.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.16, 0.68), teakWoodMat);
    back.position.set(x > 0 ? 0.45 : -0.45, -0.08, 0);
    sideDesk.add(back);

    [[-0.20, -0.28], [0.20, -0.28], [-0.20, 0.28], [0.20, 0.28]].forEach(([lx, lz]) => {
      const sLeg = new THREE.Mesh(legGeo, teakWoodMat);
      sLeg.position.set(lx, -legHeight / 2, lz);
      sLeg.castShadow = true;
      sideDesk.add(sLeg);
    });

    sideDesk.position.set(x, -thickness / 2, z);
    return sideDesk;
  };

  group.add(createWoodenSideBench(-1.02, -0.48));
  group.add(createWoodenSideBench(-1.02, 0.48));
  group.add(createWoodenSideBench(1.02, -0.48));
  group.add(createWoodenSideBench(1.02, 0.48));

  return group;
}
