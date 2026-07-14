import React, { useState } from 'react'

const COLORS = {
  cyan: '#00d4ff',
  crimson: '#ef4444',
  amber: '#f59e0b',
  green: '#10b981',
  surface: '#111827',
  border: '#1e2d40',
  textPrimary: '#f1f5f9',
  textMuted: '#64748b',
  purple: '#a78bfa',
}

const sliderStyle = `
  .weight-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(to right, #f59e0b var(--pct, 50%), #1e2d40 var(--pct, 50%));
    outline: none;
    cursor: pointer;
    transition: background 0.1s;
  }
  .weight-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #f59e0b;
    box-shadow: 0 0 8px #f59e0b88;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }
  .weight-slider::-webkit-slider-thumb:hover {
    box-shadow: 0 0 14px #f59e0bcc;
  }
  .weight-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #f59e0b;
    box-shadow: 0 0 8px #f59e0b88;
    cursor: pointer;
    border: none;
  }
`

function WeightSlider({ label, value, onChange, min = -3, max = 3, step = 0.01 }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ marginBottom: 10 }}>
      <style>{sliderStyle}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ color: COLORS.textMuted, fontSize: 11, fontFamily: "'Inter', sans-serif" }}>{label}</span>
        <span style={{
          color: COLORS.amber,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          minWidth: 48,
          textAlign: 'right',
        }}>
          {value >= 0 ? '+' : ''}{value.toFixed(3)}
        </span>
      </div>
      <input
        type="range"
        className="weight-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--pct': `${pct}%` }}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}

function SectionTitle({ children, icon }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
      paddingBottom: 6,
      borderBottom: `1px solid ${COLORS.border}`,
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ color: COLORS.textPrimary, fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", letterSpacing: '0.5px' }}>
        {children}
      </span>
    </div>
  )
}

const LR_OPTIONS = [0.001, 0.01, 0.1, 0.5, 1.0]
const OPT_OPTIONS = [
  { value: 'sgd', label: 'SGD' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'adam', label: 'Adam' },
]
const XOR_EXAMPLES = [
  { input: [0, 0], target: 0 },
  { input: [0, 1], target: 1 },
  { input: [1, 0], target: 1 },
  { input: [1, 1], target: 0 },
]

