/* ============================================================
   PLAINDABER - Detalle de curso "Huertas Orgánicas en la Ciudad"
   Lógica completa: datos mock, renderizado, navegación, progreso.
   ============================================================ */

/* ---------- DATOS MOCK (reemplazables por API) ---------- */
window.DATA = {
    curso: {
        id: 101,
        titulo: 'Huertas Orgánicas en la Ciudad',
        instructor: 'María Fernández',
        duracion: '15h',
        numModulos: 6
    },
    modulos: [
        {
            id: 1,
            titulo: 'Introducción a la Agricultura Urbana',
            tipo: 'induccion',
            estado: 'completado',
            evaluacion: null,
            contenido: [
                { tipo: 'video', titulo: 'Video: ¿Qué es la agricultura urbana?', url: 'https://www.youtube.com/embed/krwF2PlGkLk' },
                { tipo: 'lectura', titulo: 'Lectura: Conceptos básicos', cuerpo: '<p>La agricultura urbana comprende el cultivo de alimentos dentro de las ciudades, aprovechando terrazas, balcones y espacios comunitarios.</p><p><strong>Referencia:</strong> FAO - Agricultura urbana y periurbana.</p>' }
            ]
        },
        {
            id: 2,
            titulo: 'Preparación del Suelo y Sustratos',
            tipo: 'actividad_interactiva',
            estado: 'disponible',
            evaluacion: null,
            contenido: [
                { tipo: 'video', titulo: 'Video: Preparación de sustratos', url: 'https://www.youtube.com/embed/mVxSg1l8UlM' },
                { tipo: 'actividad_interactiva', titulo: 'Actividad interactiva: Arrastrar capas del sustrato' }
            ]
        },
        {
            id: 3,
            titulo: 'Siembra y Trasplante',
            tipo: 'mixto',
            estado: 'bloqueado',
            evaluacion: null,
            contenido: [
                { tipo: 'lectura', titulo: 'Lectura: Técnicas de siembra', contenido: '<p>Siembra directa y en semillero: profundidad, densidad y momento del año.</p>' },
                { tipo: 'video', titulo: 'Video: Sembrando en contenedores', url: 'https://www.youtube.com/embed/D15qH3pBmp8' }
            ]
        },
        {
            id: 4,
            titulo: 'Riego y Nutrición',
            tipo: 'quiz',
            estado: 'bloqueado',
            evaluacion: { puntajeMinimo: 70, numPreguntas: 5, tipo: 'Quiz' },
            contenido: [
                { tipo: 'video', titulo: 'Video: Sistema de riego por goteo', url: 'https://www.youtube.com/embed/shk5iSgKeus' },
                { tipo: 'lectura', titulo: 'Lectura: Nutrición vegetal', contenido: '<p>Macronutrientes (N-P-K) y su rol en el desarrollo de la planta.</p>' },
                { tipo: 'quiz', titulo: 'Quiz de Riego y Nutrición', numPreguntas: 5 }
            ]
        },
        {
            id: 5,
            titulo: 'Control de Plagas Ecológico',
            tipo: 'simulacion_ia',
            estado: 'bloqueado',
            evaluacion: null,
            contenido: [
                { tipo: 'video', titulo: 'Video: Manejo integrado de plagas', url: 'https://www.youtube.com/embed/mdgDch6UTCg' },
                { tipo: 'simulacion_ia', titulo: 'Simulación IA: Genera un caso de plaga' }
            ]
        },
        {
            id: 6,
            titulo: 'Cosecha y Postcosecha',
            tipo: 'proyecto_practico',
            estado: 'bloqueado',
            evaluacion: { minPuntaje: 70, numPreguntas: 10, tipo: 'Evaluación final' },
            contenido: [
                { tipo: 'video', titulo: 'Video: Cosecha y manejo postcosecha', url: 'https://www.youtube.com/embed/j6aucWeyG-o' },
                { tipo: 'proyecto_practico', titulo: 'Proyecto práctico: Diseña tu plan de cosecha' }
            ]
        }
    ]
};

// Estado del estudiante
window.ESTADO_ESTUDIANTE = {
    modulosCompletados: [1],   // ids completados
    moduloActual: 2,           // id del módulo actual / seleccionado
    progresoGlobal: 16
};

/* ---------- VARIABLES DE CONTROL ---------- */
const MODULO_ACTIVO_KEY = 'moduloGlobalActivo';

/* Códigos de estado por módulo */
const ESTADO = {
    BLOQUEADO: 'bloqueado',
    DISPONIBLE: 'disponible',
    COMPLETADO: 'completado'
};

