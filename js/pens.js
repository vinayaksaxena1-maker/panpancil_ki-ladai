import * as THREE from 'three';

// 6 Balanced Classic Pens Config - Clean-Room Physics Spec
export const PEN_CONFIGS = {
  trimax: {
    id: 'trimax',
    name: 'Reynolds Trimax',
    type: 'triangular', // 3-segmented Triangular Prism (Stops rolling, grips desk!)
    length: 0.146,
    radius: 0.0069,
    mass: 0.0155, // Heavy Tank mass
    color: 0x152844, // Deep Metallic Navy body
    accentColor: 0xd4af37, // Golden metal ring
    capColor: 0x0f1c30,
    restitution: 0.68, // ~70% Elasticity for crisp rigid plastic impact
    friction: 0.42,
    linearDamping: 0.06,
    angularDamping: 0.80
  },
  reynolds045: {
    id: 'reynolds045',
    name: 'Reynolds 045',
    type: 'cylinder', // 24-segmented smooth transparent cylinder
    length: 0.145,
    radius: 0.0049,
    mass: 0.0122, // Lighter Speed mass
    color: 0xf5f1e8, // Semi-translucent Off-white body
    accentColor: 0x1c3d73, // Classic blue cap & plug
    capColor: 0x1c3d73,
    restitution: 0.68, // ~70% Elasticity
    friction: 0.35,
    linearDamping: 0.06,
    angularDamping: 0.80
  },
  butterflow: {
    id: 'butterflow',
    name: 'Cello Butterflow',
    type: 'cylinder', // 24-segmented smooth cylinder + rubber grip
    length: 0.146,
    radius: 0.0053,
    mass: 0.0133,
    color: 0x9e602e, // Warm Amber Translucent
    accentColor: 0x151515, // Black rubber grip
    capColor: 0x242424,
    restitution: 0.68,
    friction: 0.28,
    linearDamping: 0.06,
    angularDamping: 0.80
  },
  pilotV5: {
    id: 'pilotV5',
    name: 'Pilot V5',
    type: 'cylinder', // 24-segmented precision cylinder
    length: 0.142,
    radius: 0.0046,
    mass: 0.0112,
    color: 0x184a2d, // Deep Emerald
    accentColor: 0xdcdcdc, // Silver precision ring
    capColor: 0x123621,
    restitution: 0.68,
    friction: 0.32,
    linearDamping: 0.06,
    angularDamping: 0.80
  },
  nataraj621: {
    id: 'nataraj621',
    name: 'Nataraj 621 Pencil',
    type: 'hexagonal', // 6-segmented Hexagonal Prism (6 flat sides)
    length: 0.176,
    radius: 0.0040,
    mass: 0.0087,
    color: 0xb5241c, // Red & Black stripes
    accentColor: 0x181818,
    capColor: 0x222222, // Dark graphite lead
    restitution: 0.65,
    friction: 0.30,
    linearDamping: 0.06,
    angularDamping: 0.80
  },
  apsaraPlatinum: {
    id: 'apsaraPlatinum',
    name: 'Apsara Platinum Pencil',
    type: 'hexagonal', // 6-segmented Hexagonal Prism
    length: 0.128,
    radius: 0.0040,
    mass: 0.0087,
    color: 0x202020, // Silver & Black stripes
    accentColor: 0xa8a8a8,
    capColor: 0x111111,
    restitution: 0.65,
    friction: 0.29,
    linearDamping: 0.06,
    angularDamping: 0.80
  }
};

