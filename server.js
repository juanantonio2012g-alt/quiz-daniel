// ===================================================================
//  Quiz Daniel — Servidor en tiempo real (Express + Socket.IO)
//  Quiz interactivo multi-usuario sobre el libro de Daniel caps. 1-12
// ===================================================================

const express = require('express');
const http = require('http');
const os = require('os');
const path = require('path');
const { Server } = require('socket.io');
const { PREGUNTAS, TOTAL_PREGUNTAS, preguntasPublicas } = require('./preguntas');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------------
//  POLÍTICA DE CALIFICACIÓN "DANIEL"
//  Lema: "El conocimiento es lo primero; la prisa lo corona."
//
//  • Acierto    = BASE (1000) + BONUS_VELOCIDAD (0..MAX_BONUS)
//  • Error      = 0 puntos
//  • BONUS_VELOCIDAD = round(tiempoRestante / TIEMPO_PREGUNTA * MAX_BONUS)
//  • Desempate  = mayor puntaje; si idéntico, quien respondió antes.
//
//  Garantía matemática (la precisión nunca se invierte):
//    Si V < BASE/TOTAL → MAX_BONUS=30 < 1000/TOTAL  ✓
//    Nadie con menos aciertos puede superar a quien tuvo más.
//  La velocidad decide los empates y los puestos cercanos.
// -------------------------------------------------------------------
const POLITICA = {
  BASE: 1000,
  MAX_BONUS: 30,
  TIEMPO_PREGUNTA: 20, // segundos
  POSICIONES_GANADORAS: 3
};

function bonusVelocidad(tiempoRestante) {
  if (typeof tiempoRestante !== 'number' || tiempoRestante < 0) tiempoRestante = 0;
  if (tiempoRestante > POLITICA.TIEMPO_PREGUNTA) tiempoRestante = POLITICA.TIEMPO_PREGUNTA;
  return Math.round((tiempoRestante / POLITICA.TIEMPO_PREGUNTA) * POLITICA.MAX_BONUS);
}

// -------------------------------------------------------------------
//  Estado en memoria del juego
//  jugadores: { [socketId]: { id, nombre, esHost, indice, aciertos,
//                             errores, puntaje, tiempoAcumulado,
//                             respuestas:[bool|null], terminado,
//                             ultimoCambio, sala } }
//
//  salaCompartida:
//    Un solo enlace para todos los participantes. Cada persona entra,
//    escribe su nombre y espera a que el anfitrión inicie la partida.
// -------------------------------------------------------------------
const jugadores = {};

function nuevoToken() {
  return Math.random().toString(36).slice(2, 10); // 8 chars, suficientemente único
}

const salaCompartida = nuevoToken();
const juego = {
  estado: 'esperando', // esperando | cuenta | jugando
  cuenta: 0,
  inicio: null,
  countdownId: null
};

// Ranking ordenado por: puntaje (desc) → quien respondió antes (asc).
function calcularRanking() {
  return Object.values(jugadores)
    .map(j => ({
      id: j.id,
      nombre: j.nombre,
      esHost: j.esHost,
      aciertos: j.aciertos,
      errores: j.errores,
      respondidas: j.indice,
      puntaje: j.puntaje,
      tiempoAcumulado: j.tiempoAcumulado,
      terminado: j.terminado,
      total: TOTAL_PREGUNTAS,
      ultimoCambio: j.ultimoCambio
    }))
    .filter(j => !j.esHost) // el host no compite
    .sort((a, b) => {
      if (b.puntaje !== a.puntaje) return b.puntaje - a.puntaje;
      return a.ultimoCambio - b.ultimoCambio;
    });
}

function emitirRanking() {
  io.emit('ranking-update', calcularRanking());
}

function estadoPublico() {
  return {
    estado: juego.estado,
    cuenta: juego.cuenta,
    inicio: juego.inicio
  };
}

function resetearJugadores() {
  Object.values(jugadores).forEach(j => {
    if (j.esHost) return;
    j.indice = 0;
    j.aciertos = 0;
    j.errores = 0;
    j.puntaje = 0;
    j.tiempoAcumulado = 0;
    j.respuestas = new Array(TOTAL_PREGUNTAS).fill(null);
    j.terminado = false;
    j.ultimoCambio = Date.now();
  });
}

function emitirEstadoJuego() {
  io.emit('game:state', estadoPublico());
}

