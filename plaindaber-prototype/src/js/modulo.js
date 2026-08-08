/* ============================================================
   PLAINDABER - Página de detalle de módulo (modulo.js)
   Consume la base de datos simulada (js/data.js) a través de la
   capa api.js. El contenido se renderiza mediante un "Router de
   Actividades" que despacha cada tipo a su renderizador.
   ============================================================ */

import { api } from './api.js';

/* ---------- CONSTANTES ---------- */
const CURSO_ID = 101;

/* ---------- VARIABLES DE ESTADO ---------- */
const PROGRESO_KEY = 'plaindaber_modulo_progreso';
const MODULO_ACTIVO_KEY = 'moduloGlobalActivo';

// Estado del estudiante en esta página (se sincroniza con window.DATA + localStorage)
let estadoEstudiante = {
    modulosCompletados: [],
    contenidosVistos: {},      // { idContenido: true }
    puntajes: {},              // { idContenido: nota }
    proyectoEntregado: {}      // { idModulo: true }
};

/* ---------- Utilidades ---------- */
function getModulos() {
    return (window.DATA && window.DATA.modulos[CURSO_ID]) || [];
}

function getCurso() {
    return (window.DATA && window.DATA.cursos.find(c => c.id === CURSO_ID)) || {};
}

function getModuloPorId(id) {
    return getModulos().find(m => m.id === Number(id));
}

function getModuloActivoId() {
    const raw = new URLSearchParams(window.location.search).get('id');
    const id = Number(raw);
    return isNaN(id) ? getPrimerDisponible().id : id;
}

function getPrimerDisponible() {
    return getModulos().find(m => m.estado !== 'BLOQUEADO') || getModulos()[0];
}

// Progreso global del curso (persistido)
function leerProgresoGlobal() {
    const guardado = localStorage.getItem(PROGRESO_KEY);
    if (guardado) {
        try {
            return JSON.parse(guardado);
        } catch (e) {
            // datos corruptos: reiniciar
        }
    }
    return { completados: [] };
}

function guardarProgresoGlobal() {
    localStorage.setItem(PROGRESO_KEY, JSON.stringify({ completados: estadoEstudiante.modulosCompletados }));
}

function calcularProgresoGlobal() {
    const total = getModulos().length;
    const completados = estadoEstudiante.modulosCompletados.length;
    return Math.round((completados / total) * 100);
}

/* Sincroniza los datos mock con el progreso persistido */
function sincronizarEstados() {
    const progreso = leerProgresoGlobal();
    estadoEstudiante.modulosCompletados = progreso.completados || [];

    getModulos().forEach(modulo => {
        if (estadoEstudiante.modulosCompletados.includes(modulo.id)) {
            modulo.estado = 'COMPLETADO';
        }
    });

    // Sincronizar la selección global de curso_huerta.js si existe
    const activoGlobal = localStorage.getItem(MODULO_ACTIVO_KEY);
    const ids = getModulos().map(m => m.id);
    if (activoGlobal && ids.includes(Number(activoGlobal))) {
        window.DATA._activoSugerido = Number(activoGlobal);
    }
}

/* ---------- Carga del módulo ---------- */
function cargarModulo(id) {
    const modulo = getModuloPorId(id);
    if (!modulo) return;

    document.getElementById('bannerCurso').textContent = getCurso().titulo;
    document.getElementById('bannerProgresoGlobal').textContent = `Progreso del curso: ${calcularProgresoGlobal()}%`;

    // Si el módulo está bloqueado, redirigir al primer disponible
    if (modulo.estado === 'BLOQUEADO') {
        const disponible = getPrimerDisponible();
        if (disponible && disponible.id !== modulo.id) {
            window.location.search = `id=${disponible.id}`;
            return;
        }
    }

    renderizarCabecera(modulo);
    renderizarContenidos(modulo);
    renderizarNav(modulo);
}

/* ---------- Cabecera del módulo ---------- */
function renderizarCabecera(modulo) {
    const pct = modulo.estado === 'COMPLETADO' ? 100 : calcularProgresoContenidos(modulo);

    const estadoClass = `estado-${modulo.estado}`;
    const estadoLabel = { COMPLETADO: 'Completado', DISPONIBLE: 'Disponible', BLOQUEADO: 'Bloqueado' }[modulo.estado];

    document.getElementById('cabeceraModulo').innerHTML = `
        <div class="modulo-cabecera">
            <span class="modulo-badge">Módulo ${modulo.id} · ${getCurso().instructor}</span>
            <h2>${modulo.titulo}</h2>
            <p class="modulo-desc">${descripcionModulo(modulo)}</p>

            <div class="modulo-progreso">
                <div class="modulo-progreso-info">
                    <span>Progreso del módulo</span>
                    <span>${pct}%</span>
                </div>
                <div class="barra-fondo">
                    <div class="barra-relleno" id="barraModulo" style="width: ${pct}%"></div>
                </div>
            </div>

            <div class="mt-3">
                <span class="estado-pill ${estadoClass}">${estadoLabel}</span>
            </div>
        </div>`;
}