/* Libretas de texto para estados */
const ESTADO_LABEL = {
    bloqueado: 'Bloqueado',
    disponible: 'Disponible',
    completado: 'Completado'
};

/* ---------- Utilidades ---------- */
function getModulos() {
    return window.DATA.modulos;
}

function getCurso() {
    return window.DATA.curso;
}

function getModuloActualId() {
    // Persistimos la selección del usuario
    const activo = localStorage.getItem(MODULO_ACTIVO_KEY);
    if (activo && getModulos().some(m => m.id === Number(activo))) return Number(activo);
    return window.ESTADO_ESTUDIANTE.moduloActual || getModulos()[0].id;
}

function setModuloActualId(id) {
    window.ESTADO_ESTUDIANTE.moduloActual = id;
    localStorage.setItem(MODULO_ACTIVO_KEY, String(id));
}

// Calcular progreso global: completados / total
function calcularProgresoGlobal() {
    const total = getModulos().length;
    const completados = getModulos().filter(m => m.estado === ESTADO.COMPLETADO).length;
    return Math.round((completados / total) * 100);
}

/* Icono y color según estado */
function estadoVisual(estado) {
    switch (estado) {
        case ESTADO.COMPLETADO: return { icono: '✓', class: 'completado' };
        case ESTADO.DISPONIBLE: return { icono: '▶', class: 'disponible' };
        default:                 return { icono: '🔒', class: 'bloqueado' };
    }
}

/* ---------- Renderizado: lista de módulos ---------- */
function renderListaModulos() {
    const container = document.getElementById('moduleList');
    const activo = getModuloActualId();

    container.innerHTML = getModulos().map(modulo => {
        const vis = estadoVisual(modulo.estado);
        const esActivo = modulo.id === activo;
        const bloq = modulo.estado === ESTADO.BLOQUEADO;

        return `
            <div class="module-item ${modulo.estado} ${esActivo ? 'selected' : ''}"
                 data-id="${modulo.id}"
                 onclick="seleccionarModulo(${modulo.id})"
                 role="button"
                 tabindex="${bloq ? '-1' : '0'}"
                 aria-label="Módulo ${modulo.id}: ${modulo.titulo} (${ESTADO_LABEL[modulo.estado]})">
                <span class="module-icon ${vis.class}">${vis.icono}</span>
                <div>
                    <div class="module-title">Módulo ${modulo.id} · ${modulo.titulo}</div>
                    <div class="module-subtitle">${ESTADO_LABEL[modulo.estado]}</div>
                </div>
            </div>`;
    }).join('');
}

/* ---------- Selección de módulo (acordeón) ---------- */
function seleccionarModulo(id) {
    const modulo = getModulos().find(m => m.id === id);
    if (!modulo) return;

    // No se puede abrir un módulo bloqueado
    if (modulo.estado === ESTADO.BLOQUEADO) {
        alert('Este módulo está bloqueado. Completa el módulo anterior para desbloquearlo.');
        return;
    }

    setModuloActualId(id);
    renderListaModulos();
    renderContenido(modulo);
}

/* ---------- Renderizado: contenido del módulo seleccionado ---------- */
function renderContenido(modulo) {
    const panel = document.getElementById('contentPanel');

    // Construir bloques de contenido diferenciados
    const bloquesHtml = modulo.contenido.map(renderBloque).join('');

    const completado = modulo.estado === ESTADO.COMPLETADO;
    const puedeCompletar = modulo.estado === ESTADO.DISPONIBLE;

    const botonCompletar = puedeCompletar
        ? `<button class="btn btn-primary" id="btnCompletar" onclick="completarModulo(${modulo.id})"
               aria-label="Marcar el módulo como completado">✔ Marcar como completado</button>`
        : '';

    // Navegación anterior/siguiente respetando bloqueos
    const navPrevio = tieneAnterior() ? `<button class="btn btn-nav" onclick="navegar(-1)">← Anterior</button>` : '';
    const navSiguiente = tieneSiguiente() ? `<button class="btn btn-nav" onclick="navegar(1)">Siguiente →</button>` : '';

    panel.innerHTML = `
        <div class="content-card">
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 class="section-title text-xl mb-0">Módulo ${modulo.id}: ${modulo.titulo}</h2>
                <span class="badge badge-${modulo.estado}">${ESTADO_LABEL[modulo.estado]}</span>
            </div>

            ${bloquesHtml || '<p class="text-gray-500">Sin contenido.</p>'}

            <div id="feedback" class="hidden mb-4"></div>

            <div class="flex items-center gap-3 flex-wrap mt-4">
                ${botonCompletar}
            </div>

            <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                ${navPrevio}
                <span class="text-xs text-gray-400">Responderá el módulo ${modulo.id} / ${getModulos().length}</span>
                ${navSiguiente}
            </div>
        </div>`;
}

