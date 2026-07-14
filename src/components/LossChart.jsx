import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts'

const COLORS = {
  cyan: '#00d4ff',
  crimson: '#ef4444',
  amber: '#f59e0b',
  green: '#10b981',
  border: '#1e2d40',
  textPrimary: '#f1f5f9',
  textMuted: '#64748b',
  purple: '#a78bfa',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#111827',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        padding: '6px 10px',
        fontSize: 11,
      }}>
        <div style={{ color: COLORS.textMuted, marginBottom: 2 }}>Step {label}</div>
        <div style={{
          color: COLORS.crimson,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
        }}>
          Loss: {payload[0].value.toFixed(5)}
        </div>
      </div>
    )
  }
  return null
}

export default function LossChart({ lossHistory }) {
  const isConverging = useMemo(() => {
    if (lossHistory.length < 10) return false
    const last10 = lossHistory.slice(-10)
    const first = last10[0].loss
    const last = last10[last10.length - 1].loss
    return last < first * 0.99
  }, [lossHistory])

  const currentLoss = lossHistory.length > 0 ? lossHistory[lossHistory.length - 1].loss : null
  const minLoss = lossHistory.length > 0 ? Math.min(...lossHistory.map(d => d.loss)) : 0
  const maxLoss = lossHistory.length > 0 ? Math.max(...lossHistory.map(d => d.loss)) : 1

  const isEmpty = lossHistory.length === 0

  return (
    <div style={{
      background: 'rgba(17,24,39,0.8)',
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: '14px 16px',
      backdropFilter: 'blur(12px)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <div>
          <div style={{
            color: COLORS.textPrimary,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            marginBottom: 2,
          }}>
            📉 Training Loss History
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 10 }}>
            Binary cross-entropy over training steps
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isConverging && (
            <div style={{
              background: 'rgba(16,185,129,0.15)',
              border: `1px solid rgba(16,185,129,0.4)`,
              borderRadius: 999,
              padding: '3px 8px',
              color: COLORS.green,
              fontSize: 10,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              ↓ converging
            </div>
          )}
          {currentLoss !== null && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: `1px solid rgba(239,68,68,0.3)`,
              borderRadius: 6,
              padding: '3px 8px',
              color: COLORS.crimson,
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
            }}>
              {currentLoss.toFixed(4)}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      {!isEmpty && (
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 10,
        }}>
          {[
            { label: 'Steps', value: lossHistory[lossHistory.length - 1].step },
            { label: 'Min Loss', value: minLoss.toFixed(4), color: COLORS.green },
            { label: 'Max Loss', value: maxLoss.toFixed(4), color: COLORS.crimson },
            { label: 'Points', value: lossHistory.length },
          ].map(s => (
            <div key={s.label} style={{ fontSize: 10 }}>
              <span style={{ color: COLORS.textMuted }}>{s.label}: </span>
              <span style={{ color: s.color || COLORS.textPrimary, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 120 }}>
        {isEmpty ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <div style={{ fontSize: 28, opacity: 0.3 }}>📊</div>
            <div style={{ color: COLORS.textMuted, fontSize: 12, textAlign: 'center' }}>
              Click <span style={{ color: COLORS.cyan }}>▶ Step Once</span> or <span style={{ color: COLORS.amber }}>⚡ ×100 Steps</span>
              <br />to start training and see loss history
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lossHistory} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.crimson} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.crimson} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORS.border}
                opacity={0.5}
              />
              <XAxis
                dataKey="step"
                tick={{ fill: COLORS.textMuted, fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={{ stroke: COLORS.border }}
                tickLine={false}
                label={{ value: 'Step', position: 'insideBottomRight', offset: -5, fill: COLORS.textMuted, fontSize: 9 }}
              />
              <YAxis
                tick={{ fill: COLORS.textMuted, fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={{ stroke: COLORS.border }}
                tickLine={false}
                domain={[0, 'auto']}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="loss"
                stroke={COLORS.crimson}
                strokeWidth={2}
                fill="url(#lossGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: COLORS.crimson,
                  stroke: '#fff',
                  strokeWidth: 1,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
