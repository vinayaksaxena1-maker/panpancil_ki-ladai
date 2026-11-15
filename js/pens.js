import * as THREE from 'three';

// 6 Balanced Classic Pens Config - Exactly as per Clean-Room Spec
export const PEN_CONFIGS = {
  trimax: {
    id: 'trimax',
    name: 'Reynolds Trimax',
    type: 'triangular', // 3-segmented Triangular Prism (Stops rolling, grips desk!)
    length: 0.146,
    radius: 0.0069,
    mass: 0.0155, // Heavy Tank mass
    color: 0x1d3557, // Deep Navy body
    accentColor: 0xd4af37, // Golden metal ring
    capColor: 0x112233,
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
    color: 0xf4f0e4, // Transparent Off-white body
    accentColor: 0x243b5a, // Classic blue cap
    capColor: 0x243b5a,
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
    color: 0xb77a49,
    accentColor: 0x111111, // Black rubber grip
    capColor: 0x333333,
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
    color: 0x3f8b61,
    accentColor: 0xc0c0c0,
    capColor: 0x27593f,
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
    color: 0xc85b4a, // Red & Black stripes
    accentColor: 0x111111,
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
    color: 0x222222, // Silver & Black stripes
    accentColor: 0xc0c0c0,
    capColor: 0x111111,
    restitution: 0.65,
    friction: 0.29,
    linearDamping: 0.06,
    angularDamping: 0.80
  }
};

// 7. Cel-Shaded Inverted Hull Outline Material (Comic Inking Effect)
const OUTLINE_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x111622, // Deep crisp comic inking black stroke
  side: THREE.BackSide
});

function createOutlinedMesh(geometry, material, scaleX = 1.07, scaleY = 1.01, scaleZ = 1.07) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Inverted hull child mesh scaled slightly outwards with BackSide culling
  const outline = new THREE.Mesh(geometry, OUTLINE_MATERIAL);
  outline.scale.set(scaleX, scaleY, scaleZ);
  mesh.add(outline);

  return mesh;
}

