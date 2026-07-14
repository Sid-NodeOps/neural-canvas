import React, { useState } from 'react'
import { useNeuralNet } from './hooks/useNeuralNet'
import NetworkViz from './components/NetworkViz'
import WeightControls from './components/WeightControls'
import ForwardPassPanel from './components/ForwardPassPanel'
import BackwardPassPanel from './components/BackwardPassPanel'
import LossChart from './components/LossChart'
import TheoryPanel from './components/TheoryPanel'

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
  bg: '#0a0f1e',
}

function CreateOSBadge() {
  return (
    <>
      <style>{`
        #createos-badge {
          position: fixed; bottom: 12px; right: 12px; z-index: 9999;
          display: flex; align-items: center; gap: 6px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 999px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10);
          font-size: 11px; font-weight: 500; color: #374151;
          text-decoration: none;
          font-family: system-ui, sans-serif;
        }
        #createos-badge:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        #createos-badge img { width: 14px; height: 14px; }
      `}</style>
      <a id="createos-badge" href="https://createos.sh/app" target="_blank" rel="noopener noreferrer">
        <img src="https://nodeops.network/SymbolBlack.svg" alt="" />
        Built with CreateOS
      </a>
    </>
  )
}

const PASS_TABS = [
  { id: 'forward', label: '→ Forward Pass', color: COLORS.cyan },
  { id: 'backward', label: '← Backward Pass', color: COLORS.crimson },
]

export default function App() {
  const {
    state,
    inputIndex,
    lossHistory,
    setWeights1,
    setWeights2,
    setBias1,
    setBias2,
    setInput,
    step,
    train,
    reset,
  } = useNeuralNet()

  const [passTab, setPassTab] = useState('forward')

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${COLORS.border}`,
        background: 'rgba(17,24,39,0.9)',
        backdropFilter: 'blur(12px)',
        padding: '12px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1800,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `linear-gradient(135deg, rgba(0,212,255,0.2), rgba(167,139,250,0.2))`,
              border: `1px solid rgba(0,212,255,0.3)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 0 12px rgba(0,212,255,0.2)',
            }}>
              🧠
            </div>
            <div>
              <div style={{
                color: COLORS.textPrimary,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '-0.3px',
              }}>
                Neural Net Backprop Simulator
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 11 }}>
                Interactive backpropagation learning tool · XOR problem · 2→3→1 architecture
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Input', value: `[${state.input?.join(',')}]`, color: '#6366f1' },
              { label: 'Target', value: state.target, color: COLORS.green },
              { label: 'Pred', value: (state.outputA || 0).toFixed(3), color: Math.abs((state.outputA || 0) - state.target) < 0.2 ? COLORS.green : COLORS.crimson },
              { label: 'Loss', value: (state.loss || 0).toFixed(4), color: COLORS.crimson },
              { label: 'Steps', value: lossHistory.length > 0 ? lossHistory[lossHistory.length - 1].step : 0, color: COLORS.textMuted },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(10,15,30,0.8)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{ color: COLORS.textMuted, fontSize: 10 }}>{stat.label}</span>
                <span style={{
                  color: stat.color,
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main style={{
        maxWidth: 1800,
        margin: '0 auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>

        {/* Row 1: Network Visualization */}
        <div style={{ width: '100%' }}>
          <NetworkViz state={state} />
        </div>

        {/* Row 2: Controls + Forward/Backward + (empty) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr 1fr',
          gap: 12,
          alignItems: 'start',
        }}
          className="middle-row"
        >
          {/* Weight Controls */}
          <div style={{ minHeight: 520 }}>
            <WeightControls
              state={state}
              inputIndex={inputIndex}
              setWeights1={setWeights1}
              setWeights2={setWeights2}
              setBias1={setBias1}
              setBias2={setBias2}
              setInput={setInput}
              step={step}
              train={train}
              reset={reset}
            />
          </div>

          {/* Forward + Backward Pass (tabbed) */}
          <div style={{
            background: 'rgba(17,24,39,0.8)',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
            minHeight: 520,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Tab switcher */}
            <div style={{
              display: 'flex',
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              {PASS_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPassTab(tab.id)}
                  style={{
                    flex: 1,
                    background: passTab === tab.id ? `${tab.color}11` : 'none',
                    border: 'none',
                    borderBottom: `2px solid ${passTab === tab.id ? tab.color : 'transparent'}`,
                    padding: '10px 8px',
                    color: passTab === tab.id ? tab.color : COLORS.textMuted,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, padding: '12px', overflowY: 'auto', maxHeight: 500 }}>
              {passTab === 'forward' ? (
                <ForwardPassPanel state={state} />
              ) : (
                <BackwardPassPanel state={state} />
              )}
            </div>
          </div>

          {/* Theory Panel (third column in middle row) */}
          <div style={{ minHeight: 520 }}>
            <TheoryPanel />
          </div>
        </div>

        {/* Row 3: Loss Chart full width */}
        <div style={{ height: 240 }}>
          <LossChart lossHistory={lossHistory} />
        </div>

      </main>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1100px) {
          .middle-row {
            grid-template-columns: 260px 1fr !important;
          }
          .middle-row > :nth-child(3) {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 720px) {
          .middle-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <CreateOSBadge />
    </div>
  )
}
