// Particle Life Renderer — accepts engine snapshots instead of the engine directly

export class ParticleLifeRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.logicalWidth = 800;
    this.logicalHeight = 600;
    this.fps = 0;
    this.fpsFrames = 0;
    this.lastFpsTime = performance.now();
    this.stars = [];
    this.time = 0;
    this._visible = [];
    this._frameTime = 0;
    this._autoQuality = 1;
  }

  // Public getters (P3 — avoid accessing _private fields from outside)
  get frameTime() { return this._frameTime; }
  get visibleCount() { return this._visible.length; }

  setSize(w, h, config) {
    this.logicalWidth = w;
    this.logicalHeight = h;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.stars = Array.from(
      { length: Math.floor(w * h * 0.00015 * ((config && config.starDensity) || 1)) },
      () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.3 + Math.random() * 0.8,
        a: (0.15 + Math.random() * 0.35) * ((config && config.starBrightness != null) ? config.starBrightness : 0.35),
        speed: 0.1 + Math.random() * 0.3,
      })
    );
  }

  hsl(h, s, l, a = 1) {
    return a < 1
      ? `hsla(${h}, ${s}%, ${l}%, ${a})`
      : `hsl(${h}, ${s}%, ${l}%)`;
  }

  // Accepts a snapshot object instead of the engine (Item 4)
  render(snapshot, config) {
    const t0 = performance.now();
    const { ctx } = this;
    const {
      trailsEnabled, trailOpacity, connectionsEnabled, connectionDistance,
      showGlow, glowIntensity, species, edgeMode,
      worldWidth, worldHeight, showWorldBorder, stackPerspective, renderQuality, gridOpacity, particleOpacity, connectionOpacity, connectionWidth, connectionFade, starBrightness, starDensity, depthCue, minRadius, maxRadius, glowSpread, hdrExposure, saturationBoost, borderGlow, trailGap, colorShift, particleContrast, starTwinkle,
    } = config;
    const { particles, camX, camY, camZoom } = snapshot;
    const W = this.logicalWidth, H = this.logicalHeight;
    const n = particles ? particles.length : 0;
    this.time++;
    const tg = trailGap || 1;
    if (tg > 1 && this.time % tg !== 0) return;

    // Adaptive quality
    if (config.adaptiveQuality !== false) {
      if (n > 0 && this.fps > 0 && this.fps < 20) {
        this._autoQuality = Math.max(0.3, this._autoQuality - 0.05);
      } else if (this.fps > 40) {
        this._autoQuality = Math.min(1, this._autoQuality + 0.02);
      }
    }
    const q = Math.min(1, Math.max(0.25, (renderQuality != null ? renderQuality : 1) * this._autoQuality));
    const skipGlow = !showGlow || glowIntensity < 0.01 || q < 0.4;
    const glowMul = skipGlow ? 0 : glowIntensity * q * (hdrExposure || 1);
    const skipConn = !connectionsEnabled || connectionDistance < 1 || q < 0.3;

    // Background — when trails on, fade previous frame instead of clearing
    if (trailsEnabled && trailOpacity > 0) {
      // Screen-space fade for stars and content outside world rect
      const hdr = hdrExposure || 1;
          ctx.fillStyle = `rgba(5,5,10,${trailOpacity})`;
      ctx.fillRect(0, 0, W, H);
      // Stars not redrawn — they fade gracefully via trail overlay
    } else {
      ctx.fillStyle = '#05050a';
      ctx.fillRect(0, 0, W, H);
      for (const s of this.stars) {
        const stw = starTwinkle || 0.3;
            const t = 0.7 + 0.3 * Math.sin(this.time * 0.02 * s.speed * stw * 3 + s.x);
        ctx.fillStyle = `rgba(180,190,220,${s.a * t})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.save();
    ctx.translate(camX, camY);
    ctx.scale(camZoom, camZoom);
    const ww = worldWidth || 800, wh = worldHeight || 600;

    if (trailsEnabled && trailOpacity > 0) {
      // Trail overlay fades previous world content (particles, faded grid)
      ctx.fillStyle = `rgba(8,8,26,${trailOpacity})`;
      ctx.fillRect(0, 0, ww, wh);
    } else {
      ctx.fillStyle = '#08081a';
      ctx.fillRect(0, 0, ww, wh);
    }

    // Grid lines
    if (showWorldBorder && q >= 0.5) {
      ctx.strokeStyle = `rgba(100,110,200,${gridOpacity != null ? gridOpacity : 0.15})`;
      ctx.lineWidth = 1 / camZoom;
      ctx.strokeRect(0, 0, ww, wh);
      const bg = borderGlow || 0;
      if (bg > 0) { ctx.strokeStyle = `rgba(100,150,255,${bg * 0.3})`; ctx.lineWidth = (2 + bg * 4) / camZoom; ctx.shadowColor = 'rgba(100,150,255,0.2)'; ctx.shadowBlur = bg * 8; ctx.strokeRect(0, 0, ww, wh); ctx.shadowBlur = 0; }
      ctx.strokeStyle = `rgba(100,110,200,${gridOpacity != null ? gridOpacity * 0.27 : 0.04})`;
      ctx.lineWidth = 0.5 / camZoom;
      const vpX0 = Math.max(0, -camX / camZoom);
      const vpY0 = Math.max(0, -camY / camZoom);
      const vpX1 = Math.min(ww, vpX0 + W / camZoom);
      const vpY1 = Math.min(wh, vpY0 + H / camZoom);
      const gridStep = camZoom > 0.05 ? 50 : camZoom > 0.01 ? 100 : 200;
      for (let x = Math.floor(vpX0 / gridStep) * gridStep; x <= vpX1; x += gridStep) {
        ctx.beginPath(); ctx.moveTo(x, vpY0); ctx.lineTo(x, vpY1); ctx.stroke();
      }
      for (let y = Math.floor(vpY0 / gridStep) * gridStep; y <= vpY1; y += gridStep) {
        ctx.beginPath(); ctx.moveTo(vpX0, y); ctx.lineTo(vpX1, y); ctx.stroke();
      }
    }

    if (n === 0) { ctx.restore(); this.stepFps(t0); return; }

    const zr = snapshot.zRange || 1000;
    const persp = stackPerspective != null ? stackPerspective : 0.3;
    const cx = ww / 2, cy = wh / 2;

        // Pre-compute species rendering data
    const sb2 = saturationBoost || 0;
    const cs2 = colorShift || 0;
    const sd = new Array(species.length);
    for (let si = 0; si < species.length; si++) {
      const s = species[si];
      const sat = Math.min(100, s.saturation + sb2 * 20);
      const hue = ((s.hue + cs2) % 360 + 360) % 360;
      sd[si] = {
        fill: this.hsl(hue, sat, s.lightness, particleOpacity != null ? particleOpacity : 1),
        glowColor: this.hsl(hue, sat, Math.min(s.lightness + 25, 92), particleOpacity != null ? particleOpacity : 1),
        glowDark: this.hsl(hue, sat, Math.min(s.lightness + 15, 85), 0.3 * (glowIntensity || 1)),
        highlight: this.hsl(hue, Math.min(sat + 10, 100), Math.min(s.lightness + 35, 98)),
        size: s.size || 3,
      };
    }

    // Build visible list with Z perspective
    const vl = this._visible;
    vl.length = 0;
    const viewZ = 1;

    for (let i = 0; i < n; i++) {
      const p = particles[i];
      const zDist = Math.abs(p.z - viewZ);
      if (zDist > zr) continue;

      const zRel = Math.abs(p.z - viewZ) / zr;
      const perspSq = persp * persp;
      const rawScale = perspSq <= 1 ? 1 : 1 / (1 + zRel * zRel * (perspSq - 1));
      const scale = Math.max(0.05, Math.min(10, rawScale));

      const sx = cx + (p.x - cx) * scale;
      const sy = cy + (p.y - cy) * scale;
      const dc = depthCue != null ? depthCue : 0.5;
            const za = Math.max(0.2, 1 - (zDist / zr) * dc);

      if (sx < -2000 || sx > ww + 2000 || sy < -2000 || sy > wh + 2000) continue;
      vl.push({ p, sx, sy, za });
    }

    if (vl.length === 0) { ctx.restore(); this.stepFps(t0); return; }

    // Sort by Z descending (back to front)
    vl.sort((a, b) => b.p.z - a.p.z);

    // Connections
    if (!skipConn) {
      let drawn = 0;
      const cap = Math.min(300, Math.round(300 / q));
      for (let i = 0; i < vl.length && drawn < cap; i++) {
        const a = vl[i];
        for (let j = i + 1; j < vl.length && drawn < cap; j++) {
          const b = vl[j];
          if (a.p.species === b.p.species) continue;
          let dx = b.p.x - a.p.x, dy = b.p.y - a.p.y;
          if (edgeMode === 'wrap') {
            if (dx > ww / 2) dx -= ww; if (dx < -ww / 2) dx += ww;
            if (dy > wh / 2) dy -= wh; if (dy < -wh / 2) dy += wh;
          }
          if (dx * dx + dy * dy < connectionDistance * connectionDistance) {
            const d = Math.sqrt(dx * dx + dy * dy);
            const connAlpha = connectionOpacity != null ? connectionOpacity : 0.08;
            const connFade = connectionFade || 2;
            const alpha = Math.pow(1 - d / connectionDistance, connFade) * connAlpha * Math.min(a.za, b.za);
            ctx.strokeStyle = this.hsl((sd[a.p.species].hue + sd[b.p.species].hue) / 2, 60, 55, alpha);
            ctx.lineWidth = connectionWidth != null ? connectionWidth : 0.4;
            ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
            drawn++;
          }
        }
      }
    }

    // Glow pass
    let curSpecies = -1;
    let curBlur = 0;
    if (!skipGlow) {
      for (let vi = 0; vi < vl.length; vi++) {
        const v = vl[vi];
        const s = sd[v.p.species];
        const gs = glowSpread || 1;
            const blur = Math.min(s.size * 3.5 * glowMul * gs, 60);
        if (v.p.species !== curSpecies || blur !== curBlur) {
          ctx.shadowBlur = blur;
          ctx.shadowColor = s.glowColor;
          curBlur = blur;
          curSpecies = v.p.species;
        }
        ctx.globalAlpha = v.za;
        ctx.fillStyle = s.glowDark;
        ctx.beginPath(); ctx.arc(v.sx, v.sy, s.size * 0.7, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Core pass
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    for (let vi = 0; vi < vl.length; vi++) {
      const v = vl[vi];
      const s = sd[v.p.species];
      const minR = minRadius || 0.5; const maxR = maxRadius || 12;
      const pc = particleContrast || 1;
      const r = Math.min(maxR, Math.max(minR, s.size * 0.65 * pc));
      if (v.p.species !== curSpecies) {
        ctx.fillStyle = s.fill;
        curSpecies = v.p.species;
      }
      ctx.globalAlpha = v.za;
      ctx.beginPath(); ctx.arc(v.sx, v.sy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = s.highlight;
      ctx.beginPath(); ctx.arc(v.sx, v.sy, r * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = s.fill;
    }

    ctx.globalAlpha = 1;
    ctx.restore();
    this.stepFps(t0);
  }

  stepFps(t0) {
    this._frameTime = performance.now() - t0;
    this.fpsFrames++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      this.fps = this.fpsFrames;
      this.fpsFrames = 0;
      this.lastFpsTime = now;
    }
  }

  clear() {
    this.ctx.fillStyle = '#05050a';
    this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
    this.time = 0;
  }
}
