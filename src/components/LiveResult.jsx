import React from 'react';
import { fmtUnit, splitUnit } from '../utils/format';

/**
 * LiveResult — Panel verde con el resultado principal (vivo) + tabla auxiliar.
 *
 * Props:
 *  - label: string. Etiqueta del panel (ej. "fem inducida")
 *  - value: number. Valor principal (puede ser null)
 *  - unit: string. Unidad SI base (ej. "V", "T", "T/s")
 *  - rows: [{ label, value, unit }] | [{ label, raw }]. Filas de la tabla aux
 *      - Si `value` y `unit` están, se aplica fmtUnit; si `raw` está, se muestra tal cual
 */
export default function LiveResult({ label, value, unit, rows }) {
  const hasValue = value !== null && value !== undefined && !isNaN(value);
  const split = hasValue ? splitUnit(value, unit) : { num: '—', unit };

  return (
    <div className="live-result">
      <div className="live-label">{label} (vivo)</div>
      <div className="main-result">
        {split.num} <span className="unit">{split.unit}</span>
      </div>
      {rows && rows.length > 0 && (
        <div className="aux-grid">
          {rows.map((r, i) => (
            <div className="row" key={i}>
              <span className="lbl">{r.label}</span>
              <span className="val">
                {r.raw !== undefined ? r.raw : fmtUnit(r.value, r.unit)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
