import React, { useState } from 'react';
import { compareResult } from '../utils/format';

/**
 * CheckPanel — Permite al usuario ingresar su resultado y comparar contra
 * el valor esperado, mostrando OK / cerca / mal con tolerancia relativa.
 *
 * Props:
 *  - expected: number. Valor real (en SI)
 *  - unitOptions: [{ label, value }]. Unidades disponibles
 *  - placeholder: string opcional
 */
export default function CheckPanel({ expected, unitOptions, placeholder }) {
  const [userVal, setUserVal] = useState('');
  const [unit, setUnit] = useState(unitOptions[0].value);
  const [result, setResult] = useState(null);

  const handleCompare = () => {
    const v = parseFloat(userVal);
    if (isNaN(v)) {
      setResult({ status: 'bad', message: 'Ingresá un valor numérico' });
      return;
    }
    const userSI = v * parseFloat(unit);
    setResult(compareResult(userSI, expected));
  };

  return (
    <div className="check-mode">
      <div className="lbl-mini">¿Coincide tu resultado?</div>
      <div className="check-row">
        <input
          type="number"
          step="any"
          inputMode="decimal"
          placeholder={placeholder || 'tu valor'}
          value={userVal}
          onChange={(e) => setUserVal(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          {unitOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button className="btn" onClick={handleCompare}>
        Comparar
      </button>
      {result && (
        <div
          className={`check-result ${result.status}`}
          dangerouslySetInnerHTML={{ __html: result.message }}
        />
      )}
    </div>
  );
}
