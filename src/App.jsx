import React, { useState, useRef, useCallback } from 'react';
import Controls from './components/Controls';
import StatsOverlay from './components/StatsOverlay';
import { PRESETS, DEFAULT_CONFIG } from './simulation/presets';
import { useSimulationLoop } from './hooks/useSimulationLoop';
import { useInputHandlers } from './hooks/useInputHandlers';
import {
  validateGlobal,
  validateSpecies,
  validateMatrix,
  mergeConfigWithPreset,
} from './simulation/config';
import './App.css';

function buildInitConfig() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxDim = 10000;
  const scale = maxDim / Math.max(vw, vh);
  return validateGlobal({
    ...DEFAULT_CONFIG,
    worldWidth: Math.round(vw * scale),
    worldHeight: Math.round(vh * scale),
  });
}

export default function App() {
  const [config, setConfig] = useState(buildInitConfig);
  const [species, setSpecies] = useState(() =>
    validateSpecies(PRESETS[0].species)
  );
  const [interactionMatrix, setInteractionMatrix] = useState(() =>
    validateMatrix(PRESETS[0].interactionMatrix, PRESETS[0].species.length)
  );
  const [activeSpecies, setActiveSpecies] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Synced every render for the animation loop to read
  const configRef = useRef(undefined);
  configRef.current = { ...config, species, interactionMatrix };

  const sim = useSimulationLoop(canvasRef, containerRef, configRef);

  useInputHandlers(containerRef, sim.engineRef, {
    setPanelOpen,
    togglePaused: sim.togglePaused,
    handleReset: sim.handleReset,
    handleFitCamera: sim.handleFitCamera,
    setActiveSpecies,
  });

  // ----- Callbacks -----

  const handlePresetSelect = useCallback(
    (preset) => {
      const ns = validateSpecies(preset.species);
      const nm = validateMatrix(preset.interactionMatrix, ns.length);
      const ng = mergeConfigWithPreset(config, preset);
      setSpecies(ns);
      setInteractionMatrix(nm);
      setConfig(ng);
      setActiveSpecies(0);
      const fc = { ...ng, species: ns, interactionMatrix: nm };
      configRef.current = fc;
      if (sim.engineRef.current) {
        sim.engineRef.current.setConfig(fc);
        sim.engineRef.current.reset();
        sim.engineRef.current.fitCamera();
        if (sim.rendererRef.current) sim.rendererRef.current.clear();
      }
    },
    [config, sim.engineRef, sim.rendererRef]
  );

  const handleMatrixChange = useCallback((m) => setInteractionMatrix(m), []);

  const handleConfigChange = useCallback(
    (c) => setConfig(validateGlobal(c)),
    []
  );

  const handleSpeciesChange = useCallback(
    (ns) => {
      const needsReset = ns.some((s, i) => s.count !== species[i]?.count);
      const validated = validateSpecies(ns);
      setSpecies(validated);
      const fc = { ...config, species: validated, interactionMatrix };
      configRef.current = fc;
      if (sim.engineRef.current) {
        sim.engineRef.current.setConfig(fc);
        if (needsReset) {
          sim.engineRef.current.reset();
          sim.engineRef.current.fitCamera();
          if (sim.rendererRef.current) sim.rendererRef.current.clear();
        }
      }
    },
    [config, interactionMatrix, species, sim.engineRef, sim.rendererRef]
  );
  const handleTogglePanel = useCallback(() => setPanelOpen((p) => !p), []);

  const { fps, particleCount, frameTime, visibleCount, speciesCounts } = sim.simStats;

  return (
    <div className="app" tabIndex={-1}>
      <div className="canvas-wrapper" ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>

      {config.showStats && (
        <StatsOverlay
          fps={fps}
          particleCount={particleCount}
          frameTime={frameTime}
          visibleCount={visibleCount}
          speciesStats={speciesCounts}
          speciesConfig={species}
        />
      )}

      <div className="top-bar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <span className="brand-title">Synthetic Life</span>
          <span className="brand-tagline">Particle Emergence</span>
        </div>
        <div className="top-actions">
          <div className="top-stats">
            <span className={`stat-fps ${fps >= 30 ? 'good' : fps >= 15 ? 'ok' : 'bad'}`}>
              {fps} FPS
            </span>
            <span style={{ color: '#8888a5' }}>{particleCount}</span>
            {sim.paused && <span style={{ color: '#fbbf24' }}>⏸</span>}
          </div>
          <button className={`top-btn ${!panelOpen ? 'active' : ''}`} onClick={() => setPanelOpen((p) => !p)}>
            UI <kbd>H</kbd>
          </button>
          <button className="top-btn" onClick={sim.handleFitCamera}>⊞</button>
        </div>
      </div>

      <Controls
        config={config}
        onConfigChange={handleConfigChange}
        species={species}
        onSpeciesChange={handleSpeciesChange}
        interactionMatrix={interactionMatrix}
        onMatrixChange={handleMatrixChange}
        activeSpecies={activeSpecies}
        onActiveSpeciesChange={setActiveSpecies}
        presets={PRESETS}
        onPresetSelect={handlePresetSelect}
        onReset={sim.handleReset}
        particleCount={particleCount}
        panelOpen={panelOpen}
        onTogglePanel={handleTogglePanel}
        onFitCamera={sim.handleFitCamera}
      />

      <div className="bottom-hint">
        <kbd>H</kbd> UI · <kbd>Space</kbd> pause · <kbd>R</kbd> reset ·{' '}
        <kbd>F</kbd> fit · Touch: attract · Pinch: zoom · Two-finger: pan
      </div>
    </div>
  );
}
