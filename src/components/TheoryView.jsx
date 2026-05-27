import React, { useState } from 'react';
import { THEORY_SECTIONS, THEORY_RENDERERS } from '../theory/sections.jsx';

/**
 * TheoryView — Renderiza la sección de teoría con tabs para navegar
 * entre las explicaciones (Conceptos / Faraday / Lenz / P1 / P2 / P3).
 */
export default function TheoryView() {
  const [section, setSection] = useState('intro');
  const SectionContent = THEORY_RENDERERS[section];

  const handleSelect = (id) => {
    setSection(id);
    // Scroll al inicio para que se vea el contenido nuevo
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return (
    <div>
      <div className="theory-nav">
        {THEORY_SECTIONS.map((s) => (
          <button
            key={s.id}
            className={section === s.id ? 'active' : ''}
            onClick={() => handleSelect(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="theory-card">
        <SectionContent />
      </div>
    </div>
  );
}
