import React, { useState, useMemo } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import BFieldDots from '../components/BFieldDots.jsx';
import GraphLegend from '../components/GraphLegend.jsx';

const DEFAULTS = {
  N: 75,
  a: 5, aUnit: 0.01,
  b: 8, bUnit: 0.01,
  R: 8, RUnit: 1,
  I: 0.1, IUnit: 1,
};

const DBDT_UNITS = [
  { label: 'T/s', value: '1' },
  { label: 'mT/s', value: '0.001' },
  { label: 'μT/s', value: '0.000001' },
];

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

  // Intensidad proporcional al dBdt: satura en 10 T/s
  const fieldIntensity = calc ? Math.min(calc.dBdt / 10, 1) : 0;

  // Velocidad del pulso: I grande = campo cambia más rápido = pulso más rápido
  // I va de 0.001 a 10 A → duración del pulso de 2.5s (lento) a 0.5s (rápido)
  const ISI = parseFloat(I) * IUnit || 0.1;
  const IClamp = Math.min(Math.max(ISI, 0.001), 10);
  const pulseDuration = 2.5 - ((IClamp - 0.001) / (10 - 0.001)) * (2.5 - 0.5);

  // Grosor de la flecha de corriente según R: R grande = flecha más gruesa
  // R va de 0.1 a 200 Ω → strokeWidth de 1.5 a 4
  const RSI = parseFloat(R) * RUnit || 8;
  const RClamp = Math.min(Math.max(RSI, 0.1), 200);
  const arrowWidth = 1.5 + ((Math.log(RClamp) - Math.log(0.1)) / (Math.log(200) - Math.log(0.1))) * (4 - 1.5);

  // Opacidad de la flecha según I: más corriente = flecha más visible
  const arrowOpacity = 0.3 + ((IClamp - 0.001) / (10 - 0.001)) * 0.65;

  // SVG — mapeo lineal: sliders a/b van de 0.5cm a 50cm → px de 16 a 120/100
  const aSI = parseFloat(a) * aUnit || 0.05;
  const bSI = parseFloat(b) * bUnit || 0.08;
  const abMin = 0.005, abMax = 0.50;
  const aClamp = Math.min(Math.max(aSI, abMin), abMax);
  const bClamp = Math.min(Math.max(bSI, abMin), abMax);
  const wpx = 16 + ((aClamp - abMin) / (abMax - abMin)) * (120 - 16);
  const hpx = 16 + ((bClamp - abMin) / (abMax - abMin)) * (100 - 16);
  const cx = 130; // centro X
  const cy = 100; // centro Y
  const rx = cx - wpx / 2;
  const ry = cy - hpx / 2;

  // Líneas internas = vueltas (1 cada 10, máx 12)
  const nLines = Math.min(Math.max(Math.round(parseFloat(N) / 10), 1), 12);

  return (
    <div className="card has-two-cols">
      <div className="card-header-block">
        <span className="pnum">PROBLEMA 3</span>
        <h2 className="card-title">¿Con qué rapidez debe cambiar B?</h2>
        <p className="card-desc">
          Bobina rectangular de N vueltas, perpendicular a B, con resistencia R.
          Hallar dB/dt para que la corriente inducida sea I.
        </p>
        <details>
          <summary>Fórmulas</summary>
          <span className="frm">A = a · b</span>
          <span className="frm">ε = I · R    (Ohm)</span>
          <span className="frm">ε = N · A · |dB/dt|</span>
          <span className="frm">→ dB/dt = ε / (N·A) = I·R / (N·A)</span>
        </details>
      </div>

      <div className="controls-block">
        <div className="anim-wrap">
          <svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
            {/* Campo de fondo */}
            <rect className="field-bg" x="10" y="10" width="360" height="180" strokeWidth="1" strokeDasharray="3 3" />
            <BFieldDots intensity={fieldIntensity} cols={8} rows={4} startX={30} startY={30} stepX={45} stepY={45} animate={true} animationDuration={pulseDuration} />

            {/* Bobina — escala con a y b */}
            <rect className="coil-fill" x={rx} y={ry} width={wpx} height={hpx} />

            {/* Líneas internas = vueltas */}
            {Array.from({ length: nLines }).map((_, i) => {
              const yLine = ry + ((i + 1) * hpx) / (nLines + 1);
              return (
                <line key={i} x1={rx + 3} y1={yLine} x2={rx + wpx - 3} y2={yLine}
                  stroke="var(--accent-2)" strokeWidth="1" opacity="0.5" />
              );
            })}

            {/* Label N y dimensiones */}
            <text x={cx} y={ry - 14} className="lbl-svg" textAnchor="middle" fill="var(--accent-2)" fontWeight="700">
              N = {Math.round(N)} vueltas
            </text>
            <text x={cx} y={ry - 4} className="lbl-svg" textAnchor="middle" fill="var(--accent-2)" opacity="0.7">
              {(aSI * 100).toFixed(1)}cm × {(bSI * 100).toFixed(1)}cm
            </text>

            {/* Flecha de corriente inducida — grosor por R, opacidad por I */}
            <g stroke="var(--accent)" strokeWidth={arrowWidth.toFixed(2)} fill="none" opacity={arrowOpacity.toFixed(2)}
              style={{ animation: `p3-current ${pulseDuration.toFixed(2)}s ease-in-out infinite` }}>
              <path d={`M ${rx} ${ry + 6} Q ${cx} ${ry - 6} ${rx + wpx} ${ry + 6}`} strokeLinecap="round" />
              <polygon
                points={`${rx + wpx - 5},${ry + 3} ${rx + wpx + 3},${ry + 6} ${rx + wpx - 5},${ry + 9}`}
                fill="var(--accent)" stroke="none" />
            </g>
            <text x={cx} y={ry - 24} className="lbl-svg" fill="var(--accent)" textAnchor="middle" fontWeight="700"
              opacity={arrowOpacity.toFixed(2)}>
              I = {ISI >= 0.001 ? (ISI >= 1 ? ISI.toFixed(2) + ' A' : (ISI * 1000).toFixed(2) + ' mA') : (ISI * 1e6).toFixed(2) + ' μA'}
            </text>

            {/* Flecha B variable — a la derecha */}
            <g>
              <line x1={rx + wpx + 20} y1={cy} x2={rx + wpx + 90} y2={cy}
                stroke="var(--accent-3)" strokeWidth="1.5" strokeDasharray="4 3" />
              <polygon points={`${rx + wpx + 86},${cy - 4} ${rx + wpx + 94},${cy} ${rx + wpx + 86},${cy + 4}`}
                fill="var(--accent-3)" />
              <text x={rx + wpx + 55} y={cy - 8} className="lbl-svg" textAnchor="middle"
                fill="var(--accent-3)" fontWeight="700">B(t)</text>
              <text x={rx + wpx + 55} y={cy + 16} className="lbl-svg" textAnchor="middle"
                fill="var(--accent-3)">dB/dt = ?</text>
            </g>

            <style>{`
              @keyframes p3-current {
                0%   { opacity: ${(arrowOpacity * 0.6).toFixed(2)}; }
                50%  { opacity: ${Math.min(arrowOpacity + 0.2, 1).toFixed(2)}; }
                100% { opacity: ${(arrowOpacity * 0.6).toFixed(2)}; }
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
          {
            symbol: '▭',
            color: 'var(--accent-2)',
            label: 'Rectángulo (bobina)',
            description: 'Representa la bobina de N vueltas. El ancho escala con el lado a y el alto con el lado b. Las líneas horizontales internas representan las vueltas (1 línea cada 10). El label muestra N y las dimensiones actuales.',
          },
          {
            symbol: '↺',
            color: 'var(--accent)',
            label: 'Flecha de corriente inducida',
            description: 'Representa la corriente I que circula por la bobina como resultado de la fem inducida. La opacidad escala con I (más corriente = más visible) y el grosor escala con R (más resistencia = trazomás grueso). El pulso va al mismo ritmo que los puntos.',
          },
          {
            symbol: '⊙',
            color: 'var(--accent-3)',
            label: 'Puntos del campo B(t)',
            description: 'Campo magnético variable en el tiempo. El tamaño de los puntos escala con dB/dt calculado. La velocidad del pulso escala con I: más corriente inducida implica que B cambia más rápido.',
          },
          {
            symbol: '→',
            color: 'var(--accent-3)',
            label: 'Flecha B(t) — dB/dt = ?',
            description: 'Indica que el campo B está variando en el tiempo. Es la incógnita del problema: cuál debe ser esa variación para que se induzca exactamente la corriente I pedida.',
          },
        ]} />
      </div>

      <div className="output-block">
        <LiveResult
          label="dB/dt necesario"
          value={calc?.dBdt ?? null}
          unit="T/s"
          rows={calc ? [
            { label: 'Área A = a·b', value: calc.A, unit: 'm²' },
            { label: 'ε = I·R', value: calc.fem, unit: 'V' },
            { label: 'N·A (flujo por T)', value: N * calc.A, unit: 'm²' },
            { label: 'dB/dt = ε / (N·A)', value: calc.dBdt, unit: 'T/s' },
          ] : []}
        />
        {calc && <CheckPanel expected={calc.dBdt} unitOptions={DBDT_UNITS} placeholder="tu valor de dB/dt" />}
      </div>
    </div>
  );
}