/* Helper: botón "Anterior / Siguiente" reutilizable */
function tieneAnterior() {
    return indiceActual() > 0;
}

function tieneSiguiente() {
    const idx = indiceActual();
    const sig = getModulos()[idx + 1];
    return !!sig && sig.estado !== ESTADO.BLOQUEADO;
}

function indiceActual() {
    return getModulos().findIndex(m => m.id === getModuloActualId());
}

/* ---------- Renderizar cada tipo de contenido ---------- */
function renderBloque(bloque) {
    switch (bloque.tipo) {
        case 'video':
            return `
                <div class="content-block">
                    <h4>🎬 ${bloque.titulo}</h4>
                    <div class="aspect-video w-full">
                        <iframe class="w-full h-full rounded-lg" src="${bloque.url}"
                            title="${bloque.titulo}"
                            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen></iframe>
                    </div>
                </div>`;

        case 'lectura':
            return `
                <div class="content-block">
                    <h4>📖 ${bloque.titulo}</h4>
                    <div class="prose text-gray-700 text-sm leading-relaxed">${bloque.contenido}</div>
                </div>`;

        case 'actividad_interactiva':
            return `
                <div class="content-block">
                    <h4>🧩 ${bloque.titulo}</h4>
                    <p class="text-sm text-gray-600 mb-3">Arrastra cada capa a su posición correcta según el orden del sustrato.</p>
                    <button class="btn btn-primary" onclick="iniciarActividad()">Iniciar actividad</button>
                </div>`;

        case 'simulacion_ia':
            return `
                <div class="content-block">
                    <h4>🤖 ${bloque.titulo}</h4>
                    <p class="text-sm text-gray-600 mb-3">La IA generará un caso simulado de plaga para que lo diagnostiques.</p>
                    <button class="btn btn-primary" onclick="generarCasoIA()">Generar caso</button>
                </div>`;

        case 'proyecto_practico':
            return `
                <div class="content-block">
                    <h4>🛠 ${bloque.titulo}</h4>
                    <p class="text-sm text-gray-600 mb-3">Diseña tu plan de cosecha y postcosecha y entrégalo para su revisión.</p>
                    <button class="btn btn-primary" onclick="entregarProyecto()">Entregar proyecto</button>
                </div>`;

        case 'quiz':
            return `
                <div class="content-block">
                    <h4>📝 ${bloque.titulo}</h4>
                    <p class="text-sm text-gray-600 mb-3">Completa el módulo para validar tu nota. Requiere un mínimo del 70%.</p>
                </div>`;

        default:
            return '';
    }
}

/* ---------- Acciones de contenido (simuladas) ---------- */
function iniciarActividad() {
    alert('Actividad interactiva iniciada. ¡Completa el arma el sustrato para avanzar!');
}

function generarCasoIA() {
    const casos = [
        'Plaga: pulgón verde en hojas de lechuga. Sujeto: aplicar jabón potasio.',
        'Plaga: mosca blanca en plantas de tomate. Sujeto: trampas cromáticas amarillas.',
        'Plaga: caracoles nocturnos. Controles: barreras de cobre y humedad controlada.'
    ];
    alert('🤖 Caso generado:\n' + casos[Math.floor(Math.random() * casos.length)]);
}

function entregarProyecto() {
    alert('🛠 Proyecto entregado. Será revisado por la instructora 🌽 María Fernández.');
}

/* ---------- Navegación Anterior / Siguiente ---------- */
function navegar(direccion) {
    const idx = indiceActual();
    const modulos = getModulos();
    let nuevoIdx = idx + direccion;

    if (nuevoIdx < 0 || nuevoIdx >= modulos.length) return;

    // No navegar a un módulo bloqueado
    if (modulos[nuevoIdx].estado === ESTADO.BLOQUEADO) {
        alert('Ese módulo está bloqueado. Completa el anterior para desbloquearlo.');
        return;
    }

    setModuloActualId(modulos[nuevoIdx].id);
    renderListaModulos();
    renderContenido(modulos[nuevoIdx]);
}

