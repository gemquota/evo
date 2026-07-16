import React from 'react';

const barColors = ['#22d3ee', '#d946ef', '#4ade80', '#fbbf24', '#f87171'];

export default function StatsOverlay({ fps, particleCount, frameTime, visibleCount, speciesStats, speciesConfig }) {
  if (!speciesConfig) return null;

  const totalCount = particleCount || 0;
  const speciesData = speciesConfig.map((sp, i) => {
    const count = speciesStats?.[sp.name] || 0;
    const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
    return { ...sp, count, pct, color: barColors[i % barColors.length] };
  }).filter(s => s.count > 0);

  const fpsBarWidth = Math.min(100, (fps / 60) * 100);
  const fpsColor = fps >= 55 ? '#4ade80' : fps >= 30 ? '#facc15' : fps >= 15 ? '#fb923c' : '#f87171';

  return (
    <div style={{
      position: 'absolute', top: 48, right: 8, zIndex: 10, pointerEvents: 'none',
      fontFamily: '"JetBrains Mono", monospace', fontSize: 10, lineHeight: 1.6,
      color: '#8888a5', minWidth: 140,
    }}>
      {/* FPS */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ color: fpsColor, fontWeight: 600 }}>{fps.toFixed ? fps.toFixed(0) : fps}</span>
          <span style={{ color: '#555570' }}>FPS</span>
        </div>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${fpsBarWidth}%`, background: fpsColor, borderRadius: 1, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Frame time + particle counts */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
        <div><span style={{ color: '#eeeef8', fontWeight: 500 }}>{frameTime}</span> <span style={{ color: '#555570' }}>ms</span></div>
        <div><span style={{ color: '#eeeef8', fontWeight: 500 }}>{visibleCount}</span> <span style={{ color: '#555570' }}>vis</span></div>
        <div><span style={{ color: '#eeeef8', fontWeight: 500 }}>{totalCount}</span> <span style={{ color: '#555570' }}>tot</span></div>
      </div>

      {/* Species bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {speciesData.map((sp) => (
          <div key={sp.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 40, color: `hsl(${sp.hue}, ${sp.saturation}%, ${sp.lightness}%)`, fontSize: 9, textAlign: 'right' }}>
              {sp.name.substring(0, 4)}
            </span>
            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(1, sp.pct)}%`, background: sp.color, borderRadius: 1 }} />
            </div>
            <span style={{ width: 28, fontSize: 9, textAlign: 'right', color: '#555570' }}>{sp.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
