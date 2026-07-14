import React, { useRef, useEffect, useState } from 'react'

const COLORS = {
  cyan: '#00d4ff',
  crimson: '#ef4444',
  amber: '#f59e0b',
  green: '#10b981',
  surface: '#111827',
  border: '#1e2d40',
  textPrimary: '#f1f5f9',
  textMuted: '#64748b',
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function nodeGlow(activation) {
  const intensity = Math.max(0, Math.min(1, activation))
  return `rgba(0, 212, 255, ${lerp(0.1, 1, intensity)})`
}

export default function NetworkViz({ state }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 })
  const containerRef = useRef(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 400)
    return () => clearTimeout(t)
  }, [state.outputA, state.hiddenA])

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width } = e.contentRect
        setDimensions({ width: Math.max(300, width), height: Math.max(240, Math.min(340, width * 0.5)) })
      }
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const { width, height } = dimensions
  const padX = 60
  const padY = 30
  const usableW = width - padX * 2
  const usableH = height - padY * 2

  // Layer x positions
  const layerX = [
    padX,
    padX + usableW * 0.42,
    padX + usableW,
  ]

  // Node y positions
  const inputY = [
    padY + usableH * 0.25,
    padY + usableH * 0.75,
  ]
  const hiddenY = [
    padY + usableH * 0.1,
    padY + usableH * 0.5,
    padY + usableH * 0.9,
  ]
  const outputY = [padY + usableH * 0.5]

  const nodeR = Math.max(18, Math.min(26, width / 24))
  const fontSize = Math.max(9, Math.min(12, width / 55))

  const inputValues = state.input || [0, 0]
  const hiddenAValues = state.hiddenA || [0, 0, 0]
  const outputAValue = state.outputA || 0

  // Build connections
  const connections1 = []
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 3; j++) {
      const w = state.weights1[i][j]
      const absW = Math.abs(w)
      const clampedW = Math.min(absW, 3) / 3
      connections1.push({
        x1: layerX[0], y1: inputY[i],
        x2: layerX[1], y2: hiddenY[j],
        weight: w,
        absW: clampedW,
        color: w >= 0 ? COLORS.cyan : COLORS.crimson,
        grad: state.dL_dWeights1 ? state.dL_dWeights1[i][j] : 0,
        label: `w${i + 1}${j + 1} = ${w.toFixed(3)}`,
      })
    }
  }

  const connections2 = []
  for (let j = 0; j < 3; j++) {
    const w = state.weights2[j][0]
    const absW = Math.abs(w)
    const clampedW = Math.min(absW, 3) / 3
    connections2.push({
      x1: layerX[1], y1: hiddenY[j],
      x2: layerX[2], y2: outputY[0],
      weight: w,
      absW: clampedW,
      color: w >= 0 ? COLORS.cyan : COLORS.crimson,
      grad: state.dL_dWeights2 ? state.dL_dWeights2[j] : 0,
      label: `w${j + 1} = ${w.toFixed(3)}`,
    })
  }

  const allConnections = [...connections1, ...connections2]

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        background: 'rgba(17,24,39,0.6)',
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        padding: '8px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', maxWidth: '100%' }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <radialGradient id="nodeGradCyan" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a3d5c" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="nodeGradInput" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="nodeGradOutput" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#052e16" stopOpacity="1" />
          </radialGradient>
          <filter id="glowCyan">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowStrong">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="arrowCyan" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={COLORS.cyan} opacity="0.6" />
          </marker>
          <marker id="arrowCrimson" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={COLORS.crimson} opacity="0.6" />
          </marker>
        </defs>

        {/* Layer labels */}
        {[
          { x: layerX[0], label: 'INPUT', sublabel: '2 neurons' },
          { x: layerX[1], label: 'HIDDEN', sublabel: '3 neurons · sigmoid' },
          { x: layerX[2], label: 'OUTPUT', sublabel: '1 neuron · sigmoid' },
        ].map((l, i) => (
          <g key={i}>
            <text
              x={l.x}
              y={8}
              textAnchor="middle"
              fill={COLORS.textMuted}
              fontSize={fontSize - 1}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="700"
              letterSpacing="1"
            >
              {l.label}
            </text>
            <text
              x={l.x}
              y={20}
              textAnchor="middle"
              fill={COLORS.textMuted}
              fontSize={fontSize - 2}
              fontFamily="'Inter', sans-serif"
              opacity="0.6"
            >
              {l.sublabel}
            </text>
          </g>
        ))}

        {/* Connections layer 1→2 */}
        {connections1.map((c, idx) => {
          const opacity = lerp(0.08, 0.75, c.absW)
          const strokeW = lerp(0.5, 3.5, c.absW)
          return (
            <g key={`c1-${idx}`}>
              <line
                x1={c.x1 + nodeR} y1={c.y1}
                x2={c.x2 - nodeR} y2={c.y2}
                stroke={c.color}
                strokeWidth={strokeW}
                opacity={opacity}
                style={{ transition: 'all 0.2s ease' }}
              />
              {/* Invisible wider hit area */}
              <line
                x1={c.x1 + nodeR} y1={c.y1}
                x2={c.x2 - nodeR} y2={c.y2}
                stroke="transparent"
                strokeWidth={12}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: c.label })}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          )
        })}

        {/* Connections layer 2→3 */}
        {connections2.map((c, idx) => {
          const opacity = lerp(0.08, 0.75, c.absW)
          const strokeW = lerp(0.5, 3.5, c.absW)
          return (
            <g key={`c2-${idx}`}>
              <line
                x1={c.x1 + nodeR} y1={c.y1}
                x2={c.x2 - nodeR} y2={c.y2}
                stroke={c.color}
                strokeWidth={strokeW}
                opacity={opacity}
                style={{ transition: 'all 0.2s ease' }}
              />
              <line
                x1={c.x1 + nodeR} y1={c.y1}
                x2={c.x2 - nodeR} y2={c.y2}
                stroke="transparent"
                strokeWidth={12}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: c.label })}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          )
        })}

        {/* Input nodes */}
        {inputValues.map((val, i) => (
          <g key={`in-${i}`} style={{ transition: 'all 0.2s ease' }}>
            <circle
              cx={layerX[0]} cy={inputY[i]}
              r={nodeR + 4}
              fill="#6366f1"
              opacity={0.12}
            />
            <circle
              cx={layerX[0]} cy={inputY[i]}
              r={nodeR}
              fill="url(#nodeGradInput)"
              stroke="#6366f1"
              strokeWidth={1.5}
              style={{
                filter: `drop-shadow(0 0 ${8 + val * 8}px #6366f188)`,
              }}
            />
            <text x={layerX[0]} y={inputY[i] - 2} textAnchor="middle" fill="#f1f5f9" fontSize={fontSize} fontFamily="'Inter', sans-serif" fontWeight="600">
              x{i + 1 === 1 ? '₁' : '₂'}
            </text>
            <text x={layerX[0]} y={inputY[i] + fontSize + 1} textAnchor="middle" fill="#a78bfa" fontSize={fontSize - 1} fontFamily="'JetBrains Mono', monospace">
              {val.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Hidden nodes */}
        {hiddenAValues.map((act, j) => {
          const intensity = Math.max(0, Math.min(1, act))
          return (
            <g key={`hid-${j}`} style={{ transition: 'all 0.2s ease' }}>
              <circle
                cx={layerX[1]} cy={hiddenY[j]}
                r={nodeR + 6}
                fill={COLORS.cyan}
                opacity={lerp(0.03, 0.18, intensity)}
              />
              <circle
                cx={layerX[1]} cy={hiddenY[j]}
                r={nodeR}
                fill="url(#nodeGradCyan)"
                stroke={COLORS.cyan}
                strokeWidth={lerp(1, 2.5, intensity)}
                opacity={lerp(0.5, 1, intensity)}
                style={{
                  filter: `drop-shadow(0 0 ${lerp(4, 16, intensity)}px #00d4ff${Math.round(lerp(0x22, 0xaa, intensity)).toString(16).padStart(2, '0')})`,
                  transition: 'all 0.2s ease',
                }}
              />
              <text x={layerX[1]} y={hiddenY[j] - 2} textAnchor="middle" fill="#f1f5f9" fontSize={fontSize} fontFamily="'Inter', sans-serif" fontWeight="600">
                h{j === 0 ? '₁' : j === 1 ? '₂' : '₃'}
              </text>
              <text x={layerX[1]} y={hiddenY[j] + fontSize + 1} textAnchor="middle" fill="#00d4ff" fontSize={fontSize - 1} fontFamily="'JetBrains Mono', monospace">
                {act.toFixed(3)}
              </text>
            </g>
          )
        })}

        {/* Output node */}
        {[outputAValue].map((act, i) => {
          const intensity = Math.max(0, Math.min(1, act))
          const isCorrect = Math.abs(act - state.target) < 0.2
          const nodeColor = isCorrect ? '#10b981' : '#ef4444'
          return (
            <g key={`out-${i}`} style={{ transition: 'all 0.2s ease' }}>
              <circle
                cx={layerX[2]} cy={outputY[0]}
                r={nodeR + 8}
                fill={nodeColor}
                opacity={lerp(0.04, 0.2, intensity)}
              />
              <circle
                cx={layerX[2]} cy={outputY[0]}
                r={nodeR + 2}
                fill="url(#nodeGradOutput)"
                stroke={nodeColor}
                strokeWidth={lerp(1.5, 3, intensity)}
                style={{
                  filter: `drop-shadow(0 0 ${lerp(6, 20, intensity)}px ${nodeColor}88)`,
                  transition: 'all 0.2s ease',
                }}
              />
              <text x={layerX[2]} y={outputY[0] - 2} textAnchor="middle" fill="#f1f5f9" fontSize={fontSize} fontFamily="'Inter', sans-serif" fontWeight="600">
                ŷ
              </text>
              <text x={layerX[2]} y={outputY[0] + fontSize + 1} textAnchor="middle" fill={nodeColor} fontSize={fontSize - 1} fontFamily="'JetBrains Mono', monospace" fontWeight="700">
                {act.toFixed(3)}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <g transform={`translate(${padX}, ${height - 16})`}>
          <line x1={0} y1={0} x2={20} y2={0} stroke={COLORS.cyan} strokeWidth={2} opacity={0.7} />
          <text x={24} y={4} fill={COLORS.textMuted} fontSize={fontSize - 2} fontFamily="'Inter', sans-serif">positive w</text>
          <line x1={90} y1={0} x2={110} y2={0} stroke={COLORS.crimson} strokeWidth={2} opacity={0.7} />
          <text x={114} y={4} fill={COLORS.textMuted} fontSize={fontSize - 2} fontFamily="'Inter', sans-serif">negative w</text>
          <text x={180} y={4} fill={COLORS.textMuted} fontSize={fontSize - 2} fontFamily="'Inter', sans-serif">thickness ∝ |w|</text>
        </g>
      </svg>

      {/* Target indicator */}
      <div style={{
        position: 'absolute',
        top: 8,
        right: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(10,15,30,0.8)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 11,
        }}>
          <span style={{ color: COLORS.textMuted }}>target:</span>
          <span style={{ color: COLORS.green, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
            {state.target}
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(10,15,30,0.8)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 11,
        }}>
          <span style={{ color: COLORS.textMuted }}>loss:</span>
          <span style={{ color: COLORS.crimson, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
            {(state.loss || 0).toFixed(4)}
          </span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 8,
          background: '#111827',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 11,
          color: COLORS.amber,
          fontFamily: "'JetBrains Mono', monospace",
          pointerEvents: 'none',
          zIndex: 1000,
          whiteSpace: 'nowrap',
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
