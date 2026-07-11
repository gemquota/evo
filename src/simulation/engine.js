// Particle Life Engine — spatially optimized with frame skipping

export class ParticleLifeEngine {
  constructor(width, height, config) {
    this.viewWidth = width;
    this.viewHeight = height;
    this.config = { ...config };
    this.particles = [];
    this.initialized = false;
    this.camX = 0;
    this.camY = 0;
    this.camZoom = 1;
    this._grid = [];
    this._physicsTick = 0;
    // Stats cache
    this._prevSpeciesCounts = null;
    this._prevSpeciesNames = null;
  }

  setConfig(config) {
    this.config = { ...config };
    this._prevSpeciesCounts = null;
  }

  setViewSize(w, h) {
    this.viewWidth = w;
    this.viewHeight = h;
    this.fitCamera();
  }

  get ww() { return this.config.worldWidth || 800; }
  get wh() { return this.config.worldHeight || 600; }
  get zRange() { return this.config.zRange || 1000; }

  fitCamera() {
    const z = Math.min(this.viewWidth / this.ww, this.viewHeight / this.wh);
    this.camZoom = z;
    this.camX = (this.viewWidth - this.ww * z) / 2;
    this.camY = (this.viewHeight - this.wh * z) / 2;
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.camX) / this.camZoom,
      y: (sy - this.camY) / this.camZoom,
    };
  }

  // Snapshot for renderer — world dimensions come from config, not here
  getSnapshot() {
    return {
      particles: this.particles,
      camX: this.camX,
      camY: this.camY,
      camZoom: this.camZoom,
      zRange: this.zRange,
    };
  }

  reset() {
    this.particles = [];
    const c = this.config;
    const { species, distributionMode, initialVelocity, clusterCount, clusterSpread, ringRadius } = c;
    if (!species || !species.length) return;
    const W = this.ww, H = this.wh, ZR = this.zRange;

    const clusters = [];
    if (distributionMode === 'cluster') {
      for (let i = 0, n = Math.max(1, clusterCount || 5); i < n; i++)
        clusters.push({ x: Math.random() * W, y: Math.random() * H });
    } else if (distributionMode === 'ring') {
      const r = Math.min(ringRadius || 150, Math.min(W, H) * 0.4);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        clusters.push({ x: W/2 + Math.cos(a)*r, y: H/2 + Math.sin(a)*r });
      }
    }

    const total = species.reduce((s, sp) => s + Math.max(0, Math.floor(sp.count || 0)), 0);
    this.particles = new Array(total);
    let idx = 0;

    species.forEach((s, si) => {
      const cnt = Math.max(0, Math.floor(s.count || 0));
      for (let i = 0; i < cnt; i++) {
        let x, y;
        switch (distributionMode) {
          case 'grid': {
            const cols = Math.ceil(Math.sqrt(cnt * (W / H))), rows = Math.ceil(cnt / cols);
            const gx = W / (cols + 1), gy = H / (rows + 1);
            x = gx * ((i % cols) + 1) + (Math.random() - 0.5) * gx * 0.2;
            y = gy * (Math.floor(i / cols) + 1) + (Math.random() - 0.5) * gy * 0.2;
            break;
          }
          case 'cluster': {
            const cl = clusters[i % clusters.length] || { x: W/2, y: H/2 };
            const sp = clusterSpread || 60;
            x = cl.x + (Math.random() - 0.5) * sp * 2;
            y = cl.y + (Math.random() - 0.5) * sp * 2;
            break;
          }
          case 'ring': {
            const a = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * Math.min(ringRadius || 150, Math.min(W, H) * 0.4);
            x = W/2 + Math.cos(a) * r;
            y = H/2 + Math.sin(a) * r;
            break;
          }
          default:
            x = Math.random() * W; y = Math.random() * H;
        }
        x = Math.max(0, Math.min(W, x)); y = Math.max(0, Math.min(H, y));
        let vx, vy, vz;
        switch (initialVelocity) {
          case 'zero': vx = 0; vy = 0; vz = 0; break;
          case 'slow': vx = (Math.random() - 0.5) * 0.3; vy = (Math.random() - 0.5) * 0.3; vz = (Math.random() - 0.5) * 0.3; break;
          case 'fast': vx = (Math.random() - 0.5) * 3; vy = (Math.random() - 0.5) * 3; vz = (Math.random() - 0.5) * 3; break;
          case 'radial': { const a = Math.random() * Math.PI * 2; const s = 0.5 + Math.random() * 1.5; vx = Math.cos(a) * s; vy = Math.sin(a) * s; vz = (Math.random() - 0.5) * s; break; }
          default: vx = (Math.random() - 0.5) * 0.5; vy = (Math.random() - 0.5) * 0.5; vz = (Math.random() - 0.5) * 0.5;
        }
        this.particles[idx++] = { x, y, z: Math.random() * ZR, vx, vy, vz, species: si };
      }
    });
    this._prevSpeciesCounts = null;
    this.initialized = true;
  }

  update() {
    if (!this.initialized) return;
    const { physicsRate } = this.config;
    this._physicsTick = (this._physicsTick + 1) % Math.max(1, Math.round(physicsRate || 1));
    if (this._physicsTick !== 0) return;
    this._doPhysics();
  }

  _doPhysics() {
    const { particles, config } = this;
    const { friction, timeScale, maxForce, noiseAmount, edgeMode, species, interactionMatrix } = config;
    const W = this.ww, H = this.wh, ZR = this.zRange;
    const n = particles.length;
    if (n === 0) return;

    // Precompute species props
    let maxR = 0;
    const sp = new Array(species.length);
    for (let si = 0; si < species.length; si++) {
      const s = species[si];
      const r = s.interactionRadius || 200;
      sp[si] = { minR: s.repulsionRadius || 20, maxR: r, repStr: s.repulsionStrength || 1.0, maxSpd: s.maxSpeed || 5 };
      if (r > maxR) maxR = r;
    }

    // Build spatial grid
    const cellSize = Math.max(50, maxR / 2);
    const checkCells = Math.ceil(maxR / cellSize);
    const cols = Math.ceil(W / cellSize) + 2;
    const rows = Math.ceil(H / cellSize) + 2;
    const gridLen = cols * rows;

    let grid = this._grid;
    if (grid.length !== gridLen) {
      grid = this._grid = new Array(gridLen);
      for (let ci = 0; ci < gridLen; ci++) grid[ci] = [];
    } else {
      for (let ci = 0; ci < gridLen; ci++) grid[ci].length = 0;
    }

    for (let pi = 0; pi < n; pi++) {
      const p = particles[pi];
      const cx = ((Math.floor(p.x / cellSize)) % cols + cols) % cols;
      const cy = ((Math.floor(p.y / cellSize)) % rows + rows) % rows;
      grid[cy * cols + cx].push(pi);
    }

    // Compute forces using spatial grid
    for (let i = 0; i < n; i++) {
      const p = particles[i];
      const { minR, maxR: maxRi, repStr } = sp[p.species];
      const matrixRow = interactionMatrix[p.species];
      let fx = 0, fy = 0;

      const cx = ((Math.floor(p.x / cellSize)) % cols + cols) % cols;
      const cy = ((Math.floor(p.y / cellSize)) % rows + rows) % rows;

      for (let dy = -checkCells; dy <= checkCells; dy++) {
        for (let dx = -checkCells; dx <= checkCells; dx++) {
          const nx = ((cx + dx) % cols + cols) % cols;
          const ny = ((cy + dy) % rows + rows) % rows;
          const cell = grid[ny * cols + nx];
          for (let ci = 0; ci < cell.length; ci++) {
            const j = cell[ci];
            if (i === j) continue;
            const q = particles[j];
            let dxp = q.x - p.x, dyp = q.y - p.y;
            if (edgeMode === 'wrap') {
              if (dxp > W/2) dxp -= W; if (dxp < -W/2) dxp += W;
              if (dyp > H/2) dyp -= H; if (dyp < -H/2) dyp += H;
            }
            const dSq = dxp * dxp + dyp * dyp;
            if (dSq < 0.01 || dSq > maxRi * maxRi) continue;
            const d = Math.sqrt(dSq);
            const inv = 1 / d;
            if (d < minR) {
              const f = repStr * (d / minR - 1);
              fx += f * dxp * inv; fy += f * dyp * inv;
            } else {
              const t = (d - minR) / (maxRi - minR);
              fx += matrixRow[q.species] * (1 - t) * (1 - t) * dxp * inv;
              fy += matrixRow[q.species] * (1 - t) * (1 - t) * dyp * inv;
            }
          }
        }
      }
      p.fx = fx; p.fy = fy;
    }

    // Apply forces & update positions
    for (let i = 0; i < n; i++) {
      const p = particles[i];
      const { maxSpd } = sp[p.species];

      let fm = p.fx * p.fx + p.fy * p.fy;
      if (fm > maxForce * maxForce) {
        fm = Math.sqrt(fm); p.fx *= maxForce / fm; p.fy *= maxForce / fm;
      }

      p.vx += p.fx * timeScale; p.vy += p.fy * timeScale;
      p.vx *= friction; p.vy *= friction;
      if (noiseAmount > 0) {
        const nz = noiseAmount * timeScale;
        p.vx += (Math.random() - 0.5) * nz;
        p.vy += (Math.random() - 0.5) * nz;
        p.vz += (Math.random() - 0.5) * nz;
      }
      p.x += p.vx; p.y += p.vy;
      p.vz *= friction; p.z += p.vz;

      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz);
      if (spd > maxSpd) { const sc = maxSpd / spd; p.vx *= sc; p.vy *= sc; p.vz *= sc; }

      // Edge handling — all three modes now implemented
      if (edgeMode === 'wrap') {
        if (p.x < 0) p.x += W; if (p.x >= W) p.x -= W;
        if (p.y < 0) p.y += H; if (p.y >= H) p.y -= H;
        if (p.z < 0) p.z += ZR; if (p.z >= ZR) p.z -= ZR;
      } else if (edgeMode === 'bounce') {
        if (p.x < 0) { p.x = -p.x; p.vx = -p.vx; }
        if (p.x >= W) { p.x = 2 * W - p.x; p.vx = -p.vx; }
        if (p.y < 0) { p.y = -p.y; p.vy = -p.vy; }
        if (p.y >= H) { p.y = 2 * H - p.y; p.vy = -p.vy; }
        if (p.z < 0) { p.z = -p.z; p.vz = -p.vz; }
        if (p.z >= ZR) { p.z = 2 * ZR - p.z; p.vz = -p.vz; }
      } else if (edgeMode === 'contain') {
        if (p.x < 0) { p.x = 0; p.vx = -p.vx * 0.5; }
        if (p.x >= W) { p.x = W - 1; p.vx = -p.vx * 0.5; }
        if (p.y < 0) { p.y = 0; p.vy = -p.vy * 0.5; }
        if (p.y >= H) { p.y = H - 1; p.vy = -p.vy * 0.5; }
        if (p.z < 0) { p.z = 0; p.vz = -p.vz * 0.5; }
        if (p.z >= ZR) { p.z = ZR - 1; p.vz = -p.vz * 0.5; }
      }
    }
    // Mouse interaction removed — touch-only device
  }

  getStats() {
    const n = this.particles.length;
    const { species } = this.config;
    const sc = species || [];

    if (!this._prevSpeciesCounts || !this._prevSpeciesNames) {
      this._prevSpeciesNames = sc.map((s) => s.name);
      this._prevSpeciesCounts = new Array(sc.length).fill(0);
    }

    const counts = this._prevSpeciesCounts;
    const names = this._prevSpeciesNames;
    for (let i = 0; i < counts.length; i++) counts[i] = 0;
    for (let i = 0; i < n; i++) counts[this.particles[i].species]++;

    const speciesObj = {};
    for (let i = 0; i < counts.length; i++) speciesObj[names[i]] = counts[i];
    return { total: n, species: speciesObj };
  }
}
