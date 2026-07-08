import React, { useState, useMemo, useEffect, useRef } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import GraphLegend from '../components/GraphLegend.jsx';

const DEFAULTS = {
  N: 75, a: 5, aUnit: 0.01, b: 8, bUnit: 0.01,
  R: 8, RUnit: 1, I: 0.1, IUnit: 1,
};

const DBDT_UNITS = [
  { label: 'T/s',  value: '1'        },
  { label: 'mT/s', value: '0.001'    },
  { label: 'μT/s', value: '0.000001' },
];

// SVG region para las líneas de campo
const FL_X_MIN = 12;
const FL_X_MAX = 368;
const FL_Y_TOP = 14;
const FL_Y_BOT = 186;
const FL_WIDTH  = FL_X_MAX - FL_X_MIN;   // 356 px

// Máximo de líneas visibles simultáneamente
const MAX_LINES = 20;
const MIN_LINES = 3;

/**
 * GrowingFieldLines — Líneas de campo verticales y quietas.
 * La densidad aumenta progresivamente a una velocidad proporcional a dBdt.
 * Cuando llega al máximo, hace un reset suave de vuelta al mínimo (ciclo).
 * dBdt = 0 → líneas quietas (B constante, sin cambio)
 * dBdt alto → las líneas aparecen rápido (B crece rápido)
 */