function descripcionModulo(modulo) {
    const descripciones = {
        'Introducción a la Agricultura Urbana': 'Conoce los fundamentos de cultivar alimentos en la ciudad.',
        'Preparación del Suelo y Sustratos': 'Aprende a preparar sustratos equilibrados para tus cultivos urbanos.',
        'Siembra y Trasplante': 'Técnicas de siembra directa, en semillero y trasplante.',
        'Riego y Nutrición': 'Sistemas de riego eficientes y nutrición vegetal.',
        'Control de Plagas Ecológico': 'Manejo integrado de plagas sin químicos.',
        'Cosecha y Postcosecha': 'Cosecha en el punto óptimo y conservación de alimentos.'
    };
    return descripciones[modulo.titulo] || 'Contenido del módulo.';
}

function calcularProgresoContenidos(modulo) {
    if (!modulo.contenidos.length) return 0;
    const vistos = modulo.contenidos.filter(c => estadoEstudiante.contenidosVistos[c.id]).length;
    return Math.round((vistos / modulo.contenidos.length) * 100);
}

/* ---------- Renderizado de contenidos ---------- */
function renderizarContenidos(modulo) {
    const contenedor = document.getElementById('contenidosModulo');
    contenedor.innerHTML = modulo.contenidos.map(b => renderizarBloque(b, modulo.id)).join('') || '<p class="text-gray-500">Sin contenido.</p>';
}

function renderizarBloque(bloque, moduloId) {
    switch (bloque.tipo) {
        case 'LECTURA': return renderizarLectura(bloque);
        case 'PROYECTO_PRACTICO': return renderizarProyecto(bloque, moduloId);
        default: return renderizarActividad(bloque);
    }
}

/* ============================================================
   ROUTER DE ACTIVIDADES
   Despacha cada tipo de actividad a su renderizador específico.
   Tipos totales: 10. Implementados en el MVP: 5. El resto se
   muestra como "próximamente" y la lógica queda lista para la
   v2.0 sin romper el flujo.
   ============================================================ */
function renderizarActividad(contenido) {
    switch (contenido.tipo) {
        case 'CUESTIONARIO':
            return renderizarCuestionario(contenido);
        case 'RELACIONAR':
            return renderizarRelacionar(contenido);
        case 'ORDENAR':
            return renderizarOrdenar(contenido);
        case 'EXPLORACION_API':
            return renderizarExploracionApi(contenido);
        case 'COMPLETAR':
            return renderizarCompletar(contenido);

        // ---------- Tipos de la v2.0 (próximamente) ----------
        case 'MEMORIA':
            return '<div class="bloque-contenido"><div class="bloque-titulo"><span class="bloque-encabezado">Memoria</span>' + contenido.titulo + '</div><p class="text-yellow-500">🧠 Juego de memoria (Próximamente en la v2.0)</p></div>';
        case 'SIMULACION_IA':
            return '<div class="bloque-contenido"><div class="bloque-titulo"><span class="bloque-encabezado">Simulación IA</span>' + contenido.titulo + '</div><p class="text-blue-500">🌱 Simulación con IA (Próximamente en la v2.0)</p></div>';
        case 'ARRASTRAR':
            return '<div class="bloque-contenido"><div class="bloque-titulo"><span class="bloque-encabezado">Arrastrar</span>' + contenido.titulo + '</div><p class="text-yellow-500">🧩 Arrastrar y soltar (Próximamente en la v2.0)</p></div>';
        case 'LABORATORIO':
            return '<div class="bloque-contenido"><div class="bloque-titulo"><span class="bloque-encabezado">Laboratorio</span>' + contenido.titulo + '</div><p class="text-yellow-500">🧪 Laboratorio virtual (Próximamente en la v2.0)</p></div>';
        case 'ESTUDIO_CASO':
            return '<div class="bloque-contenido"><div class="bloque-titulo"><span class="bloque-encabezado">Estudio de caso</span>' + contenido.titulo + '</div><p class="text-yellow-500">📂 Estudio de caso (Próximamente en la v2.0)</p></div>';

        default:
            return '<div class="bloque-contenido"><p class="text-gray-500">Tipo de actividad no reconocido.</p></div>';
    }
}

/* ---------- Finalización común de una actividad ----------
   Actualiza puntajeObtenido y estado, e informa a la capa api. */
function finalizarActividad(contenido, puntaje, puntajeMaximo, exito) {
    contenido.puntajeObtenido = puntaje;
    contenido.estado = exito ? 'completada' : 'intento';
    estadoEstudiante.puntajes[contenido.id] = puntaje;
    if (exito) {
        estadoEstudiante.contenidosVistos[contenido.id] = true;
        api.registrarResultadoActividad(CURSO_ID, getModuloContenedorId(contenido.id), contenido.id, { puntaje, exito });
    }
    actualizarCabecera();
}

