// ===================================================================
//  Prueba funcional del Quiz Daniel
//  Simula jugadores reales vía Socket.IO respondiendo de forma
//  secuencial (una pregunta a la vez) y valida todo el flujo:
//    join → config → answer → feedback → repaso → ranking
//
//  Además valida la POLÍTICA DE CALIFICACIÓN:
//    • Acierto = 1000 + bonus(0..30)  ;  Fallo = 0
//    • Bonus = round(tiempoRestante / 20 * 30)
//    • Garantía: nadie con menos aciertos supera a quien tuvo más.
//
//  Uso:  node test-client.js   (requiere el servidor corriendo)
// ===================================================================

const { io } = require('socket.io-client');
const { PREGUNTAS, TOTAL_PREGUNTAS } = require('./preguntas');

const URL = 'http://localhost:3000';
const TOTAL = TOTAL_PREGUNTAS;
const BASE = 1000;
const MAX_BONUS = 30;
const TIEMPO = 20;

function bonusEsperado(tiempoRestante) {
  return Math.round((tiempoRestante / TIEMPO) * MAX_BONUS);
}

// Crea un jugador. modo:
//   'perfecto'  → siempre correcta, responde rápido (tiempoRestante=20 → bonus 30)
//   'lento'     → siempre correcta, responde al límite (tiempoRestante=1 → bonus 2)
//   'todos-mal' → siempre incorrecta
//   'mitad'     → acierta la primera mitad, falla la segunda
function crearJugador(nombre, modo) {
  let readyResolve;
  const ready = new Promise((resolve) => { readyResolve = resolve; });
  const done = new Promise((resolve) => {
    const socket = io(URL, { transports: ['websocket'] });
    const estado = {
      conectado: false, recibioConfig: false, feedbacks: 0,
      aciertosRecibidos: 0, puntajeSumado: 0,
      repaso: null, errores: []
    };

    function decision(indice) {
      const correcta = PREGUNTAS[indice].correcta;
      let bien, opcion, tiempo;
      if (modo === 'perfecto') { bien = true; opcion = correcta; tiempo = 20; }
      else if (modo === 'lento') { bien = true; opcion = correcta; tiempo = 1; }
      else if (modo === 'todos-mal') { bien = false; opcion = (correcta + 1) % 4; tiempo = 10; }
      else { bien = indice < TOTAL / 2; opcion = bien ? correcta : (correcta + 1) % 4; tiempo = 15; }
      return { bien, opcion, tiempo };
    }

    socket.on('connect', () => { estado.conectado = true; socket.emit('join', nombre); });

    socket.on('config', (cfg) => {
      estado.recibioConfig = true;
      if (cfg.total !== TOTAL) estado.errores.push(`config.total=${cfg.total}`);
      if (!Array.isArray(cfg.preguntas) || cfg.preguntas.length !== TOTAL)
        estado.errores.push(`config.preguntas.length inválido`);
      const traeRespuesta = cfg.preguntas.some(p => 'correcta' in p || 'explicacion' in p);
      if (traeRespuesta) estado.errores.push('Preguntas públicas revelan la respuesta');
      readyResolve();
    });

    socket.on('game:start', () => {
      const d = decision(0);
      socket.emit('answer', { indice: 0, opcion: d.opcion, tiempoRestante: d.tiempo });
    });

    socket.on('feedback', (fb) => {
      estado.feedbacks++;
      const d = decision(fb.indice);
      const real = PREGUNTAS[fb.indice].correcta;
      if (fb.correcta !== real) estado.errores.push(`fb ${fb.indice} correcta incorrecta`);
      // Validar acierto
      if (fb.acierto !== d.bien) estado.errores.push(`fb ${fb.indice} acierto=${fb.acierto} (esperado ${d.bien})`);
      if (fb.acierto) {
        estado.aciertosRecibidos++;
        // Validar puntaje: BASE + bonusEsperado(tiempo)
        const esp = BASE + bonusEsperado(d.tiempo);
        if (fb.puntosGanados !== esp) estado.errores.push(`fb ${fb.indice} puntos=${fb.puntosGanados} (esperado ${esp})`);
        if (fb.bonusVelocidad !== bonusEsperado(d.tiempo)) estado.errores.push(`fb ${fb.indice} bonus=${fb.bonusVelocidad} (esperado ${bonusEsperado(d.tiempo)})`);
        estado.puntajeSumado += fb.puntosGanados;
      } else {
        if (fb.puntosGanados !== 0) estado.errores.push(`fb ${fb.indice} fallo con puntos=${fb.puntosGanados}`);
      }
      const siguiente = fb.indice + 1;
      if (siguiente < TOTAL) {
        const nd = decision(siguiente);
        socket.emit('answer', { indice: siguiente, opcion: nd.opcion, tiempoRestante: nd.tiempo });
      } else {
        socket.emit('solicitar-repaso');
      }
    });

    socket.on('repaso', (r) => {
      estado.repaso = r;
      // Validar que el puntaje del repaso coincide con la suma de feedbacks
      if (r.puntaje !== estado.puntajeSumado)
        estado.errores.push(`repaso.puntaje=${r.puntaje} (esperado ${estado.puntajeSumado})`);
      socket.disconnect();
      resolve({ nombre, modo, ...estado });
    });

    socket.on('connect_error', () => {
      estado.errores.push('No se pudo conectar al servidor');
      readyResolve();
      resolve({ nombre, modo, ...estado });
    });
  });
  return { ready, done };
}

