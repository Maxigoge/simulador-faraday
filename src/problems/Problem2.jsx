import React, { useState, useMemo } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import BFieldDots from '../components/BFieldDots.jsx';
import GraphLegend from '../components/GraphLegend.jsx';

const DEFAULTS = { L: 0.20, LUnit: 1, fem: 18, femUnit: 0.001, dA: 0.1 };

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

  const fieldIntensity = calc ? Math.min(Math.abs(calc.B) / 2, 1) : 0;

  // SVG — la espira en U tiene dos rieles verticales fijos y una barra horizontal móvil
  // L determina la separación entre los rieles (ancho de la espira)
  const LSI = parseFloat(L) * LUnit || DEFAULTS.L;
  const lClamp = Math.min(Math.max(LSI, 0.01), 2.0);
  // Ancho de la espira (distancia entre rieles) en px: 20px a 160px
  const railSep = 20 + ((lClamp - 0.01) / 1.99) * 140;
  // Centro horizontal del SVG
  const cx = 190;
  // Rieles: arrancan en y=30 y bajan hasta y=170
  const railTop  = 30;
  const railBot  = 170;
  const railH    = railBot - railTop;
  const railL    = cx - railSep / 2; // x del riel izquierdo
  const railR    = cx + railSep / 2; // x del riel derecho

  // La barra empieza en y=railBot (posición inicial = espira de máximo tamaño)
  // y se mueve hacia railTop (área disminuye)
  // dA/dt determina la velocidad de la animación
  const dASI = parseFloat(dA) || 0.1;
  const dAClamp = Math.min(Math.max(dASI, 0.001), 5);
  const barDuration = (3.0 - ((dAClamp - 0.001) / 4.999) * 2.6).toFixed(2);

  // Grosor y opacidad de la barra según fem
  const femSI = parseFloat(fem) * femUnit || 0.018;
  const femClamp = Math.min(Math.max(femSI, 0), 0.5);
  const barWidth = 2 + (femClamp / 0.5) * 3;
  const barOpacity = 0.5 + (femClamp / 0.5) * 0.5;

  // Posición de la barra: empieza en railBot, termina en railTop + 10
  const barStart = railBot;
  const barEnd   = railTop + 10;
  const barTravel = barStart - barEnd;

  return (
    <div className="card has-two-cols">
      <div className="card-header-block">
        <span className="pnum">PROBLEMA 2</span>
        <h2 className="card-title">Espira con un lado móvil</h2>
        <p className="card-desc">
          Una espira rectangular formada por dos rieles fijos y una barra conductora
          que se desliza, reduciendo el área. B es constante y perpendicular al plano.
          Calcular B a partir de la fem inducida.
        </p>
        <details>
          <summary>Fórmula</summary>
          <span className="frm">Φ = B · A   (A = L · x, donde x es la posición de la barra)</span>
          <span className="frm">ε = |dΦ/dt| = B · L · |dx/dt| = B · |dA/dt|</span>
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
              animate={true} animationDuration={parseFloat(barDuration) * 1.2} />
            <text x="355" y="22" className="lbl-svg" textAnchor="end">B ⊙ (sale)</text>

            {/* ── Espira en U: dos rieles verticales + conexión superior ── */}
            {/* Riel izquierdo */}
            <line x1={railL} y1={railTop} x2={railL} y2={railBot}
              stroke="var(--accent-2)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Riel derecho */}
            <line x1={railR} y1={railTop} x2={railR} y2={railBot}
              stroke="var(--accent-2)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Conexión superior (el fondo de la U) */}
            <line x1={railL} y1={railTop} x2={railR} y2={railTop}
              stroke="var(--accent-2)" strokeWidth="2.5" strokeLinecap="round" />

            {/* Pequeños terminales en la parte inferior de los rieles */}
            <circle cx={railL} cy={railBot} r="4" fill="var(--accent-2)" opacity="0.6" />
            <circle cx={railR} cy={railBot} r="4" fill="var(--accent-2)" opacity="0.6" />

            {/* Label L (ancho de la espira) */}
            <line x1={railL} y1={railTop - 12} x2={railR} y2={railTop - 12}
              stroke="var(--ink-dim)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
            <text x={cx} y={railTop - 16} className="lbl-svg" textAnchor="middle"
              fill="var(--accent-2)" fontWeight="700">
              L = {(LSI * 100).toFixed(1)} cm
            </text>

            {/* ── Barra deslizante animada ── */}
            <g style={{ animation: `p2-bar ${barDuration}s ease-in-out infinite` }}>
              {/* Barra */}
              <line x1={railL} y1={barStart} x2={railR} y2={barStart}
                stroke="var(--accent)" strokeWidth={barWidth.toFixed(1)}
                strokeLinecap="round" opacity={barOpacity.toFixed(2)} />
              {/* Flechas en los extremos indicando el sentido de movimiento (hacia arriba) */}
              <polygon points={`${railL - 1},${barStart - 8} ${railL + 4},${barStart - 16} ${railL + 9},${barStart - 8}`}
                fill="var(--accent)" opacity={barOpacity.toFixed(2)} />
              <polygon points={`${railR - 9},${barStart - 8} ${railR - 4},${barStart - 16} ${railR + 1},${barStart - 8}`}
                fill="var(--accent)" opacity={barOpacity.toFixed(2)} />
              {/* Label de la barra */}
              <text x={cx} y={barStart + 14} className="lbl-svg" textAnchor="middle"
                fill="var(--accent)" fontWeight="700" fontSize="11">
                barra móvil
              </text>
              {/* Área sombreada entre la barra y el fondo de la U */}
              <rect x={railL + 1} y={railTop + 1}
                width={railSep - 2} height={barStart - railTop - 1}
                fill="var(--accent)" opacity="0.06" />
            </g>

            {/* Label dA/dt */}
            <text x={cx} y={railBot + 18} className="lbl-svg" textAnchor="middle"
              fill="var(--accent)" opacity="0.7">
              dA/dt = {dASI.toFixed(3)} m²/s
            </text>

            <style>{`
              /* Barra: sube desde railBot hasta barEnd, pausa, vuelve */
              @keyframes p2-bar {
                0%   { transform: translateY(0px); }
                45%  { transform: translateY(-${barTravel}px); }
                75%  { transform: translateY(-${barTravel}px); }
                85%  { transform: translateY(-${barTravel}px); opacity: 1; }
                90%  { transform: translateY(0px); opacity: 0.2; }
                95%  { transform: translateY(0px); opacity: 1; }
                100% { transform: translateY(0px); }
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
          { symbol: 'U', color: 'var(--accent-2)', label: 'Rieles (espira en U)',
            description: 'Dos conductores fijos y paralelos (rieles) unidos en la parte superior. El ancho L escala con el slider. Representan los dos lados largos de la espira rectangular.' },
          { symbol: '—', color: 'var(--accent)', label: 'Barra deslizante',
            description: 'El conductor móvil que cierra el circuito. Se desplaza hacia arriba reduciendo el área. La velocidad de subida escala con |dA/dt|. El grosor escala con la fem ε.' },
          { symbol: '⊙', color: 'var(--accent-3)', label: 'Campo B (constante)',
            description: 'B es constante en este problema — no varía en el tiempo. Lo que cambia es el área barrida por la barra móvil, generando la variación de flujo.' },
          { symbol: '□', color: 'var(--accent)', label: 'Área sombreada',
            description: 'El área actual de la espira (entre el fondo de la U y la barra). A medida que la barra sube, esta área disminuye y con ella el flujo magnético.' },
        ]} />
      </div>

      <div className="output-block">
        <LiveResult label="Campo B" value={calc?.B ?? null} unit="T"
          rows={calc ? [
            { label: 'Área A = L²', value: calc.A, unit: 'm²' },
            { label: '|dA/dt|', raw: `${calc.dASI} m²/s` },
            { label: 'ε', value: calc.femSI, unit: 'V' },
            { label: 'B = ε / |dA/dt|', value: calc.B, unit: 'T' },
          ] : []} />
        {calc && <CheckPanel expected={calc.B} unitOptions={B_UNITS} placeholder="tu valor de B" />}
      </div>
    </div>
  );
}
