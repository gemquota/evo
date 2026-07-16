// Particle Life Presets — curated interaction matrices and starter configurations

function baseSpecies() {
  return [
    { name: "Cyan", count: 1200, size: 3.5, hue: 185, saturation: 90, lightness: 65, interactionRadius: 600, repulsionRadius: 80, repulsionStrength: 1.2, maxSpeed: 60 },
    { name: "Magenta", count: 800, size: 3, hue: 310, saturation: 85, lightness: 60, interactionRadius: 550, repulsionRadius: 70, repulsionStrength: 1.1, maxSpeed: 55 },
    { name: "Lime", count: 1500, size: 2.5, hue: 120, saturation: 80, lightness: 55, interactionRadius: 500, repulsionRadius: 65, repulsionStrength: 1.3, maxSpeed: 65 },
    { name: "Gold", count: 500, size: 4, hue: 45, saturation: 95, lightness: 60, interactionRadius: 700, repulsionRadius: 90, repulsionStrength: 0.9, maxSpeed: 50 },
    { name: "Coral", count: 1000, size: 3, hue: 10, saturation: 80, lightness: 60, interactionRadius: 600, repulsionRadius: 75, repulsionStrength: 1.0, maxSpeed: 55 },
  ];
}

function zeroMatrix(n) {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

function preset(species, matrix, global) {
  return { species, interactionMatrix: matrix, global };
}

export const PRESETS = [
  // Spiralis — rotating spirals and orbiting clusters
  preset(baseSpecies().map(s => ({ ...s, count: Math.round(s.count * 1.0) })), [
    [ 0.0,  0.5, -0.6,  0.4, -0.3],
    [-0.8,  0.0,  0.9, -0.7,  0.5],
    [ 0.6, -0.9,  0.0,  0.8, -0.4],
    [-0.5,  0.7, -0.8,  0.0,  0.6],
    [ 0.3, -0.5,  0.4, -0.6,  0.0],
  ], { friction: 0.82, trailOpacity: 0.03, timeScale: 1.0, maxForce: 3.0, noiseAmount: 0.04, name: '🌀 Spiralis', desc: 'Rotating spirals and orbiting clusters' }),

  // Primordia — cell-like structures dividing and merging
  preset(baseSpecies().map(s => ({ ...s, count: Math.round(s.count * 0.8), interactionRadius: s.interactionRadius * 1.2, repulsionRadius: s.repulsionRadius * 0.8 })), [
    [ 1.0, -0.4,  0.1, -0.3,  0.2],
    [-0.3,  0.8, -0.2,  0.5, -0.1],
    [ 0.1, -0.2,  1.2, -0.4,  0.3],
    [-0.3,  0.4, -0.3,  0.7, -0.2],
    [ 0.2, -0.1,  0.3, -0.2,  1.1],
  ], { friction: 0.88, trailOpacity: 0.02, timeScale: 0.7, maxForce: 2.0, noiseAmount: 0.02, name: '🧬 Primordia', desc: 'Cell-like structures dividing and merging' }),

  // Mycelium — branching networks and filaments
  preset(baseSpecies().map(s => ({ ...s, count: Math.round(s.count * 1.5), interactionRadius: s.interactionRadius * 0.7 })), [
    [ 0.0,  0.9,  0.0, -0.5,  0.0],
    [ 0.8,  0.0,  0.7,  0.0, -0.4],
    [ 0.0,  0.6,  0.0,  0.8,  0.0],
    [-0.5,  0.0,  0.7,  0.0,  0.5],
    [ 0.0, -0.3,  0.0,  0.5,  0.0],
  ], { friction: 0.80, trailOpacity: 0.04, timeScale: 1.2, maxForce: 3.5, noiseAmount: 0.05, name: '🌿 Mycelium', desc: 'Branching networks and filaments' }),

  // Ecosystem — predator-prey chasing and swarming
  preset([
    { name: 'Prey', count: 1000, size: 2, hue: 120, saturation: 85, lightness: 60, interactionRadius: 800, repulsionRadius: 60, repulsionStrength: 1.5, maxSpeed: 80 },
    { name: 'Predator', count: 200, size: 5, hue: 0, saturation: 90, lightness: 55, interactionRadius: 1000, repulsionRadius: 100, repulsionStrength: 0.4, maxSpeed: 100 },
    { name: 'Scavenger', count: 500, size: 2.5, hue: 40, saturation: 85, lightness: 55, interactionRadius: 600, repulsionRadius: 55, repulsionStrength: 0.9, maxSpeed: 50 },
    { name: 'Toxin', count: 300, size: 4.5, hue: 280, saturation: 80, lightness: 55, interactionRadius: 500, repulsionRadius: 120, repulsionStrength: 0.3, maxSpeed: 30 },
    { name: 'Symbiote', count: 300, size: 2, hue: 200, saturation: 90, lightness: 60, interactionRadius: 550, repulsionRadius: 50, repulsionStrength: 1.8, maxSpeed: 50 },
  ], [
    [ 0.8, -1.0,  0.3,  0.0,  0.5],
    [ 1.0,  0.0, -0.6, -0.3,  0.2],
    [-0.2,  0.5,  0.6,  0.2,  0.4],
    [ 0.0,  0.2, -0.1,  0.5,  0.0],
    [ 0.3,  0.1,  0.4,  0.0,  0.8],
  ], { friction: 0.76, trailOpacity: 0.04, timeScale: 1.2, maxForce: 3.5, noiseAmount: 0.06, name: '🦠 Ecosystem', desc: 'Predator-prey chasing and swarming' }),

  // Crystallis — crystal lattices and formations
  preset(baseSpecies().map(s => ({ ...s, count: Math.round(s.count * 0.6), interactionRadius: s.interactionRadius * 1.5 })), [
    [ 1.5,  0.2, -0.8,  0.1, -0.3],
    [ 0.2,  1.8,  0.3, -0.7,  0.0],
    [-0.8,  0.3,  1.2,  0.4, -0.5],
    [ 0.1, -0.7,  0.4,  1.6,  0.2],
    [-0.3,  0.0, -0.5,  0.2,  1.4],
  ], { friction: 0.92, trailOpacity: 0.02, timeScale: 0.5, maxForce: 1.5, noiseAmount: 0.01, name: '💎 Crystallis', desc: 'Crystal lattices and formations' }),

  // Nebula — swirling cosmic clouds
  preset(baseSpecies().map(s => ({ ...s, count: Math.round(s.count * 1.8), size: s.size * 0.7 })), [
    [ 0.3,  0.6,  0.2, -0.1,  0.4],
    [-0.2,  0.5,  0.8,  0.3, -0.3],
    [ 0.1, -0.4,  0.4,  0.7,  0.2],
    [ 0.3,  0.1, -0.3,  0.6,  0.9],
    [-0.1,  0.2,  0.1, -0.5,  0.3],
  ], { friction: 0.86, trailOpacity: 0.05, timeScale: 0.8, maxForce: 2.2, noiseAmount: 0.06, name: '🌌 Nebula', desc: 'Swirling cosmic clouds' }),

  // Chaos — turbulent patterns never settling
  preset(baseSpecies().map(s => ({ ...s, interactionRadius: s.interactionRadius * 0.5 })), [
    [ 0.0, -0.9,  0.8, -0.7,  0.6],
    [ 0.7,  0.0, -0.8,  0.9, -0.6],
    [-0.7,  0.8,  0.0, -0.5,  0.4],
    [ 0.6, -0.9,  0.5,  0.0, -0.8],
    [-0.6,  0.7, -0.4,  0.8,  0.0],
  ], { friction: 0.72, trailOpacity: 0.06, timeScale: 1.5, maxForce: 4.5, noiseAmount: 0.12, name: '🔥 Chaos', desc: 'Turbulent patterns never settling' }),

  // Custom
  preset(baseSpecies(), zeroMatrix(5), { friction: 0.85, trailOpacity: 0.04, timeScale: 0.8, maxForce: 2.0, noiseAmount: 0.05, name: '🧪 Custom', desc: 'Design your own from scratch' }),
];

export const DEFAULT_CONFIG = {
  species: PRESETS[0].species,
  interactionMatrix: PRESETS[0].interactionMatrix,

  // Dynamics
  friction: 0.75, timeScale: 1.2, maxForce: 3.5, noiseAmount: 0.08,
  minSpeed: 0, dragLinear: 0, physicsRate: 1,
  velocityDampingZ: 0.82, velocityClip: 0, massVariation: 0,

  // Forces
  gravityWell: 0, gravityWellRadius: 2500, vortexStrength: 0,
  forceDecayPower: 2, interactionJitter: 0,
  harmonicStrength: 0, harmonicRange: 1000,
  repulsionFalloff: 1, wanderRate: 0,
  attractForce: 2.0, attractRadius: 300,
  noiseFieldScale: 0.01, noiseFieldStrength: 0,

  // Boundary
  edgeMode: 'wrap',
  bounceRestitution: 0.5, bounceFriction: 0.3, bounceRandomize: 0,
  boundaryRepelForce: 0, worldMargin: 50, pairwiseCutoff: 200,

  // World
  worldWidth: 2500, worldHeight: 1406, zRange: 10000,
  stackPerspective: 2,

  // Distribution
  distributionMode: 'random', initialVelocity: 'random',
  clusterCount: 8, clusterSpread: 400, ringRadius: 1000,
  spawnJitter: 0.2, centerBias: 0,

  // Advanced Physics
  forceInertia: 0, interactionSymmetry: 0, pairwiseSkipChance: 0,
  boundaryWarmth: 0, radialDrift: 0, noiseDrift: 0,
  jerkLimit: 0, zGravity: 0, velocityExchange: 0,
  velocityDecayAngle: 0, matrixDrift: 0,

  // Environment Forces
  windDir: 0, windStrength: 0, radialPulseAmp: 0, radialPulseFreq: 0.5,
  tidalStrength: 0, noiseOctaves: 2, waveForceAmp: 0, waveFreq: 1, waveSpeed: 1,

  // Chemical / Signalling
  chemDecay: 0.02, chemDiffusion: 0.2, chemEmissionRate: 0.3,
  signalThreshold: 0.3, signalGain: 2, signalPropagation: 1.5,

  // Reproduction & Genetics
  reproductionRate: 0.025, reproductionEnergy: 30, mutationRate: 0.02,
  inheritTraits: 0.5, energyDecay: 0.01, maxEnergy: 200, reproductionCost: 15,

  // Accretion / Merging
  accretionRate: 0.01, mergeThreshold: 0.5, massAbsorption: 0.2, criticalMass: 15,

  // Social / Swarming
  alignmentForce: 0, cohesionForce: 0, separationForce: 0,
  leaderInfluence: 0, herdThreshold: 10, flockRadius: 300,

  // Lingual / Communication
  commRange: 200, commBandwidth: 0, signalMemory: 0, protocolComplexity: 0,

  // Genetic Evolution
  genePoolSize: 100, crossoverRate: 0.1, selectionPressure: 0.5,
  fitnessDecay: 0.01, adaptationRate: 0.01,

  // Rendering
  trailOpacity: 0.002, glowIntensity: 0,
  connectionDistance: 2500, connectionOpacity: 0.5,
  connectionWidth: 1.5, connectionFade: 1,
  glowSpread: 1, hdrExposure: 1.5, saturationBoost: 0.3, borderGlow: 0,
  trailGap: 1, colorShift: 0, particleContrast: 1,
  starBrightness: 0.35, starDensity: 1, depthCue: 0.5,
  minRadius: 0.5, maxRadius: 12, gridOpacity: 0.15,
  particleOpacity: 1.0,

  // Rendering toggles
  trailsEnabled: true, connectionsEnabled: true, showStats: true,
  showGlow: false, adaptiveQuality: true, showWorldBorder: true,
  showGrid: false, showBorder: true, showFPS: true,
  showSpeciesLabels: false, animateBackground: true,

  // Quality
  renderQuality: 1, fpsCap: 60, frameSkip: 0, batchSize: 500,
  simUpdatesPerFrame: 1, dynamicResMin: 0.5,

  // Camera
  cameraSmooth: 0.3, cameraSpeed: 2, touchDeadzone: 5,
  zoomMin: 0.01, zoomMax: 20, pinchSensitivity: 1,

  // Misc
  deterministicMode: false, autoSave: false, autoSaveInterval: 0,
  maxUndo: 10, logLevel: 'info', enableTelemetry: false, devMode: false,

  // HUD
  HUDOpacity: 0.8, HUDScale: 1,

  // Theme
  theme: 'dark', backgroundColor: '#05050a', backgroundColorDark: '#000008',
  clearColor: '#08081a',

  // Boundary Material
  pressureStiffness: 1, surfaceAdhesion: 0,
  wallElasticityLeft: 1, wallElasticityRight: 1,
  wallElasticityTop: 1, wallElasticityBottom: 1,
};
