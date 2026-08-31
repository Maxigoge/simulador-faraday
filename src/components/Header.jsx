import React, { useEffect, useState } from 'react';

const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfV8074zFZlzwtSwioOXMt7rgRGJ5-IsaX6WSb4TgocjDLkXw/viewform?embedded=true';

/**
 * Header — Header con eyebrow, título, descripción, toggle de tema y contador.
 *
 * Props:
 *  - theme: 'dark' | 'light'
 *  - onToggleTheme: () => void
 *  - visits: number | null
 */
export default function Header({ theme, onToggleTheme, visits }) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    if (!isFeedbackOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsFeedbackOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isFeedbackOpen]);

  return (
    <>
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

        {/* Controles superiores: sugerencias, tema y visitas */}
        <div className="header-controls">
          <div className="header-actions">
              <button
                className="feedback-button"
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
              >
                Comentarios o sugerencias
              </button>

            <button
              className="theme-toggle"
              type="button"
              aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
              onClick={onToggleTheme}
            />
          </div>
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
    {isFeedbackOpen && (
      <div
        className="feedback-modal-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsFeedbackOpen(false);
        }}
      >
        <section
          className="feedback-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          <div className="feedback-modal-header">
            <h2 id="feedback-modal-title">Comentarios o sugerencias</h2>
            <button
              className="feedback-modal-close"
              type="button"
              aria-label="Cerrar formulario"
              onClick={() => setIsFeedbackOpen(false)}
            >
              ×
            </button>
          </div>
          <iframe
            className="feedback-form"
            src={FEEDBACK_FORM_URL}
            title="Formulario de comentarios o sugerencias"
          >
            Cargando…
          </iframe>
        </section>
      </div>
    )}
    </>
  );
}
