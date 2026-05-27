import React, { useState, useMemo } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import BFieldDots from '../components/BFieldDots.jsx';

const DEFAULTS = {
  L: 0.20,
  LUnit: 1,
  fem: 18,
  femUnit: 0.001,
  dA: 0.1,
};

const B_UNITS = [
  { label: 'T', value: '1' },
  { label: 'mT', value: '0.001' },
  { label: 'μT', value: '0.000001' },
];

/**
 * Problema 2 — Espira cuadrada de lado 0.20m, en un B constante perpendicular.
 * Se induce ε=18mV cuando el área disminuye a 0.1 m²/s. Hallar B.
 *
 * Fórmula: ε = B · |dA/dt|  →  B = ε / |dA/dt|
 * Resultado esperado: B = 0.18 T = 180 mT
 */
export default function Problem2() {
  const [L, setL] = useState(DEFAULTS.L);
  const [LUnit, setLUnit] = useState(DEFAULTS.LUnit);
  const [fem, setFem] = useState(DEFAULTS.fem);
  const [femUnit, setFemUnit] = useState(DEFAULTS.femUnit);
  const [dA, setDA] = useState(DEFAULTS.dA);

  const calc = useMemo(() => {
    const LSI = parseFloat(L) * LUnit;
    const femSI = parseFloat(fem) * femUnit;
    const dASI = parseFloat(dA);
    if ([LSI, femSI, dASI].some((v) => isNaN(v)) || dASI <= 0) return null;
    const A = LSI * LSI;
    const B = femSI / dASI;
    return { A, B, femSI, dASI };
  }, [L, LUnit, fem, femUnit, dA]);

  const reset = () => {
    setL(DEFAULTS.L); setLUnit(DEFAULTS.LUnit);
    setFem(DEFAULTS.fem); setFemUnit(DEFAULTS.femUnit);
    setDA(DEFAULTS.dA);
  };

  // Field intensity para los puntos del SVG
  const fieldIntensity = calc ? Math.min(Math.abs(calc.B) / 0.5, 1) : 0;

  return (
    <div className="card has-two-cols">
      <div className="card-header-block">
        <span className="pnum">PROBLEMA 2</span>
        <h2 className="card-title">Espira cuadrada con área que disminuye</h2>
        <p className="card-desc">
          Una espira cuadrada de lado L está en un B constante perpendicular. El
          área disminuye a rapidez dA/dt y se induce ε. Hallar B.
        </p>
        <details>
          <summary>Fórmula</summary>
          <span className="frm">Φ = B · A</span>
          <span className="frm">ε = |dΦ/dt| = B · |dA/dt|   (N=1, B cte)</span>
          <span className="frm">→ B = ε / |dA/dt|</span>
        </details>
      </div>

      <div className="controls-block">
        <div className="anim-wrap">
          <svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
            <rect
              className="field-bg"
              x="10"
              y="10"
              width="360"
              height="180"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <BFieldDots
              intensity={fieldIntensity}
              cols={8}
              rows={4}
              startX={30}
              startY={30}
              stepX={45}
              stepY={45}
            />
            <rect
              className="coil-fill"
              x="120"
              y="50"
              width="100"
              height="100"
            />
            <text x="170" y="105" className="lbl-svg" textAnchor="middle" fill="var(--accent-2)">
              L
            </text>
            {/* Inward arrows */}
            <g stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent)" opacity="0.7">
              <line x1="100" y1="100" x2="115" y2="100" />
              <polygon points="111,97 118,100 111,103" />
              <line x1="240" y1="100" x2="225" y2="100" />
              <polygon points="229,97 222,100 229,103" />
              <line x1="170" y1="35" x2="170" y2="48" />
              <polygon points="167,44 170,51 173,44" />
              <line x1="170" y1="165" x2="170" y2="152" />
              <polygon points="167,156 170,149 173,156" />
            </g>
            <text x="350" y="22" className="lbl-svg" textAnchor="end">
              B sale ⊙
            </text>
          </svg>
        </div>

        <SliderControl
          label="Lado L de la espira"
          value={L}
          onChange={setL}
          unit={LUnit}
          onUnitChange={setLUnit}
          unitOptions={[
            { label: 'm', value: '1' },
            { label: 'cm', value: '0.01' },
          ]}
          min={0.01}
          max={2}
          step={0.01}
        />
        <SliderControl
          label="fem inducida ε"
          value={fem}
          onChange={setFem}
          unit={femUnit}
          onUnitChange={setFemUnit}
          unitOptions={[
            { label: 'mV', value: '0.001' },
            { label: 'V', value: '1' },
            { label: 'μV', value: '0.000001' },
          ]}
          min={0.1}
          max={500}
          step={0.1}
        />
        <SliderControl
          label="|dA/dt|"
          value={dA}
          onChange={setDA}
          min={0.001}
          max={5}
          step={0.001}
          displayUnit="m²/s"
        />
        <div className="reset-row">
          <button className="btn btn-reset" onClick={reset}>
            ↺ Datos del enunciado
          </button>
        </div>
      </div>

      <div className="output-block">
        <LiveResult
          label="Campo B"
          value={calc?.B ?? null}
          unit="T"
          rows={calc ? [
            { label: 'Área inicial A = L²', value: calc.A, unit: 'm²' },
            { label: '|dA/dt|', raw: `${calc.dASI} m²/s` },
            { label: 'ε', value: calc.femSI, unit: 'V' },
            { label: 'B = ε/|dA/dt|', value: calc.B, unit: 'T' },
          ] : []}
        />
        {calc && (
          <CheckPanel
            expected={calc.B}
            unitOptions={B_UNITS}
            placeholder="tu valor de B"
          />
        )}
      </div>
    </div>
  );
}
