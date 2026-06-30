import React, { useState, useMemo } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import GraphLegend from '../components/GraphLegend.jsx';

const DEFAULTS = {
  N: 75, a: 5, aUnit: 0.01, b: 8, bUnit: 0.01,
  R: 8, RUnit: 1, I: 0.1, IUnit: 1,
};

const DBDT_UNITS = [
  { label: 'T/s', value: '1' },
  { label: 'mT/s', value: '0.001' },
  { label: 'μT/s', value: '0.000001' },
];

/**
 * FieldLines — Líneas de campo que se juntan a medida que B aumenta.
 * nLines: cantidad de líneas (proporcional a dBdt)
 * Cada línea va de arriba a abajo del SVG, distribuidas horizontalmente.
 * Se animan: van apareciendo nuevas líneas que "se acercan" a las existentes.
 */
function FieldLines({ nLines, animDuration }) {
  // Región del SVG donde se dibujan las líneas: x de 10 a 370, y de 15 a 185
  const xMin = 15, xMax = 365, yTop = 15, yBot = 185;
  const totalLines = Math.max(nLines, 2);

  // Distribuir líneas uniformemente
  const lines = Array.from({ length: totalLines }, (_, i) => {
    const x = xMin + (i / (totalLines - 1)) * (xMax - xMin);
    return x;
  });

  return (
    <g>
      {lines.map((x, i) => (
        <line key={i}
          x1={x} y1={yTop} x2={x} y2={yBot}
          stroke="var(--accent-3)"
          strokeWidth="1.5"
          opacity="0.55"
          style={{
            animation: `p3-field-line ${animDuration}s ease-in-out ${(-i / totalLines * animDuration).toFixed(2)}s infinite`,
          }}
        />
      ))}
      {/* Flechas en cada línea indicando dirección del campo (saliente = hacia el lector) */}
      {lines.map((x, i) => (
        <polygon key={`arr-${i}`}
          points={`${x - 4},${yTop + 55} ${x},${yTop + 45} ${x + 4},${yTop + 55}`}
          fill="var(--accent-3)" opacity="0.6"
        />
      ))}
    </g>
  );
}

