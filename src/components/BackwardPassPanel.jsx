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
  const s = v >= 0 ? '+' : ''
  return s + v.toFixed(digits)
}

function fmtPlain(v, digits = 4) {
  if (v === undefined || v === null || isNaN(v)) return '–'
  return v.toFixed(digits)
}

function ArrowUp({ label }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4px 0',
      gap: 2,
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20">
        <line x1="10" y1="18" x2="10" y2="6" stroke={COLORS.crimson} strokeWidth="1.5" opacity="0.6" />
        <path d="M5,9 L10,4 L15,9" stroke={COLORS.crimson} strokeWidth="1.5" fill="none" opacity="0.6" />
      </svg>
      <div style={{ color: COLORS.textMuted, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
    </div>
  )
}

function GradientBar({ value }) {
  const maxAbs = 2
  const clamped = Math.min(Math.abs(value || 0), maxAbs) / maxAbs
  const isPositive = (value || 0) >= 0
  return (
    <div style={{
      height: 3,
      background: COLORS.border,
      borderRadius: 2,
      overflow: 'hidden',
      marginTop: 3,
    }}>
      <div style={{
        height: '100%',
        width: `${clamped * 100}%`,
        background: isPositive ? COLORS.crimson : COLORS.cyan,
        borderRadius: 2,
        transition: 'width 0.2s ease',
        marginLeft: isPositive ? 0 : 'auto',
      }} />
    </div>
  )
}

function GradRow({ label, formula, value }) {
  return (
    <div style={{
      marginBottom: 8,
      padding: '6px 8px',
      background: 'rgba(10,15,30,0.4)',
      borderRadius: 6,
      border: `1px solid rgba(239,68,68,0.12)`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
        <div>
          <span style={{ color: COLORS.textMuted, fontSize: 10, fontFamily: "'Inter', sans-serif" }}>{label}</span>
          <div style={{ color: COLORS.purple, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", opacity: 0.8, marginTop: 1 }}>
            {formula}
          </div>
        </div>
        <span style={{
          color: COLORS.amber,
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          minWidth: 70,
          textAlign: 'right',
        }}>
          {fmt(value)}
        </span>
      </div>
      <GradientBar value={value} />
    </div>
  )
}

function SectionTitle({ children, step }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
      paddingBottom: 6,
      borderBottom: `1px solid rgba(239,68,68,0.2)`,
    }}>
      <div style={{
        background: 'rgba(239,68,68,0.2)',
        color: COLORS.crimson,
        width: 20,
        height: 20,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        flexShrink: 0,
      }}>
        {step}
      </div>
      <span style={{
        color: COLORS.textPrimary,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
      }}>
        {children}
      </span>
    </div>
  )
}

function Block({ step, title, children }) {
  return (
    <div style={{
      background: 'rgba(10,15,30,0.5)',
      border: `1px solid rgba(239,68,68,0.15)`,
      borderLeft: `3px solid ${COLORS.crimson}`,
      borderRadius: 8,
      padding: '10px 12px',
    }}>
      <SectionTitle step={step}>{title}</SectionTitle>
      {children}
    </div>
  )
}

export default function BackwardPassPanel({ state }) {
  const {
    input = [0, 0],
    hiddenZ = [0, 0, 0],
    hiddenA = [0, 0, 0],
    outputA = 0,
    target = 0,
    loss = 0,
    dL_dOutputA = 0,
    dL_dOutputZ = 0,
    dL_dWeights2 = [0, 0, 0],
    dL_dBias2 = [0],
    dL_dHiddenA = [0, 0, 0],
    dL_dHiddenZ = [0, 0, 0],
    dL_dWeights1 = [[0,0,0],[0,0,0]],
    dL_dBias1 = [0, 0, 0],
  } = state

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      height: '100%',
      overflowY: 'auto',
      padding: '2px',
    }}>
      {/* Header info */}
      <div style={{
        background: 'rgba(239,68,68,0.06)',
        border: `1px solid rgba(239,68,68,0.2)`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 10,
        color: COLORS.textMuted,
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1.6,
      }}>
        Backprop propagates gradients <span style={{ color: COLORS.crimson }}>backward</span> through the network
        using the chain rule: <span style={{ color: COLORS.purple, fontFamily: "'JetBrains Mono', monospace" }}>∂L/∂w = ∂L/∂z · ∂z/∂w</span>
      </div>

      {/* Step 1: Output gradient */}
      <Block step="①" title="Output Gradient — ∂L/∂ŷ and ∂L/∂z">
        <GradRow
          label="∂L/∂ŷ"
          formula="-y/(ŷ+ε) + (1-y)/(1-ŷ+ε)"
          value={dL_dOutputA}
        />
        <GradRow
          label="∂L/∂z_out"
          formula="ŷ - y  [BCE+sigmoid simplification]"
          value={dL_dOutputZ}
        />
        <div style={{
          fontSize: 9,
          color: COLORS.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
          marginTop: 2,
        }}>
          ŷ = {fmtPlain(outputA, 4)}, y = {target},  ŷ−y = {fmt(dL_dOutputZ, 4)}
        </div>
      </Block>

      <ArrowUp label="chain rule ↑" />

      {/* Step 2: Layer 2 weight gradients */}
      <Block step="②" title="Layer 2 Weight Gradients — ∂L/∂W₂">
        {[0, 1, 2].map(j => (
          <GradRow
            key={j}
            label={`∂L/∂w${j+1}`}
            formula={`∂L/∂z_out · a${j+1} = ${fmt(dL_dOutputZ, 3)} · ${fmtPlain(hiddenA[j], 3)}`}
            value={dL_dWeights2[j]}
          />
        ))}
        <GradRow
          label="∂L/∂b₂"
          formula="∂L/∂z_out · 1"
          value={dL_dBias2[0]}
        />
      </Block>

      <ArrowUp label="propagate to hidden ↑" />

      {/* Step 3: Hidden activation gradients */}
      <Block step="③" title="Hidden Activation Gradients — ∂L/∂A">
        {[0, 1, 2].map(j => (
          <GradRow
            key={j}
            label={`∂L/∂a${j+1}`}
            formula={`∂L/∂z_out · w${j+1}`}
            value={dL_dHiddenA[j]}
          />
        ))}
      </Block>

      <ArrowUp label="through σ'(z) ↑" />

      {/* Step 4: Hidden pre-activation gradients */}
      <Block step="④" title="Hidden Pre-activation Gradients — ∂L/∂Z">
        {[0, 1, 2].map(j => {
          const sigPrime = hiddenA[j] * (1 - hiddenA[j])
          return (
            <GradRow
              key={j}
              label={`∂L/∂z${j+1}`}
              formula={`∂L/∂a${j+1} · σ'(z${j+1}) = _ · ${fmtPlain(sigPrime, 4)}`}
              value={dL_dHiddenZ[j]}
            />
          )
        })}
        <div style={{ fontSize: 9, color: COLORS.textMuted, fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
          σ'(z) = σ(z)·(1−σ(z)) = aₙ·(1−aₙ)
        </div>
      </Block>

      <ArrowUp label="to weight gradients ↑" />

      {/* Step 5: Layer 1 weight gradients */}
      <Block step="⑤" title="Layer 1 Weight Gradients — ∂L/∂W₁">
        {[0, 1].map(i =>
          [0, 1, 2].map(j => (
            <GradRow
              key={`${i}-${j}`}
              label={`∂L/∂w${i+1}${j+1}`}
              formula={`∂L/∂z${j+1} · x${i+1} = ${fmt(dL_dHiddenZ[j], 3)} · ${fmtPlain(input[i], 1)}`}
              value={dL_dWeights1[i][j]}
            />
          ))
        )}
        {[0, 1, 2].map(j => (
          <GradRow
            key={`b1-${j}`}
            label={`∂L/∂b${j+1}`}
            formula={`∂L/∂z${j+1} · 1`}
            value={dL_dBias1[j]}
          />
        ))}
      </Block>

      {/* Summary */}
      <div style={{
        background: 'rgba(16,185,129,0.06)',
        border: `1px solid rgba(16,185,129,0.2)`,
        borderRadius: 8,
        padding: '8px 12px',
      }}>
        <div style={{ color: COLORS.green, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>Update Rule</div>
        <div style={{ color: COLORS.purple, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          W_new = W_old − α · ∂L/∂W
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 9, marginTop: 4 }}>
          Subtract gradient × learning rate from each weight
        </div>
      </div>
    </div>
  )
}
