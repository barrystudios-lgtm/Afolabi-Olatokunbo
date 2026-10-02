// Realistic Daylight Urban City Highway Runner Engine
// Street Runner by Barrystudios

import * as THREE from 'three';
import { PowerUpType, CharacterSkin, HoverboardSkin } from './types';
import { soundEngine } from './audio';

export interface GameCallbacks {
  onScoreUpdate: (score: number) => void;
  onCoinsUpdate: (coins: number) => void;
  onPowerUpUpdate: (powerUps: { type: PowerUpType; timeLeft: number; duration: number }[]) => void;
  onHoverboardUpdate: (active: boolean, timeLeft: number) => void;
  onPoliceProximityUpdate: (distance: number, warningLevel: 'SAFE' | 'WARNING' | 'DANGER') => void;
  onGameOver: (finalStats: {
    score: number;
    coins: number;
    distance: number;
    vehiclesJumped: number;
    gantriesSlid: number;
    survivalSecs: number;
  }) => void;
  onMissionEvent: (type: 'jumps_vehicle' | 'slides_gantry' | 'boards_used', count: number) => void;
}

export class ThreeRunner {
  private container: HTMLElement;
  private callbacks: GameCallbacks;

  // Three.js core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private animFrameId: number | null = null;

  // Game State
  private isRunning = false;
  private isPaused = false;
  private speed = 26; // Forward speed (units/sec)
  private maxSpeed = 50;
  private distance = 0;
  private score = 0;
  private coins = 0;
  private survivalSecs = 0;
  private vehiclesJumpedCount = 0;
  private gantriesSlidCount = 0;
  private multiplier = 1;

  // Lanes
  private currentLane = 0; // -1: Left, 0: Center, 1: Right
  private targetLaneX = 0;
  private readonly LANE_WIDTH = 3.2;

  // Player Kinematics
  private playerGroup: THREE.Group;
  private playerX = 0;
  private playerY = 0;
  private playerZ = 0;
  private velocityY = 0;
  private isGrounded = true;
  private isJumping = false;
  private isSliding = false;
  private slideTimer = 0;
  private readonly SLIDE_DURATION = 0.75;
  private jumpPower = 15.5;
  private baseJumpPower = 15.5;
  private gravity = -44;
  private currentSkin: CharacterSkin;
  private currentBoard: HoverboardSkin;

  // Articulated Realistic Character Skeleton / Hierarchy
  private torsoMesh!: THREE.Mesh;
  private headGroup!: THREE.Group;
  private hairMesh!: THREE.Mesh;
  private leftUpperArmGroup!: THREE.Group;
  private rightUpperArmGroup!: THREE.Group;
  private leftLowerArmGroup!: THREE.Group;
  private rightLowerArmGroup!: THREE.Group;
  private leftUpperLegGroup!: THREE.Group;
  private rightUpperLegGroup!: THREE.Group;
  private leftLowerLegGroup!: THREE.Group;
  private rightLowerLegGroup!: THREE.Group;
  private hoverboardMesh!: THREE.Group;
  private jetpackMesh!: THREE.Group;

  // Active Hoverboard & Power-ups
  private isHoverboardActive = false;
  private hoverboardTimer = 0;
  private activePowerUps: Map<PowerUpType, { timeLeft: number; duration: number }> = new Map();
  private invincibilityTimer = 0;

  // Realistic Tactical Android Police Enforcer (Chase Unit)
  private policeGroup: THREE.Group;
  private policeTorso!: THREE.Mesh;
  private policeLeftArm!: THREE.Group;
  private policeRightArm!: THREE.Group;
  private policeLeftLeg!: THREE.Group;
  private policeRightLeg!: THREE.Group;
  private policeSirenRedLight!: THREE.PointLight;
  private policeSirenBlueLight!: THREE.PointLight;
  private policeDistance = 8.0; // Distance behind player in Z (never merges!)
  private targetPoliceDistance = 8.0;
  private policeStumblePenaltyTimer = 0;

  // Highway Track Chunks
  private highwayChunks: THREE.Group[] = [];
  private readonly CHUNK_LENGTH = 70;
  private readonly CHUNK_COUNT = 6;

  // Obstacles, Pickups & Vehicles (strictly non-overlapping!)
  private obstacles: {
    group: THREE.Group;
    type: 'CAR' | 'TRUCK' | 'GANTRY' | 'BARRICADE';
    lane: number;
    z: number;
    y: number;
    width: number;
    height: number;
    length: number;
    isPassed: boolean;
    speed?: number;
    hasRamp?: boolean;
    rampStartZ?: number;
    rampEndZ?: number;
    rampHeight?: number;
  }[] = [];

  private pickups: {
    mesh: THREE.Object3D;
    type: 'COIN' | PowerUpType;
    lane: number;
    z: number;
    y: number;
    collected: boolean;
  }[] = [];