function getModuloContenedorId(idContenido) {
    const modulo = getModulos().find(m => m.contenidos.some(c => c.id === Number(idContenido)));
    return modulo ? modulo.id : null;
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/* ---------- Encabezado estándar de una actividad ---------- */
function bloqueActividad(contenido, color, label, cuerpo) {
    return `
        <div class="bloque-contenido bloque-${contenido.tipo}">
            <div class="bloque-titulo">
                <span class="bloque-encabezado">${label}</span>
                ${contenido.titulo}
            </div>
            ${contenido.descripcion ? `<p class="text-sm text-gray-600 mb-4">${contenido.descripcion}</p>` : ''}
            ${cuerpo}
        </div>`;
}

/* ============================================================
   ACTIVIDAD: CUESTIONARIO
   ============================================================ */
function renderizarCuestionario(contenido) {
    const cfg = contenido.configuracion || {};
    const preguntas = cfg.preguntas || [];
    const terminada = contenido.estado === 'completada' || estadoEstudiante.puntajes[contenido.id] !== undefined;

    const cuerpo = terminada
        ? `<div class="feedback-alerta feedback-alerta-succ">Cuestionario completado: ${estadoEstudiante.puntajes[contenido.id]}/${cfg.puntajeMaximo} puntos.</div>`
        : `
        <div class="space-y-4" id="cuestionario-${contenido.id}">
            ${preguntas.map((p, i) => `
                <div class="eval-pregunta">
                    <p class="eval-enunciado">${i + 1}. ${p.pregunta}</p>
                    ${p.opciones.map((op, j) => `
                        <label class="eval-opcion">
                            <input type="radio" name="cuestionario-${contenido.id}-p${i}" value="${j}" class="accent-[#822375]" />
                            <span>${op}</span>
                        </label>`).join('')}
                </div>`).join('')}
        </div>
        <div class="actividad-feedback" id="feedbackCuestionario-${contenido.id}"></div>
        <button class="btn btn-primary mt-3" onclick="evaluarCuestionario(${contenido.id})">Calificar cuestionario</button>`;

    return bloqueActividad(contenido, 'CUESTIONARIO', 'Cuestionario', cuerpo);
}

window.evaluarCuestionario = function (idContenido) {
    const contenido = buscarContenido(idContenido);
    if (!contenido) return;
    const cfg = contenido.configuracion || {};
    const preguntas = cfg.preguntas || [];

    let aciertos = 0;
    preguntas.forEach((p, i) => {
        const seleccionada = document.querySelector(`input[name="cuestionario-${idContenido}-p${i}"]:checked`);
        if (seleccionada && Number(seleccionada.value) === p.correcta) aciertos++;
    });

    const puntaje = Math.round((aciertos / preguntas.length) * (cfg.puntajeMaximo || 100));
    const fb = document.getElementById(`feedbackCuestionario-${idContenido}`);
    const exito = aciertos === preguntas.length;

    if (!fb) return;
    fb.innerHTML = exito
        ? `<div class="feedback-alerta feedback-alerta-succ">¡Excelente! ${puntaje}/${cfg.puntajeMaximo} puntos.</div>`
        : `<div class="feedback-alerta feedback-alerta-error">Obtuviste ${puntaje}/${cfg.puntajeMaximo}. Aciertos: ${aciertos}/${preguntas.length}. Revisa tus respuestas.</div>`;

    finalizarActividad(contenido, puntaje, cfg.puntajeMaximo || 100, exito);
};

/* ============================================================
   ACTIVIDAD: RELACIONAR (arrastrar y soltar)
   ============================================================ */
function renderizarRelacionar(contenido) {
    const cfg = contenido.configuracion || {};
    const columnas = cfg.columnas || [];
    const desordenadas = [...columnas].reverse();
    const terminada = contenido.estado === 'completada' || estadoEstudiante.puntajes[contenido.id] !== undefined;
    const puntaje = estadoEstudiante.puntajes[contenido.id];

    const cuerpo = terminada
        ? `<div class="feedback-alerta feedback-alerta-succ">Actividad completada con ${puntaje}/${cfg.puntajeMaximo} puntos.</div>`
        : `
        <div class="actividad-arrastre" id="arrastre-${contenido.id}">
            <div class="arastre-columna">
                <h5>Componentes</h5>
                <div id="origen-${contenido.id}">
                    ${desordenadas.map(col =>
                        `<div class="pieza-drag" draggable="true" data-nombre="${col.nombre}"
                              ondragstart="iniciarArrastreGlobal(event)">${col.nombre}</div>`).join('')}
                </div>
            </div>
            <div class="arastre-columna">
                <h5>Función en el sustrato</h5>
                <div id="destino-${contenido.id}">
                    ${columnas.map(col =>
                        `<div class="zona-drop" data-contenedor="${col.correcta}" id="zona-${contenido.id}-${col.correcta.replace(/\s/g, '')}"
                              ondragover="permitirSoltar(event)" ondrop="soltarPieza(event, ${contenido.id})"
                              ondragenter="activarZona(event)" ondragleave="desactivarZona(event)">
                              <span class="text-gray-500">${col.correcta}</span>
                            </div>`).join('')}
                </div>
            </div>
        </div>
        <div class="actividad-feedback" id="feedbackRelacionar-${contenido.id}"></div>
        <button class="btn btn-primary mt-3" onclick="evaluarRelacionar(${contenido.id})">Calificar actividad</button>`;

    return bloqueActividad(contenido, 'RELACIONAR', 'Relacionar', cuerpo);
}

let piezaEnMovimiento = null;

window.iniciarArrastreGlobal = function (e) {
    piezaEnMovimiento = e.target;
    e.target.classList.add('arrastrando');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.nombre);
};

