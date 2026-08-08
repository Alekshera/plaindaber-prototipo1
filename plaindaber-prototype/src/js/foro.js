/* ============================================================
   PLAINDABER - Foro (foro.js)
   Lógica de la página de foro: renderizado, filtros, creación,
   respuestas y cierre de hilos (RF09).
   ------------------------------------------------------------------
   NOTA PARA INTEGRACIÓN CON BACKEND (Java Spring Boot + PostgreSQL):
   Todas las operaciones mutan `window.DATA` en memoria. Para conectar
   un API REST, reemplaza las funciones marcadas con [API] por llamadas
   fetch() a los endpoints (GET /hilos, POST /hilos, POST /hilos/{id}/mensajes,
   PATCH /hilos/{id}/cerrar, etc.). `window.DATA.hilos` sería alimentado
   por la respuesta del servidor.
   ============================================================ */

// ---------- [API] OBTENER USUARIO ACTUAL ----------
// Integrado con el flujo de registro/login (localStorage).
const storedName = localStorage.getItem('userName') || 'Anna Fudalej';
const storedRole = localStorage.getItem('userRole') || 'ESTUDIANTE';

window.DATA = {
    usuarioActual: {
        id: 1,
        nombre: storedName,
        email: localStorage.getItem('userEmail') || 'anna@plaindaber.co',
        rol: storedRole   // 'ESTUDIANTE' | 'INSTRUCTOR' | 'ADMINISTRADOR'
    },
    // ---------- [API] HILOS (GET /hilos) ----------
    hilos: [
        {
            id: 1,
            titulo: "Dudas sobre el sustrato para las huertas",
            contenidoInicial: "Hola, quería preguntar cuál es el mejor sustrato para plantar lechugas en macetas de balcón. ¿Alguno tiene experiencia con mezclas caseras?",
            autor: { id: 2, nombre: "Carlos Pérez", rol: "INSTRUCTOR" },
            fechaCreacion: "2025-02-10T10:30:00",
            fechaUltimaActividad: "2025-02-12T15:20:00",
            numeroVisitas: 45,
            estado: "ACTIVO",
            mensajes: [
                { id: 101, autor: { id: 3, nombre: "Anna Fudalej", rol: "ESTUDIANTE" }, contenido: "Yo uso turba y compost, funciona bien.", fecha: "2025-02-11T09:15:00", editado: false, numeroReportes: 0 },
                { id: 102, autor: { id: 2, nombre: "Carlos Pérez", rol: "INSTRUCTOR" }, contenido: "Excelente, Anna. La turba mezclada con perlita es ideal para drenaje.", fecha: "2025-02-12T15:20:00", editado: false, numeroReportes: 0 }
            ]
        },
        {
            id: 2,
            titulo: "¿Cuánta agua necesitan los tomates cherry?",
            contenidoInicial: "Estoy cultivando tomates cherry en mi terraza y no sé si estoy regando de más o de menos. ¿Alguien me puede orientar?",
            autor: { id: 4, nombre: "Maciej Nowak", rol: "ESTUDIANTE" },
            fechaCreacion: "2025-02-14T18:05:00",
            fechaUltimaActividad: "2025-02-15T11:40:00",
            numeroVisitas: 28,
            estado: "ACTIVO",
            mensajes: [
                { id: 201, autor: { id: 2, nombre: "Carlos Pérez", rol: "INSTRUCTOR" }, contenido: "Riega solo cuando la capa superior del suelo esté seca al tacto, normalmente 2-3 veces por semana.", fecha: "2025-02-14T20:10:00", editado: false, numeroReportes: 0 },
                { id: 202, autor: { id: 4, nombre: "Maciej Nowak", rol: "ESTUDIANTE" }, contenido: "¡Gracias! Probaré con ese método.", fecha: "2025-02-15T11:40:00", editado: false, numeroReportes: 0 }
            ]
        },
        {
            id: 3,
            titulo: "Inscripciones para el módulo de compostaje",
            contenidoInicial: "Quería saber si ya están abiertas las inscripciones para el módulo 4 de compostaje casero del curso de Huertas Orgánicas.",
            autor: { id: 5, nombre: "María Gómez", rol: "ESTUDIANTE" },
            fechaCreacion: "2025-01-20T09:00:00",
            fechaUltimaActividad: "2025-01-28T14:00:00",
            numeroVisitas: 12,
            estado: "INACTIVO",
            mensajes: [
                { id: 301, autor: { id: 2, nombre: "Carlos Pérez", rol: "INSTRUCTOR" }, contenido: "Aún no están abiertas, pero estaremos anunciando la fecha próximamente.", fecha: "2025-01-25T10:00:00", editado: false, numeroReportes: 0 }
            ]
        },
        {
            id: 4,
            titulo: "Gracias por el curso de abonos orgánicos",
            contenidoInicial: "Solo quería agradecer al equipo por el excelente contenido del curso de abonos orgánicos. Me encantó el módulo del bocashi.",
            autor: { id: 6, nombre: "Piotrek Kowalski", rol: "ESTUDIANTE" },
            fechaCreacion: "2024-12-05T16:20:00",
            fechaUltimaActividad: "2024-12-10T09:30:00",
            numeroVisitas: 67,
            estado: "CERRADO",
            mensajes: [
                { id: 401, autor: { id: 2, nombre: "Carlos Pérez", rol: "INSTRUCTOR" }, contenido: "Gracias a ti, Piotrek. ¡Nos alegra mucho saberlo!", fecha: "2024-12-10T09:30:00", editado: false, numeroReportes: 0 }
            ]
        }
    ]
};

