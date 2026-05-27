import React from 'react';

/**
 * Contenido de teoría — cada sección retorna JSX.
 * Si querés editar las explicaciones, este es el archivo.
 */

export const THEORY_SECTIONS = [
  { id: 'intro',   label: 'Conceptos' },
  { id: 'faraday', label: 'Faraday'   },
  { id: 'lenz',    label: 'Lenz'      },
  { id: 'p1',      label: 'P1'        },
  { id: 'p2',      label: 'P2'        },
  { id: 'p3',      label: 'P3'        },
];

export function Intro() {
  return (
    <>
      <h2>Conceptos básicos</h2>
      <p>La <strong>inducción electromagnética</strong> es el fenómeno por el cual aparece una fuerza electromotriz (fem) y, si hay un circuito cerrado, una corriente eléctrica, cuando <em>varía el flujo magnético</em> a través de una espira.</p>

      <h3>¿Qué es el flujo magnético?</h3>
      <p>El flujo magnético Φ a través de una superficie mide "cuántas líneas de campo magnético atraviesan esa superficie". Es una magnitud escalar.</p>
      <div className="fnote">
        <span className="formula">Φ = B · A · cos(θ)</span>
        Donde <b>B</b> es la intensidad del campo, <b>A</b> el área de la espira, y <b>θ</b> el ángulo entre el vector normal a la superficie y el campo.<br />
        Si B es perpendicular al plano de la espira → θ=0 → Φ = B·A (caso más simple).
      </div>

      <h3>¿De qué formas puede variar el flujo?</h3>
      <p>Hay <strong>tres maneras</strong> de cambiar el flujo y producir fem:</p>
      <ol>
        <li><em>Cambia B</em> — el campo se hace más fuerte o más débil con el tiempo (caso de los problemas 1 y 3).</li>
        <li><em>Cambia A</em> — la espira se deforma, crece, se achica, o entra/sale del campo (caso del problema 2).</li>
        <li><em>Cambia θ</em> — la espira rota respecto al campo (generadores eléctricos).</li>
      </ol>

      <h3>Unidades</h3>
      <ul>
        <li><b>Φ</b> → Weber (Wb) = T·m²</li>
        <li><b>B</b> → Tesla (T) = Wb/m² = kg/(A·s²)</li>
        <li><b>ε</b> (fem) → Volt (V)</li>
      </ul>

      <div className="key">
        <b>Idea clave:</b> No es el flujo lo que produce fem, sino su <em>variación temporal</em>. Un flujo gigante pero constante no induce nada. Un flujo chico pero que cambia rápido sí.
      </div>
    </>
  );
}

export function Faraday() {
  return (
    <>
      <h2>Ley de Faraday</h2>
      <p>La fem inducida en un circuito cerrado es igual a <strong>menos la rapidez de variación del flujo magnético</strong> a través de la superficie limitada por el circuito.</p>
      <div className="fnote">
        <span className="formula">ε = − dΦ / dt</span>
        El signo menos es la <em>ley de Lenz</em> (oposición — ver siguiente sección).
      </div>

      <h3>Para N espiras (bobina)</h3>
      <p>Si en lugar de una sola espira tenés una bobina de N vueltas, cada vuelta "ve" el mismo flujo Φ. La fem total es la suma de las fem de cada vuelta:</p>
      <div className="fnote">
        <span className="formula">ε = − N · dΦ / dt</span>
        Donde N·Φ se llama <em>flujo enlazado</em>.
      </div>

      <h3>Casos según qué cambia</h3>

      <div className="ex-box">
        <div className="ex-title">Caso A — varía B</div>
        <p>Si el área es constante y el campo cambia en el tiempo:</p>
        <div className="fnote"><span className="formula">ε = − N · A · dB/dt</span></div>
        <p><b>Ejemplo:</b> bobina fija dentro de un solenoide cuya corriente aumenta.</p>
      </div>

      <div className="ex-box">
        <div className="ex-title">Caso B — varía A</div>
        <p>Si B es constante y el área cambia:</p>
        <div className="fnote"><span className="formula">ε = − N · B · dA/dt</span></div>
        <p><b>Ejemplo:</b> una barra que se desliza sobre dos rieles dentro de un campo, expandiendo o reduciendo el circuito.</p>
      </div>

      <div className="ex-box">
        <div className="ex-title">Caso C — varía θ</div>
        <p>Si B y A son constantes pero la espira rota:</p>
        <div className="fnote"><span className="formula">ε = N · B · A · ω · sen(ωt)</span></div>
        <p><b>Ejemplo:</b> generador eléctrico (alternador).</p>
      </div>

      <h3>fem promedio vs instantánea</h3>
      <p>Cuando un problema te pide la <em>fem promedio</em> en un intervalo Δt, usás:</p>
      <div className="fnote"><span className="formula">ε_prom = N · |ΔΦ| / Δt</span></div>
      <p>Esto es lo que usás en los Problemas 1, 2 y 3 de la guía: variaciones finitas, no derivadas instantáneas.</p>
    </>
  );
}

