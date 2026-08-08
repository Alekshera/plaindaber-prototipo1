/* ============================================================
   PLAINDABER - Videollamada (videollamada.js)
   CAPA DE PRESENTACIÓN. No contiene lógica de tiempo real:
   toda la presencia/chat/WebRTC pasa por `window.RealtimeService`
   (ver realtime.js). Esto permite intercambiar la simulación por
   socket.io + simple-peer sin tocar este archivo.
   ============================================================ */

// ---------- [API] DATOS BÁSICOS (identidad y metadatos de la llamada) ----------
const storedName = localStorage.getItem('userName') || 'Malcolm García';
const storedRole = localStorage.getItem('userRole') || 'ESTUDIANTE';

window.DATA = {
    usuarioActual: {
        id: Number(localStorage.getItem('userId')) || 100,
        nombre: storedName,
        rol: storedRole  // 'ESTUDIANTE' | 'INSTRUCTOR' | 'ADMINISTRADOR'
    },
    // [API] GET /videollamadas/{id}
    videollamada: {
        id: 1,
        curso: 'Huertas Orgánicas en la Ciudad',
        tema: 'Sesión de preguntas y respuestas',
        fecha: '2025-02-12T10:00:00',
        estado: 'programada'  // 'programada' | 'en_curso' | 'finalizada'
    }
};

const rt = window.RealtimeService;

// ---------- REFERENCIAS AL DOM ----------
const vistaEspera = document.getElementById('vistaEspera');
const vistaLlamada = document.getElementById('vistaLlamada');
const overlayConectando = document.getElementById('overlayConectando');
const zonaBotonInicio = document.getElementById('zonaBotonInicio');
const listaEspera = document.getElementById('listaEspera');
const estadoLlamadaBadge = document.getElementById('estadoLlamadaBadge');
const participantesEspera = document.getElementById('participantesEspera');

const gridParticipantes = document.getElementById('gridParticipantes');
const lblTiempo = document.getElementById('lblTiempo');
const contadorParticipantes = document.getElementById('contadorParticipantes');

const btnMicrofono = document.getElementById('btnMicrofono');
const btnCamara = document.getElementById('btnCamara');
const btnPantalla = document.getElementById('btnPantalla');
const btnChat = document.getElementById('btnChat');
const btnColgar = document.getElementById('btnColgar');

const modalChat = document.getElementById('modalChat');
const chatMensajes = document.getElementById('chatMensajes');
const formChat = document.getElementById('formChat');
const chatInput = document.getElementById('chatInput');
const btnCerrarChat = document.getElementById('btnCerrarChat');

const userAvatar = document.getElementById('userAvatar');

// ---------- ESTADO LOCAL DE LA VISTA ----------
let enLlamada = false;
let audioActivo = true;
let videoActivo = true;
let segundos = 0;
let intervalTemporizador = null;
let chatAbierto = false;

// Estado de la sala (alimentado por los eventos de RealTimeService)
let participantes = [];
let mensajesChat = [];
const streamsRemotos = {};   // participanteId -> MediaStream (WebRTC real)
let streamLocal = null;

// ---------- UTILIDADES ----------
function iniciales(nombre) { return (nombre || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(); }
function etiquetaRol(rol) { return rol === 'ADMINISTRADOR' ? 'Admin' : rol === 'INSTRUCTOR' ? 'Instructor' : 'Estudiante'; }
function claseRol(rol) { return rol === 'ADMINISTRADOR' ? 'rol-admin' : rol === 'INSTRUCTOR' ? 'rol-instructor' : 'rol-estudiante'; }
function escapar(texto) { const d = document.createElement('div'); d.textContent = texto; return d.innerHTML; }
function formatearHora(fecha) { return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); }
function esInstructor() { return window.DATA.usuarioActual.rol === 'INSTRUCTOR' || window.DATA.usuarioActual.rol === 'ADMINISTRADOR'; }

// Iconos de estado
const ICONO_MIC = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>`;
const ICONO_CAM = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`;
const ICONO_MIC_MUTED = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-11.4 5.5"/><path d="M12 19v3"/><path d="M5 21l14-16"/></svg>`;
const ICONO_CAM_OFF = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/><path d="M4 19L18 5"/></svg>`;

const ICONOS_CONTROLES = {
    micro: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/><path d="M5 21l14-16" class="no-linea"/></svg>`,
    cam: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/><path d="M4 19L18 5" class="no-linea"/></svg>`,
    pantalla: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h20v12H2z"/><path d="M8 20h8"/><path d="M12 16v4"/></svg>`,
    chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    colgar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
};

