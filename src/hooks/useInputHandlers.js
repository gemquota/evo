import { useEffect } from 'react';

export function useInputHandlers(containerRef, engineRef, {
  setPanelOpen,
  togglePaused,
  handleReset,
  handleFitCamera,
  setActiveSpecies,
}) {
  // Touch + wheel events only (Item 3: touch-only)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Wheel zoom (also works as scroll on desktop)
    const onWheel = (e) => {
      e.preventDefault();
      if (!engineRef.current) return;
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? 0.88 : 1.12;
      const nz = Math.min(20, Math.max(0.05, engineRef.current.camZoom * delta));
      const b = engineRef.current.screenToWorld(mx, my);
      engineRef.current.camZoom = nz;
      const a = engineRef.current.screenToWorld(mx, my);
      engineRef.current.camX += (b.x - a.x) * engineRef.current.camZoom;
      engineRef.current.camY += (b.y - a.y) * engineRef.current.camZoom;
    };

    // Touch support: single-finger drag to attract, two-finger pinch-zoom
    let tStart = [];

    const onTouchStart = (e) => {
      tStart = Array.from(e.changedTouches);
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const r = container.getBoundingClientRect();

      if (e.touches.length === 1) {
        // Single finger: apply attraction force at touch point
        const t = e.touches[0];
        if (engineRef.current) {
          const w = engineRef.current.screenToWorld(t.clientX - r.left, t.clientY - r.top);
          const mx = w.x, my = w.y;
          const config = engineRef.current.config;
          const mf = config.attractForce || 2;
          const mr = (config.attractRadius || 300) / engineRef.current.camZoom;
          const particles = engineRef.current.particles;
          const edgeMode = config.edgeMode || 'wrap';
          const W = engineRef.current.ww;
          const H = engineRef.current.wh;
          const timeScale = config.timeScale || 1;
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            let dx = mx - p.x, dy = my - p.y;
            if (edgeMode === 'wrap') {
              if (dx > W / 2) dx -= W;
              if (dx < -W / 2) dx += W;
              if (dy > H / 2) dy -= H;
              if (dy < -H / 2) dy += H;
            }
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < mr && d > 1) {
              const s = mf * (1 - d / mr) * timeScale;
              p.vx += (s * dx) / d;
              p.vy += (s * dy) / d;
            }
          }
        }
      } else if (e.touches.length === 2 && engineRef.current) {
        // Two fingers: pinch-zoom
        const t = Array.from(e.touches);
        const t0 = tStart;
        const d0 = Math.hypot(
          t[0].clientX - t[1].clientX,
          t[0].clientY - t[1].clientY
        );
        const d1 = Math.hypot(
          t0[0].clientX - t0[1].clientX,
          t0[0].clientY - t0[1].clientY
        );
        if (d1 > 0) {
          const cz = engineRef.current.camZoom;
          engineRef.current.camZoom = Math.min(
            20,
            Math.max(0.05, cz * (d0 / d1))
          );
        }
        tStart = t;
      }
    };

    const onTouchEnd = () => {};

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [containerRef, engineRef]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (
          e.key === '=' ||
          e.key === '-' ||
          e.key === '0' ||
          e.key === '+' ||
          e.key === '_'
        ) {
          e.preventDefault();
        }
      }
      switch (e.key.toLowerCase()) {
        case 'h':
          setPanelOpen((p) => !p);
          break;
        case ' ':
          e.preventDefault();
          togglePaused();
          break;
        case 'r':
          handleReset();
          break;
        case 'f':
          handleFitCamera();
          break;
        case '1':
          setActiveSpecies(0);
          break;
        case '2':
          setActiveSpecies(1);
          break;
        case '3':
          setActiveSpecies(2);
          break;
        case '4':
          setActiveSpecies(3);
          break;
        case '5':
          setActiveSpecies(4);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPanelOpen, togglePaused, handleReset, handleFitCamera, setActiveSpecies]);
}