export function Lenz() {
  return (
    <>
      <h2>Ley de Lenz</h2>
      <p>El sentido de la corriente inducida es tal que se <strong>opone a la variación del flujo</strong> que la generó. Es una consecuencia de la conservación de la energía.</p>

      <div className="key">
        <b>Resumen práctico:</b> Si el flujo enlazado por la espira <em>aumenta</em>, la corriente inducida circula en el sentido que produce un campo magnético <em>opuesto</em> al original. Si el flujo <em>disminuye</em>, la corriente trata de <em>mantenerlo</em> creando un campo en el mismo sentido.
      </div>

      <h3>Cómo determinar el sentido en un dibujo</h3>
      <ol>
        <li>Identificá la dirección de B y si entra o sale del plano.</li>
        <li>Decidí si el flujo Φ está <em>aumentando</em> o <em>disminuyendo</em> con el tiempo.</li>
        <li>El campo inducido B_ind debe <strong>oponerse</strong> a ese cambio:
          <ul>
            <li>Si Φ crece → B_ind apunta en sentido contrario a B.</li>
            <li>Si Φ decrece → B_ind apunta en el mismo sentido que B.</li>
          </ul>
        </li>
        <li>Aplicá la <em>regla de la mano derecha</em>: pulgar en dirección de B_ind, dedos curvados indican el sentido de la corriente inducida.</li>
      </ol>

      <h3>Convenio del signo</h3>
      <p>Si elegís el vector normal a la espira saliente al plano:</p>
      <ul>
        <li>B saliente → Φ positivo</li>
        <li>B entrante → Φ negativo</li>
        <li>Corriente <em>antihoraria</em> (vista desde adelante) → fem positiva</li>
        <li>Corriente <em>horaria</em> → fem negativa</li>
      </ul>

      <h3>De dónde sale la energía</h3>
      <p>La energía de la corriente inducida no viene "de la nada". Sale del trabajo que tenés que hacer contra la fuerza magnética para producir el cambio: por ejemplo, empujar el imán hacia la bobina, o mover la barra contra la fuerza F = IL×B. Si la espira se opusiera, sería un móvil perpetuo (imposible).</p>
    </>
  );
}

export function P1() {
  return (
    <>
      <h2>Cómo entender el Problema 1</h2>
      <p><b>Enunciado:</b> Una bobina rectangular de N=50 vueltas y dimensiones 5cm × 10cm cae desde una región donde B=0 a una donde B=0.5 T (perpendicular al plano de la bobina). El movimiento toma Δt=0.25 s. Calcular la fem promedio.</p>

      <h3>¿Qué está pasando físicamente?</h3>
      <p>La bobina arranca en una zona sin campo (Φ_inicial = 0). En 0.25 s "cae" o se traslada hasta quedar dentro de una región uniforme con B=0.5 T, donde el flujo por espira pasa a ser Φ_final = B·A. Como cambia el flujo, aparece fem.</p>

      <div className="ex-box">
        <div className="ex-title">Lo que cambia</div>
        <p>En este problema NO cambia ni B ni el área de la espira: lo que cambia es <em>cuánto del campo "ve" la espira</em>. Es equivalente a decir que B efectivo pasa de 0 a 0.5 T en Δt segundos.</p>
      </div>

      <h3>Cómo plantearlo paso a paso</h3>
      <ol>
        <li>Calculá el área: A = 0.05 m × 0.10 m = 5×10⁻³ m².</li>
        <li>Variación de flujo por espira: ΔΦ = Φ_f − Φ_i = B·A − 0 = 0.5 × 0.005 = 2.5×10⁻³ Wb.</li>
        <li>Aplicá Faraday para bobina: ε = N · ΔΦ / Δt.</li>
        <li>Reemplazá: ε = 50 × 2.5×10⁻³ / 0.25 = 0.5 V.</li>
      </ol>

      <div className="key">
        <b>Resultado:</b> ε ≈ 0.5 V<br />
        <b>Idea para explicar:</b> "Como el flujo cambia de 0 a B·A en Δt, la fem promedio es N veces ese cambio dividido por el tiempo. El signo negativo de Faraday solo nos dice el sentido; el módulo es lo que pide el problema."
      </div>
    </>
  );
}