// ---------- VISTA DE ESPERA ----------
function renderizarEspera() {
    const previos = rt.esSimulacion ? rt.obtenerParticipantesEspera() : [];
    participantesEspera.textContent = `${previos.length} participantes en línea`;
    estadoLlamadaBadge.textContent = window.DATA.videollamada.estado === 'en_curso' ? 'En curso' : 'Programada';

    const enCurso = window.DATA.videollamada.estado === 'en_curso';
    let etiqueta = 'Unirse a la llamada';
    if (esInstructor() && !enCurso) etiqueta = 'Iniciar llamada';
    else if (esInstructor() && enCurso) etiqueta = 'Unirse';

    zonaBotonInicio.innerHTML = `
        <button id="btnIniciar" class="btn-primary inline-flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            ${etiqueta}
        </button>
    `;
    document.getElementById('btnIniciar').addEventListener('click', iniciarLlamada);

    // Lista previsual (simulación) o mensaje para modo real sin conexión
    listaEspera.innerHTML = previos.length
        ? previos.map(p => `
            <div class="card flex items-center gap-3">
                <div class="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFB74D] to-[#FF8A50] flex items-center justify-center font-bold text-[#1A3B5C] text-sm flex-shrink-0">${iniciales(p.nombre)}</div>
                <div class="min-w-0">
                    <p class="font-semibold text-[#1A3B5C] truncate">${escapar(p.nombre)}</p>
                    <span class="badge badge-primary text-xs">${etiquetaRol(p.rol)}</span>
                </div>
                <span class="ml-auto w-2.5 h-2.5 rounded-full bg-green-500"></span>
            </div>`).join('')
        : `<p class="text-center text-sm text-gray-500">Conectando a la sala... (la lista se actualizará al unirte)</p>`;
}

// ---------- FLUJO DE ENTRADA ----------
async function iniciarLlamada() {
    if (esInstructor() && window.DATA.videollamada.estado !== 'en_curso') {
        window.DATA.videollamada.estado = 'en_curso';
    }

    mostrarConectando();
    try {
        // [API] conectar al socket (simulación resuelve al instante)
        await Promise.all([rt.conectar(), minimoDelay(1200)]);
        await rt.unirse(window.DATA.usuarioActual, window.DATA.videollamada.id);
        entrarEnSala();
    } catch (err) {
        console.error('No se pudo conectar:', err);
        ocultarConectando();
        alert('No se pudo conectar a la llamada. Revisa la configuración de RealTimeService.');
    }
}

function entrarEnSala() {
    enLlamada = true;
    vistaEspera.classList.add('hidden');
    vistaLlamada.classList.remove('hidden');
    ocultarConectando();

    iniciarTemporizador();
    renderizarControles();
    // Solicitar webcam/micrófono local y anunciarlo al servicio
    iniciarCamaraLocal();
}

function minimoDelay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---------- MEDIA LOCAL (getUserMedia) ----------
async function iniciarCamaraLocal() {
    if (streamLocal) { montarVideoLocal(); return; }
    try {
        streamLocal = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
        console.warn('Cámara/micrófono no disponibles:', err.name, err.message);
        videoActivo = false;
        renderizarControles();
    }

    if (streamLocal) {
        streamLocal.getAudioTracks().forEach(t => (t.enabled = audioActivo));
        streamLocal.getVideoTracks().forEach(t => (t.enabled = videoActivo));
        // [WebRTC] Entregar el stream local al servicio para que lo envasoye a los peers
        rt.establecerStreamLocal(streamLocal);
    }

    const local = participantes.find(p => p.id === window.DATA.usuarioActual.id);
    if (local) local.videoActivo = videoActivo;
    renderizarParticipantes();
}

function montarVideoLocal() {
    const video = document.getElementById('videoLocalCam');
    if (video && streamLocal && videoActivo) video.srcObject = streamLocal;
}

function detenerRecursosLocal() {
    if (streamLocal) { streamLocal.getTracks().forEach(t => t.stop()); streamLocal = null; }
    Object.keys(streamsRemotos).forEach(k => { const s = streamsRemotos[k]; s && s.getTracks && s.getTracks().forEach(t => t.stop()); delete streamsRemotos[k]; });
}

