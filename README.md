# Simulador Faraday — Verificador U7 Inducción Electromagnética

Verificador interactivo de problemas de inducción electromagnética para Física II (UTN). Cubre 3 problemas de la Guía 7 con simulación en vivo (sliders + diagramas SVG), comparación de resultados y una sección de teoría completa.

---

## Contexto del proyecto

### ¿Para qué es?
Trabajo práctico de la materia **Física II** donde había que elegir una unidad temática del programa, seleccionar problemas de la guía, y armar un "sistema de verificación" accesible desde el celular para chequear resultados de ejercicios prácticos.

### Unidad elegida
**Unidad 7 — Fenómenos de inducción electromagnética**
- Ley de Faraday
- Ley de Lenz
- Variaciones de flujo magnético

### Problemas elegidos (de la Guía 7)
Se eligieron los 3 problemas más simples para que el verificador tenga sentido didáctico claro. Todos comparten la misma fórmula base (ε = -N·dΦ/dt) pero cada uno despeja una variable distinta:

| # | Enunciado | Lo que se calcula | Resultado esperado |
|---|-----------|-------------------|--------------------|
| 1 | Bobina rectangular (50 vueltas, 5×10 cm) cae desde B=0 hasta B=0.5 T en 0.25 s | fem promedio | **ε = 0.5 V** |
| 2 | Espira cuadrada de 0.20 m de lado, área disminuye a 0.1 m²/s, induce ε=18 mV | Campo B | **B = 0.18 T** |
| 3 | Bobina rectangular (75 vueltas, 5×8 cm, R=8 Ω) perpendicular a B variable, I inducida = 0.1 A | dB/dt | **dB/dt ≈ 2.67 T/s** |

Las explicaciones detalladas de cada problema (paso a paso, "idea para explicar al profesor") están en la sección **Teoría** de la app.

---

## Stack técnico

- **Vite** + **React 18** (sin TypeScript, JSX puro)
- CSS vanilla con **variables CSS** para teming (sin Tailwind, sin styled-components)
- Sin librerías de UI — todos los componentes son propios
- LocalStorage para persistir el tema (dark/light) entre sesiones

### ¿Por qué Vite?
- HMR (hot-reload) instantáneo
- Build size mínimo (sin runtime overhead)
- Config trivial, sin webpack ni dependencias adicionales

---

## Estructura del proyecto

```
Simulador Faraday/
├── package.json              # deps: react, react-dom, vite
├── vite.config.js            # config Vite (base: './' para servir como estático)
├── index.html                # entry HTML, importa main.jsx
├── .gitignore
├── README.md                 # este archivo
└── src/
    ├── main.jsx              # ReactDOM.render → App
    ├── App.jsx               # orquesta modos (práctica/teoría), problema actual, tema
    ├── styles/
    │   └── global.css        # TODO el CSS — variables, responsive, componentes
    ├── utils/
    │   └── format.js         # fmt, fmtUnit, splitUnit, compareResult
    ├── components/
    │   ├── Header.jsx        # título + toggle de tema
    │   ├── SliderControl.jsx # slider + input + select-unidad sincronizados
    │   ├── LiveResult.jsx    # panel verde con resultado vivo + tabla aux
    │   ├── CheckPanel.jsx    # input + comparar contra valor esperado
    │   ├── BFieldDots.jsx    # grilla de puntos (campo saliente) reactiva al tema
    │   └── TheoryView.jsx    # navegación + render de teoría
    ├── problems/
    │   ├── Problem1.jsx      # Bobina cae
    │   ├── Problem2.jsx      # Área disminuye
    │   └── Problem3.jsx      # dB/dt para I dada
    └── theory/
        └── sections.jsx      # contenido textual de las 6 secciones de teoría
```

### Decisiones de arquitectura

1. **Cada problema es un componente independiente** con su propio estado.
   No comparten estado — cada uno tiene `useState` para sus variables y `useMemo` para los cálculos derivados. Esto hace que sea trivial agregar/quitar problemas.

2. **El SliderControl es genérico**.
   Recibe `value`, `onChange`, opcionalmente `unit`/`onUnitChange`/`unitOptions`. El padre decide si mostrar selector de unidad o no.

3. **Los cálculos viven en `useMemo` dentro de cada problema**.
   Cuando cambia cualquier slider, React re-calcula automáticamente. El resultado se pasa a `LiveResult` y `CheckPanel`.

4. **El tema se maneja con clases en `body`**.
   `body.light` activa todas las variables del modo claro. Los SVG leen las variables CSS y se actualizan automáticamente. El componente `BFieldDots` usa `MutationObserver` para detectar el cambio de clase y re-leer `--svg-cutout` (que necesita un color sólido, no rgba).

5. **Responsive con media queries en `global.css`**.
   - Mobile (< 900 px): layout vertical, tabs horizontales, una sola columna.
   - Tablet+ (≥ 900 px): sidebar de problemas vertical y sticky, contenido al lado.
   - Desktop (≥ 1200 px): dentro de cada problema, dos columnas (controles | resultado).