window.permitirSoltar = function (e) {
    e.preventDefault();
};

window.activarZona = function (e) {
    e.preventDefault();
    e.target.classList.add('activa');
};

window.desactivarZona = function (e) {
    e.target.classList.remove('activa');
};

window.soltarPieza = function (e, idContenido) {
    e.preventDefault();
    e.target.classList.remove('activa');

    const zona = e.target.closest('.zona-drop');
    if (!zona) return;

    const contenido = buscarContenido(idContenido);
    if (!contenido) return;

    const nombre = piezaEnMovimiento ? piezaEnMovimiento.dataset.nombre : e.dataTransfer.getData('text/plain');
    if (!nombre) return;

    const pieza = piezaEnMovimiento;
    if (pieza) {
        pieza.classList.remove('arrastrando');
        pieza.classList.add('ubicada');
    }

    const cfg = contenido.configuracion || {};
    const columna = (cfg.columnas || []).find(c => c.nombre === nombre);
    const correcta = columna && columna.correcta === zona.dataset.contenedor;

    zona.classList.add(correcta ? 'correcta' : 'incorrecta');
    zona.textContent = `${nombre} → ${zona.dataset.contenedor} ${correcta ? '✓' : '✗'}`;
    zona.dataset.pieza = nombre;
    zona.dataset.ok = correcta ? '1' : '0';

    piezaEnMovimiento = null;
};

window.evaluarRelacionar = function (idContenido) {
    const contenido = buscarContenido(idContenido);
    if (!contenido) return;
    const cfg = contenido.configuracion || {};
    const columnas = cfg.columnas || [];
    const zonas = document.querySelectorAll(`#destino-${idContenido} .zona-drop`);
    const fb = document.getElementById(`feedbackRelacionar-${idContenido}`);
    if (!fb) return;

    const cubiertas = Array.from(zonas).filter(z => z.dataset.pieza).length;
    if (cubiertas < columnas.length) {
        fb.innerHTML = `<div class="feedback-alerta feedback-alerta-error">Coloca todas las piezas antes de calificar (${cubiertas}/${columnas.length}).</div>`;
        return;
    }

    const aciertos = Array.from(zonas).filter(z => z.dataset.ok === '1').length;
    const puntaje = Math.round((aciertos / columnas.length) * (cfg.puntajeMaximo || 100));
    const exito = aciertos === columnas.length;

    fb.innerHTML = exito
        ? `<div class="feedback-alerta feedback-alerta-succ">¡Excelente! ${puntaje}/${cfg.puntajeMaximo} puntos.</div>`
        : `<div class="feedback-alerta feedback-alerta-error">Obtuviste ${puntaje}/${cfg.puntajeMaximo}. Revisa las piezas marcadas en rojo.</div>`;

    finalizarActividad(contenido, puntaje, cfg.puntajeMaximo || 100, exito);
};

/* ============================================================
   ACTIVIDAD: ORDENAR (secuencia de pasos)
   ============================================================ */
function renderizarOrdenar(contenido) {
    const cfg = contenido.configuracion || {};
    const pasos = cfg.pasos || [];
    const desordenados = [...pasos].sort(() => Math.random() - 0.5);
    const terminada = contenido.estado === 'completada' || estadoEstudiante.puntajes[contenido.id] !== undefined;
    const puntaje = estadoEstudiante.puntajes[contenido.id];

    const cuerpo = terminada
        ? `<div class="feedback-alerta feedback-alerta-succ">Actividad completada con ${puntaje}/${cfg.puntajeMaximo} puntos.</div>`
        : `
        <ol class="space-y-2" id="ordenar-${contenido.id}">
            ${desordenados.map((paso, i) => `
                <li class="pieza-drag" data-correcto="${paso.correcto}" data-orden="${i}" id="paso-${contenido.id}-${i}">
                    <span class="ordenar-numero">${i + 1}</span>
                    ${paso.texto}
                    <span class="ml-auto flex gap-1">
                        <button class="btn-nav-modulo" onclick="moverOrdenar(${contenido.id}, ${i}, -1)">↑</button>
                        <button class="btn-nav-modulo" onclick="moverOrdenar(${contenido.id}, ${i}, 1)">↓</button>
                    </span>
                </li>`).join('')}
        </ol>
        <div class="actividad-feedback" id="feedbackOrdenar-${contenido.id}"></div>
        <button class="btn btn-primary mt-3" onclick="evaluarOrdenar(${contenido.id})">Calificar orden</button>`;

    return bloqueActividad(contenido, 'ORDENAR', 'Ordenar', cuerpo);
}

window.moverOrdenar = function (idContenido, indice, direccion) {
    const lista = document.getElementById(`ordenar-${idContenido}`);
    if (!lista) return;
    const items = Array.from(lista.children);
    const objetivo = indice + direccion;
    if (objetivo < 0 || objetivo >= items.length) return;

    lista.insertBefore(items[indice], direccion > 0 ? items[objetivo].nextSibling : items[objetivo]);
    actualizarNumerosOrdenar(lista);
};

