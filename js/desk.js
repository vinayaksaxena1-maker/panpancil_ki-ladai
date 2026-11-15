import * as THREE from 'three';

// 1. Procedural Desk Wood Texture with School Carvings
export function createProceduralDeskTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1460; // Matching 0.70m x 1.00m vertical table
  const ctx = canvas.getContext('2d');

  // Base warm honey school desk wood
  ctx.fillStyle = '#b67a42';
  ctx.fillRect(0, 0, 1024, 1460);

  // Wood grain layers
  ctx.fillStyle = 'rgba(128, 72, 35, 0.22)';
  for (let i = 0; i < 1460; i += 4) {
    const wave = Math.sin(i * 0.015) * 8 + Math.cos(i * 0.03) * 4;
    ctx.fillRect(0, i + wave, 1024, 2.5);
  }

  // School scratches / compass carvings
  ctx.strokeStyle = 'rgba(244, 235, 215, 0.50)';
  ctx.lineWidth = 2.5;

  // Scratched Compass Circles near opponent side
  ctx.beginPath();
  ctx.arc(420, 380, 70, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(420, 380, 110, 0, Math.PI * 1.5);
  ctx.stroke();

  // Scratched initials "7 - A" & "BENCH #4"
  ctx.font = 'bold 48px monospace';
  ctx.fillStyle = 'rgba(75, 42, 20, 0.38)';
  ctx.fillText('7 - A', 440, 750);
  ctx.font = 'bold 34px monospace';
  ctx.fillText('BENCH #4', 600, 1050);

  // Scratched geometric ruler ticks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  for (let r = 150; r < 600; r += 25) {
    ctx.beginPath();
    ctx.moveTo(r, 1250);
    ctx.lineTo(r, 1285);
    ctx.stroke();
  }

  // Random pencil & compass scratches across the board
  for (let k = 0; k < 80; k++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1460;
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(75, 38, 15, 0.32)' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = Math.random() * 2 + 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 45);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 2. Procedural Classroom Floor Tiling
export function createProceduralFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Cream ceramic tile base
  ctx.fillStyle = '#ded6be';
  ctx.fillRect(0, 0, 512, 512);

  // 4x4 Grid with grout lines
  const tileSize = 128;
  ctx.fillStyle = '#eae4d2';
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

      // Subtle noise on tile surface
      ctx.fillStyle = 'rgba(180, 170, 150, 0.12)';
      for (let n = 0; n < 18; n++) {
        const nx = x + 4 + Math.random() * (tileSize - 8);
        const ny = y + 4 + Math.random() * (tileSize - 8);
        ctx.fillRect(nx, ny, 3, 3);
      }
      ctx.fillStyle = '#eae4d2';
    }
  }

  // Darker grout lines
  ctx.strokeStyle = '#9c927f';
  ctx.lineWidth = 4;
  for (let i = 0; i <= 512; i += tileSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

// 3. Dynamic Procedural Blackboard Texture with Authentic School Chalk Text
let bbCanvas = null;
let bbCtx = null;
let bbTexture = null;

export function renderBlackboardChalk(p1Score = 0, botScore = 0, announcement = null) {
  if (!bbCtx) return;

  // Dark slate chalkboard green
  bbCtx.fillStyle = '#1e382b';
  bbCtx.fillRect(0, 0, 1024, 512);

  // Subtle chalk dust clouds
  bbCtx.fillStyle = 'rgba(235, 240, 235, 0.04)';
  for (let i = 0; i < 35; i++) {
    const cx = (i * 137.5) % 1024;
    const cy = (i * 83.3) % 512;
    bbCtx.beginPath();
    bbCtx.arc(cx, cy, 65, 0, Math.PI * 2);
    bbCtx.fill();
  }

  // Chalk Heading & Period info
  bbCtx.fillStyle = 'rgba(245, 248, 245, 0.92)';
  bbCtx.font = 'bold 32px monospace';
  bbCtx.fillText('CLASSROOM DUEL', 50, 75);
  bbCtx.font = '24px monospace';
  bbCtx.fillText('Period: Free Time', 50, 115);
  bbCtx.fillText('Standard: 9th Class', 720, 75);

  // Thought for the day
  bbCtx.font = 'italic 22px serif';
  bbCtx.fillStyle = 'rgba(245, 248, 245, 0.85)';
  bbCtx.fillText('Thought for the day: "Practice makes a man perfect"', 230, 130);

  // Center: "PEN FIGHT 3D" Sandbox Info Box
  bbCtx.strokeStyle = 'rgba(245, 248, 245, 0.65)';
  bbCtx.lineWidth = 3;
  bbCtx.strokeRect(300, 155, 424, 215);

  bbCtx.font = 'bold 36px monospace';
  bbCtx.fillStyle = 'rgba(245, 248, 245, 0.95)';
  bbCtx.fillText('PEN FIGHT 3D', 400, 205);

  bbCtx.font = '20px monospace';
  bbCtx.fillStyle = '#f2c75c';
  bbCtx.fillText('PHASE 1: 3D PHYSICS SANDBOX', 345, 240);

  // Knockout Counter
  bbCtx.font = 'bold 28px monospace';
  bbCtx.fillStyle = 'rgba(245, 248, 245, 0.95)';
  bbCtx.fillText(`PLAYER KOs : ${p1Score}`, 350, 290);
  bbCtx.fillText(`OPPONENT KOs: ${botScore}`, 350, 335);

  // Announcement / Mode Footer
  bbCtx.font = 'bold 24px monospace';
  if (announcement) {
    bbCtx.fillStyle = '#f2c75c'; // Bright yellow chalk announcement
    bbCtx.fillText(announcement, 330, 425);
  } else {
    bbCtx.fillStyle = 'rgba(245, 248, 245, 0.70)';
    bbCtx.font = '20px monospace';
    bbCtx.fillText('TACTILE SLIDE & COLLISION TEST', 335, 425);
  }

  if (bbTexture) {
    bbTexture.needsUpdate = true;
  }
}

export function updateBlackboardDisplay(p1Score, botScore, announcement = null) {
  renderBlackboardChalk(p1Score, botScore, announcement);
}

export function createProceduralBlackboardTexture() {
  bbCanvas = document.createElement('canvas');
  bbCanvas.width = 1024;
  bbCanvas.height = 512;
  bbCtx = bbCanvas.getContext('2d');
  bbTexture = new THREE.CanvasTexture(bbCanvas);

  renderBlackboardChalk(0, 0, null);
  return bbTexture;
}

// 4. Central Desk + Surrounding Classroom Environment
export function createDeskMesh(width, depth, thickness) {
  const group = new THREE.Group();
  const deskTexture = createProceduralDeskTexture();

  // 1. Central Duel Desk Top Board
  const topGeo = new THREE.BoxGeometry(width, thickness, depth);
  const topMat = new THREE.MeshStandardMaterial({
    map: deskTexture,
    roughness: 0.45,
    metalness: 0.04
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = -thickness / 2;
  top.receiveShadow = true;
  top.castShadow = true;
  group.add(top);

  // 2. 4 Black Iron Pipe Legs
  const legHeight = 0.72;
  const legRadius = 0.016;
  const legGeo = new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 16);
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x1f2329,
    roughness: 0.4,
    metalness: 0.75
  });

  const legPositions = [
    [-width / 2 + 0.04, -legHeight / 2 - thickness, -depth / 2 + 0.04],
    [width / 2 - 0.04, -legHeight / 2 - thickness, -depth / 2 + 0.04],
    [-width / 2 + 0.04, -legHeight / 2 - thickness, depth / 2 - 0.04],
    [width / 2 - 0.04, -legHeight / 2 - thickness, depth / 2 - 0.04],
  ];

  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    group.add(leg);
  });

  // Footrest rod
  const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, width - 0.08, 16);
  const rod = new THREE.Mesh(rodGeo, legMat);
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0, -legHeight * 0.7 - thickness, 0);
  group.add(rod);

  // 3. Classroom Floor
  const floorGeo = new THREE.PlaneGeometry(8, 8);
  const floorMat = new THREE.MeshStandardMaterial({
    map: createProceduralFloorTexture(),
    roughness: 0.55,
    metalness: 0.05
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -legHeight - thickness, 0);
  floor.receiveShadow = true;
  group.add(floor);

  // 4. Classroom Front Wall
  const wallGeo = new THREE.PlaneGeometry(8, 3.5);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x485e50, // Authentic classroom olive green matching penfight.xyz
    roughness: 0.90
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 0.35, -1.25);
  wall.receiveShadow = true;
  group.add(wall);

  // 5. Blackboard on Front Wall (Framed in camera view)
  const boardWidth = 1.08;
  const boardHeight = 0.48;
  const boardGeo = new THREE.BoxGeometry(boardWidth, boardHeight, 0.02);
  const boardMat = new THREE.MeshStandardMaterial({
    map: createProceduralBlackboardTexture(),
    roughness: 0.6
  });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0, 0.34, -1.22);
  group.add(board);

  // Blackboard wooden frame
  const frameGeo = new THREE.BoxGeometry(boardWidth + 0.04, boardHeight + 0.04, 0.025);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x5a381f,
    roughness: 0.5
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 0.34, -1.23);
  group.add(frame);

  // 6. Side Desks and Benches (Classroom Aisle)
  const sideDeskMat = new THREE.MeshStandardMaterial({
    color: 0xa86c38,
    roughness: 0.45
  });

  const createSideBench = (x, z) => {
    const sideDesk = new THREE.Group();
    // Desk top
    const sTopGeo = new THREE.BoxGeometry(0.55, 0.03, 0.70);
    const sTop = new THREE.Mesh(sTopGeo, sideDeskMat);
    sTop.castShadow = true;
    sTop.receiveShadow = true;
    sideDesk.add(sTop);

    // Bench seat
    const seatGeo = new THREE.BoxGeometry(0.25, 0.025, 0.70);
    const seat = new THREE.Mesh(seatGeo, sideDeskMat);
    seat.position.set(x > 0 ? 0.35 : -0.35, -0.22, 0);
    sideDesk.add(seat);

    // Bench backrest
    const backGeo = new THREE.BoxGeometry(0.02, 0.16, 0.70);
    const back = new THREE.Mesh(backGeo, sideDeskMat);
    back.position.set(x > 0 ? 0.47 : -0.47, -0.08, 0);
    sideDesk.add(back);

    // Frame legs
    const sLeg1 = new THREE.Mesh(legGeo, legMat);
    sLeg1.position.set(-0.20, -legHeight / 2, -0.28);
    sLeg1.castShadow = true;
    sideDesk.add(sLeg1);

    const sLeg2 = new THREE.Mesh(legGeo, legMat);
    sLeg2.position.set(0.20, -legHeight / 2, -0.28);
    sLeg2.castShadow = true;
    sideDesk.add(sLeg2);

    const sLeg3 = new THREE.Mesh(legGeo, legMat);
    sLeg3.position.set(-0.20, -legHeight / 2, 0.28);
    sLeg3.castShadow = true;
    sideDesk.add(sLeg3);

    const sLeg4 = new THREE.Mesh(legGeo, legMat);
    sLeg4.position.set(0.20, -legHeight / 2, 0.28);
    sLeg4.castShadow = true;
    sideDesk.add(sLeg4);

    sideDesk.position.set(x, -thickness / 2, z);
    return sideDesk;
  };

  // Left Row benches
  group.add(createSideBench(-1.04, -0.45));
  group.add(createSideBench(-1.04, 0.50));

  // Right Row benches
  group.add(createSideBench(1.04, -0.45));
  group.add(createSideBench(1.04, 0.50));

  // 7. Backpacks hanging on side desks
  const createBackpack = (color, x, y, z) => {
    const bagGroup = new THREE.Group();
    const bagMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.14), bagMat);
    mainBody.castShadow = true;
    bagGroup.add(mainBody);

    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.06), bagMat);
    pocket.position.set(0, -0.04, 0.09);
    bagGroup.add(pocket);

    bagGroup.position.set(x, y, z);
    return bagGroup;
  };

  // Blue backpack on right bench
  group.add(createBackpack(0x1e355b, 0.73, -0.15, -0.45));
  // Maroon backpack on left bench
  group.add(createBackpack(0x661e27, -0.73, -0.15, 0.10));

  return group;
}
