// ===================================================================
//  Banco de preguntas — fuente única de verdad
//  30 preguntas en total (15 de Daniel 1 + 15 de Daniel 2)
//
//  Cada pregunta:
//    cap         → capítulo (1 o 2)
//    pregunta    → enunciado
//    opciones    → arreglo de 4 opciones
//    correcta    → índice (0-3) de la opción correcta
//    explicacion → texto que se muestra en la retroalimentación
//    ref         → referencia bíblica
//
//  Este módulo lo usan:
//    - server.js      → para validar respuestas y armar el repaso
//    - test-client.js → para conocer las respuestas correctas al probar
//
//  El navegador NUNCA recibe `correcta` ni `explicacion` hasta que
//  responde; el servidor las envía una por una en el evento `feedback`.
// ===================================================================

const PREGUNTAS = [
  // ====================== DANIEL 1 (15) ======================
  {
    cap: 1,
    pregunta: '¿En qué año de reinado de Nabucodonosor sitió Jerusalén?',
    opciones: ['Primero', 'Tercero', 'Cuarto', 'Segundo'],
    correcta: 0,
    explicacion: 'En el año tercero del reinado de Joacim, rey de Judá, Nabucodonosor sitió Jerusalén (Daniel 1:1).',
    ref: 'Daniel 1:1'
  },
  {
    cap: 1,
    pregunta: '¿Quién entregó a Joacim rey de Judá en manos de Nabucodonosor?',
    opciones: ['Faraón', 'El rey de Asiria', 'Jehová', 'Los caldeos'],
    correcta: 2,
    explicacion: 'El Señor entregó a Joacim en sus manos, mostrando la soberanía divina aun en la derrota (Daniel 1:2).',
    ref: 'Daniel 1:2'
  },
  {
    cap: 1,
    pregunta: '¿Qué objetos sagrados llevó Nabucodonosor al templo de su dios?',
    opciones: [
      'Vasos de la casa de Dios',
      'Las tablas de la ley',
      'El candelero solo',
      'Las espadas de los sacerdotes'
    ],
    correcta: 0,
    explicacion: 'Llevó parte de los vasos de la casa de Dios y los puso en la casa del tesoro de su dios (Daniel 1:2).',
    ref: 'Daniel 1:2'
  },
  {
    cap: 1,
    pregunta: '¿Cómo se llamaba el jefe de los eunucos del rey?',
    opciones: ['Arioc', 'Aspenaz', 'Sadrac', 'Belsasar'],
    correcta: 1,
    explicacion: 'Aspenaz era el jefe de los eunucos; a él el rey le ordenó traer jóvenes de los hijos de Israel (Daniel 1:3).',
    ref: 'Daniel 1:3'
  },
  {
    cap: 1,
    pregunta: '¿Qué características debían tener los jóvenes seleccionados?',
    opciones: [
      'Sin defecto, de buen parecer, sabios y entendidos',
      'Los más ancianos y respetados',
      'Guerreros valientes',
      'Hijos de sacerdotes únicamente'
    ],
    correcta: 0,
    explicacion: 'Debían ser del linaje real, sin tacha, de buen parecer, entendidos en sabiduría, ciencia y capaces (Daniel 1:4).',
    ref: 'Daniel 1:4'
  },
  {
    cap: 1,
    pregunta: '¿Por cuántos años debían ser enseñados los jóvenes?',
    opciones: ['3 años', '5 años', '7 años', '1 año'],
    correcta: 0,
    explicacion: 'Debían ser enseñados durante tres años para luego servir delante del rey (Daniel 1:5).',
    ref: 'Daniel 1:5'
  },
  {
    cap: 1,
    pregunta: '¿Qué nombre babilónico recibió Ananías?',
    opciones: ['Sadrac', 'Mesac', 'Abed-nego', 'Beltsasar'],
    correcta: 0,
    explicacion: 'A Ananías le pusieron Sadrac; a Misael, Mesac; y a Azarías, Abed-nego (Daniel 1:7).',
    ref: 'Daniel 1:7'
  },
  {
    cap: 1,
    pregunta: '¿Qué nombre recibieron Misael y Azarías respectivamente?',
    opciones: [
      'Mesac y Abed-nego',
      'Sadrac y Beltsasar',
      'Abed-nego y Sadrac',
      'Beltsasar y Mesac'
    ],
    correcta: 0,
    explicacion: 'A Misael le pusieron Mesac, y a Azarías, Abed-nego. Cambiar los nombres significaba cambiar su identidad y su Dios (Daniel 1:7).',
    ref: 'Daniel 1:7'
  },
  {
    cap: 1,
    pregunta: '¿Qué se propuso Daniel en su corazón?',
    opciones: [
      'Volver pronto a Jerusalén',
      'No contaminarse con la comida ni el vino del rey',
      'Aprender la lengua de los caldeos',
      'Hacerse amigo del rey'
    ],
    correcta: 1,
    explicacion: 'Daniel se propuso en su corazón no contaminarse con la ración de la comida del rey ni con su vino (Daniel 1:8).',
    ref: 'Daniel 1:8'
  },
  {
    cap: 1,
    pregunta: '¿Cómo respondió Aspenaz cuando Daniel le pidió no contaminarse?',
    opciones: [
      'Le concedió todo de inmediato',
      'Tuvo miedo del rey, que les había ordenado comer eso',
      'Lo reportó al rey',
      'Lo encarceló'
    ],
    correcta: 1,
    explicacion: 'Aspenaz temió al rey, pues él había ordenado esa comida; si los jóvenes se veían mal, peligraba su propia vida (Daniel 1:10).',
    ref: 'Daniel 1:10'
  },
  {
    cap: 1,
    pregunta: '¿A quién pidió Daniel que los probara solo con esa dieta durante 10 días?',
    opciones: ['Al principal de los eunucos', 'A Melsar (el que cuidaba de ellos)', 'Al rey', 'A un médico caldeo'],
    correcta: 1,
    explicacion: 'Daniel habló con Melsar, a quien el jefe de los eunucos había puesto sobre ellos (Daniel 1:11).',
    ref: 'Daniel 1:11'
  },
  {
    cap: 1,
    pregunta: '¿Qué pidieron comer Daniel y sus amigos durante la prueba?',
    opciones: [
      'Pan y agua',
      'Legumbres y agua',
      'Frutas y leche',
      'Pescado y vino'
    ],
    correcta: 1,
    explicacion: 'Pidieron que les dieran a probar legumbres para comer y agua para beber durante diez días (Daniel 1:12).',
    ref: 'Daniel 1:12'
  },
  {
    cap: 1,
    pregunta: '¿Cómo quedaron Daniel y sus compañeros al cabo de los 10 días?',
    opciones: [
      'Más gordos y sanos que todos los demás',
      'Más flacos y pálidos',
      'Igual que los demás',
      'Enfermos'
    ],
    correcta: 0,
    explicacion: 'Al final de los diez días parecían mejores y más gordos que los jóvenes que comían la comida del rey (Daniel 1:15).',
    ref: 'Daniel 1:15'
  },
  {
    cap: 1,
    pregunta: '¿Qué dones especiales recibieron los cuatro jóvenes de parte de Dios?',
    opciones: [
      'Riquezas y honores',
      'Sabiduría, ciencia y entendimiento; además Daniel entendía visiones y sueños',
      'Fuerza física para guerrear',
      'El favor del rey únicamente'
    ],
    correcta: 1,
    explicacion: 'Dios les dio conocimiento y sabiduría en toda ciencia; y Daniel tuvo entendimiento en toda visión y sueños (Daniel 1:17).',
    ref: 'Daniel 1:17'
  },
  {
    cap: 1,
    pregunta: '¿Hasta cuándo continuó Daniel en el servicio del rey?',
    opciones: [
      'Hasta el año primero del rey Ciro',
      'Solo durante el reinado de Nabucodonosor',
      'Hasta la caída de Babilonia únicamente',
      'Hasta los 40 años'
    ],
    correcta: 0,
    explicacion: 'Continuó Daniel hasta el año primero del rey Ciro, es decir, todo el tiempo del exilio (Daniel 1:21).',
    ref: 'Daniel 1:21'
  },

  // ====================== DANIEL 2 (15) ======================
  {
    cap: 2,
    pregunta: '¿En qué año del reinado de Nabucodonosor tuvo sus sueños?',
    opciones: ['Segundo', 'Primero', 'Décimo', 'Quinto'],
    correcta: 0,
    explicacion: 'En el segundo año del reinado de Nabucodonosor, este tuvo sueños que alteraron su espíritu (Daniel 2:1).',
    ref: 'Daniel 2:1'
  },
  {
    cap: 2,
    pregunta: '¿A quién llamó el rey para que le explicara el sueño?',
    opciones: [
      'Magos, astrólogos, encantadores y caldeos',
      'A Daniel y sus amigos únicamente',
      'Solo a los soldados',
      'A los sacerdotes de Jerusalén'
    ],
    correcta: 0,
    explicacion: 'El rey mandó llamar a magos, astrólogos, encantadores y caldeos para que le declararan el sueño (Daniel 2:2).',
    ref: 'Daniel 2:2'
  },
  {
    cap: 2,
    pregunta: '¿Cuál fue la exigencia del rey que los sabios consideraron imposible?',
    opciones: [
      'Decir primero el sueño y luego su interpretación',
      'Construir una estatua de oro',
      'Adorar al rey como dios',
      'Traducir una escritura extraña'
    ],
    correcta: 0,
    explicacion: 'El rey exigió que le dijeran el sueño mismo y su interpretación; los sabios dijeron que era cosa imposible (Daniel 2:5-11).',
    ref: 'Daniel 2:5-11'
  },
  {
    cap: 2,
    pregunta: '¿Qué decreto emitió el rey al no poder los sabios revelar el sueño?',
    opciones: [
      'Que todos los sabios de Babilonia fueran muertos',
      'Que los echara de la corte',
      'Que los encarcelara de por vida',
      'Que los desterrara'
    ],
    correcta: 0,
    explicacion: 'El rey, airado, ordenó que fuesen destruidos todos los sabios de Babilonia (Daniel 2:12).',
    ref: 'Daniel 2:12'
  },
  {
    cap: 2,
    pregunta: '¿Cómo se llamaba el capitán de la guardia del rey que ejecutaba el decreto?',
    opciones: ['Arioc', 'Aspenaz', 'Belsasar', 'Darío'],
    correcta: 0,
    explicacion: 'Arioc, capitán de la guardia del rey, salió para matar a los sabios de Babilonia (Daniel 2:14).',
    ref: 'Daniel 2:14'
  },
  {
    cap: 2,
    pregunta: '¿Qué hizo Daniel al enterarse del decreto de muerte?',
    opciones: [
      'Pidió sabiduría y tiempo al rey para mostrar la interpretación',
      'Huyó de Babilonia',
      'Se escondió con sus amigos',
      'Se rindió sin luchar'
    ],
    correcta: 0,
    explicacion: 'Daniel habló con prudencia y sabiduría a Arioc y al rey, pidiendo tiempo para revelar la interpretación (Daniel 2:14-16).',
    ref: 'Daniel 2:14-16'
  },
  {
    cap: 2,
    pregunta: '¿Qué hizo Daniel junto con sus compañeros para conocer el misterio?',
    opciones: [
      'Pedir misericordia al Dios del cielo sobre este misterio',
      'Estudiar libros antiguos',
      'Consultar a otros magos',
      'Esperar una señal del rey'
    ],
    correcta: 0,
    explicacion: 'Daniel entró en su casa e hizo saber el asunto a sus amigos, para que pidieran misericordia del Dios del cielo (Daniel 2:17-18).',
    ref: 'Daniel 2:17-18'
  },
  {
    cap: 2,
    pregunta: '¿Cómo se le reveló a Daniel el misterio del rey?',
    opciones: [
      'En visión de noche',
      'Por medio de un ángel en el día',
      'A través del rey mismo',
      'En un pergamino antiguo'
    ],
    correcta: 0,
    explicacion: 'Entonces el misterio fue revelado a Daniel en visión de noche; Daniel bendijo al Dios del cielo (Daniel 2:19).',
    ref: 'Daniel 2:19'
  },
  {
    cap: 2,
    pregunta: 'En la estatua del sueño, ¿de qué metal era la cabeza?',
    opciones: ['Oro fino', 'Plata', 'Bronce', 'Hierro'],
    correcta: 0,
    explicacion: 'La estatua tenía la cabeza de oro fino, que representaba al rey Nabucodonosor y su reino (Daniel 2:32, 38).',
    ref: 'Daniel 2:32,38'
  },
  {
    cap: 2,
    pregunta: 'En la estatua, ¿de qué eran el pecho y los brazos?',
    opciones: ['Plata', 'Oro', 'Bronce', 'Hierro'],
    correcta: 0,
    explicacion: 'El pecho y los brazos de la estatua eran de plata, representando un reino inferior que seguiría (Daniel 2:32,39).',
    ref: 'Daniel 2:32,39'
  },
  {
    cap: 2,
    pregunta: 'En la estatua, ¿de qué eran el vientre y los muslos?',
    opciones: ['Bronce', 'Hierro', 'Plata', 'Barro'],
    correcta: 0,
    explicacion: 'El vientre y los muslos de bronce representaban un tercer reino que dominaría toda la tierra (Daniel 2:32,39).',
    ref: 'Daniel 2:32,39'
  },
  {
    cap: 2,
    pregunta: 'En la estatua, ¿de qué eran las piernas y los pies?',
    opciones: [
      'Piernas de hierro y pies en parte de hierro y en parte de barro cocido',
      'Piernas de oro y pies de barro',
      'Piernas de bronce y pies de plata',
      'Piernas de plata y pies de hierro'
    ],
    correcta: 0,
    explicacion: 'Las piernas de hierro y los pies en parte de hierro y en parte de barro: un cuarto reino fuerte y luego dividido (Daniel 2:33,40-43).',
    ref: 'Daniel 2:33,40-43'
  },
  {
    cap: 2,
    pregunta: '¿Qué le golpeó a la estatua y la desmenuzó por completo?',
    opciones: [
      'Una piedra cortada, no con mano, que golpeó los pies',
      'Un gran viento',
      'Un fuego del cielo',
      'Un ejército de ángeles'
    ],
    correcta: 0,
    explicacion: 'Una piedra fue cortada, no con mano, e hirió a la estatua en los pies y la desmenuzó toda (Daniel 2:34).',
    ref: 'Daniel 2:34'
  },
  {
    cap: 2,
    pregunta: 'Según Daniel, ¿qué representa la piedra (el reino que no será dejado a otro pueblo)?',
    opciones: [
      'El reino eterno de Dios, que permanecerá para siempre',
      'Un nuevo imperio humano más poderoso',
      'El retorno de Israel a su tierra',
      'Una nueva Babilonia'
    ],
    correcta: 0,
    explicacion: 'El Dios del cielo levantará un reino que no será jamás destruido y permanecerá para siempre (Daniel 2:44).',
    ref: 'Daniel 2:44'
  },
  {
    cap: 2,
    pregunta: '¿Cómo recompensó el rey a Daniel tras revelar e interpretar el sueño?',
    opciones: [
      'Lo hizo gobernador de Babilonia y jefe de los sabios; y promocionó a sus amigos',
      'Lo envió de vuelta a Judá',
      'Le dio oro y plata solamente',
      'No le dio nada'
    ],
    correcta: 0,
    explicacion: 'El rey engrandeció a Daniel, le dio muchos honores, lo hizo gobernador y jefe de los gobernadores; a petición suya, también a Sadrac, Mesac y Abed-nego (Daniel 2:48-49).',
    ref: 'Daniel 2:48-49'
  }
];

// Versión "pública" del banco: sin `correcta` ni `explicacion`.
// Es lo que el servidor envía al navegador para mostrar enunciados y opciones.
function preguntasPublicas() {
  return PREGUNTAS.map(p => ({
    cap: p.cap,
    pregunta: p.pregunta,
    opciones: p.opciones
  }));
}

module.exports = {
  PREGUNTAS,
  TOTAL_PREGUNTAS: PREGUNTAS.length,
  preguntasPublicas
};