export default function Problem3() {
  const [N, setN] = useState(DEFAULTS.N);
  const [a, setA] = useState(DEFAULTS.a);
  const [aUnit, setAUnit] = useState(DEFAULTS.aUnit);
  const [b, setB] = useState(DEFAULTS.b);
  const [bUnit, setBUnit] = useState(DEFAULTS.bUnit);
  const [R, setR] = useState(DEFAULTS.R);
  const [RUnit, setRUnit] = useState(DEFAULTS.RUnit);
  const [I, setI] = useState(DEFAULTS.I);
  const [IUnit, setIUnit] = useState(DEFAULTS.IUnit);

  const calc = useMemo(() => {
    const aSI = parseFloat(a) * aUnit;
    const bSI = parseFloat(b) * bUnit;
    const RSI = parseFloat(R) * RUnit;
    const ISI = parseFloat(I) * IUnit;
    if ([N, aSI, bSI, RSI, ISI].some((v) => isNaN(v)) || N <= 0 || RSI <= 0) return null;
    const A = aSI * bSI;
    const fem = ISI * RSI;
    const dBdt = fem / (N * A);
    return { A, fem, dBdt };
  }, [N, a, aUnit, b, bUnit, R, RUnit, I, IUnit]);

  const reset = () => {
    setN(DEFAULTS.N);
    setA(DEFAULTS.a); setAUnit(DEFAULTS.aUnit);
    setB(DEFAULTS.b); setBUnit(DEFAULTS.bUnit);
    setR(DEFAULTS.R); setRUnit(DEFAULTS.RUnit);
    setI(DEFAULTS.I); setIUnit(DEFAULTS.IUnit);
  };

  // Cantidad de líneas de campo: proporcional a dBdt (más dBdt = B más intenso = más líneas)
  // Rango: 3 líneas (dBdt≈0) a 18 líneas (dBdt≥10 T/s)
  const dBdt = calc?.dBdt ?? 0;
  const nFieldLines = Math.round(3 + Math.min(dBdt / 10, 1) * 15);

  // Velocidad de la animación de las líneas según I
  const ISI = parseFloat(I) * IUnit || 0.1;
  const IClamp = Math.min(Math.max(ISI, 0.001), 10);
  const fieldAnimDuration = (2.5 - ((IClamp - 0.001) / 9.999) * 2.0).toFixed(2);

  // Grosor y opacidad de la flecha de corriente según R e I
  const RSI = parseFloat(R) * RUnit || 8;
  const RClamp = Math.min(Math.max(RSI, 0.1), 200);
  const arrowWidth = 1.5 + ((Math.log(RClamp) - Math.log(0.1)) / (Math.log(200) - Math.log(0.1))) * 2.5;
  const arrowOpacity = 0.35 + ((IClamp - 0.001) / 9.999) * 0.6;

  // Bobina SVG — escala con a y b
  const aSI = parseFloat(a) * aUnit || 0.05;
  const bSI = parseFloat(b) * bUnit || 0.08;
  const aClamp = Math.min(Math.max(aSI, 0.005), 0.50);
  const bClamp = Math.min(Math.max(bSI, 0.005), 0.50);
  const wpx = 16 + ((aClamp - 0.005) / 0.495) * (120 - 16);
  const hpx = 16 + ((bClamp - 0.005) / 0.495) * (100 - 16);
  const cx = 190, cy = 105;
  const rx = cx - wpx / 2, ry = cy - hpx / 2;
  const nLines = Math.min(Math.max(Math.round(parseFloat(N) / 10), 1), 12);

  return (
    <div className="card has-two-cols">
      <div className="card-header-block">
        <span className="pnum">PROBLEMA 3</span>
        <h2 className="card-title">¿Con qué rapidez debe cambiar B?</h2>
        <p className="card-desc">
          Bobina rectangular de N vueltas, perpendicular a B variable, con resistencia R.
          Las líneas de campo se juntan a medida que B aumenta — más líneas por unidad
          de área = mayor intensidad. Hallar dB/dt para que circule la corriente I.
        </p>
        <details>
          <summary>Fórmulas</summary>
          <span className="frm">A = a · b</span>
          <span className="frm">ε = I · R    (Ohm)</span>
          <span className="frm">ε = N · A · |dB/dt|   (Faraday)</span>
          <span className="frm">→ dB/dt = I·R / (N·A)</span>
        </details>
      </div>

      <div className="controls-block">
        <div className="anim-wrap">
          <svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="p3-clip">
                <rect x="10" y="10" width="360" height="180" />
              </clipPath>
            </defs>

            {/* Fondo del campo */}
            <rect x="10" y="10" width="360" height="180" rx="4"
              fill="var(--svg-bg)" stroke="var(--svg-stroke)"
              strokeWidth="1" strokeDasharray="3 3" />

            {/* Líneas de campo — cantidad proporcional a dBdt */}
            <g clipPath="url(#p3-clip)">
              <FieldLines nLines={nFieldLines} animDuration={parseFloat(fieldAnimDuration)} />
            </g>

            {/* Label de intensidad */}
            <text x="190" y="196" className="lbl-svg" textAnchor="middle"
              fill="var(--accent-3)" opacity="0.8" fontWeight="700">
              {nFieldLines} líneas — B {''}
              {dBdt > 0 ? `aumentando (dB/dt = ${dBdt < 1 ? (dBdt * 1000).toFixed(1) + ' mT/s' : dBdt.toFixed(2) + ' T/s'})` : 'constante'}
            </text>

            {/* Bobina centrada */}
            <rect className="coil-fill" x={rx} y={ry} width={wpx} height={hpx} />
            {Array.from({ length: nLines }).map((_, i) => {
              const yLine = ry + ((i + 1) * hpx) / (nLines + 1);
              return <line key={i}
                x1={rx + 3} y1={yLine} x2={rx + wpx - 3} y2={yLine}
                stroke="var(--accent-2)" strokeWidth="1" opacity="0.6" />;
            })}
            <text x={cx} y={ry - 14} className="lbl-svg" textAnchor="middle"
              fill="var(--accent-2)" fontWeight="700">
              N = {Math.round(N)} vueltas
            </text>
            <text x={cx} y={ry - 4} className="lbl-svg" textAnchor="middle"
              fill="var(--accent-2)" opacity="0.7">
              {(aSI * 100).toFixed(1)}cm × {(bSI * 100).toFixed(1)}cm
            </text>

            {/* Flecha de corriente inducida */}
            <g stroke="var(--accent)" strokeWidth={arrowWidth.toFixed(2)} fill="none"
              opacity={arrowOpacity.toFixed(2)}
              style={{ animation: `p3-current ${fieldAnimDuration}s ease-in-out infinite` }}>
              <path d={`M ${rx} ${ry + 6} Q ${cx} ${ry - 8} ${rx + wpx} ${ry + 6}`}
                strokeLinecap="round" />
              <polygon points={`${rx + wpx - 5},${ry + 3} ${rx + wpx + 3},${ry + 6} ${rx + wpx - 5},${ry + 9}`}
                fill="var(--accent)" stroke="none" />
            </g>
            <text x={cx} y={ry - 26} className="lbl-svg" textAnchor="middle"
              fill="var(--accent)" fontWeight="700" opacity={arrowOpacity.toFixed(2)}>
              I = {ISI >= 1 ? ISI.toFixed(2) + ' A' : ISI >= 0.001 ? (ISI * 1000).toFixed(1) + ' mA' : (ISI * 1e6).toFixed(1) + ' μA'}
            </text>

            <style>{`
              @keyframes p3-field-line {
                0%   { opacity: 0.3; stroke-width: 1; }
                50%  { opacity: 0.7; stroke-width: 2; }
                100% { opacity: 0.3; stroke-width: 1; }
              }
              @keyframes p3-current {
                0%   { opacity: ${(arrowOpacity * 0.5).toFixed(2)}; }
                50%  { opacity: ${Math.min(arrowOpacity + 0.15, 1).toFixed(2)}; }
                100% { opacity: ${(arrowOpacity * 0.5).toFixed(2)}; }
              }
            `}</style>
          </svg>
        </div>

        <SliderControl label="N (vueltas)" value={N} onChange={setN} min={1} max={500} step={1} />
        <SliderControl label="Lado a" value={a} onChange={setA} unit={aUnit} onUnitChange={setAUnit}
          unitOptions={[{ label: 'cm', value: '0.01' }, { label: 'mm', value: '0.001' }, { label: 'm', value: '1' }]}
          min={0.5} max={50} step={0.5} />
        <SliderControl label="Lado b" value={b} onChange={setB} unit={bUnit} onUnitChange={setBUnit}
          unitOptions={[{ label: 'cm', value: '0.01' }, { label: 'mm', value: '0.001' }, { label: 'm', value: '1' }]}
          min={0.5} max={50} step={0.5} />
        <SliderControl label="Resistencia R" value={R} onChange={setR} unit={RUnit} onUnitChange={setRUnit}
          unitOptions={[{ label: 'Ω', value: '1' }, { label: 'kΩ', value: '1000' }, { label: 'mΩ', value: '0.001' }]}
          min={0.1} max={200} step={0.1} />
        <SliderControl label="Corriente inducida I" value={I} onChange={setI} unit={IUnit} onUnitChange={setIUnit}
          unitOptions={[{ label: 'A', value: '1' }, { label: 'mA', value: '0.001' }, { label: 'μA', value: '0.000001' }]}
          min={0.001} max={10} step={0.001} />
        <div className="reset-row">
          <button className="btn btn-reset" onClick={reset}>↺ Datos del enunciado</button>
        </div>

        <GraphLegend items={[
          { symbol: '|', color: 'var(--accent-3)', label: 'Líneas de campo B',
            description: 'Cada línea representa el campo magnético. Más líneas por unidad de área = B más intenso. La cantidad de líneas aumenta con dB/dt calculado — así se visualiza que B está creciendo.' },
          { symbol: '↑', color: 'var(--accent-3)', label: 'Flecha en cada línea',
            description: 'Indica la dirección del campo B (saliente, hacia el lector). El pulso de intensidad va al ritmo de la corriente I.' },
          { symbol: '▭', color: 'var(--accent-2)', label: 'Bobina',
            description: 'Bobina de N vueltas. Ancho = a, alto = b. Las líneas internas representan las vueltas.' },
          { symbol: '↺', color: 'var(--accent)', label: 'Corriente inducida I',
            description: 'La corriente que circula por la bobina debido a la fem inducida. Opacidad proporcional a I, grosor proporcional a R.' },
        ]} />
      </div>

      <div className="output-block">
        <LiveResult label="dB/dt necesario" value={calc?.dBdt ?? null} unit="T/s"
          rows={calc ? [
            { label: 'Área A = a·b', value: calc.A, unit: 'm²' },
            { label: 'ε = I·R', value: calc.fem, unit: 'V' },
            { label: 'N·A', value: N * calc.A, unit: 'm²' },
            { label: 'dB/dt = ε / (N·A)', value: calc.dBdt, unit: 'T/s' },
          ] : []} />
        {calc && <CheckPanel expected={calc.dBdt} unitOptions={DBDT_UNITS} placeholder="tu valor de dB/dt" />}
      </div>
    </div>
  );
}
