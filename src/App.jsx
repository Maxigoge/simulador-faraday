import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Problem1 from './problems/Problem1.jsx';
import Problem2 from './problems/Problem2.jsx';
import Problem3 from './problems/Problem3.jsx';
import TheoryView from './components/TheoryView.jsx';

/**
 * App — Orquesta los modos (Práctica / Teoría), el switch de problemas,
 * y el toggle de tema. Persiste el tema en localStorage.
 */

const PROBLEMS = [
  { id: 'p1', short: 'P1', label: 'Bobina cae', Component: Problem1 },
  { id: 'p2', short: 'P2', label: 'Área ↓',     Component: Problem2 },
  { id: 'p3', short: 'P3', label: 'dB/dt → I',  Component: Problem3 },
];

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('u7-theme') || 'dark'
  );
  const [mode, setMode] = useState('practica'); // 'practica' | 'teoria'
  const [problem, setProblem] = useState('p1');

  // Aplicar tema al body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('u7-theme', theme);
    // Actualizar meta theme-color (color de la barra de status del browser)
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#faf8f3' : '#0d1117');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const CurrentProblem = PROBLEMS.find((p) => p.id === problem).Component;

  return (
    <div className="container">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <div className="mode-tabs">
        <button
          className={`mbtn ${mode === 'practica' ? 'active' : ''}`}
          onClick={() => handleModeChange('practica')}
        >
          Práctica
        </button>
        <button
          className={`mbtn ${mode === 'teoria' ? 'active' : ''}`}
          onClick={() => handleModeChange('teoria')}
        >
          Teoría
        </button>
      </div>

      {mode === 'practica' && (
        <div className="practice-layout">
          <div className="problem-select">
            {PROBLEMS.map((p) => (
              <button
                key={p.id}
                className={`pbtn ${problem === p.id ? 'active' : ''}`}
                onClick={() => setProblem(p.id)}
              >
                {p.short}
                <small>{p.label}</small>
              </button>
            ))}
          </div>
          <div className="practice-content">
            <CurrentProblem />
          </div>
        </div>
      )}

      {mode === 'teoria' && <TheoryView />}

      <footer>v 1.0 · React · 3 problemas + teoría · Guía 7 · Inducción</footer>
    </div>
  );
}