// ---------- REFERENCIAS AL DOM ----------
const hilosContainer = document.getElementById('hilosContainer');
const emptyState = document.getElementById('emptyState');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const btnNuevoHilo = document.getElementById('btnNuevoHilo');

const vistaLista = document.getElementById('vistaLista');
const vistaDetalle = document.getElementById('vistaDetalle');
const detalleCabecera = document.getElementById('detalleCabecera');
const mensajesContainer = document.getElementById('mensajesContainer');
const zonaAcciones = document.getElementById('zonaAcciones');
const formularioRespuesta = document.getElementById('formularioRespuesta');
const formRespuesta = document.getElementById('formRespuesta');
const respuestaInput = document.getElementById('respuestaInput');
const btnVolver = document.getElementById('btnVolver');

const modalNuevoHilo = document.getElementById('modalNuevoHilo');
const formNuevoHilo = document.getElementById('formNuevoHilo');
const nuevoTitulo = document.getElementById('nuevoTitulo');
const nuevoContenido = document.getElementById('nuevoContenido');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const btnCancelarHilo = document.getElementById('btnCancelarHilo');

const toast = document.getElementById('toast');
const userAvatar = document.getElementById('userAvatar');

// Respuesta directa (citar + mencionar al autor)
const chipRespuesta = document.getElementById('chipRespuesta');
const mencionesDropdown = document.getElementById('mencionesDropdown');
const hintRespuesta = document.getElementById('hintRespuesta');

// ---------- ESTADO DE LA VISTA ----------
let hiloActivoId = null;
let busqueda = '';

// Respuesta directa: mensaje que se está respondiendo
let respondiendoAh = null;        // { id, autorId, autorNombre, contenido }
// Autocompletado de menciones
let participantesHilo = [];       // [{ id, nombre }] del hilo abierto
let mencActiva = null;            // { at, token } -> sugerencia en curso
let mencIndice = -1;              // ítem resaltado en el dropdown