// 1. Procedural High-Res UV Canvas Decal Generator (Logos, Brands, Decals)
function createPenDecalTexture(config) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (config.id === 'reynolds045') {
    // Semi-translucent milky white plastic barrel
    ctx.fillStyle = '#f4f0e6';
    ctx.fillRect(0, 0, 1024, 256);

    // Subtle longitudinal plastic mold seam
    ctx.fillStyle = 'rgba(215, 205, 190, 0.45)';
    ctx.fillRect(0, 126, 1024, 4);

    // Iconic Red & Blue "045 REYNOLDS FINE CARBURE" Stamp
    ctx.fillStyle = '#b7221a';
    ctx.font = 'bold 44px -apple-system, sans-serif';
    ctx.fillText('045', 280, 145);

    ctx.fillStyle = '#1c3d73';
    ctx.font = 'bold 36px "Arial Black", sans-serif';
    ctx.fillText('REYNOLDS', 390, 145);

    ctx.font = 'bold 22px monospace';
    ctx.fillText('FINE CARBURE  •  FRANCE', 660, 145);

    // Decorative fine blue border lines
    ctx.strokeStyle = '#1c3d73';
    ctx.lineWidth = 3;
    ctx.strokeRect(260, 95, 620, 66);

  } else if (config.id === 'trimax') {
    // Deep metallic navy triangular body
    ctx.fillStyle = '#13233c';
    ctx.fillRect(0, 0, 1024, 256);

    // Golden metallic branding
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 42px "Arial Black", sans-serif';
    ctx.fillText('★  REYNOLDS TRIMAX  ★', 320, 145);

    ctx.font = '22px monospace';
    ctx.fillText('ADVANCED FLUID INK SYSTEM', 360, 185);

    // Golden border stripes
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(924, 100);
    ctx.moveTo(100, 200);
    ctx.lineTo(924, 200);
    ctx.stroke();

  } else if (config.id === 'pilotV5') {
    // Deep emerald green body
    ctx.fillStyle = '#163d27';
    ctx.fillRect(0, 0, 1024, 256);

    // Silver hi-tecpoint branding
    ctx.fillStyle = '#e2e6e3';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('PILOT  V5', 300, 135);

    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#a8b5ab';
    ctx.fillText('HI-TECPOINT  0.5', 540, 135);

    // Ink level window illustration
    ctx.fillStyle = '#08140d';
    ctx.fillRect(200, 155, 620, 22);
    ctx.fillStyle = '#2d6d45';
    ctx.fillRect(204, 159, 440, 14);

  } else if (config.id === 'butterflow') {
    // Amber body with black grip section
    ctx.fillStyle = '#9e602e';
    ctx.fillRect(0, 0, 1024, 256);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic bold 46px serif';
    ctx.fillText('cello  Butterflow', 340, 145);

    ctx.font = '20px sans-serif';
    ctx.fillText('SMOOTHEST BALLPEN', 410, 180);

  } else if (config.id === 'nataraj621') {
    // Red and black stripes
    for (let y = 0; y < 256; y += 42) {
      ctx.fillStyle = (Math.floor(y / 42) % 2 === 0) ? '#b5241c' : '#141414';
      ctx.fillRect(0, y, 1024, 42);
    }
    // Gold embossed stamp
    ctx.fillStyle = '#e6c86e';
    ctx.font = 'bold 42px monospace';
    ctx.fillText('★ NATARAJ 621 ★  HB', 340, 145);

  } else if (config.id === 'apsaraPlatinum') {
    // Silver and dark charcoal stripes
    for (let y = 0; y < 256; y += 42) {
      ctx.fillStyle = (Math.floor(y / 42) % 2 === 0) ? '#8f9296' : '#141414';
      ctx.fillRect(0, y, 1024, 42);
    }
    // Silver foil stamp
    ctx.fillStyle = '#f0f0f0';
    ctx.font = 'bold 38px monospace';
    ctx.fillText('APSARA PLATINUM  EXTRA DARK', 280, 145);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 2. Inverted Hull Cel-Shading Outline Helper (Comic / Pop-out Inking Effect)
function addInvertedHullOutline(mesh, scaleFactor = 1.035, outlineColor = 0x14181f) {
  const outlineGeo = mesh.geometry.clone();
  const outlineMat = new THREE.MeshBasicMaterial({
    color: outlineColor,
    side: THREE.BackSide
  });
  const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat);
  outlineMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
  mesh.add(outlineMesh);
  return outlineMesh;
}

