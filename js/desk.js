import * as THREE from 'three';

export function createProceduralDeskTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base authentic aged school wood
  ctx.fillStyle = '#b77a49';
  ctx.fillRect(0, 0, 1024, 1024);

  // Wood grain layers
  ctx.fillStyle = 'rgba(112, 69, 46, 0.28)';
  for (let i = 0; i < 1024; i += 3) {
    const wave = Math.sin(i * 0.02) * 6 + Math.cos(i * 0.04) * 3;
    ctx.fillRect(0, i + wave, 1024, 2);
  }

  // School scratches / compass carvings (Desi nostalgia)
  ctx.strokeStyle = 'rgba(244, 240, 228, 0.45)';
  ctx.lineWidth = 2.5;
  
  // Scratched Compass Circles
  ctx.beginPath();
  ctx.arc(320, 380, 50, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(320, 380, 90, 0, Math.PI * 1.6);
  ctx.stroke();

  // Scratched initials "7-A" & desk marks
  ctx.font = 'bold 42px monospace';
  ctx.fillStyle = 'rgba(60, 35, 15, 0.42)';
  ctx.fillText('7-A', 460, 480);
  ctx.font = 'bold 32px monospace';
  ctx.fillText('BENCH #4', 620, 720);

  // Scratched geometric ruler lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.5;
  for (let r = 100; r < 500; r += 20) {
    ctx.beginPath();
    ctx.moveTo(r, 850);
    ctx.lineTo(r, 870);
    ctx.stroke();
  }

  // Random pencil & compass scratches
  for (let k = 0; k < 75; k++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(70, 35, 15, 0.35)' : 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = Math.random() * 2 + 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 70, y + (Math.random() - 0.5) * 35);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// Exactly: Width: 0.70m, Depth: 0.45m, Thickness: 0.03m + 4 Iron Pipe Legs
export function createDeskMesh(width, depth, thickness) {
  const group = new THREE.Group();
  const deskTexture = createProceduralDeskTexture();

  // 1. Top Surface board (BoxGeometry: width 0.70, height/thickness 0.03, length/depth 0.45)
  const topGeo = new THREE.BoxGeometry(width, thickness, depth);
  const topMat = new THREE.MeshStandardMaterial({
    map: deskTexture,
    roughness: 0.50,
    metalness: 0.04
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = -thickness / 2;
  top.receiveShadow = true;
  group.add(top);

  // 2. 4 Black Painted School Iron Pipe Legs
  const legHeight = 0.72;
  const legRadius = 0.016;
  const legGeo = new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 16);
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x1f2329, // Painted black school iron pipes
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

  // 3. Horizontal desk footrest rod
  const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, width - 0.08, 16);
  const rod = new THREE.Mesh(rodGeo, legMat);
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0, -legHeight * 0.7 - thickness, 0);
  group.add(rod);

  return group;
}
