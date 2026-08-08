/* ============================================================
   PLAINDABER - RealTimeService (realtime.js)
   ------------------------------------------------------------------
   CAPA DE ABSTRACCIÓN PARA EL TIEMPO REAL DE LA VIDELLAMADA.

   Aísla toda la lógica de tiempo real (presencia, chat, señalización
   WebRTC) detrás de una interfaz única. La capa de presentación
   (videollamada.js) NO sabe si usa simulación o un servidor real.

   CUÁNDO LISTE EL BACKEND REAL (Spring Boot + WebSocket/STOMP o socket.io):
      1. Cambia `window.REALTIME_CONFIG.modo = 'socket.io'`.
      2. Ajusta `socketUrl` a tu endpoint.
      3. Implementa el lado servidor de los eventos documentados abajo.
   La UI no cambia: usa los mismos métodos y eventos.

   Contrato (métodos públicos de RealTimeService):
   - conectar()                        -> Promise<void>
   - desconectar()
   - unirse(usuario, llamadaId)        -> Promise<void>
   - salir()
   - terminar()                        (solo instructor/admin)
   - publicarEstado({audio, video})   (broadcast de mic/cámara)
   - establecerStreamLocal(stream)     (video local WebRTC)
   - enviarChat(texto)
   - obtenerParticipantesEspera()      -> lista para la vista previa
   - obtenerMensajesChatIniciales()    -> historial de chat
   - esSimulacion                      -> bool

   Eventos (registrar con rt.on(nombre, fn)):
     'participantes' (lista)    estado completo de la sala
     'entra'         (participante)
     'sale'          (participanteId)
     'chat'          ({autor, contenido, fecha})
     'finalizada'    ()          llamada cerrada por el instructor
     'streamRemoto'  ({participanteId, stream})
     'desconectado'  ()
   ============================================================ */

window.REALTIME_CONFIG = {
    modo: 'simulacion',                          // 'simulacion' | 'socket.io'
    socketUrl: (window.VITE_SOCKET_URL) || 'http://localhost:8080/ws',
    forceNew: true
};

// ---------- EMISOR (pub/sub interno) ----------
function crearEmisor() {
    const listeners = {};
    return {
        on(evt, fn) {
            (listeners[evt] = listeners[evt] || []).push(fn);
            return () => { listeners[evt] = (listeners[evt] || []).filter(f => f !== fn); };
        },
        emitir(evt, dato) {
            (listeners[evt] || []).forEach(fn => { try { fn(dato); } catch (e) { console.error(e); } });
        }
    };
}

