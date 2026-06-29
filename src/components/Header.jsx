import React from 'react';

/**
 * Header — Header con eyebrow, título, descripción, toggle de tema y contador.
 *
 * Props:
 *  - theme: 'dark' | 'light'
 *  - onToggleTheme: () => void
 *  - visits: number | null
 */
export default function Header({ theme, onToggleTheme, visits }) {
  return (
    <header>
      <div className="header-row">
        <div style={{ flex: 1 }}>
          <div className="eyebrow">
            Física II · Unidad 7 · Inducción electromagnética
          </div>
          <h1>
            fara<span className="alt">/</span>day<span className="alt">.</span>
          </h1>
          <p className="sub">
            3 problemas dinámicos + teoría. Mové los sliders y mirá la fem cambiar en tiempo real.
          </p>
        </div>

        {/* Controles superiores: visitas + toggle tema */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
          flexShrink: 0,
          marginTop: '4px',
        }}>
          <div
            className="theme-toggle"
            role="button"
            aria-label="Cambiar tema"
            onClick={onToggleTheme}
          />
          {visits !== null && visits !== undefined && (
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              opacity: 0.7,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }} />
              {typeof visits === 'number' ? visits.toLocaleString() + ' visitas' : visits}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
