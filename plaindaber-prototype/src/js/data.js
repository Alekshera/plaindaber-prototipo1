/* ============================================================
   PLAINDABER - BASE DE DATOS SIMULADA (FUENTE ÚNICA DE VERDAD)
   Todas las páginas leen y modifican este mismo objeto global.
   Reemplazable por API real en el futuro (ver js/api.js).
   ============================================================ */

window.DATA = {
    /* --- USUARIO ACTUAL (único en toda la app) --- */
    usuarioActual: {
        id: 1,
        nombre: 'Malcolm García',
        email: 'malcolm.garcia@plaindaber.com',
        rol: 'ESTUDIANTE', // Cambia a 'INSTRUCTOR' o 'ADMINISTRADOR' para probar roles
        avatar: 'MG'
    },

    /* --- CATÁLOGO DE CURSOS --- */
    cursos: [
        {
            id: 101,
            titulo: 'Huertas Orgánicas en la Ciudad',
            instructor: 'María Fernández',
            areaSaber: 'Ecología',
            duracionHoras: 15,
            numModulos: 6,
            descripcion: 'Cultiva tus propios alimentos en espacios urbanos reducidos.'
        }
        // Los demás cursos del catálogo migran aquí desde cursos.js en la próxima iteración
    ],

    /* --- MÓDULOS DEL CURSO (organizados por ID de curso) ---
        Actividades vinculadas al Router de Actividades de modulo.js.
        Tipos disponibles (10): CUESTIONARIO, RELACIONAR, ORDENAR,
        EXPLORACION_API, COMPLETAR (implementados) y los de la v2.0. */
    modulos: {
        101: [
            {
                id: 1,
                numeroOrden: 1,
                titulo: 'Introducción a la Agricultura Urbana',
                tipo: 'induccion',
                estado: 'COMPLETADO',
                evaluacion: null,
                contenidos: [
                    {
                        id: 102,
                        tipo: 'LECTURA',
                        titulo: 'Lectura: Conceptos básicos',
                        cuerpo: '<p>La agricultura urbana comprende el cultivo de alimentos dentro de las ciudades, aprovechando terrazas, balcones y espacios comunitarios.</p><p><strong>Referencia:</strong> FAO - Agricultura urbana y periurbana.</p>'
                    },
                    {
                        id: 103,
                        tipo: 'CUESTIONARIO',
                        titulo: 'Cuestionario: ¿qué aprendiste?',
                        descripcion: 'Responde las preguntas para afianzar los conceptos del módulo.',
                        configuracion: {
                            puntajeMaximo: 100,
                            preguntas: [
                                {
                                    pregunta: '¿Qué se entiende por agricultura urbana?',
                                    opciones: ['Cultivar alimentos dentro de la ciudad', 'Solo cultivos en el campo', 'Criar animales en el campo', 'Importar alimentos'],
                                    correcta: 0
                                },
                                {
                                    pregunta: '¿Qué espacio es típico para una huerta urbana?',
                                    opciones: ['Terrazas y balcones', 'Desiertos', 'Minas', 'Zonas industriales'],
                                    correcta: 0
                                },
                                {
                                    pregunta: 'La agricultura urbana favorece…',
                                    opciones: ['La seguridad alimentaria', 'El transporte masivo', 'Los empaques plásticos', 'El monocultivo'],
                                    correcta: 0
                                }
                            ]
                        }
                    }
                ]
            },
            {
                id: 2,
                numeroOrden: 2,
                titulo: 'Preparación del Suelo y Sustratos',
                tipo: 'actividad_interactiva',
                estado: 'DISPONIBLE',
                evaluacion: null,
                contenidos: [
                    {
                        id: 202,
                        tipo: 'RELACIONAR',
                        titulo: 'Relaciona los componentes del sustrato',
                        descripcion: 'Une cada componente con su función principal dentro del sustrato.',
                        configuracion: {
                            puntajeMaximo: 100,
                            columnas: [
                                { nombre: 'Cáscara de arroz', correcta: 'Aireación' },
                                { nombre: 'Composta', correcta: 'Nutrientes' },
                                { nombre: 'Arena', correcta: 'Drenaje' },
                                { nombre: 'Fibra de coco', correcta: 'Retención de humedad' }
                            ]
                        }
                    },
                    {
                        id: 203,
                        tipo: 'EXPLORACION_API',
                        titulo: 'Explora el clima de tu cultivo',
                        descripcion: 'Consulta el clima actual de tu zona para decidir cuándo regar tu sustrato.',
                        configuracion: {
                            metodo: 'GET',
                            url: 'https://api.open-meteo.com/v1/forecast',
                            parametros: {
                                latitude: 4.711,
                                longitude: -74.072,
                                current_weather: true
                            }
                        }
                    },
                    {
                        id: 204,
                        tipo: 'COMPLETAR',
                        titulo: 'Completa el resumen del módulo',
                        descripcion: 'Llena los espacios en blanco con las palabras correctas.',
                        configuracion: {
                            puntajeMaximo: 100,
                            texto: 'Para preparar un sustrato equilibrado utilizo ___ de los materiales: ___ para retener agua, ___ para nutrir, ___ para airear y ___ para drenar.',
                            palabrasCorrectas: ['Turba', 'Fibra de coco', 'Composta', 'Perlita', 'Arena'],
                            pistas: ['Retiene humedad', 'Aporta materia orgánica', 'Airea el sustrato', 'Mejora el drenaje']
                        }
                    }
                ]
            },
            {
                id: 3,
                numeroOrden: 3,
                titulo: 'Siembra y Trasplante',
                tipo: 'mixto',
                estado: 'DISPONIBLE',
                evaluacion: null,
                contenidos: [
                    {
                        id: 301,
                        tipo: 'LECTURA',
                        titulo: 'Lectura: Técnicas de siembra',
                        cuerpo: '<p>Siembra directa y en semillero: profundidad, densidad y momento del año.</p><p>El trasplante se realiza cuando la plántula tiene 2 o 3 pares de hojas verdaderas.</p>'
                    },
                    {
                        id: 302,
                        tipo: 'ORDENAR',
                        titulo: 'Ordena los pasos de la siembra',
                        descripcion: 'Ordena los pasos del 1 al 4 según la técnica correcta de siembra.',
                        configuracion: {
                            puntajeMaximo: 100,
                            pasos: [
                                { texto: 'Preparar el sustrato con buen drenaje', correcto: 1 },
                                { texto: 'Llenar los semilleros o contenedores', correcto: 2 },
                                { texto: 'Sembrar las semillas a la profundidad recomendada', correcto: 3 },
                                { texto: 'Regar suavemente y mantener humedad', correcto: 4 }
                            ]
                        }
                    },
                    {
                        id: 303,
                        tipo: 'CUESTIONARIO',
                        titulo: 'Cuestionario: siembra y trasplante',
                        descripcion: 'Responde para validar tus conocimientos del módulo.',
                        configuracion: {
                            puntajeMaximo: 100,
                            preguntas: [
                                {
                                    pregunta: '¿Cuándo conviene trasplantar una plántula?',
                                    opciones: ['Con 2 o 3 pares de hojas verdaderas', 'Antes de que germine', 'Cuando florece', 'Solo en verano'],
                                    correcta: 0
                                },
                                {
                                    pregunta: '¿Qué es la siembra directa?',
                                    opciones: ['Sembrar en el lugar definitivo', 'Sembrar en bandejas', 'Trasplantar a la tierra', 'Sembrar en agua'],
                                    correcta: 0
                                }
                            ]
                        }
                    }
                ]
            },
            {
                id: 4,
                numeroOrden: 4,
                titulo: 'Riego y Nutrición',
                tipo: 'mixto',
                estado: 'DISPONIBLE',
                evaluacion: { puntajeMinimo: 70, numPreguntas: 5, tipo: 'Quiz' },
                contenidos: [
                    {
                        id: 402,
                        tipo: 'LECTURA',
                        titulo: 'Lectura: Nutrición vegetal',
                        cuerpo: '<p>Macronutrientes (N-P-K) y su rol en el desarrollo de la plata para una cosecha sana.</p>'
                    }
                ]
            },
            {
                id: 5,
                numeroOrden: 5,
                titulo: 'Control de Plagas Ecológico',
                tipo: 'mixto',
                estado: 'BLOQUEADO',
                evaluacion: null,
                contenidos: []
            },
            {
                id: 6,
                numeroOrden: 6,
                titulo: 'Cosecha y Postcosecha',
                tipo: 'proyecto_practico',
                estado: 'BLOQUEADO',
                evaluacion: { puntajeMinimo: 70, numPreguntas: 8, tipo: 'Evaluación final' },
                contenidos: [
                    {
                        id: 601,
                        tipo: 'PROYECTO_PRACTICO',
                        titulo: 'Proyecto práctico: Diseña tu plan de cosecha',
                        descripcion: 'Crea un plan de cosecha y postcosecha para tu huerta urbana. Sube tu documento (PDF o imagen).',
                        estado: 'pendiente',
                        recursos: ['Plantilla del plan', 'Guía de postcosecha']
                    }
                ]
            }
        ]
    },

    /* --- PROGRESO DEL ESTUDIANTE (por curso) --- */
    progreso: {
        '101': {
            modulosCompletados: [1],
            moduloActual: 2,
            notas: { '1': null, '2': null, '3': null, '4': null, '5': null, '6': null },
            progresoGlobal: Math.round((1 / 6) * 100)
        }
    },

    /* --- FORO (hilos y mensajes) --- */
    foro: {
        hilos: []
    },

    /* --- VIDEOS Y PARTICIPANTES (simulación) --- */
    videollamada: {
        sala: { id: 'sala-huertas-1', participantes: [] }
    }
};