function GrowingFieldLines({ dBdt }) {
  // nLines: número actual de líneas, empieza en MIN_LINES y crece hasta MAX_LINES
  const [nLines, setNLines] = useState(MIN_LINES);
  const rafRef   = useRef(null);
  const lastRef  = useRef(null);
  const nRef     = useRef(MIN_LINES);

  // Velocidad de crecimiento: líneas por segundo
  // dBdt=0 → 0 líneas/s (quieto)
  // dBdt=1 T/s → 1 línea/s
  // dBdt=10 T/s → 6 líneas/s
  const linesPerSec = Math.min(dBdt * 0.6, 6);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    lastRef.current = null;

    if (linesPerSec <= 0) {
      // B constante — mostrar densidad fija media
      setNLines(MIN_LINES);
      nRef.current = MIN_LINES;
      return;
    }

    const tick = (ts) => {
      if (lastRef.current === null) lastRef.current = ts;
      const dt = Math.min((ts - lastRef.current) / 1000, 0.05);
      lastRef.current = ts;

      nRef.current = nRef.current + linesPerSec * dt;

      if (nRef.current >= MAX_LINES) {
        // Reset suave: volver al mínimo
        nRef.current = MIN_LINES;
      }

      setNLines(Math.round(nRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [linesPerSec]);

  // Distribuir nLines líneas uniformemente en el ancho
  const lines = Array.from({ length: nLines }, (_, i) => {
    if (nLines === 1) return FL_X_MIN + FL_WIDTH / 2;
    return FL_X_MIN + (i / (nLines - 1)) * FL_WIDTH;
  });

  const arrowY = FL_Y_TOP + (FL_Y_BOT - FL_Y_TOP) * 0.38;

  return (
    <g>
      {lines.map((x, i) => (
        <g key={i}>
          <line
            x1={x} y1={FL_Y_TOP}
            x2={x} y2={FL_Y_BOT}
            stroke="var(--accent-3)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <polygon
            points={`${x - 4},${arrowY - 6} ${x},${arrowY + 4} ${x + 4},${arrowY - 6}`}
            fill="var(--accent-3)"
            opacity="0.75"
          />
        </g>
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
    const A   = aSI * bSI;
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

  const dBdt = calc?.dBdt ?? 0;

  // Bobina SVG
  const aSI   = parseFloat(a) * aUnit || 0.05;
  const bSI   = parseFloat(b) * bUnit || 0.08;
  const aClamp = Math.min(Math.max(aSI, 0.005), 0.50);
  const bClamp = Math.min(Math.max(bSI, 0.005), 0.50);
  const wpx  = 16 + ((aClamp - 0.005) / 0.495) * (120 - 16);
  const hpx  = 16 + ((bClamp - 0.005) / 0.495) * (100 - 16);
  const cx   = 190, cy = 105;
  const rx   = cx - wpx / 2, ry = cy - hpx / 2;
  const nLines = Math.min(Math.max(Math.round(parseFloat(N) / 10), 1), 12);

  // Flecha de corriente
  const ISI    = parseFloat(I) * IUnit || 0.1;
  const IClamp = Math.min(Math.max(ISI, 0.001), 10);
  const RSI    = parseFloat(R) * RUnit || 8;
  const RClamp = Math.min(Math.max(RSI, 0.1), 200);
  const arrowWidth   = 1.5 + ((Math.log(RClamp) - Math.log(0.1)) / (Math.log(200) - Math.log(0.1))) * 2.5;
  const arrowOpacity = 0.35 + ((IClamp - 0.001) / 9.999) * 0.6;
  const arrowAnimDur = (2.5 - ((IClamp - 0.001) / 9.999) * 2.0).toFixed(2);

  const dBdtLabel = dBdt === 0 ? 'B constante'
    : dBdt < 1 ? `dB/dt = ${(dBdt * 1000).toFixed(1)} mT/s`
    : `dB/dt = ${dBdt.toFixed(2)} T/s`;

  return (
    <div className="card has-two-cols">
      <div className="card-header-block">
        <span className="pnum">PROBLEMA 3</span>
        <h2 className="card-title">¿Con qué rapidez debe cambiar B?</h2>
        <p className="card-desc">
          Bobina rectangular de N vueltas, perpendicular a B variable, con resistencia R.
          Las líneas de campo se desplazan mostrando que B está aumentando —
          más rápido = mayor dB/dt. Hallar dB/dt para que circule la corriente I.
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
                <rect x={FL_X_MIN} y={FL_Y_TOP}
                  width={FL_WIDTH} height={FL_Y_BOT - FL_Y_TOP} />
              </clipPath>
            </defs>

            {/* Fondo */}
            <rect x={FL_X_MIN} y={FL_Y_TOP}
              width={FL_WIDTH} height={FL_Y_BOT - FL_Y_TOP}
              rx="4" fill="var(--svg-bg)"
              stroke="var(--svg-stroke)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Líneas de campo creciendo en densidad */}
            <g clipPath="url(#p3-clip)">
              <GrowingFieldLines dBdt={dBdt} />
            </g>

            {/* Label */}
            <text x="190" y="198" className="lbl-svg" textAnchor="middle"
              fill="var(--accent-3)" opacity="0.85" fontWeight="700">
              {dBdt === 0
                ? 'B constante — densidad de líneas fija'
                : `B creciendo a ${dBdtLabel} — líneas aparecen ${ dBdt < 2 ? 'despacio' : dBdt < 6 ? 'moderado' : 'rápido'}`}
            </text>

            {/* Bobina */}
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

            {/* Corriente inducida */}
            <g stroke="var(--accent)" strokeWidth={arrowWidth.toFixed(2)} fill="none"
              opacity={arrowOpacity.toFixed(2)}
              style={{ animation: `p3-current ${arrowAnimDur}s ease-in-out infinite` }}>
              <path d={`M ${rx} ${ry + 6} Q ${cx} ${ry - 8} ${rx + wpx} ${ry + 6}`}
                strokeLinecap="round" />
              <polygon
                points={`${rx + wpx - 5},${ry + 3} ${rx + wpx + 3},${ry + 6} ${rx + wpx - 5},${ry + 9}`}
                fill="var(--accent)" stroke="none" />
            </g>
            <text x={cx} y={ry - 26} className="lbl-svg" textAnchor="middle"
              fill="var(--accent)" fontWeight="700" opacity={arrowOpacity.toFixed(2)}>
              I = {ISI >= 1 ? ISI.toFixed(2) + ' A'
                 : ISI >= 0.001 ? (ISI * 1000).toFixed(1) + ' mA'
                 : (ISI * 1e6).toFixed(1) + ' μA'}
            </text>

            <style>{`
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
            description: 'Representan el campo magnético. La densidad (cantidad de líneas por unidad de área) es proporcional a la intensidad de B. A mayor dB/dt, las líneas aparecen más rápido — B está creciendo velozmente. Si dBdt=0, la densidad es fija (B constante).' },
          { symbol: '↓', color: 'var(--accent-3)', label: 'Flecha en cada línea',
            description: 'Indica la dirección del campo B (perpendicular al plano de la bobina, hacia el lector).' },
          { symbol: '▭', color: 'var(--accent-2)', label: 'Bobina',
            description: 'N vueltas perpendiculares a B. Ancho = a, alto = b. Líneas internas = vueltas.' },
          { symbol: '↺', color: 'var(--accent)', label: 'Corriente inducida I',
            description: 'Circula porque el flujo a través de la bobina está cambiando. Opacidad ∝ I, grosor ∝ R.' },
        ]} />
      </div>

      <div className="output-block">
        <LiveResult label="dB/dt necesario" value={calc?.dBdt ?? null} unit="T/s"
          rows={calc ? [
            { label: 'Área A = a·b',       value: calc.A,    unit: 'm²'  },
            { label: 'ε = I·R',            value: calc.fem,  unit: 'V'   },
            { label: 'N·A',                value: N * calc.A, unit: 'm²' },
            { label: 'dB/dt = ε / (N·A)',  value: calc.dBdt, unit: 'T/s' },
          ] : []} />
        {calc && (
          <CheckPanel
            expected={calc.dBdt}
            unitOptions={DBDT_UNITS}
            placeholder="tu valor de dB/dt"
          />
        )}
      </div>
    </div>
  );
}
