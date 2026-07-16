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

          <Collapsible title="Dynamics" defaultOpen={false}>
            <Slider label="Friction" value={config.friction} min={0.1} max={0.99} step={0.01} onChange={h('friction')} formatValue={v => v.toFixed(2)} />
            <Slider label="Time Scale" value={config.timeScale} min={0.05} max={3} step={0.05} onChange={h('timeScale')} formatValue={v => v.toFixed(2)} />
            <Slider label="Max Force" value={config.maxForce} min={0.1} max={5} step={0.1} onChange={h('maxForce')} formatValue={v => v.toFixed(1)} />
            <Slider label="Noise" value={config.noiseAmount} min={0} max={2} step={0.01} onChange={h('noiseAmount')} formatValue={v => v.toFixed(2)} />
            <Slider label="Mass Variation" value={config.massVariation} min={0} max={1} step={0.05} onChange={h('massVariation')} formatValue={v => v.toFixed(2)} />
            <Slider label="Linear Drag" value={config.dragLinear} min={0} max={0.5} step={0.01} onChange={h('dragLinear')} formatValue={v => v.toFixed(2)} />
            <Slider label="Min Speed" value={config.minSpeed} min={0} max={5} step={0.1} onChange={h('minSpeed')} formatValue={v => v.toFixed(1)} />
            <Slider label="Velocity Clip" value={config.velocityClip} min={0} max={1} step={0.05} onChange={h('velocityClip')} formatValue={v => v.toFixed(2)} />
            <Slider label="Physics Rate" value={config.physicsRate} min={1} max={5} step={1} onChange={h('physicsRate')} />
          </Collapsible>

          <Collapsible title="Forces" defaultOpen={false}>
            <Slider label="Force Decay Power" value={config.forceDecayPower} min={0.5} max={4} step={0.1} onChange={h('forceDecayPower')} formatValue={v => v.toFixed(1)} />
            <Slider label="Force Jitter" value={config.interactionJitter} min={0} max={1} step={0.01} onChange={h('interactionJitter')} formatValue={v => v.toFixed(2)} />
            <Slider label="Force Inertia" value={config.forceInertia} min={0} max={0.95} step={0.05} onChange={h('forceInertia')} formatValue={v => v.toFixed(2)} />
            <Slider label="Interaction Symmetry" value={config.interactionSymmetry} min={0} max={1} step={0.05} onChange={h('interactionSymmetry')} formatValue={v => v.toFixed(2)} />
            <Slider label="Jerk Limit" value={config.jerkLimit} min={0} max={10} step={0.5} onChange={h('jerkLimit')} formatValue={v => v.toFixed(1)} />
            <Slider label="Pairwise Skip" value={config.pairwiseSkipChance} min={0} max={0.9} step={0.05} onChange={h('pairwiseSkipChance')} formatValue={v => v.toFixed(2)} />
          </Collapsible>

          <Collapsible title="Global Fields" defaultOpen={false}>
            <Slider label="Gravity Well" value={config.gravityWell} min={0} max={5} step={0.1} onChange={h('gravityWell')} formatValue={v => v.toFixed(1)} />
            <Slider label="Gravity Radius" value={config.gravityWellRadius} min={100} max={10000} step={100} onChange={h('gravityWellRadius')} />
            <Slider label="Vortex Strength" value={config.vortexStrength} min={0} max={3} step={0.05} onChange={h('vortexStrength')} formatValue={v => v.toFixed(2)} />
            <Slider label="Harmonic Strength" value={config.harmonicStrength} min={0} max={2} step={0.05} onChange={h('harmonicStrength')} formatValue={v => v.toFixed(2)} />
            <Slider label="Harmonic Range" value={config.harmonicRange} min={100} max={5000} step={50} onChange={h('harmonicRange')} />
            <Slider label="Radial Drift" value={config.radialDrift} min={-1} max={1} step={0.05} onChange={h('radialDrift')} formatValue={v => v.toFixed(2)} />
            <Slider label="Repulsion Falloff" value={config.repulsionFalloff} min={0.5} max={4} step={0.1} onChange={h('repulsionFalloff')} formatValue={v => v.toFixed(1)} />
            <Slider label="Wander Rate" value={config.wanderRate} min={0} max={0.5} step={0.01} onChange={h('wanderRate')} formatValue={v => v.toFixed(2)} />
          </Collapsible>

          <Collapsible title="Env Forces" defaultOpen={false}>
            <Slider label="Wind Strength" value={config.windStrength} min={0} max={10} step={0.1} onChange={h('windStrength')} formatValue={v => v.toFixed(1)} />
            <Select label="Wind Dir °" value={String(config.windDir)} options={["0","45","90","135","180","225","270","315"]} onChange={(v) => h("windDir")(Number(v))} />
            <Slider label="Radial Pulse Amp" value={config.radialPulseAmp} min={0} max={5} step={0.1} onChange={h('radialPulseAmp')} formatValue={v => v.toFixed(1)} />
            <Slider label="Radial Pulse Freq" value={config.radialPulseFreq} min={0.1} max={10} step={0.1} onChange={h('radialPulseFreq')} formatValue={v => v.toFixed(1)} />
            <Slider label="Tidal Strength" value={config.tidalStrength} min={0} max={3} step={0.1} onChange={h('tidalStrength')} formatValue={v => v.toFixed(1)} />
            <Slider label="Wave Force Amp" value={config.waveForceAmp} min={0} max={5} step={0.1} onChange={h('waveForceAmp')} formatValue={v => v.toFixed(1)} />
            <Slider label="Wave Freq" value={config.waveFreq} min={0.1} max={10} step={0.1} onChange={h('waveFreq')} formatValue={v => v.toFixed(1)} />
            <Slider label="Wave Speed" value={config.waveSpeed} min={0.1} max={10} step={0.1} onChange={h('waveSpeed')} formatValue={v => v.toFixed(1)} />
            <Slider label="Noise Field Strength" value={config.noiseFieldStrength} min={0} max={3} step={0.05} onChange={h('noiseFieldStrength')} formatValue={v => v.toFixed(2)} />
            <Slider label="Noise Field Scale" value={config.noiseFieldScale} min={0.001} max={0.1} step={0.001} onChange={h('noiseFieldScale')} formatValue={v => v.toFixed(3)} />
            <Slider label="Noise Drift" value={config.noiseDrift} min={0} max={1} step={0.05} onChange={h('noiseDrift')} formatValue={v => v.toFixed(2)} />
            <Slider label="Noise Octaves" value={config.noiseOctaves} min={1} max={6} step={1} onChange={h('noiseOctaves')} />
          </Collapsible>

          <Collapsible title="Edge / Boundary" defaultOpen={false}>
            <Select label="Edge Mode" value={config.edgeMode} options={['wrap', 'bounce', 'contain']} onChange={h('edgeMode')} />
            <Slider label="Bounce Restitution" value={config.bounceRestitution} min={0.1} max={1} step={0.05} onChange={h('bounceRestitution')} formatValue={v => v.toFixed(2)} />
            <Slider label="Bounce Friction" value={config.bounceFriction} min={0} max={1} step={0.05} onChange={h('bounceFriction')} formatValue={v => v.toFixed(2)} />
            <Slider label="Bounce Randomize" value={config.bounceRandomize} min={0} max={30} step={1} onChange={h('bounceRandomize')} />
            <Slider label="Boundary Repel" value={config.boundaryRepelForce} min={0} max={5} step={0.1} onChange={h('boundaryRepelForce')} formatValue={v => v.toFixed(1)} />
            <Slider label="Boundary Warmth" value={config.boundaryWarmth} min={0} max={2} step={0.05} onChange={h('boundaryWarmth')} formatValue={v => v.toFixed(2)} />
            <Slider label="World Margin" value={config.worldMargin} min={10} max={500} step={10} onChange={h('worldMargin')} />
            <Slider label="Surface Adhesion" value={config.surfaceAdhesion} min={0} max={1} step={0.05} onChange={h('surfaceAdhesion')} formatValue={v => v.toFixed(2)} />
          </Collapsible>

          <Collapsible title="Z-Space" defaultOpen={false}>
            <Slider label="Z Range" value={config.zRange} min={10} max={10000} step={50} onChange={h('zRange')} />
            <Slider label="Stack Perspective" value={config.stackPerspective} min={0} max={10} step={0.5} onChange={h('stackPerspective')} formatValue={v => v.toFixed(1)} />
            <Slider label="Z Damping" value={config.velocityDampingZ} min={0.1} max={0.99} step={0.01} onChange={h('velocityDampingZ')} formatValue={v => v.toFixed(2)} />
            <Slider label="Z Gravity" value={config.zGravity} min={-0.1} max={0.1} step={0.005} onChange={h('zGravity')} formatValue={v => v.toFixed(3)} />
            <Slider label="Depth Cue" value={config.depthCue} min={0} max={1} step={0.05} onChange={h('depthCue')} formatValue={v => v.toFixed(2)} />
          </Collapsible>

          <Collapsible title="World" defaultOpen={false}>
            <Slider label="World Width" value={config.worldWidth} min={200} max={10000} step={100} onChange={h('worldWidth')} />
            <Slider label="World Height" value={config.worldHeight} min={200} max={10000} step={100} onChange={h('worldHeight')} />
            <Toggle label="Show Border" value={config.showWorldBorder} onChange={h('showWorldBorder')} />
          </Collapsible>

          <Collapsible title="Distribution" defaultOpen={false}>
            <Select label="Pattern" value={config.distributionMode} options={dists} onChange={h('distributionMode')} />
            <Select label="Velocity" value={config.initialVelocity} options={vels} onChange={h('initialVelocity')} />
            {config.distributionMode === 'cluster' && (
              <><Slider label="Cluster Count" value={config.clusterCount} min={1} max={30} step={1} onChange={h('clusterCount')} />
              <Slider label="Cluster Spread" value={config.clusterSpread} min={50} max={2500} step={50} onChange={h('clusterSpread')} /></>
            )}
            {config.distributionMode === 'ring' && (
              <Slider label="Ring Radius" value={config.ringRadius} min={100} max={2500} step={50} onChange={h('ringRadius')} />
            )}
            <Slider label="Spawn Jitter" value={config.spawnJitter} min={0} max={0.5} step={0.05} onChange={h('spawnJitter')} formatValue={v => v.toFixed(2)} />
            <Slider label="Center Bias" value={config.centerBias} min={0} max={1} step={0.05} onChange={h('centerBias')} formatValue={v => v.toFixed(2)} />
            <button className="reset-btn" onClick={onReset}>⟳ Re-distribute</button>
          </Collapsible>

          <Collapsible title="Social / Swarm" defaultOpen={false}>
            <Slider label="Alignment Force" value={config.alignmentForce} min={0} max={3} step={0.05} onChange={h('alignmentForce')} formatValue={v => v.toFixed(2)} />
            <Slider label="Cohesion Force" value={config.cohesionForce} min={0} max={3} step={0.05} onChange={h('cohesionForce')} formatValue={v => v.toFixed(2)} />
            <Slider label="Separation Force" value={config.separationForce} min={0} max={5} step={0.1} onChange={h('separationForce')} formatValue={v => v.toFixed(1)} />
            <Slider label="Leader Influence" value={config.leaderInfluence} min={0} max={1} step={0.05} onChange={h('leaderInfluence')} formatValue={v => v.toFixed(2)} />
            <Slider label="Flock Radius" value={config.flockRadius} min={50} max={2000} step={50} onChange={h('flockRadius')} />
            <Slider label="Herd Threshold" value={config.herdThreshold} min={1} max={50} step={1} onChange={h('herdThreshold')} />
          </Collapsible>

          <Collapsible title="Chem / Signalling" defaultOpen={false}>
            <Slider label="Chem Decay" value={config.chemDecay} min={0} max={1} step={0.01} onChange={h('chemDecay')} formatValue={v => v.toFixed(2)} />
            <Slider label="Chem Diffusion" value={config.chemDiffusion} min={0} max={0.5} step={0.01} onChange={h('chemDiffusion')} formatValue={v => v.toFixed(2)} />
            <Slider label="Emission Rate" value={config.chemEmissionRate} min={0} max={1} step={0.01} onChange={h('chemEmissionRate')} formatValue={v => v.toFixed(2)} />
            <Slider label="Signal Threshold" value={config.signalThreshold} min={0} max={5} step={0.05} onChange={h('signalThreshold')} formatValue={v => v.toFixed(2)} />
            <Slider label="Signal Gain" value={config.signalGain} min={0} max={5} step={0.05} onChange={h('signalGain')} formatValue={v => v.toFixed(2)} />
            <Slider label="Signal Propagation" value={config.signalPropagation} min={0} max={3} step={0.1} onChange={h('signalPropagation')} formatValue={v => v.toFixed(1)} />
            <Slider label="Comm Range" value={config.commRange} min={50} max={2000} step={50} onChange={h('commRange')} />
            <Slider label="Comm Bandwidth" value={config.commBandwidth} min={0} max={1} step={0.05} onChange={h('commBandwidth')} formatValue={v => v.toFixed(2)} />
            <Slider label="Signal Memory" value={config.signalMemory} min={0} max={100} step={1} onChange={h('signalMemory')} />
          </Collapsible>

          <Collapsible title="Energy / Growth" defaultOpen={false}>
            <Slider label="Energy Decay" value={config.energyDecay} min={0} max={0.1} step={0.001} onChange={h('energyDecay')} formatValue={v => v.toFixed(3)} />
            <Slider label="Max Energy" value={config.maxEnergy} min={10} max={1000} step={10} onChange={h('maxEnergy')} />
            <Slider label="Accretion Rate" value={config.accretionRate} min={0} max={0.1} step={0.001} onChange={h('accretionRate')} formatValue={v => v.toFixed(3)} />
            <Slider label="Merge Threshold" value={config.mergeThreshold} min={0.1} max={5} step={0.1} onChange={h('mergeThreshold')} formatValue={v => v.toFixed(1)} />
            <Slider label="Mass Absorption" value={config.massAbsorption} min={0} max={0.5} step={0.01} onChange={h('massAbsorption')} formatValue={v => v.toFixed(2)} />
            <Slider label="Critical Mass" value={config.criticalMass} min={2} max={100} step={1} onChange={h('criticalMass')} />
          </Collapsible>

          <Collapsible title="Reproduction" defaultOpen={false}>
            <Slider label="Reproduction Rate" value={config.reproductionRate} min={0} max={0.1} step={0.001} onChange={h('reproductionRate')} formatValue={v => v.toFixed(3)} />
            <Slider label="Reprod Energy" value={config.reproductionEnergy} min={0} max={100} step={1} onChange={h('reproductionEnergy')} />
            <Slider label="Reprod Cost" value={config.reproductionCost} min={1} max={100} step={1} onChange={h('reproductionCost')} />
            <Slider label="Mutation Rate" value={config.mutationRate} min={0} max={0.5} step={0.01} onChange={h('mutationRate')} formatValue={v => v.toFixed(2)} />
            <Slider label="Inherit Traits" value={config.inheritTraits} min={0} max={1} step={0.05} onChange={h('inheritTraits')} formatValue={v => v.toFixed(2)} />
          </Collapsible>

          <Collapsible title="Matrix" defaultOpen={false}>
            <Slider label="Matrix Drift" value={config.matrixDrift} min={0} max={0.1} step={0.005} onChange={h('matrixDrift')} formatValue={v => v.toFixed(3)} />
            <p className="matrix-hint">
              <strong style={{ color: '#ef4444' }}>Red</strong> repels · <strong style={{ color: '#38bdf8' }}>Blue</strong> attracts<br />Row → Column species
            </p>
            <MatrixGrid matrix={interactionMatrix} species={species} onChange={onMatrixChange} />
          </Collapsible>

          <Collapsible title="Touch" defaultOpen={false}>
            <Slider label="Attract Force" value={config.attractForce} min={0.1} max={10} step={0.1} onChange={h('attractForce')} formatValue={v => v.toFixed(1)} />
            <Slider label="Attract Radius" value={config.attractRadius} min={10} max={1000} step={10} onChange={h('attractRadius')} />
            <Slider label="Touch Deadzone" value={config.touchDeadzone} min={0} max={20} step={1} onChange={h('touchDeadzone')} />
            <Slider label="Pinch Sensitivity" value={config.pinchSensitivity} min={0.1} max={3} step={0.1} onChange={h('pinchSensitivity')} formatValue={v => v.toFixed(1)} />
          </Collapsible>

          <Collapsible title="Camera" defaultOpen={false}>
            <Slider label="Camera Smooth" value={config.cameraSmooth} min={0} max={1} step={0.05} onChange={h('cameraSmooth')} formatValue={v => v.toFixed(2)} />
            <Slider label="Camera Speed" value={config.cameraSpeed} min={0.5} max={10} step={0.5} onChange={h('cameraSpeed')} formatValue={v => v.toFixed(1)} />
            <Slider label="Zoom Min" value={config.zoomMin} min={0.01} max={0.5} step={0.01} onChange={h('zoomMin')} formatValue={v => v.toFixed(2)} />
            <Slider label="Zoom Max" value={config.zoomMax} min={2} max={50} step={1} onChange={h('zoomMax')} />
            <button className="reset-btn" onClick={onFitCamera}>⊞ Fit World</button>
          </Collapsible>

          <Collapsible title="Quality / Perf" defaultOpen={false}>
            <Slider label="Render Quality" value={config.renderQuality} min={0.25} max={1} step={0.05} onChange={h('renderQuality')} formatValue={v => v.toFixed(2)} />
            <Slider label="FPS Cap" value={config.fpsCap} min={15} max={240} step={5} onChange={h('fpsCap')} />
            <Slider label="Batch Size" value={config.batchSize} min={50} max={5000} step={50} onChange={h('batchSize')} />
            <Slider label="Sim Updates / Frame" value={config.simUpdatesPerFrame} min={1} max={10} step={1} onChange={h('simUpdatesPerFrame')} />
            <Toggle label="Adaptive Quality" value={config.adaptiveQuality} onChange={h('adaptiveQuality')} />
          </Collapsible>

          <Collapsible title="Visuals" defaultOpen={true}>
            <Toggle label="Trails" value={config.trailsEnabled} onChange={h('trailsEnabled')} />
            <Slider label="Trail Opacity" value={config.trailOpacity} min={0} max={0.2} step={0.002} onChange={h('trailOpacity')} formatValue={v => v.toFixed(3)} />
            <Slider label="Trail Gap" value={config.trailGap} min={1} max={10} step={1} onChange={h('trailGap')} />
            <Toggle label="Glow" value={config.showGlow} onChange={h('showGlow')} />
            <Slider label="Glow Intensity" value={config.glowIntensity} min={0} max={2} step={0.05} onChange={h('glowIntensity')} formatValue={v => v.toFixed(2)} />
            <Slider label="Glow Spread" value={config.glowSpread} min={0.5} max={4} step={0.1} onChange={h('glowSpread')} formatValue={v => v.toFixed(1)} />
            <Slider label="HDR Exposure" value={config.hdrExposure} min={0.5} max={3} step={0.1} onChange={h('hdrExposure')} formatValue={v => v.toFixed(1)} />
            <Slider label="Saturation Boost" value={config.saturationBoost} min={0} max={2} step={0.05} onChange={h('saturationBoost')} formatValue={v => v.toFixed(2)} />
            <Slider label="Color Shift" value={config.colorShift} min={0} max={360} step={1} onChange={h('colorShift')} />
            <Slider label="Particle Contrast" value={config.particleContrast} min={0.5} max={3} step={0.1} onChange={h('particleContrast')} formatValue={v => v.toFixed(1)} />
            <Slider label="Particle Opacity" value={config.particleOpacity} min={0.2} max={1} step={0.05} onChange={h('particleOpacity')} formatValue={v => v.toFixed(2)} />
            <Slider label="Min Radius" value={config.minRadius} min={0.2} max={3} step={0.1} onChange={h('minRadius')} formatValue={v => v.toFixed(1)} />
            <Slider label="Max Radius" value={config.maxRadius} min={3} max={20} step={0.5} onChange={h('maxRadius')} formatValue={v => v.toFixed(1)} />
          </Collapsible>

          <Collapsible title="Connections" defaultOpen={false}>
            <Toggle label="Connections" value={config.connectionsEnabled} onChange={h('connectionsEnabled')} />
            <Slider label="Connection Dist" value={config.connectionDistance} min={50} max={2500} step={25} onChange={h('connectionDistance')} />
            <Slider label="Connection Opacity" value={config.connectionOpacity} min={0} max={0.5} step={0.01} onChange={h('connectionOpacity')} formatValue={v => v.toFixed(3)} />
            <Slider label="Connection Width" value={config.connectionWidth} min={0.1} max={3} step={0.1} onChange={h('connectionWidth')} formatValue={v => v.toFixed(1)} />
            <Slider label="Connection Fade" value={config.connectionFade} min={0.5} max={4} step={0.1} onChange={h('connectionFade')} formatValue={v => v.toFixed(1)} />
          </Collapsible>

          <Collapsible title="Stars" defaultOpen={false}>
            <Slider label="Star Brightness" value={config.starBrightness} min={0} max={1} step={0.05} onChange={h('starBrightness')} formatValue={v => v.toFixed(2)} />
            <Slider label="Star Density" value={config.starDensity} min={0.25} max={3} step={0.25} onChange={h('starDensity')} formatValue={v => v.toFixed(2)} />
            <Slider label="Star Twinkle" value={config.starTwinkle} min={0} max={1} step={0.05} onChange={h('starTwinkle')} formatValue={v => v.toFixed(2)} />
            <Toggle label="Animate Bg" value={config.animateBackground} onChange={h('animateBackground')} />
          </Collapsible>

          <Collapsible title="Quick Actions" defaultOpen={true} badge="now">
            <button className="reset-btn" onClick={onReset}>⟳ Re-distribute / Reset</button>
            <button className="reset-btn" onClick={onFitCamera}>⊞ Fit World</button>
            <Toggle label="Show Stats" value={config.showStats} onChange={h('showStats')} />
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
        </div>
      </div>
    </>
  );
}

export default React.memo(Controls);
