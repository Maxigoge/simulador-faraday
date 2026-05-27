import React from 'react';

/**
 * Header — Header con eyebrow, título, descripción y toggle de tema.
 *
 * Props:
 *  - theme: 'dark' | 'light'
 *  - onToggleTheme: () => void
 */
export default function Header({ theme, onToggleTheme }) {
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
        <div
          className="theme-toggle"
          role="button"
          aria-label="Cambiar tema"
          onClick={onToggleTheme}
        />
      </div>
    </header>
  );
}
