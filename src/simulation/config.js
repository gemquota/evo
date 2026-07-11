// Config validation and normalization
// Defaults are always sourced from DEFAULT_CONFIG in presets.js to prevent drift.

import { DEFAULT_CONFIG } from './presets';

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

// Bounds only — defaults come from DEFAULT_CONFIG automatically
const NUMERIC_FIELDS = {
  friction:           { min: 0.1,  max: 0.99 },
  timeScale:          { min: 0.05, max: 3    },
  maxForce:           { min: 0.1,  max: 5    },
  noiseAmount:        { min: 0,    max: 2    },
  trailOpacity:       { min: 0,    max: 0.2  },
  glowIntensity:      { min: 0,    max: 2    },
  connectionDistance: { min: 50,   max: 2500  },
  worldWidth:         { min: 200,  max: 10000 },
  worldHeight:        { min: 200,  max: 10000 },
  zRange:             { min: 10,   max: 10000 },
  stackPerspective:   { min: 0,    max: 10   },
  clusterCount:       { min: 1,    max: 30   },
  clusterSpread:      { min: 50,   max: 2500  },
  ringRadius:         { min: 100,  max: 2500  },
  physicsRate:        { min: 1,    max: 5    },
  renderQuality:      { min: 0.25, max: 1    },
  attractForce:       { min: 0.1,  max: 10   },
  attractRadius:      { min: 10,   max: 1000 },
};

const BOOLEAN_FIELDS = [
  'trailsEnabled', 'connectionsEnabled', 'showStats', 'showGlow',
  'adaptiveQuality', 'showWorldBorder',
];

const STRING_FIELDS = ['edgeMode', 'distributionMode', 'initialVelocity'];

function defaultFor(key) {
  return DEFAULT_CONFIG[key];
}

export function validateGlobal(config) {
  const v = { ...config };
  for (const [key, spec] of Object.entries(NUMERIC_FIELDS)) {
    if (v[key] == null) {
      v[key] = defaultFor(key);
      if (v[key] == null) v[key] = (spec.min + spec.max) / 2;
    } else {
      v[key] = clamp(Number(v[key]), spec.min, spec.max);
    }
  }
  for (const key of BOOLEAN_FIELDS) v[key] = !!v[key];
  for (const key of STRING_FIELDS) {
    if (!v[key]) v[key] = defaultFor(key) || '';
  }
  return v;
}

export function validateSpecies(species) {
  if (!Array.isArray(species) || species.length === 0) {
    return DEFAULT_CONFIG.species.map((s) => ({ ...s }));
  }
  return species.map((s) => ({
    name: s.name || 'Unknown',
    count: Math.max(0, Math.floor(Number(s.count) || 0)),
    speed: clamp(Number(s.speed) || 0, 1, 100),
    maxSpeed: clamp(Number(s.maxSpeed) || 0, 1, 300),
    size: clamp(Number(s.size) || 0, 0.5, 12),
    hue: ((Number(s.hue) || 0) % 360 + 360) % 360,
    saturation: clamp(Number(s.saturation) || 0, 0, 100),
    lightness: clamp(Number(s.lightness) || 0, 20, 90),
    interactionRadius: clamp(Number(s.interactionRadius) || 0, 50, 5000),
    repulsionRadius: clamp(Number(s.repulsionRadius) || 0, 10, 800),
    repulsionStrength: clamp(Number(s.repulsionStrength) || 0, 0.1, 3),
  }));
}

export function validateMatrix(matrix, n) {
  if (!Array.isArray(matrix) || matrix.length !== n) {
    return Array.from({ length: n }, () => Array(n).fill(0));
  }
  return matrix.map((row) => {
    if (!Array.isArray(row) || row.length !== n) return Array(n).fill(0);
    return row.map((v) => clamp(Number(v) || 0, -3, 3));
  });
}

export function mergeConfigWithPreset(currentConfig, preset, keepDimensions = true) {
  const global = { ...currentConfig, ...preset.global };
  if (keepDimensions) {
    global.worldWidth = currentConfig.worldWidth;
    global.worldHeight = currentConfig.worldHeight;
  }
  return validateGlobal(global);
}