// ---------- GRID DE PARTICIPANTES ----------
function renderizarParticipantes() {
    const n = participantes.length;
    gridParticipantes.classList.remove('sala-1', 'sala-2', 'sala-3', 'sala-4', 'sala-5', 'sala-6', 'sala-many');
    if (n === 1) gridParticipantes.classList.add('sala-1');
    else if (n === 2) gridParticipantes.classList.add('sala-2');
    else if (n <= 4) gridParticipantes.classList.add('sala-3');
    else if (n <= 6) gridParticipantes.classList.add('sala-5');
    else gridParticipantes.classList.add('sala-many');

    gridParticipantes.innerHTML = participantes.map(p => {
        const esLocal = p.id === window.DATA.usuarioActual.id;
        // Local: webcam real si está encendida; remoto: stream real (WebRTC) o avatar.
        let cuerpo;
        if (esLocal) {
            cuerpo = (p.videoActivo && streamLocal)
                ? `<video id="videoLocalCam" autoplay muted playsinline></video>`
                : `<div class="participante-avatar"><div class="avatar-texto">${iniciales(p.nombre)}</div></div>`;
        } else if (streamsRemotos[p.id]) {
            cuerpo = `<video data-remoto="${p.id}" autoplay playsinline></video>`;
        } else {
            cuerpo = `<div class="participante-avatar"><div class="avatar-texto">${iniciales(p.nombre)}</div></div>`;
        }

        return `
            <div class="participante ${n === 1 ? 'participante-grande' : ''}" data-id="${p.id}">
                ${cuerpo}
                <div class="participante-info">
                    <span class="participante-nombre">${escapar(p.nombre)} ${esLocal ? '<span class="etiqueta-tu">TÚ</span>' : ''}</span>
                    <span class="rol-chip ${claseRol(p.rol)}">${etiquetaRol(p.rol)}</span>
                </div>
                <div class="participante-estado">
                    <span class="estado-chip ${p.audioActivo ? 'activo-verde' : ''}" title="${p.audioActivo ? 'Audio activo' : 'Micrófono apagado'}">${p.audioActivo ? ICONO_MIC : ICONO_MIC_MUTED}</span>
                    <span class="estado-chip ${p.videoActivo ? 'activo-verde' : ''}" title="${p.videoActivo ? 'Cámara activa' : 'Cámara apagada'}">${p.videoActivo ? ICONO_CAM : ICONO_CAM_OFF}</span>
                </div>
            </div>`;
    }).join('');

    contadorParticipantes.textContent = `${n} participante${n !== 1 ? 's' : ''} en la llamada`;
    montarVideoLocal();
    remontarStreamsRemotos();
}

function remontarStreamsRemotos() {
    participantes.forEach(p => {
        if (!p.esLocal && streamsRemotos[p.id]) {
            const video = gridParticipantes.querySelector(`video[data-remoto="${p.id}"]`);
            if (video && !video.srcObject) video.srcObject = streamsRemotos[p.id];
        }
    });
}

// ---------- CONTROLES ----------
function renderizarControles() {
    btnMicrofono.innerHTML = ICONOS_CONTROLES.micro;
    btnMicrofono.classList.toggle('desactivado', !audioActivo);
    btnCamara.innerHTML = ICONOS_CONTROLES.cam;
    btnCamara.classList.toggle('desactivado', !videoActivo);
    btnPantalla.innerHTML = ICONOS_CONTROLES.pantalla;
    btnChat.innerHTML = ICONOS_CONTROLES.chat;
    btnColgar.innerHTML = ICONOS_CONTROLES.colgar;
    btnColgar.title = esInstructor() ? 'Terminar llamada' : 'Salir de la llamada';
}

function toggleAudio() {
    audioActivo = !audioActivo;
    if (streamLocal) streamLocal.getAudioTracks().forEach(t => (t.enabled = audioActivo));
    const local = participantes.find(p => p.id === window.DATA.usuarioActual.id);
    if (local) local.audioActivo = audioActivo;
    rt.publicarEstado({ audio: audioActivo, video: videoActivo });
    renderizarControles();
    renderizarParticipantes();
}

function toggleVideo() {
    videoActivo = !videoActivo;
    if (streamLocal) streamLocal.getVideoTracks().forEach(t => (t.enabled = videoActivo));
    const local = participantes.find(p => p.id === window.DATA.usuarioActual.id);
    if (local) local.videoActivo = videoActivo;
    rt.publicarEstado({ audio: audioActivo, video: videoActivo });
    renderizarControles();
    renderizarParticipantes();
}

function compartirPantalla() {
    // [API] En producción con getDisplayMedia y re-negociación de peers
    alert('📺 Simulación: compartir pantalla activada.');
}

