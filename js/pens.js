import * as THREE from 'three';

// 6 Balanced Classic Pens Config - Exactly as per Clean-Room Spec
export const PEN_CONFIGS = {
  trimax: {
    id: 'trimax',
    name: 'Reynolds Trimax',
    type: 'triangular', // 3-segmented Triangular Prism (Stops rolling, grips desk!)
    length: 0.146,
    radius: 0.0069,
    mass: 0.0155,
    color: 0x1d3557, // Deep Navy body
    accentColor: 0xd4af37, // Golden metal ring
    capColor: 0x112233,
    restitution: 0.20,
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
    mass: 0.0122,
    color: 0xf4f0e4, // Transparent Off-white body
    accentColor: 0x243b5a, // Classic blue cap
    capColor: 0x243b5a,
    restitution: 0.22,
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
    restitution: 0.18,
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
    restitution: 0.25,
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
    restitution: 0.15,
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
    restitution: 0.16,
    friction: 0.29,
    linearDamping: 0.06,
    angularDamping: 0.80
  }
};

// Procedural 3D Mesh Creator
// Aligned natively along Z-axis (lengthwise)
export function createPenMesh(config) {
  const group = new THREE.Group();
  const radius = config.radius;
  const len = config.length;
  // 3 segments for Trimax (Triangular), 6 segments for Pencils (Hexagonal), 24 for standard pens
  const segments = config.type === 'triangular' ? 3 : (config.type === 'hexagonal' ? 6 : 24);

  // 1. Main Pen Barrel (Cylinder along Y, rotated 90 deg so it lies along Z)
  const barrelGeo = new THREE.CylinderGeometry(radius, radius, len * 0.72, segments);
  const barrelMat = new THREE.MeshStandardMaterial({
    color: config.color,
    roughness: config.type === 'hexagonal' ? 0.6 : 0.25,
    metalness: config.id === 'trimax' ? 0.3 : 0.05
  });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.castShadow = true;
  barrel.receiveShadow = true;
  group.add(barrel);

  // 2. Front Nib / Sharpened Wooden Tip (Points forward to -Z)
  const nibLen = len * 0.16;
  const nibGeo = new THREE.ConeGeometry(radius, nibLen, segments);
  const nibMat = new THREE.MeshStandardMaterial({
    color: config.id.includes('pencil') ? 0x222222 : 0xdcdcdc, // Lead or Stainless Steel
    roughness: 0.2,
    metalness: config.id.includes('pencil') ? 0.1 : 0.85
  });
  const nib = new THREE.Mesh(nibGeo, nibMat);
  nib.rotation.x = -Math.PI / 2;
  nib.position.z = -(len * 0.72) / 2 - nibLen / 2;
  nib.castShadow = true;
  group.add(nib);

  // 3. Back Cap / Dhakkan (Flat base at +Z)
  const capLen = len * 0.12;
  const capGeo = new THREE.CylinderGeometry(radius * 1.06, radius * 1.06, capLen, segments);
  const capMat = new THREE.MeshStandardMaterial({
    color: config.capColor,
    roughness: 0.3,
    metalness: 0.1
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = (len * 0.72) / 2 + capLen / 2;
  cap.castShadow = true;
  group.add(cap);

  // 4. Clip on Cap
  const clipGeo = new THREE.BoxGeometry(radius * 0.35, radius * 0.45, capLen * 0.85);
  const clipMat = new THREE.MeshStandardMaterial({
    color: config.accentColor || 0xc0c0c0,
    metalness: 0.8,
    roughness: 0.2
  });
  const clip = new THREE.Mesh(clipGeo, clipMat);
  clip.position.set(0, radius * 1.25, (len * 0.72) / 2 + capLen / 2);
  group.add(clip);

  // 5. Rubber Grip Ring
  if (config.accentColor && config.id !== 'reynolds045') {
    const ringGeo = new THREE.CylinderGeometry(radius * 1.04, radius * 1.04, len * 0.16, segments);
    const ringMat = new THREE.MeshStandardMaterial({
      color: config.accentColor,
      roughness: 0.5,
      metalness: 0.2
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = -len * 0.15;
    group.add(ring);
  }

  return group;
}