  // Reusable Shared Geometries & Materials
  private coinGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 18);
  private coinMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.85,
    roughness: 0.2,
    emissive: 0xb45309,
    emissiveIntensity: 0.3
  });

  constructor(container: HTMLElement, skin: CharacterSkin, board: HoverboardSkin, callbacks: GameCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.currentSkin = skin;
    this.currentBoard = board;
    this.clock = new THREE.Clock();

    // Scene with realistic daylight sky and atmospheric haze
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x73b3f3); // Vibrant clear blue sky
    this.scene.fog = new THREE.FogExp2(0xb6d8f8, 0.0065); // Realistic distant daytime haze

    // Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 450);
    this.camera.position.set(0, 4.6, 7.8);
    this.camera.lookAt(0, 1.8, -14);

    // High performance WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // Realistic Daylight Lighting
    this.setupDaylightLighting();

    // Build Highway Chunks
    for (let i = 0; i < this.CHUNK_COUNT; i++) {
      const chunk = this.createHighwayChunk(i * -this.CHUNK_LENGTH);
      this.highwayChunks.push(chunk);
      this.scene.add(chunk);
    }

    // Build Realistic Articulated Player Character
    this.playerGroup = this.buildRealisticPlayerMesh();
    this.scene.add(this.playerGroup);

    // Build Realistic Tactical Police Officer
    this.policeGroup = this.buildRealisticPoliceMesh();
    this.scene.add(this.policeGroup);

    // Populate Initial Highway Traffic
    this.populateInitialTrack();

    // Resize listener
    window.addEventListener('resize', this.onWindowResize);

    // Start animation loop
    this.startLoop();
  }

  // Realistic Daylight Lighting (Sun + Sky Hemisphere + Ambient)
  private setupDaylightLighting() {
    // Hemispheric Sky/Ground bounce light (Natural daylight)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x475569, 1.3);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // Bright Sun Directional Light (Warm White sunlight casting crisp shadows)
    const sunLight = new THREE.DirectionalLight(0xfffaea, 2.8);
    sunLight.position.set(25, 45, 20);
    this.scene.add(sunLight);

    // Soft sky fill light from opposite angle to prevent dark pitch-black shadows
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.1);
    fillLight.position.set(-25, 30, -15);
    this.scene.add(fillLight);
  }

  // Build Realistic, Bold Articulated Human Runner
  // Every limb is cleanly pivoted and never intersects/merges into other body parts!
  private buildRealisticPlayerMesh(): THREE.Group {
    const group = new THREE.Group();

    // Realistic Materials
    const skinToneColor = new THREE.Color(this.currentSkin.skinTone || '#d4986a');
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: skinToneColor,
      roughness: 0.65,
      metalness: 0.05
    });

    const primaryClothMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.currentSkin.primaryColor),
      roughness: 0.5,
      metalness: 0.1
    });

    const accentClothMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.currentSkin.accentColor),
      roughness: 0.6,
      metalness: 0.15
    });

    const shoeSoleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.05
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.currentSkin.hairColor || '#171717'),
      roughness: 0.7,
      metalness: 0.05
    });

    // 1. Hips / Pelvis (Root anchor)
    const hipsGeo = new THREE.BoxGeometry(0.55, 0.28, 0.36);
    const hipsMesh = new THREE.Mesh(hipsGeo, accentClothMat);
    hipsMesh.position.y = 0.95;
    group.add(hipsMesh);

    // 2. Torso (Jacket / Hoodie)
    const torsoGeo = new THREE.BoxGeometry(0.62, 0.72, 0.4);
    this.torsoMesh = new THREE.Mesh(torsoGeo, primaryClothMat);
    this.torsoMesh.position.set(0, 0.48, 0);
    hipsMesh.add(this.torsoMesh);

    // Hoodie collar / zipper line
    const zipperGeo = new THREE.BoxGeometry(0.06, 0.68, 0.04);
    const zipperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5 });
    const zipper = new THREE.Mesh(zipperGeo, zipperMat);
    zipper.position.set(0, 0, 0.21);
    this.torsoMesh.add(zipper);

    // 3. Head & Face
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.52, 0);
    this.torsoMesh.add(this.headGroup);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.14, 10);
    const neck = new THREE.Mesh(neckGeo, skinMaterial);
    neck.position.y = 0.05;
    this.headGroup.add(neck);

    // Head skull
    const headGeo = new THREE.BoxGeometry(0.36, 0.4, 0.36);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.y = 0.24;
    this.headGroup.add(head);

    // Hair / Cap
    const hairGeo = new THREE.BoxGeometry(0.38, 0.18, 0.38);
    this.hairMesh = new THREE.Mesh(hairGeo, hairMat);
    this.hairMesh.position.set(0, 0.38, -0.02);
    this.headGroup.add(this.hairMesh);

    // Running Sunglasses / Sport Visor
    const glassesGeo = new THREE.BoxGeometry(0.36, 0.1, 0.12);
    const glassesMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.1, metalness: 0.8 });
    const glasses = new THREE.Mesh(glassesGeo, glassesMat);
    glasses.position.set(0, 0.26, 0.16);
    this.headGroup.add(glasses);

    // 4. Arms (Pivoting from shoulders)
    // Left Arm
    this.leftUpperArmGroup = new THREE.Group();
    this.leftUpperArmGroup.position.set(-0.38, 0.28, 0);
    this.torsoMesh.add(this.leftUpperArmGroup);

    const upperArmGeo = new THREE.BoxGeometry(0.18, 0.4, 0.18);
    const leftUpperArmMesh = new THREE.Mesh(upperArmGeo, primaryClothMat);
    leftUpperArmMesh.position.y = -0.18;
    this.leftUpperArmGroup.add(leftUpperArmMesh);

    this.leftLowerArmGroup = new THREE.Group();
    this.leftLowerArmGroup.position.set(0, -0.36, 0);
    this.leftUpperArmGroup.add(this.leftLowerArmGroup);

    const lowerArmGeo = new THREE.BoxGeometry(0.16, 0.38, 0.16);
    const leftLowerArmMesh = new THREE.Mesh(lowerArmGeo, skinMaterial);
    leftLowerArmMesh.position.y = -0.16;
    this.leftLowerArmGroup.add(leftLowerArmMesh);

    // Right Arm
    this.rightUpperArmGroup = new THREE.Group();
    this.rightUpperArmGroup.position.set(0.38, 0.28, 0);
    this.torsoMesh.add(this.rightUpperArmGroup);

    const rightUpperArmMesh = new THREE.Mesh(upperArmGeo, primaryClothMat);
    rightUpperArmMesh.position.y = -0.18;
    this.rightUpperArmGroup.add(rightUpperArmMesh);

    this.rightLowerArmGroup = new THREE.Group();
    this.rightLowerArmGroup.position.set(0, -0.36, 0);
    this.rightUpperArmGroup.add(this.rightLowerArmGroup);

    const rightLowerArmMesh = new THREE.Mesh(lowerArmGeo, skinMaterial);
    rightLowerArmMesh.position.y = -0.16;
    this.rightLowerArmGroup.add(rightLowerArmMesh);

    // 5. Legs (Pivoting cleanly from hips)
    // Left Leg
    this.leftUpperLegGroup = new THREE.Group();
    this.leftUpperLegGroup.position.set(-0.18, -0.12, 0);
    hipsMesh.add(this.leftUpperLegGroup);

    const upperLegGeo = new THREE.BoxGeometry(0.22, 0.48, 0.24);
    const leftThigh = new THREE.Mesh(upperLegGeo, accentClothMat);
    leftThigh.position.y = -0.22;
    this.leftUpperLegGroup.add(leftThigh);

    this.leftLowerLegGroup = new THREE.Group();
    this.leftLowerLegGroup.position.set(0, -0.44, 0);
    this.leftUpperLegGroup.add(this.leftLowerLegGroup);

    const calfGeo = new THREE.BoxGeometry(0.2, 0.44, 0.22);
    const leftCalf = new THREE.Mesh(calfGeo, accentClothMat);
    leftCalf.position.y = -0.18;
    this.leftLowerLegGroup.add(leftCalf);

    // Left Athletic Running Sneaker
    const shoeGeo = new THREE.BoxGeometry(0.22, 0.16, 0.44);
    const leftShoeUpper = new THREE.Mesh(shoeGeo, primaryClothMat);
    leftShoeUpper.position.set(0, -0.4, 0.08);
    const leftShoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.06, 0.46), shoeSoleMat);
    leftShoeSole.position.set(0, -0.48, 0.08);
    this.leftLowerLegGroup.add(leftShoeUpper, leftShoeSole);

    // Right Leg
    this.rightUpperLegGroup = new THREE.Group();
    this.rightUpperLegGroup.position.set(0.18, -0.12, 0);
    hipsMesh.add(this.rightUpperLegGroup);

    const rightThigh = new THREE.Mesh(upperLegGeo, accentClothMat);
    rightThigh.position.y = -0.22;
    this.rightUpperLegGroup.add(rightThigh);

    this.rightLowerLegGroup = new THREE.Group();
    this.rightLowerLegGroup.position.set(0, -0.44, 0);
    this.rightUpperLegGroup.add(this.rightLowerLegGroup);

    const rightCalf = new THREE.Mesh(calfGeo, accentClothMat);
    rightCalf.position.y = -0.18;
    this.rightLowerLegGroup.add(rightCalf);

    // Right Athletic Running Sneaker
    const rightShoeUpper = new THREE.Mesh(shoeGeo, primaryClothMat);
    rightShoeUpper.position.set(0, -0.4, 0.08);
    const rightShoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.06, 0.46), shoeSoleMat);
    rightShoeSole.position.set(0, -0.48, 0.08);
    this.rightLowerLegGroup.add(rightShoeUpper, rightShoeSole);

    // 6. Sleek Modern Hoverboard (hidden unless active)
    this.hoverboardMesh = new THREE.Group();
    const boardDeckGeo = new THREE.BoxGeometry(0.85, 0.08, 1.9);
    const boardMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.currentBoard.color),
      metalness: 0.65,
      roughness: 0.25
    });
    const deck = new THREE.Mesh(boardDeckGeo, boardMat);

    // Grip tape on top
    const gripGeo = new THREE.BoxGeometry(0.78, 0.02, 1.7);
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.y = 0.045;
    deck.add(grip);

    // Magnetic levitation repulsor discs underneath
    const repulsorGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 14);
    const repulsorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const repulsorFront = new THREE.Mesh(repulsorGeo, repulsorMat);
    repulsorFront.position.set(0, -0.06, -0.55);
    const repulsorRear = new THREE.Mesh(repulsorGeo, repulsorMat);
    repulsorRear.position.set(0, -0.06, 0.55);
    deck.add(repulsorFront, repulsorRear);

    this.hoverboardMesh.add(deck);
    this.hoverboardMesh.position.y = 0.08;
    this.hoverboardMesh.visible = false;
    group.add(this.hoverboardMesh);

    // 7. Compact Jetpack Wings (for skyway flight)
    this.jetpackMesh = new THREE.Group();
    const jpBodyGeo = new THREE.BoxGeometry(0.48, 0.5, 0.2);
    const jpBodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const jpBody = new THREE.Mesh(jpBodyGeo, jpBodyMat);
    this.jetpackMesh.add(jpBody);

    const turbineGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.55, 12);
    const turbineMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 });
    const leftTurbine = new THREE.Mesh(turbineGeo, turbineMat);
    leftTurbine.position.set(-0.3, 0, 0);
    const rightTurbine = new THREE.Mesh(turbineGeo, turbineMat);
    rightTurbine.position.set(0.3, 0, 0);
    this.jetpackMesh.add(leftTurbine, rightTurbine);

    this.jetpackMesh.position.set(0, 0.42, -0.3);
    this.torsoMesh.add(this.jetpackMesh);
    this.jetpackMesh.visible = false;

    return group;
  }

  // Build Realistic Tactical Android Police Officer
  // Real articulated humanoid proportions and bold police riot gear!
  private buildRealisticPoliceMesh(): THREE.Group {
    const group = new THREE.Group();

    const navyArmorMat = new THREE.MeshStandardMaterial({
      color: 0x111c30, // Deep Police Navy
      roughness: 0.4,
      metalness: 0.4
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Ballistic Chrome Plates
      roughness: 0.2,
      metalness: 0.8
    });

    const goldBadgeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Gold Police Badge
      metalness: 0.9,
      roughness: 0.1
    });

    // 1. Heavy Tactical Torso
    const torsoGeo = new THREE.BoxGeometry(0.85, 0.95, 0.5);
    this.policeTorso = new THREE.Mesh(torsoGeo, navyArmorMat);
    this.policeTorso.position.y = 1.35;
    group.add(this.policeTorso);

    // Ballistic chest plate
    const chestPlateGeo = new THREE.BoxGeometry(0.75, 0.55, 0.1);
    const chestPlate = new THREE.Mesh(chestPlateGeo, chromeMat);
    chestPlate.position.set(0, 0.12, 0.26);
    this.policeTorso.add(chestPlate);

    // Gold Police Star Shield Badge
    const badgeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 6);
    badgeGeo.rotateX(Math.PI / 2);
    const badge = new THREE.Mesh(badgeGeo, goldBadgeMat);
    badge.position.set(-0.2, 0.2, 0.32);
    this.policeTorso.add(badge);

    // Police helmet with dark riot visor
    const helmetGeo = new THREE.BoxGeometry(0.48, 0.48, 0.48);
    const helmet = new THREE.Mesh(helmetGeo, navyArmorMat);
    helmet.position.set(0, 0.72, 0);
    this.policeTorso.add(helmet);

    const visorGeo = new THREE.BoxGeometry(0.46, 0.16, 0.14);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.72, 0.22);
    this.policeTorso.add(visor);

    // Flashing Mini Police Sirens on shoulders (Red & Blue)
    this.policeSirenRedLight = new THREE.PointLight(0xef4444, 2.5, 12);
    this.policeSirenRedLight.position.set(-0.35, 0.5, 0);
    this.policeTorso.add(this.policeSirenRedLight);

    this.policeSirenBlueLight = new THREE.PointLight(0x3b82f6, 2.5, 12);
    this.policeSirenBlueLight.position.set(0.35, 0.5, 0);
    this.policeTorso.add(this.policeSirenBlueLight);

    // 2. Articulated Bionic Arms
    this.policeLeftArm = new THREE.Group();
    this.policeLeftArm.position.set(-0.52, 0.32, 0);
    this.policeTorso.add(this.policeLeftArm);
    const armGeo = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    const leftArmMesh = new THREE.Mesh(armGeo, navyArmorMat);
    leftArmMesh.position.y = -0.32;
    this.policeLeftArm.add(leftArmMesh);

    this.policeRightArm = new THREE.Group();
    this.policeRightArm.position.set(0.52, 0.32, 0);
    this.policeTorso.add(this.policeRightArm);
    const rightArmMesh = new THREE.Mesh(armGeo, navyArmorMat);
    rightArmMesh.position.y = -0.32;
    this.policeRightArm.add(rightArmMesh);

    // 3. Articulated Bionic Legs
    this.policeLeftLeg = new THREE.Group();
    this.policeLeftLeg.position.set(-0.25, -0.45, 0);
    this.policeTorso.add(this.policeLeftLeg);
    const legGeo = new THREE.BoxGeometry(0.28, 0.85, 0.28);
    const leftLegMesh = new THREE.Mesh(legGeo, navyArmorMat);
    leftLegMesh.position.y = -0.4;
    this.policeLeftLeg.add(leftLegMesh);

    this.policeRightLeg = new THREE.Group();
    this.policeRightLeg.position.set(0.25, -0.45, 0);
    this.policeTorso.add(this.policeRightLeg);
    const rightLegMesh = new THREE.Mesh(legGeo, navyArmorMat);
    rightLegMesh.position.y = -0.4;
    this.policeRightLeg.add(rightLegMesh);

    return group;
  }

  // Create a realistic daytime highway chunk
  private createHighwayChunk(zOffset: number): THREE.Group {
    const chunk = new THREE.Group();
    chunk.position.z = zOffset;

    const roadWidth = 12;
    const roadLength = this.CHUNK_LENGTH;

    // 1. Realistic Asphalt Road Surface (Dark grey realistic asphalt)
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x272a31, // Realistic dark asphalt
      roughness: 0.8,
      metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    chunk.add(road);

    // 2. Realistic White Dashed Lane Markings
    const laneXPositions = [-this.LANE_WIDTH * 0.5, this.LANE_WIDTH * 0.5];
    const stripeCount = 8;
    const stripeLen = 4.0;
    const stripeGap = roadLength / stripeCount;
    const whiteStripeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });

    laneXPositions.forEach(laneX => {
      for (let s = 0; s < stripeCount; s++) {
        const stripeGeo = new THREE.PlaneGeometry(0.18, stripeLen);
        stripeGeo.rotateX(-Math.PI / 2);
        const stripe = new THREE.Mesh(stripeGeo, whiteStripeMat);
        stripe.position.set(laneX, 0.02, -roadLength * 0.5 + s * stripeGap + stripeLen * 0.5);
        chunk.add(stripe);
      }
    });

    // 3. Solid Yellow Highway Shoulder Lines
    const yellowLineMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
    [-roadWidth * 0.46, roadWidth * 0.46].forEach(x => {
      const yellowLineGeo = new THREE.PlaneGeometry(0.18, roadLength);
      yellowLineGeo.rotateX(-Math.PI / 2);
      const yellowLine = new THREE.Mesh(yellowLineGeo, yellowLineMat);
      yellowLine.position.set(x, 0.02, 0);
      chunk.add(yellowLine);
    });

    // 4. Concrete Road Barriers & Metal Guardrails
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.3 });
    const barrierGeo = new THREE.BoxGeometry(0.35, 0.7, roadLength);

    const leftBarrier = new THREE.Mesh(barrierGeo, barrierMat);
    leftBarrier.position.set(-roadWidth * 0.5, 0.35, 0);
    const rightBarrier = new THREE.Mesh(barrierGeo, barrierMat);
    rightBarrier.position.set(roadWidth * 0.5, 0.35, 0);
    chunk.add(leftBarrier, rightBarrier);

    // 5. Grassy Highway Verge / Embankment
    const grassGeo = new THREE.PlaneGeometry(16, roadLength);
    grassGeo.rotateX(-Math.PI / 2);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.9 });

    const leftGrass = new THREE.Mesh(grassGeo, grassMat);
    leftGrass.position.set(-roadWidth * 0.5 - 8, -0.05, 0);
    const rightGrass = new THREE.Mesh(grassGeo, grassMat);
    rightGrass.position.set(roadWidth * 0.5 + 8, -0.05, 0);
    chunk.add(leftGrass, rightGrass);

    // 6. Realistic Cityscape High-Rise Towers (Varied modern architecture)
    const buildingMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.5 }), // Glass/Steel Blue Grey
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.8 }), // Modern Sky Blue Glass
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7, metalness: 0.1 }), // Stone / Concrete Tower
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 })  // Charcoal Corporate HQ
    ];

    [-1, 1].forEach(side => {
      const numTowers = 3;
      for (let t = 0; t < numTowers; t++) {
        const bWidth = 10 + Math.random() * 8;
        const bDepth = 12 + Math.random() * 8;
        const bHeight = 40 + Math.random() * 55;
        const bX = side * (roadWidth * 0.5 + 16 + bWidth * 0.5);
        const bZ = -roadLength * 0.5 + (t + 0.5) * (roadLength / numTowers);

        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bMat = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];
        const tower = new THREE.Mesh(bGeo, bMat);
        tower.position.set(bX, bHeight * 0.5, bZ);
        chunk.add(tower);

        // Window grid horizontal bands for realism
        const numBands = 8;
        for (let w = 1; w < numBands; w++) {
          const bandGeo = new THREE.BoxGeometry(bWidth + 0.1, 0.4, bDepth + 0.1);
          const bandMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
          const band = new THREE.Mesh(bandGeo, bandMat);
          band.position.set(0, (w / numBands) * bHeight - bHeight * 0.5, 0);
          tower.add(band);
        }
      }
    });

    return chunk;
  }

  // Populate initial highway traffic
  // CRITICAL: We enforce a minimum safe distance between obstacles so vehicles NEVER overlap!
  private populateInitialTrack() {
    let spawnZ = -35;
    const minSpacing = 32; // Generous distance between obstacles prevents overlap!

    while (spawnZ > -this.CHUNK_LENGTH * (this.CHUNK_COUNT - 1)) {
      this.spawnObstaclePattern(spawnZ);
      spawnZ -= minSpacing + Math.random() * 12;
    }
  }

  // Spawn Realistic Traffic Obstacle Patterns
  private spawnObstaclePattern(z: number) {
    const pattern = Math.floor(Math.random() * 5);

    switch (pattern) {
      case 0:
        // Realistic Modern Car in one lane + Gold Coins line in other lane
        {
          const carLane = Math.floor(Math.random() * 3) - 1;
          this.createRealisticCar(carLane, z);

          const coinLane = (carLane === 0) ? (Math.random() > 0.5 ? 1 : -1) : 0;
          this.createCoinLine(coinLane, z - 8, 4);
        }
        break;

      case 1:
        // Heavy Commercial Freight Semi-Truck with Ramp on Back!
        {
          const truckLane = Math.floor(Math.random() * 3) - 1;
          this.createRealisticTruck(truckLane, z);
        }
        break;

      case 2:
        // Overhead Highway Destination Sign (requires sliding under!)
        {
          const gantryLane = Math.floor(Math.random() * 3) - 1;
          this.createHighwaySignGantry(gantryLane, z);
          // Ground coins underneath to guide sliding
          this.createCoinLine(gantryLane, z - 3, 3, 0.4);
        }
        break;

      case 3:
        // Highway Roadwork Barricade (jump over)
        {
          const barricadeLane = Math.floor(Math.random() * 3) - 1;
          this.createRoadworkBarricade(barricadeLane, z);
          this.createCoinArc(barricadeLane, z - 2, 4);
        }
        break;

      case 4:
      default:
        // Two cars in separate lanes with open lane for power-up or coins
        {
          const openLane = Math.floor(Math.random() * 3) - 1;
          [-1, 0, 1].forEach(l => {
            if (l !== openLane) {
              if (Math.random() > 0.4) {
                this.createRealisticCar(l, z);
              } else {
                this.createRoadworkBarricade(l, z);
              }
            }
          });

          // Chance to spawn high-tech Power-up
          if (Math.random() > 0.3) {
            const types: PowerUpType[] = ['MAGNET', 'JETPACK', 'SNEAKERS', 'MULTIPLIER'];
            const chosen = types[Math.floor(Math.random() * types.length)];
            this.createPowerUp(openLane, z, chosen);
          } else {
            this.createCoinLine(openLane, z - 6, 4);
          }
        }
        break;
    }
  }

  // Create a Realistic Modern Sedan Car
  private createRealisticCar(lane: number, z: number) {
    const group = new THREE.Group();
    const x = lane * this.LANE_WIDTH;
    group.position.set(x, 0, z);

    const carLength = 4.4;
    const carWidth = 2.0;
    const carHeight = 1.25;

    // Realistic Car Colors (Pearl White, Crimson, Cobalt Blue, Metallic Silver, Sunset Bronze)
    const realisticColors = [0xdc2626, 0x2563eb, 0xf8fafc, 0x475569, 0xb45309, 0x1e293b];
    const carColor = realisticColors[Math.floor(Math.random() * realisticColors.length)];

    const carBodyMat = new THREE.MeshStandardMaterial({
      color: carColor,
      metalness: 0.8,
      roughness: 0.2
    });

    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.1
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1
    });

    const tireRubberMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85
    });

    // Main Lower Chassis
    const lowerChassis = new THREE.Mesh(new THREE.BoxGeometry(carWidth, carHeight * 0.5, carLength), carBodyMat);
    lowerChassis.position.y = 0.45;
    group.add(lowerChassis);

    // Cabin / Roof & Windows
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(carWidth * 0.82, carHeight * 0.52, carLength * 0.52), windowGlassMat);
    cabin.position.set(0, 0.9, -0.15);
    group.add(cabin);

    // Front Grille & Chrome Bumper
    const grille = new THREE.Mesh(new THREE.BoxGeometry(carWidth * 0.7, 0.2, 0.1), chromeMat);
    grille.position.set(0, 0.4, carLength * 0.5);
    group.add(grille);

    // Clear Headlights with yellow/white bulbs
    const hlGeo = new THREE.BoxGeometry(0.35, 0.16, 0.1);
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.1, emissive: 0xfef08a, emissiveIntensity: 0.5 });
    const hlLeft = new THREE.Mesh(hlGeo, hlMat);
    hlLeft.position.set(-0.65, 0.45, carLength * 0.5 + 0.02);
    const hlRight = new THREE.Mesh(hlGeo, hlMat);
    hlRight.position.set(0.65, 0.45, carLength * 0.5 + 0.02);
    group.add(hlLeft, hlRight);

    // Red Tail Lights
    const tlMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2, emissive: 0xb91c1c, emissiveIntensity: 0.6 });
    const tlLeft = new THREE.Mesh(hlGeo, tlMat);
    tlLeft.position.set(-0.65, 0.45, -carLength * 0.5 - 0.02);
    const tlRight = new THREE.Mesh(hlGeo, tlMat);
    tlRight.position.set(0.65, 0.45, -carLength * 0.5 - 0.02);
    group.add(tlLeft, tlRight);

    // 4 Realistic Rubber Wheels with Alloy Rims
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const wheelPositions = [
      [-carWidth * 0.5, 0.34, -carLength * 0.3],
      [carWidth * 0.5, 0.34, -carLength * 0.3],
      [-carWidth * 0.5, 0.34, carLength * 0.3],
      [carWidth * 0.5, 0.34, carLength * 0.3]
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, tireRubberMat);
      wheel.position.set(pos[0], pos[1], pos[2]);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.24, 8), chromeMat);
      rim.rotation.z = Math.PI / 2;
      wheel.add(rim);
      group.add(wheel);
    });

    this.scene.add(group);
    this.obstacles.push({
      group,
      type: 'CAR',
      lane,
      z,
      y: 0,
      width: carWidth,
      height: carHeight,
      length: carLength,
      isPassed: false,
      speed: (Math.random() > 0.5 ? -3 : 0)
    });
  }

  // Create a Realistic Freight Semi-Truck with Ramp on Back!
  private createRealisticTruck(lane: number, z: number) {
    const group = new THREE.Group();
    const x = lane * this.LANE_WIDTH;
    group.position.set(x, 0, z);

    const truckLength = 11.0;
    const truckWidth = 2.4;
    const truckHeight = 2.8;

    const cabMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.7, roughness: 0.3 }); // Navy blue cab
    const trailerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.3, roughness: 0.5 }); // White/Silver Cargo
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 });

    // Cargo Trailer Body
    const trailerGeo = new THREE.BoxGeometry(truckWidth, truckHeight * 0.85, truckLength * 0.75);
    const trailer = new THREE.Mesh(trailerGeo, trailerMat);
    trailer.position.set(0, truckHeight * 0.55, -0.8);
    group.add(trailer);

    // Front Tractor Cab
    const cabGeo = new THREE.BoxGeometry(truckWidth * 0.95, truckHeight * 0.8, truckLength * 0.25);
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, truckHeight * 0.5, -truckLength * 0.42);
    group.add(cab);

    // Chrome Exhaust Stacks on Cab
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);
    const leftExhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    leftExhaust.position.set(-truckWidth * 0.45, truckHeight * 0.9, -truckLength * 0.35);
    const rightExhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    rightExhaust.position.set(truckWidth * 0.45, truckHeight * 0.9, -truckLength * 0.35);
    group.add(leftExhaust, rightExhaust);

    // Metal Loading Ramp on the Rear (facing oncoming runner!)
    const rampLength = 3.6;
    const rampGeo = new THREE.BoxGeometry(truckWidth * 0.94, 0.15, rampLength);
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.rotation.x = Math.atan2(truckHeight, rampLength);
    ramp.position.set(0, truckHeight * 0.5, truckLength * 0.38 + rampLength * 0.45);
    group.add(ramp);

    // Coins lined up along the top roof of the trailer!
    for (let c = -3.5; c <= 2.5; c += 2.0) {
      const coin = new THREE.Mesh(this.coinGeo, this.coinMat);
      coin.rotation.x = Math.PI / 2;
      coin.position.set(0, truckHeight + 0.65, c);
      group.add(coin);

      this.pickups.push({
        mesh: coin,
        type: 'COIN',
        lane,
        z: z + c,
        y: truckHeight + 0.65,
        collected: false
      });
    }

    this.scene.add(group);
    this.obstacles.push({
      group,
      type: 'TRUCK',
      lane,
      z,
      y: 0,
      width: truckWidth,
      height: truckHeight,
      length: truckLength,
      isPassed: false,
      hasRamp: true,
      rampStartZ: z + truckLength * 0.38 + rampLength,
      rampEndZ: z + truckLength * 0.38,
      rampHeight: truckHeight
    });
  }

  // Create an Overhead Highway Destination Sign Gantry (slide under)
  private createHighwaySignGantry(lane: number, z: number) {
    const group = new THREE.Group();
    const x = lane * this.LANE_WIDTH;
    group.position.set(x, 0, z);

    const trussMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.4 });

    // Steel Lattice Pillars on both sides of the lane
    const pillarGeo = new THREE.BoxGeometry(0.24, 4.2, 0.24);
    const leftPillar = new THREE.Mesh(pillarGeo, trussMat);
    leftPillar.position.set(-this.LANE_WIDTH * 0.48, 2.1, 0);
    const rightPillar = new THREE.Mesh(pillarGeo, trussMat);
    rightPillar.position.set(this.LANE_WIDTH * 0.48, 2.1, 0);
    group.add(leftPillar, rightPillar);

    // Cross beam
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(this.LANE_WIDTH, 0.28, 0.28), trussMat);
    crossBeam.position.set(0, 3.4, 0);
    group.add(crossBeam);

    // Realistic Green Interstate Highway Signboard (requires slide under!)
    const signGeo = new THREE.BoxGeometry(this.LANE_WIDTH * 0.95, 1.4, 0.12);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }); // Authentic Highway Green
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.45, 0);
    group.add(sign);

    // White Border on Sign
    const signBorder = new THREE.Mesh(
      new THREE.BoxGeometry(this.LANE_WIDTH * 0.98, 1.44, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    signBorder.position.set(0, 2.45, -0.01);
    group.add(signBorder);

    this.scene.add(group);
    this.obstacles.push({
      group,
      type: 'GANTRY',
      lane,
      z,
      y: 1.65, // Low clearance requiring sliding!
      width: this.LANE_WIDTH,
      height: 2.2,
      length: 0.5,
      isPassed: false
    });
  }

  // Create Roadwork Construction Barricade (jump over)
  private createRoadworkBarricade(lane: number, z: number) {
    const group = new THREE.Group();
    const x = lane * this.LANE_WIDTH;
    group.position.set(x, 0, z);

    const bWidth = 2.4;
    const bHeight = 0.95;
    const bLength = 0.35;

    // Orange Barrier Base
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.5 });
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bLength), baseMat);
    barrier.position.y = bHeight * 0.5;
    group.add(barrier);

    // White Hazard Stripe
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(bWidth, 0.22, bLength + 0.02),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    stripe.position.y = bHeight * 0.5;
    group.add(stripe);

    // Flashing Amber Construction Beacons on top
    const beaconGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.7 });
    const leftBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    leftBeacon.position.set(-0.8, bHeight + 0.1, 0);
    const rightBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    rightBeacon.position.set(0.8, bHeight + 0.1, 0);
    group.add(leftBeacon, rightBeacon);

    this.scene.add(group);
    this.obstacles.push({
      group,
      type: 'BARRICADE',
      lane,
      z,
      y: 0,
      width: bWidth,
      height: bHeight,
      length: bLength,
      isPassed: false
    });
  }

  // Create Gold Coins Line
  private createCoinLine(lane: number, startZ: number, count: number, y = 0.85) {
    const x = lane * this.LANE_WIDTH;
    for (let i = 0; i < count; i++) {
      const coin = new THREE.Mesh(this.coinGeo, this.coinMat);
      coin.rotation.x = Math.PI / 2;
      const cz = startZ - i * 2.6;
      coin.position.set(x, y, cz);
      this.scene.add(coin);

      this.pickups.push({
        mesh: coin,
        type: 'COIN',
        lane,
        z: cz,
        y,
        collected: false
      });
    }
  }

  // Create Gold Coins Arc (for jumping over barricades)
  private createCoinArc(lane: number, centerZ: number, count: number) {
    const x = lane * this.LANE_WIDTH;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const cz = centerZ + (t - 0.5) * 6.5;
      const cy = 0.85 + Math.sin(t * Math.PI) * 2.2;

      const coin = new THREE.Mesh(this.coinGeo, this.coinMat);
      coin.rotation.x = Math.PI / 2;
      coin.position.set(x, cy, cz);
      this.scene.add(coin);

      this.pickups.push({
        mesh: coin,
        type: 'COIN',
        lane,
        z: cz,
        y: cy,
        collected: false
      });
    }
  }

  // Create Power-Up Item Capsule
  private createPowerUp(lane: number, z: number, type: PowerUpType) {
    const group = new THREE.Group();
    const x = lane * this.LANE_WIDTH;
    group.position.set(x, 1.3, z);

    let color = 0x2563eb;
    switch (type) {
      case 'MAGNET': color = 0xdc2626; break;
      case 'JETPACK': color = 0x0284c7; break;
      case 'SNEAKERS': color = 0x16a34a; break;
      case 'MULTIPLIER': color = 0xd97706; break;
    }

    const orbMat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.6,
      roughness: 0.2,
      emissive: color,
      emissiveIntensity: 0.4
    });

    const capsule = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), orbMat);
    group.add(capsule);

    const innerCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.24), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    group.add(innerCore);

    this.scene.add(group);
    this.pickups.push({
      mesh: group,
      type,
      lane,
      z,
      y: 1.3,
      collected: false
    });
  }

  // Controls Handlers
  public moveLeft() {
    if (!this.isRunning || this.isPaused) return;
    if (this.currentLane > -1) {
      this.currentLane--;
      this.targetLaneX = this.currentLane * this.LANE_WIDTH;
      soundEngine.playSwipe();
    }
  }

  public moveRight() {
    if (!this.isRunning || this.isPaused) return;
    if (this.currentLane < 1) {
      this.currentLane++;
      this.targetLaneX = this.currentLane * this.LANE_WIDTH;
      soundEngine.playSwipe();
    }
  }

  public jump() {
    if (!this.isRunning || this.isPaused) return;
    if (this.isGrounded || this.playerY <= 0.1) {
      this.velocityY = this.jumpPower;
      this.isGrounded = false;
      this.isJumping = true;
      this.isSliding = false;
      soundEngine.playJump();
    }
  }

  public slide() {
    if (!this.isRunning || this.isPaused) return;
    if (!this.isGrounded) {
      this.velocityY = -30; // Fast-drop
    }
    this.isSliding = true;
    this.slideTimer = this.SLIDE_DURATION;
    soundEngine.playSlide();
  }

  public activateHoverboard(): boolean {
    if (!this.isRunning || this.isPaused) return false;
    if (this.isHoverboardActive) return false;

    this.isHoverboardActive = true;
    this.hoverboardTimer = 25;
    this.hoverboardMesh.visible = true;
    soundEngine.playHoverboard();
    this.callbacks.onHoverboardUpdate(true, this.hoverboardTimer);
    this.callbacks.onMissionEvent('boards_used', 1);
    return true;
  }

  private applyPowerUp(type: PowerUpType, duration = 12) {
    this.activePowerUps.set(type, { timeLeft: duration, duration });
    soundEngine.playPowerup();

    if (type === 'JETPACK') {
      this.jetpackMesh.visible = true;
    } else if (type === 'SNEAKERS') {
      this.jumpPower = this.baseJumpPower * 1.5;
    } else if (type === 'MULTIPLIER') {
      this.multiplier = 2;
    }
  }

  // Animation Loop
  private startLoop() {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(this.clock.getDelta(), 0.1);

      if (this.isRunning && !this.isPaused) {
        this.updateGame(delta);
      }

      this.render();
    };
    this.animFrameId = requestAnimationFrame(animate);
  }

  // Update Game Logic
  private updateGame(delta: number) {
    this.survivalSecs += delta;

    // Speed progression
    this.speed = Math.min(this.maxSpeed, 26 + (this.distance / 130) * 1.2);

    const distDelta = this.speed * delta;
    this.distance += distDelta;
    this.score += Math.floor(distDelta * 2.0 * this.multiplier);
    this.callbacks.onScoreUpdate(this.score);

    // Forward position
    this.playerZ -= distDelta;

    // Smooth Lane Shift
    const dx = this.targetLaneX - this.playerX;
    this.playerX += dx * Math.min(1, delta * 20);

    // Jetpack Skyway Flight
    const isJetpackActive = this.activePowerUps.has('JETPACK');
    const targetY = isJetpackActive ? 7.5 : 0;

    if (isJetpackActive) {
      this.playerY += (targetY - this.playerY) * Math.min(1, delta * 6);
      this.velocityY = 0;
      this.isGrounded = false;

      if (Math.random() > 0.6) {
        this.createCoinLine(this.currentLane, this.playerZ - 20, 2, 7.5);
      }
    } else {
      this.velocityY += this.gravity * delta;
      this.playerY += this.velocityY * delta;

      // Truck roof riding logic
      let groundLevel = 0;
      for (const obs of this.obstacles) {
        if (obs.type === 'TRUCK' && Math.abs(obs.lane * this.LANE_WIDTH - this.playerX) < 1.3) {
          const truckMinZ = obs.z - obs.length * 0.5;
          const truckMaxZ = obs.z + obs.length * 0.5 + 3.6;
          if (this.playerZ <= truckMaxZ && this.playerZ >= truckMinZ) {
            if (obs.hasRamp && this.playerZ > obs.z + obs.length * 0.38) {
              const rampProgress = (obs.rampStartZ! - this.playerZ) / (obs.rampStartZ! - obs.rampEndZ!);
              groundLevel = Math.max(0, rampProgress * obs.rampHeight!);
            } else {
              groundLevel = obs.height;
            }
            break;
          }
        }
      }

      if (this.playerY <= groundLevel) {
        this.playerY = groundLevel;
        this.velocityY = 0;
        this.isGrounded = true;
        this.isJumping = false;
      }
    }

    // Slide Timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Temporary invincibility
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= delta;
    }

    // Hoverboard duration
    if (this.isHoverboardActive) {
      this.hoverboardTimer -= delta;
      this.callbacks.onHoverboardUpdate(true, this.hoverboardTimer);
      if (this.hoverboardTimer <= 0) {
        this.isHoverboardActive = false;
        this.hoverboardMesh.visible = false;
        this.callbacks.onHoverboardUpdate(false, 0);
      }
    }

    // PowerUp durations
    const powerUpsArray: { type: PowerUpType; timeLeft: number; duration: number }[] = [];
    this.activePowerUps.forEach((data, type) => {
      data.timeLeft -= delta;
      powerUpsArray.push({ type, timeLeft: data.timeLeft, duration: data.duration });
      if (data.timeLeft <= 0) {
        if (type === 'JETPACK') this.jetpackMesh.visible = false;
        if (type === 'SNEAKERS') this.jumpPower = this.baseJumpPower;
        if (type === 'MULTIPLIER') this.multiplier = 1;
        this.activePowerUps.delete(type);
      }
    });
    this.callbacks.onPowerUpUpdate(powerUpsArray);

    // Update Player & Police Kinematics
    this.updatePlayerPose();
    this.updatePoliceEnforcer(delta);

    // Check Collisions
    this.checkCollisions();

    // Check Pickups
    this.updatePickups(delta);

    // Highway Chunks Recycling
    this.updateHighwayChunks();
    this.cleanupPassedEntities();

    // Smooth Camera Follow
    const camTargetX = this.playerX * 0.45;
    const camTargetY = Math.max(4.6, this.playerY + 3.8);
    const camTargetZ = this.playerZ + 7.8;
    this.camera.position.x += (camTargetX - this.camera.position.x) * delta * 8;
    this.camera.position.y += (camTargetY - this.camera.position.y) * delta * 6;
    this.camera.position.z = camTargetZ;
    this.camera.lookAt(this.playerX * 0.25, this.playerY + 1.6, this.playerZ - 14);
  }

  // Update Realistic Articulated Human Poses
  private updatePlayerPose() {
    this.playerGroup.position.set(this.playerX, this.playerY, this.playerZ);

    const laneRoll = (this.targetLaneX - this.playerX) * -0.06;
    this.playerGroup.rotation.z = laneRoll;

    const time = this.clock.getElapsedTime() * 14;

    if (this.isSliding) {
      // Crouch / low slide
      this.torsoMesh.position.y = 0.25;
      this.torsoMesh.rotation.x = Math.PI / 3.2;
      this.headGroup.position.set(0, 0.4, 0.2);

      this.leftUpperLegGroup.rotation.x = -Math.PI / 4;
      this.rightUpperLegGroup.rotation.x = -Math.PI / 4;
      this.leftLowerLegGroup.rotation.x = Math.PI / 3;
      this.rightLowerLegGroup.rotation.x = Math.PI / 3;

      this.leftUpperArmGroup.rotation.x = Math.PI / 3;
      this.rightUpperArmGroup.rotation.x = Math.PI / 3;
    } else if (this.isHoverboardActive) {
      // Surfing pose on hoverboard
      this.torsoMesh.position.y = 0.48;
      this.torsoMesh.rotation.set(0, 0.25, 0);
      this.headGroup.rotation.y = -0.25;

      this.leftUpperLegGroup.rotation.x = 0.15;
      this.rightUpperLegGroup.rotation.x = -0.15;
      this.leftLowerLegGroup.rotation.x = 0.1;
      this.rightLowerLegGroup.rotation.x = 0.1;

      this.leftUpperArmGroup.rotation.z = -0.3;
      this.rightUpperArmGroup.rotation.z = 0.3;
      this.hoverboardMesh.position.y = 0.1 + Math.sin(time * 0.4) * 0.04;
    } else if (this.isJumping) {
      // High tucked jump
      this.torsoMesh.position.y = 0.48;
      this.torsoMesh.rotation.set(0.15, 0, 0);
      this.leftUpperLegGroup.rotation.x = -Math.PI / 4;
      this.rightUpperLegGroup.rotation.x = -Math.PI / 5;
      this.leftLowerLegGroup.rotation.x = Math.PI / 3.5;
      this.rightLowerLegGroup.rotation.x = Math.PI / 3.5;

      this.leftUpperArmGroup.rotation.x = Math.PI / 3;
      this.rightUpperArmGroup.rotation.x = Math.PI / 3;
    } else {
      // High-speed natural running sprint
      this.torsoMesh.position.y = 0.48 + Math.sin(time * 2) * 0.05;
      this.torsoMesh.rotation.set(0.12, 0, 0);
      this.headGroup.rotation.set(0, 0, 0);

      const swing = Math.sin(time);
      this.leftUpperLegGroup.rotation.x = swing * 0.75;
      this.rightUpperLegGroup.rotation.x = -swing * 0.75;

      this.leftLowerLegGroup.rotation.x = swing > 0 ? swing * 0.9 : 0.1;
      this.rightLowerLegGroup.rotation.x = swing < 0 ? -swing * 0.9 : 0.1;

      this.leftUpperArmGroup.rotation.x = -swing * 0.75;
      this.rightUpperArmGroup.rotation.x = swing * 0.75;
      this.leftLowerArmGroup.rotation.x = -0.4;
      this.rightLowerArmGroup.rotation.x = -0.4;
    }
  }

  // Update Realistic Tactical Police Officer
  // "dont make it into each other": Stays strictly spaced behind the player!
  private updatePoliceEnforcer(delta: number) {
    if (this.policeStumblePenaltyTimer > 0) {
      this.policeStumblePenaltyTimer -= delta;
      this.targetPoliceDistance = 3.8; // Dangerously close, but NEVER clipping into player!
    } else {
      this.targetPoliceDistance = 8.0; // Standard safe chase distance
    }

    this.policeDistance += (this.targetPoliceDistance - this.policeDistance) * delta * 2.2;

    const policeTargetX = this.playerX * 0.85;
    const curX = this.policeGroup.position.x;
    const newX = curX + (policeTargetX - curX) * delta * 6;
    const newZ = this.playerZ + this.policeDistance;
    const newY = this.playerY <= 0.2 ? 0 : this.playerY * 0.85;

    this.policeGroup.position.set(newX, newY, newZ);

    // Police sprint animation
    const time = this.clock.getElapsedTime() * 15;
    const swing = Math.sin(time);
    this.policeLeftLeg.rotation.x = swing * 0.8;
    this.policeRightLeg.rotation.x = -swing * 0.8;
    this.policeLeftArm.rotation.x = -swing * 0.8;
    this.policeRightArm.rotation.x = swing * 0.8;

    // Alternate strobe lights
    const isRed = Math.sin(time * 0.7) > 0;
    this.policeSirenRedLight.intensity = isRed ? 3.0 : 0.2;
    this.policeSirenBlueLight.intensity = isRed ? 0.2 : 3.0;

    let warningLevel: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
    if (this.policeDistance < 4.5) {
      warningLevel = 'DANGER';
    } else if (this.policeDistance < 6.5) {
      warningLevel = 'WARNING';
    }
    this.callbacks.onPoliceProximityUpdate(this.policeDistance, warningLevel);
  }

  // Collision Checking
  private checkCollisions() {
    if (this.invincibilityTimer > 0) return;

    const pX = this.playerX;
    const pY = this.playerY;
    const pZ = this.playerZ;

    for (const obs of this.obstacles) {
      // Passed counter
      if (!obs.isPassed && pZ < obs.z - obs.length * 0.5) {
        obs.isPassed = true;
        if (obs.type === 'CAR' || obs.type === 'TRUCK') {
          this.vehiclesJumpedCount++;
          this.callbacks.onMissionEvent('jumps_vehicle', 1);
        } else if (obs.type === 'GANTRY' && this.isSliding) {
          this.gantriesSlidCount++;
          this.callbacks.onMissionEvent('slides_gantry', 1);
        }
      }

      const obsX = obs.group.position.x;
      const obsZ = obs.z;
      const xDist = Math.abs(pX - obsX);
      const zDist = Math.abs(pZ - obsZ);

      const xOverlap = xDist < (obs.width * 0.5 + 0.35);
      const zOverlap = zDist < (obs.length * 0.5 + 0.35);

      if (xOverlap && zOverlap) {
        if (obs.type === 'CAR') {
          if (pY >= obs.height + 0.1) continue;
          this.handleHitObstacle();
          return;
        }

        if (obs.type === 'TRUCK') {
          if (pY >= obs.height - 0.2) continue;
          if (obs.hasRamp && pZ > obs.z + obs.length * 0.38) continue;
          this.handleHitObstacle();
          return;
        }

        if (obs.type === 'GANTRY') {
          if (this.isSliding) continue;
          this.handleHitObstacle();
          return;
        }

        if (obs.type === 'BARRICADE') {
          if (pY >= obs.height + 0.1) continue;
          this.handleHitObstacle();
          return;
        }
      }
    }
  }

  private handleHitObstacle() {
    if (this.isHoverboardActive) {
      soundEngine.playCrash();
      this.isHoverboardActive = false;
      this.hoverboardMesh.visible = false;
      this.callbacks.onHoverboardUpdate(false, 0);
      this.invincibilityTimer = 1.2;
      return;
    }

    if (this.policeDistance < 4.5) {
      this.triggerGameOver();
      return;
    }

    soundEngine.playPoliceWarning();
    this.policeStumblePenaltyTimer = 6.0;
    this.invincibilityTimer = 0.8;
  }

  private triggerGameOver() {
    this.isRunning = false;
    soundEngine.playCrash();
    soundEngine.playGameOver();

    this.callbacks.onGameOver({
      score: this.score,
      coins: this.coins,
      distance: Math.floor(this.distance),
      vehiclesJumped: this.vehiclesJumpedCount,
      gantriesSlid: this.gantriesSlidCount,
      survivalSecs: Math.floor(this.survivalSecs)
    });
  }

  // Update and collect pickups
  private updatePickups(delta: number) {
    const isMagnetActive = this.activePowerUps.has('MAGNET');
    const pX = this.playerX;
    const pY = this.playerY + 0.8;
    const pZ = this.playerZ;

    for (const pickup of this.pickups) {
      if (pickup.collected) continue;

      pickup.mesh.rotation.y += delta * 3.5;

      const pMeshX = pickup.mesh.position.x;
      const pMeshY = pickup.mesh.position.y;
      const pMeshZ = pickup.mesh.position.z;

      const dist = Math.sqrt(
        Math.pow(pX - pMeshX, 2) +
        Math.pow(pY - pMeshY, 2) +
        Math.pow(pZ - pMeshZ, 2)
      );

      if (isMagnetActive && pickup.type === 'COIN' && dist < 14) {
        const pullSpeed = delta * 25;
        pickup.mesh.position.x += (pX - pMeshX) * pullSpeed * 0.15;
        pickup.mesh.position.y += (pY - pMeshY) * pullSpeed * 0.15;
        pickup.mesh.position.z += (pZ - pMeshZ) * pullSpeed * 0.2;
      }

      if (dist < 1.4) {
        pickup.collected = true;
        this.scene.remove(pickup.mesh);

        if (pickup.type === 'COIN') {
          this.coins += 1;
          this.score += 25 * this.multiplier;
          soundEngine.playCoin();
          this.callbacks.onCoinsUpdate(this.coins);
          this.callbacks.onScoreUpdate(this.score);
        } else {
          this.applyPowerUp(pickup.type, 12);
        }
      }
    }
  }

  private updateHighwayChunks() {
    this.highwayChunks.forEach(chunk => {
      if (chunk.position.z > this.playerZ + this.CHUNK_LENGTH) {
        chunk.position.z -= this.CHUNK_LENGTH * this.CHUNK_COUNT;
        this.spawnObstaclePattern(chunk.position.z - Math.random() * 20);
      }
    });
  }

  private cleanupPassedEntities() {
    if (this.obstacles.length > 50) {
      const removed = this.obstacles.filter(o => o.z > this.playerZ + 20);
      removed.forEach(o => this.scene.remove(o.group));
      this.obstacles = this.obstacles.filter(o => o.z <= this.playerZ + 20);
    }

    if (this.pickups.length > 80) {
      const removed = this.pickups.filter(p => p.collected || p.mesh.position.z > this.playerZ + 20);
      removed.forEach(p => this.scene.remove(p.mesh));
      this.pickups = this.pickups.filter(p => !p.collected && p.mesh.position.z <= this.playerZ + 20);
    }
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize = () => {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public startRun() {
    this.resetRun();
    this.isRunning = true;
    this.isPaused = false;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public updateSkin(skin: CharacterSkin) {
    this.currentSkin = skin;
    this.scene.remove(this.playerGroup);
    this.playerGroup = this.buildRealisticPlayerMesh();
    this.scene.add(this.playerGroup);
  }

  public updateBoard(board: HoverboardSkin) {
    this.currentBoard = board;
    this.scene.remove(this.playerGroup);
    this.playerGroup = this.buildRealisticPlayerMesh();
    this.scene.add(this.playerGroup);
  }

  public resetRun() {
    this.distance = 0;
    this.score = 0;
    this.coins = 0;
    this.survivalSecs = 0;
    this.vehiclesJumpedCount = 0;
    this.gantriesSlidCount = 0;
    this.multiplier = 1;
    this.currentLane = 0;
    this.targetLaneX = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.isHoverboardActive = false;
    this.hoverboardMesh.visible = false;
    this.activePowerUps.clear();
    this.invincibilityTimer = 0;
    this.policeDistance = 8.0;
    this.targetPoliceDistance = 8.0;
    this.policeStumblePenaltyTimer = 0;

    this.obstacles.forEach(o => this.scene.remove(o.group));
    this.obstacles = [];
    this.pickups.forEach(p => this.scene.remove(p.mesh));
    this.pickups = [];

    this.highwayChunks.forEach((chunk, i) => {
      chunk.position.z = i * -this.CHUNK_LENGTH;
    });

    this.populateInitialTrack();
  }

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
