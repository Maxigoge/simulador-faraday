import React from 'react';

/**
 * GraphLegend — Solapa desplegable debajo del gráfico que explica
 * qué representa cada elemento visual del SVG.
 *
 * Props:
 *  - items: [{ symbol, color, label, description }]
 *    - symbol: texto corto o emoji que representa el elemento (ej. "⊙", "→", "▭")
 *    - color: color CSS (usa variables del tema)
 *    - label: nombre corto del elemento
 *    - description: explicación de qué representa y cómo varía
 */
export default function GraphLegend({ items }) {
  return (
    <details style={{ marginTop: '10px' }}>
      <summary>¿Qué representa cada elemento del gráfico?</summary>
      <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            padding: '6px 0',
            borderBottom: i < items.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            {/* Símbolo */}
            <div style={{
              flexShrink: 0,
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: item.color || 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: '700',
              color: 'var(--bg)',
              opacity: 0.9,
            }}>
              {item.symbol}
            </div>
            {/* Texto */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: item.color || 'var(--accent)',
                marginBottom: '2px',
              }}>
                {item.label}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: 'var(--ink-dim)',
                lineHeight: '1.5',
              }}>
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
