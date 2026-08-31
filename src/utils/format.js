/**
 * Formatting helpers — escala valores numéricos a unidades legibles
 * con prefijos SI (k, M, m, μ, n, p, etc.)
 */

export function fmt(x, digits = 4) {
  if (x === 0) return '0';
  if (!isFinite(x)) return '∞';
  const abs = Math.abs(x);
  if (abs >= 1e5 || abs < 1e-3) return x.toExponential(digits);
  return parseFloat(x.toPrecision(digits + 2)).toString();
}

const PREFIXES = [
  { f: 1e9, s: 'G' },
  { f: 1e6, s: 'M' },
  { f: 1e3, s: 'k' },
  { f: 1, s: '' },
  { f: 1e-3, s: 'm' },
  { f: 1e-6, s: 'μ' },
  { f: 1e-9, s: 'n' },
  { f: 1e-12, s: 'p' },
];

const AREA_PREFIXES = [
  { f: 1e9, s: 'G' },
  { f: 1e6, s: 'M' },
  { f: 1e3, s: 'k' },
  { f: 1, s: '' },
  { f: 1e-2, s: 'c' },
  { f: 1e-3, s: 'm' },
  { f: 1e-6, s: 'μ' },
  { f: 1e-9, s: 'n' },
  { f: 1e-12, s: 'p' },
];

function unitScale(unitBase) {
  if (unitBase.includes('²')) return { power: 2, prefixes: AREA_PREFIXES };
  if (unitBase.includes('³')) return { power: 3, prefixes: PREFIXES };
  return { power: 1, prefixes: PREFIXES };
}

export function fmtUnit(value, unitBase) {
  const abs = Math.abs(value);
  if (abs === 0) return `0 ${unitBase}`;
  const { power, prefixes } = unitScale(unitBase);
  for (const p of prefixes) {
    const factor = p.f ** power;
    if (abs >= factor) return `${fmt(value / factor, 3)} ${p.s}${unitBase}`;
  }
  return `${value.toExponential(3)} ${unitBase}`;
}

/**
 * splitUnit — separa número y unidad para mostrar en el panel principal
 * (donde el número grande va separado de la unidad pequeña)
 */
export function splitUnit(value, unitBase) {
  const abs = Math.abs(value);
  if (abs === 0) return { num: '0', unit: unitBase };
  const { power, prefixes } = unitScale(unitBase);
  for (const p of prefixes) {
    const factor = p.f ** power;
    if (abs >= factor) {
      const scaled = value / factor;
      const num = Math.abs(scaled) >= 100
        ? scaled.toFixed(1)
        : parseFloat(scaled.toPrecision(4)).toString();
      return { num, unit: p.s + unitBase };
    }
  }
  return { num: value.toExponential(3), unit: unitBase };
}

/**
 * compareResult — compara un valor del usuario con el valor esperado
 * y devuelve un objeto { status, message } donde status es 'ok' o 'bad'.
 */
export function compareResult(userVal, expected) {
  if (Math.abs(expected) < 1e-30) {
    if (Math.abs(userVal) < 1e-9) {
      return { status: 'ok', message: '✓ Correcto (esperado: 0)' };
    }
    return {
      status: 'bad',
      message: `✗ Esperado: 0 — Tu valor: ${fmt(userVal)}`,
    };
  }
  const relErr = Math.abs((userVal - expected) / expected);
  const pct = (relErr * 100).toFixed(2);
  if (relErr < 0.02) {
    return {
      status: 'ok',
      message: `✓ Correcto (error ${pct}%)<br>Esperado: ${fmt(expected)} · Tu valor: ${fmt(userVal)}`,
    };
  }
  if (relErr < 0.10) {
    return {
      status: 'bad',
      message: `△ Cerca pero no exacto (error ${pct}%)<br>Esperado: ${fmt(expected)} · Tu valor: ${fmt(userVal)}<br><small>Revisá redondeos o unidades</small>`,
    };
  }
  return {
    status: 'bad',
    message: `✗ Incorrecto (error ${pct}%)<br>Esperado: ${fmt(expected)} · Tu valor: ${fmt(userVal)}<br><small>Revisá fórmula y unidades</small>`,
  };
}
