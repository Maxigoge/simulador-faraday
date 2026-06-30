import React, { useState, useMemo } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import BFieldDots from '../components/BFieldDots.jsx';
import GraphLegend from '../components/GraphLegend.jsx';

const DEFAULTS = {
  N: 50, a: 5, aUnit: 0.01, b: 10, bUnit: 0.01,
  B: 0.5, BUnit: 1, dt: 0.25, dtUnit: 1,
};

const FEM_UNITS = [
  { label: 'V', value: '1' },
  { label: 'mV', value: '0.001' },
  { label: 'kV', value: '1000' },
];

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
    if ([N, aSI, bSI, BSI, dtSI].some((v) => isNaN(v)) || dtSI <= 0) return null;
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

  // SVG dims
  const aClamp = Math.min(Math.max(parseFloat(a) * aUnit || 0.05, 0.005), 0.50);
  const bClamp = Math.min(Math.max(parseFloat(b) * bUnit || 0.10, 0.005), 0.50);
  const wpx = 16 + ((aClamp - 0.005) / 0.495) * (120 - 16);
  const hpx = 16 + ((bClamp - 0.005) / 0.495) * (100 - 16);
  const nLines = Math.min(Math.max(Math.round(parseFloat(N) / 10), 1), 12);

  const BSI = parseFloat(BField) * BUnit || 0;
  const fieldIntensity = Math.min(BSI / 5, 1);

  const dtSI = parseFloat(dt) * dtUnit || 0.25;
  const dtClamp = Math.min(Math.max(dtSI, 0.01), 5);
  // moveDuration = tiempo que tarda en cruzar (proporcional a Δt)
  const moveDuration = 0.4 + ((dtClamp - 0.01) / 4.99) * 3.6;
  // pausaDentro = tiempo que permanece adentro SIN fem (para mostrar que no hay variación)
  const pausaDentro = 1.5;
  // total = cruzando + adentro_quieta + reset
  const totalDuration = (moveDuration + pausaDentro + 1.0).toFixed(2);

  // Porcentajes del ciclo:
  // 0% → empieza a moverse desde B=0
  // cruzandoPct% → termina de cruzar la línea (fem activa durante este tramo)
  // dentroStartPct% → está adentro, flujo constante, SIN fem
  // resetPct% → desaparece y vuelve al inicio
  const total = parseFloat(totalDuration);
  const cruzandoPct  = (moveDuration / total * 100).toFixed(1);
  const dentroEndPct = ((moveDuration + pausaDentro) / total * 100).toFixed(1);
  const resetPct     = ((moveDuration + pausaDentro + 0.3) / total * 100).toFixed(1);
  const reaparecePct = ((moveDuration + pausaDentro + 0.7) / total * 100).toFixed(1);

  const coilStartX = 90;
  const coilEndX   = 270;
  const cy = 100;
  const travel = coilEndX - coilStartX;

  return (
    <div className="card has-two-cols">
      <div className="card-header-block">
        <span className="pnum">PROBLEMA 1</span>
        <h2 className="card-title">Bobina rectangular cae en un campo</h2>
        <p className="card-desc">
          Una bobina de N vueltas cae desde donde B=0 hasta una zona con B
          perpendicular a su plano. La fem se induce <strong>solo mientras cruza</strong> la
          frontera — una vez adentro el flujo es constante y la fem es cero.
        </p>
        <details>
          <summary>Fórmula</summary>
          <span className="frm">A = a · b</span>
          <span className="frm">ΔΦ = B · A   (ΔB = B − 0, mientras cruza)</span>
          <span className="frm">ε = N · ΔΦ / Δt = N·B·A/Δt</span>
          <span className="frm">ε = 0 cuando la bobina está completamente adentro</span>
        </details>
      </div>

      <div className="controls-block">
        <div className="anim-wrap">
          <svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="p1-clip">
                <rect x="0" y="0" width="380" height="200" />
              </clipPath>
            </defs>

            {/* Zona B = 0 */}
            <rect x="0" y="0" width="180" height="200" fill="var(--svg-bg)" opacity="0.3" />
            <text x="90" y="18" className="lbl-svg" textAnchor="middle" opacity="0.6">B = 0</text>

            {/* Zona con campo */}
            <rect className="field-bg" x="180" y="0" width="200" height="200"
              strokeWidth="1" strokeDasharray="3 3" />
            <BFieldDots intensity={fieldIntensity} animate={true}
              animationDuration={parseFloat(totalDuration) * 0.5}
              cols={5} rows={5} startX={210} startY={40} stepX={35} stepY={30} />
            <text x="280" y="18" className="lbl-svg" textAnchor="middle">
              B = {parseFloat(BField) || 0} {['T','mT','μT'][[1,0.001,0.000001].indexOf(BUnit)] ?? 'T'}
            </text>

            {/* Línea divisoria */}
            <line x1="180" y1="0" x2="180" y2="200"
              stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.5" />

            {/* Bobina animada */}
            <g clipPath="url(#p1-clip)"
              style={{ animation: `p1-move ${totalDuration}s linear infinite` }}>
              <rect className="coil-fill"
                x={coilStartX - wpx / 2} y={cy - hpx / 2} width={wpx} height={hpx} />
              {Array.from({ length: nLines }).map((_, i) => {
                const yLine = (cy - hpx / 2) + ((i + 1) * hpx) / (nLines + 1);
                return <line key={i}
                  x1={coilStartX - wpx / 2 + 3} y1={yLine}
                  x2={coilStartX + wpx / 2 - 3} y2={yLine}
                  stroke="var(--accent-2)" strokeWidth="1" opacity="0.5" />;
              })}
              <text x={coilStartX} y={cy - hpx / 2 - 6}
                className="lbl-svg" textAnchor="middle" fill="var(--accent-2)" fontWeight="700">
                N = {Math.round(N)}
              </text>
              {/* Flecha de movimiento */}
              <g opacity="0.85">
                <line x1={coilStartX + wpx / 2 + 5} y1={cy}
                  x2={coilStartX + wpx / 2 + 22} y2={cy}
                  stroke="var(--accent)" strokeWidth="2" />
                <polygon points={`
                  ${coilStartX + wpx / 2 + 18},${cy - 4}
                  ${coilStartX + wpx / 2 + 26},${cy}
                  ${coilStartX + wpx / 2 + 18},${cy + 4}`}
                  fill="var(--accent)" />
              </g>
            </g>

            {/* ── ESTADO: cruzando → ε activa (verde/naranja) ── */}
            <g style={{ animation: `p1-fem-crossing ${totalDuration}s linear infinite` }}>
              <rect x="182" y="2" width="196" height="196" rx="4"
                fill="none" stroke="var(--accent)" strokeWidth="2.5" opacity="0.9"
                strokeDasharray="0" />
              <text x="280" y="100" className="lbl-svg" textAnchor="middle"
                fill="var(--accent)" fontWeight="700" fontSize="13">ε ≠ 0</text>
              <text x="280" y="116" className="lbl-svg" textAnchor="middle"
                fill="var(--accent)" fontSize="10">↯ fem inducida</text>
              <text x="280" y="130" className="lbl-svg" textAnchor="middle"
                fill="var(--accent)" fontSize="9">flujo está cambiando</text>
            </g>

            {/* ── ESTADO: adentro → ε = 0 (gris, flujo constante) ── */}
            <g style={{ animation: `p1-fem-inside ${totalDuration}s linear infinite` }}>
              <rect x="182" y="2" width="196" height="196" rx="4"
                fill="none" stroke="var(--ink-dim)" strokeWidth="1.5" opacity="0.6"
                strokeDasharray="4 4" />
              <text x="280" y="100" className="lbl-svg" textAnchor="middle"
                fill="var(--ink-dim)" fontWeight="700" fontSize="13">ε = 0</text>
              <text x="280" y="116" className="lbl-svg" textAnchor="middle"
                fill="var(--ink-dim)" fontSize="10">flujo constante</text>
              <text x="280" y="130" className="lbl-svg" textAnchor="middle"
                fill="var(--ink-dim)" fontSize="9">sin variación → sin fem</text>
            </g>

            <style>{`
              /* Bobina: cruza de izq a der, pausa adentro, reset */
              @keyframes p1-move {
                0%            { transform: translateX(0px);       opacity: 1; }
                ${cruzandoPct}%  { transform: translateX(${travel}px); opacity: 1; }
                ${dentroEndPct}% { transform: translateX(${travel}px); opacity: 1; }
                ${resetPct}%     { transform: translateX(${travel}px); opacity: 0; }
                ${parseFloat(resetPct) + 0.1}% { transform: translateX(0px); opacity: 0; }
                ${reaparecePct}% { transform: translateX(0px);    opacity: 1; }
                100%          { transform: translateX(0px);       opacity: 1; }
              }
              /* Borde naranja + ε≠0: visible SOLO mientras cruza */
              @keyframes p1-fem-crossing {
                0%               { opacity: 0; }
                2%               { opacity: 0; }
                5%               { opacity: 1; }
                ${parseFloat(cruzandoPct) - 2}% { opacity: 1; }
                ${cruzandoPct}%  { opacity: 0; }
                100%             { opacity: 0; }
              }
              /* Borde gris + ε=0: visible SOLO cuando está adentro */
              @keyframes p1-fem-inside {
                0%               { opacity: 0; }
                ${cruzandoPct}%  { opacity: 0; }
                ${parseFloat(cruzandoPct) + 3}% { opacity: 1; }
                ${dentroEndPct}% { opacity: 1; }
                ${parseFloat(dentroEndPct) + 2}% { opacity: 0; }
                100%             { opacity: 0; }
              }
            `}</style>
          </svg>
        </div>

        <SliderControl label="N (vueltas)" value={N} onChange={setN} min={1} max={500} step={1} displayUnit="" />
        <SliderControl label="Lado a" value={a} onChange={setA} unit={aUnit} onUnitChange={setAUnit}
          unitOptions={[{ label: 'cm', value: '0.01' }, { label: 'mm', value: '0.001' }, { label: 'm', value: '1' }]}
          min={0.5} max={50} step={0.5} />
        <SliderControl label="Lado b" value={b} onChange={setB} unit={bUnit} onUnitChange={setBUnit}
          unitOptions={[{ label: 'cm', value: '0.01' }, { label: 'mm', value: '0.001' }, { label: 'm', value: '1' }]}
          min={0.5} max={50} step={0.5} />
        <SliderControl label="Campo B" value={BField} onChange={setBField} unit={BUnit} onUnitChange={setBFieldUnit}
          unitOptions={[{ label: 'T', value: '1' }, { label: 'mT', value: '0.001' }, { label: 'μT', value: '0.000001' }]}
          min={0} max={5} step={0.05} />
        <SliderControl label="Tiempo Δt" value={dt} onChange={setDt} unit={dtUnit} onUnitChange={setDtUnit}
          unitOptions={[{ label: 's', value: '1' }, { label: 'ms', value: '0.001' }]}
          min={0.01} max={5} step={0.01} />
        <div className="reset-row">
          <button className="btn btn-reset" onClick={reset}>↺ Datos del enunciado</button>
        </div>

        <GraphLegend items={[
          { symbol: '▭', color: 'var(--accent-2)', label: 'Bobina',
            description: 'Bobina de N vueltas. Ancho = lado a, alto = lado b. Líneas internas = vueltas.' },
          { symbol: '⊙', color: 'var(--accent-3)', label: 'Campo B',
            description: 'Campo magnético saliendo del plano. Tamaño proporcional a la intensidad de B.' },
          { symbol: '⚡', color: 'var(--accent)', label: 'ε ≠ 0 (borde naranja)',
            description: 'Aparece SOLO mientras la bobina cruza la frontera. El flujo cambia → hay fem inducida.' },
          { symbol: '○', color: 'var(--ink-dim)', label: 'ε = 0 (borde gris)',
            description: 'Aparece cuando la bobina está completamente adentro. Flujo constante → fem = 0.' },
          { symbol: '|', color: 'var(--accent)', label: 'Frontera',
            description: 'Límite entre la zona sin campo y la zona con campo B.' },
        ]} />
      </div>

      <div className="output-block">
        <LiveResult label="fem inducida" value={calc?.fem ?? null} unit="V"
          rows={calc ? [
            { label: 'Área A = a·b', value: calc.A, unit: 'm²' },
            { label: 'ΔΦ por espira', value: calc.dPhi, unit: 'Wb' },
            { label: 'Flujo total enlazado', value: N * calc.dPhi, unit: 'Wb' },
            { label: 'ε = N·ΔΦ/Δt', value: calc.fem, unit: 'V' },
          ] : []} />
        {calc && <CheckPanel expected={calc.fem} unitOptions={FEM_UNITS} placeholder="tu valor de ε" />}
      </div>
    </div>
  );
}