function iniciarCuentaRegresiva() {
  if (juego.estado === 'cuenta' || juego.estado === 'jugando') return false;
  resetearJugadores();
  juego.estado = 'cuenta';
  juego.cuenta = 3;
  juego.inicio = null;
  emitirRanking();
  emitirEstadoJuego();
  io.emit('game:countdown', { segundos: juego.cuenta });

  juego.countdownId = setInterval(() => {
    juego.cuenta -= 1;
    if (juego.cuenta > 0) {
      io.emit('game:countdown', { segundos: juego.cuenta });
      emitirEstadoJuego();
      return;
    }

    clearInterval(juego.countdownId);
    juego.countdownId = null;
    juego.estado = 'jugando';
    juego.cuenta = 0;
    juego.inicio = Date.now();
    emitirEstadoJuego();
    io.emit('game:start', { inicio: juego.inicio });
  }, 1000);
  return true;
}

function volverAEspera() {
  if (juego.countdownId) clearInterval(juego.countdownId);
  juego.countdownId = null;
  juego.estado = 'esperando';
  juego.cuenta = 0;
  juego.inicio = null;
  resetearJugadores();
  emitirRanking();
  emitirEstadoJuego();
}

function obtenerBaseUrl(socket) {
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
  const host = socket.handshake.headers.host;
  if (host) {
    const proto = socket.handshake.headers['x-forwarded-proto'] || 'http';
    return `${proto}://${host}`;
  }
  return `http://${obtenerIPLocal()}:${PORT}`;
}