function actualizarNumerosOrdenar(lista) {
    Array.from(lista.children).forEach((li, i) => {
        li.dataset.orden = i;
        const numero = li.querySelector('.ordenar-numero');
        if (numero) numero.textContent = i + 1;
    });
}

window.evaluarOrdenar = function (idContenido) {
    const contenido = buscarContenido(idContenido);
    if (!contenido) return;
    const cfg = contenido.configuracion || {};
    const pasos = cfg.pasos || [];
    const lista = document.getElementById(`ordenar-${idContenido}`);
    const fb = document.getElementById(`feedbackOrdenar-${idContenido}`);
    if (!lista || !fb) return;

    const posiciones = Array.from(lista.children).map(li => Number(li.dataset.correcto));
    const aciertos = pasos.filter((paso, i) => paso.correcto === posiciones[i]).length;
    const puntaje = Math.round((aciertos / pasos.length) * (cfg.puntajeMaximo || 100));
    const exito = aciertos === pasos.length;

    fb.innerHTML = exito
        ? `<div class="feedback-alerta feedback-alerta-succ">¡Orden correcto! ${puntaje}/${cfg.puntajeMaximo} puntos.</div>`
        : `<div class="feedback-alerta feedback-alerta-error">Obtuviste ${puntaje}/${cfg.puntajeMaximo}. Aciertos en posición: ${aciertos}/${pasos.length}.</div>`;

    finalizarActividad(contenido, puntaje, cfg.puntajeMaximo || 100, exito);
};

/* ============================================================
   ACTIVIDAD: COMPLETAR (espacios en blanco)
   ============================================================ */
function renderizarCompletar(contenido) {
    const cfg = contenido.configuracion || {};
    const partes = (cfg.texto || '').split('___');
    const terminada = contenido.estado === 'completada' || estadoEstudiante.puntajes[contenido.id] !== undefined;
    const puntaje = estadoEstudiante.puntajes[contenido.id];

    const cuerpo = terminada
        ? `<div class="feedback-alerta feedback-alerta-succ">Actividad completada con ${puntaje}/${cfg.puntajeMaximo} puntos.</div>`
        : `
        <p class="bloque-lectura-cuerpo">
            ${partes.map((parte, i) => {
                if (i < partes.length - 1) {
                    return parte + `<input type="text" class="completar-input" data-indice="${i}"
                                placeholder="palabra ${i + 1}"
                                aria-label="Palabra ${i + 1}" />`;
                }
                return parte;
            }).join('')}
        </p>
        <div class="actividad-feedback" id="feedbackCompletar-${contenido.id}"></div>
        <button class="btn btn-primary mt-3" onclick="evaluarCompletar(${contenido.id})">Calificar</button>`;

    return bloqueActividad(contenido, 'COMPLETAR', 'Completar', cuerpo);
}

window.evaluarCompletar = function (idContenido) {
    const contenido = buscarContenido(idContenido);
    if (!contenido) return;
    const cfg = contenido.configuracion || {};
    const palabras = cfg.palabrasCorrectas || [];
    const inputs = document.querySelectorAll(`input[data-indice]`);
    const fb = document.getElementById(`feedbackCompletar-${idContenido}`);
    if (!fb) return;

    const sinLlenar = Array.from(inputs).some(input => !(input.value || '').trim());
    if (sinLlenar) {
        fb.innerHTML = '<div class="feedback-alerta feedback-alerta-error">Completa todos los espacios en blanco.</div>';
        return;
    }

    const aciertos = Array.from(inputs).reduce((acc, input, i) => {
        const coincide = palabras[i] && (input.value || '').trim().toLowerCase() === String(palabras[i]).toLowerCase();
        input.classList.toggle('correcta', !!coincide);
        input.classList.toggle('incorrecta', !coincide);
        return acc + (coincide ? 1 : 0);
    }, 0);

    const puntaje = Math.round((aciertos / palabras.length) * (cfg.puntajeMaximo || 100));
    const exito = aciertos === palabras.length;

    fb.innerHTML = exito
        ? `<div class="feedback-alerta feedback-alerta-succ">¡Correcto! ${puntaje}/${cfg.puntajeMaximo} puntos.</div>`
        : `<div class="feedback-alerta feedback-alerta-error">Obtuviste ${puntaje}/${cfg.puntajeMaximo}. Aciertos: ${aciertos}/${palabras.length}.</div>`;

    finalizarActividad(contenido, puntaje, cfg.puntajeMaximo || 100, exito);
};

/* ============================================================
   ACTIVIDAD: EXPLORACIÓN API (API abierta real)
   ============================================================ */
