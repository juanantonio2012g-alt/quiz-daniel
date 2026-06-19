// ===================================================================
//  Banco de preguntas — fuente única de verdad
//  Quiz bíblico del libro de Daniel (capítulos 1-12)
//
//  Cada pregunta:
//    cap         → capítulo o sección
//    pregunta    → enunciado
//    opciones    → arreglo de 4 opciones
//    correcta    → índice (0-3) de la opción correcta
//    explicacion → texto que se muestra en la retroalimentación
//    ref         → referencia bíblica
//
//  El navegador NUNCA recibe `correcta` ni `explicacion` hasta que
//  responde; el servidor las envía una por una en el evento `feedback`.
// ===================================================================

const PREGUNTAS = [
  {
    cap: 1,
    pregunta: '¿Qué decidió Daniel al llegar a Babilonia?',
    opciones: ['No aprender el idioma de los caldeos', 'No servir al rey', 'No contaminarse con la comida del rey', 'No vivir en el palacio'],
    correcta: 2,
    explicacion: 'Daniel se propuso no contaminarse con la comida ni con el vino del rey.',
    ref: 'Daniel 1:8'
  },
  {
    cap: 1,
    pregunta: '¿Qué comieron Daniel y sus amigos durante diez días?',
    opciones: ['Carne y vino', 'Verduras y agua', 'Pan y leche', 'Frutas y miel'],
    correcta: 1,
    explicacion: 'Pidieron una prueba de diez días comiendo legumbres y bebiendo agua.',
    ref: 'Daniel 1:12'
  },
  {
    cap: 1,
    pregunta: '¿Cuál era el nombre babilónico de Daniel?',
    opciones: ['Sadrac', 'Mesac', 'Abed-nego', 'Beltsasar'],
    correcta: 3,
    explicacion: 'A Daniel le fue puesto el nombre Beltsasar.',
    ref: 'Daniel 1:7'
  },
  {
    cap: 1,
    pregunta: '¿Quiénes eran los tres amigos de Daniel?',
    opciones: ['Isaías, Jeremías y Ezequiel', 'Ananías, Misael y Azarías', 'Pedro, Juan y Santiago', 'Moisés, Aarón y Josué'],
    correcta: 1,
    explicacion: 'Los compañeros de Daniel eran Ananías, Misael y Azarías.',
    ref: 'Daniel 1:6'
  },
  {
    cap: 2,
    pregunta: '¿Qué exigió Nabucodonosor a los sabios de Babilonia?',
    opciones: ['Interpretar su sueño', 'Construir una estatua', 'Decirle el sueño e interpretarlo', 'Hacer sacrificios'],
    correcta: 2,
    explicacion: 'El rey exigió que los sabios dijeran el sueño y también su interpretación.',
    ref: 'Daniel 2:5-6'
  },
  {
    cap: 2,
    pregunta: '¿Quién reveló el sueño a Daniel?',
    opciones: ['Un sacerdote', 'Gabriel', 'Dios', 'El rey'],
    correcta: 2,
    explicacion: 'El misterio fue revelado a Daniel por Dios en visión de noche.',
    ref: 'Daniel 2:19'
  },
  {
    cap: 2,
    pregunta: '¿Qué representaba la cabeza de oro de la estatua?',
    opciones: ['Grecia', 'Roma', 'Babilonia', 'Medo-Persia'],
    correcta: 2,
    explicacion: 'La cabeza de oro representaba a Nabucodonosor y el reino de Babilonia.',
    ref: 'Daniel 2:37-38'
  },
  {
    cap: 2,
    pregunta: '¿Qué representaban el pecho y los brazos de plata?',
    opciones: ['Grecia', 'Roma', 'Medo-Persia', 'Egipto'],
    correcta: 2,
    explicacion: 'Después de Babilonia vendría otro reino, identificado tradicionalmente como Medo-Persia.',
    ref: 'Daniel 2:32,39'
  },
  {
    cap: 2,
    pregunta: '¿Qué representaban el vientre y los muslos de bronce?',
    opciones: ['Grecia', 'Roma', 'Babilonia', 'Medo-Persia'],
    correcta: 0,
    explicacion: 'El bronce representa el tercer reino, identificado tradicionalmente como Grecia.',
    ref: 'Daniel 2:32,39'
  },
  {
    cap: 2,
    pregunta: '¿Qué representaban las piernas de hierro?',
    opciones: ['Grecia', 'Egipto', 'Roma', 'Medo-Persia'],
    correcta: 2,
    explicacion: 'El hierro representa el cuarto reino fuerte, identificado tradicionalmente como Roma.',
    ref: 'Daniel 2:33,40'
  },
  {
    cap: 2,
    pregunta: '¿Qué representaban los pies de hierro y barro?',
    opciones: ['Un reino unido', 'Reinos divididos', 'Babilonia', 'El Reino de Dios'],
    correcta: 1,
    explicacion: 'Los pies mezclados de hierro y barro representan un reino dividido.',
    ref: 'Daniel 2:41-43'
  },
  {
    cap: 2,
    pregunta: '¿Qué representaba la piedra que destruyó la estatua?',
    opciones: ['Jerusalén', 'Israel', 'El Reino eterno de Dios', 'Babilonia'],
    correcta: 2,
    explicacion: 'La piedra representa el reino de Dios, que no será jamás destruido.',
    ref: 'Daniel 2:44-45'
  },
  {
    cap: 3,
    pregunta: '¿Por qué fueron lanzados al horno de fuego Sadrac, Mesac y Abed-nego?',
    opciones: ['Porque desobedecieron al rey', 'Porque no adoraron la estatua', 'Porque escaparon', 'Porque mintieron'],
    correcta: 1,
    explicacion: 'Fueron acusados porque no adoraron la estatua de oro levantada por Nabucodonosor.',
    ref: 'Daniel 3:12'
  },
  {
    cap: 3,
    pregunta: '¿Cuántas personas vio el rey caminando dentro del horno?',
    opciones: ['Tres', 'Cuatro', 'Cinco', 'Seis'],
    correcta: 1,
    explicacion: 'El rey vio cuatro varones sueltos caminando en medio del fuego.',
    ref: 'Daniel 3:24-25'
  },
  {
    cap: 4,
    pregunta: '¿Qué sueño tuvo Nabucodonosor en Daniel 4?',
    opciones: ['Un río', 'Un ejército', 'Un gran árbol', 'Un león'],
    correcta: 2,
    explicacion: 'Nabucodonosor soñó con un árbol grande que llegaba hasta el cielo.',
    ref: 'Daniel 4:10-12'
  },
  {
    cap: 4,
    pregunta: '¿Cuál fue el pecado principal de Nabucodonosor?',
    opciones: ['Mentira', 'Orgullo', 'Robo', 'Idolatría'],
    correcta: 1,
    explicacion: 'El rey fue humillado por su orgullo hasta reconocer que el Altísimo gobierna.',
    ref: 'Daniel 4:30-37'
  },
  {
    cap: 5,
    pregunta: '¿Quién era el rey cuando apareció la escritura en la pared?',
    opciones: ['Darío', 'Ciro', 'Nabucodonosor', 'Belsasar'],
    correcta: 3,
    explicacion: 'La escritura apareció durante el banquete del rey Belsasar.',
    ref: 'Daniel 5:1-5'
  },
  {
    cap: 5,
    pregunta: '¿Qué significaba la palabra “TEKEL”?',
    opciones: ['Dividido', 'Pesado y hallado falto', 'Contado', 'Bendecido'],
    correcta: 1,
    explicacion: 'TEKEL significa que el rey fue pesado en balanza y fue hallado falto.',
    ref: 'Daniel 5:27'
  },
  {
    cap: 6,
    pregunta: '¿Por qué fue Daniel lanzado al foso de los leones?',
    opciones: ['Porque se negó a obedecer a Dios', 'Porque oraba a Dios', 'Porque mintió', 'Porque robó'],
    correcta: 1,
    explicacion: 'Daniel siguió orando a Dios aunque el decreto del rey lo prohibía.',
    ref: 'Daniel 6:10-16'
  },
  {
    cap: 6,
    pregunta: '¿Qué hizo Dios por Daniel en el foso?',
    opciones: ['Lo sacó inmediatamente', 'Destruyó a los leones', 'Envió un ángel para cerrar la boca de los leones', 'Lo hizo invisible'],
    correcta: 2,
    explicacion: 'Dios envió su ángel y cerró la boca de los leones.',
    ref: 'Daniel 6:22'
  },
  {
    cap: 7,
    pregunta: 'En la visión de Daniel 7, las cuatro bestias representan:',
    opciones: ['Cuatro montañas', 'Cuatro profetas', 'Cuatro reinos', 'Cuatro ciudades'],
    correcta: 2,
    explicacion: 'Las cuatro grandes bestias representan cuatro reyes o reinos que se levantarían en la tierra.',
    ref: 'Daniel 7:17'
  },
  {
    cap: 8,
    pregunta: '¿Qué animal representaba al Imperio Medo-Persa en Daniel 8?',
    opciones: ['Un león', 'Un carnero', 'Un oso', 'Un águila'],
    correcta: 1,
    explicacion: 'El carnero con dos cuernos representa a los reyes de Media y de Persia.',
    ref: 'Daniel 8:20'
  },
  {
    cap: 8,
    pregunta: '¿Qué animal representaba al Imperio Griego?',
    opciones: ['Un carnero', 'Un león', 'Un macho cabrío', 'Un oso'],
    correcta: 2,
    explicacion: 'El macho cabrío representa al rey de Grecia.',
    ref: 'Daniel 8:21'
  },
  {
    cap: 8,
    pregunta: '¿Qué ángel explicó la visión a Daniel?',
    opciones: ['Miguel', 'Gabriel', 'Rafael', 'Uriel'],
    correcta: 1,
    explicacion: 'Gabriel recibió la orden de hacer entender la visión a Daniel.',
    ref: 'Daniel 8:16'
  },
  {
    cap: 9,
    pregunta: '¿Cuántas semanas fueron determinadas sobre el pueblo de Dios?',
    opciones: ['40', '12', '70', '100'],
    correcta: 2,
    explicacion: 'Setenta semanas fueron determinadas sobre el pueblo y la santa ciudad.',
    ref: 'Daniel 9:24'
  },
  {
    cap: 10,
    pregunta: '¿Cuántos días ayunó Daniel en el capítulo 10?',
    opciones: ['7', '10', '21', '40'],
    correcta: 2,
    explicacion: 'Daniel estuvo afligido durante tres semanas completas.',
    ref: 'Daniel 10:2-3'
  },
  {
    cap: 10,
    pregunta: '¿Quién vino a ayudar al ángel que hablaba con Daniel?',
    opciones: ['Gabriel', 'Elías', 'Miguel', 'Moisés'],
    correcta: 2,
    explicacion: 'Miguel, uno de los principales príncipes, vino para ayudar.',
    ref: 'Daniel 10:13'
  },
  {
    cap: 12,
    pregunta: '¿Quién es llamado “el gran príncipe que está de parte de tu pueblo”?',
    opciones: ['Gabriel', 'Miguel', 'Darío', 'Ciro'],
    correcta: 1,
    explicacion: 'Miguel es llamado el gran príncipe que está de parte del pueblo de Daniel.',
    ref: 'Daniel 12:1'
  },
  {
    cap: 12,
    pregunta: '¿Qué se le ordenó a Daniel hacer con las palabras de la profecía?',
    opciones: ['Destruirlas', 'Publicarlas', 'Sellarlas hasta el tiempo del fin', 'Escribirlas en piedra'],
    correcta: 2,
    explicacion: 'Daniel recibió la orden de cerrar las palabras y sellar el libro hasta el tiempo del fin.',
    ref: 'Daniel 12:4'
  },
  {
    cap: '1-12',
    pregunta: '¿Cuál es el mensaje principal del libro de Daniel?',
    opciones: ['La historia de Babilonia', 'La sabiduría humana', 'Dios gobierna sobre los reinos de la tierra y establecerá su reino eterno', 'La grandeza de los reyes'],
    correcta: 2,
    explicacion: 'El libro de Daniel muestra la soberanía de Dios sobre los reinos humanos y la esperanza de su reino eterno.',
    ref: 'Daniel 2:44; 7:14'
  },
  {
    cap: 3,
    pregunta: '¿Qué respondió Sadrac, Mesac y Abed-nego cuando el rey les ordenó adorar la estatua de oro?',
    opciones: ['Que obedecerían al rey', 'Que consultarían primero a Daniel', 'Que su Dios podía librarlos, pero aunque no lo hiciera, no adorarían la estatua', 'Que escaparían de Babilonia'],
    correcta: 2,
    explicacion: 'Ellos afirmaron que Dios podía librarlos, pero que aunque no lo hiciera, no servirían a los dioses del rey.',
    ref: 'Daniel 3:16-18'
  },
  {
    cap: 6,
    pregunta: '¿Qué decreto emitió el rey Darío después de que Daniel fue librado del foso de los leones?',
    opciones: ['Que nadie volviera a orar', 'Que todos adoraran la estatua de oro', 'Que todos temieran y reverenciaran al Dios de Daniel', 'Que Daniel fuera nombrado rey'],
    correcta: 2,
    explicacion: 'Darío decretó que en todo su dominio se temiera y reverenciara al Dios de Daniel.',
    ref: 'Daniel 6:25-27'
  },
  {
    cap: 7,
    pregunta: 'En la profecía de Daniel, ¿a cuánto equivale la expresión “un tiempo, tiempos y la mitad de un tiempo”?',
    opciones: ['1,260 días proféticos', '490 días proféticos', '2,300 días proféticos', '70 semanas'],
    correcta: 0,
    explicacion: 'La expresión se asocia con el periodo profético de 1,260 días.',
    ref: 'Daniel 7:25; 12:7'
  },
  {
    cap: 7,
    pregunta: 'Según la profecía de Daniel, ¿qué significa la expresión “un tiempo, tiempos y la mitad de un tiempo”?',
    opciones: ['Un año y medio', 'Tres años y medio', 'Siete años', 'Mil doscientos sesenta años literales'],
    correcta: 1,
    explicacion: 'Un tiempo, tiempos y la mitad de un tiempo equivale a tres tiempos y medio, tradicionalmente entendido como tres años y medio.',
    ref: 'Daniel 7:25; 12:7'
  }
];

// Versión "pública" del banco: sin `correcta` ni `explicacion`.
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
