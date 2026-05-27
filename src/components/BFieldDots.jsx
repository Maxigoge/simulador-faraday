import React, { useEffect, useState } from 'react';

/**
 * BFieldDots — Renderiza una grilla de puntos representando un campo
 * magnético saliente al plano. La intensidad (entre 0 y 1) controla
 * el tamaño y la opacidad de los puntos.
 *
 * Lee la variable CSS --svg-cutout para que los puntos sigan el tema
 * (oscuro/claro) y se reactualiza cuando cambia el tema.
 *
 * Props:
 *  - intensity: number entre 0 y 1
 *  - cols, rows: cantidad de puntos
 *  - startX, startY: coordenada del primer punto
 *  - stepX, stepY: espaciado entre puntos
 */
export default function BFieldDots({
  intensity,
  cols = 5,
  rows = 5,
  startX = 195,
  startY = 35,
  stepX = 35,
  stepY = 30,
}) {
  const [cutout, setCutout] = useState('#0d1117');

  useEffect(() => {
    const update = () => {
      const c = getComputedStyle(document.body)
        .getPropertyValue('--svg-cutout')
        .trim();
      setCutout(c || '#0d1117');
    };
    update();
    // Volver a leer al cambiar el tema
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (intensity < 0.05) return null;

  const dots = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx = startX + i * stepX;
      const cy = startY + j * stepY;
      const r = 1.5 + intensity * 2.5;
      const op = 0.3 + intensity * 0.5;
      dots.push(
        <g key={`${i}-${j}`}>
          <circle cx={cx} cy={cy} r={r} fill="var(--accent-3)" opacity={op} />
          <circle cx={cx} cy={cy} r={r * 0.4} fill={cutout} />
        </g>
      );
    }
  }
  return <g>{dots}</g>;
}