export default function WeightControls({
  state, inputIndex,
  setWeights1, setWeights2, setBias1, setBias2,
  setInput, step, train, reset
}) {
  const [lr, setLr] = useState(0.1)
  const [optimizer, setOptimizer] = useState('sgd')
  const [isTraining, setIsTraining] = useState(false)

  const handleTrain100 = () => {
    setIsTraining(true)
    // Use setTimeout to allow React to render loading state first,
    // then batch all 100 steps (functional updates queue correctly)
    setTimeout(() => {
      for (let k = 0; k < 100; k++) {
        step(optimizer, lr)
      }
      setIsTraining(false)
    }, 16)
  }

  const pred = state.outputA || 0
  const target = state.target
  const loss = state.loss || 0
  const diff = Math.abs(pred - target)
  const predColor = diff < 0.2 ? COLORS.green : diff < 0.4 ? COLORS.amber : COLORS.crimson

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      height: '100%',
    }}>
      {/* Input selector */}
      <div style={{
        background: 'rgba(17,24,39,0.8)',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '10px 10px 0 0',
        padding: '12px 14px',
        backdropFilter: 'blur(12px)',
      }}>
        <SectionTitle icon="📊">Training Example</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {XOR_EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setInput(idx)}
              style={{
                background: inputIndex === idx ? `rgba(0, 212, 255, 0.15)` : 'rgba(10,15,30,0.6)',
                border: `1px solid ${inputIndex === idx ? COLORS.cyan : COLORS.border}`,
                borderRadius: 6,
                padding: '6px 8px',
                color: inputIndex === idx ? COLORS.cyan : COLORS.textMuted,
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>[{ex.input[0]},{ex.input[1]}]</span>
              <span style={{ color: ex.target === 1 ? COLORS.green : COLORS.crimson }}>→{ex.target}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Weights section */}
      <div style={{
        background: 'rgba(17,24,39,0.8)',
        border: `1px solid ${COLORS.border}`,
        borderTop: 'none',
        padding: '12px 14px',
        backdropFilter: 'blur(12px)',
        flex: 1,
        overflowY: 'auto',
      }}>
        <SectionTitle icon="⚖️">Layer 1 Weights W₁ (2×3)</SectionTitle>
        {[0, 1].map(i =>
          [0, 1, 2].map(j => (
            <WeightSlider
              key={`w1-${i}-${j}`}
              label={`w${i + 1}${j + 1} (x${i + 1} → h${j + 1})`}
              value={state.weights1[i][j]}
              onChange={v => setWeights1(i, j, v)}
            />
          ))
        )}

        <div style={{ marginTop: 14 }}>
          <SectionTitle icon="⚡">Layer 1 Biases</SectionTitle>
          {[0, 1, 2].map(j => (
            <WeightSlider
              key={`b1-${j}`}
              label={`b${j + 1} (bias h${j + 1})`}
              value={state.bias1[j]}
              onChange={v => setBias1(j, v)}
            />
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <SectionTitle icon="⚖️">Layer 2 Weights W₂ (3×1)</SectionTitle>
          {[0, 1, 2].map(j => (
            <WeightSlider
              key={`w2-${j}`}
              label={`w${j + 1} (h${j + 1} → ŷ)`}
              value={state.weights2[j][0]}
              onChange={v => setWeights2(j, v)}
            />
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <SectionTitle icon="⚡">Layer 2 Bias</SectionTitle>
          <WeightSlider
            label="b (bias output)"
            value={state.bias2[0]}
            onChange={v => setBias2(v)}
          />
        </div>
      </div>

      {/* Training controls */}
      <div style={{
        background: 'rgba(17,24,39,0.8)',
        border: `1px solid ${COLORS.border}`,
        borderTop: 'none',
        padding: '12px 14px',
        backdropFilter: 'blur(12px)',
      }}>
        <SectionTitle icon="🎛️">Training Controls</SectionTitle>

        <div style={{ marginBottom: 10 }}>
          <div style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 6 }}>Learning Rate α</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {LR_OPTIONS.map(l => (
              <button
                key={l}
                onClick={() => setLr(l)}
                style={{
                  background: lr === l ? 'rgba(0,212,255,0.15)' : 'rgba(10,15,30,0.6)',
                  border: `1px solid ${lr === l ? COLORS.cyan : COLORS.border}`,
                  borderRadius: 4,
                  padding: '3px 8px',
                  color: lr === l ? COLORS.cyan : COLORS.textMuted,
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 6 }}>Optimizer</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {OPT_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setOptimizer(o.value)}
                style={{
                  background: optimizer === o.value ? 'rgba(245,158,11,0.15)' : 'rgba(10,15,30,0.6)',
                  border: `1px solid ${optimizer === o.value ? COLORS.amber : COLORS.border}`,
                  borderRadius: 4,
                  padding: '3px 10px',
                  color: optimizer === o.value ? COLORS.amber : COLORS.textMuted,
                  fontSize: 10,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: 1,
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <button
            onClick={() => step(optimizer, lr)}
            style={{
              flex: 1,
              background: 'rgba(0,212,255,0.12)',
              border: `1px solid ${COLORS.cyan}`,
              borderRadius: 6,
              padding: '8px 0',
              color: COLORS.cyan,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(0,212,255,0.22)'}
            onMouseLeave={e => e.target.style.background = 'rgba(0,212,255,0.12)'}
          >
            ▶ Step Once
          </button>
          <button
            onClick={handleTrain100}
            disabled={isTraining}
            style={{
              flex: 1,
              background: isTraining ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${isTraining ? COLORS.border : COLORS.amber}`,
              borderRadius: 6,
              padding: '8px 0',
              color: isTraining ? COLORS.textMuted : COLORS.amber,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: isTraining ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isTraining ? '⏳ Training…' : '⚡ ×100 Steps'}
          </button>
        </div>
        <button
          onClick={reset}
          style={{
            width: '100%',
            background: 'rgba(239,68,68,0.08)',
            border: `1px solid rgba(239,68,68,0.3)`,
            borderRadius: 6,
            padding: '7px 0',
            color: COLORS.crimson,
            fontSize: 11,
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.16)'}
          onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.08)'}
        >
          ↺ Reset Weights
        </button>
      </div>

      {/* Stats */}
      <div style={{
        background: 'rgba(17,24,39,0.8)',
        border: `1px solid ${COLORS.border}`,
        borderTop: 'none',
        borderRadius: '0 0 10px 10px',
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Prediction', value: pred.toFixed(4), color: predColor },
            { label: 'Target', value: target.toFixed(1), color: COLORS.green },
            { label: 'Loss', value: loss.toFixed(4), color: COLORS.crimson },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(10,15,30,0.6)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              padding: '6px 8px',
              textAlign: 'center',
            }}>
              <div style={{ color: COLORS.textMuted, fontSize: 9, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </div>
              <div style={{ color: stat.color, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