// 3. Procedural 3D Mesh Creator with 5 PBR & Cel-Shaded Tricks
export function createPenMesh(config) {
  const group = new THREE.Group();
  const radius = config.radius;
  const len = config.length;
  const segments = config.type === 'triangular' ? 3 : (config.type === 'hexagonal' ? 6 : 24);

  const decalTexture = createPenDecalTexture(config);

  // 1. Main Pen Barrel (PBR MeshPhysicalMaterial with Clearcoat shine & Decal wrap)
  const barrelLen = len * 0.72;
  const barrelGeo = new THREE.CylinderGeometry(radius, radius, barrelLen, segments);
  const barrelMat = new THREE.MeshPhysicalMaterial({
    map: decalTexture,
    color: 0xffffff,
    roughness: config.type === 'hexagonal' ? 0.55 : 0.28,
    metalness: config.id === 'trimax' ? 0.25 : 0.02,
    clearcoat: config.type === 'hexagonal' ? 0.2 : 0.65,
    clearcoatRoughness: 0.20,
    flatShading: config.type === 'triangular' || config.type === 'hexagonal'
  });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.castShadow = true;
  barrel.receiveShadow = true;
  group.add(barrel);
  addInvertedHullOutline(barrel, 1.035);

  // 2. Internal Refill Tube (visible inside Reynolds 045 translucent barrel)
  if (config.id === 'reynolds045' || config.id === 'butterflow') {
    // Inner plastic refill rod
    const refillGeo = new THREE.CylinderGeometry(radius * 0.40, radius * 0.40, barrelLen * 0.90, 12);
    const refillMat = new THREE.MeshStandardMaterial({
      color: 0xfcfcfc,
      roughness: 0.4,
      metalness: 0.0
    });
    const refill = new THREE.Mesh(refillGeo, refillMat);
    refill.rotation.x = Math.PI / 2;
    group.add(refill);

    // Inner ink column (Blue ink inside refill)
    const inkGeo = new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, barrelLen * 0.68, 12);
    const inkMat = new THREE.MeshStandardMaterial({
      color: 0x183a78,
      roughness: 0.3,
      metalness: 0.1
    });
    const ink = new THREE.Mesh(inkGeo, inkMat);
    ink.rotation.x = Math.PI / 2;
    ink.position.z = -barrelLen * 0.06;
    group.add(ink);
  }

  // 3. Front Metal Nib / Cone Tip (Stainless steel sheen)
  const nibLen = len * 0.16;
  if (config.type === 'hexagonal') {
    // Sharpened wood cone for pencils
    const woodGeo = new THREE.ConeGeometry(radius, nibLen, segments);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xdfba8c, roughness: 0.6 });
    const wood = new THREE.Mesh(woodGeo, woodMat);
    wood.rotation.x = -Math.PI / 2;
    wood.position.z = -barrelLen / 2 - nibLen / 2;
    wood.castShadow = true;
    group.add(wood);
    addInvertedHullOutline(wood, 1.035);

    // Exposed graphite lead tip
    const leadLen = nibLen * 0.32;
    const leadGeo = new THREE.ConeGeometry(radius * 0.35, leadLen, segments);
    const leadMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.2, metalness: 0.8 });
    const lead = new THREE.Mesh(leadGeo, leadMat);
    lead.rotation.x = -Math.PI / 2;
    lead.position.z = -barrelLen / 2 - nibLen + leadLen / 2;
    lead.castShadow = true;
    group.add(lead);
  } else {
    // Metal Nib
    const nibGeo = new THREE.ConeGeometry(radius, nibLen, segments);
    const nibMat = new THREE.MeshPhysicalMaterial({
      color: 0xe8e8e8,
      metalness: 0.90,
      roughness: 0.14,
      clearcoat: 0.5
    });
    const nib = new THREE.Mesh(nibGeo, nibMat);
    nib.rotation.x = -Math.PI / 2;
    nib.position.z = -barrelLen / 2 - nibLen / 2;
    nib.castShadow = true;
    group.add(nib);
    addInvertedHullOutline(nib, 1.035);

    // Ballpoint micro-tip sphere
    const ballGeo = new THREE.SphereGeometry(radius * 0.32, 12, 12);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.95, roughness: 0.1 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.z = -barrelLen / 2 - nibLen;
    group.add(ball);
  }

  // 4. Back Cap / Dhakkan (Iconic shaped cap with rim)
  const capLen = len * 0.14;
  const capRadius = radius * 1.08;
  const capGeo = new THREE.CylinderGeometry(capRadius, capRadius, capLen, segments);
  const capMat = new THREE.MeshPhysicalMaterial({
    color: config.capColor,
    roughness: 0.24,
    metalness: config.id === 'trimax' ? 0.15 : 0.04,
    clearcoat: 0.70,
    clearcoatRoughness: 0.18,
    flatShading: config.type === 'triangular'
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = barrelLen / 2 + capLen / 2;
  cap.castShadow = true;
  group.add(cap);
  addInvertedHullOutline(cap, 1.035);

  // Rounded end stopper (Hemisphere on the end of the cap)
  const stopperGeo = new THREE.SphereGeometry(capRadius, segments, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const stopper = new THREE.Mesh(stopperGeo, capMat);
  stopper.rotation.x = Math.PI / 2;
  stopper.position.z = barrelLen / 2 + capLen;
  stopper.castShadow = true;
  group.add(stopper);
  addInvertedHullOutline(stopper, 1.035);

  // 5. Pocket Clip (Extruded glossy plastic/metal clip firmly attached to cap)
  const clipLen = capLen * 0.85;
  const clipGeo = new THREE.BoxGeometry(radius * 0.38, radius * 0.50, clipLen);
  const clipMat = new THREE.MeshPhysicalMaterial({
    color: config.accentColor || 0xd8d8d8,
    metalness: config.id === 'trimax' || config.id === 'pilotV5' ? 0.90 : 0.20,
    roughness: 0.18,
    clearcoat: 0.60
  });
  const clip = new THREE.Mesh(clipGeo, clipMat);
  clip.position.set(0, capRadius + radius * 0.20, barrelLen / 2 + capLen * 0.45);
  clip.castShadow = true;
  group.add(clip);
  addInvertedHullOutline(clip, 1.045);

  // 6. Accent Gold / Rubber Grip Rings
  if (config.id === 'trimax') {
    // Gold separator ring between body and tip
    const ringGeo = new THREE.CylinderGeometry(radius * 1.06, radius * 1.06, len * 0.035, 16);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.92,
      roughness: 0.15,
      clearcoat: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = -barrelLen * 0.42;
    group.add(ring);
    addInvertedHullOutline(ring, 1.035);
  } else if (config.id === 'butterflow') {
    // Textured black rubber grip
    const gripGeo = new THREE.CylinderGeometry(radius * 1.08, radius * 1.08, len * 0.18, 20);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.80,
      metalness: 0.05
    });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.rotation.x = Math.PI / 2;
    grip.position.z = -barrelLen * 0.35;
    group.add(grip);
    addInvertedHullOutline(grip, 1.035);
  }

  return group;
}
