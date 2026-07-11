// Particle Life Presets — curated interaction matrices and starter configurations

function baseSpecies() {
  return [
    { name: 'Cyan', count: 1000, speed: 18, size: 3.5, hue: 185, saturation: 90, lightness: 65, interactionRadius: 600, repulsionRadius: 80, repulsionStrength: 1.2, maxSpeed: 60 },
    { name: 'Magenta', count: 1000, speed: 14, size: 3, hue: 310, saturation: 85, lightness: 60, interactionRadius: 550, repulsionRadius: 70, repulsionStrength: 1.1, maxSpeed: 55 },
    { name: 'Lime', count: 1000, speed: 22, size: 2.5, hue: 120, saturation: 80, lightness: 55, interactionRadius: 500, repulsionRadius: 65, repulsionStrength: 1.3, maxSpeed: 65 },
    { name: 'Gold', count: 1000, speed: 12, size: 4, hue: 45, saturation: 95, lightness: 60, interactionRadius: 700, repulsionRadius: 90, repulsionStrength: 0.9, maxSpeed: 50 },
    { name: 'Coral', count: 1000, speed: 16, size: 3, hue: 10, saturation: 80, lightness: 60, interactionRadius: 600, repulsionRadius: 75, repulsionStrength: 1.0, maxSpeed: 55 },
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
    [ 0.0,  0.7, -0.4,  0.3, -0.2],
    [-0.3,  0.0,  0.8, -0.5,  0.4],
    [ 0.4, -0.5,  0.0,  0.7, -0.3],
    [-0.2,  0.4, -0.6,  0.0,  0.6],
    [ 0.3, -0.3,  0.2, -0.5,  0.0],
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
    { name: 'Prey', count: 1000, speed: 24, size: 2, hue: 120, saturation: 85, lightness: 60, interactionRadius: 800, repulsionRadius: 60, repulsionStrength: 1.5, maxSpeed: 80 },
    { name: 'Predator', count: 200, speed: 30, size: 5, hue: 0, saturation: 90, lightness: 55, interactionRadius: 1000, repulsionRadius: 100, repulsionStrength: 0.4, maxSpeed: 100 },
    { name: 'Scavenger', count: 500, speed: 18, size: 2.5, hue: 40, saturation: 85, lightness: 55, interactionRadius: 600, repulsionRadius: 55, repulsionStrength: 0.9, maxSpeed: 50 },
    { name: 'Toxin', count: 300, speed: 8, size: 4.5, hue: 280, saturation: 80, lightness: 55, interactionRadius: 500, repulsionRadius: 120, repulsionStrength: 0.3, maxSpeed: 30 },
    { name: 'Symbiote', count: 300, speed: 14, size: 2, hue: 200, saturation: 90, lightness: 60, interactionRadius: 550, repulsionRadius: 50, repulsionStrength: 1.8, maxSpeed: 50 },
  ], [
    [ 0.8, -1.0,  0.3,  0.0,  0.5],
    [ 1.0,  0.0, -0.6, -0.3,  0.2],
    [-0.2,  0.5,  0.6,  0.2,  0.4],
    [ 0.0,  0.2, -0.1,  0.5,  0.0],
    [ 0.3,  0.1,  0.4,  0.0,  0.8],
  ], { friction: 0.76, trailOpacity: 0.04, timeScale: 1.2, maxForce: 3.5, noiseAmount: 0.06, name: '🦠 Ecosystem', desc: 'Predator-prey chasing and swarming' }),

  // Crystallis — crystal lattices and formations
  preset(baseSpecies().map(s => ({ ...s, count: Math.round(s.count * 0.6), speed: s.speed * 0.5, interactionRadius: s.interactionRadius * 1.5 })), [
    [ 1.5,  0.2, -0.8,  0.1, -0.3],
    [ 0.2,  1.8,  0.3, -0.7,  0.0],
    [-0.8,  0.3,  1.2,  0.4, -0.5],
    [ 0.1, -0.7,  0.4,  1.6,  0.2],
    [-0.3,  0.0, -0.5,  0.2,  1.4],
  ], { friction: 0.92, trailOpacity: 0.02, timeScale: 0.5, maxForce: 1.5, noiseAmount: 0.01, name: '💎 Crystallis', desc: 'Crystal lattices and formations' }),

  // Nebula — swirling cosmic clouds
  preset(baseSpecies().map(s => ({ ...s, count: Math.round(s.count * 1.8), speed: s.speed * 0.8, size: s.size * 0.7 })), [
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
  friction: 0.82, trailOpacity: 0.03, timeScale: 1.0, maxForce: 3.0, noiseAmount: 0.04,
  edgeMode: 'wrap',
  attractForce: 2.0, attractRadius: 300,
  trailsEnabled: true, connectionsEnabled: false, connectionDistance: 600,
  showStats: true, showGlow: true, glowIntensity: 1.0,
  worldWidth: 2500, worldHeight: 1406, showWorldBorder: true,
  distributionMode: 'random', initialVelocity: 'random',
  clusterCount: 8, clusterSpread: 400, ringRadius: 1000,
  zRange: 10000, stackPerspective: 2,
  physicsRate: 1, renderQuality: 1,
};
