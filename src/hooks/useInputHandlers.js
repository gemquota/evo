import { useEffect } from 'react';

export function useInputHandlers(containerRef, engineRef, {
  setPanelOpen,
  togglePaused,
  handleReset,
  handleFitCamera,
  setActiveSpecies,
}) {
  // Touch + wheel events only
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Wheel zoom
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

    // Touch: single-finger attract, two-finger pinch-zoom + pan
    let tStart = [];
    let tCamStart = { x: 0, y: 0 };
    let tStartCentroid = { x: 0, y: 0 };

    const onTouchStart = (e) => {
      tStart = Array.from(e.touches);
      if (e.touches.length === 1) {
        // Single finger: attract begins
        const r = container.getBoundingClientRect();
        const t = e.touches[0];
        if (engineRef.current) {
          engineRef.current.setTouchAttract(t.clientX - r.left, t.clientY - r.top);
        }
      } else if (e.touches.length === 2 && engineRef.current) {
        // Clear attract when two fingers touch
        engineRef.current.clearTouchAttract();
        tCamStart = { x: engineRef.current.camX, y: engineRef.current.camY };
        tStartCentroid = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const r = container.getBoundingClientRect();

      if (e.touches.length === 1) {
        // Single finger: update attract point
        const t = e.touches[0];
        if (engineRef.current) {
          engineRef.current.setTouchAttract(t.clientX - r.left, t.clientY - r.top);
        }
      } else if (e.touches.length === 2 && engineRef.current) {
        const t = Array.from(e.touches);

        // Incremental pinch-zoom
        const d0 = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
        const d1 = Math.hypot(tStart[0].clientX - tStart[1].clientX, tStart[0].clientY - tStart[1].clientY);
        if (d1 > 0) {
          engineRef.current.camZoom = Math.min(20, Math.max(0.05, engineRef.current.camZoom * (d0 / d1)));
        }

        // Absolute pan from initial two-finger centroid
        const centroid = {
          x: (t[0].clientX + t[1].clientX) / 2,
          y: (t[0].clientY + t[1].clientY) / 2,
        };
        engineRef.current.camX = tCamStart.x + (centroid.x - tStartCentroid.x);
        engineRef.current.camY = tCamStart.y + (centroid.y - tStartCentroid.y);

        tStart = t; // update reference for next zoom frame
      }
    };

    const onTouchEnd = () => {
      if (engineRef.current) engineRef.current.clearTouchAttract();
    };

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
        case 'h': setPanelOpen((p) => !p); break;
        case ' ': e.preventDefault(); togglePaused(); break;
        case 'r': handleReset(); break;
        case 'f': handleFitCamera(); break;
        case '1': setActiveSpecies(0); break;
        case '2': setActiveSpecies(1); break;
        case '3': setActiveSpecies(2); break;
        case '4': setActiveSpecies(3); break;
        case '5': setActiveSpecies(4); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPanelOpen, togglePaused, handleReset, handleFitCamera, setActiveSpecies]);
}
