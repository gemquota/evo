import React from 'react';

export default function StatsOverlay({ fps, particleCount, frameTime, visibleCount, speciesStats, speciesConfig }) {
  if (!speciesConfig) return null;

  return (
    <div className="stats-overlay">
      <div className="stats-line" style={{ color: fps >= 30 ? '#4ade80' : fps >= 15 ? '#facc15' : '#f87171' }}>
        FPS {fps}
      </div>
      <div className="stats-line" style={{ color: '#8888a5' }}>TOTAL {particleCount}</div>
      <div className="stats-line" style={{ color: '#8888a5' }}>{frameTime}ms</div>
      <div className="stats-line" style={{ color: '#8888a5' }}>VIS {visibleCount}</div>
      {speciesConfig.map((sp, i) => {
        const count = speciesStats?.[sp.name] || 0;
        if (count === 0) return null;
        const color = `hsl(${sp.hue}, ${sp.saturation}%, ${sp.lightness}%)`;
        return (
          <div key={sp.name} className="stats-line" style={{ color }}>
            {sp.name} {count}
          </div>
        );
      })}
    </div>
  );
}