// Procedural 3D Mesh Creator (Aligned natively along Z-axis)
export function createPenMesh(config) {
  const group = new THREE.Group();
  const radius = config.radius;
  const len = config.length;
  // 3 segments for Trimax (Triangular), 6 for Pencils (Hexagonal), 28 for smooth cylinders
  const segments = config.type === 'triangular' ? 3 : (config.type === 'hexagonal' ? 6 : 28);

  const barrelLen = len * 0.60;
  const capLen = len * 0.22;
  const capRadius = radius * 1.10;
  const collarLen = len * 0.07;
  const nibLen = len * 0.11;

  // 1. Main Pen Barrel (Procedural cylindrical body)
  const barrelGeo = new THREE.CylinderGeometry(radius, radius, barrelLen, segments);
  const barrelMat = new THREE.MeshStandardMaterial({
    color: config.color,
    roughness: config.type === 'hexagonal' ? 0.65 : 0.32,
    metalness: config.id === 'trimax' ? 0.18 : 0.04
  });
  const barrel = createOutlinedMesh(barrelGeo, barrelMat, 1.08, 1.005, 1.08);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = -len * 0.04;
  group.add(barrel);

  // 2. Front Grip Collar (Blue grip for Reynolds 045 / Grip collar)
  const collarGeo = new THREE.CylinderGeometry(radius * 0.72, radius * 0.98, collarLen, segments);
  const collarMat = new THREE.MeshStandardMaterial({
    color: config.id === 'reynolds045' ? 0x243b5a : (config.accentColor || config.color),
    roughness: 0.28,
    metalness: 0.08
  });
  const collar = createOutlinedMesh(collarGeo, collarMat, 1.09, 1.01, 1.09);
  collar.rotation.x = Math.PI / 2;
  collar.position.z = barrel.position.z - barrelLen / 2 - collarLen / 2;
  group.add(collar);

  // 3. Front Nib (Sharpened Tip / Stainless Steel Nib)
  const nibGeo = new THREE.ConeGeometry(radius * 0.72, nibLen, segments);
  const nibMat = new THREE.MeshStandardMaterial({
    color: config.id.includes('pencil') ? 0x222222 : 0xe8e8e8, // Lead or Stainless Steel
    roughness: 0.15,
    metalness: config.id.includes('pencil') ? 0.10 : 0.92
  });
  const nib = createOutlinedMesh(nibGeo, nibMat, 1.10, 1.03, 1.10);
  nib.rotation.x = -Math.PI / 2;
  nib.position.z = collar.position.z - collarLen / 2 - nibLen / 2;
  group.add(nib);

  // Tiny Tungsten Ink Ball at apex of nib
  if (!config.id.includes('pencil')) {
    const ballGeo = new THREE.SphereGeometry(radius * 0.20, 12, 12);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.85 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.z = nib.position.z - nibLen / 2;
    group.add(ball);
  }

  // 4. Back Cap (Dhakkan plugged onto the back)
  const capGeo = new THREE.CylinderGeometry(capRadius, capRadius, capLen, segments);
  const capMat = new THREE.MeshStandardMaterial({
    color: config.capColor,
    roughness: 0.20,
    metalness: 0.08
  });
  const cap = createOutlinedMesh(capGeo, capMat, 1.08, 1.005, 1.08);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = barrel.position.z + barrelLen / 2 + capLen / 2;
  group.add(cap);

  // 5. Rubber Stopper / End-Cap Hemisphere (Round dome cap at +Z rear)
  const stopperGeo = new THREE.SphereGeometry(capRadius * 0.97, segments, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const stopperMat = new THREE.MeshStandardMaterial({
    color: config.id === 'reynolds045' ? 0x182c44 : config.capColor,
    roughness: 0.35,
    metalness: 0.05
  });
  const stopper = createOutlinedMesh(stopperGeo, stopperMat, 1.08, 1.08, 1.08);
  stopper.rotation.x = -Math.PI / 2; // Point dome outwards towards +Z
  stopper.position.z = cap.position.z + capLen / 2;
  group.add(stopper);

  // 6. Extruded Pen Clip (Dhakkan ki Patti)
  const clipGroup = new THREE.Group();
  const clipMat = new THREE.MeshStandardMaterial({
    color: config.accentColor && config.id === 'trimax' ? 0xd4af37 : config.capColor,
    roughness: 0.18,
    metalness: config.id === 'trimax' ? 0.80 : 0.15
  });

  // Base attachment lug on cap
  const baseLugGeo = new THREE.BoxGeometry(capRadius * 0.36, capRadius * 0.40, capLen * 0.18);
  const baseLug = createOutlinedMesh(baseLugGeo, clipMat, 1.15, 1.15, 1.10);
  baseLug.position.set(0, capRadius * 1.15, cap.position.z + capLen * 0.36);
  clipGroup.add(baseLug);

  // Long slender clip arm extending forward along cap
  const armLen = capLen * 0.80;
  const armGeo = new THREE.BoxGeometry(capRadius * 0.28, capRadius * 0.18, armLen);
  const arm = createOutlinedMesh(armGeo, clipMat, 1.15, 1.20, 1.04);
  arm.position.set(0, capRadius * 1.22, baseLug.position.z - armLen / 2);
  clipGroup.add(arm);

  // Clip beak / tip pressing down against pen
  const beakGeo = new THREE.BoxGeometry(capRadius * 0.28, capRadius * 0.30, capLen * 0.12);
  const beak = createOutlinedMesh(beakGeo, clipMat, 1.15, 1.15, 1.10);
  beak.position.set(0, capRadius * 1.10, arm.position.z - armLen / 2);
  clipGroup.add(beak);

  group.add(clipGroup);

  // 7. Golden Accent Ring (Trimax / Premium pens)
  if (config.accentColor && config.id !== 'reynolds045') {
    const ringGeo = new THREE.CylinderGeometry(radius * 1.05, radius * 1.05, len * 0.035, segments);
    const ringMat = new THREE.MeshStandardMaterial({
      color: config.accentColor,
      roughness: 0.18,
      metalness: 0.85
    });
    const ring = createOutlinedMesh(ringGeo, ringMat, 1.08, 1.02, 1.08);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = barrel.position.z + barrelLen / 2;
    group.add(ring);
  }

  return group;
}
