import React, { useEffect, useState } from 'react';

/**
 * BFieldDots — Grilla de puntos representando campo magnético saliente.
 *
 * Props:
 *  - intensity: 0 a 1 (controla tamaño y opacidad)
 *  - cols, rows: cantidad de puntos en la grilla
 *  - startX, startY: coordenada del primer punto
 *  - stepX, stepY: espaciado entre puntos
 *  - animate: si true, los puntos pulsan suavemente
 *  - animationDuration: duración del pulso en segundos (default 2s)
 */
export default function BFieldDots({
  intensity,
  cols = 5,
  rows = 5,
  startX = 195,
  startY = 35,
  stepX = 35,
  stepY = 30,
  animate = false,
  animationDuration = 2,
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
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (intensity < 0.02) return null;

  const r = 1.5 + intensity * 2.5;
  const op = 0.25 + intensity * 0.6;

  const dots = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx = startX + i * stepX;
      const cy = startY + j * stepY;
      // Desfase por posición para que el pulso sea ondulado, no simultáneo
      const delay = animate
        ? -((i * rows + j) / (cols * rows)) * animationDuration
        : 0;

      dots.push(
        <g key={`${i}-${j}`}>
          <circle
            cx={cx} cy={cy} r={r}
            fill="var(--accent-3)"
            opacity={op}
            style={animate ? {
              animation: `bfield-pulse ${animationDuration}s ease-in-out ${delay.toFixed(2)}s infinite`,
              transformOrigin: `${cx}px ${cy}px`,
            } : undefined}
          />
          <circle cx={cx} cy={cy} r={r * 0.38} fill={cutout} />
        </g>
      );
    }
  }

  return (
    <g>
      {animate && (
        <style>{`
          @keyframes bfield-pulse {
            0%   { transform: scale(1);    opacity: ${op.toFixed(2)}; }
            50%  { transform: scale(1.5);  opacity: ${Math.min(op + 0.25, 1).toFixed(2)}; }
            100% { transform: scale(1);    opacity: ${op.toFixed(2)}; }
          }
        `}</style>
      )}
      {dots}
    </g>
  );
}
