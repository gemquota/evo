import React from 'react';

function forceColor(val) {
  // Red for negative (repulsion), blue for positive (attraction)
  const t = Math.max(0, Math.min(1, Math.abs(val) / 3));
  if (val < 0) {
    return `rgba(239, 68, 68, ${t})`; // red
  } else if (val > 0) {
    return `rgba(56, 189, 248, ${t})`; // blue
  }
  return 'rgba(40, 40, 55, 0.6)'; // zero
}

export default function MatrixGrid({ matrix, species, onChange }) {
  const n = matrix.length;
  if (n === 0 || !species) return null;

  return (
    <div className="matrix-container">
      <div className="matrix-grid" style={{
        gridTemplateColumns: `minmax(70px, auto) repeat(${n}, 1fr)`,
      }}>
        {/* Header row */}
        <div className="matrix-corner">→ actor \ target ↓</div>
        {species.map((s, j) => (
          <div key={`h-${j}`} className="matrix-header">
            <span
              className="matrix-header-swatch"
              style={{ backgroundColor: `hsl(${s.hue}, ${s.saturation}%, ${s.lightness}%)` }}
            />
            {s.name}
          </div>
        ))}

        {/* Data rows */}
        {species.map((s, i) => (
          <React.Fragment key={`r-${i}`}>
            <div className="matrix-row-label">
              <span
                className="matrix-header-swatch"
                style={{ backgroundColor: `hsl(${s.hue}, ${s.saturation}%, ${s.lightness}%)` }}
              />
              {s.name}
            </div>
            {species.map((_, j) => {
              const val = matrix[i]?.[j] ?? 0;
              const bg = forceColor(val);
              return (
                <div
                  key={`c-${i}-${j}`}
                  className="matrix-cell"
                  style={{ backgroundColor: bg }}
                  title={`${species[i].name} → ${species[j].name}: ${val.toFixed(2)}`}
                >
                  <input
                    type="range"
                    min={-3}
                    max={3}
                    step={0.05}
                    value={val}
                    onChange={(e) => {
                      const newVal = parseFloat(e.target.value);
                      const newMatrix = matrix.map(row => [...row]);
                      newMatrix[i][j] = newVal;
                      onChange(newMatrix);
                    }}
                  />
                  <span className="matrix-cell-value">{val.toFixed(1)}</span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
