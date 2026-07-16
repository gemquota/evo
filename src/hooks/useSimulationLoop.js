import { useState, useRef, useCallback, useEffect } from 'react';
import { ParticleLifeEngine } from '../simulation/engine';
import { ParticleLifeRenderer } from '../simulation/renderer';

export function useSimulationLoop(canvasRef, containerRef, configRef) {
  const [paused, setPaused] = useState(false);
  const [simStats, setSimStats] = useState({
    fps: 0,
    particleCount: 0,
    frameTime: 0,
    visibleCount: 0,
    speciesCounts: {},
  });

  const engineRef = useRef(null);
  const rendererRef = useRef(null);
  const animRef = useRef(null);
  const pausedRef = useRef(false);

  // Track last-published values to avoid per-frame setState
  const lastPublishedRef = useRef({ fps: 0, count: 0, ft: 0, vis: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const engine = new ParticleLifeEngine(800, 600, configRef.current);
    const renderer = new ParticleLifeRenderer(canvas);
    engine.reset();

    engineRef.current = engine;
    rendererRef.current = renderer;

    const resize = () => {
      const r = container.getBoundingClientRect();
      const w = Math.floor(r.width);
      const h = Math.floor(r.height);
      if (w > 0 && h > 0) {
        renderer.setSize(w, h, configRef.current);
        engine.setViewSize(w, h);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const loop = () => {
      if (engineRef.current && rendererRef.current && !pausedRef.current) {
        engineRef.current.setConfig(configRef.current);
        engineRef.current.update();

        const snapshot = engineRef.current.getSnapshot();
        rendererRef.current.render(snapshot, configRef.current);

        // Throttle React state updates — use tolerance for float comparison
        const last = lastPublishedRef.current;
        const fps = rendererRef.current.fps;
        const count = engineRef.current.particles.length;
        const ft = rendererRef.current.frameTime;
        const vis = rendererRef.current.visibleCount;

        if (fps !== last.fps || count !== last.count || Math.abs(ft - last.ft) > 0.5 || vis !== last.vis) {
          last.fps = fps;
          last.count = count;
          last.ft = ft;
          last.vis = vis;
          const st = engineRef.current.getStats();
          setSimStats({ fps, particleCount: count, frameTime: Math.round(ft), visibleCount: vis, speciesCounts: st.species });
        }
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFitCamera = useCallback(() => {
    if (engineRef.current) engineRef.current.fitCamera();
  }, []);

  const handleReset = useCallback(() => {
    const eng = engineRef.current;
    const ren = rendererRef.current;
    if (eng) {
      eng.setConfig(configRef.current);
      eng.reset();
      eng.fitCamera();
      if (ren) ren.clear();
    }
  }, []);

  const togglePaused = useCallback(() => {
    setPaused((p) => {
      const next = !p;
      pausedRef.current = next;
      return next;
    });
  }, []);

  return {
    engineRef, rendererRef, simStats, paused,
    togglePaused, handleFitCamera, handleReset,
  };
}