// ============================================================
// IMPLEMENTACIÓN 1: SIMULACIÓN (por defecto)
// ============================================================
function crearSimulacion(emisor, config) {
    const participantes = [
        { id: 2, nombre: 'Carlos Pérez', rol: 'INSTRUCTOR', audioActivo: true, videoActivo: true, esLocal: false },
        { id: 3, nombre: 'Anna Fudalej', rol: 'ESTUDIANTE', audioActivo: false, videoActivo: true, esLocal: false },
        { id: 4, nombre: 'Maciej Nowak', rol: 'ESTUDIANTE', audioActivo: true, videoActivo: false, esLocal: false },
        { id: 5, nombre: 'Piotrek Kowalski', rol: 'ESTUDIANTE', audioActivo: true, videoActivo: true, esLocal: false }
    ];
    const piscina = [
        { id: 6, nombre: 'María Gómez', rol: 'ESTUDIANTE' },
        { id: 7, nombre: 'Lucas Fernández', rol: 'ESTUDIANTE' },
        { id: 8, nombre: 'Elena Ruiz', rol: 'ADMINISTRADOR' },
        { id: 9, nombre: 'Jorge Torres', rol: 'ESTUDIANTE' }
    ];
    const mensajes = [
        { autor: 'Carlos Pérez', contenido: '¡Hola a todos! Bienvenidos a la sesión de hoy.', fecha: new Date().toISOString() },
        { autor: 'Anna Fudalej', contenido: 'Hola profe, ¿escuchamos bien?', fecha: new Date().toISOString() }
    ];

    let simInterval = null;
    let localId = null;

    return {
        esSimulacion: true,

        obtenerParticipantesEspera() {
            return participantes.map(p => ({ ...p }));
        },

        conectar() {
            return Promise.resolve();
        },

        unirse(usuario, llamadaId) {
            if (!participantes.some(p => p.id === usuario.id)) {
                participantes.push({ ...usuario, audioActivo: true, videoActivo: true, esLocal: true });
            }
            localId = usuario.id;
            emisor.emitir('participantes', participantes.map(p => ({ ...p })));

            clearInterval(simInterval);
            simInterval = setInterval(() => {
                const aleatorio = Math.random();
                const candidatos = piscina.filter(p => !participantes.some(x => x.id === p.id));
                if (aleatorio < 0.6 && candidatos.length) {
                    const nuevo = { ...candidatos[Math.floor(Math.random() * candidatos.length)], audioActivo: true, videoActivo: true, esLocal: false };
                    participantes.push(nuevo);
                    emisor.emitir('entra', { ...nuevo });
                } else if (participantes.length > 1) {
                    const salibles = participantes.filter(p => !p.esLocal);
                    if (salibles.length) {
                        const elegido = salibles[Math.floor(Math.random() * salibles.length)];
                        participantes.splice(participantes.findIndex(p => p.id === elegido.id), 1);
                        emisor.emitir('sale', elegido.id);
                    }
                }
            }, 10000 + Math.floor(Math.random() * 5000));

            return Promise.resolve();
        },

        salir() {
            clearInterval(simInterval);
            simInterval = null;
            if (localId != null) {
                participantes.splice(participantes.findIndex(p => p.id === localId), 1);
                emisor.emitir('sale', localId);
                localId = null;
            }
        },

        terminar() {
            clearInterval(simInterval);
            simInterval = null;
            emisor.emitir('finalizada');
        },

        publicarEstado() {
            // simulación: no propaga estados entre clientes
        },

        establecerStreamLocal() {
            // el video local lo maneja la presentación; la simulación lo ignora
        },

        enviarChat(texto) {
            const doc = {
                autor: (window.DATA && window.DATA.usuarioActual && window.DATA.usuarioActual.nombre) || 'Usuario',
                contenido: texto,
                fecha: new Date().toISOString()
            };
            mensajes.push(doc);
            emisor.emitir('chat', doc);
        },

        obtenerMensajesChatIniciales() {
            return mensajes.map(m => ({ ...m }));
        }
    };
}