// ---------- TEMPORIZADOR ----------
function iniciarTemporizador() {
    segundos = 0;
    clearInterval(intervalTemporizador);
    intervalTemporizador = setInterval(() => {
        segundos++;
        const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
        const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
        const s = String(segundos % 60).padStart(2, '0');
        lblTiempo.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

// ---------- CHAT ----------
function renderizarChat() {
    chatMensajes.innerHTML = mensajesChat.map(m => {
        const propio = m.autor === window.DATA.usuarioActual.nombre;
        return `<div class="chat-burbuja ${propio ? 'propio' : ''}">
            <div class="chat-autor">${escapar(m.autor)}</div>
            <div class="chat-texto">${escapar(m.contenido)}</div>
            <span class="chat-hora">${formatearHora(m.fecha)}</span>
        </div>`;
    }).join('');
    chatMensajes.scrollTop = chatMensajes.scrollHeight;
}

function abrirChat() {
    chatAbierto = true;
    modalChat.classList.remove('hidden');
    renderizarChat();
    setTimeout(() => chatInput.focus(), 50);
}

function cerrarChat() { chatAbierto = false; modalChat.classList.add('hidden'); }

// ---------- SALIR / TERMINAR ----------
function salirLlamada() {
    detenerLlamada();
    rt.salir();                       // [WebSocket] notificar salida
    vistaLlamada.classList.add('hidden');
    vistaEspera.classList.remove('hidden');
    participantes = [];
    renderizarEspera();
}

function terminarLlamada() {
    if (!esInstructor()) return;
    detenerLlamada();
    rt.terminar();                    // [WebSocket] cierre para todos
    window.DATA.videollamada.estado = 'finalizada';
    overlayConectando.classList.remove('hidden');
    overlayConectando.innerHTML = `
        <div class="card text-center p-10">
            <h3 class="text-2xl font-bold text-[#1A3B5C] mb-2">📞 Llamada finalizada</h3>
            <p class="text-sm text-gray-500">La sesión terminó para todos los participantes.</p>
        </div>`;
    setTimeout(() => { window.location.href = './dashboard.html'; }, 2500);
}

// La sala se cierra de forma remota (otro instructor la terminó)
function salaFinalizadaRemota() {
    detenerLlamada();
    vistaLlamada.classList.add('hidden');
    vistaEspera.classList.remove('hidden');
    participantes = [];
    renderizarEspera();
    alert('La llamada fue finalizada por el instructor.');
}

// Limpieza común
function detenerLlamada() {
    enLlamada = false;
    clearInterval(intervalTemporizador);
    lblTiempo.textContent = '00:00:00';
    try { rt.salir(); } catch (e) { /* noop */ }
    detenerRecursosLocal();
}

// ---------- CONECTANDO (overlay) ----------
function mostrarConectando() {
    overlayConectando.classList.remove('hidden');
    overlayConectando.innerHTML = `
        <div class="card text-center p-10">
            <div class="spinner-conectando mb-4"></div>
            <h3 class="text-xl font-bold text-[#1A3B5C] mb-1">Conectando...</h3>
            <p class="text-sm text-gray-500">Estableciendo conexión segura con la sala.</p>
        </div>`;
}

function ocultarConectando() { overlayConectando.classList.add('hidden'); }

// ---------- SUSCRIPCIÓN A EVENTOS DEL SERVICIO ----------
function suscribirEventos() {
    rt.on('participantes', (lista) => {
        participantes = lista.map(p => ({ ...p }));
        renderizarParticipantes();
    });

    rt.on('entra', (p) => {
        if (!participantes.some(x => x.id === p.id)) participantes.push({ ...p });
        renderizarParticipantes();
    });

    rt.on('sale', (id) => {
        participantes = participantes.filter(p => p.id !== id);
        const s = streamsRemotos[id]; if (s && s.getTracks) s.getTracks().forEach(t => t.stop());
        delete streamsRemotos[id];
        renderizarParticipantes();
    });

    rt.on('chat', (doc) => {
        mensajesChat.push(doc);
        if (chatAbierto) renderizarChat();
    });

    rt.on('finalizada', () => salaFinalizadaRemota());

    rt.on('streamRemoto', ({ participanteId, stream }) => {
        streamsRemotos[participanteId] = stream;
        renderizarParticipantes();
    });

    rt.on('desconectado', () => {
        console.warn('Se perdió la conexión con el servidor.');
    });
}

// ---------- EVENTOS UI ----------
btnMicrofono.addEventListener('click', toggleAudio);
btnCamara.addEventListener('click', toggleVideo);
btnPantalla.addEventListener('click', compartirPantalla);
btnChat.addEventListener('click', abrirChat);
btnCerrarChat.addEventListener('click', cerrarChat);
modalChat.addEventListener('click', (e) => { if (e.target === modalChat) cerrarChat(); });

btnColgar.addEventListener('click', () => {
    if (esInstructor()) terminarLlamada();
    else salirLlamada();
});

formChat.addEventListener('submit', (e) => {
    e.preventDefault();
    const contenido = chatInput.value.trim();
    if (!contenido) return;
    rt.enviarChat(contenido);      // [WebSocket] lo propaga el servicio
    chatInput.value = '';
});

// ---------- INICIALIZACIÓN ----------
function initVideollamada() {
    userAvatar.textContent = iniciales(window.DATA.usuarioActual.nombre);
    mensajesChat = rt.obtenerMensajesChatIniciales();
    suscribirEventos();
    renderizarEspera();
    renderizarControles();
    console.log(`[RealTime] modo activo: ${rt._modo}`);
}

document.addEventListener('DOMContentLoaded', initVideollamada);