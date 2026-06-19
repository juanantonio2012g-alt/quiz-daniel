# 📖 Quiz Daniel — Capítulos 1–12

Quiz interactivo **multi-usuario en tiempo real** sobre el libro de Daniel, capítulos 1–12.
Cada participante entra desde su propio celular y las calificaciones se sincronizan en vivo
en un ranking compartido. El anfitrión ve el progreso de todos desde un panel dedicado.

## ✨ Características

- Banco de preguntas basado en Daniel 1–12.
- **👑 Panel del anfitrión** (`/host.html`): progreso, aciertos, errores y puntaje de cada
  participante actualizados en tiempo real, más podio en vivo. Ideal para proyectar.
- **Política de calificación "Daniel"** que combina precisión + velocidad (ver más abajo).
- **Retroalimentación inmediata**: tras cada respuesta verás si acertaste, la respuesta correcta
  y una breve explicación con su referencia.
- **Temporizador por pregunta** (20 segundos).
- **Repaso final de errores** con todas las preguntas que fallaste y sus respuestas correctas.
- **Ranking en vivo + podio** (oro 🥇, plata 🥈, bronce 🥉).
- Diseño responsive (móvil primero).

## 🚀 Cómo usarlo

### 1. Instalar dependencias (solo la primera vez)
```bash
cd quiz-daniel
npm install
```

### 2. Iniciar el servidor
```bash
npm start
```
Verás en la terminal:
```
📖 Quiz Daniel — Capítulos 1–12
✅ Servidor activo
🌐 En esta computadora:  http://localhost:3000
📱 En celulares/tablets: http://192.168.x.x:3000
👑 Panel del anfitrión:  http://192.168.x.x:3000/host.html
```

### 3. Roles
- **Anfitrión (tú):** abre `http://localhost:3000/host.html` en tu computadora y déjala abierta
  (o proyéctala). Ahí verás aparecer a los participantes y su avance en vivo.
- **Participantes:** desde su celular, entran al enlace único que muestra el anfitrión,
  escriben su nombre y esperan la cuenta regresiva.

> 💡 Si la IP no funciona en los celulares, revisa que tu firewall permita conexiones
> entrantes en el puerto 3000 y que todos estén en la misma red.

## 📐 Política de calificación "Daniel"

**Lema:** *"El conocimiento es lo primero; la prisa lo corona."*

| Concepto | Regla |
|---|---|
| **Acierto** | 1000 pts base + bonus de velocidad (0–30 pts) |
| **Error / tiempo agotado** | 0 pts |
| **Bonus de velocidad** | `round(tiempoRestante / 20 × 30)` → responder al instante = +30; al límite = +0 |
| **Desempate** | Mayor puntaje; si idéntico, quien respondió antes |

**Garantía matemática:** con bonus máximo de 30 y base de 1000, **nadie con menos aciertos
puede superar a quien tuvo más**. La velocidad solo decide los empates y los puestos cercanos.

**Podio orientativo** (grupo típico de estudio):
- 🥇 **1er lugar:** 26–30 aciertos
- 🥈 **2do lugar:** 21–25 aciertos
- 🥉 **3er lugar:** 17–20 aciertos

*Orientativo, no excluyente:* si todos aciertan 30, gana el más veloz; si el grupo va aprendiendo,
con 18 se puede subir al podio. La política se autoadapta al nivel real del grupo.

## 🧠 Temas cubiertos

Daniel 1–12: la fidelidad de Daniel y sus amigos, la estatua del sueño de Nabucodonosor,
el horno de fuego, la humillación de Nabucodonosor, la escritura en la pared, el foso de
los leones y las principales visiones proféticas del libro.

## 🛠 Tecnología

- **Node.js + Express** para servir la página.
- **Socket.IO** para la sincronización en tiempo real (ranking, retroalimentación y panel del anfitrión).
- **Tailwind CSS (CDN)** para los estilos.
- Estado del juego en memoria (no se requiere base de datos).

## 📂 Estructura

```
quiz-daniel/
├── package.json
├── preguntas.js        # Banco de preguntas (fuente única de verdad)
├── server.js           # Servidor + política de puntaje + lógica en tiempo real
├── test-client.js      # Pruebas automáticas del flujo
├── public/
│   ├── index.html      # Interfaz del participante
│   └── host.html       # Panel del anfitrión (progreso en vivo)
└── README.md
```

## ✅ Pruebas

El archivo `test-client.js` simula jugadores (perfecto, todo-mal, mitad) y verifica
join → config → answer → feedback → repaso → ranking. Ejecútalo con el servidor en marcha:
```bash
npm test          # o: node test-client.js
```

## ☁️ Ponerlo en línea (acceso público con Render)

Para que cualquiera entre desde cualquier red (no solo tu Wi-Fi), despliega en
[Render.com](https://render.com) — soporta WebSockets/Socket.IO y tiene plan gratuito.

### Opción A — Blueprint (un clic, recomendado)
1. Sube el repo a GitHub (`git push`).
2. En Render: **New → Blueprint** → elige el repo.
3. Render lee [`render.yaml`](./render.yaml) y crea el servicio solo.
4. Cuando termine el deploy, tendrás una URL pública tipo
   `https://quiz-daniel.onrender.com`. ¡Esa es la que comparten los participantes!

### Opción B — Web Service manual
1. **New → Web Service** → conecta el repo.
2. Configura:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Crea el servicio. Render inyecta `PORT` automáticamente (`server.js` ya lo usa).

> 💡 El plan gratis de Render "duerme" el servicio tras ~15 min sin tráfico; el primer
> ingreso tras eso tarda ~30 s en despertar. Para una sesión en vivo sin interrupciones,
> considera el plan de pago (~$7/mes) o haz una visita previa para despertarlo.

---

Hecho para estudio bíblico interactivo. ¡Que aproveches el tiempo con la Palabra! 🙌