function renderizarExploracionApi(contenido) {
    const cfg = contenido.configuracion || {};
    return bloqueActividad(contenido, 'EXPLORACION_API', 'Exploración API', `
        <div class="flex items-center gap-3 flex-wrap mb-3">
            <span class="text-xs font-bold bg-gray-100 rounded px-2 py-1">${cfg.metodo} ${cfg.url}</span>
            <span class="text-xs text-gray-400">Lat: ${cfg.parametros.latitude}, Lon: ${cfg.parametros.longitude}</span>
        </div>
        <button class="btn btn-primary" onclick="consultarApi(${contenido.id})" id="btnApi-${contenido.id}">Consultar clima ahora</button>
        <div class="api-resultado hidden" id="apiResultado-${contenido.id}"></div>`);
}

window.consultarApi = async function (idContenido) {
    const contenido = buscarContenido(idContenido);
    if (!contenido) return;
    const cfg = contenido.configuracion || {};

    const boton = document.getElementById(`btnApi-${idContenido}`);
    const resultado = document.getElementById(`apiResultado-${idContenido}`);
    if (!boton || !resultado) return;

    boton.disabled = true;
    boton.textContent = 'Consultando…';
    resultado.classList.remove('hidden');
    resultado.textContent = 'Cargando datos del clima…';

    try {
        const params = new URLSearchParams();
        Object.entries(cfg.parametros || {}).forEach(([k, v]) => {
            if (typeof v === 'object') {
                Object.entries(v).forEach(([k2, v2]) => params.set(k2, String(v2)));
            } else {
                params.set(k, String(v));
            }
        });

        const respuesta = await fetch(`${cfg.url}?${params.toString()}`);
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const datos = await respuesta.json();
        const clima = datos.current_weather || {};

        resultado.textContent = JSON.stringify({
            temperatura: `${clima.temperature}°C`,
            viento: `${clima.windspeed} km/h`,
            direccionViento: `${clima.winddirection}°`,
            codigoClima: clima.weathercode,
            hora: clima.time
        }, null, 2);

        estadoEstudiante.contenidosVistos[idContenido] = true;
        actualizarCabecera();
    } catch (err) {
        resultado.textContent = `Error consultando la API: ${err.message}. Verifica tu conexión.`;
    } finally {
        boton.disabled = false;
        boton.textContent = 'Consultar de nuevo';
    }
};

/* ============================================================
   LECTURA y PROYECTO (contenidos no-actividad)
   ============================================================ */
window.marcarContenidoVisto = function (idContenido) {
    estadoEstudiante.contenidosVistos[idContenido] = true;
    const boton = document.querySelector(`button[onclick="marcarContenidoVisto(${idContenido})"]`);
    if (boton) { boton.disabled = true; boton.textContent = '✓ Leído'; }
    actualizarCabecera();
};

function renderizarLectura(bloque) {
    const visto = estadoEstudiante.contenidosVistos[bloque.id];
    return `
        <div class="bloque-contenido bloque-LECTURA">
            <div class="bloque-titulo">
                <span class="bloque-encabezado">Lectura</span>
                ${bloque.titulo}
            </div>
            <div class="bloque-lectura-cuerpo">${bloque.cuerpo}</div>
            <div class="flex items-center gap-3">
                <button class="btn btn-primary" onclick="marcarContenidoVisto(${bloque.id})" ${visto ? 'disabled' : ''}>
                    ${visto ? '✓ Leído' : 'Marcar como leído'}</button>
                <span class="text-xs text-gray-400">${visto ? 'Completado' : 'Pendiente'}</span>
            </div>
        </div>`;
}

function renderizarProyecto(bloque, moduloId) {
    const entregado = estadoEstudiante.proyectoEntregado[moduloId] || false;
    const estado = entregado ? 'ENTREGADO' : 'PENDIENTE';

    return `
        <div class="bloque-contenido bloque-PROYECTO_PRACTICO">
            <div class="bloque-titulo">
                <span class="bloque-encabezado">Proyecto</span>
                ${bloque.titulo}
            </div>
            <p class="text-sm text-gray-600 mb-3">${bloque.descripcion}</p>

            <div class="mb-3">
                <span class="proyecto-estado proyecto-${estado.toLowerCase()}">
                    ${estado === 'ENTREGADO' ? '✓ Entregado' : '⏳ Pendiente de entrega'}
                </span>
            </div>

            ${entregado
                ? `<div class="feedback-alerta feedback-alerta-succ">Tu proyecto fue entregado y está en revisión por la instructora.</div>`
                : `
            <label class="file-drop">
                <strong>Arrastra aquí tu archivo</strong> o haz clic para seleccionar (PDF, imagen)
                <input type="file" id="archivoProyecto-${moduloId}" accept=".pdf,.png,.jpg,.jpeg" onchange="subirProyecto(${moduloId})" />
            </label>
            <div id="proyectoEstado-${moduloId}"></div>
            `}
        </div>`;
}

window.subirProyecto = function (moduloId) {
    const input = document.getElementById(`archivoProyecto-${moduloId}`);
    if (!input.files.length) return;

    estadoEstudiante.proyectoEntregado[moduloId] = true;
    const estado = document.getElementById(`proyectoEstado-${moduloId}`);
    if (estado) {
        estado.innerHTML = `<div class="feedback-alerta feedback-alerta-succ mt-3">📎 "${input.files[0].name}" subido correctamente. El proyecto quedará en revisión.</div>`;
    }

    const modulo = getModuloPorId(moduloId);
    if (modulo) {
        setTimeout(() => renderizarContenidos(modulo), 600);
        estadoEstudiante.contenidosVistos[`proyecto-${moduloId}`] = true;
        actualizarCabecera();
    }
};