// ============================================================
// IMPLEMENTACIÓN 2: socket.io + simple-peer (backend real)
// ============================================================
// Convención de eventos en el servidor (socket.io):
//
//   cliente -> servidor                payload
//   ------------------------------------------------
//   'llamada:unirse'           { roomId, usuario }
//   'llamada:salir'            usuarioId
//   'llamada:terminar'         (instructor)
//   'llamada:chat'             { autor, contenido }
//   'llamada:estado'           { participanteId, audio, video }
//   'señal:enviar'             { para, señal }   (simple-peer offer/answer/ICE)
//
//   servidor -> cliente        payload
//   ------------------------------------------------
//   'llamada:participantes'      [ {id,nombre,rol} ]
//   'llamada:participante-nuevo'  participante
//   'llamada:participante-sale'   participanteId
//   'llamada:chat-recibir'        { autor, contenido, fecha }
//   'llamada:finalizada'
//   'señal:recibir'             { desde, señal }
function crearRealtimeSocketIo(emisor, cfg) {
    const peers = new Map();          // participanteId -> SimplePeer
    let socket = null;
    let streamLocal = null;
    let misDatos = null;

    function escucharScript(src) {
        return new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = res;
            s.onerror = () => rej(new Error('No se pudo cargar ' + src));
            document.head.appendChild(s);
        });
    }

    async function asegurarLibrerias() {
        if (!window.io) await escucharScript('https://cdn.socket.io/4.7.5/socket.io.min.js');
        if (!window.Peer) await escucharScript('https://unpkg.com/simple-peer@9.11.1/simplepeer.min.js');
    }

    function crearPeerCon(idRemoto, initiator) {
        if (peers.has(idRemoto)) return;
        const peer = new window.Peer({ initiator, trickle: false, stream: streamLocal, objectMode: true });
        peers.set(idRemoto, peer);

        peer.on('signal', (señal) => socket.emit('señal:enviar', { para: idRemoto, señal }));
        peer.on('stream', (streamRemoto) =>
            emisor.emitir('streamRemoto', { participanteId: idRemoto, stream: streamRemoto })
        );
        peer.on('error', (err) => console.warn('[Realtime] peer', idRemoto, err.message));

        return peer;
    }

    function manejarSenal(desde, señal) {
        let peer = peers.get(desde);
        if (!peer) {
            // Otro cliente nos envía su oferta: contestar (initiator=false)
            peer = crearPeerCon(desde, false);
        }
        peer.signal(señal);
    }

    return {
        esSimulacion: false,

        obtenerParticipantesEspera() {
            return []; // la lista llega tras conectar (llamada:participantes)
        },

        async conectar() {
            await asegurarLibrerias();
            socket = window.io(cfg.socketUrl, { forceNew: cfg.forceNew !== false });

            socket.on('llamada:participantes', (lista) => {
                emisor.emitir('participantes', lista);
                // Con los ya presentes y el stream local listo, crear una conexión por cada uno
                if (streamLocal && misDatos) {
                    lista.forEach(p => { if (p.id !== misDatos.id) crearPeerCon(p.id, true); });
                }
            });
            socket.on('llamada:participante-nuevo', (p) => {
                emisor.emitir('entra', p);
                if (misDatos && p.id !== misDatos.id && streamLocal) {
                    crearPeerCon(p.id, true);
                }
            });
            socket.on('llamada:participante-sale', (id) => {
                const peer = peers.get(id);
                if (peer) { peer.destroy(); peers.delete(id); }
                emisor.emitir('sale', id);
            });
            socket.on('llamada:chat-recibir', (doc) => emisor.emitir('chat', doc));
            socket.on('llamada:finalizada', () => emisor.emitir('finalizada'));
            socket.on('llamada:estado-recibir', () => { /* actualizar iconos en futura versión */ });
            socket.on('señal:recibir', ({ desde, señal }) => manejarSenal(desde, señal));
            socket.on('disconnect', () => emisor.emitir('desconectado'));
        },

        async unirse(usuario, llamadaId) {
            misDatos = usuario;
            socket.emit('llamada:unirse', { roomId: llamadaId, usuario });
        },

        salir() {
            peers.forEach(p => p.destroy());
            peers.clear();
            if (socket && misDatos) socket.emit('llamada:salir', misDatos.id);
        },

        terminar() {
            if (socket) socket.emit('llamada:terminar');
        },

        publicarEstado({ audio, video }) {
            if (socket && misDatos) {
                socket.emit('llamada:estado', { participanteId: misDatos.id, audio, video });
            }
        },

        establecerStreamLocal(stream) {
            streamLocal = stream;
        },

        enviarChat(texto) {
            if (socket && misDatos) {
                socket.emit('llamada:chat', { autor: misDatos.nombre, contenido: texto });
            }
        },

        obtenerMensajesChatIniciales() {
            return []; // [API] GET /videollamadas/{id}/chat desde el servidor
        }
    };
}

// ============================================================
// FACTORÍA: elige la implementación según la configuración
// ============================================================
function crearRealTimeService() {
    const emisor = crearEmisor();
    const cfg = window.REALTIME_CONFIG || {};
    const servicio = (cfg.modo === 'socket.io')
        ? crearRealtimeSocketIo(emisor, cfg)
        : crearSimulacion(emisor, cfg);

    return Object.assign(servicio, {
        on: emisor.on,
        _modo: servicio.esSimulacion ? 'simulacion' : 'socket.io'
    });
}

window.RealtimeService = crearRealTimeService();