// Particle Life Engine — spatially optimized with frame skipping

export class ParticleLifeEngine {
  constructor(width, height, config) {
    if (!config || !config.species || !config.species.length) {
      config = {
        worldWidth: 2500, worldHeight: 1406, zRange: 10000, friction: 0.78,
        timeScale: 1.0, maxForce: 4.0, noiseAmount: 0.12, edgeMode: "wrap",
        stackPerspective: 2, velocityDampingZ: 0.82,
        gravityWell: 0.3, vortexStrength: 0.2, forceDecayPower: 1.5,
        chemDecay: 0.015, chemDiffusion: 0.25, chemEmissionRate: 0.4,
        signalThreshold: 0.2, signalGain: 2.5, signalPropagation: 1.5,
        reproductionRate: 0.02, energyDecay: 0.008, maxEnergy: 250, reproductionCost: 20,
        alignmentForce: 0.3, cohesionForce: 0.2, separationForce: 0.5,
        matrixDrift: 0.002, attractionForce: 0.15,
        windStrength: 0.2, radialPulseAmp: 0.3, waveForceAmp: 0.2,
        massVariation: 0.3, boundaryWarmth: 0.3, radialDrift: 0.02,
        noiseFieldStrength: 0.5, wanderRate: 0.02,
        distributionMode: "random", initialVelocity: "random",
        bounceRestitution: 0.5, bounceFriction: 0.3,
        boundaryRepelForce: 0, worldMargin: 50, pairwiseCutoff: 200,
        clusterCount: 5, clusterSpread: 200, spawnJitter: 0.2,
        species: [
          {name: "Cyan", count: 240, size: 3.5, hue: 185, saturation: 90, lightness: 65, interactionRadius: 600, repulsionRadius: 80, repulsionStrength: 1.2, maxSpeed: 60},
          {name: "Magenta", count: 160, size: 3, hue: 310, saturation: 85, lightness: 60, interactionRadius: 550, repulsionRadius: 70, repulsionStrength: 1.1, maxSpeed: 55},
          {name: "Lime", count: 300, size: 2.5, hue: 120, saturation: 80, lightness: 55, interactionRadius: 500, repulsionRadius: 65, repulsionStrength: 1.3, maxSpeed: 65},
          {name: "Gold", count: 100, size: 4, hue: 45, saturation: 95, lightness: 60, interactionRadius: 700, repulsionRadius: 90, repulsionStrength: 0.9, maxSpeed: 50},
          {name: "Coral", count: 200, size: 3, hue: 10, saturation: 80, lightness: 60, interactionRadius: 600, repulsionRadius: 75, repulsionStrength: 1.0, maxSpeed: 55}
        ],
        interactionMatrix: [
          [0.2, 0.8, -0.7, 0.3, -0.5],
          [-0.9, 0.1, 0.7, -0.6, 0.8],
          [0.5, -0.8, 0.1, 0.9, -0.4],
          [-0.6, 0.4, -0.9, 0.1, 0.7],
          [0.3, -0.7, 0.5, -0.8, 0.0]
        ],
      };
    }
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
    this._simTime = 0;
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
    const MIN_ZOOM = 0.25;
    const z = Math.min(this.viewWidth / this.ww, this.viewHeight / this.wh);
    this.camZoom = Math.max(MIN_ZOOM, z);
    this.camX = (this.viewWidth - this.ww * this.camZoom) / 2;
    this.camY = (this.viewHeight - this.wh * this.camZoom) / 2;
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
    this._simTime = 0;
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
    if (!species || !species.length || !interactionMatrix) { return; }
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
        this.particles[idx++] = { x, y, z: Math.random() * ZR, vx, vy, vz, species: si, ox: x, oy: y, fx: 0, fy: 0, energy: Math.random() * 50 + 25, chem: 0 };
      }
    });
    this.initialized = true;
  }

  update() {
    if (!this.initialized) return;
    const { physicsRate } = this.config;
    this._simTime++;
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
          worldMargin, spawnJitter, velocityClip, timeScale: ts, forceInertia, interactionSymmetry, pairwiseSkipChance, centerBias, boundaryWarmth, radialDrift, noiseDrift, velocityExchange, jerkLimit, velocityDecayAngle, zGravity, windDir, windStrength, radialPulseAmp, radialPulseFreq, tidalStrength, noiseOctaves, waveForceAmp, waveFreq, waveSpeed, chemDecay, chemDiffusion, chemEmissionRate, signalThreshold, signalGain, signalPropagation, alignmentForce, cohesionForce, separationForce, leaderInfluence, herdThreshold, flockRadius, commRange, commBandwidth, signalMemory, protocolComplexity, accretionRate, mergeThreshold, massAbsorption, criticalMass, reproductionRate, reproductionEnergy, mutationRate, inheritTraits, energyDecay, maxEnergy, reproductionCost, pressureStiffness, surfaceAdhesion } = config;
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
              const matRow = interactionMatrix && interactionMatrix[p.species] ? interactionMatrix[p.species] : null;
              const matVal = matRow && matRow.length > q.species ? matRow[q.species] : 0;
              const g = matVal * Math.pow(1 - t, decPow);
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
      const ws = windStrength || 0;
      if (ws > 0) {
        const wdRad = (windDir || 0) * 0.01745;
        p.fx += Math.cos(wdRad) * ws * 0.005 * timeScale;
        p.fy += Math.sin(wdRad) * ws * 0.005 * timeScale;
      }
      const rpa = radialPulseAmp || 0;
      if (rpa > 0) {
        const rpf = radialPulseFreq || 0.5;
        const pulse = Math.sin(this._simTime * rpf * 0.01) * rpa * 0.003;
        let pdx = p.x - W/2, pdy = p.y - H/2;
        const pd = Math.sqrt(pdx*pdx + pdy*pdy) || 1;
        p.fx += (pdx/pd) * pulse; p.fy += (pdy/pd) * pulse;
      }
      const ts2 = tidalStrength || 0;
      if (ts2 > 0) {
        p.fx += (W/2 - p.x) * ts2 * 0.0001;
        p.fy -= (H/2 - p.y) * ts2 * 0.0001;
      }
      const wfa = waveForceAmp || 0;
      if (wfa > 0) {
        const wf = waveFreq || 1;
        const wav = Math.sin(p.x * 0.01 * wf + this._simTime * (waveSpeed||1) * 0.005) * wfa * 0.005;
        p.fy += wav;
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

    // ═══════════════════════════════════════════════════════════════
    // SOCIAL / SWARMING — alignment, cohesion, separation 
    // ═══════════════════════════════════════════════════════════════
    const af = alignmentForce || 0;
    const cf = cohesionForce || 0;
    const sf = separationForce || 0;
    if (af > 0 || cf > 0 || sf > 0) {
      const flockR = flockRadius || 300;
      const flockRSq = flockR * flockR;
      const herdThresh = herdThreshold || 10;
      const li = leaderInfluence || 0;
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        const { cx: pcx, cy: pcy } = { cx: Math.floor(p.x / cellSize), cy: Math.floor(p.y / cellSize) };
        let alignX = 0, alignY = 0, cohX = 0, cohY = 0, sepX = 0, sepY = 0;
        let count = 0;
        for (let dy = -checkCells; dy <= checkCells && dy < 3; dy++) {
          for (let dx = -checkCells; dx <= checkCells && dx < 3; dx++) {
            const nx = ((pcx + dx) % cols + cols) % cols;
            const ny = ((pcy + dy) % rows + rows) % rows;
            const cell = grid[ny * cols + nx];
            for (let ci = 0; ci < cell.length; ci++) {
              const j = cell[ci]; if (i === j) continue;
              const q = particles[j];
              let dx2 = q.x - p.x, dy2 = q.y - p.y;
              if (edgeMode === "wrap") {
                if (dx2 > W/2) dx2 -= W; if (dx2 < -W/2) dx2 += W;
                if (dy2 > H/2) dy2 -= H; if (dy2 < -H/2) dy2 += H;
              }
              if (dx2*dx2 + dy2*dy2 > flockRSq) continue;
              alignX += q.vx; alignY += q.vy;
              cohX += q.x; cohY += q.y;
              if (dx2*dx2 + dy2*dy2 < (flockR * 0.3) ** 2) {
                sepX -= dx2; sepY -= dy2;
              }
              count++;
            }
          }
        }
        if (count > 0 && count < herdThresh * 10) {
          const sc2 = 1 / count;
          p.fx += (alignX * sc2 - p.vx) * af * 0.002;
          p.fy += (alignY * sc2 - p.vy) * af * 0.002;
          const cohDX = cohX * sc2 - p.x, cohDY = cohY * sc2 - p.y;
          p.fx += cohDX * cf * 0.001; p.fy += cohDY * cf * 0.001;
          p.fx += sepX * sf * 0.002; p.fy += sepY * sf * 0.002;
        }
        if (li > 0 && count > 0) {
          const leader = particles[Math.floor(Math.random() * n)];
          if (leader !== p) { p.fx += (leader.vx - p.vx) * li * 0.002; p.fy += (leader.vy - p.vy) * li * 0.002; }
        }
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // CHEMICAL / SIGNALLING — emission, diffusion, decay, sensing
    // ═══════════════════════════════════════════════════════════════
    const cd_ = chemDecay || 0.05;
    const cdiff = chemDiffusion || 0.1;
    const cer = chemEmissionRate || 0;
    const st = signalThreshold || 0.5;
    const sg = signalGain || 1;
    const sprop = signalPropagation || 1;
    if (cd_ > 0 && cer > 0) {
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        if (cer > 0) p.chem = Math.min(5, (p.chem || 0) + cer * (Math.random() * 0.5 + 0.5));
        if (sprop > 0) {
          const cellX = Math.floor(p.x / cellSize);
          const cellY = Math.floor(p.y / cellSize);
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = ((cellX + dx) % cols + cols) % cols;
              const ny = ((cellY + dy) % rows + rows) % rows;
              const cell = grid[ny * cols + nx];
              for (let ci = 0; ci < cell.length; ci++) {
                const j = cell[ci]; if (i === j) continue;
                const q = particles[j];
                let dx2 = q.x - p.x, dy2 = q.y - p.y;
                const d2 = dx2*dx2 + dy2*dy2;
                const maxDist = sprop * 50;
                if (d2 < maxDist * maxDist && p.chem - (q.chem || 0) > 0.01) {
                  const transfer = (p.chem - (q.chem||0)) * cdiff * 0.01;
                  p.chem -= transfer; q.chem = (q.chem||0) + transfer;
                }
              }
            }
          }
        }
        p.chem = Math.max(0, (p.chem||0) - cd_);
        if (p.chem > st && sg > 0) {
          const chemForce = sg * 0.002 * p.chem;
          const ang = Math.random() * Math.PI * 2;
          p.fx += Math.cos(ang) * chemForce;
          p.fy += Math.sin(ang) * chemForce;
        }
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // ENERGY, ACCRETION & REPRODUCTION
    // ═══════════════════════════════════════════════════════════════
    const ed = energyDecay || 0.01;
    const me = maxEnergy || 200;
    const ar = accretionRate || 0;
    const mt = mergeThreshold || 1;
    const ma = massAbsorption || 0;
    const cm = criticalMass || 20;
    const rr = reproductionRate || 0;
    const re = reproductionEnergy || 50;
    const rc = reproductionCost || 30;
    const mut = mutationRate || 0.01;
    const it = inheritTraits || 0.5;
    if (ed > 0 || ar > 0 || rr > 0) {
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        if (ed > 0) p.energy = Math.max(0, (p.energy||0) - ed * timeScale);
        const spd2 = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (spd2 > 0.5) p.energy = Math.min(me, (p.energy||0) + spd2 * 0.01);
        
        if (p.energy <= 0 && ar > 0) {
          const cellX = Math.floor(p.x / cellSize);
          const cellY = Math.floor(p.y / cellSize);
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = ((cellX + dx) % cols + cols) % cols;
              const ny = ((cellY + dy) % rows + rows) % rows;
              const cell = grid[ny * cols + nx];
              for (let ci = 0; ci < cell.length; ci++) {
                const j = cell[ci]; if (i === j) continue;
                if (p.energy >= 0) break;
                const q = particles[j];
                if (q.energy > 10 && q.species === p.species) {
                  const drain = Math.min(ar, q.energy * 0.1);
                  q.energy -= drain; p.energy = Math.min(me, (p.energy||0) + drain * ma);
                }
              }
            }
          }
        }
        
        if (rr > 0 && p.energy > re && Math.random() < rr) {
          p.energy -= rc;
          if (n < 15000) {
            const offX = (Math.random() - 0.5) * 20;
            const offY = (Math.random() - 0.5) * 20;
            const nx2 = Math.max(0, Math.min(W, p.x + offX));
            const ny2 = Math.max(0, Math.min(H, p.y + offY));
            const childSpecies = Math.random() < mut ? Math.floor(Math.random() * species.length) : p.species;
            const child = { x: nx2, y: ny2, z: p.z + (Math.random()-0.5)*20, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5, vz: (Math.random()-0.5)*0.5, species: childSpecies, ox: nx2, oy: ny2, fx: 0, fy: 0, energy: Math.random() * 20 + 10, chem: 0 };
            particles.push(child);
          }
        }
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