/* ============================================================
   Navegación Anterior / Siguiente
   ============================================================ */
function renderizarNav(modulo) {
    const idx = getModulos().findIndex(m => m.id === modulo.id);
    const anterior = idx > 0 ? getModulos()[idx - 1] : null;
    const siguiente = idx < getModulos().length - 1 ? getModulos()[idx + 1] : null;

    const navPrev = anterior && anterior.estado !== 'BLOQUEADO'
        ? `<button class="btn-nav-modulo" onclick="navegarModulo(${anterior.id})">← ${anterior.titulo}</button>`
        : `<button class="btn-nav-modulo" disabled>← Anterior</button>`;

    const navNext = siguiente && siguiente.estado !== 'BLOQUEADO'
        ? `<button class="btn-nav-modulo" onclick="navegarModulo(${siguiente.id})">${siguiente.titulo} →</button>`
        : `<button class="btn-nav-modulo" disabled>Siguiente →</button>`;

    const puedeCompletar = modulo.estado === 'DISPONIBLE';
    const botonCompletar = puedeCompletar
        ? `<button class="btn btn-primary" onclick="completarModulo(${modulo.id})">✔ Marcar módulo como completado</button>`
        : (modulo.estado === 'COMPLETADO' ? `<span class="text-green-600 font-semibold">✓ Módulo completado</span>` : '');

    document.getElementById('navAcciones').innerHTML = `
        <div class="modulo-nav">
            ${navPrev}
            ${botonCompletar}
            ${navNext}
        </div>
        <div id="feedbackCompletar"></div>`;
}

window.navegarModulo = function (id) {
    window.location.href = `modulo.html?id=${id}`;
};

/* ============================================================
   Completar módulo (con validación de evaluación)
   ============================================================ */
window.completarModulo = function (id) {
    const modulo = getModuloPorId(id);
    if (!modulo || modulo.estado !== 'DISPONIBLE') return;

    const feedback = document.getElementById('feedbackCompletar');

    if (modulo.evaluacion) {
        abrirEvaluacion(modulo);
        return;
    }

    const contenidosConRequerimiento = modulo.contenidos.length;
    const vistos = modulo.contenidos.filter(c => estadoEstudiante.contenidosVistos[c.id]).length;
    if (vistos < contenidosConRequerimiento) {
        feedback.innerHTML = `<div class="feedback-alerta feedback-alerta-error">Debes completar todos los contenidos del módulo antes de marcarlo como completado (${vistos}/${contenidosConRequerimiento}).</div>`;
        return;
    }

    marcarModuloCompletado(modulo);
};

function marcarModuloCompletado(modulo) {
    modulo.estado = 'COMPLETADO';
    if (!estadoEstudiante.modulosCompletados.includes(modulo.id)) {
        estadoEstudiante.modulosCompletados.push(modulo.id);
    }
    guardarProgresoGlobal();

    // Actualizar la base de datos simulada (window.DATA)
    const progreso = window.DATA.progreso[String(CURSO_ID)] || { modulosCompletados: [], notas: {} };
    progreso.modulosCompletados = estadoEstudiante.modulosCompletados;
    progreso.progresoGlobal = calcularProgresoGlobal();
    api.actualizarProgreso(CURSO_ID, progreso);

    const idx = getModulos().findIndex(m => m.id === modulo.id);
    const siguiente = getModulos()[idx + 1];
    if (siguiente && siguiente.estado === 'BLOQUEADO') {
        siguiente.estado = 'DISPONIBLE';
    }

    const fb = document.getElementById('feedbackCompletar');
    fb.innerHTML = `<div class="feedback-alerta feedback-alerta-succ">¡Felicidades! Módulo "${modulo.titulo}" completado. Progreso del curso: ${calcularProgresoGlobal()}%.</div>`;

    actualizarCabecera();
    renderizarNav(modulo);
    actualizarProgresoBanner();
}

/* ============================================================
   Evaluación del módulo (modal)
   ============================================================ */
let preguntasRecientes = [];

function abrirEvaluacion(modulo) {
    const modal = document.getElementById('modalEvaluacion');
    const contenedorPreguntas = document.getElementById('evalPreguntas');
    const resultado = document.getElementById('evalResultado');

    document.getElementById('evalTitulo').textContent = `Evaluación: ${modulo.titulo}`;
    resultado.textContent = '';

    const preguntas = generarPreguntas(modulo.evaluacion.numPreguntas);
    preguntasRecientes = preguntas;

    contenedorPreguntas.innerHTML = preguntas.map((p, i) => `
        <div class="eval-pregunta" data-pregunta="${i}">
            <p class="eval-enunciado">${i + 1}. ${p.enunciado}</p>
            ${p.opciones.map((op, j) => `
                <label class="eval-opcion">
                    <input type="radio" name="pregunta-${i}" value="${j}" class="accent-[#822375]" />
                    <span>${op}</span>
                </label>`).join('')}
        </div>`).join('');

    modal.dataset.modulo = modulo.id;
    modal.dataset.respondidas = '0';
    modal.classList.remove('hidden');
}

