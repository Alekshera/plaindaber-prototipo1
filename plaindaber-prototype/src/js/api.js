import './data.js';

/* ============================================================
   PLAINDABER - CAPA DE ACCESO A DATOS (api.js)
   Modo mock: resuelve contra window.DATA (base de datos simulada).
   Cuando el backend (Spring Boot) esté listo, solo se cambian
   estas funciones por fetch reales. El resto de la app no cambia.
   ============================================================ */

const API_BASE = 'http://localhost:8080/api';

export const api = {
    /* ---------- USUARIO ---------- */
    obtenerUsuarioActual: () => Promise.resolve(window.DATA.usuarioActual),

    /* ---------- CURSOS ---------- */
    obtenerCatalogoCursos: () => Promise.resolve(window.DATA.cursos),
    obtenerCurso: (cursoId) => {
        const curso = window.DATA.cursos.find(c => c.id === Number(cursoId));
        return Promise.resolve(curso || null);
    },

    /* ---------- MÓDULOS (Router de Actividades) ---------- */
    obtenerModulos: (cursoId) =>
        Promise.resolve(window.DATA.modulos[Number(cursoId)] || []),
    obtenerModulo: (cursoId, moduloId) => {
        const modulos = window.DATA.modulos[Number(cursoId)] || [];
        return Promise.resolve(modulos.find(m => m.id === Number(moduloId)) || null);
    },

    /* ---------- PROGRESO ---------- */
    obtenerProgreso: (cursoId) =>
        Promise.resolve(window.DATA.progreso[String(cursoId)] || null),
    actualizarProgreso: (cursoId, progreso) => {
        window.DATA.progreso[String(cursoId)] = progreso;
        return Promise.resolve(progreso);
    },

    /* ---------- ACTIVIDADES ---------- */
    registrarResultadoActividad: (cursoId, moduloId, idContenido, resultado) => {
        const modulo = window.DATA.modulos[Number(cursoId)].find(m => m.id === Number(moduloId));
        if (!modulo) return Promise.resolve(null);
        const contenido = modulo.contenidos.find(c => c.id === Number(idContenido));
        if (!contenido) return Promise.resolve(null);
        contenido.puntajeObtenido = resultado.puntaje;
        contenido.estado = resultado.exito ? 'completada' : 'intento';
        return Promise.resolve(contenido);
    },

    /* ---------- FORO ---------- */
    obtenerHilos: () => Promise.resolve(window.DATA.foro.hilos),

    /* ---------- VIDEORRECURSOS ---------- */
    obtenerParticipantesSala: (salaId) =>
        Promise.resolve(window.DATA.videollamada.sala.participantes || []),

    /* Aquí vendrá la versión real con fetch:
       obtenerCursos: () => fetch(`${API_BASE}/cursos`).then(res => res.json()),
       ... */
};