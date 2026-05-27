import React, { useState, useMemo } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import BFieldDots from '../components/BFieldDots.jsx';

const DEFAULTS = {
  N: 50,
  a: 5,         // cm
  aUnit: 0.01,
  b: 10,        // cm
  bUnit: 0.01,
  B: 0.5,       // T
  BUnit: 1,
  dt: 0.25,     // s
  dtUnit: 1,
};

const FEM_UNITS = [
  { label: 'V', value: '1' },
  { label: 'mV', value: '0.001' },
  { label: 'kV', value: '1000' },
];

/**
 * Problema 1 — Una bobina rectangular de 50 vueltas y dimensiones 5cm × 10cm
 * cae desde una zona donde B=0 hasta una donde B=0.5 T en 0.25 s.
 * Calcular la fem promedio.
 *
 * Fórmula: ε = N · ΔΦ / Δt = N · B · A / Δt
 * Resultado esperado: ε = 0.5 V
 */
export default function Problem1() {
  const [N, setN] = useState(DEFAULTS.N);
  const [a, setA] = useState(DEFAULTS.a);
  const [aUnit, setAUnit] = useState(DEFAULTS.aUnit);
  const [b, setB] = useState(DEFAULTS.b);
  const [bUnit, setBUnit] = useState(DEFAULTS.bUnit);
  const [BField, setBField] = useState(DEFAULTS.B);
  const [BUnit, setBFieldUnit] = useState(DEFAULTS.BUnit);
  const [dt, setDt] = useState(DEFAULTS.dt);
  const [dtUnit, setDtUnit] = useState(DEFAULTS.dtUnit);

  const calc = useMemo(() => {
    const aSI = parseFloat(a) * aUnit;
    const bSI = parseFloat(b) * bUnit;
    const BSI = parseFloat(BField) * BUnit;
    const dtSI = parseFloat(dt) * dtUnit;
    if (
      [N, aSI, bSI, BSI, dtSI].some((v) => isNaN(v)) ||
      dtSI <= 0
    ) {
      return null;
    }
    const A = aSI * bSI;
    const dPhi = BSI * A;
    const fem = N * dPhi / dtSI;
    return { A, dPhi, BSI, fem };
  }, [N, a, aUnit, b, bUnit, BField, BUnit, dt, dtUnit]);

  const reset = () => {
    setN(DEFAULTS.N);
    setA(DEFAULTS.a); setAUnit(DEFAULTS.aUnit);
    setB(DEFAULTS.b); setBUnit(DEFAULTS.bUnit);
    setBField(DEFAULTS.B); setBFieldUnit(DEFAULTS.BUnit);
    setDt(DEFAULTS.dt); setDtUnit(DEFAULTS.dtUnit);
  };

  // SVG: coil dims (escalado)
  const scale = 100 / 0.12;
  const aMeters = parseFloat(a) * aUnit || 0.05;
  const bMeters = parseFloat(b) * bUnit || 0.10;
  const wpx = Math.min(Math.max(aMeters * scale, 20), 120);
  const hpx = Math.min(Math.max(bMeters * scale, 20), 100);
  const fieldIntensity = calc ? Math.min(Math.abs(calc.BSI) / 2, 1) : 0;

  return (
    <div className="card has-two-cols">
      <div className="card-header-block">
        <span className="pnum">PROBLEMA 1</span>
        <h2 className="card-title">Bobina rectangular cae en un campo</h2>
        <p className="card-desc">
          Una bobina de N vueltas cae desde donde B=0 hasta una zona con B
          perpendicular a su plano. Calcular la fem promedio inducida.
        </p>
        <details>
          <summary>Fórmula</summary>
          <span className="frm">A = a · b</span>
          <span className="frm">ΔΦ = B · A   (por espira, ΔB = B − 0)</span>
          <span className="frm">ε = N · ΔΦ / Δt = N·B·A/Δt</span>
        </details>
      </div>

      <div className="controls-block">
        {/* SVG */}
        <div className="anim-wrap">
          <svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
            <rect
              className="field-bg"
              x="180"
              y="20"
              width="190"
              height="160"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <BFieldDots intensity={fieldIntensity} />
            <text x="275" y="14" className="lbl-svg" textAnchor="middle">
              Zona con B
            </text>

            <rect
              className="coil-fill"
              x={80 - wpx / 2}
              y={100 - hpx / 2}
              width={wpx}
              height={hpx}
            />
            <text
              x="80"
              y="105"
              className="lbl-svg"
              textAnchor="middle"
              fill="var(--accent-2)"
              fontWeight="700"
            >
              N espiras
            </text>

            <g opacity="0.7">
              <line x1="80" y1="125" x2="80" y2="155" stroke="var(--accent)" strokeWidth="2" />
              <polygon points="76,150 80,160 84,150" fill="var(--accent)" />
              <text x="93" y="148" className="lbl-svg" fill="var(--accent)">cae</text>
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
          displayUnit=""
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
          label="Campo B"
          value={BField}
          onChange={setBField}
          unit={BUnit}
          onUnitChange={setBFieldUnit}
          unitOptions={[
            { label: 'T', value: '1' },
            { label: 'mT', value: '0.001' },
            { label: 'μT', value: '0.000001' },
          ]}
          min={0}
          max={5}
          step={0.05}
        />
        <SliderControl
          label="Tiempo Δt"
          value={dt}
          onChange={setDt}
          unit={dtUnit}
          onUnitChange={setDtUnit}
          unitOptions={[
            { label: 's', value: '1' },
            { label: 'ms', value: '0.001' },
          ]}
          min={0.01}
          max={5}
          step={0.01}
        />
        <div className="reset-row">
          <button className="btn btn-reset" onClick={reset}>
            ↺ Datos del enunciado
          </button>
        </div>
      </div>

      <div className="output-block">
        <LiveResult
          label="fem inducida"
          value={calc?.fem ?? null}
          unit="V"
          rows={calc ? [
            { label: 'Área A = a·b', value: calc.A, unit: 'm²' },
            { label: 'ΔΦ por espira', value: calc.dPhi, unit: 'Wb' },
            { label: 'Flujo total enlazado', value: N * calc.dPhi, unit: 'Wb' },
            { label: 'ε = N·ΔΦ/Δt', value: calc.fem, unit: 'V' },
          ] : []}
        />
        {calc && (
          <CheckPanel
            expected={calc.fem}
            unitOptions={FEM_UNITS}
            placeholder="tu valor de ε"
          />
        )}
      </div>
    </div>
  );
}