/* ---------- Completar módulo ---------- */
function completarModulo(id) {
    const modulo = getModulos().find(m => m.id === id);
    if (!modulo || modulo.estado !== ESTADO.DISPONIBLE) return;

    const feedback = document.getElementById('feedback');
    let mensaje = '';

    // Simular validación de evaluación si el módulo tiene una
    if (modulo.evaluacion) {
        const nota = randomNota(60, 100);
        const min = modulo.evaluacion.minPuntaje || modulo.evaluacion.puntajeMinimo || 70;

        if (nota < min) {
            mensaje = `Tu nota fue ${nota}/100 en ${modulo.evaluacion.tipo}. Necesitas al menos ${min}. Inténtalo de nuevo.`;
            mostrarFeedback(false, mensaje);
            return;
        }

        mensaje = `${modulo.evaluacion.tipo} superada con una nota de ${nota}/100. ¡Bien!`;
    } else {
        mensaje = 'Módulo completado correctamente.';
    }

    // Actualizar datos
    modulo.estado = ESTADO.COMPLETADO;
    window.ESTADO_ESTUDIANTE.modulosCompletados.push(id);

    // Desbloquear el siguiente módulo si lo hay
    const idx = getModulos().findIndex(m => m.id === id);
    const siguiente = getModulos()[idx + 1];
    if (siguiente && siguiente.estado === ESTADO.BLOQUEADO) {
        siguiente.estado = ESTADO.DISPONIBLE;
    }

    // Actualizar interfaz
    actualizarProgresoGlobal();
    renderListaModulos();
    renderContenido(modulo); // re-render con el botón de completar oculto

    // Re-mostrar el feedback (el re-render vuelve a crear el contenedor vacío)
    if (mensaje) mostrarFeedback(true, mensaje);
}

/* Nota aleatoria entre mínimo y máximo */
function randomNota(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Feedback de error / éxito */
function mostrarFeedback(exito, mensaje) {
    const fb = document.getElementById('feedback');
    fb.textContent = mensaje;
    fb.classList.remove('hidden');
    fb.classList.remove('error', 'success');
    fb.classList.add(exito ? 'success' : 'error');
}

/* ---------- Actualizar progreso global ---------- */
function actualizarProgresoGlobal() {
    const barra = document.getElementById('globalProgressBar');
    const etiqueta = document.getElementById('globalProgressLabel');
    if (!barra && !etiqueta) return; // la barra global fue eliminada de la interfaz
    const pct = calcularProgresoGlobal();
    if (barra) barra.style.width = pct + '%';
    if (etiqueta) etiqueta.textContent = pct + '%';
}

/* ---------- Vista de portada/inicio ---------- */
function renderPortada() {
    const panel = document.getElementById('contentPanel');
    panel.innerHTML = `
        <div class="content-card text-center py-16">
            <div class="text-7xl mb-4">🌱</div>
            <h2 class="text-2xl font-bold text-[#1A3B5C] mb-2">Bienvenido al curso</h2>
            <p class="text-gray-600 max-w-md mx-auto mb-6">Selecciona un módulo disponible de la lista para comenzar tu aprendizaje.</p>
            <button class="btn btn-primary" onclick="seleccionarPrimerDisponible()">Ir al módulo actual</button>
        </div>`;
}

function seleccionarPrimerDisponible() {
    const modulos = getModulos();
    const actual = getModuloActualId();
    // Seleccionar módulo actual; si está bloqueado, el primer disponible
    const objetivo = modulos.find(m => m.id === actual && m.estado !== ESTADO.BLOQUEADO)
        || modulos.find(m => m.estado !== ESTADO.BLOQUEADO);
    if (objetivo) seleccionarModulo(objetivo.id);
}

/* ---------- Inicio ---------- */
document.addEventListener('DOMContentLoaded', () => {
    actualizarProgresoGlobal();
    renderListaModulos();

    // Preseleccionar el módulo actual (el que esté disponible/completado)
    const actual = getModuloActualId();
    const moduloActual = getModulos().find(m => m.id === actual);
    if (moduloActual && moduloActual.estado !== ESTADO.BLOQUEADO) {
        seleccionarModulo(actual);
    } else {
        renderPortada();
    }
});

// Logout global
window.logout = function () {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        window.location.href = './login.html';
    }
};

/* Exponer funciones usadas por los onclick inline (scope de módulo) */
window.seleccionarModulo = seleccionarModulo;
window.completarModulo = completarModulo;
window.navegar = navegar;
window.iniciarActividad = iniciarActividad;
window.generarCasoIA = generarCasoIA;
window.entregarProyecto = entregarProyecto;
window.seleccionarPrimerDisponible = seleccionarPrimerDisponible;