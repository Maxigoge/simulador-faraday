import React, { useState, useMemo } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import BFieldDots from '../components/BFieldDots.jsx';

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

/**
 * Problema 3 — Bobina rectangular 5cm × 8cm, N=75 vueltas, R=8Ω
 * perpendicular a un B variable. Hallar dB/dt para que I=0.1 A.
 *
 * Fórmulas: ε = I·R  (Ohm)  y  ε = N·A·dB/dt  (Faraday)
 *           → dB/dt = ε / (N·A) = I·R / (N·A)
 * Resultado esperado: dB/dt ≈ 2.67 T/s
 */
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
    if (
      [N, aSI, bSI, RSI, ISI].some((v) => isNaN(v)) ||
      N <= 0 ||
      RSI <= 0
    ) {
      return null;
    }
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

  const fieldIntensity = calc ? Math.min(calc.dBdt / 5, 1) : 0;

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
            <rect className="coil-fill" x="80" y="50" width="100" height="100" />
            <text
              x="130"
              y="105"
              className="lbl-svg"
              textAnchor="middle"
              fill="var(--accent-2)"
              fontWeight="700"
            >
              N espiras
            </text>
            <g stroke="var(--accent)" strokeWidth="2" fill="none" opacity="0.8">
              <path d="M 80 55 Q 130 45 180 55" strokeLinecap="round" />
              <polygon points="175,52 183,55 175,58" fill="var(--accent)" stroke="none" />
            </g>
            <text
              x="130"
              y="38"
              className="lbl-svg"
              fill="var(--accent)"
              textAnchor="middle"
              fontWeight="700"
            >
              I = corriente inducida
            </text>
            <g>
              <line
                x1="240"
                y1="100"
                x2="320"
                y2="100"
                stroke="var(--accent-3)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <polygon points="316,96 324,100 316,104" fill="var(--accent-3)" />
              <text
                x="280"
                y="92"
                className="lbl-svg"
                textAnchor="middle"
                fill="var(--accent-3)"
                fontWeight="700"
              >
                B(t) cambia
              </text>
              <text
                x="280"
                y="115"
                className="lbl-svg"
                textAnchor="middle"
                fill="var(--accent-3)"
              >
                dB/dt = ?
              </text>
            </g>
          </svg>
        </div>

        <SliderControl
          label="N (vueltas)"
          value={N}
          onChange={setN}
          min={1}
          max={500}
          step={1}
        />
        <SliderControl
          label="Lado a"
          value={a}
          onChange={setA}
          unit={aUnit}
          onUnitChange={setAUnit}
          unitOptions={[
            { label: 'cm', value: '0.01' },
            { label: 'mm', value: '0.001' },
            { label: 'm', value: '1' },
          ]}
          min={0.5}
          max={50}
          step={0.5}
        />
        <SliderControl
          label="Lado b"
          value={b}
          onChange={setB}
          unit={bUnit}
          onUnitChange={setBUnit}
          unitOptions={[
            { label: 'cm', value: '0.01' },
            { label: 'mm', value: '0.001' },
            { label: 'm', value: '1' },
          ]}
          min={0.5}
          max={50}
          step={0.5}
        />
        <SliderControl
          label="Resistencia R"
          value={R}
          onChange={setR}
          unit={RUnit}
          onUnitChange={setRUnit}
          unitOptions={[
            { label: 'Ω', value: '1' },
            { label: 'kΩ', value: '1000' },
            { label: 'mΩ', value: '0.001' },
          ]}
          min={0.1}
          max={200}
          step={0.1}
        />
        <SliderControl
          label="Corriente inducida I"
          value={I}
          onChange={setI}
          unit={IUnit}
          onUnitChange={setIUnit}
          unitOptions={[
            { label: 'A', value: '1' },
            { label: 'mA', value: '0.001' },
            { label: 'μA', value: '0.000001' },
          ]}
          min={0.001}
          max={10}
          step={0.001}
        />
        <div className="reset-row">
          <button className="btn btn-reset" onClick={reset}>
            ↺ Datos del enunciado
          </button>
        </div>
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
