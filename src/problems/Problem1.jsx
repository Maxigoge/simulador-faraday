import React, { useState, useMemo } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import BFieldDots from '../components/BFieldDots.jsx';
import GraphLegend from '../components/GraphLegend.jsx';

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

  // SVG — mapeo lineal slider → px
  const aMeters = parseFloat(a) * aUnit || 0.05;
  const bMeters = parseFloat(b) * bUnit || 0.10;
  const aClamp = Math.min(Math.max(aMeters, 0.005), 0.50);
  const bClamp = Math.min(Math.max(bMeters, 0.005), 0.50);
  const wpx = 16 + ((aClamp - 0.005) / (0.50 - 0.005)) * (130 - 16);
  const hpx = 16 + ((bClamp - 0.005) / (0.50 - 0.005)) * (110 - 16);

  // Líneas internas proporcionales a N
  const nLines = Math.min(Math.max(Math.round(parseFloat(N) / 10), 1), 12);

  // Duración de la animación según Δt (0.01s→0.4s rápido, 5s→4s lento)
  const dtSI = parseFloat(dt) * dtUnit || 0.25;
  // Duración total = tiempo proporcional a Δt + 2s fijos de pausa
  // Δt chico (0.01s) → 0.4s de movimiento + 2s pausa = 2.4s total
  // Δt grande (5s)   → 4.0s de movimiento + 2s pausa = 6.0s total
  const dtClamp = Math.min(Math.max(dtSI, 0.01), 5);
  const moveDuration = 0.4 + ((dtClamp - 0.01) / (5 - 0.01)) * (4.0 - 0.4);
  const animDuration = (moveDuration + 2.0).toFixed(2);

  // Intensidad proporcional al rango real del slider (0 a 5T → 0 a 1)
  const BSI = parseFloat(BField) * BUnit || 0;
  const fieldIntensity = Math.min(BSI / 5, 1);

  // Posiciones fijas de la animación — independientes del tamaño de la bobina.
  // La bobina siempre arranca centrada en la zona izquierda y termina en la derecha.
  // Un clipPath evita que se vea fuera del SVG si la bobina es muy grande.
  const coilStartX = 90;   // centro X inicio (zona B=0)
  const coilEndX   = 270;  // centro X fin    (zona con B)
  const cy = 100;          // centro Y fijo

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
        <div className="anim-wrap">
          <svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="svgClip">
                <rect x="0" y="0" width="380" height="200" />
              </clipPath>
            </defs>

            {/* ── Zona sin campo (izquierda) ── */}
            <rect x="0" y="0" width="180" height="200"
              fill="var(--svg-bg)" opacity="0.3" />
            <text x="90" y="18" className="lbl-svg" textAnchor="middle" opacity="0.6">
              B = 0
            </text>

            {/* ── Zona con campo B (derecha) ── */}
            <rect className="field-bg" x="180" y="0" width="200" height="200"
              strokeWidth="1" strokeDasharray="3 3" />
            <BFieldDots
              intensity={fieldIntensity}
              animate={true}
              animationDuration={parseFloat(animDuration) * 0.6}
              cols={5}
              rows={5}
              startX={210}
              startY={40}
              stepX={35}
              stepY={30}
            />
            <text x="280" y="18" className="lbl-svg" textAnchor="middle">
              B = {(parseFloat(BField) || 0)} {['T','mT','μT'].find((_, i) => [1, 0.001, 0.000001][i] === BUnit) || 'T'}
            </text>

            {/* ── Línea divisoria ── */}
            <line x1="180" y1="0" x2="180" y2="200"
              stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.5" />

            {/* ── Bobina animada (con clipPath para que no se desborde) ── */}
            <g clipPath="url(#svgClip)" style={{ animation: `p1-move ${animDuration}s cubic-bezier(0.4,0,0.6,1) infinite` }}>
              {/* Cuerpo */}
              <rect className="coil-fill"
                x={coilStartX - wpx / 2} y={cy - hpx / 2}
                width={wpx} height={hpx}
              />
              {/* Líneas internas = vueltas */}
              {Array.from({ length: nLines }).map((_, i) => {
                const yLine = (cy - hpx / 2) + ((i + 1) * hpx) / (nLines + 1);
                return (
                  <line key={i}
                    x1={coilStartX - wpx / 2 + 3} y1={yLine}
                    x2={coilStartX + wpx / 2 - 3} y2={yLine}
                    stroke="var(--accent-2)" strokeWidth="1" opacity="0.5"
                  />
                );
              })}
              {/* Label N */}
              <text x={coilStartX} y={cy - hpx / 2 - 6}
                className="lbl-svg" textAnchor="middle"
                fill="var(--accent-2)" fontWeight="700">
                N = {Math.round(N)}
              </text>
              {/* Flecha de dirección */}
              <g opacity="0.85">
                <line
                  x1={coilStartX + wpx / 2 + 5} y1={cy}
                  x2={coilStartX + wpx / 2 + 22} y2={cy}
                  stroke="var(--accent)" strokeWidth="2"
                />
                <polygon
                  points={`
                    ${coilStartX + wpx / 2 + 18},${cy - 4}
                    ${coilStartX + wpx / 2 + 26},${cy}
                    ${coilStartX + wpx / 2 + 18},${cy + 4}
                  `}
                  fill="var(--accent)"
                />
              </g>
            </g>

            {/* ── fem pulsante — aparece cuando la bobina entra al campo ── */}
            <g style={{ animation: `p1-fem ${animDuration}s cubic-bezier(0.4,0,0.6,1) infinite` }}>
              <text x="280" y="110" className="lbl-svg"
                textAnchor="middle" fill="var(--accent-3)"
                fontWeight="700" fontSize="13">
                ε = fem
              </text>
              <text x="280" y="126" className="lbl-svg"
                textAnchor="middle" fill="var(--accent-3)" fontSize="10">
                inducida ↯
              </text>
            </g>

            <style>{`
              /*
                Ciclo total = animDuration + 2s de pausa fija.
                La bobina ocupa el 50% del tiempo moviéndose,
                luego hay 30% de pausa con fem visible,
                luego fade-out y reset.
              */
              @keyframes p1-move {
                0%   { transform: translateX(0px);                         opacity: 1;   }
                40%  { transform: translateX(${coilEndX - coilStartX}px);  opacity: 1;   }
                70%  { transform: translateX(${coilEndX - coilStartX}px);  opacity: 1;   }
                80%  { transform: translateX(${coilEndX - coilStartX}px);  opacity: 0;   }
                81%  { transform: translateX(0px);                         opacity: 0;   }
                90%  { transform: translateX(0px);                         opacity: 1;   }
                100% { transform: translateX(0px);                         opacity: 1;   }
              }
              /* fem: aparece cuando la bobina llega al campo y se mantiene durante la pausa */
              @keyframes p1-fem {
                0%   { opacity: 0; }
                38%  { opacity: 0; }
                45%  { opacity: 1; }
                70%  { opacity: 1; }
                80%  { opacity: 0; }
                100% { opacity: 0; }
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
          {
            symbol: '▭',
            color: 'var(--accent-2)',
            label: 'Rectángulo (bobina)',
            description: 'Representa la bobina de N vueltas. Su ancho escala con el lado a y su alto con el lado b. Las líneas horizontales internas indican la cantidad de vueltas (1 línea cada 10 vueltas).',
          },
          {
            symbol: '⊙',
            color: 'var(--accent-3)',
            label: 'Puntos del campo B',
            description: 'Cada punto representa el campo magnético B saliendo del plano (convención ⊙ = sale hacia vos). El tamaño y la opacidad de los puntos crecen con la intensidad de B. El pulso indica que el campo está presente y activo.',
          },
          {
            symbol: '→',
            color: 'var(--accent)',
            label: 'Flecha de movimiento',
            description: 'Indica la dirección de desplazamiento de la bobina. La animación muestra la bobina entrando a la zona con campo: la velocidad del movimiento es proporcional a 1/Δt (menos tiempo = más rápido).',
          },
          {
            symbol: 'ε',
            color: 'var(--accent-3)',
            label: 'fem inducida',
            description: 'Aparece cuando la bobina ingresa a la zona con campo B. Representa la fuerza electromotriz inducida por el cambio de flujo magnético (Ley de Faraday: ε = N·B·A/Δt).',
          },
          {
            symbol: '|',
            color: 'var(--accent)',
            label: 'Línea divisoria',
            description: 'Separa la zona sin campo (B=0, izquierda) de la zona con campo (B≠0, derecha). Es el instante donde comienza a cambiar el flujo y se induce la fem.',
          },
        ]} />
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
        {calc && <CheckPanel expected={calc.fem} unitOptions={FEM_UNITS} placeholder="tu valor de ε" />}
      </div>
    </div>
  );
}
