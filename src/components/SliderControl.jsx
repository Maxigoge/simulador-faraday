import React from 'react';

/**
 * SliderControl — Slider + input numérico + (opcional) selector de unidad.
 * Sincroniza los tres y emite el valor en SI mediante onChange.
 *
 * Props:
 *  - label: string. Etiqueta visible
 *  - value: number. Valor actual (en la unidad seleccionada — no SI)
 *  - onChange: (newValue) => void. Recibe el nuevo valor (en la unidad seleccionada)
 *  - unit: string. Unidad SI actual (factor) — opcional
 *  - onUnitChange: (newFactor) => void. Cambia el factor — opcional
 *  - unitOptions: [{ label, value }]. Lista de opciones de unidad — opcional
 *  - min, max, step: para el slider
 *  - displayUnit: texto para mostrar al lado del valor (opcional, default = primer label de unitOptions)
 */
export default function SliderControl({
  label,
  value,
  onChange,
  unit,
  onUnitChange,
  unitOptions,
  min,
  max,
  step,
  displayUnit,
}) {
  const handleSliderChange = (e) => {
    onChange(parseFloat(e.target.value));
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') {
      // permitir input parcial; el padre puede manejar NaN
      onChange(raw);
      return;
    }
    const v = parseFloat(raw);
    if (!isNaN(v)) onChange(v);
  };

  const handleUnitChange = (e) => {
    onUnitChange(parseFloat(e.target.value));
  };

  // Resolver el texto de unidad mostrado al costado del valor
  let shownUnit = displayUnit || '';
  if (!displayUnit && unitOptions && unit !== undefined) {
    const opt = unitOptions.find((o) => parseFloat(o.value) === parseFloat(unit));
    if (opt) shownUnit = opt.label;
  }

  const displayValue = typeof value === 'number' && !isNaN(value)
    ? parseFloat(value.toPrecision(4))
    : value;

  return (
    <div className="control">
      <div className="control-head">
        <label>{label}</label>
        <span className="value-display">
          {displayValue} {shownUnit}
        </span>
      </div>
      <div className="slider-row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={typeof value === 'number' && !isNaN(value) ? value : min}
          onChange={handleSliderChange}
        />
        <input
          type="number"
          step="any"
          value={value}
          onChange={handleInputChange}
          inputMode="decimal"
        />
        {unitOptions && (
          <select value={unit} onChange={handleUnitChange}>
            {unitOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
