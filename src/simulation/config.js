// Config validation and normalization
// Defaults are always sourced from DEFAULT_CONFIG in presets.js to prevent drift.

import { DEFAULT_CONFIG } from './presets';

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

// Bounds only — defaults come from DEFAULT_CONFIG automatically
const NUMERIC_FIELDS = {
  // ═══ DYNAMICS ═══
  friction:           { min: 0.1,  max: 0.99 },
  timeScale:          { min: 0.05, max: 3    },
  maxForce:           { min: 0.1,  max: 5    },
  noiseAmount:        { min: 0,    max: 2    },
  minSpeed:           { min: 0,    max: 5    },
  dragLinear:         { min: 0,    max: 0.5  },
  physicsRate:        { min: 1,    max: 5    },
  velocityDampingZ:   { min: 0.1,  max: 0.99 },
  velocityClip:       { min: 0,    max: 1    },
  massVariation:      { min: 0,    max: 1    },

  // ═══ FORCES ═══
  gravityWell:        { min: 0,    max: 5    },
  gravityWellRadius:  { min: 100,  max: 10000 },
  vortexStrength:     { min: 0,    max: 3    },
  forceDecayPower:    { min: 0.5,  max: 4    },
  interactionJitter:  { min: 0,    max: 1    },
  harmonicStrength:   { min: 0,    max: 2    },
  harmonicRange:      { min: 100,  max: 5000 },
  repulsionFalloff:   { min: 0.5,  max: 4    },
  wanderRate:         { min: 0,    max: 0.5  },
  attractForce:       { min: 0.1,  max: 10   },
  attractRadius:      { min: 10,   max: 1000 },
  noiseFieldScale:    { min: 0.001,max: 0.1  },
  noiseFieldStrength: { min: 0,    max: 3    },

  // ═══ BOUNDARY ═══
  bounceRestitution:  { min: 0.1,  max: 1    },
  bounceFriction:     { min: 0,    max: 1    },
  bounceRandomize:    { min: 0,    max: 30   },
  boundaryRepelForce: { min: 0,    max: 5    },
  worldMargin:        { min: 10,   max: 500  },
  pairwiseCutoff:     { min: 10,   max: 1000 },

  // ═══ WORLD ═══
  worldWidth:         { min: 200,  max: 10000 },
  worldHeight:        { min: 200,  max: 10000 },
  zRange:             { min: 10,   max: 10000 },
  stackPerspective:   { min: 0,    max: 10   },

  // ═══ DISTRIBUTION ═══
  clusterCount:       { min: 1,    max: 30   },
  clusterSpread:      { min: 50,   max: 2500  },
  ringRadius:         { min: 100,  max: 2500  },
  spawnJitter:        { min: 0,    max: 0.5  },

  // ═══ RENDERING ═══
  trailOpacity:       { min: 0,    max: 0.2  },
  glowIntensity:      { min: 0,    max: 2    },
  connectionDistance: { min: 50,   max: 2500  },
  connectionOpacity:  { min: 0,    max: 0.5  },
  connectionWidth:    { min: 0.1,  max: 3    },
  connectionFade:     { min: 0.5,  max: 4    },
  starBrightness:     { min: 0,    max: 1    },
  starDensity:        { min: 0.25, max: 3    },
  depthCue:           { min: 0,    max: 1    },
  minRadius:          { min: 0.2,  max: 3    },
  maxRadius:          { min: 3,    max: 20   },
  gridOpacity:        { min: 0,    max: 0.5  },
  particleOpacity:    { min: 0.2,  max: 1    },

  // ═══ QUALITY ═══
  renderQuality:      { min: 0.25, max: 1    },

  // ═══ ADVANCED ═══
  matrixDrift:        { min: 0,    max: 0.1  },
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
  return species.map((s) => {
    const sv = {
      name: s.name || 'Unknown',
      count: Math.max(0, Math.floor(Number(s.count) || 0)),
      maxSpeed: clamp(Number(s.maxSpeed) || 0, 1, 300),
      size: clamp(Number(s.size) || 0, 0.5, 12),
      hue: ((Number(s.hue) || 0) % 360 + 360) % 360,
      saturation: clamp(Number(s.saturation) || 0, 0, 100),
      lightness: clamp(Number(s.lightness) || 0, 20, 90),
      interactionRadius: clamp(Number(s.interactionRadius) || 0, 50, 5000),
      repulsionRadius: clamp(Number(s.repulsionRadius) || 0, 10, 800),
      repulsionStrength: clamp(Number(s.repulsionStrength) || 0, 0.1, 3),
    };
    // Prevent dead zone: repulsion radius must be smaller than interaction radius
    // Otherwise particles between the two radii get silently ignored by physics
    if (sv.repulsionRadius >= sv.interactionRadius) {
      sv.repulsionRadius = Math.max(sv.interactionRadius * 0.5, 10);
    }
    return sv;
  });
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
