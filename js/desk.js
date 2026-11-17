import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. Procedural Furniture Teak Material (Legs, Aprons, Benches, Teacher Desk)
// ---------------------------------------------------------------------------
let cachedFurnitureTeakMat = null;

export function getFurnitureTeakMaterial() {
  if (cachedFurnitureTeakMat) return cachedFurnitureTeakMat;

  const width = 512;
  const height = 512;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rCtx = roughCanvas.getContext('2d');

  // Semi-gloss base roughness
  rCtx.fillStyle = '#7a7a7a';
  rCtx.fillRect(0, 0, width, height);

  // Warm golden honey-oak / teak base
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, '#9e5a20');
  grad.addColorStop(0.25, '#be7532');
  grad.addColorStop(0.5, '#af6725');
  grad.addColorStop(0.75, '#c57d38');
  grad.addColorStop(1, '#93511a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // High-contrast vertical teak fibers
  for (let x = 0; x < width; x += 2) {
    const fiberAlpha = (Math.sin(x * 0.12) + 1) * 0.06 + Math.random() * 0.04;
    ctx.strokeStyle = x % 4 === 0
      ? `rgba(62, 26, 6, ${fiberAlpha})`
      : `rgba(228, 160, 82, ${fiberAlpha * 0.75})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= height; y += 40) {
      const wave = Math.sin(y * 0.015 + x * 0.04) * 3;
      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();

    // Roughness variations along grain lines
    if (x % 8 === 0) {
      rCtx.fillStyle = 'rgba(210, 210, 210, 0.12)';
      rCtx.fillRect(x - 1, 0, 2, height);
    }
  }

  // Dark sap veins & subtle knots
  for (let k = 0; k < 4; k++) {
    const kx = (k * 140 + 75) % width;
    const ky = (k * 165 + 90) % height;
    for (let r = 1; r <= 5; r++) {
      ctx.strokeStyle = `rgba(58, 22, 5, ${0.28 - r * 0.04})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(kx, ky, r * 5, r * 14, 0.08, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Varnish edge darkening
  const edgeGrad = ctx.createLinearGradient(0, 0, width, 0);
  edgeGrad.addColorStop(0, 'rgba(40, 16, 4, 0.35)');
  edgeGrad.addColorStop(0.12, 'rgba(0,0,0,0)');
  edgeGrad.addColorStop(0.88, 'rgba(0,0,0,0)');
  edgeGrad.addColorStop(1, 'rgba(40, 16, 4, 0.35)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, width, height);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1, 2);
  map.anisotropy = 4;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(1, 2);

  cachedFurnitureTeakMat = new THREE.MeshStandardMaterial({
    map,
    roughnessMap,
    bumpMap: roughnessMap,
    bumpScale: 0.0018,
    roughness: 0.42,
    metalness: 0.03
  });

  return cachedFurnitureTeakMat;
}

// ---------------------------------------------------------------------------
// 2. High-Contrast Procedural Varnished Teak Duel Desk Top (PBR + Glare)
// ---------------------------------------------------------------------------
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

  // Base roughness: semi-gloss varnished teak wood
  rCtx.fillStyle = '#555555';
  rCtx.fillRect(0, 0, width, height);

  // 1. Rich golden-teak / honey-gold wood planks with high contrast
  const baseGrad = ctx.createLinearGradient(0, 0, width, 0);
  baseGrad.addColorStop(0, '#9c591c');
  baseGrad.addColorStop(0.18, '#d48c3b'); // Warm honey-gold highlight
  baseGrad.addColorStop(0.33, '#b86c26');
  baseGrad.addColorStop(0.50, '#a55b1b');
  baseGrad.addColorStop(0.68, '#cf8535'); // Honey-gold highlight
  baseGrad.addColorStop(0.85, '#b96e29');
  baseGrad.addColorStop(1, '#945318');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Vertical wood plank seams (3 solid teak planks across duel desk)
  const planks = [340, 684];
  planks.forEach(px => {
    // Deep seam shadow
    ctx.fillStyle = 'rgba(45, 18, 5, 0.75)';
    ctx.fillRect(px - 2, 0, 4, height);
    // Beveled highlight catch
    ctx.fillStyle = 'rgba(245, 195, 125, 0.35)';
    ctx.fillRect(px + 2, 0, 2, height);

    // Roughness groove
    rCtx.fillStyle = '#d5d5d5';
    rCtx.fillRect(px - 2, 0, 4, height);
  });

  // 3. Dense, natural teak wood grain fibers & pores
  for (let x = 0; x < width; x += 2) {
    const streakAlpha = (Math.sin(x * 0.075) + 1) * 0.055 + Math.random() * 0.035;
    ctx.strokeStyle = x % 4 === 0
      ? `rgba(55, 22, 6, ${streakAlpha * 1.2})`
      : `rgba(238, 172, 92, ${streakAlpha * 0.85})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= height; y += 50) {
      const wave = Math.sin(y * 0.007 + x * 0.028) * 4.5;
      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();

    // Wood pores on roughness map
    if (x % 6 === 0) {
      rCtx.fillStyle = 'rgba(180, 180, 180, 0.18)';
      rCtx.fillRect(x, 0, 1.5, height);
    }
  }

  // 4. Realistic organic wood knots with distorted grain rings
  const drawKnot = (kx, ky, rx, ry, tilt = 0.08) => {
    // Knot center dark core
    ctx.save();
    ctx.translate(kx, ky);
    ctx.rotate(tilt);
    const knotCore = ctx.createRadialGradient(0, 0, 2, 0, 0, rx);
    knotCore.addColorStop(0, 'rgba(40, 14, 4, 0.88)');
    knotCore.addColorStop(0.7, 'rgba(68, 28, 8, 0.72)');
    knotCore.addColorStop(1, 'rgba(130, 65, 18, 0.0)');
    ctx.fillStyle = knotCore;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Concentric growth rings around knot
    for (let r = 1; r <= 7; r++) {
      ctx.strokeStyle = `rgba(52, 20, 6, ${0.32 - r * 0.038})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx + r * 5, ry + r * 8.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Knot bump & roughness
    rCtx.save();
    rCtx.translate(kx, ky);
    rCtx.rotate(tilt);
    rCtx.fillStyle = '#a8a8a8';
    rCtx.beginPath();
    rCtx.ellipse(0, 0, rx + 14, ry + 24, 0, 0, Math.PI * 2);
    rCtx.fill();
    rCtx.restore();
  };

  drawKnot(210, 420, 16, 42, -0.06);
  drawKnot(815, 960, 15, 38, 0.07);
  drawKnot(490, 210, 12, 30, -0.04);

  // 5. Hand-Drawn Smudged White Chalk Arena Rectangle (Organic 2-3px wobble & dust)
  const marginX = 96;
  const marginY = 126;
  const rectW = width - marginX * 2;
  const rectH = height - marginY * 2;

  ctx.save();
  ctx.strokeStyle = 'rgba(248, 248, 242, 0.90)';
  ctx.lineWidth = 8.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.40)';
  ctx.shadowBlur = 6;

  // Draw organic wobbled boundary line with realistic student chalk hand-feel
  const drawWobblyLine = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const steps = 30;
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;
    for (let s = 1; s <= steps; s++) {
      const wobble = (Math.random() - 0.5) * 3.2;
      const curX = x1 + dx * s + (dy !== 0 ? wobble : 0);
      const curY = y1 + dy * s + (dx !== 0 ? wobble : 0);
      ctx.lineTo(curX, curY);
    }
    ctx.stroke();
  };

  drawWobblyLine(marginX, marginY, marginX + rectW, marginY); // Top
  drawWobblyLine(marginX + rectW, marginY, marginX + rectW, marginY + rectH); // Right
  drawWobblyLine(marginX + rectW, marginY + rectH, marginX, marginY + rectH); // Bottom
  drawWobblyLine(marginX, marginY + rectH, marginX, marginY); // Left

  // Chalk dust particles & powdery smudge along the line
  for (let i = 0; i < 500; i++) {
    const side = i % 4;
    let cx, cy;
    if (side === 0) { cx = marginX + Math.random() * rectW; cy = marginY + (Math.random() - 0.5) * 16; }
    else if (side === 1) { cx = marginX + rectW + (Math.random() - 0.5) * 16; cy = marginY + Math.random() * rectH; }
    else if (side === 2) { cx = marginX + Math.random() * rectW; cy = marginY + rectH + (Math.random() - 0.5) * 16; }
    else { cx = marginX + (Math.random() - 0.5) * 16; cy = marginY + Math.random() * rectH; }

    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.42})`;
    ctx.fillRect(cx, cy, 2.5, 2.5);
  }
  ctx.restore();

  // Chalk is completely matte on roughnessMap
  rCtx.strokeStyle = '#e8e8e8';
  rCtx.lineWidth = 10;
  rCtx.strokeRect(marginX, marginY, rectW, rectH);

  // 6. Organic Multi-Layered Royal-Blue Fountain Pen Ink Pools & Satellite Splatters
  const drawOrganicInkPool = (ix, iy, radius, droplets) => {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';

    // Outer translucent feathered capillary stain
    const outerGrad = ctx.createRadialGradient(ix, iy, radius * 0.2, ix, iy, radius * 1.25);
    outerGrad.addColorStop(0, 'rgba(10, 25, 130, 0.75)');
    outerGrad.addColorStop(0.65, 'rgba(24, 52, 185, 0.40)');
    outerGrad.addColorStop(1, 'rgba(30, 60, 200, 0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      // Grain-aligned capillary stretch (elongates slightly vertically along wood fiber)
      const fiberBias = Math.abs(Math.sin(a)) * 0.22;
      const rVar = radius * 1.25 * (0.75 + Math.sin(a * 4 + ix) * 0.18 + fiberBias + Math.random() * 0.15);
      const px = ix + Math.cos(a) * rVar;
      const py = iy + Math.sin(a) * rVar;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Dense royal-blue ink pool core
    const coreGrad = ctx.createRadialGradient(ix, iy, radius * 0.05, ix, iy, radius * 0.75);
    coreGrad.addColorStop(0, 'rgba(4, 10, 80, 0.98)');
    coreGrad.addColorStop(0.6, 'rgba(12, 28, 150, 0.90)');
    coreGrad.addColorStop(1, 'rgba(18, 42, 175, 0.70)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const rVar = radius * (0.65 + Math.sin(a * 5 + iy) * 0.20 + Math.random() * 0.15);
      const px = ix + Math.cos(a) * rVar;
      const py = iy + Math.sin(a) * rVar;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Satellite splatter droplets & micro-flicks
    for (let d = 0; d < droplets; d++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius * (0.85 + Math.random() * 1.7);
      const dropR = 1.5 + Math.random() * 5.5;
      const dropAlpha = 0.55 + Math.random() * 0.40;
      ctx.fillStyle = `rgba(10, 24, 140, ${dropAlpha})`;
      ctx.beginPath();
      ctx.arc(ix + Math.cos(angle) * dist, iy + Math.sin(angle) * dist, dropR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Dried ink sheen on roughnessMap
    rCtx.fillStyle = '#484848';
    rCtx.beginPath();
    rCtx.arc(ix, iy, radius * 0.8, 0, Math.PI * 2);
    rCtx.fill();
  };

  drawOrganicInkPool(825, 1310, 58, 28); // Bottom-right main match pool (matches reference)
  drawOrganicInkPool(150, 1290, 28, 14); // Bottom-left ink smudge
  drawOrganicInkPool(215, 150, 24, 12);  // Top-left ink blot
  drawOrganicInkPool(870, 260, 18, 8);   // Top-right stray flick

  // 7. Scratched Compass Carvings in Wood ("7B", "ROHIT", "PRIYA", "1998")
  const drawCarving = (text, x, y, angle, size = 34) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `bold ${size}px "Courier New", monospace`;
    // Exposed light wood inner scratch
    ctx.fillStyle = 'rgba(248, 214, 168, 0.48)';
    ctx.fillText(text, 1.5, 1.5);
    // Dark shadow carved groove
    ctx.fillStyle = 'rgba(48, 20, 5, 0.65)';
    ctx.fillText(text, 0, 0);
    ctx.restore();

    // Grooves on roughnessMap
    rCtx.save();
    rCtx.translate(x, y);
    rCtx.rotate(angle);
    rCtx.font = `bold ${size}px "Courier New", monospace`;
    rCtx.fillStyle = '#c5c5c5';
    rCtx.fillText(text, 0, 0);
    rCtx.restore();
  };

  drawCarving('7B', 540, 1410, -0.04, 44);
  drawCarving('ROHIT', 52, 1120, Math.PI / 2 - 0.05, 30);
  drawCarving('PRIYA', 975, 1060, -Math.PI / 2 + 0.04, 30);
  drawCarving('1998', 480, 1370, 0.02, 28);

  // Random compass & pen scratches
  for (let k = 0; k < 120; k++) {
    const sx = Math.random() * width;
    const sy = Math.random() * height;
    ctx.strokeStyle = Math.random() > 0.45
      ? 'rgba(52, 22, 6, 0.32)'
      : 'rgba(250, 218, 175, 0.32)';
    ctx.lineWidth = Math.random() * 1.8 + 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (Math.random() - 0.5) * 60, sy + (Math.random() - 0.5) * 50);
    ctx.stroke();
  }

  // 8. Darkened Varnish Edge Burnishing along Borders
  const edgeGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.38, width / 2, height / 2, height * 0.64);
  edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
  edgeGrad.addColorStop(1, 'rgba(38, 15, 3, 0.38)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, width, height);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.anisotropy = 4;

  return { map, roughnessMap };
}

// ---------------------------------------------------------------------------
// 3. High-Contrast Indian School IPS / Concrete Cement Floor Texture
// ---------------------------------------------------------------------------
export function createProceduralFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Weathered grey IPS concrete cement base
  ctx.fillStyle = '#656762';
  ctx.fillRect(0, 0, 1024, 1024);

  // High-contrast mottled concrete wear & cement stains
  for (let i = 0; i < 280; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = 16 + Math.random() * 75;
    ctx.fillStyle = Math.random() > 0.5
      ? 'rgba(72, 75, 70, 0.16)'
      : 'rgba(128, 132, 124, 0.14)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Expansion joint lines with chipped edges
  ctx.strokeStyle = 'rgba(42, 44, 40, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, 1020, 1020);

  // Chipped cement along joint borders
  for (let c = 0; c < 120; c++) {
    const edge = c % 4;
    let ex = 0, ey = 0;
    if (edge === 0) { ex = Math.random() * 1024; ey = 2 + (Math.random() - 0.5) * 6; }
    else if (edge === 1) { ex = 1022 + (Math.random() - 0.5) * 6; ey = Math.random() * 1024; }
    else if (edge === 2) { ex = Math.random() * 1024; ey = 1022 + (Math.random() - 0.5) * 6; }
    else { ex = 2 + (Math.random() - 0.5) * 6; ey = Math.random() * 1024; }

    ctx.fillStyle = 'rgba(38, 40, 36, 0.35)';
    ctx.fillRect(ex, ey, 4, 4);
  }

  // Hairline concrete cracks
  ctx.strokeStyle = 'rgba(38, 40, 36, 0.30)';
  ctx.lineWidth = 1.2;
  for (let c = 0; c < 8; c++) {
    let cx = Math.random() * 1024;
    let cy = Math.random() * 1024;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 6; s++) {
      cx += (Math.random() - 0.5) * 65;
      cy += (Math.random() - 0.5) * 65;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// ---------------------------------------------------------------------------
// 4. Dynamic Procedural Blackboard Texture ("Saraswati Vidyalaya 1998")
// ---------------------------------------------------------------------------
let bbCanvas = null;
let bbCtx = null;
let bbTexture = null;

export function renderBlackboardChalk(announcement = null) {
  if (!bbCtx) return;

  // Deep matte slate green chalkboard
  bbCtx.fillStyle = '#183629';
  bbCtx.fillRect(0, 0, 1024, 512);

  // Eraser smudge clouds (realistic chalk dust)
  for (let i = 0; i < 45; i++) {
    const cx = (i * 151.3) % 1024;
    const cy = (i * 97.7) % 512;
    const grad = bbCtx.createRadialGradient(cx, cy, 5, cx, cy, 90);
    grad.addColorStop(0, 'rgba(230, 240, 232, 0.055)');
    grad.addColorStop(1, 'rgba(230, 240, 232, 0)');
    bbCtx.fillStyle = grad;
    bbCtx.fillRect(cx - 90, cy - 90, 180, 180);
  }

  // Chalk Header Row (Positioned clearly in view)
  bbCtx.fillStyle = 'rgba(246, 248, 242, 0.94)';
  bbCtx.font = 'bold 34px "Courier New", monospace';
  bbCtx.fillText('DATE: 18-08-1998 • CLASS: 7TH-B', 48, 80);

  // School Title with Double Chalk Underline
  bbCtx.font = 'bold 46px "Courier New", monospace';
  bbCtx.fillStyle = 'rgba(252, 252, 246, 0.96)';
  bbCtx.fillText('SARASWATI VIDYALAYA', 225, 162);

  bbCtx.strokeStyle = 'rgba(246, 248, 242, 0.80)';
  bbCtx.lineWidth = 3;
  bbCtx.beginPath();
  bbCtx.moveTo(220, 177);
  bbCtx.lineTo(805, 177);
  bbCtx.moveTo(235, 185);
  bbCtx.lineTo(790, 185);
  bbCtx.stroke();

  // Thought of the day & Period
  bbCtx.font = 'italic 30px Georgia, serif';
  bbCtx.fillStyle = 'rgba(242, 246, 238, 0.92)';
  bbCtx.fillText('THOUGHT: Work is Worship  •  PERIOD: RECESS', 110, 250);

  // Live Match Status / Chalk Announcement Banner
  if (announcement) {
    bbCtx.strokeStyle = 'rgba(245, 208, 97, 0.88)';
    bbCtx.lineWidth = 3;
    bbCtx.strokeRect(140, 310, 744, 115);

    bbCtx.font = 'bold 36px "Courier New", monospace';
    bbCtx.fillStyle = '#f7d560';
    bbCtx.textAlign = 'center';
    bbCtx.fillText(announcement, 512, 380);
    bbCtx.textAlign = 'left';
  } else {
    bbCtx.font = '24px "Courier New", monospace';
    bbCtx.fillStyle = 'rgba(245, 248, 242, 0.65)';
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

// ---------------------------------------------------------------------------
// 5. Two-Tone 1990s Indian Classroom Wall Texture (Cream Plaster + Green Dado)
// ---------------------------------------------------------------------------
function createTwoToneWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Top 60%: Warm sunlit cream lime-plaster wall
  ctx.fillStyle = '#e5dcc5';
  ctx.fillRect(0, 0, 512, 307);

  // Bottom 40%: Indian school dark teal-green oil-paint dado
  ctx.fillStyle = '#215440';
  ctx.fillRect(0, 307, 512, 205);

  // Dark border stripe separating cream & green paint
  ctx.fillStyle = '#163b2c';
  ctx.fillRect(0, 304, 512, 6);

  // Wall plaster scuffs & subtle aging
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 4 + Math.random() * 24;
    ctx.fillStyle = y < 307
      ? 'rgba(180, 165, 135, 0.08)'
      : 'rgba(12, 35, 25, 0.14)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------------------------------------------------------------------------
// 6. Soft Contact Shadow Canvas for Grounding Furniture on Floor
// ---------------------------------------------------------------------------
function createSoftContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
  grad.addColorStop(0, 'rgba(18, 18, 16, 0.65)');
  grad.addColorStop(0.55, 'rgba(25, 25, 22, 0.32)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ---------------------------------------------------------------------------
// 7. Central Duel Desk + Authentic 1990s Saraswati Vidyalaya Classroom Scene
// ---------------------------------------------------------------------------
export function createDeskMesh(width, depth, thickness) {
  const group = new THREE.Group();
  const { map: deskTexture, roughnessMap: deskRoughness } = createProceduralDeskTextures();
  const teakWoodMat = getFurnitureTeakMaterial();
  const contactShadowTex = createSoftContactShadowTexture();

  // 1. Central Duel Desk Top Board (MeshPhysicalMaterial for Window Specular Glare)
  const topGeo = new THREE.BoxGeometry(width, thickness, depth);
  const topMat = new THREE.MeshPhysicalMaterial({
    map: deskTexture,
    roughnessMap: deskRoughness,
    bumpMap: deskRoughness,
    bumpScale: 0.0022,
    roughness: 0.32,             // Semi-gloss varnished teakwood
    clearcoat: 0.35,             // Realistic varnish top-coat
    clearcoatRoughness: 0.20,
    metalness: 0.02,
    reflectivity: 0.65
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = -thickness / 2;
  top.receiveShadow = true;
  top.castShadow = true;
  group.add(top);

  // 2. Sturdy Wooden Apron Frame & 4 Square Teak Legs
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

  // Under-table wooden apron beams (with teak wood grain)
  const sideApronGeo = new THREE.BoxGeometry(0.025, 0.075, depth - 0.09);
  const leftApron = new THREE.Mesh(sideApronGeo, teakWoodMat);
  leftApron.position.set(-width / 2 + 0.045, -thickness - 0.037, 0);
  leftApron.castShadow = true;
  group.add(leftApron);

  const rightApron = new THREE.Mesh(sideApronGeo, teakWoodMat);
  rightApron.position.set(width / 2 - 0.045, -thickness - 0.037, 0);
  rightApron.castShadow = true;
  group.add(rightApron);

  const frontApronGeo = new THREE.BoxGeometry(width - 0.09, 0.075, 0.025);
  const frontApron = new THREE.Mesh(frontApronGeo, teakWoodMat);
  frontApron.position.set(0, -thickness - 0.037, depth / 2 - 0.045);
  frontApron.castShadow = true;
  group.add(frontApron);

  // Wooden H-stretcher footrest bars near bottom
  const hBarGeo = new THREE.BoxGeometry(width - 0.09, 0.032, 0.032);
  const frontStretcher = new THREE.Mesh(hBarGeo, teakWoodMat);
  frontStretcher.position.set(0, -legHeight * 0.78 - thickness, depth / 2 - 0.045);
  frontStretcher.castShadow = true;
  group.add(frontStretcher);

  const centerStretcherGeo = new THREE.BoxGeometry(0.032, 0.032, depth - 0.09);
  const centerStretcher = new THREE.Mesh(centerStretcherGeo, teakWoodMat);
  centerStretcher.position.set(0, -legHeight * 0.78 - thickness, 0);
  centerStretcher.castShadow = true;
  group.add(centerStretcher);

  // 3. Grounded Contact Shadows directly beneath Main Desk
  const deskShadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    opacity: 0.65,
    depthWrite: false
  });
  const deskShadow = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.35, depth * 1.25), deskShadowMat);
  deskShadow.rotation.x = -Math.PI / 2;
  deskShadow.position.set(0, -legHeight - thickness + 0.002, 0);
  group.add(deskShadow);

  // 4. Weathered Cement Classroom Floor
  const floorGeo = new THREE.PlaneGeometry(9, 9);
  const floorMat = new THREE.MeshStandardMaterial({
    map: createProceduralFloorTexture(),
    roughness: 0.82,
    metalness: 0.02
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -legHeight - thickness, 0);
  floor.receiveShadow = true;
  group.add(floor);

  // 5. Two-Tone Front Wall + Left Sunlit Window Wall
  const wallTex = createTwoToneWallTexture();
  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    roughness: 0.88
  });

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 3.4), wallMat);
  frontWall.position.set(0, 0.45, -1.65);
  frontWall.receiveShadow = true;
  group.add(frontWall);

  // Left Wall positioned closer (x = -1.45) so the sunlit window is clearly visible in 9:16 frame
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 3.4), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-1.45, 0.45, 0);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Sunlit Classroom Window on Left Wall (Warm afternoon sunlight source)
  const winWidth = 1.15;
  const winHeight = 1.25;
  const winGlowMat = new THREE.MeshBasicMaterial({ color: 0xfff9eb });
  const winPane = new THREE.Mesh(new THREE.PlaneGeometry(winWidth, winHeight), winGlowMat);
  winPane.rotation.y = Math.PI / 2;
  winPane.position.set(-1.43, 0.38, -0.32);
  group.add(winPane);

  // Window wooden outer frame & vertical bars
  const winFrameMat = teakWoodMat;
  const winFrameTop = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, winWidth + 0.08), winFrameMat);
  winFrameTop.position.set(-1.42, 0.38 + winHeight / 2 + 0.025, -0.32);
  group.add(winFrameTop);

  const winFrameBottom = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, winWidth + 0.08), winFrameMat);
  winFrameBottom.position.set(-1.42, 0.38 - winHeight / 2 - 0.025, -0.32);
  group.add(winFrameBottom);

  for (let b = -0.38; b <= 0.38; b += 0.25) {
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.035, winHeight, 0.03), winFrameMat);
    vBar.position.set(-1.42, 0.38, -0.32 + b);
    group.add(vBar);
  }

  // 6. Large Wooden-Framed Green Chalkboard on Front Wall
  // Lowered to y = 0.24 so the chalk header row is never cut off by top HUD scoreboard
  const boardWidth = 1.48;
  const boardHeight = 0.68;
  const boardGeo = new THREE.BoxGeometry(boardWidth, boardHeight, 0.02);
  const boardMat = new THREE.MeshStandardMaterial({
    map: createProceduralBlackboardTexture(),
    roughness: 0.65
  });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0.06, 0.24, -1.62);
  group.add(board);

  // Teak Wooden Frame around Blackboard
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(boardWidth + 0.06, boardHeight + 0.06, 0.025),
    teakWoodMat
  );
  frame.position.set(0.06, 0.24, -1.63);
  group.add(frame);

  // Bottom chalk ledge + wooden duster + chalk sticks
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(boardWidth + 0.08, 0.025, 0.065), teakWoodMat);
  ledge.position.set(0.06, 0.24 - boardHeight / 2 - 0.02, -1.60);
  group.add(ledge);

  const duster = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.028, 0.042),
    teakWoodMat
  );
  duster.position.set(-0.22, 0.24 - boardHeight / 2 + 0.005, -1.59);
  group.add(duster);

  const chalkStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.045, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  chalkStick.rotation.z = Math.PI / 2;
  chalkStick.position.set(0.32, 0.24 - boardHeight / 2 - 0.004, -1.59);
  group.add(chalkStick);

  // Tube light above chalkboard on upper cream wall
  const tubeFixture = new THREE.Mesh(
    new THREE.BoxGeometry(0.80, 0.025, 0.035),
    new THREE.MeshBasicMaterial({ color: 0xfcfdfa })
  );
  tubeFixture.position.set(0.06, 0.72, -1.62);
  group.add(tubeFixture);

  // Subtle Overhead Rotating 3D Ceiling Fan Silhouette (Nostalgic classroom detail)
  const fanGroup = new THREE.Group();
  fanGroup.position.set(0.08, 1.05, -0.75);

  const downrod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.35, 8),
    new THREE.MeshStandardMaterial({ color: 0x3d3024, roughness: 0.6 })
  );
  downrod.position.y = 0.175;
  fanGroup.add(downrod);

  const fanHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.045, 12),
    new THREE.MeshStandardMaterial({ color: 0x4a3b2c, roughness: 0.5 })
  );
  fanGroup.add(fanHub);

  const fanBlades = new THREE.Group();
  for (let b = 0; b < 3; b++) {
    const bladeGeo = new THREE.BoxGeometry(0.38, 0.006, 0.075);
    const blade = new THREE.Mesh(
      bladeGeo,
      new THREE.MeshStandardMaterial({ color: 0x382c20, roughness: 0.55 })
    );
    blade.position.x = 0.22;
    const bladeHolder = new THREE.Group();
    bladeHolder.rotation.y = (b * Math.PI * 2) / 3;
    bladeHolder.add(blade);
    fanBlades.add(bladeHolder);
  }
  fanGroup.add(fanBlades);
  group.add(fanGroup);
  group.userData.ceilingFan = fanBlades; // Hooked to main animate loop for realistic slow rotation

  // 7. Teacher's Desk in Front of Blackboard (With PBR Teak Material)
  const teacherDesk = new THREE.Group();
  const tTop = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 0.45), teakWoodMat);
  tTop.castShadow = true;
  tTop.receiveShadow = true;
  teacherDesk.add(tTop);

  const tModesty = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.42, 0.02), teakWoodMat);
  tModesty.position.set(0, -0.22, 0.18);
  tModesty.castShadow = true;
  teacherDesk.add(tModesty);

  [[-0.38, -0.18], [0.38, -0.18], [-0.38, 0.18], [0.38, 0.18]].forEach(([lx, lz]) => {
    const tLeg = new THREE.Mesh(legGeo, teakWoodMat);
    tLeg.position.set(lx, -legHeight / 2, lz);
    tLeg.castShadow = true;
    teacherDesk.add(tLeg);
  });
  teacherDesk.position.set(0.02, -thickness / 2, -1.05);

  // Soft contact shadow for teacher desk
  const tShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.65), deskShadowMat);
  tShadow.rotation.x = -Math.PI / 2;
  tShadow.position.set(0.02, -legHeight - thickness + 0.002, -1.05);
  group.add(tShadow);
  group.add(teacherDesk);

  // 8. Student Side Benches (Full PBR Teak Material with Contact Shadows)
  const createWoodenSideBench = (x, z) => {
    const sideDesk = new THREE.Group();
    const sTop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.03, 0.68), teakWoodMat);
    sTop.castShadow = true;
    sTop.receiveShadow = true;
    sideDesk.add(sTop);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.68), teakWoodMat);
    seat.position.set(x > 0 ? 0.34 : -0.34, -0.22, 0);
    seat.castShadow = true;
    seat.receiveShadow = true;
    sideDesk.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.16, 0.68), teakWoodMat);
    back.position.set(x > 0 ? 0.45 : -0.45, -0.08, 0);
    back.castShadow = true;
    sideDesk.add(back);

    [[-0.20, -0.28], [0.20, -0.28], [-0.20, 0.28], [0.20, 0.28]].forEach(([lx, lz]) => {
      const sLeg = new THREE.Mesh(legGeo, teakWoodMat);
      sLeg.position.set(lx, -legHeight / 2, lz);
      sLeg.castShadow = true;
      sideDesk.add(sLeg);
    });

    sideDesk.position.set(x, -thickness / 2, z);

    // Bench contact shadow
    const bShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.85), deskShadowMat);
    bShadow.rotation.x = -Math.PI / 2;
    bShadow.position.set(x, -legHeight - thickness + 0.002, z);
    group.add(bShadow);

    return sideDesk;
  };

  group.add(createWoodenSideBench(-0.96, -0.48));
  group.add(createWoodenSideBench(-0.96, 0.48));
  group.add(createWoodenSideBench(0.96, -0.48));
  group.add(createWoodenSideBench(0.96, 0.48));

  return group;
}
