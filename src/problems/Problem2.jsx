import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import BFieldDots from '../components/BFieldDots.jsx';
import GraphLegend from '../components/GraphLegend.jsx';

const DEFAULTS = { L: 0.20, LUnit: 1, fem: 18, femUnit: 0.001, dA: 0.1 };

const B_UNITS = [
  { label: 'T',  value: '1'        },
  { label: 'mT', value: '0.001'    },
  { label: 'μT', value: '0.000001' },
];

// SVG layout fija
const CX       = 190;  // centro X
const RAIL_TOP = 28;
const RAIL_BOT = 172;
const BAR_START = RAIL_BOT;
const BAR_END   = RAIL_TOP + 8;
const BAR_TRAVEL = BAR_START - BAR_END;

export default function Problem2() {
  const [L, setL]         = useState(DEFAULTS.L);
  const [LUnit, setLUnit] = useState(DEFAULTS.LUnit);
  const [fem, setFem]     = useState(DEFAULTS.fem);
  const [femUnit, setFemUnit] = useState(DEFAULTS.femUnit);
  const [dA, setDA]       = useState(DEFAULTS.dA);

  // Posición JS de la barra (0 = abajo, 1 = arriba)
  const [barFrac, setBarFrac] = useState(0);  // 0..1
  const [dashOffset, setDashOffset] = useState(1000); // para la corriente
  const rafRef  = useRef(null);
  const stateRef = useRef({ frac: 0, dir: 'up', pauseTimer: null, offset: 1000 });

  const calc = useMemo(() => {
    const LSI  = parseFloat(L) * LUnit;
    const femSI = parseFloat(fem) * femUnit;
    const dASI = parseFloat(dA);
    if ([LSI, femSI, dASI].some((v) => isNaN(v)) || dASI <= 0) return null;
    const A = LSI * LSI;
    const B = femSI / dASI;
    return { A, B, femSI, dASI, LSI };
  }, [L, LUnit, fem, femUnit, dA]);

  const reset = () => {
    setL(DEFAULTS.L); setLUnit(DEFAULTS.LUnit);
    setFem(DEFAULTS.fem); setFemUnit(DEFAULTS.femUnit);
    setDA(DEFAULTS.dA);
  };

  // Velocidad visual: dA/dt grande → barra sube rápido
  const dASI   = parseFloat(dA) || 0.1;
  const dAClamp = Math.min(Math.max(dASI, 0.001), 5);
  // fracción por segundo: 0.001→0.05/s (lento), 5→0.6/s (rápido)
  const fracPerSec = 0.05 + ((dAClamp - 0.001) / 4.999) * 0.55;

  const startAnim = useCallback(() => {
    let last = null;
    const s = stateRef.current;

    const tick = (ts) => {
      if (last === null) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;

      if (s.dir === 'up') {
        s.frac = Math.min(s.frac + fracPerSec * dt, 1);
        setBarFrac(s.frac);

        // Corriente: dashOffset baja continuamente mientras la barra sube
        // Velocidad proporcional a fracPerSec (misma que la barra)
        s.offset = s.offset - 300 * fracPerSec * dt;
        if (s.offset <= 0) s.offset = 600;
        setDashOffset(s.offset);

        if (s.frac >= 1) {
          s.dir = 'pause';
          s.pauseTimer = setTimeout(() => {
            s.frac = 0;
            s.dir = 'up';
            // No reseteamos offset — la corriente retoma donde quedó
            setBarFrac(0);
            rafRef.current = requestAnimationFrame(tick);
          }, 600); // pausa corta en el reset
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    s.frac = 0;
    s.dir = 'up';
    s.offset = 600;
    setBarFrac(0);
    setDashOffset(600);
    rafRef.current = requestAnimationFrame(tick);
  }, [fracPerSec]);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (stateRef.current.pauseTimer) clearTimeout(stateRef.current.pauseTimer);
    stateRef.current = { frac: 0, dir: 'up', pauseTimer: null };

    const t = setTimeout(startAnim, 400);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
      if (stateRef.current.pauseTimer) clearTimeout(stateRef.current.pauseTimer);
    };
  }, [startAnim]);

  // SVG dims
  const LSI     = parseFloat(L) * LUnit || DEFAULTS.L;
  const lClamp  = Math.min(Math.max(LSI, 0.01), 2.0);
  const railSep = 20 + ((lClamp - 0.01) / 1.99) * 140;
  const railL   = CX - railSep / 2;
  const railR   = CX + railSep / 2;

  // Posición actual de la barra (Y en SVG)
  const barY = BAR_START - barFrac * BAR_TRAVEL;

  const fieldIntensity = calc ? Math.min(Math.abs(calc.B) / 2, 1) : 0;

  const femSI   = parseFloat(fem) * femUnit || 0.018;
  const femClamp = Math.min(Math.max(femSI, 0), 0.5);
  const barWidth  = 2.5 + (femClamp / 0.5) * 3;
  const barOpacity = 0.55 + (femClamp / 0.5) * 0.45;

  // Corriente: duración de animación inversamente proporcional a dA/dt
  const currentDur = (3.5 - ((dAClamp - 0.001) / 4.999) * 2.5).toFixed(2);

  // Flujo actual = B * L * x  (x = distancia barra al fondo de U)
  const areaActual = calc ? calc.LSI * calc.LSI * (1 - barFrac) : null;

  return (
    <div className="card has-two-cols">
      <div className="card-header-block">
        <span className="pnum">PROBLEMA 2</span>
        <h2 className="card-title">Espira con un lado móvil</h2>
        <p className="card-desc">
          Una espira rectangular formada por dos rieles fijos y una barra conductora
          que se desliza, reduciendo el área. B es constante y perpendicular al plano.
          La corriente circula por Lenz oponiéndose a la disminución del flujo.
        </p>
        <details>
          <summary>Fórmula</summary>
          <span className="frm">Φ = B · L · x  (x = distancia barra al fondo)</span>
          <span className="frm">ε = B · L · v  (v = velocidad de la barra)</span>
          <span className="frm">ε = B · |dA/dt|</span>
          <span className="frm">→ B = ε / |dA/dt|</span>
        </details>
      </div>

      <div className="controls-block">
        <div className="anim-wrap">
          <svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="p2-clip">
                <rect x="10" y="10" width="360" height="180" />
              </clipPath>
              {/* Marcador de flecha para la corriente */}
              <marker id="p2-arrow-marker" markerWidth="6" markerHeight="6"
                refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-3)" />
              </marker>
            </defs>

            {/* Campo de fondo */}
            <rect className="field-bg" x="10" y="10" width="360" height="180"
              strokeWidth="1" strokeDasharray="3 3" />
            <BFieldDots intensity={fieldIntensity} cols={8} rows={4}
              startX={30} startY={30} stepX={45} stepY={45}
              animate={true} animationDuration={2.0} />
            <text x="355" y="22" className="lbl-svg" textAnchor="end">B ⊙ (sale)</text>

            {/* Área sombreada (flujo actual) */}
            <rect
              x={railL + 1} y={RAIL_TOP + 1}
              width={railSep - 2}
              height={Math.max(barY - RAIL_TOP - 1, 0)}
              fill="var(--accent-3)" opacity="0.08"
            />

            {/* Rieles */}
            <line x1={railL} y1={RAIL_TOP} x2={railL} y2={RAIL_BOT}
              stroke="var(--accent-2)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={railR} y1={RAIL_TOP} x2={railR} y2={RAIL_BOT}
              stroke="var(--accent-2)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Conexión superior */}
            <line x1={railL} y1={RAIL_TOP} x2={railR} y2={RAIL_TOP}
              stroke="var(--accent-2)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Terminales */}
            <circle cx={railL} cy={RAIL_BOT} r="4" fill="var(--accent-2)" opacity="0.5" />
            <circle cx={railR} cy={RAIL_BOT} r="4" fill="var(--accent-2)" opacity="0.5" />

            {/* Label L */}
            <line x1={railL} y1={RAIL_TOP - 12} x2={railR} y2={RAIL_TOP - 12}
              stroke="var(--ink-dim)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
            <text x={CX} y={RAIL_TOP - 15} className="lbl-svg" textAnchor="middle"
              fill="var(--accent-2)" fontWeight="700">
              L = {(LSI * 100).toFixed(1)} cm
            </text>

            {/* ── Corriente circulando — path único con stroke-dashoffset JS ── */}
            {(() => {
              const segTop   = railSep;
              const segRight = barY - RAIL_TOP;
              const segBar   = railSep;
              const segLeft  = barY - RAIL_TOP;
              const totalLen = segTop + segRight + segBar + segLeft;
              const dashLen  = 12;

              const d = [
                `M ${railL} ${RAIL_TOP}`,
                `L ${railR} ${RAIL_TOP}`,
                `L ${railR} ${barY}`,
                `L ${railL} ${barY}`,
                `L ${railL} ${RAIL_TOP}`,
              ].join(' ');

              // Escalar dashOffset al totalLen real
              const scaledOffset = (dashOffset / 600) * totalLen;

              return (
                <path
                  d={d}
                  fill="none"
                  stroke="var(--accent-3)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${dashLen} ${totalLen}`}
                  strokeDashoffset={scaledOffset}
                  opacity="0.95"
                />
              );
            })()}

            {/* Flecha sentido antihorario */}
            <polygon
              points={`${CX + 6},${RAIL_TOP - 5} ${CX},${RAIL_TOP + 4} ${CX - 6},${RAIL_TOP - 5}`}
              fill="var(--accent-3)" opacity="0.85"
            />

            {/* ── Barra deslizante (posición JS) ── */}
            <g>
              {/* Barra */}
              <line x1={railL} y1={barY} x2={railR} y2={barY}
                stroke="var(--accent)" strokeWidth={barWidth.toFixed(1)}
                strokeLinecap="round" opacity={barOpacity.toFixed(2)} />

              {/* Flecha de velocidad (hacia arriba) */}
              <polygon
                points={`${CX - 6},${barY - 8} ${CX},${barY - 18} ${CX + 6},${barY - 8}`}
                fill="var(--accent)" opacity="0.85" />
              <text x={CX + 14} y={barY - 11} className="lbl-svg"
                fill="var(--accent)" fontWeight="700" fontSize="10">v</text>

              {/* Fuerza de Lenz (hacia abajo — opuesta al movimiento) */}
              <polygon
                points={`${CX - 6},${barY + 10} ${CX},${barY + 20} ${CX + 6},${barY + 10}`}
                fill="var(--warn, #e07b30)" opacity="0.7" />
              <text x={CX + 14} y={barY + 18} className="lbl-svg"
                fill="var(--warn, #e07b30)" fontWeight="700" fontSize="10">F (Lenz)</text>

              {/* Label fem sobre la barra — siempre visible mientras se mueve */}
              <text x={CX} y={barY - 22} className="lbl-svg" textAnchor="middle"
                fill="var(--accent-3)" fontWeight="700" fontSize="11"
                opacity={barFrac > 0.05 && barFrac < 0.85 ? '0.95' : '0'}>
                ε ≠ 0
              </text>
            </g>

            {/* Label área */}
            <text x={CX} y={RAIL_BOT + 16} className="lbl-svg" textAnchor="middle"
              fill="var(--ink-dim)" opacity="0.7" fontSize="10">
              dA/dt = {dASI.toFixed(3)} m²/s
            </text>


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
            description: 'Dos conductores fijos y paralelos unidos en la parte superior. El ancho L escala con el slider.' },
          { symbol: '—', color: 'var(--accent)', label: 'Barra deslizante',
            description: 'El conductor móvil que cierra el circuito y genera la fem al moverse. Velocidad ∝ |dA/dt|, grosor ∝ ε.' },
          { symbol: 'v↑', color: 'var(--accent)', label: 'Flecha de velocidad',
            description: 'Dirección de movimiento de la barra (hacia arriba = área disminuye).' },
          { symbol: 'F↓', color: 'var(--accent)', label: 'Fuerza de Lenz',
            description: 'La fuerza magnética sobre la barra se opone a su movimiento (Ley de Lenz). Por eso se necesita una fuerza externa para mover la barra.' },
          { symbol: '〜', color: 'var(--accent-3)', label: 'Corriente inducida',
            description: 'Circula por el circuito (rieles + barra) en sentido antihorario, oponiéndose a la disminución del flujo (Lenz). Se ilumina secuencialmente mostrando el sentido.' },
          { symbol: 'ε', color: 'var(--accent-3)', label: 'fem generada en la barra',
            description: 'La fem se genera en la barra móvil (no en los rieles fijos). Aparece cuando la corriente pasa por ese segmento.' },
          { symbol: '⊙', color: 'var(--accent-3)', label: 'Campo B (constante)',
            description: 'B no varía en el tiempo. Lo que genera la fem es el movimiento de la barra que cambia el área.' },
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
