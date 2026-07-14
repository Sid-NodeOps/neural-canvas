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

function Code({ children }) {
  return (
    <code style={{
      background: 'rgba(167,139,250,0.1)',
      border: `1px solid rgba(167,139,250,0.2)`,
      borderRadius: 3,
      padding: '1px 5px',
      color: COLORS.purple,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
    }}>
      {children}
    </code>
  )
}

function CodeBlock({ children }) {
  return (
    <pre style={{
      background: 'rgba(10,15,30,0.8)',
      border: `1px solid ${COLORS.border}`,
      borderRadius: 6,
      padding: '10px 12px',
      color: COLORS.purple,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      overflowX: 'auto',
      lineHeight: 1.7,
      margin: '8px 0',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    }}>
      {children}
    </pre>
  )
}

function Section({ icon, title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{
      background: 'rgba(10,15,30,0.4)',
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      marginBottom: 8,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ color: COLORS.textPrimary, fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", flex: 1 }}>
          {title}
        </span>
        <span style={{ color: COLORS.textMuted, fontSize: 12 }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 12px 12px 12px', fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Highlight({ children, color = COLORS.cyan }) {
  return <span style={{ color, fontWeight: 600 }}>{children}</span>
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', margin: '8px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '6px 8px',
                background: 'rgba(30,45,64,0.6)',
                color: COLORS.textPrimary,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                borderBottom: `1px solid ${COLORS.border}`,
                textAlign: 'left',
                fontSize: 11,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(30,45,64,0.2)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '5px 8px',
                  color: j === 0 ? COLORS.amber : COLORS.textMuted,
                  fontFamily: j === 0 ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
                  borderBottom: `1px solid rgba(30,45,64,0.4)`,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// SVG Sparkline for activation functions
function ActivationSparkline({ fn, color, xRange = [-3, 3], yRange = [-1.2, 1.2] }) {
  const W = 120, H = 50
  const pts = []
  const steps = 60
  for (let i = 0; i <= steps; i++) {
    const x = xRange[0] + (xRange[1] - xRange[0]) * (i / steps)
    const y = fn(x)
    const px = ((x - xRange[0]) / (xRange[1] - xRange[0])) * W
    const py = H - ((y - yRange[0]) / (yRange[1] - yRange[0])) * H
    pts.push(`${px},${py}`)
  }
  const d = 'M ' + pts.join(' L ')

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <rect width={W} height={H} fill="rgba(10,15,30,0.6)" rx="4" />
      {/* Axes */}
      <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke={COLORS.border} strokeWidth={0.5} />
      <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={COLORS.border} strokeWidth={0.5} />
      {/* Curve */}
      <path d={d} stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function ActivationCard({ name, formula, range, desc, fn, color, pros, cons }) {
  return (
    <div style={{
      background: 'rgba(10,15,30,0.5)',
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: '10px',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ color: COLORS.textPrimary, fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{name}</div>
          <Code>{formula}</Code>
          <div style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 4 }}>Range: {range}</div>
        </div>
        <ActivationSparkline fn={fn} color={color} />
      </div>
      <div style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 6 }}>{desc}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: COLORS.green, fontSize: 10, fontWeight: 600, marginBottom: 2 }}>✓ Pros</div>
          <div style={{ color: COLORS.textMuted, fontSize: 10, lineHeight: 1.5 }}>{pros}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: COLORS.crimson, fontSize: 10, fontWeight: 600, marginBottom: 2 }}>✗ Cons</div>
          <div style={{ color: COLORS.textMuted, fontSize: 10, lineHeight: 1.5 }}>{cons}</div>
        </div>
      </div>
    </div>
  )
}

// ---- Tab content components ----

