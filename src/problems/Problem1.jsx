import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import SliderControl from '../components/SliderControl.jsx';
import LiveResult from '../components/LiveResult.jsx';
import CheckPanel from '../components/CheckPanel.jsx';
import BFieldDots from '../components/BFieldDots.jsx';
import GraphLegend from '../components/GraphLegend.jsx';
import { fmtUnit } from '../utils/format.js';

const DEFAULTS = {
  N: 50, a: 5, aUnit: 0.01, b: 10, bUnit: 0.01,
  B: 0.5, BUnit: 1, v: 0.4, vUnit: 1,
};

const FEM_UNITS = [
  { label: 'V',  value: '1'     },
  { label: 'mV', value: '0.001' },
  { label: 'kV', value: '1000'  },
];

// SVG layout constants
const SVG_W        = 380;
const SVG_H        = 200;
const BOUNDARY_X   = 180;   // línea divisoria
const COIL_CENTER_Y = 100;  // centro vertical de la bobina
const COIL_START_X = 70;    // centro X inicial (afuera)
const COIL_END_X   = 270;   // centro X final (adentro)

export default function Problem1() {
  const [N, setN]           = useState(DEFAULTS.N);
  const [a, setA]           = useState(DEFAULTS.a);
  const [aUnit, setAUnit]   = useState(DEFAULTS.aUnit);
  const [b, setB]           = useState(DEFAULTS.b);
  const [bUnit, setBUnit]   = useState(DEFAULTS.bUnit);
  const [BField, setBField] = useState(DEFAULTS.B);
  const [BUnit, setBFieldUnit] = useState(DEFAULTS.BUnit);
  const [v, setV]           = useState(DEFAULTS.v);
  const [vUnit, setVUnit]   = useState(DEFAULTS.vUnit);

  // Estado de animación
  const [coilX, setCoilX]   = useState(COIL_START_X);  // posición centro X actual
  const [phase, setPhase]   = useState('out');          // 'out' | 'crossing' | 'in'
  const rafRef               = useRef(null);
  const stateRef             = useRef({ x: COIL_START_X, phase: 'out', pauseTimer: null });

  const calc = useMemo(() => {
    const aSI = parseFloat(a) * aUnit;
    const bSI = parseFloat(b) * bUnit;
    const BSI = parseFloat(BField) * BUnit;
    const vSI = parseFloat(v) * vUnit;
    if ([N, aSI, bSI, BSI, vSI].some((x) => isNaN(x) || x <= 0)) return null;
    const fem  = N * BSI * aSI * vSI;
    const dt   = bSI / vSI;
    return { aSI, bSI, BSI, vSI, fem, dt, A: aSI * bSI, dPhi: BSI * aSI * bSI };
  }, [N, a, aUnit, b, bUnit, BField, BUnit, v, vUnit]);

  const reset = () => {
    setN(DEFAULTS.N);
    setA(DEFAULTS.a); setAUnit(DEFAULTS.aUnit);
    setB(DEFAULTS.b); setBUnit(DEFAULTS.bUnit);
    setBField(DEFAULTS.B); setBFieldUnit(DEFAULTS.BUnit);
    setV(DEFAULTS.v); setVUnit(DEFAULTS.vUnit);
  };

  // SVG dims — proporcional a a y b
  const aClamp = Math.min(Math.max(parseFloat(a) * aUnit || 0.05, 0.005), 0.50);
  const bClamp = Math.min(Math.max(parseFloat(b) * bUnit || 0.10, 0.005), 0.50);
  const wpx = 16 + ((aClamp - 0.005) / 0.495) * (110 - 16);  // ancho (lado a)
  const hpx = 16 + ((bClamp - 0.005) / 0.495) * (100 - 16);  // alto  (lado b)
  const nLines = Math.min(Math.max(Math.round(parseFloat(N) / 10), 1), 12);
  const BSI = parseFloat(BField) * BUnit || 0;
  const fieldIntensity = Math.min(BSI / 5, 1);

  // Velocidad visual en px/s (mapeo: 0.05m/s→8px/s, 5m/s→120px/s)
  const vSI    = parseFloat(v) * vUnit || 0.4;
  const vClamp = Math.min(Math.max(vSI, 0.05), 5);
  const pxPerSec = 8 + ((vClamp - 0.05) / 4.95) * (120 - 8);

  // ── Animación con requestAnimationFrame ────────────────────────────────────
  const startAnimation = useCallback(() => {
    let lastTime = null;
    const s = stateRef.current;

    const tick = (ts) => {
      if (lastTime === null) lastTime = ts;
      const dt = (ts - lastTime) / 1000;
      lastTime = ts;

      if (s.phase === 'moving') {
        const newX = s.x + pxPerSec * dt;

        // Calcular fase según posición exacta de los bordes
        const borDer = newX + wpx / 2;
        const borIzq = newX - wpx / 2;

        let newPhase;
        if (borDer <= BOUNDARY_X) {
          newPhase = 'out';
        } else if (borIzq >= BOUNDARY_X) {
          newPhase = 'in';
        } else {
          newPhase = 'crossing';
        }

        if (newX >= COIL_END_X) {
          // Llegó al final — pausa adentro 1.8s, luego reset
          s.x = COIL_END_X;
          s.phase = 'pause_in';
          setCoilX(COIL_END_X);
          setPhase('in');

          s.pauseTimer = setTimeout(() => {
            // Reset: vuelve al inicio con fade (manejado en CSS opacity)
            s.x = COIL_START_X;
            s.phase = 'pause_out';
            setCoilX(COIL_START_X);
            setPhase('out');

            s.pauseTimer = setTimeout(() => {
              s.phase = 'moving';
              lastTime = null;
              rafRef.current = requestAnimationFrame(tick);
            }, 900); // pausa afuera antes de volver a moverse
          }, 1800);
        } else {
          s.x = newX;
          s.phase = 'moving';
          setCoilX(newX);
          setPhase(newPhase);
          rafRef.current = requestAnimationFrame(tick);
        }
      }
    };

    s.phase = 'moving';
    rafRef.current = requestAnimationFrame(tick);
  }, [pxPerSec, wpx]);

  useEffect(() => {
    // Limpiar animación anterior
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (stateRef.current.pauseTimer) clearTimeout(stateRef.current.pauseTimer);

    // Resetear posición
    stateRef.current = { x: COIL_START_X, phase: 'out', pauseTimer: null };
    setCoilX(COIL_START_X);
    setPhase('out');

    // Pausa inicial antes de empezar a moverse
    const initTimer = setTimeout(() => {
      startAnimation();
    }, 800);

    return () => {
      clearTimeout(initTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stateRef.current.pauseTimer) clearTimeout(stateRef.current.pauseTimer);
    };
  }, [startAnimation]);

  // fem visible en el panel grande: real solo mientras cruza, 0 en los demás estados
  const panelFem = phase === 'crossing' ? (calc?.fem ?? null) : 0;

  return (
    <div className="card has-two-cols">
      <div className="card-header-block">
        <span className="pnum">PROBLEMA 1</span>
        <h2 className="card-title">Bobina rectangular entrando en un campo</h2>
        <p className="card-desc">
          Una bobina de N vueltas se desplaza con velocidad v hacia una zona con
          campo B perpendicular. La fem se genera <strong>solo mientras cruza la
          frontera</strong>. Afuera (Φ=0) y adentro (Φ=cte) la fem es cero.
        </p>
        <details>
          <summary>Fórmula</summary>
          <span className="frm">ε = N · B · a · v</span>
          <span className="frm">  (a = lado ⊥ al movimiento)</span>
          <span className="frm">Δt = b / v  (tiempo de cruce)</span>
          <span className="frm">ε = 0 cuando Φ = 0 (afuera) o Φ = cte (adentro)</span>
        </details>
      </div>

      <div className="controls-block">
        <div className="anim-wrap">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="p1-clip">
                <rect x="0" y="0" width={SVG_W} height={SVG_H} />
              </clipPath>
            </defs>

            {/* Zona B = 0 */}
            <rect x="0" y="0" width={BOUNDARY_X} height={SVG_H}
              fill="var(--svg-bg)" opacity="0.3" />
            <text x="90" y="16" className="lbl-svg" textAnchor="middle" opacity="0.6">
              B = 0
            </text>

            {/* Zona con campo */}
            <rect className="field-bg" x={BOUNDARY_X} y="0"
              width={SVG_W - BOUNDARY_X} height={SVG_H}
              strokeWidth="1" strokeDasharray="3 3" />
            <BFieldDots intensity={fieldIntensity} animate={true}
              animationDuration={2.0}
              cols={5} rows={5} startX={210} startY={38} stepX={35} stepY={32} />
            <text x="280" y="16" className="lbl-svg" textAnchor="middle">
              B = {parseFloat(BField) || 0}{' '}
              {[1, 0.001, 0.000001].map((f, i) =>
                f === BUnit ? ['T','mT','μT'][i] : null).find(Boolean) ?? 'T'}
            </text>

            {/* Línea divisoria */}
            <line x1={BOUNDARY_X} y1="0" x2={BOUNDARY_X} y2={SVG_H}
              stroke="var(--accent)" strokeWidth="1.5"
              strokeDasharray="6 3" opacity="0.6" />

            {/* Bobina — posición controlada por JS */}
            <g clipPath="url(#p1-clip)">
              {/* Área sombreada dentro del campo */}
              {phase === 'crossing' && (
                <rect
                  x={BOUNDARY_X}
                  y={COIL_CENTER_Y - hpx / 2}
                  width={Math.max(coilX + wpx / 2 - BOUNDARY_X, 0)}
                  height={hpx}
                  fill="var(--accent)"
                  opacity="0.15"
                />
              )}

              {/* Cuerpo bobina */}
              <rect
                className="coil-fill"
                x={coilX - wpx / 2}
                y={COIL_CENTER_Y - hpx / 2}
                width={wpx}
                height={hpx}
              />

              {/* Vueltas internas */}
              {Array.from({ length: nLines }).map((_, i) => {
                const yLine = (COIL_CENTER_Y - hpx / 2) + ((i + 1) * hpx) / (nLines + 1);
                return <line key={i}
                  x1={coilX - wpx / 2 + 3} y1={yLine}
                  x2={coilX + wpx / 2 - 3} y2={yLine}
                  stroke="var(--accent-2)" strokeWidth="1" opacity="0.5" />;
              })}

              {/* Label N */}
              <text x={coilX} y={COIL_CENTER_Y - hpx / 2 - 7}
                className="lbl-svg" textAnchor="middle"
                fill="var(--accent-2)" fontWeight="700">
                N = {Math.round(N)}
              </text>

              {/* Flecha velocidad */}
              <g opacity="0.9">
                <line
                  x1={coilX + wpx / 2 + 4} y1={COIL_CENTER_Y}
                  x2={coilX + wpx / 2 + 22} y2={COIL_CENTER_Y}
                  stroke="var(--accent)" strokeWidth="2" />
                <polygon points={`
                  ${coilX + wpx / 2 + 18},${COIL_CENTER_Y - 4}
                  ${coilX + wpx / 2 + 27},${COIL_CENTER_Y}
                  ${coilX + wpx / 2 + 18},${COIL_CENTER_Y + 4}`}
                  fill="var(--accent)" />
                <text x={coilX + wpx / 2 + 15} y={COIL_CENTER_Y - 9}
                  className="lbl-svg" fill="var(--accent)" fontSize="9">v</text>
              </g>
            </g>

            {/* Borde naranja mientras cruza */}
            {phase === 'crossing' && (
              <rect x={BOUNDARY_X + 2} y="3"
                width={SVG_W - BOUNDARY_X - 5} height={SVG_H - 6}
                rx="3" fill="none"
                stroke="var(--accent)" strokeWidth="2.5" opacity="0.9" />
            )}

            {/* Borde gris cuando está adentro */}
            {phase === 'in' && (
              <rect x={BOUNDARY_X + 2} y="3"
                width={SVG_W - BOUNDARY_X - 5} height={SVG_H - 6}
                rx="3" fill="none"
                stroke="var(--ink-dim)" strokeWidth="1.5"
                strokeDasharray="5 4" opacity="0.5" />
            )}
          </svg>
        </div>

        <SliderControl label="N (vueltas)" value={N} onChange={setN}
          min={1} max={500} step={1} displayUnit="" />
        <SliderControl label="Lado a  (⊥ al movimiento)" value={a} onChange={setA}
          unit={aUnit} onUnitChange={setAUnit}
          unitOptions={[{ label: 'cm', value: '0.01' }, { label: 'mm', value: '0.001' }, { label: 'm', value: '1' }]}
          min={0.5} max={50} step={0.5} />
        <SliderControl label="Lado b  (∥ al movimiento)" value={b} onChange={setB}
          unit={bUnit} onUnitChange={setBUnit}
          unitOptions={[{ label: 'cm', value: '0.01' }, { label: 'mm', value: '0.001' }, { label: 'm', value: '1' }]}
          min={0.5} max={50} step={0.5} />
        <SliderControl label="Campo B" value={BField} onChange={setBField}
          unit={BUnit} onUnitChange={setBFieldUnit}
          unitOptions={[{ label: 'T', value: '1' }, { label: 'mT', value: '0.001' }, { label: 'μT', value: '0.000001' }]}
          min={0} max={5} step={0.05} />
        <SliderControl label="Velocidad v" value={v} onChange={setV}
          unit={vUnit} onUnitChange={setVUnit}
          unitOptions={[{ label: 'm/s', value: '1' }, { label: 'cm/s', value: '0.01' }]}
          min={0.05} max={5} step={0.05} />

        {/* Aclaración: cómo obtener v desde el Δt del enunciado */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'var(--input-bg)',
          border: '1px solid var(--line)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          color: 'var(--ink-dim)',
          lineHeight: 1.6,
          marginBottom: '6px',
        }}>
          <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>
            💡 ¿El enunciado te da Δt en vez de v?
          </div>
          <div>Usá la relación: <span style={{ color: 'var(--accent)' }}>v = b / Δt</span></div>
          <div style={{ marginTop: '4px', opacity: 0.8 }}>
            Ejemplo del enunciado: b = 10 cm, Δt = 0.25 s<br />
            → v = 0.10 / 0.25 = <span style={{ color: 'var(--accent)', fontWeight: 700 }}>0.4 m/s</span>
          </div>
          {calc && (
            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--line)' }}>
              Con los valores actuales: Δt = b/v = <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmtUnit(calc.dt, 's')}</span>
            </div>
          )}
        </div>
        <div className="reset-row">
          <button className="btn btn-reset" onClick={reset}>↺ Datos del enunciado</button>
        </div>

        <GraphLegend items={[
          { symbol: '▭', color: 'var(--accent-2)', label: 'Bobina',
            description: 'N vueltas. Ancho = lado a (⊥ al movimiento), alto = lado b (∥ al movimiento). Líneas internas = vueltas.' },
          { symbol: '⚡', color: 'var(--accent)', label: 'Borde naranja — cruzando',
            description: 'Aparece exactamente cuando algún borde de la bobina está entre x=0 y la frontera. Flujo cambiando → fem activa.' },
          { symbol: '○', color: 'var(--ink-dim)', label: 'Borde gris — adentro',
            description: 'Bobina completamente dentro del campo. Φ constante → ε = 0.' },
          { symbol: '░', color: 'var(--accent)', label: 'Área sombreada',
            description: 'Porción de la bobina que ya tiene flujo mientras cruza. Crece mientras la bobina ingresa.' },
        ]} />
      </div>

      <div className="output-block">
        {/* Panel principal — fem en tiempo real de la animación */}
        <LiveResult
          label={
            phase === 'crossing' ? 'fem inducida (cruzando)' :
            phase === 'out'      ? 'fem inducida (afuera)'   :
                                   'fem inducida (adentro)'
          }
          value={panelFem}
          unit="V"
          rows={[
            {
              label: phase === 'crossing' ? 'ε = N·B·a·v' :
                     phase === 'out'      ? 'Φ = 0  →  ε = 0' :
                                           'Φ = cte  →  ε = 0',
              value: panelFem,
              unit: 'V',
            },
          ]}
        />

        {/* Indicador de fase */}
        <div style={{
          margin: '10px 0',
          padding: '10px 14px',
          borderRadius: '10px',
          background: phase === 'crossing' ? 'rgba(224,123,48,0.12)' : 'var(--input-bg)',
          border: `1px solid ${phase === 'crossing' ? 'var(--accent)' : 'var(--line)'}`,
          transition: 'background 0.3s, border-color 0.3s',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '15px' }}>
              {phase === 'out' ? '⬜' : phase === 'crossing' ? '⚡' : '✅'}
            </span>
            <span style={{
              fontWeight: 700, fontSize: '11px',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: phase === 'crossing' ? 'var(--accent)' : 'var(--ink-dim)',
            }}>
              {phase === 'out'      ? 'Afuera — Φ = 0'
              : phase === 'crossing' ? 'Cruzando — ΔΦ/Δt ≠ 0 → ε ≠ 0'
              :                        'Adentro — Φ = cte → ε = 0'}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--ink-dim)', lineHeight: 1.5 }}>
            {phase === 'out'       ? 'Sin flujo. Sin variación. Sin fem.'
            : phase === 'crossing' ? 'El flujo aumenta mientras la bobina ingresa → fem inducida.'
            :                        'Flujo máximo pero constante. No hay variación → no hay fem.'}
          </div>
        </div>

        {/* Valor calculado — siempre visible como referencia */}
        {calc && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'var(--input-bg)',
            border: '1px solid var(--line)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            marginBottom: '12px',
          }}>
            <div style={{
              fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '0.12em', color: 'var(--ink-dim)',
              marginBottom: '8px',
            }}>
              Valor calculado (al cruzar la frontera)
            </div>
            {[
              { label: 'ε = N·B·a·v', value: fmtUnit(calc.fem, 'V') },
              { label: 'Δt = b/v', value: fmtUnit(calc.dt, 's') },
              { label: 'Área A = a·b', value: fmtUnit(calc.A, 'm²') },
              { label: 'ΔΦ = B·A', value: fmtUnit(calc.dPhi, 'Wb') },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '4px 0',
                borderBottom: i < 3 ? '1px solid var(--line)' : 'none',
                color: 'var(--ink)',
              }}>
                <span style={{ color: 'var(--ink-dim)' }}>{r.label}</span>
                <span style={{ fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>
        )}

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
