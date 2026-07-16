import React from 'react';

export default function Slider({ label, value, min, max, step, onChange, formatValue }) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : value;

  return (
    <div className="slider-group">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <span className="slider-value">{display}</span>
      </div>
      <div className="slider-track">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ '--pct': `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ColorSlider({ label, value, onChange }) {
  return (
    <div className="slider-group">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <div className="slider-color-preview">
          <span className="slider-value">{value}°</span>
          <span
            className="color-swatch"
            style={{ backgroundColor: `hsl(${value}, 80%, 55%)` }}
          />
        </div>
      </div>
      <div className="slider-track">
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{
            background: `linear-gradient(to right,
              hsl(0,80%,55%) 0%,
              hsl(60,80%,55%) 17%,
              hsl(120,80%,55%) 33%,
              hsl(180,80%,55%) 50%,
              hsl(240,80%,55%) 67%,
              hsl(300,80%,55%) 83%,
              hsl(360,80%,55%) 100%
            )`,
            '--pct': `${(value / 360) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export function Toggle({ label, value, onChange }) {
  return (
    <div className="toggle-group">
      <label className="toggle-label">{label}</label>
      <button
        className={`toggle-btn ${value ? 'active' : ''}`}
        onClick={() => onChange(!value)}
        aria-label={label}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
}

export function Select({ label, value, options, onChange }) {
  return (
    <div className="select-group">
      <label className="select-label">{label}</label>
      <select
        className="select-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : (opt.charAt(0).toUpperCase() + opt.slice(1));
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}
