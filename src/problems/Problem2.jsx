import React, { useState, useMemo } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import BFieldDots from '../components/BFieldDots.jsx';
import GraphLegend from '../components/GraphLegend.jsx';

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

  // Intensidad de los puntos del campo proporcional a B calculado (satura en 2T)
  const fieldIntensity = calc ? Math.min(Math.abs(calc.B) / 2, 1) : 0;

  // SVG — mapeo lineal: slider L va de 0.01m a 2m → px de 12 a 150
  const LSI = parseFloat(L) * LUnit || DEFAULTS.L;
  const lClamp = Math.min(Math.max(LSI, 0.01), 2.0);
  const sqPx = 12 + ((lClamp - 0.01) / (2.0 - 0.01)) * (150 - 12);
  const sqCx = 190;
  const sqCy = 100;
  const sqX = sqCx - sqPx / 2;
  const sqY = sqCy - sqPx / 2;

  // |dA/dt| → velocidad de las flechas y del pulso del cuadrado
  // Slider va de 0.001 a 5 m²/s → duración animación de 3s (lento) a 0.4s (rápido)
  const dASI = parseFloat(dA) || 0.1;
  const dAClamp = Math.min(Math.max(dASI, 0.001), 5);
  const arrowDuration = (3.0 - ((dAClamp - 0.001) / (5 - 0.001)) * (3.0 - 0.4)).toFixed(2);

  // ε (fem) → grosor y opacidad de las flechas
  // Slider va de 0.1mV a 500mV → strokeWidth de 1 a 3.5, opacidad de 0.3 a 1
  const femSI = parseFloat(fem) * femUnit || 0.018;
  const femMax = 0.5; // 500 mV en V
  const femClamp = Math.min(Math.max(femSI, 0), femMax);
  const arrowWidth = 1 + (femClamp / femMax) * 2.5;
  const arrowOpacity = 0.3 + (femClamp / femMax) * 0.7;

  // Animación de contracción del cuadrado: pulsa levemente hacia adentro
  // La magnitud del pulso depende de dA/dt (más rápido = más pronunciado)
  const squishAmount = Math.min(3 + dAClamp * 2, 12); // px que se achica en el pulso

  const gap = 14;
  const arrowLen = 18;

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
            {/* Campo de fondo */}
            <rect className="field-bg" x="10" y="10" width="360" height="180"
              strokeWidth="1" strokeDasharray="3 3" />
            <BFieldDots intensity={fieldIntensity} cols={8} rows={4}
              startX={30} startY={30} stepX={45} stepY={45}
              animate={true} animationDuration={parseFloat(arrowDuration) * 1.2} />

            {/* Cuadrado + flechas juntos — todo se contrae desde el centro */}
            <g style={{
              animation: `p2-squish ${arrowDuration}s ease-in-out infinite`,
              transformOrigin: `${sqCx}px ${sqCy}px`,
            }}>
              {/* Cuadrado */}
              <rect className="coil-fill"
                x={sqX} y={sqY} width={sqPx} height={sqPx}
              />

              {/* Label L */}
              <text x={sqCx} y={sqCy + 5} className="lbl-svg"
                textAnchor="middle" fill="var(--accent-2)" fontWeight="700">
                L = {(LSI * 100).toFixed(1)} cm
              </text>

              {/* Flechas hacia adentro — opacidad pulsa con dA/dt */}
              <g stroke="var(--accent)" strokeWidth={arrowWidth.toFixed(2)}
                fill="var(--accent)"
                style={{ animation: `p2-arrows ${arrowDuration}s ease-in-out infinite` }}>
                {/* izquierda */}
                <line x1={sqX - gap - arrowLen} y1={sqCy} x2={sqX - gap} y2={sqCy} />
                <polygon points={`${sqX - gap - 5},${sqCy - 3} ${sqX - gap + 1},${sqCy} ${sqX - gap - 5},${sqCy + 3}`} />
                {/* derecha */}
                <line x1={sqX + sqPx + gap + arrowLen} y1={sqCy} x2={sqX + sqPx + gap} y2={sqCy} />
                <polygon points={`${sqX + sqPx + gap + 5},${sqCy - 3} ${sqX + sqPx + gap - 1},${sqCy} ${sqX + sqPx + gap + 5},${sqCy + 3}`} />
                {/* arriba */}
                <line x1={sqCx} y1={sqY - gap - arrowLen} x2={sqCx} y2={sqY - gap} />
                <polygon points={`${sqCx - 3},${sqY - gap - 5} ${sqCx},${sqY - gap + 1} ${sqCx + 3},${sqY - gap - 5}`} />
                {/* abajo */}
                <line x1={sqCx} y1={sqY + sqPx + gap + arrowLen} x2={sqCx} y2={sqY + sqPx + gap} />
                <polygon points={`${sqCx - 3},${sqY + sqPx + gap + 5} ${sqCx},${sqY + sqPx + gap - 1} ${sqCx + 3},${sqY + sqPx + gap + 5}`} />
              </g>
            </g>

            {/* Labels de los valores actuales */}
            <text x="355" y="22" className="lbl-svg" textAnchor="end">B sale ⊙</text>
            <text x={sqCx} y="185" className="lbl-svg" textAnchor="middle"
              fill="var(--accent)" opacity="0.7">
              dA/dt = {dASI.toFixed(3)} m²/s
            </text>

            <style>{`
              /* Flechas: solo pulsan en opacidad, sin ningún movimiento */
              @keyframes p2-arrows {
                0%   { opacity: ${(arrowOpacity * 0.3).toFixed(2)}; }
                50%  { opacity: ${arrowOpacity.toFixed(2)}; }
                100% { opacity: ${(arrowOpacity * 0.3).toFixed(2)}; }
              }
              /* Cuadrado: se contrae hacia su propio centro */
              @keyframes p2-squish {
                0%   { transform: scale(1); }
                70%  { transform: scale(1); }
                85%  { transform: scale(${(1 - squishAmount / (sqPx || 100)).toFixed(3)}); }
                100% { transform: scale(1); }
              }
            `}</style>
          </svg>
        </div>

        <SliderControl label="Lado L de la espira" value={L} onChange={setL}
          unit={LUnit} onUnitChange={setLUnit}
          unitOptions={[{ label: 'm', value: '1' }, { label: 'cm', value: '0.01' }]}
          min={0.01} max={2} step={0.01} />
        <SliderControl label="fem inducida ε" value={fem} onChange={setFem}
          unit={femUnit} onUnitChange={setFemUnit}
          unitOptions={[{ label: 'mV', value: '0.001' }, { label: 'V', value: '1' }, { label: 'μV', value: '0.000001' }]}
          min={0.1} max={500} step={0.1} />
        <SliderControl label="|dA/dt|" value={dA} onChange={setDA}
          min={0.001} max={5} step={0.001} displayUnit="m²/s" />
        <div className="reset-row">
          <button className="btn btn-reset" onClick={reset}>↺ Datos del enunciado</button>
        </div>

        <GraphLegend items={[
          {
            symbol: '□',
            color: 'var(--accent-2)',
            label: 'Cuadrado (espira)',
            description: 'Representa la espira cuadrada de lado L. Su tamaño escala con el valor de L: más grande = mayor área. La animación de contracción simula que el área está disminuyendo.',
          },
          {
            symbol: '→',
            color: 'var(--accent)',
            label: 'Flechas hacia adentro',
            description: 'Indican que el área de la espira está disminuyendo. La velocidad de la animación es proporcional a |dA/dt| (más rápido = el área se achica más velozmente). El grosor escala con la fem ε.',
          },
          {
            symbol: '⊙',
            color: 'var(--accent-3)',
            label: 'Puntos del campo B',
            description: 'Campo magnético constante saliendo del plano (⊙ = sale hacia vos). En este problema B es el resultado a calcular: su intensidad en el gráfico refleja el B calculado a partir de ε y dA/dt.',
          },
          {
            symbol: 'L',
            color: 'var(--accent-2)',
            label: 'Label del lado L',
            description: 'Muestra el valor actual del lado de la espira en cm. Se actualiza en tiempo real al mover el slider de L.',
          },
        ]} />
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
        {calc && <CheckPanel expected={calc.B} unitOptions={B_UNITS} placeholder="tu valor de B" />}
      </div>
    </div>
  );
}