function LayersTab() {
  return (
    <div>
      <Section icon="🧠" title="What is a Neuron?">
        <p style={{ marginBottom: 8 }}>
          A neuron receives multiple inputs, multiplies each by a{' '}
          <Highlight color={COLORS.amber}>weight</Highlight> (its "importance"), adds a{' '}
          <Highlight color={COLORS.cyan}>bias</Highlight> (threshold), then passes the result through an{' '}
          <Highlight color={COLORS.green}>activation function</Highlight>.
          Think of it like a weighted vote — each input has a say, and the bias shifts the decision boundary.
        </p>
        <CodeBlock>
          {`z = w₁·x₁ + w₂·x₂ + ... + wₙ·xₙ + b\na = σ(z)  ← activation function`}
        </CodeBlock>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 8,
          padding: '8px',
          background: 'rgba(0,212,255,0.05)',
          borderRadius: 6,
          border: `1px solid rgba(0,212,255,0.1)`,
          flexWrap: 'wrap',
        }}>
          {['x₁,x₂', '×W', '+b', '→σ(z)', '→output'].map((s, i, arr) => (
            <React.Fragment key={i}>
              <span style={{
                background: i === 3 ? 'rgba(0,212,255,0.15)' : 'rgba(30,45,64,0.8)',
                border: `1px solid ${i === 3 ? COLORS.cyan : COLORS.border}`,
                borderRadius: 4,
                padding: '3px 8px',
                color: i === 3 ? COLORS.cyan : COLORS.textMuted,
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{s}</span>
              {i < arr.length - 1 && <span style={{ color: COLORS.border }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </Section>

      <Section icon="📚" title="Layer Types">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { name: 'Input Layer', color: '#6366f1', desc: 'Raw features. No computation. Just passes data forward.' },
            { name: 'Hidden Layer (Dense)', color: COLORS.cyan, desc: 'Learns internal representations. Every neuron connects to every neuron in the next layer. The "thinking" happens here.' },
            { name: 'Output Layer', color: COLORS.green, desc: 'Produces prediction. Binary classification → 1 neuron + sigmoid. Multi-class → N neurons + softmax.' },
            { name: 'Convolutional (CNN)', color: COLORS.amber, desc: 'Shares weights across positions. Excellent for spatial data like images. Learns local patterns.' },
            { name: 'Recurrent (RNN/LSTM)', color: COLORS.crimson, desc: 'Has memory — loops back. Processes sequences (text, time series). LSTM solves vanishing gradients.' },
            { name: 'Attention / Transformer', color: COLORS.purple, desc: 'Learns to focus on relevant parts. Foundation of LLMs (GPT, BERT). O(n²) but incredibly powerful.' },
          ].map(l => (
            <div key={l.name} style={{
              display: 'flex',
              gap: 8,
              padding: '6px 8px',
              background: 'rgba(10,15,30,0.4)',
              borderRadius: 6,
              border: `1px solid ${l.color}22`,
              borderLeft: `3px solid ${l.color}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: l.color, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{l.name}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{l.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="📐" title="This Network's Architecture">
        <p style={{ marginBottom: 8 }}>
          You're looking at: <Code>Input(2) → Dense(3, sigmoid) → Dense(1, sigmoid)</Code>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '12px 0', flexWrap: 'wrap' }}>
          {[
            { label: 'Input', shape: '(2,)', color: '#6366f1', neurons: 2 },
            { label: 'Hidden', shape: '(3,)', color: COLORS.cyan, neurons: 3 },
            { label: 'Output', shape: '(1,)', color: COLORS.green, neurons: 1 },
          ].map((l, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                  {Array.from({ length: l.neurons }).map((_, n) => (
                    <div key={n} style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: `${l.color}33`,
                      border: `1.5px solid ${l.color}`,
                    }} />
                  ))}
                </div>
                <div style={{ color: l.color, fontSize: 10, fontWeight: 600 }}>{l.label}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>{l.shape}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ color: COLORS.textMuted, fontSize: 16, marginBottom: 12 }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4 }}>
          Total parameters: <Highlight color={COLORS.amber}>2×3 + 3 + 3×1 + 1 = 13 parameters</Highlight>
        </div>
      </Section>
    </div>
  )
}

function BackpropTab() {
  return (
    <div>
      <Section icon="🔄" title="What is Backpropagation?">
        <p>
          Backpropagation is the algorithm for computing how much each weight <Highlight>contributed to the error</Highlight>.
          It works by applying the <Highlight color={COLORS.amber}>chain rule of calculus</Highlight> backward
          through the network — from output to input.
        </p>
        <p style={{ marginTop: 8 }}>
          Without backprop, we'd have no way to know which of the 13 parameters caused the error and
          by how much. Backprop gives us exact gradients for every parameter in one efficient pass.
        </p>
      </Section>

      <Section icon="⛓️" title="The Chain Rule">
        <p style={{ marginBottom: 8 }}>
          If <Code>L</Code> depends on <Code>z</Code>, and <Code>z</Code> depends on <Code>w</Code>, then:
        </p>
        <CodeBlock>∂L/∂w = (∂L/∂z) · (∂z/∂w)</CodeBlock>
        <p style={{ marginTop: 8 }}>
          This lets us decompose complex derivatives into simple products.
          For a deep network: <Code>∂L/∂w = ∂L/∂aₙ · ∂aₙ/∂zₙ · ∂zₙ/∂aₙ₋₁ · ... · ∂z₁/∂w</Code>
        </p>
        <div style={{
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          marginTop: 10,
          padding: '8px',
          background: 'rgba(239,68,68,0.05)',
          borderRadius: 6,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {['L', '← ∂L/∂ŷ', 'ŷ', '← ∂ŷ/∂z', 'z', '← ∂z/∂w', 'w'].map((s, i) => (
            <span key={i} style={{
              color: i % 2 === 0 ? COLORS.textPrimary : COLORS.crimson,
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{s}</span>
          ))}
        </div>
      </Section>

      <Section icon="🔢" title="Step-by-Step Algorithm">
        {[
          { n: 1, title: 'Forward Pass', desc: 'Compute all activations from input to output, storing intermediate values (z and a for each layer).' },
          { n: 2, title: 'Compute Loss', desc: 'At output, compute L = BCE(target, prediction). This is the scalar we\'re minimizing.' },
          { n: 3, title: 'Output gradient ∂L/∂z_out', desc: 'For sigmoid + BCE: ∂L/∂z = ŷ − y (elegantly simple!)' },
          { n: 4, title: 'Layer 2 weight gradients', desc: '∂L/∂W₂ = ∂L/∂z_out · a_hidden. One multiplication per weight.' },
          { n: 5, title: 'Propagate to hidden layer', desc: '∂L/∂a_hidden = ∂L/∂z_out · W₂ (broadcast gradient back through weights)' },
          { n: 6, title: 'Apply activation derivative', desc: '∂L/∂z_hidden = ∂L/∂a_hidden · σ\'(z_hidden) = _ · a(1-a)' },
          { n: 7, title: 'Layer 1 weight gradients', desc: '∂L/∂W₁ = ∂L/∂z_hidden · x (outer product)' },
          { n: 8, title: 'Update all weights', desc: 'W = W − α·∂L/∂W for every parameter simultaneously.' },
        ].map(s => (
          <div key={s.n} style={{
            display: 'flex',
            gap: 8,
            marginBottom: 6,
            padding: '6px 8px',
            background: 'rgba(10,15,30,0.4)',
            borderRadius: 6,
          }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              background: 'rgba(239,68,68,0.2)',
              color: COLORS.crimson,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              flexShrink: 0,
            }}>{s.n}</div>
            <div>
              <div style={{ color: COLORS.textPrimary, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{s.title}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </Section>

      <Section icon="💡" title="Why It Works">
        <p>
          The gradient points in the direction of <Highlight color={COLORS.crimson}>steepest increase</Highlight> of
          the loss. By moving in the <Highlight color={COLORS.green}>opposite direction</Highlight>, we reduce the loss.
        </p>
        <p style={{ marginTop: 8 }}>
          The beauty of backprop: it's just calculus applied systematically. Every computation we did
          in the forward pass has a corresponding derivative. Backprop collects them in the right order.
        </p>
        <CodeBlock>
          {`Intuition:\nLoss is high → ∂L/∂w > 0 → w decreases → loss drops\nLoss is high → ∂L/∂w < 0 → w increases → loss drops`}
        </CodeBlock>
      </Section>
    </div>
  )
}

function GradientDescentTab() {
  return (
    <div>
      <Section icon="📉" title="The Loss Surface">
        <p>
          Imagine the loss as a <Highlight>hilly landscape</Highlight> in high-dimensional weight space.
          We want to find the lowest valley. Gradient descent rolls a ball downhill by repeatedly
          moving in the direction of steepest descent.
        </p>
        <p style={{ marginTop: 8 }}>
          For 13 parameters, the loss surface lives in 14D space (13 weights + 1 loss axis).
          We can't visualize it, but the math works the same.
        </p>
      </Section>

      <Section icon="🔢" title="The Update Rule">
        <div style={{
          background: 'rgba(0,212,255,0.06)',
          border: `1px solid rgba(0,212,255,0.2)`,
          borderRadius: 8,
          padding: '12px 16px',
          textAlign: 'center',
          margin: '8px 0',
        }}>
          <div style={{
            color: COLORS.cyan,
            fontSize: 16,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
          }}>
            W_new = W_old − α · ∂L/∂W
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {[
            { label: 'α too large', desc: 'Overshoots the minimum, diverges, loss explodes', color: COLORS.crimson },
            { label: 'α too small', desc: 'Very slow convergence, may get stuck in plateaus', color: COLORS.amber },
            { label: 'α just right', desc: 'Smooth convergence to a minimum', color: COLORS.green },
          ].map(c => (
            <div key={c.label} style={{
              flex: 1, minWidth: 80,
              background: 'rgba(10,15,30,0.4)',
              border: `1px solid ${c.color}44`,
              borderRadius: 6,
              padding: '6px 8px',
            }}>
              <div style={{ color: c.color, fontSize: 10, fontWeight: 600, marginBottom: 2 }}>{c.label}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 10 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="🌊" title="Types of Gradient Descent">
        <Table
          headers={['Type', 'Batch Size', 'Speed', 'Noise', 'Memory']}
          rows={[
            ['BGD (Batch)', 'Full dataset', 'Slow', 'Stable', 'High'],
            ['SGD (Stochastic)', '1 sample', 'Fast', 'Noisy', 'Low'],
            ['Mini-batch', 'n samples', 'Balanced', 'Moderate', 'Medium'],
          ]}
        />
        <p style={{ marginTop: 8 }}>
          In practice, <Highlight color={COLORS.amber}>mini-batch SGD</Highlight> (batch size 32–256) is
          used for deep learning. Noise from small batches can actually help escape local minima.
        </p>
      </Section>

      <Section icon="⚠️" title="Common Problems">
        {[
          { icon: '🌫️', name: 'Vanishing Gradients', desc: 'Gradients become near-zero in early layers. Weights don\'t update. Sigmoid & tanh suffer this in deep nets. Solution: ReLU, batch norm, residual connections.' },
          { icon: '💥', name: 'Exploding Gradients', desc: 'Gradients grow exponentially through layers. Weights blow up to NaN. Solution: gradient clipping, careful initialization.' },
          { icon: '🕳️', name: 'Local Minima', desc: 'Gradient hits 0 in a valley that isn\'t global minimum. Less common in high-dim than expected — most local minima have similar loss values.' },
          { icon: '🏜️', name: 'Saddle Points', desc: 'Gradient is 0 but it\'s not a minimum (some dimensions go up, others go down). More common than local minima in deep nets.' },
          { icon: '📦', name: 'Plateaus', desc: 'Flat regions where gradient is near-zero for extended regions. Training stalls. Momentum and adaptive methods help escape.' },
        ].map(p => (
          <div key={p.name} style={{
            display: 'flex',
            gap: 8,
            marginBottom: 6,
            padding: '6px 8px',
            background: 'rgba(239,68,68,0.05)',
            borderRadius: 6,
            border: `1px solid rgba(239,68,68,0.1)`,
          }}>
            <span style={{ fontSize: 16 }}>{p.icon}</span>
            <div>
              <div style={{ color: COLORS.crimson, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </Section>
    </div>
  )
}

function OptimizersTab() {
  return (
    <div>
      <Section icon="🚀" title="SGD — Stochastic Gradient Descent">
        <p style={{ marginBottom: 8 }}>The simplest optimizer. Subtract gradient scaled by learning rate.</p>
        <CodeBlock>W_{`t+1`} = W_t − α · ∇L(W_t)</CodeBlock>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <div style={{ color: COLORS.green, fontSize: 10, background: 'rgba(16,185,129,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(16,185,129,0.2)` }}>✓ Simple</div>
          <div style={{ color: COLORS.green, fontSize: 10, background: 'rgba(16,185,129,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(16,185,129,0.2)` }}>✓ Good generalization</div>
          <div style={{ color: COLORS.crimson, fontSize: 10, background: 'rgba(239,68,68,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(239,68,68,0.2)` }}>✗ Slow convergence</div>
          <div style={{ color: COLORS.crimson, fontSize: 10, background: 'rgba(239,68,68,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(239,68,68,0.2)` }}>✗ Sensitive to LR</div>
        </div>
      </Section>

      <Section icon="💨" title="SGD + Momentum">
        <p style={{ marginBottom: 8 }}>
          Adds "velocity" — accumulates past gradients. Like a ball rolling downhill that builds speed.
          Rolls through small bumps and oscillations.
        </p>
        <CodeBlock>
          {`v_t = β·v_{t-1} + (1-β)·g_t\nW_{t+1} = W_t − α·v_t\n\nβ = 0.9 (typical)`}
        </CodeBlock>
        <p style={{ marginTop: 8, fontSize: 11 }}>
          β controls how much past gradients influence current update.
          High β = more momentum, faster in consistent directions.
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <div style={{ color: COLORS.green, fontSize: 10, background: 'rgba(16,185,129,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(16,185,129,0.2)` }}>✓ Faster convergence</div>
          <div style={{ color: COLORS.green, fontSize: 10, background: 'rgba(16,185,129,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(16,185,129,0.2)` }}>✓ Escapes plateaus</div>
          <div style={{ color: COLORS.crimson, fontSize: 10, background: 'rgba(239,68,68,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(239,68,68,0.2)` }}>✗ Can overshoot</div>
        </div>
      </Section>

      <Section icon="🧮" title="Adam — Adaptive Moment Estimation">
        <p style={{ marginBottom: 8 }}>
          Combines momentum + <Highlight color={COLORS.amber}>adaptive per-parameter learning rates</Highlight>.
          The most popular optimizer for deep learning.
        </p>
        <CodeBlock>
          {`m_t = β₁·m_{t-1} + (1-β₁)·g_t      // 1st moment (mean)\nv_t = β₂·v_{t-1} + (1-β₂)·g_t²     // 2nd moment (variance)\nm̂_t = m_t / (1-β₁ᵗ)                // bias-corrected mean\nv̂_t = v_t / (1-β₂ᵗ)                // bias-corrected variance\nW = W − α · m̂_t / (√v̂_t + ε)\n\nDefaults: β₁=0.9, β₂=0.999, ε=1e-8`}
        </CodeBlock>
        <p style={{ marginTop: 8, fontSize: 11 }}>
          The <Code>√v̂_t</Code> term normalizes by gradient magnitude — parameters with large
          gradients get smaller updates and vice versa.
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <div style={{ color: COLORS.green, fontSize: 10, background: 'rgba(16,185,129,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(16,185,129,0.2)` }}>✓ Works with default LR</div>
          <div style={{ color: COLORS.green, fontSize: 10, background: 'rgba(16,185,129,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(16,185,129,0.2)` }}>✓ Adapts per-weight</div>
          <div style={{ color: COLORS.green, fontSize: 10, background: 'rgba(16,185,129,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(16,185,129,0.2)` }}>✓ Handles sparse gradients</div>
          <div style={{ color: COLORS.crimson, fontSize: 10, background: 'rgba(239,68,68,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(239,68,68,0.2)` }}>✗ May generalize worse</div>
          <div style={{ color: COLORS.crimson, fontSize: 10, background: 'rgba(239,68,68,0.08)', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(239,68,68,0.2)` }}>✗ More memory</div>
        </div>
      </Section>

      <Section icon="📊" title="Optimizer Comparison">
        <Table
          headers={['Optimizer', 'Best For', 'Default LR', 'Memory']}
          rows={[
            ['SGD', 'CV + tuned schedules', '0.01–0.1', 'Low'],
            ['Momentum', 'Convex + well-tuned', '0.01–0.1', 'Low'],
            ['Adam', 'Most DL tasks', '1e-3', 'Medium'],
            ['AdamW', 'LLMs, transformers', '1e-4', 'Medium'],
            ['RMSProp', 'RNNs, RL', '1e-3', 'Medium'],
          ]}
        />
      </Section>
    </div>
  )
}

function ActivationsTab() {
  const sigmoid = x => 1 / (1 + Math.exp(-x))
  const tanh = x => Math.tanh(x)
  const relu = x => Math.max(0, x)
  const leakyRelu = x => x >= 0 ? x : 0.01 * x
  const elu = x => x >= 0 ? x : Math.exp(x) - 1
  const swish = x => x * sigmoid(x)

  return (
    <div>
      <p style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 12 }}>
        Activation functions introduce <Highlight>non-linearity</Highlight> — without them,
        stacking layers would just be one big linear transformation (useless for XOR!).
      </p>

      <ActivationCard
        name="Sigmoid σ(z)"
        formula="1 / (1 + e⁻ᶻ)"
        range="(0, 1)"
        desc="Squashes input to (0,1). Used in this simulator's output for binary probability."
        fn={sigmoid}
        color={COLORS.cyan}
        pros="Smooth gradient, interpretable as probability"
        cons="Vanishing gradients for |z| > 3, outputs not zero-centered"
      />

      <ActivationCard
        name="Tanh"
        formula="(eᶻ - e⁻ᶻ) / (eᶻ + e⁻ᶻ)"
        range="(-1, 1)"
        desc="Zero-centered version of sigmoid. Better for hidden layers."
        fn={tanh}
        color="#38bdf8"
        pros="Zero-centered, stronger gradients than sigmoid"
        cons="Still vanishes for large |z|"
      />

      <ActivationCard
        name="ReLU"
        formula="max(0, z)"
        range="[0, ∞)"
        desc="Most popular activation. Fast and sparse. Backbone of modern deep nets."
        fn={relu}
        color={COLORS.green}
        pros="No vanishing gradient for z>0, sparse activations, very fast"
        cons="Dying ReLU: neurons stuck at 0 with negative inputs"
      />

      <ActivationCard
        name="Leaky ReLU"
        formula="z ≥ 0 ? z : 0.01z"
        range="(-∞, ∞)"
        desc="Fixes dying ReLU by allowing small negative slope (α=0.01)."
        fn={leakyRelu}
        color={COLORS.amber}
        pros="Prevents dying ReLU, no saturation"
        cons="α is a hyperparameter, not always better than ReLU"
      />

      <ActivationCard
        name="ELU (Exponential Linear Unit)"
        formula="z ≥ 0 ? z : eᶻ-1"
        range="(-1, ∞)"
        desc="Smooth negative saturation. Mean activations closer to zero."
        fn={elu}
        color={COLORS.purple}
        pros="Smooth, zero-mean activations, robust to noise"
        cons="More expensive to compute than ReLU"
      />

      <ActivationCard
        name="Swish / SiLU"
        formula="z · σ(z)"
        range="(-∞, ∞)"
        desc="Self-gated. Used in modern architectures (EfficientNet, GPT). Often outperforms ReLU."
        fn={swish}
        color="#f472b6"
        pros="Smooth, non-monotonic, better than ReLU at scale"
        cons="More expensive, not interpretable"
      />

      <Section icon="🎯" title="How to Choose">
        {[
          { layer: 'Hidden layers (shallow)', rec: 'Sigmoid, Tanh', note: 'Works fine for 1-2 layers' },
          { layer: 'Hidden layers (deep)', rec: 'ReLU, Leaky ReLU', note: 'Avoids vanishing gradients' },
          { layer: 'Hidden layers (state-of-art)', rec: 'Swish / GELU', note: 'Modern architectures' },
          { layer: 'Binary output', rec: 'Sigmoid', note: 'P(y=1) interpretation' },
          { layer: 'Multi-class output', rec: 'Softmax', note: 'Probability distribution' },
          { layer: 'Regression output', rec: 'Linear (none)', note: 'Unbounded output needed' },
        ].map(r => (
          <div key={r.layer} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '5px 8px',
            borderBottom: `1px solid rgba(30,45,64,0.4)`,
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <span style={{ color: COLORS.textMuted, fontSize: 11, flex: 1 }}>{r.layer}</span>
            <span style={{ color: COLORS.cyan, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", flex: 1 }}>{r.rec}</span>
            <span style={{ color: COLORS.textMuted, fontSize: 10, flex: 1, opacity: 0.7 }}>{r.note}</span>
          </div>
        ))}
      </Section>
    </div>
  )
}

const TABS = [
  { id: 'layers', label: 'Layers', icon: '🧠' },
  { id: 'backprop', label: 'Backprop', icon: '🔄' },
  { id: 'gradient', label: 'Grad Descent', icon: '📉' },
  { id: 'optimizers', label: 'Optimizers', icon: '🚀' },
  { id: 'activations', label: 'Activations', icon: '⚡' },
]

export default function TheoryPanel() {
  const [activeTab, setActiveTab] = useState('layers')

  return (
    <div style={{
      background: 'rgba(17,24,39,0.8)',
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      backdropFilter: 'blur(12px)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Tab header */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${COLORS.border}`,
        overflowX: 'auto',
        flexShrink: 0,
        padding: '0 4px',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? COLORS.cyan : 'transparent'}`,
              padding: '10px 10px 8px',
              color: activeTab === tab.id ? COLORS.cyan : COLORS.textMuted,
              fontSize: 11,
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 13 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
      }}>
        {activeTab === 'layers' && <LayersTab />}
        {activeTab === 'backprop' && <BackpropTab />}
        {activeTab === 'gradient' && <GradientDescentTab />}
        {activeTab === 'optimizers' && <OptimizersTab />}
        {activeTab === 'activations' && <ActivationsTab />}
      </div>
    </div>
  )
}
