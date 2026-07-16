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
    // Touch attract state (set by input handler, consumed in _doPhysics)
    this._touchAttractX = null;
    this._touchAttractY = null;
  }

  setConfig(config) {
    this.config = { ...config };
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

  // Touch attract — called from the touch handler (Item 3: consolidated in engine)
  setTouchAttract(screenX, screenY) {
    const w = this.screenToWorld(screenX, screenY);
    this._touchAttractX = w.x;
    this._touchAttractY = w.y;
  }

  clearTouchAttract() {
    this._touchAttractX = null;
    this._touchAttractY = null;
  }

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
    const { species, distributionMode, initialVelocity, clusterCount, clusterSpread, ringRadius, spawnJitter, centerBias } = c;
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

    // Guard against zero total
    const total = species.reduce((s, sp) => s + Math.max(0, Math.floor(sp.count || 0)), 0);
    if (total === 0) { this.initialized = true; return; }

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
            x = gx * ((i % cols) + 1) + (Math.random() - 0.5) * gx * (spawnJitter || 0.2);
            y = gy * (Math.floor(i / cols) + 1) + (Math.random() - 0.5) * gy * (spawnJitter || 0.2);
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
            const cb = centerBias || 0; if (cb > 0) { const ca = Math.random() * Math.PI * 2; const cr = Math.random() * cb * Math.min(W, H) * 0.4; x = W/2 + Math.cos(ca) * cr; y = H/2 + Math.sin(ca) * cr; } else { x = Math.random() * W; y = Math.random() * H; }
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
        this.particles[idx++] = { x, y, z: Math.random() * ZR, vx, vy, vz, species: si, ox: x, oy: y, fx: 0, fy: 0 };
      }
    });
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
    const { friction, maxForce, noiseAmount, edgeMode, species, interactionMatrix,
          gravityWell, gravityWellRadius, vortexStrength, bounceRestitution, massVariation,
          forceDecayPower, interactionJitter, velocityDampingZ, dragLinear,
          boundaryRepelForce, pairwiseCutoff, matrixDrift,
          minSpeed, repulsionFalloff, harmonicStrength, harmonicRange, wanderRate,
          bounceFriction, bounceRandomize, noiseFieldScale, noiseFieldStrength,
          worldMargin, spawnJitter, velocityClip, timeScale: ts, forceInertia, interactionSymmetry, pairwiseSkipChance, centerBias, boundaryWarmth, radialDrift, noiseDrift, velocityExchange, jerkLimit, zGravity } = config;
    const timeScale = ts || 1;
    const W = this.ww, H = this.wh, ZR = this.zRange;
    const n = particles.length;
    if (n === 0) return;

    // Precompute species props
    let maxR = 0;
    const mv = massVariation || 0;
    const pmass = mv > 0 ? new Array(n) : null;
    if (pmass) for (let mi = 0; mi < n; mi++) pmass[mi] = 1 + (Math.random() - 0.5) * mv * 2;
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
      const isym = interactionSymmetry || 0;
      let fx = 0, fy = 0;

      const cx = ((Math.floor(p.x / cellSize)) % cols + cols) % cols;
      const cy = ((Math.floor(p.y / cellSize)) % rows + rows) % rows;

      for (let dy = -checkCells; dy <= checkCells; dy++) {
        for (let dx = -checkCells; dx <= checkCells; dx++) {
          const nx = ((cx + dx) % cols + cols) % cols;
          const ny = ((cy + dy) % rows + rows) % rows;
          const cell = grid[ny * cols + nx];
          const pwCut = pairwiseCutoff || 200;
          let pwCount = 0;
          const psc = pairwiseSkipChance || 0;
          for (let ci = 0; ci < cell.length && pwCount < pwCut; ci++) {
            const j = cell[ci];
            if (i === j) continue;
            if (psc > 0 && Math.random() < psc) continue;
            pwCount++;
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
              const f = repStr * Math.pow(d / minR - 1, repulsionFalloff || 1);
              fx += f * dxp * inv; fy += f * dyp * inv;
            } else {
              const t = (d - minR) / (maxRi - minR);
              const decPow = forceDecayPower != null ? forceDecayPower : 2;
              const g = (isym > 0 && interactionMatrix[q.species] ? interactionMatrix[p.species].map((v,idx) => (v + interactionMatrix[q.species][idx]) / 2 * isym + v * (1 - isym)) : interactionMatrix[p.species])[q.species] * Math.pow(1 - t, decPow);
              const ij = interactionJitter || 0;
              if (ij > 0) { const jn = (Math.random() - 0.5) * ij * 0.5; fx += g * dxp * inv + jn * dxp * inv; fy += g * dyp * inv + jn * dyp * inv; }
              else { fx += g * dxp * inv; fy += g * dyp * inv; }
            }
          }
        }
      }
      const fi = forceInertia || 0;
      if (fi > 0) { fx = fx * (1 - fi) + (p.fx != null ? p.fx : 0) * fi; fy = fy * (1 - fi) + (p.fy != null ? p.fy : 0) * fi; }
      const jl = jerkLimit || 0;
      if (jl > 0 && p.fx != null) { const dfx = fx - p.fx, dfy = fy - p.fy; const dfm = Math.sqrt(dfx*dfx + dfy*dfy); if (dfm > jl) { const sc = jl / dfm; fx = p.fx + dfx * sc; fy = p.fy + dfy * sc; } }
      p.fx = fx; p.fy = fy;
      // Gravity well (central pull)
      const gw = gravityWell || 0;
      if (gw > 0) {
        const gwr = gravityWellRadius || 2500;
        let gdx = W/2 - p.x, gdy = H/2 - p.y;
        if (edgeMode === 'wrap') {
          if (gdx > W/2) gdx -= W; if (gdx < -W/2) gdx += W;
          if (gdy > H/2) gdy -= H; if (gdy < -H/2) gdy += H;
        }
        const gd = Math.sqrt(gdx*gdx + gdy*gdy);
        if (gd < gwr && gd > 1) {
          const gf = gw * (1 - gd / gwr) * 0.005;
          p.fx += gf * gdx / gd;
          p.fy += gf * gdy / gd;
        }
      }
      // Vortex (rotational flow)
      const vs = vortexStrength || 0;
      if (vs > 0) {
        const vx = -p.vy * vs * 0.005;
        const vy = p.vx * vs * 0.005;
        p.fx += vx; p.fy += vy;
      }
      // Harmonic spring toward spawn origin
      const hs = harmonicStrength || 0;
      if (hs > 0 && p.ox != null) {
        let hdx = p.ox - p.x, hdy = p.oy - p.y;
        if (edgeMode === 'wrap') {
          if (hdx > W/2) hdx -= W; if (hdx < -W/2) hdx += W;
          if (hdy > H/2) hdy -= H; if (hdy < -H/2) hdy += H;
        }
        const hd = Math.sqrt(hdx*hdx + hdy*hdy);
        const hr = harmonicRange || 1000;
        if (hd < hr && hd > 1) {
          const hf = hs * (1 - hd/hr) * 0.01;
          p.fx += hf * hdx / hd;
          p.fy += hf * hdy / hd;
        }
      }
    }

    // Apply forces & update positions
    for (let i = 0; i < n; i++) {
      const p = particles[i];
      const { maxSpd } = sp[p.species];

let fm = p.fx * p.fx + p.fy * p.fy;
      const vc = velocityClip || 0;
      if (vc > 0) {
        // Per-axis clamping
        if (Math.abs(p.fx) > maxForce) p.fx = Math.sign(p.fx) * maxForce;
        if (Math.abs(p.fy) > maxForce) p.fy = Math.sign(p.fy) * maxForce;
      } else if (fm > maxForce * maxForce) {
        fm = Math.sqrt(fm); p.fx *= maxForce / fm; p.fy *= maxForce / fm;
      }

      const mi = pmass ? pmass[i] : 1;
      p.vx += (p.fx * timeScale) / mi; p.vy += (p.fy * timeScale) / mi;
      // velocity exchange placeholder
      const vda = velocityDecayAngle || 0;
      if (vda > 0) { const vdaRad = vda * 0.01745; const cv = Math.cos(vdaRad), sv = Math.sin(vdaRad); const vxr = p.vx * cv - p.vy * sv, vyr = p.vx * sv + p.vy * cv; p.vx = vxr * friction; p.vy = vyr * friction; } else { p.vx *= friction; p.vy *= friction; }
      const dl = dragLinear || 0;
      if (dl > 0) { p.vx *= (1 - dl); p.vy *= (1 - dl); }
      if (noiseAmount > 0) {
        const nz = noiseAmount * timeScale;
        const nd = noiseDrift || 0;
        const na = Math.random() * Math.PI * 2;
        p.vx += (Math.random() - 0.5) * nz + Math.cos(na) * nz * nd;
        p.vy += (Math.random() - 0.5) * nz + Math.sin(na) * nz * nd;
        p.vz += (Math.random() - 0.5) * nz;
        // Radial drift
      const rd = radialDrift || 0;
      if (rd !== 0) {
        const dxc = W/2 - p.x, dyc = H/2 - p.y;
        const dc = Math.sqrt(dxc*dxc + dyc*dyc);
        if (dc > 1) { p.vx += (dxc/dc) * rd * 0.05; p.vy += (dyc/dc) * rd * 0.05; }
      }
      // Wander — angular random walk
        const wr = wanderRate || 0;
        if (wr > 0) {
          const ang = Math.atan2(p.vy, p.vx) + (Math.random() - 0.5) * wr;
          const sp = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
          if (sp > 0.01) { p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp; }
        }
      }
      p.x += p.vx; p.y += p.vy;
      const vzDamp = velocityDampingZ != null ? velocityDampingZ : friction;
      const zg = zGravity || 0;
      if (zg !== 0) p.vz += zg * timeScale;
      p.vz *= vzDamp; p.z += p.vz;

      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz);
      const minSpd = minSpeed || 0;
      if (minSpd > 0 && spd > 0 && spd < minSpd) { const sc = minSpd / spd; p.vx *= sc; p.vy *= sc; p.vz *= sc; }
      if (spd > maxSpd) { const sc = maxSpd / spd; p.vx *= sc; p.vy *= sc; p.vz *= sc; }

      // Noise field — position-correlated perturbation
      const nfs = noiseFieldStrength || 0;
      if (nfs > 0) {
        const nfScale = noiseFieldScale || 0.01;
        const hx = Math.sin(p.x * nfScale * 6.283 + p.y * nfScale * 3.141) * nfs * timeScale;
        const hy = Math.cos(p.x * nfScale * 3.141 - p.y * nfScale * 6.283) * nfs * timeScale;
        p.vx += hx; p.vy += hy;
      }

      // Edge handling
      if (edgeMode === 'wrap') {
        if (p.x < 0) p.x += W; if (p.x >= W) p.x -= W;
        if (p.y < 0) p.y += H; if (p.y >= H) p.y -= H;
        if (p.z < 0) p.z += ZR; if (p.z >= ZR) p.z -= ZR;
      } else if (edgeMode === 'bounce') {
        const bf = bounceFriction != null ? bounceFriction : 0.3;
        const br = bounceRandomize || 0;
        if (p.x < 0) { p.x = -p.x; p.vx = -p.vx * (bounceRestitution || 0.5); p.vy *= (1 - bf); if (br) { const a = (Math.random()-0.5)*br*0.0174; const c=Math.cos(a),s2=Math.sin(a); const vx=p.vx,vy=p.vy; p.vx=vx*c-vy*s2; p.vy=vx*s2+vy*c; } }
        if (p.x >= W) { p.x = 2 * W - p.x; p.vx = -p.vx * (bounceRestitution || 0.5); p.vy *= (1 - bf); if (br) { const a = (Math.random()-0.5)*br*0.0174; const c=Math.cos(a),s2=Math.sin(a); const vx=p.vx,vy=p.vy; p.vx=vx*c-vy*s2; p.vy=vx*s2+vy*c; } }
        if (p.y < 0) { p.y = -p.y; p.vy = -p.vy * (bounceRestitution || 0.5); p.vx *= (1 - bf); }
        if (p.y >= H) { p.y = 2 * H - p.y; p.vy = -p.vy * (bounceRestitution || 0.5); p.vx *= (1 - bf); }
        if (p.z < 0) { p.z = -p.z; p.vz = -p.vz; }
        if (p.z >= ZR) { p.z = 2 * ZR - p.z; p.vz = -p.vz; }
      } else if (edgeMode === 'contain') {
        if (p.x < 0) { p.x = 0; p.vx = -p.vx * (bounceRestitution || 0.5); }
        if (p.x >= W) { p.x = W - 1; p.vx = -p.vx * (bounceRestitution || 0.5); }
        if (p.y < 0) { p.y = 0; p.vy = -p.vy * (bounceRestitution || 0.5); }
        if (p.y >= H) { p.y = H - 1; p.vy = -p.vy * (bounceRestitution || 0.5); }
        if (p.z < 0) { p.z = 0; p.vz = -p.vz * (bounceRestitution || 0.5); }
        if (p.z >= ZR) { p.z = ZR - 1; p.vz = -p.vz * (bounceRestitution || 0.5); }
      }
      // Boundary warmth (speed boost near edges)
      const bw = boundaryWarmth || 0;
      if (bw > 0) {
        const bwDist = Math.min(p.x, W-p.x, p.y, H-p.y);
        const bwMargin = 100;
        if (bwDist < bwMargin) { const bwF = bw * (1 - bwDist/bwMargin) * 0.02; p.vx *= (1 + bwF); p.vy *= (1 + bwF); }
      }
      // Boundary repulsion (soft push from edges)
      const brf = boundaryRepelForce || 0;
      if (brf > 0) {
        const margin = worldMargin != null ? worldMargin : 50;
        if (p.x < margin) { const d = p.x / margin; p.vx += brf * (1 - d) * timeScale * 0.1; }
        if (p.x > W - margin) { const d = (W - p.x) / margin; p.vx -= brf * (1 - d) * timeScale * 0.1; }
        if (p.y < margin) { const d = p.y / margin; p.vy += brf * (1 - d) * timeScale * 0.1; }
        if (p.y > H - margin) { const d = (H - p.y) / margin; p.vy -= brf * (1 - d) * timeScale * 0.1; }
      }
    }

    // Matrix drift — decay matrix values toward zero
    const md = matrixDrift || 0;
    if (md > 0 && interactionMatrix && interactionMatrix.length > 0) {
      for (let ri = 0; ri < interactionMatrix.length; ri++) {
        for (let cj = 0; cj < interactionMatrix[ri].length; cj++) {
          const v = interactionMatrix[ri][cj];
          if (Math.abs(v) > 0.001) interactionMatrix[ri][cj] = v * (1 - md);
          else interactionMatrix[ri][cj] = 0;
        }
      }
    }

    // Touch attract — consolidated here instead of in the touch handler (Item 3)
    if (this._touchAttractX != null && this._touchAttractY != null) {
      const mx = this._touchAttractX;
      const my = this._touchAttractY;
      const mf = config.attractForce || 2;
      const mr = (config.attractRadius || 300) / this.camZoom;
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        let dx = mx - p.x, dy = my - p.y;
        if (edgeMode === 'wrap') {
          if (dx > W / 2) dx -= W; if (dx < -W / 2) dx += W;
          if (dy > H / 2) dy -= H; if (dy < -H / 2) dy += H;
        }
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < mr && d > 1) {
          const s = mf * (1 - d / mr) * timeScale;
          p.vx += (s * dx) / d;
          p.vy += (s * dy) / d;
        }
      }
    }
  }

  getStats() {
    const n = this.particles.length;
    const { species } = this.config;
    const sc = species || [];
    const names = sc.map((s) => s.name);
    const counts = new Array(sc.length).fill(0);
    for (let i = 0; i < n; i++) {
      const si = this.particles[i].species;
      if (si >= 0 && si < counts.length) counts[si]++;
    }
    const speciesObj = {};
    for (let i = 0; i < counts.length; i++) speciesObj[names[i]] = counts[i];
    return { total: n, species: speciesObj };
  }
}
