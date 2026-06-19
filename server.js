// ===================================================================
//  Quiz Daniel — Servidor en tiempo real (Express + Socket.IO)
//  Quiz interactivo multi-usuario sobre el libro de Daniel caps. 1 y 2
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
//    Si V < BASE/TOTAL → MAX_BONUS=30 < 1000/30 ≈ 33.3  ✓
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
//                             ultimoCambio, token } }
//
//  invitados: { [token]: { token, nombre, socketId|null, creado } }
//    Registro de invitaciones que el anfitrión genera. Cada token
//    preasigna un nombre; al entrar por ?token=... el participante
//    no escribe nada.
// -------------------------------------------------------------------
const jugadores = {};
const invitados = {}; // token -> { token, nombre, socketId, creado }

function nuevoToken() {
  return Math.random().toString(36).slice(2, 10); // 8 chars, suficientemente único
}

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

// Lista pública de invitaciones (sin internos) para el panel del anfitrión.
function listaInvitados() {
  return Object.values(invitados)
    .map(inv => ({
      token: inv.token,
      nombre: inv.nombre,
      conectado: !!inv.socketId,
      creado: inv.creado
    }))
    .sort((a, b) => a.creado - b.creado);
}

function emitirRanking() {
  io.emit('ranking-update', calcularRanking());
}

function emitirInvitados() {
  io.emit('invitados-update', listaInvitados());
}

// -------------------------------------------------------------------
//  Conexiones de clientes
// -------------------------------------------------------------------
io.on('connection', (socket) => {
  // Nuevo jugador. payload: { nombre?, host?, token? }  (o string por compatibilidad)
  //  - Si trae `host:true` → es el panel del anfitrión (no compite).
  //  - Si trae `token`     → resolvemos el nombre preasignado en `invitados`.
  //  - Si no                → usamos `nombre` (flujo clásico con escritura manual).
  socket.on('join', (payload) => {
    const data = typeof payload === 'string' ? { nombre: payload } : (payload || {});

    // Si llega con token, resolver invitación (no requiere escribir nombre)
    let token = null;
    let nombreResuelto = null;
    if (data.token && !invitados[data.token]) {
      socket.emit('invitacion-error', { mensaje: 'Esta invitación no existe o fue eliminada.' });
      return;
    }
    if (data.token && invitados[data.token]) {
      token = data.token;
      nombreResuelto = invitados[token].nombre;
      // Reconectar si la invitación ya tenía socket (ej. recarga de página)
    }

    const limpio = nombreResuelto
      || String(data.nombre || '').trim().slice(0, 24)
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
      token
    };

    // Vincular la invitación con el socket activo
    if (token) {
      // Si otro socket usaba el mismo token, liberarlo
      const prevId = invitados[token].socketId;
      if (prevId && prevId !== socket.id && jugadores[prevId]) {
        delete jugadores[prevId];
      }
      invitados[token].socketId = socket.id;
      emitirInvitados();
    }

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
      nombreConfirmado: nombreResuelto // el cliente sabe que entró por invitación
    });
    socket.emit('ranking-update', calcularRanking());
    socket.emit('invitados-update', listaInvitados());
    emitirRanking(); // notificar al resto (incluido el host)
  });

  // ---------- Eventos del anfitrión (gestión de invitaciones) ----------

  // El panel pide la URL base para construir enlaces (IP:puerto).
  socket.on('host:info', (cb) => {
    if (typeof cb === 'function') {
      const ip = obtenerIPLocal();
      cb({ baseUrl: `http://${ip}:${PORT}`, total: TOTAL_PREGUNTAS });
    }
  });

  // Crear UNA invitación. payload: { nombre }
  socket.on('host:crear', (payload, cb) => {
    const nombre = String((payload && payload.nombre) || '').trim().slice(0, 24) || 'Invitado';
    const token = nuevoToken();
    invitados[token] = { token, nombre, socketId: null, creado: Date.now() };
    emitirInvitados();
    if (typeof cb === 'function') cb({ ok: true, token, nombre });
  });

  // Crear VARIAS invitaciones de golpe. payload: { nombres: [..] }
  socket.on('host:crear-lote', (payload, cb) => {
    const nombres = (payload && Array.isArray(payload.nombres)) ? payload.nombres : [];
    const creados = nombres.map(n => {
      const nombre = String(n || '').trim().slice(0, 24) || 'Invitado';
      const token = nuevoToken();
      invitados[token] = { token, nombre, socketId: null, creado: Date.now() };
      return { token, nombre };
    });
    emitirInvitados();
    if (typeof cb === 'function') cb({ ok: true, creados });
  });

  // Eliminar una invitación (y desconectar a su jugador si estaba activo).
  socket.on('host:eliminar', (payload) => {
    const token = payload && payload.token;
    if (token && invitados[token]) {
      const sid = invitados[token].socketId;
      if (sid && jugadores[sid]) delete jugadores[sid];
      delete invitados[token];
      emitirRanking();
      emitirInvitados();
    }
  });

  // Reiniciar la sesión: borra TODOS los puntajes y progreso, pero
  // conserva la lista de invitaciones (para jugar otra ronda con los mismos).
  socket.on('host:reiniciar-sesion', () => {
    Object.keys(jugadores).forEach(sid => delete jugadores[sid]);
    Object.values(invitados).forEach(inv => { inv.socketId = null; });
    emitirRanking();
    emitirInvitados();
  });

  // Cliente responde una pregunta. payload: { indice, opcion, tiempoRestante }
  socket.on('answer', (payload) => {
    const j = jugadores[socket.id];
    if (!j) return;
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
  console.log('  📖 Quiz Daniel — Capítulos 1 y 2');
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