---

## Cómo usarlo

### Arrancar en desarrollo

Una sola vez:
```bash
cd "D:\Proyectos\Fisica 2\Simulador Faraday"
npm install
```

Para desarrollar:
```bash
npm run dev
```
Te abre en `http://localhost:5173`. Cualquier cambio en código se refleja al instante (HMR).

### Buildear para producción

```bash
npm run build
```
Genera carpeta `dist/` con los archivos estáticos. Podés:
- Abrir `dist/index.html` directamente con doble click (anda offline)
- Subirlo a Netlify, Vercel, GitHub Pages, etc.
- Servir con cualquier servidor HTTP estático (`npx serve dist`)

### Probar el build sin servir

```bash
npm run preview
```

---

## Cómo funciona la app

### Modo Práctica
- Selector arriba: **Práctica** / **Teoría**.
- En Práctica, lateral (desktop) o superior (mobile): 3 botones P1 / P2 / P3.
- Cada problema muestra:
  - Diagrama SVG dinámico (los puntos del campo cambian de intensidad con el valor).
  - Sliders para cada variable (con input numérico y selector de unidades).
  - Panel verde **vivo** con el resultado calculado al instante.
  - Tabla auxiliar con los pasos intermedios.
  - Sección **"¿Coincide tu resultado?"** para meter tu cálculo a mano y validarlo.
    - <2% error → ✓ verde
    - 2-10% error → △ amarillo (revisar redondeo/unidades)
    - >10% → ✗ rojo (revisar fórmula)
- Botón **↺ Datos del enunciado** para volver a los valores originales.

### Modo Teoría
6 sub-secciones navegables con tabs:
- **Conceptos** — flujo magnético, formas de variarlo, unidades
- **Faraday** — la ley, casos (cambia B / cambia A / cambia θ), fem promedio
- **Lenz** — sentido de la corriente, signo, conservación de energía
- **P1**, **P2**, **P3** — explicación física + planteo paso a paso de cada problema, con "idea para explicar al profesor"

### Tema claro/oscuro
- Toggle 🌙/☀️ en la esquina superior derecha del header.
- Se guarda en `localStorage` (clave: `u7-theme`).
- Cambia: fondo, textos, colores de acento, SVGs, gráficos, etc.

---

## Cómo extender

### Agregar un problema 4

1. Copiar `src/problems/Problem3.jsx` como `Problem4.jsx`.
2. Cambiar `DEFAULTS`, el `useMemo` con la nueva fórmula, las `SliderControl`, y el SVG.
3. En `src/App.jsx`, agregar a la lista `PROBLEMS`:
   ```jsx
   { id: 'p4', short: 'P4', label: 'Nuevo', Component: Problem4 }
   ```
4. Opcionalmente, agregar una sección `P4` en `src/theory/sections.jsx` (en el array `THEORY_SECTIONS` y un componente `P4()` exportado, registrado en `THEORY_RENDERERS`).

### Cambiar colores del tema

Editar las variables CSS en `src/styles/global.css`:
- `:root { ... }` para el modo oscuro
- `body.light { ... }` para el modo claro

### Agregar otra unidad temática

La forma limpia sería crear otra carpeta `src/problems-u3/`, `src/problems-u4/`, etc., y un selector de unidad arriba del selector de problema. Pero si solo es para una unidad, esta estructura alcanza.

---

## Verificación de cálculos

Los resultados fueron verificados con Python antes de codear el front:

```python
# P1
N=50; a=0.05; b=0.10; B=0.5; dt=0.25
A = a*b
fem = N*B*A/dt        # = 0.5 V ✓

# P2
L=0.20; fem=0.018; dA=0.1
B = fem/dA            # = 0.18 T ✓

# P3
N=75; a=0.05; b=0.08; R=8; I=0.1
A = a*b
fem = I*R             # = 0.8 V
dBdt = fem/(N*A)      # ≈ 2.667 T/s ✓
```

Si modificás las fórmulas y querés re-verificar, los `useMemo` de cada problema están en `src/problems/Problem*.jsx`.

---

## TODO / mejoras futuras posibles

- [ ] Quizz mode: la app te tira valores random y vos resolvés a mano
- [ ] Modo "paso a paso": no muestra el resultado, te guía con preguntas
- [ ] Compartir un estado por URL (`?N=50&a=5&b=10...`) para mandarle un caso a un compañero
- [ ] PWA (manifest + service worker) para instalar como app y trabajar offline real
- [ ] Más problemas (5, 8, 9 también son tratables)
- [ ] Tests unitarios para `format.js` (jest o vitest)

---

## Historial del trabajo

Este proyecto pasó por varias iteraciones:

1. **HTML+CSS+JS vanilla simple** — primer mockup con 2 temas (Ohm y capacitores).
2. **Sliders dinámicos** — todo recalcula en vivo al mover sliders.
3. **Modo claro + teoría** — toggle de tema y sección completa de explicaciones.
4. **React + responsive** — versión actual: refactor a React/Vite, layout adaptativo móvil y escritorio.