(async () => {
  console.log('Conectando jugadores de prueba...\n');
  const host = io(URL, { transports: ['websocket'] });
  await new Promise((resolve) => {
    host.on('connect', () => {
      host.emit('join', { nombre: 'Host de prueba', host: true });
      resolve();
    });
  });

  // Orden de conexión intencional para probar desempate por velocidad:
  //   Perfecto y Lento aciertan los 30, pero Perfecto responde más rápido.
  const jugadores = [
    crearJugador('Perfecto', 'perfecto'),     // 30 aciertos, bonus 30 c/u
    crearJugador('Veloz', 'perfecto'),        // 30 aciertos, bonus 30 c/u (idéntico puntaje)
    crearJugador('Lento', 'lento'),           // 30 aciertos, bonus 2 c/u
    crearJugador('Novato', 'todos-mal'),      // 0 aciertos
    crearJugador('Estudiante', 'mitad'),      // 15 aciertos
  ];
  await Promise.all(jugadores.map(j => j.ready));
  host.emit('host:iniciar-juego');
  const resultados = await Promise.all(jugadores.map(j => j.done));
  host.disconnect();

  const [perfecto, veloz, lento, novato, estudiante] = resultados;
  const imprimir = (j) => console.log(
    `• ${j.nombre.padEnd(11)} | aciertos:${j.aciertosRecibidos} ` +
    `puntaje:${j.puntajeSumado} ` +
    `repaso:${j.repaso ? j.repaso.aciertos + '/' + j.repaso.errores : '—'}`
  );
  resultados.forEach(imprimir);

  const ok = [];
  const check = (n, c) => ok.push([n, !!c]);

  // --- Flujo básico ---
  check('Perfecto conectó y recibió config', perfecto.conectado && perfecto.recibioConfig);
  check('Perfecto: 30 feedbacks', perfecto.feedbacks === TOTAL);
  check('Perfecto: 30 aciertos', perfecto.aciertosRecibidos === TOTAL);
  check('Perfecto: repaso con 0 errores', perfecto.repaso && perfecto.repaso.errores === 0);

  check('Novato: 0 aciertos', novato.aciertosRecibidos === 0);
  check('Novato: repaso con 30 errores', novato.repaso && novato.repaso.errores === TOTAL);

  check('Estudiante: 15 aciertos y 15 errores', estudiante.aciertosRecibidos === 15 && estudiante.repaso && estudiante.repaso.errores === 15);

  // --- Política de puntaje ---
  // Perfecto: 30 * (1000 + 30) = 30900
  check('Perfecto puntaje = 30 × (1000+30) = 30900', perfecto.puntajeSumado === 30 * (BASE + MAX_BONUS));
  // Lento: 30 * (1000 + bonus(1)=2) = 30060
  check('Lento puntaje = 30 × (1000+2) = 30060', lento.puntajeSumado === 30 * (BASE + bonusEsperado(1)));
  // Novato: 0
  check('Novato puntaje = 0', novato.puntajeSumado === 0);

  // --- Garantía de no inversión de precisión ---
  // Lento (30 aciertos) SIEMPRE supera a Estudiante (15 aciertos), sin importar velocidad.
  check('Garantía: 30 aciertos (lento) > 15 aciertos (estudiante)', lento.puntajeSumado > estudiante.puntajeSumado);
  check('Garantía: 15 aciertos > 0 aciertos', estudiante.puntajeSumado > novato.puntajeSumado);

  // --- Sin errores de formato/seguridad/puntaje ---
  const errores = resultados.flatMap(r => r.errores);
  check('Sin errores de formato/seguridad/puntaje', errores.length === 0);

  console.log('\n=== Resultado de pruebas ===');
  let fallaron = 0;
  ok.forEach(([n, p]) => { console.log(`${p ? '✅' : '❌'} ${n}`); if (!p) fallaron++; });
  if (errores.length) { console.log('\nDetalles:'); errores.forEach(e => console.log('  ⚠️  ' + e)); }
  console.log(fallaron === 0 ? '\n🎉 Todas las pruebas pasaron.' : `\n⚠️  ${fallaron} prueba(s) fallaron.`);
  process.exit(fallaron === 0 ? 0 : 1);
})();