// ---------- UTILIDADES ----------
function escapar(texto) {
    // Previene XSS al inyectar contenido del usuario (importante con datos del backend)
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function iniciales(nombre) {
    return (nombre || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatearFecha(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

function claseRol(rol) {
    const map = {
        'ESTUDIANTE': 'badge-rol-estudiante',
        'INSTRUCTOR': 'badge-rol-instructor',
        'ADMINISTRADOR': 'badge-rol-admin'
    };
    return map[rol] || 'badge-rol-estudiante';
}

function etiquetaRol(rol) {
    if (rol === 'ADMINISTRADOR') return 'Admin';
    if (rol === 'INSTRUCTOR') return 'Instructor';
    return 'Estudiante';
}

function claseEstado(estado) {
    return estado === 'ACTIVO' ? 'estado-activo'
        : estado === 'CERRADO' ? 'estado-cerrado'
        : 'estado-inactivo';
}

function iconoEstado(estado) {
    return estado === 'ACTIVO' ? '🟢'
        : estado === 'CERRADO' ? '🔴'
        : '⚪';
}

function esModerador() {
    const rol = window.DATA.usuarioActual.rol;
    return rol === 'INSTRUCTOR' || rol === 'ADMINISTRADOR';
}

// ---------- UTILIDADES DE MENCIONES Y RESPUESTA DIRECTA ----------

// [API] Lista de participantes de un hilo (para el autocompletado de @menciones).
function obtenerParticipantes(hilo) {
    const mapa = new Map();
    const agregar = (usuario) => {
        if (usuario && usuario.id != null && !mapa.has(usuario.id)) {
            mapa.set(usuario.id, { id: usuario.id, nombre: usuario.nombre });
        }
    };
    agregar(hilo.autor);
    hilo.mensajes.forEach(m => agregar(m.autor));
    // Excluir al propio usuario (no tiene sentido mencionarse)
    return [...mapa.values()].filter(p => p.id !== window.DATA.usuarioActual.id);
}

// [API] Extraer las menciones @Nombre de un contenido y devolver su estructura
// mapeable a JPA: [{ id, nombre }]
function extraerMenciones(contenido) {
    if (!participantesHilo.length) return [];
    const mencionados = [];
    participantesHilo.forEach(p => {
        if (contenido.includes('@' + p.nombre)) {
            mencionados.push({ id: p.id, nombre: p.nombre });
        }
    });
    return mencionados;
}

// Renderiza el contenido resaltando las menciones @usuario como chips.
function renderContenidoConMenciones(texto) {
    const seguro = escapar(texto);
    return seguro.replace(
        /@([A-Za-zÁÉÍÓÚáéíóúÑñ][A-Za-zÁÉÍÓÚáéíóúÑñ0-9_. ]*?)(?=\s|$|[,;.:!?])/g,
        (m, nombre) => `<span class="chip-mencion" title="Menciona a ${nombre}">${m}</span>`
    );
}

// Cita previa del mensaje al que se responde.
function renderCitaPrevia(respuestaA) {
    if (!respuestaA) return '';
    return `
        <div class="cita-previa">
            <span class="cita-autor">→ ${escapar(respuestaA.autorNombre)}</span>
            <div class="cita-contenido">${escapar(respuestaA.contenido)}</div>
        </div>
    `;
}

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ---------- [API] RENDERIZAR LISTA DE HILOS (GET /hilos) ----------
function renderizarLista() {
    const filtrados = window.DATA.hilos.filter(h =>
        h.titulo.toLowerCase().includes(busqueda.toLowerCase())
    );

    resultsCount.textContent = `Mostrando ${filtrados.length} hilos`;
    emptyState.classList.toggle('hidden', filtrados.length > 0);

    hilosContainer.innerHTML = filtrados.map(hilo => {
        const respuestas = hilo.mensajes.length;
        const rol = hilo.autor.rol;
        return `
            <article class="card hilo-tarjeta hilo-animado" data-id="${hilo.id}" tabindex="0" role="button" aria-label="Abrir hilo ${escapar(hilo.titulo)}">
                <!-- Fila superior: estado + última actividad -->
                <div class="flex items-center justify-between mb-3">
                    <span class="badge-estado ${claseEstado(hilo.estado)}">${iconoEstado(hilo.estado)} ${hilo.estado}</span>
                    <span class="text-xs text-gray-400">Última actividad: ${formatearFecha(hilo.fechaUltimaActividad)}</span>
                </div>

                <!-- Título -->
                <h3 class="font-bold text-[#1A3B5C] text-lg mb-2 line-clamp-2">${escapar(hilo.titulo)}</h3>

                <!-- Autor -->
                <div class="flex items-center gap-2 mb-4">
                    <span class="badge-rol ${claseRol(rol)}">${etiquetaRol(rol)}</span>
                    <span class="text-sm text-gray-600">${escapar(hilo.autor.nombre)}</span>
                </div>

                <!-- Métricas -->
                <div class="flex items-center gap-5 text-sm text-gray-500 mb-4">
                    <span>👁 ${hilo.numeroVisitas} visitas</span>
                    <span>💬 ${respuestas} respuestas</span>
                    <span>📅 ${formatearFecha(hilo.fechaCreacion)}</span>
                </div>

                <!-- Cerrar hilo (solo moderadores, solo ACTIVO) - RF09 -->
                ${esModerador() && hilo.estado === 'ACTIVO'
                    ? `<button class="btn-accion-card" data-accion="cerrar" data-id="${hilo.id}">Cerrar Hilo</button>`
                    : ''}
            </article>
        `;
    }).join('');
}

// ---------- [API] RENDERIZAR DETALLE DEL HILO (GET /hilos/{id}) ----------
function renderizarDetalle(hiloId) {
    const hilo = window.DATA.hilos.find(h => h.id === hiloId);
    if (!hilo) return;

    hiloActivoId = hiloId;
    hilo.numeroVisitas = (hilo.numeroVisitas || 0) + 1;

    // Participantes del hilo para el autocompletado de menciones
    participantesHilo = obtenerParticipantes(hilo);

    // Limpiar el estado de "respuesta directa" al abrir un hilo
    respondiendoAh = null;
    ocultarDropdown();
    actualizarUIRespuestaDirecta();

    // Intercambio de vistas
    vistaLista.classList.add('hidden');
    vistaDetalle.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cabecera del hilo
    const esActivo = hilo.estado === 'ACTIVO';
    detalleCabecera.innerHTML = `
        <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
            <h2 class="text-2xl font-bold text-[#1A3B5C]">${escapar(hilo.titulo)}</h2>
            <span class="badge-estado ${claseEstado(hilo.estado)}">${iconoEstado(hilo.estado)} ${hilo.estado}</span>
        </div>
        <div class="flex items-center gap-3 mb-4">
            <div class="mensaje-avatar">${iniciales(hilo.autor.nombre)}</div>
            <div>
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-[#1A3B5C]">${escapar(hilo.autor.nombre)}</span>
                    <span class="badge-rol ${claseRol(hilo.autor.rol)}">${etiquetaRol(hilo.autor.rol)}</span>
                </div>
                <p class="text-xs text-gray-500">Creado el ${formatearFecha(hilo.fechaCreacion)} · 👁 ${hilo.numeroVisitas} visitas · 💬 ${hilo.mensajes.length} respuestas</p>
            </div>
        </div>
        <p class="text-gray-700 text-sm leading-relaxed">${escapar(hilo.contenidoInicial)}</p>
    `;

    // Mensajes en orden cronológico (mensaje inicial primero)
    const mensajes = [{
        id: 'inicial',
        autor: hilo.autor,
        contenido: hilo.contenidoInicial,
        fecha: hilo.fechaCreacion,
        editado: false
    }, ...hilo.mensajes].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    mensajesContainer.innerHTML = mensajes.map(msg => renderMensaje(hilo, msg)).join('');

    // Zona de acciones para moderadores
    zonaAcciones.classList.add('hidden');
    if (esModerador()) {
        zonaAcciones.classList.remove('hidden');
        zonaAcciones.innerHTML = `
            <h3 class="text-lg font-bold text-[#1A3B5C] mb-4">Acciones de moderación</h3>
            <div class="flex flex-wrap gap-3">
                ${esActivo
                    ? `<button class="btn-primary" data-accion="cerrarHilo" data-id="${hilo.id}">🔒 Cerrar Hilo</button>`
                    : ''}
                <button class="btn-accion-peligrosa" data-accion="eliminarHilo" data-id="${hilo.id}">🗑 Eliminar hilo</button>
            </div>
        `;
    }

    // Formulario de respuesta: solo si el hilo está ACTIVO (RF09)
    formularioRespuesta.classList.toggle('hidden', !esActivo);
    respuestaInput.value = '';
}

function renderMensaje(hilo, msg) {
    const autor = msg.autor;
    const esAutor = autor.id === window.DATA.usuarioActual.id;
    const esMod = esModerador();
    const hiloActivo = hilo.estado === 'ACTIVO';

    let acciones = '';
    // Respuesta directa: citar + mencionar al autor (solo hilos ACTIVOS)
    if (hiloActivo) {
        acciones += `<button class="btn-responder" data-accion="responder" data-hilo="${hilo.id}" data-msg="${msg.id}">↩ Responder</button>`;
    }
    if (esAutor) {
        acciones += `<button class="mensaje-accion" data-accion="editar" data-hilo="${hilo.id}" data-msg="${msg.id}">✏️ Editar</button>`;
    }
if (esMod) {
        acciones += `<button class="mensaje-accion mensaje-accion-danger" data-accion="eliminarMensaje" data-hilo="${hilo.id}" data-msg="${msg.id}">🗑 Eliminar</button>`;
    }

    return `
        <div class="mensaje-burbuja flex gap-4">
            <div class="mensaje-avatar">${iniciales(autor.nombre)}</div>
            <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="font-semibold text-[#1A3B5C]">${escapar(autor.nombre)}</span>
                    <span class="badge-rol ${claseRol(autor.rol)}">${etiquetaRol(autor.rol)}</span>
                    <span class="text-xs text-gray-400">${formatearFecha(msg.fecha)}</span>
                    ${msg.editado ? '<span class="text-xs text-gray-400 italic">(editado)</span>' : ''}
                </div>
                ${msg.respuestaA ? renderCitaPrevia(msg.respuestaA) : ''}
                <p class="mensaje-contenido">${renderContenidoConMenciones(msg.contenido)}</p>
                ${(msg.mencionados && msg.mencionados.length)
                    ? `<p class="text-xs text-[#822375] mt-1">Mencionó: ${msg.mencionados.map(m => '@' + m.nombre).join(', ')}</p>`
                    : ''}
                ${acciones ? `<div class="mt-2 flex gap-1">${acciones}</div>` : ''}
            </div>
        </div>
    `;
}

// ---------- [API] CREAR NUEVO HILO (POST /hilos) ----------
function crearHilo(titulo, contenido) {
    const nuevo = {
        id: Math.max(0, ...window.DATA.hilos.map(h => h.id)) + 1,
        titulo: titulo.trim(),
        contenidoInicial: contenido.trim(),
        autor: { ...window.DATA.usuarioActual },
        fechaCreacion: new Date().toISOString(),
        fechaUltimaActividad: new Date().toISOString(),
        numeroVisitas: 0,
        estado: 'ACTIVO',
        mensajes: []
    };
    window.DATA.hilos.unshift(nuevo);
    mostrarToast('Hilo creado correctamente ✔');
    renderizarLista();
    renderizarDetalle(nuevo.id);
}

// ---------- [API] RESPONDER A UN HILO (POST /hilos/{id}/mensajes) ----------
// El mensaje puede ser una respuesta directa (respuestaA) y/o contener menciones (mencionados).
// En JPA: Mensaje { id, contenido, usuario, fecha, editado, numeroReportes,
//                  mencionados: List<Usuario>, respuestaA: Mensaje }
function responderHilo(hiloId, contenido) {
    const hilo = window.DATA.hilos.find(h => h.id === hiloId);
    if (!hilo || hilo.estado !== 'ACTIVO') return;

    const nuevoMsg = {
        id: Math.max(100, ...hilo.mensajes.map(m => m.id), 99) + 1,
        autor: { ...window.DATA.usuarioActual },
        contenido: contenido.trim(),
        fecha: new Date().toISOString(),
        editado: false,
        numeroReportes: 0,
        // [API] columnas/normalización: muchos-a-muchos con Usuario (JOIN_TABLE)
        //       y una FK hacia el mensaje al que responde.
        mencionados: extraerMenciones(contenido),
        respuestaA: respondiendoAh
            ? {
                id: respondiendoAh.id,
                autorId: respondiendoAh.autorId,
                autorNombre: respondiendoAh.autorNombre,
                contenido: respondiendoAh.contenido
              }
            : null
    };
    hilo.mensajes.push(nuevoMsg);
    hilo.fechaUltimaActividad = nuevoMsg.fecha;

    // Limpiar el estado de respuesta directa
    const fueRespuestaDirecta = !!respondiendoAh;
    respondiendoAh = null;
    ocultarDropdown();
    actualizarUIRespuestaDirecta();

    renderizarDetalle(hiloId);
    mostrarToast(fueRespuestaDirecta
        ? 'Respuesta enviada y autor notificado ✔'
        : 'Respuesta enviada ✔');
}

// ---------- [API] CERRAR HILO (PATCH /hilos/{id}/cerrar) - RF09 ----------
function cerrarHilo(hiloId) {
    const hilo = window.DATA.hilos.find(h => h.id === hiloId);
    if (!hilo || !esModerador() || hilo.estado !== 'ACTIVO') return;

    hilo.estado = 'CERRADO';
    mostrarToast('El hilo fue cerrado. Ya no acepta nuevas respuestas.');
    renderizarLista();
    if (hiloActivoId === hiloId) renderizarDetalle(hiloId);
}

// ---------- [API] ELIMINAR HILO (DELETE /hilos/{id}) ----------
function eliminarHilo(hiloId) {
    if (!esModerador()) return;
    const hilo = window.DATA.hilos.find(h => h.id === hiloId);
    if (!hilo) return;

    if (!confirm(`¿Eliminar el hilo "${hilo.titulo}"? Esta acción no se puede deshacer.`)) return;

    window.DATA.hilos = window.DATA.hilos.filter(h => h.id !== hiloId);
    mostrarToast('Hilo eliminado.');
    hiloActivoId = null;
    vistaDetalle.classList.add('hidden');
    vistaLista.classList.remove('hidden');
    renderizarLista();
}

// ---------- [API] ELIMINAR MENSAJE (DELETE /hilos/{id}/mensajes/{mid}) ----------
function eliminarMensaje(hiloId, msgId) {
    if (!esModerador()) return;
    const hilo = window.DATA.hilos.find(h => h.id === hiloId);
    if (!hilo) return;

    if (msgId === 'inicial') {
        // Eliminar el mensaje inicial equivale a eliminar el hilo
        eliminarHilo(hiloId);
        return;
    }

    const idx = hilo.mensajes.findIndex(m => m.id === Number(msgId));
    if (idx === -1) return;

    if (!confirm('¿Eliminar este mensaje?')) return;
    hilo.mensajes.splice(idx, 1);
    hilo.fechaUltimaActividad = new Date().toISOString();
    mostrarToast('Mensaje eliminado.');
    renderizarDetalle(hiloId);
}

// ---------- SIMULACIÓN: EDITAR MENSAJE ----------
function editarMensaje(hiloId, msgId) {
    // En un backend real, esto abriría un modal y haría PATCH /hilos/{id}/mensajes/{mid}
    alert('✏️ Simulación: abrir editor para modificar el mensaje.');
}

// ---------- RESPUESTA DIRECTA (citar + mencionar al autor) ----------

// Inicia una respuesta citando al mensaje original y mencionando a su autor.
function iniciarRespuestaDirecta(hiloId, msgId) {
    const hilo = window.DATA.hilos.find(h => h.id === hiloId);
    if (!hilo || hilo.estado !== 'ACTIVO') return;

    // El mensaje inicial no está dentro del array `mensajes`
    const target = msgId === 'inicial'
        ? { id: 'inicial', autor: hilo.autor, contenido: hilo.contenidoInicial }
        : hilo.mensajes.find(m => m.id === Number(msgId));
    if (!target) return;

    respondiendoAh = {
        id: target.id,
        autorId: target.autor.id,
        autorNombre: target.autor.nombre,
        contenido: target.contenido
    };

    // Pre-cargar la mención @autor en el editor
    respuestaInput.value = '@' + respondiendoAh.autorNombre + ' ';
    const caret = respuestaInput.value.length;
    respuestaInput.setSelectionRange(caret, caret);

    actualizarUIRespuestaDirecta();
    respuestaInput.focus();
}

// Refresca el chip "Respondiendo a ..." y el hint según el estado actual.
function actualizarUIRespuestaDirecta() {
    ocultarDropdown();
    if (respondiendoAh) {
        chipRespuesta.innerHTML = `
            <span class="chip-respuesta">
                Respondiendo a @${escapar(respondiendoAh.autorNombre)}
                <button type="button" data-accion="cancelarRespuesta" aria-label="Cancelar respuesta">&times;</button>
            </span>
        `;
        chipRespuesta.classList.remove('hidden');
        hintRespuesta.textContent = `Respuesta directa a @${respondiendoAh.autorNombre} (se citará su mensaje y se le notificará).`;
    } else {
        chipRespuesta.classList.add('hidden');
        chipRespuesta.innerHTML = '';
        hintRespuesta.textContent = 'Escribiendo nueva respuesta al hilo.';
    }
}

// ---------- MENCIÓN @usuario: desplegable de autocompletado ----------

function buscarMencionActiva(texto, caret) {
    const parte = texto.slice(0, caret);
    const at = parte.lastIndexOf('@');
    if (at === -1) return null;
    const token = parte.slice(at + 1);
    // Solo sugerir mientras se escribe un nombre sin espacios/commas
    if (!token || /\s|[,;.:!?]/.test(token)) return null;
    return { at, token };
}

function mostrarDropdown(pares) {
    if (!pares.length || pares.length === 0) {
        ocultarDropdown();
        return;
    }
    mencIndice = 0;
    mencionesDropdown.innerHTML = pares.map((p, i) => `
        <li data-id="${p.id}" data-indice="${i}" class="${i === 0 ? 'seleccionado' : ''}">
            <span class="mencion-avatar">${iniciales(p.nombre)}</span>
            <span class="mencion-nombre">${escapar(p.nombre)}</span>
        </li>
    `).join('');
    mencionesDropdown.classList.remove('hidden');
}

function ocultarDropdown() {
    mencionesDropdown.classList.add('hidden');
    mencionesDropdown.innerHTML = '';
    mencActiva = null;
    mencIndice = -1;
}

function renderDropdown(query) {
    const q = query.toLowerCase();
    const filtrados = participantesHilo.filter(p => p.nombre.toLowerCase().includes(q));
    if (!filtrados.length) {
        ocultarDropdown();
        return;
    }
    mostrarDropdown(filtrados);
}

function insertarMencion(participante) {
    if (!mencActiva) return;
    const { at } = mencActiva;
    const tokenLen = mencActiva.token.length;
    const valor = respuestaInput.value;
    const antes = valor.slice(0, at);
    const despues = valor.slice(at + 1 + tokenLen); // omite '@'+token
    const nuevoValor = antes + '@' + participante.nombre + ' ' + despues;
    respuestaInput.value = nuevoValor;
    const caret = (antes + '@' + participante.nombre + ' ').length;
    respuestaInput.setSelectionRange(caret, caret);
    ocultarDropdown();
    respuestaInput.focus();
}

// ---------- MODAL NUEVO HILO ----------
function abrirModal() {
    modalNuevoHilo.classList.remove('hidden');
    nuevoTitulo.value = '';
    nuevoContenido.value = '';
    setTimeout(() => nuevoTitulo.focus(), 50);
}

function cerrarModal() {
    modalNuevoHilo.classList.add('hidden');
}

// ---------- EVENTOS ----------
// Búsqueda en tiempo real por título
searchInput.addEventListener('input', (e) => {
    busqueda = e.target.value.trim();
    renderizarLista();
});

// Delegación de eventos en la lista de hilos
hilosContainer.addEventListener('click', (e) => {
    const cerrarBtn = e.target.closest('[data-accion="cerrar"]');
    if (cerrarBtn) {
        e.stopPropagation();
        cerrarHilo(Number(cerrarBtn.dataset.id));
        return;
    }

    const tarjeta = e.target.closest('.hilo-tarjeta');
    if (tarjeta) {
        const id = Number(tarjeta.dataset.id);
        // Resaltar la tarjeta seleccionada
        hilosContainer.querySelectorAll('.hilo-seleccionado').forEach(el => el.classList.remove('hilo-seleccionado'));
        tarjeta.classList.add('hilo-seleccionado');
        renderizarDetalle(id);
    }
});

// Soporte para teclado (accesibilidad)
hilosContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const tarjeta = e.target.closest('.hilo-tarjeta');
        if (tarjeta) {
            e.preventDefault();
            renderizarDetalle(Number(tarjeta.dataset.id));
        }
    }
});

// Volver a la lista
btnVolver.addEventListener('click', () => {
    hiloActivoId = null;
    vistaDetalle.classList.add('hidden');
    vistaLista.classList.remove('hidden');
    renderizarLista();
});

// Delegación de eventos en mensajes y zona de acciones
mensajesContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-accion]');
    if (!btn) return;
    const hiloId = Number(btn.dataset.hilo);
    const msgId = btn.dataset.msg;

    if (btn.dataset.accion === 'editar') editarMensaje(hiloId, msgId);
    if (btn.dataset.accion === 'eliminarMensaje') eliminarMensaje(hiloId, msgId);
    if (btn.dataset.accion === 'responder') iniciarRespuestaDirecta(hiloId, msgId);
});