export function P2() {
  return (
    <>
      <h2>Cómo entender el Problema 2</h2>
      <p><b>Enunciado:</b> Una espira cuadrada de una vuelta y 0.20 m de lado está en un B constante perpendicular a su plano. El área disminuye a 0.1 m²/s y se induce ε=18 mV. Hallar B.</p>

      <h3>¿Qué está pasando físicamente?</h3>
      <p>Acá B es constante (no cambia en el tiempo) pero la espira se está deformando: su área se reduce a ritmo dA/dt = -0.1 m²/s. Como Φ = B·A, al cambiar A cambia Φ, y aparece fem.</p>

      <div className="ex-box">
        <div className="ex-title">El truco con el signo</div>
        <p>El problema dice "el área disminuye a 0.1 m²/s". El módulo es 0.1; el signo negativo solo indica que está bajando. Para calcular el módulo de la fem usás el valor absoluto.</p>
      </div>

      <h3>Cómo plantearlo</h3>
      <ol>
        <li>Faraday para N=1: ε = − dΦ/dt = − B · dA/dt (porque B es constante).</li>
        <li>En módulos: |ε| = B · |dA/dt|.</li>
        <li>Despejás B: <b>B = ε / |dA/dt|</b>.</li>
        <li>Reemplazás: B = 0.018 V / 0.1 m²/s = 0.18 T.</li>
      </ol>

      <div className="ex-box">
        <div className="ex-title">¿Y el lado de la espira?</div>
        <p>El dato "0.20 m de lado" parece importante, pero <em>no lo usás</em>. ¿Por qué? Porque ya te dan directamente la rapidez de cambio de área (dA/dt), no necesitás reconstruirla desde la geometría. El lado solo te sirve para verificar que la cuenta es físicamente razonable (el área inicial es 0.04 m², así que reducirse a 0.1 m²/s significa que se vacía en menos de medio segundo).</p>
      </div>

      <div className="key">
        <b>Resultado:</b> B = 0.18 T = 180 mT<br />
        <b>Idea para explicar:</b> "Como B no cambia, toda la fem viene del cambio de área. Despejé B de la fórmula de Faraday y obtuve 0.18 T, un campo magnético moderado."
      </div>
    </>
  );
}

export function P3() {
  return (
    <>
      <h2>Cómo entender el Problema 3</h2>
      <p><b>Enunciado:</b> Bobina rectangular 5cm × 8cm, N=75 vueltas, resistencia total R=8Ω, perpendicular a un B variable. ¿Con qué rapidez debe cambiar B para que la corriente inducida sea I=0.1 A?</p>

      <h3>¿Qué está pasando físicamente?</h3>
      <p>La bobina está quieta en un campo magnético cuya magnitud B cambia en el tiempo. Ese cambio de B genera una fem (Faraday), y como la bobina tiene resistencia y forma un circuito cerrado, esa fem hace circular una corriente I. La pregunta es: ¿qué tan rápido tiene que cambiar B para conseguir esa corriente?</p>

      <div className="ex-box">
        <div className="ex-title">Dos leyes en un solo problema</div>
        <p>Acá se combinan <em>dos relaciones</em>:</p>
        <ul>
          <li><b>Ohm:</b> ε = I · R (la fem hace circular corriente a través de la resistencia)</li>
          <li><b>Faraday:</b> ε = N · A · dB/dt (la fem viene del cambio de flujo)</li>
        </ul>
        <p>Igualando las dos expresiones de ε podés despejar dB/dt.</p>
      </div>

      <h3>Cómo plantearlo paso a paso</h3>
      <ol>
        <li>Área: A = 0.05 × 0.08 = 4×10⁻³ m².</li>
        <li>Calculá la fem que necesitás (Ohm): ε = I · R = 0.1 × 8 = 0.8 V.</li>
        <li>Aplicá Faraday: ε = N · A · |dB/dt| → dB/dt = ε / (N · A).</li>
        <li>Reemplazá: dB/dt = 0.8 / (75 × 0.004) = 0.8 / 0.3 ≈ 2.67 T/s.</li>
      </ol>

      <div className="key">
        <b>Resultado:</b> dB/dt ≈ 2.67 T/s<br />
        <b>Idea para explicar:</b> "Necesito 0.8 V de fem (por Ohm), y como tengo 75 vueltas con 4 cm² de área cada una, necesito que B varíe a 2.67 T por segundo. Es un cambio rápido, pero alcanzable con un electroimán al que se le varía la corriente."
      </div>

      <h3>¿Por qué dB/dt en T/s?</h3>
      <p>Las unidades chequean:<br />
        [ε/N·A] = V / m² = (Wb/s) / m² = T·m² / (s · m²) = T/s ✓<br />
        Tiene sentido: T/s es "cuántos Teslas cambia el campo cada segundo".</p>
    </>
  );
}

export const THEORY_RENDERERS = {
  intro:   Intro,
  faraday: Faraday,
  lenz:    Lenz,
  p1:      P1,
  p2:      P2,
  p3:      P3,
};
