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

          <Collapsible title="Global" defaultOpen={true}>
            <Slider label="Friction" value={config.friction} min={0.1} max={0.99} step={0.01} onChange={h('friction')} formatValue={v => v.toFixed(2)} />
            <Slider label="Time Scale" value={config.timeScale} min={0.05} max={3} step={0.05} onChange={h('timeScale')} formatValue={v => v.toFixed(2)} />
            <Slider label="Max Force" value={config.maxForce} min={0.1} max={5} step={0.1} onChange={h('maxForce')} formatValue={v => v.toFixed(1)} />
            <Slider label="Noise" value={config.noiseAmount} min={0} max={2} step={0.01} onChange={h('noiseAmount')} formatValue={v => v.toFixed(2)} />
            <Slider label="Trail Opacity" value={config.trailOpacity} min={0} max={0.2} step={0.002} onChange={h('trailOpacity')} formatValue={v => v.toFixed(3)} />
            <Slider label="Glow Intensity" value={config.glowIntensity} min={0} max={2} step={0.05} onChange={h('glowIntensity')} formatValue={v => v.toFixed(2)} />
            <Slider label="Connection Dist" value={config.connectionDistance} min={50} max={2500} step={25} onChange={h('connectionDistance')} />
            <Select label="Edge Mode" value={config.edgeMode} options={['wrap', 'bounce', 'contain']} onChange={h('edgeMode')} />
            <Slider label="Attract Force" value={config.attractForce} min={0.1} max={10} step={0.1} onChange={h('attractForce')} formatValue={v => v.toFixed(1)} />
            <Slider label="Attract Radius" value={config.attractRadius} min={10} max={1000} step={10} onChange={h('attractRadius')} />
            <Slider label="Gravity Well" value={config.gravityWell != null ? config.gravityWell : 0} min={0} max={5} step={0.1} onChange={h('gravityWell')} formatValue={v => v.toFixed(1)} />
            <Slider label="Gravity Radius" value={config.gravityWellRadius != null ? config.gravityWellRadius : 2500} min={100} max={10000} step={100} onChange={h('gravityWellRadius')} />
            <Slider label="Vortex Strength" value={config.vortexStrength != null ? config.vortexStrength : 0} min={0} max={3} step={0.05} onChange={h('vortexStrength')} formatValue={v => v.toFixed(2)} />
            <Slider label="Force Decay" value={config.forceDecayPower != null ? config.forceDecayPower : 2} min={0.5} max={4} step={0.1} onChange={h('forceDecayPower')} formatValue={v => v.toFixed(1)} />
            <Slider label="Force Jitter" value={config.interactionJitter != null ? config.interactionJitter : 0} min={0} max={1} step={0.01} onChange={h('interactionJitter')} formatValue={v => v.toFixed(2)} />
            <Slider label="Linear Drag" value={config.dragLinear != null ? config.dragLinear : 0} min={0} max={0.5} step={0.01} onChange={h('dragLinear')} formatValue={v => v.toFixed(2)} />
            <Slider label="Z Damping" value={config.velocityDampingZ != null ? config.velocityDampingZ : 0.82} min={0.1} max={0.99} step={0.01} onChange={h('velocityDampingZ')} formatValue={v => v.toFixed(2)} />
            <Slider label="Mass Variation" value={config.massVariation != null ? config.massVariation : 0} min={0} max={1} step={0.05} onChange={h('massVariation')} formatValue={v => v.toFixed(2)} />
            <Slider label="Bounce Restitution" value={config.bounceRestitution != null ? config.bounceRestitution : 0.5} min={0.1} max={1} step={0.05} onChange={h('bounceRestitution')} formatValue={v => v.toFixed(2)} />
            <Slider label="Boundary Repel" value={config.boundaryRepelForce != null ? config.boundaryRepelForce : 0} min={0} max={5} step={0.1} onChange={h('boundaryRepelForce')} formatValue={v => v.toFixed(1)} />
            <Slider label="Pairwise Cutoff" value={config.pairwiseCutoff != null ? config.pairwiseCutoff : 200} min={10} max={1000} step={10} onChange={h('pairwiseCutoff')} />
            <Slider label="Matrix Drift" value={config.matrixDrift != null ? config.matrixDrift : 0} min={0} max={0.1} step={0.001} onChange={h('matrixDrift')} formatValue={v => v.toFixed(3)} />
            <Slider label="Vel. Decay Angle" value={config.velocityDecayAngle != null ? config.velocityDecayAngle : 0} min={0} max={360} step={5} onChange={h('velocityDecayAngle')} />
            <Slider label="Force Inertia" value={config.forceInertia != null ? config.forceInertia : 0} min={0} max={0.95} step={0.05} onChange={h('forceInertia')} formatValue={v => v.toFixed(2)} />
            <Slider label="Inter. Symmetry" value={config.interactionSymmetry != null ? config.interactionSymmetry : 0} min={0} max={1} step={0.05} onChange={h('interactionSymmetry')} formatValue={v => v.toFixed(2)} />
            <Slider label="Pairwise Skip" value={config.pairwiseSkipChance != null ? config.pairwiseSkipChance : 0} min={0} max={0.9} step={0.05} onChange={h('pairwiseSkipChance')} formatValue={v => v.toFixed(2)} />
            <Slider label="Center Bias" value={config.centerBias != null ? config.centerBias : 0} min={0} max={1} step={0.05} onChange={h('centerBias')} formatValue={v => v.toFixed(2)} />
            <Slider label="Boundary Warmth" value={config.boundaryWarmth != null ? config.boundaryWarmth : 0} min={0} max={2} step={0.05} onChange={h('boundaryWarmth')} formatValue={v => v.toFixed(2)} />
            <Slider label="Radial Drift" value={config.radialDrift != null ? config.radialDrift : 0} min={-1} max={1} step={0.05} onChange={h('radialDrift')} formatValue={v => v.toFixed(2)} />
            <Slider label="Noise Drift" value={config.noiseDrift != null ? config.noiseDrift : 0} min={0} max={1} step={0.05} onChange={h('noiseDrift')} formatValue={v => v.toFixed(2)} />
            <Slider label="Jerk Limit" value={config.jerkLimit != null ? config.jerkLimit : 0} min={0} max={10} step={0.1} onChange={h('jerkLimit')} formatValue={v => v.toFixed(1)} />
            <Slider label="Z Gravity" value={config.zGravity != null ? config.zGravity : 0} min={-0.1} max={0.1} step={0.005} onChange={h('zGravity')} formatValue={v => v.toFixed(3)} />
            <Slider label="Glow Spread" value={config.glowSpread != null ? config.glowSpread : 1} min={0.5} max={5} step={0.1} onChange={h('glowSpread')} formatValue={v => v.toFixed(1)} />
            <Slider label="HDR Exposure" value={config.hdrExposure != null ? config.hdrExposure : 1} min={0.5} max={3} step={0.05} onChange={h('hdrExposure')} formatValue={v => v.toFixed(2)} />
            <Slider label="Saturation Boost" value={config.saturationBoost != null ? config.saturationBoost : 0} min={0} max={1} step={0.05} onChange={h('saturationBoost')} formatValue={v => v.toFixed(2)} />
            <Slider label="Border Glow" value={config.borderGlow != null ? config.borderGlow : 0} min={0} max={1} step={0.05} onChange={h('borderGlow')} formatValue={v => v.toFixed(2)} />
            <Slider label="Trail Gap" value={config.trailGap != null ? config.trailGap : 1} min={1} max={10} step={1} onChange={h('trailGap')} />
            <Slider label="Color Shift" value={config.colorShift != null ? config.colorShift : 0} min={0} max={360} step={5} onChange={h('colorShift')} />
            <Slider label="Particle Contrast" value={config.particleContrast != null ? config.particleContrast : 1} min={0.5} max={2} step={0.05} onChange={h('particleContrast')} formatValue={v => v.toFixed(2)} />
            <Slider label="Star Twinkle" value={config.starTwinkle != null ? config.starTwinkle : 0.3} min={0} max={1} step={0.05} onChange={h('starTwinkle')} formatValue={v => v.toFixed(2)} />
            <Slider label="Min Speed" value={config.minSpeed != null ? config.minSpeed : 0} min={0} max={5} step={0.1} onChange={h('minSpeed')} formatValue={v => v.toFixed(1)} />
            <Slider label="Repulsion Falloff" value={config.repulsionFalloff != null ? config.repulsionFalloff : 1} min={0.5} max={4} step={0.1} onChange={h('repulsionFalloff')} formatValue={v => v.toFixed(1)} />
            <Slider label="Harmonic Strength" value={config.harmonicStrength != null ? config.harmonicStrength : 0} min={0} max={2} step={0.05} onChange={h('harmonicStrength')} formatValue={v => v.toFixed(2)} />
            <Slider label="Harmonic Range" value={config.harmonicRange != null ? config.harmonicRange : 1000} min={100} max={5000} step={100} onChange={h('harmonicRange')} />
            <Slider label="Wander Rate" value={config.wanderRate != null ? config.wanderRate : 0} min={0} max={0.5} step={0.01} onChange={h('wanderRate')} formatValue={v => v.toFixed(2)} />
            <Slider label="Noise Field Scale" value={config.noiseFieldScale != null ? config.noiseFieldScale : 0.01} min={0.001} max={0.1} step={0.001} onChange={h('noiseFieldScale')} formatValue={v => v.toFixed(3)} />
            <Slider label="Noise Field Strength" value={config.noiseFieldStrength != null ? config.noiseFieldStrength : 0} min={0} max={3} step={0.05} onChange={h('noiseFieldStrength')} formatValue={v => v.toFixed(2)} />
            <Slider label="Bounce Friction" value={config.bounceFriction != null ? config.bounceFriction : 0.3} min={0} max={1} step={0.05} onChange={h('bounceFriction')} formatValue={v => v.toFixed(2)} />
            <Slider label="Bounce Randomize" value={config.bounceRandomize != null ? config.bounceRandomize : 0} min={0} max={30} step={1} onChange={h('bounceRandomize')} />
            <Slider label="Spawn Jitter" value={config.spawnJitter != null ? config.spawnJitter : 0.2} min={0} max={0.5} step={0.05} onChange={h('spawnJitter')} formatValue={v => v.toFixed(2)} />
            <Slider label="World Margin" value={config.worldMargin != null ? config.worldMargin : 50} min={10} max={500} step={10} onChange={h('worldMargin')} />
            <Toggle label="Velocity Clip" value={config.velocityClip > 0} onChange={h('velocityClip')} />
            <Toggle label="Trails" value={config.trailsEnabled} onChange={h('trailsEnabled')} />
            <Toggle label="Connections" value={config.connectionsEnabled} onChange={h('connectionsEnabled')} />
            <Toggle label="Stats" value={config.showStats} onChange={h('showStats')} />
            <Toggle label="Glow" value={config.showGlow} onChange={h('showGlow')} />
            <button className="reset-btn" onClick={onReset}>↻ Reset</button>
          </Collapsible>

          <Collapsible title="Performance" defaultOpen={false}>
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

          <Collapsible title="World, Camera & XYZ" defaultOpen={false} >
            <p style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Z = [0, {zMax.toLocaleString()}] — persp² scale. 0=flat, 10=extreme.
            </p>
            <Slider label="World Width" value={config.worldWidth} min={200} max={10000} step={50} onChange={h('worldWidth')} />
            <Slider label="World Height" value={config.worldHeight} min={200} max={10000} step={50} onChange={h('worldHeight')} />
            <Slider label="Z Range (layers)" value={config.zRange} min={10} max={10000} step={10} onChange={h('zRange')} />
            <Slider label="Stack Perspective" value={config.stackPerspective} min={0} max={10} step={0.01} onChange={h('stackPerspective')} formatValue={v => v.toFixed(2)} />
            <Toggle label="Show Border" value={config.showWorldBorder} onChange={h('showWorldBorder')} />
            <Slider label="Grid Opacity" value={config.gridOpacity != null ? config.gridOpacity : 0.15} min={0} max={0.5} step={0.01} onChange={h('gridOpacity')} formatValue={v => v.toFixed(2)} />
            <Slider label="Particle Opacity" value={config.particleOpacity != null ? config.particleOpacity : 1} min={0.2} max={1} step={0.05} onChange={h('particleOpacity')} formatValue={v => v.toFixed(2)} />
            <Slider label="Connection Opacity" value={config.connectionOpacity != null ? config.connectionOpacity : 0.08} min={0} max={0.5} step={0.005} onChange={h('connectionOpacity')} formatValue={v => v.toFixed(3)} />
            <Slider label="Connection Width" value={config.connectionWidth != null ? config.connectionWidth : 0.4} min={0.1} max={3} step={0.1} onChange={h('connectionWidth')} formatValue={v => v.toFixed(1)} />
            <Slider label="Connection Fade" value={config.connectionFade != null ? config.connectionFade : 2} min={0.5} max={4} step={0.1} onChange={h('connectionFade')} formatValue={v => v.toFixed(1)} />
            <Slider label="Star Brightness" value={config.starBrightness != null ? config.starBrightness : 0.35} min={0} max={1} step={0.05} onChange={h('starBrightness')} formatValue={v => v.toFixed(2)} />
            <Slider label="Star Density" value={config.starDensity != null ? config.starDensity : 1} min={0.25} max={3} step={0.25} onChange={h('starDensity')} formatValue={v => v.toFixed(2)} />
            <Slider label="Depth Cue" value={config.depthCue != null ? config.depthCue : 0.5} min={0} max={1} step={0.05} onChange={h('depthCue')} formatValue={v => v.toFixed(2)} />
            <Slider label="Min Radius" value={config.minRadius != null ? config.minRadius : 0.5} min={0.2} max={3} step={0.1} onChange={h('minRadius')} formatValue={v => v.toFixed(1)} />
            <Slider label="Max Radius" value={config.maxRadius != null ? config.maxRadius : 12} min={3} max={20} step={0.5} onChange={h('maxRadius')} formatValue={v => v.toFixed(1)} />            <button className="reset-btn" onClick={onFitCamera}>⊞ Fit World</button>
          </Collapsible>

          <Collapsible title="Initial Distribution" defaultOpen={false}>
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