// Cancelar una respuesta directa (chip del editor)
chipRespuesta.addEventListener('click', (e) => {
    if (e.target.closest('[data-accion="cancelarRespuesta"]')) {
        respondiendoAh = null;
        actualizarUIRespuestaDirecta();
        respuestaInput.focus();
    }
});

zonaAcciones.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-accion]');
    if (!btn) return;
    const hiloId = Number(btn.dataset.id);

    if (btn.dataset.accion === 'cerrarHilo') cerrarHilo(hiloId);
    if (btn.dataset.accion === 'eliminarHilo') eliminarHilo(hiloId);
});

// Formulario de respuesta
formRespuesta.addEventListener('submit', (e) => {
    e.preventDefault();
    const contenido = respuestaInput.value.trim();
    if (!contenido || hiloActivoId === null) return;
    responderHilo(hiloActivoId, contenido);
});

// Autocompletado de menciones @usuario
respuestaInput.addEventListener('input', () => {
    const info = buscarMencionActiva(respuestaInput.value, respuestaInput.selectionStart);
    if (info) {
        mencActiva = info;
        renderDropdown(info.token);
    } else {
        ocultarDropdown();
    }
});

respuestaInput.addEventListener('keydown', (e) => {
    const abierto = !mencionesDropdown.classList.contains('hidden');
    if (!abierto) return;

    const items = mencionesDropdown.querySelectorAll('li[data-indice]');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        mencIndice = (mencIndice + dir + items.length) % items.length;
        items.forEach((li, i) => li.classList.toggle('seleccionado', i === mencIndice));
        return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const li = items[mencIndice];
        if (li) {
            const p = participantesHilo.find(x => x.id === Number(li.dataset.id));
            if (p) insertarMencion(p);
        }
        return;
    }
    if (e.key === 'Escape') {
        ocultarDropdown();
    }
});

// Hacer clic en una sugerencia de mención
mencionesDropdown.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-indice]');
    if (!li) return;
    const p = participantesHilo.find(x => x.id === Number(li.dataset.id));
    if (p) insertarMencion(p);
});

// Modal nuevo hilo
btnNuevoHilo.addEventListener('click', abrirModal);
btnCerrarModal.addEventListener('click', cerrarModal);
btnCancelarHilo.addEventListener('click', cerrarModal);
modalNuevoHilo.addEventListener('click', (e) => {
    if (e.target === modalNuevoHilo) cerrarModal();
});

formNuevoHilo.addEventListener('submit', (e) => {
    e.preventDefault();
    const titulo = nuevoTitulo.value.trim();
    const contenido = nuevoContenido.value.trim();
    if (!titulo || !contenido) return;
    crearHilo(titulo, contenido);
    cerrarModal();
});

// ---------- INICIALIZACIÓN ----------
function initForo() {
    // Avatar del sidebar con el usuario actual
    userAvatar.textContent = iniciales(window.DATA.usuarioActual.nombre);
    renderizarLista();
}

document.addEventListener('DOMContentLoaded', initForo);
