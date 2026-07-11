import React from 'react';
import Collapsible from './Collapsible';
import Slider, { ColorSlider, Toggle, Select } from './Slider';
import MatrixGrid from './MatrixGrid';

function Controls({
  config, onConfigChange, species, onSpeciesChange,
  interactionMatrix, onMatrixChange, activeSpecies, onActiveSpeciesChange,
  presets, onPresetSelect, onReset, particleCount,
  panelOpen, onTogglePanel, onFitCamera,
}) {
  const h = (key) => (val) => onConfigChange({ ...config, [key]: val });
  const sp = (idx, key) => (val) => onSpeciesChange(species.map((s, i) => i === idx ? { ...s, [key]: val } : s));
  const cur = species[activeSpecies];

  const dists = ['random', 'grid', 'cluster', 'ring'];
  const vels = ['random', 'zero', 'slow', 'fast', 'radial'];
  const zMax = config.zRange || 1000;

  return (
    <>
      <button className={`panel-toggle ${panelOpen ? 'open' : ''}`} onClick={onTogglePanel}>
        {panelOpen ? '✕' : '☰'}
      </button>
      <div className={`controls-panel ${panelOpen ? '' : 'closed'}`}>
        <div className="panel-header">
          <h2>✦ Controls</h2>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{particleCount} parts</span>
        </div>
        <div className="panel-scroll">
          <Collapsible title="Presets" defaultOpen={false} badge={presets.length}>
            <div className="presets-grid">
              {presets.map((p) => (
                <button key={p.name} className="preset-btn" onClick={() => onPresetSelect(p)}>
                  <span className="preset-name">{p.name}</span>
                  <span className="preset-desc">{p.desc}</span>
                </button>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Global" defaultOpen={true} badge="12">
            <Slider label="Friction" value={config.friction} min={0.1} max={0.99} step={0.01} onChange={h('friction')} formatValue={v => v.toFixed(2)} />
            <Slider label="Time Scale" value={config.timeScale} min={0.05} max={3} step={0.05} onChange={h('timeScale')} formatValue={v => v.toFixed(2)} />
            <Slider label="Max Force" value={config.maxForce} min={0.1} max={5} step={0.1} onChange={h('maxForce')} formatValue={v => v.toFixed(1)} />
            <Slider label="Noise" value={config.noiseAmount} min={0} max={2} step={0.01} onChange={h('noiseAmount')} formatValue={v => v.toFixed(2)} />
            <Slider label="Trail Opacity" value={config.trailOpacity} min={0} max={0.2} step={0.002} onChange={h('trailOpacity')} formatValue={v => v.toFixed(3)} />
            <Slider label="Glow Intensity" value={config.glowIntensity} min={0} max={2} step={0.05} onChange={h('glowIntensity')} formatValue={v => v.toFixed(2)} />
            <Slider label="Connection Dist" value={config.connectionDistance} min={50} max={2500} step={50} onChange={h('connectionDistance')} />
            <Select label="Edge Mode" value={config.edgeMode} options={['wrap', 'bounce', 'contain']} onChange={h('edgeMode')} />
            <Toggle label="Trails" value={config.trailsEnabled} onChange={h('trailsEnabled')} />
            <Toggle label="Connections" value={config.connectionsEnabled} onChange={h('connectionsEnabled')} />
            <Toggle label="Stats" value={config.showStats} onChange={h('showStats')} />
            <Toggle label="Glow" value={config.showGlow} onChange={h('showGlow')} />
            <button className="reset-btn" onClick={onReset}>↻ Reset</button>
          </Collapsible>

          <Collapsible title="Performance" defaultOpen={false} badge="4">
            <p style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Reduce settings below for lower-end devices.
            </p>
            <Slider label="Physics Rate" value={config.physicsRate} min={1} max={5} step={1} onChange={h('physicsRate')} formatValue={v => `1:${v}`} />
            <Slider label="Render Quality" value={config.renderQuality} min={0.25} max={1} step={0.05} onChange={h('renderQuality')} formatValue={v => `${Math.round(v * 100)}%`} />
            <Toggle label="Adaptive Quality" value={config.adaptiveQuality !== false} onChange={h('adaptiveQuality')} />
            <p style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
              Physics Rate 1:1 = full accuracy, 1:3 = runs physics every 3rd frame.<br/>
              Render Quality scales glow, connections, and culling.
            </p>
          </Collapsible>

          <Collapsible title="World, Camera & XYZ" defaultOpen={false} badge="7">
            <p style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Z = [0, {zMax.toLocaleString()}] — persp² scale. 0=flat, 10=extreme.
            </p>
            <Slider label="World Width" value={config.worldWidth} min={200} max={10000} step={50} onChange={h('worldWidth')} />
            <Slider label="World Height" value={config.worldHeight} min={200} max={10000} step={50} onChange={h('worldHeight')} />
            <Slider label="Z Range (layers)" value={config.zRange} min={10} max={10000} step={10} onChange={h('zRange')} />
            <Slider label="Stack Perspective" value={config.stackPerspective} min={0} max={10} step={0.01} onChange={h('stackPerspective')} formatValue={v => v.toFixed(2)} />
            <Toggle label="Show Border" value={config.showWorldBorder} onChange={h('showWorldBorder')} />
            <button className="reset-btn" onClick={onFitCamera}>⊞ Fit World</button>
          </Collapsible>

          <Collapsible title="Initial Distribution" defaultOpen={false} badge="5">
            <Select label="Pattern" value={config.distributionMode} options={dists} onChange={h('distributionMode')} />
            <Select label="Velocity" value={config.initialVelocity} options={vels} onChange={h('initialVelocity')} />
            {config.distributionMode === 'cluster' && (
              <><Slider label="Cluster Count" value={config.clusterCount} min={1} max={30} step={1} onChange={h('clusterCount')} />
              <Slider label="Cluster Spread" value={config.clusterSpread} min={50} max={2500} step={50} onChange={h('clusterSpread')} /></>
            )}
            {config.distributionMode === 'ring' && (
              <Slider label="Ring Radius" value={config.ringRadius} min={100} max={2500} step={50} onChange={h('ringRadius')} />
            )}
            <button className="reset-btn" onClick={onReset}>⟳ Re-distribute</button>
          </Collapsible>

          <Collapsible title="Species" defaultOpen={true} badge={`${species.length}`}>
            <div className="species-tabs">
              {species.map((s, i) => (
                <button key={i} className={`species-tab ${i === activeSpecies ? 'active' : ''}`}
                  style={{ '--tab-color': `hsl(${s.hue},${s.saturation}%,${s.lightness}%)` }}
                  onClick={() => onActiveSpeciesChange(i)}>{s.name}</button>
              ))}
            </div>
            {cur && (
              <div className="species-controls">
                <Slider label="Count" value={cur.count} min={10} max={3000} step={10} onChange={sp(activeSpecies, 'count')} />
                <Slider label="Speed" value={cur.speed} min={1} max={100} step={0.5} onChange={sp(activeSpecies, 'speed')} formatValue={v => v.toFixed(1)} />
                <Slider label="Max Speed" value={cur.maxSpeed} min={1} max={300} step={0.5} onChange={sp(activeSpecies, 'maxSpeed')} formatValue={v => v.toFixed(1)} />
                <Slider label="Size" value={cur.size} min={0.5} max={12} step={0.5} onChange={sp(activeSpecies, 'size')} formatValue={v => v.toFixed(1)} />
                <ColorSlider label="Color" value={cur.hue} onChange={sp(activeSpecies, 'hue')} />
                <Slider label="Saturation" value={cur.saturation} min={0} max={100} step={1} onChange={sp(activeSpecies, 'saturation')} />
                <Slider label="Lightness" value={cur.lightness} min={20} max={90} step={1} onChange={sp(activeSpecies, 'lightness')} />
                <Slider label="Interaction Radius" value={cur.interactionRadius} min={50} max={5000} step={50} onChange={sp(activeSpecies, 'interactionRadius')} />
                <Slider label="Repulsion Radius" value={cur.repulsionRadius} min={10} max={800} step={5} onChange={sp(activeSpecies, 'repulsionRadius')} />
                <Slider label="Repulsion Strength" value={cur.repulsionStrength} min={0.1} max={3} step={0.05} onChange={sp(activeSpecies, 'repulsionStrength')} formatValue={v => v.toFixed(2)} />
              </div>
            )}
          </Collapsible>

          <Collapsible title="Interaction Matrix" defaultOpen={false} badge={`${species.length}×${species.length}`}>
            <p className="matrix-hint">
              <strong style={{ color: '#ef4444' }}>Red</strong> repels · <strong style={{ color: '#38bdf8' }}>Blue</strong> attracts<br />Row → Column species
            </p>
            <MatrixGrid matrix={interactionMatrix} species={species} onChange={onMatrixChange} />
          </Collapsible>
        </div>
      </div>
    </>
  );
}

export default React.memo(Controls);