function generarPreguntas(num) {
    const banco = [
        { enunciado: '¿Cuál es la función de la arena en un sustrato?', opciones: ['Aportar nutrientes', 'Mejorar el drenaje', 'Retener agua', 'Dar color'], correcta: 1 },
        { enunciado: '¿Qué componente retiene humedad en el sustrato?', opciones: ['Arena', 'Grava', 'Fibra de coco', 'Cal'], correcta: 2 },
        { enunciado: 'El compostaje aporta principalmente…', opciones: ['Materia orgánica y nutrientes', 'Aireación', 'Solo color', 'Nada'], correcta: 0 },
        { enunciado: '¿Cuándo se recomienda trasplantar una plántula?', opciones: ['Con 2-3 pares de hojas verdaderas', 'Apenas germina', 'Nunca', 'Cuando florece'], correcta: 0 },
        { enunciado: 'El riego por goteo es eficiente porque…', opciones: ['Ahorra agua', 'Inunda todo', 'No sirve', 'Es decorativo'], correcta: 0 },
        { enunciado: '¿Qué nutriente es clave para el follaje?', opciones: ['Fósforo', 'Potasio', 'Nitrógeno', 'Calcio'], correcta: 2 },
        { enunciado: 'Las trampas cromáticas amarillas sirven contra…', opciones: ['Mosca blanca', 'Caracoles', 'Hormigas', 'Aves'], correcta: 0 },
        { enunciado: 'Un sustrato con mal olor probablemente tiene…', opciones: ['Exceso de agua', 'Poca agua', 'Mucho sol', 'Poco sustrato'], correcta: 0 }
    ];

    const shuffle = [...banco].sort(() => Math.random() - 0.5);
    return shuffle.slice(0, num);
}

/* ---------- Actualizaciones de interfaz ---------- */
function actualizarCabecera() {
    const modulo = getModuloPorId(getModuloActivoId());
    if (!modulo) return;
    const pct = modulo.estado === 'COMPLETADO' ? 100 : calcularProgresoContenidos(modulo);
    const barra = document.getElementById('barraModulo');
    if (barra) barra.style.width = `${pct}%`;
    const info = document.querySelector('.modulo-progreso-info span:last-child');
    if (info) info.textContent = `${pct}%`;
}

function actualizarProgresoBanner() {
    const banner = document.getElementById('bannerProgresoGlobal');
    if (banner) banner.textContent = `Progreso del curso: ${calcularProgresoGlobal()}%`;
}

function buscarContenido(idContenido) {
    for (const m of getModulos()) {
        const c = m.contenidos.find(c => c.id === Number(idContenido));
        if (c) return c;
    }
    return null;
}

/* ============================================================
   Inicio (arranque asíncrono vía api.js)
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
    // La capa api asegura que window.DATA esté cargado (data.js)
    await api.obtenerCurso(CURSO_ID);
    sincronizarEstados();
    const id = getModuloActivoId();
    cargarModulo(id);
});

/* ---------- Modal de evaluación (wiring) ---------- */
document.addEventListener('DOMContentLoaded', () => {
    const btnEnviar = document.getElementById('btnEnviarEval');
    const btnCerrar = document.getElementById('btnCerrarEval');
    if (!btnEnviar || !btnCerrar) return;

    btnCerrar.addEventListener('click', () => document.getElementById('modalEvaluacion').classList.add('hidden'));
    document.getElementById('modalEvaluacion').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalEvaluacion')) e.target.classList.add('hidden');
    });

    btnEnviar.addEventListener('click', () => {
        const modal = document.getElementById('modalEvaluacion');
        const modulo = getModuloPorId(Number(modal.dataset.modulo));
        if (!modulo) return;

        const preguntas = document.querySelectorAll('#evalPreguntas .eval-pregunta');
        let aciertos = 0;

        preguntas.forEach((preguntaEl, i) => {
            const seleccionada = preguntaEl.querySelector('input:checked');
            if (!seleccionada) return;
            if (preguntasRecientes[i] && Number(seleccionada.value) === preguntasRecientes[i].correcta) {
                aciertos++;
            }
        });

        const total = preguntas.length;
        const nota = Math.round((aciertos / total) * 100);
        const min = modulo.evaluacion.puntajeMinimo || 70;
        const resultado = document.getElementById('evalResultado');
        if (!resultado) return;

        if (nota >= min) {
            resultado.textContent = `✓ Nota: ${nota}/100. ¡Aprobado!`;
            resultado.classList.add('text-green-600');
            modal.classList.add('hidden');
            estadoEstudiante.puntajes[`eval-${modulo.id}`] = nota;
            marcarModuloCompletado(modulo);
        } else {
            resultado.textContent = `✗ Nota: ${nota}/100. Necesitas al menos ${min}. Reintenta.`;
            resultado.classList.add('text-red-600');
        }
    });
});

// Logout global
window.logout = function () {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        window.location.href = './login.html';
    }
};