// -------------------------------------------------------------------
//  Conexiones de clientes
// -------------------------------------------------------------------
io.on('connection', (socket) => {
  // Nuevo jugador. payload: { nombre?, host?, sala? }  (o string por compatibilidad)
  //  - Si trae `host:true` → es el panel del anfitrión (no compite).
  //  - Si trae `sala`      → debe coincidir con el enlace compartido.
  //  - El participante escribe su nombre y espera el inicio del anfitrión.
  socket.on('join', (payload) => {
    const data = typeof payload === 'string' ? { nombre: payload } : (payload || {});

    if (!data.host && data.sala && data.sala !== salaCompartida) {
      socket.emit('sala-error', { mensaje: 'Este enlace de sala no existe o ya no es válido.' });
      return;
    }

    if (!data.host && juego.estado === 'jugando') {
      socket.emit('sala-error', { mensaje: 'El juego ya inició. Espera a la próxima ronda.' });
      return;
    }

    const limpio = String(data.nombre || '').trim().slice(0, 24)
      || 'Anónimo';

    jugadores[socket.id] = {
      id: socket.id,
      nombre: limpio,
      esHost: !!data.host,
      indice: 0,
      aciertos: 0,
      errores: 0,
      puntaje: 0,
      tiempoAcumulado: 0,
      respuestas: new Array(TOTAL_PREGUNTAS).fill(null),
      terminado: false,
      ultimoCambio: Date.now(),
      sala: data.host ? null : salaCompartida
    };

    // Enviamos preguntas (sin respuestas) + total + política pública + nombre confirmado.
    socket.emit('config', {
      total: TOTAL_PREGUNTAS,
      preguntas: preguntasPublicas(),
      politica: {
        base: POLITICA.BASE,
        maxBonus: POLITICA.MAX_BONUS,
        tiempoPregunta: POLITICA.TIEMPO_PREGUNTA,
        posicionesGanadoras: POLITICA.POSICIONES_GANADORAS
      },
      nombreConfirmado: limpio,
      sala: salaCompartida,
      juego: estadoPublico()
    });
    socket.emit('ranking-update', calcularRanking());
    socket.emit('game:state', estadoPublico());
    emitirRanking(); // notificar al resto (incluido el host)
  });

  // ---------- Eventos del anfitrión (sala compartida) ----------

  // El panel pide la URL base para construir enlaces (IP:puerto).
  socket.on('host:info', (cb) => {
    if (typeof cb === 'function') {
      const baseUrl = obtenerBaseUrl(socket);
      cb({
        baseUrl,
        joinUrl: `${baseUrl}/?sala=${salaCompartida}`,
        sala: salaCompartida,
        total: TOTAL_PREGUNTAS,
        juego: estadoPublico()
      });
    }
  });

  socket.on('host:iniciar-juego', (cb) => {
    const participantes = calcularRanking().length;
    if (!participantes) {
      if (typeof cb === 'function') cb({ ok: false, mensaje: 'Aún no hay participantes en la sala.' });
      return;
    }
    const ok = iniciarCuentaRegresiva();
    if (typeof cb === 'function') cb(ok ? { ok: true } : { ok: false, mensaje: 'El juego ya está en curso.' });
  });

  // Reiniciar la sesión: borra TODOS los puntajes y progreso, pero
  // conserva a los participantes conectados en la sala de espera.
  socket.on('host:reiniciar-sesion', () => {
    volverAEspera();
  });

  // Cliente responde una pregunta. payload: { indice, opcion, tiempoRestante }
  socket.on('answer', (payload) => {
    const j = jugadores[socket.id];
    if (!j) return;
    if (j.esHost || juego.estado !== 'jugando') return;
    const { indice, opcion, tiempoRestante } = payload || {};
    if (typeof indice !== 'number' || indice < 0 || indice >= TOTAL_PREGUNTAS) return;
    if (j.respuestas[indice] !== null) return; // ya respondida

    const correcta = PREGUNTAS[indice].correcta;
    const acierto = opcion === correcta;
    j.respuestas[indice] = acierto;

    let puntosPregunta = 0;
    if (acierto) {
      j.aciertos += 1;
      const bonus = bonusVelocidad(tiempoRestante);
      puntosPregunta = POLITICA.BASE + bonus;
      j.puntaje += puntosPregunta;
    } else {
      j.errores += 1;
    }
    // Tiempo empleado en esta pregunta (para métrica de rapidez promedio)
    const t = typeof tiempoRestante === 'number'
      ? Math.max(0, POLITICA.TIEMPO_PREGUNTA - tiempoRestante)
      : POLITICA.TIEMPO_PREGUNTA;
    j.tiempoAcumulado += t;
    j.indice = Math.max(j.indice, indice + 1);
    j.ultimoCambio = Date.now();

    // Retroalimentación inmediata para este jugador
    socket.emit('feedback', {
      indice,
      acierto,
      correcta,
      puntosGanados: puntosPregunta,
      bonusVelocidad: acierto ? (puntosPregunta - POLITICA.BASE) : 0,
      explicacion: PREGUNTAS[indice].explicacion,
      ref: PREGUNTAS[indice].ref
    });

    if (j.indice >= TOTAL_PREGUNTAS) j.terminado = true;

    emitirRanking();
  });

  // Cliente pide el repaso final de errores
  socket.on('solicitar-repaso', () => {
    const j = jugadores[socket.id];
    if (!j) return;
    const errores = [];
    j.respuestas.forEach((acierto, i) => {
      if (acierto === false) {
        errores.push({
          indice: i,
          cap: PREGUNTAS[i].cap,
          pregunta: PREGUNTAS[i].pregunta,
          opciones: PREGUNTAS[i].opciones,
          correcta: PREGUNTAS[i].correcta,
          ref: PREGUNTAS[i].ref
        });
      }
    });
    socket.emit('repaso', {
      aciertos: j.aciertos,
      errores: j.errores,
      puntaje: j.puntaje,
      total: TOTAL_PREGUNTAS,
      lista: errores
    });
  });

  socket.on('disconnect', () => {
    if (jugadores[socket.id]) {
      delete jugadores[socket.id];
      emitirRanking();
    }
  });
});

// -------------------------------------------------------------------
//  Arranque del servidor
// -------------------------------------------------------------------
function obtenerIPLocal() {
  const interfaces = os.networkInterfaces();
  for (const nombre of Object.keys(interfaces)) {
    for (const iface of interfaces[nombre]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

server.listen(PORT, () => {
  // Render inyecta RENDER=true y la URL pública en RENDER_EXTERNAL_URL.
  const esRender = process.env.RENDER === 'true' || !!process.env.RENDER_EXTERNAL_URL;
  const urlPublica = process.env.RENDER_EXTERNAL_URL
    || `http://${obtenerIPLocal()}:${PORT}`;

  console.log('\n────────────────────────────────────────────────');
  console.log('  📖 Quiz Daniel — Capítulos 1–12');
  console.log('────────────────────────────────────────────────');
  console.log(`  ✅ Servidor activo  (entorno: ${esRender ? 'Render (producción)' : 'local'})`);
  console.log(`  🌐 URL pública:           ${urlPublica}`);
  if (!esRender) {
    console.log(`  🌐 En esta computadora:  http://localhost:${PORT}`);
  }
  console.log(`  👑 Panel del anfitrión:  ${urlPublica}/host.html`);
  console.log(`  👥 Comparte la URL pública con los participantes`);
  console.log('────────────────────────────────────────────────\n');
});
