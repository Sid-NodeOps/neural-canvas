import React from 'react'

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

function fmt(v, digits = 4) {
  if (v === undefined || v === null || isNaN(v)) return '–'
  return (v >= 0 ? '+' : '') + v.toFixed(digits)
}

function fmtPlain(v, digits = 4) {
  if (v === undefined || v === null || isNaN(v)) return '–'
  return v.toFixed(digits)
}

function ArrowDown({ label }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '6px 0',
      gap: 2,
    }}>
      <div style={{ color: COLORS.textMuted, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      <svg width="20" height="20" viewBox="0 0 20 20">
        <line x1="10" y1="2" x2="10" y2="14" stroke={COLORS.cyan} strokeWidth="1.5" opacity="0.6" />
        <path d="M5,11 L10,16 L15,11" stroke={COLORS.cyan} strokeWidth="1.5" fill="none" opacity="0.6" />
      </svg>
    </div>
  )
}

function LayerBlock({ title, color, children }) {
  return (
    <div style={{
      background: 'rgba(10,15,30,0.5)',
      border: `1px solid ${color}22`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 8,
      padding: '10px 12px',
      marginBottom: 0,
    }}>
      <div style={{
        color: color,
        fontSize: 10,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        letterSpacing: '1px',
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function FormulaRow({ label, formula, value, color = COLORS.cyan }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 6,
      padding: '4px 0',
      borderBottom: `1px solid rgba(30,45,64,0.4)`,
    }}>
      <div style={{
        color: COLORS.textMuted,
        fontSize: 10,
        fontFamily: "'Inter', sans-serif",
        minWidth: 24,
        paddingTop: 1,
      }}>
        {label}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          color: COLORS.purple,
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.5,
          marginBottom: 2,
          opacity: 0.8,
        }}>
          {formula}
        </div>
        <div style={{
          color: color,
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
        }}>
          = {value}
        </div>
      </div>
    </div>
  )
}

export default function ForwardPassPanel({ state }) {
  const {
    input = [0, 0],
    weights1 = [[0,0,0],[0,0,0]],
    weights2 = [[0],[0],[0]],
    bias1 = [0,0,0],
    bias2 = [0],
    hiddenZ = [0,0,0],
    hiddenA = [0,0,0],
    outputZ = 0,
    outputA = 0,
    target = 0,
    loss = 0,
  } = state

  const x1 = input[0], x2 = input[1]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      height: '100%',
      overflowY: 'auto',
      padding: '2px',
    }}>
      {/* Input Layer */}
      <LayerBlock title="① Input Layer" color="#6366f1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: COLORS.textMuted, fontSize: 10 }}>x₁</div>
            <div style={{ color: '#a78bfa', fontSize: 16, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              {fmtPlain(x1, 1)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: COLORS.textMuted, fontSize: 10 }}>x₂</div>
            <div style={{ color: '#a78bfa', fontSize: 16, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              {fmtPlain(x2, 1)}
            </div>
          </div>
        </div>
      </LayerBlock>

      <ArrowDown label="multiply weights, add bias" />

      {/* Hidden pre-activation */}
      <LayerBlock title="② Hidden Layer — Pre-activation Z" color={COLORS.amber}>
        {[0, 1, 2].map(j => {
          const w1 = weights1[0][j], w2 = weights1[1][j], b = bias1[j]
          const formula = `w${1+0}${j+1}·x₁ + w${1+1}${j+1}·x₂ + b${j+1}`
          const detail = `(${fmt(w1,3)})·${fmtPlain(x1,1)} + (${fmt(w2,3)})·${fmtPlain(x2,1)} + (${fmt(b,3)})`
          return (
            <FormulaRow
              key={j}
              label={`z${j+1}`}
              formula={detail}
              value={fmt(hiddenZ[j])}
              color={COLORS.amber}
            />
          )
        })}
      </LayerBlock>

      <ArrowDown label="σ(z) = 1/(1+e⁻ᶻ)" />

      {/* Hidden post-activation */}
      <LayerBlock title="③ Hidden Layer — Post-activation A = σ(Z)" color={COLORS.cyan}>
        {[0, 1, 2].map(j => (
          <FormulaRow
            key={j}
            label={`a${j+1}`}
            formula={`σ(z${j+1}) = σ(${fmt(hiddenZ[j], 3)})`}
            value={fmtPlain(hiddenA[j])}
            color={COLORS.cyan}
          />
        ))}
      </LayerBlock>

      <ArrowDown label="multiply weights, add bias" />

      {/* Output pre-activation */}
      <LayerBlock title="④ Output — Pre-activation Z" color={COLORS.amber}>
        {(() => {
          const w = weights2
          const detail = `${fmt(w[0][0],3)}·a₁ + ${fmt(w[1][0],3)}·a₂ + ${fmt(w[2][0],3)}·a₃ + ${fmt(bias2[0],3)}`
          return (
            <FormulaRow
              label="z"
              formula={detail}
              value={fmt(outputZ)}
              color={COLORS.amber}
            />
          )
        })()}
      </LayerBlock>

      <ArrowDown label="σ(z)" />

      {/* Output */}
      <LayerBlock title="⑤ Output ŷ = σ(Z)" color={COLORS.green}>
        <FormulaRow
          label="ŷ"
          formula={`σ(${fmt(outputZ, 3)})`}
          value={fmtPlain(outputA)}
          color={COLORS.green}
        />
        <div style={{
          marginTop: 6,
          padding: '6px 8px',
          background: Math.abs(outputA - target) < 0.2
            ? 'rgba(16,185,129,0.1)'
            : 'rgba(239,68,68,0.1)',
          borderRadius: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: COLORS.textMuted, fontSize: 10 }}>vs target {target}</span>
          <span style={{
            color: Math.abs(outputA - target) < 0.2 ? COLORS.green : COLORS.crimson,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
          }}>
            |error| = {Math.abs(outputA - target).toFixed(4)}
          </span>
        </div>
      </LayerBlock>

      <ArrowDown label="compute loss" />

      {/* Loss */}
      <LayerBlock title="⑥ Loss — Binary Cross-Entropy" color={COLORS.crimson}>
        <FormulaRow
          label="L"
          formula={`−[y·log(ŷ) + (1−y)·log(1−ŷ)]`}
          value={fmtPlain(loss)}
          color={COLORS.crimson}
        />
        <div style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 4, fontFamily: "'Inter', sans-serif" }}>
          = −[{target}·log({fmtPlain(outputA, 4)}) + {1 - target}·log({fmtPlain(1 - outputA, 4)})]
        </div>
      </LayerBlock>
    </div>
  )
}
