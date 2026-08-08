/* ============================================================
   PLAINDABER - Cursos
   Renderiza, filtra y gestiona la inscripción de cursos.
   ============================================================ */

// ---------- DATOS MOCK ----------
window.DATA = {
    cursos: [
        { id: 1, titulo: 'Introducción a la Lectura del Arhuaco', descripcion: 'Aprende el alfabeto y la fonética básica del idioma ancestral arhuaco.', areaSaber: 'Idiomas', instructor: 'Carlos Pérez', duracionHoras: 12, numModulos: 6, estadoInscripcion: 'construccion', progreso: 45, imagen: '/plaindaber-prototipo1/Arhuacolandia.jpg' },
        { id: 2, titulo: 'Emprende tu Tienda en Línea', descripcion: 'Crea y lanza tu propio comercio electrónico desde cero sin conocimientos previos.', areaSaber: 'Comercio', instructor: 'María Gómez', duracionHoras: 18, numModulos: 8, estadoInscripcion: 'construccion', progreso: 10 },
        { id: 8, titulo: 'Fundamentos de Programación', descripcion: 'Introducción a la lógica, algoritmos y estructuras de datos esenciales.', areaSaber: 'Tecnología', instructor: 'Andrés Rodríguez', duracionHoras: 24, numModulos: 10, estadoInscripcion: 'construccion', progreso: 100 },
        { id: 4, titulo: 'Cocina Saludable para la Familia', descripcion: 'Recetas nutritivas y técnicas para una alimentación equilibrada.', areaSaber: 'Salud', instructor: 'Lucía Martínez', duracionHoras: 9, numModulos: 4, estadoInscripcion: 'construccion', progreso: 0 },
        { id: 5, titulo: 'Historia del Arte Colombiano', descripcion: 'Recorre las corrientes artísticas y sus principales exponentes.', areaSaber: 'Arte', instructor: 'Jorge Torres', duracionHoras: 15, numModulos: 7, estadoInscripcion: 'construccion', progreso: 100 },
        { id: 6, titulo: 'Bienes raíces y proyectos inmobiliarios', descripcion: 'Aprende a invertir en propiedades inmobiliarias.', areaSaber: 'Economía', instructor: 'Elena Ruiz', duracionHoras: 8, numModulos: 4, estadoInscripcion: 'construccion', progreso: 35, imagen: '/plaindaber-prototipo1/inmobiliaria.jpg' },
        { id: 7, titulo: 'Fotografía con tu Celular', descripcion: 'Domina la composición, luz y edición básica desde tu móvil.', areaSaber: 'Arte', instructor: 'Andrés Rodríguez', duracionHoras: 10, numModulos: 5, estadoInscripcion: 'construccion', progreso: 0 },
        { id: 3, titulo: 'Huertas Orgánicas en la Ciudad', descripcion: 'Cultiva tus propios alimentos en espacios urbanos reducidos.', areaSaber: 'Ecología', instructor: 'Carlos Pérez', duracionHoras: 14, numModulos: 6, estadoInscripcion: null, progreso: 0, paginaDisponible: true, imagen: '/plaindaber-prototipo1/Huerta%20Urbana.png' },
        { id: 9, titulo: 'Inteligencia Artificial Aplicada', descripcion: 'Usa herramientas de IA para mejorar tu productividad diaria.', areaSaber: 'Tecnología', instructor: 'María Gómez', duracionHoras: 20, numModulos: 9, estadoInscripcion: 'construccion', progreso: 0 }
    ]
};

// ---------- REFERENCIAS AL DOM ----------
const coursesGrid = document.getElementById('coursesGrid');
const searchInput = document.getElementById('searchInput');
const areaSelect = document.getElementById('areaSelect');
const stateSelect = document.getElementById('stateSelect');
const resultsCount = document.getElementById('resultsCount');
const emptyState = document.getElementById('emptyState');

// Modal e inscripción
const enrollModal = document.getElementById('enrollModal');
const modalCourseName = document.getElementById('modalCourseName');
const confirmEnrollBtn = document.getElementById('confirmEnrollBtn');
const cancelEnrollBtn = document.getElementById('cancelEnrollBtn');
const toast = document.getElementById('toast');

// Curso pendiente de confirmar inscripción
let pendingCourse = null;

// ---------- CONFIGURACIÓN DE ÁREAS (colores) ----------
const areaThemes = {
    'Idiomas':     { color: '#1A3B5C', icono: '💬' },
    'Comercio':    { color: '#7B1FA2', icono: '🛒' },
    'Tecnología':  { color: '#2D5A7B', icono: '💻' },
    'Salud':       { color: '#43A047', icono: '🌿' },
    'Arte':        { color: '#FFB74D', icono: '🎨' },
    'Economía':    { color: '#2E7D32', icono: '📈' },
    'Ecología':    { color: '#43A047', icono: '🌱' }
};

const colorFondo = '#EDE9E1';
const colorPrimario = '#1A3B5C';

// ---------- INICIALIZACIÓN ----------
function initCursos() {
    // Rellenar select de áreas dinámicamente
    const areasBase = ['Comercio', 'Tecnología', 'Salud', 'Arte', 'Idiomas', 'Economía', 'Ecología'];
    const areas = [...new Set([
        ...areasBase,
        ...window.DATA.cursos.map(c => c.areaSaber)
    ])].sort();
    areas.forEach(area => {
        const opt = document.createElement('option');
        opt.value = area;
        opt.textContent = area;
        areaSelect.appendChild(opt);
    });

    // Configurar página según rol
    const storedRole = localStorage.getItem('userRole');
    const roleLabel = {
        ESTUDIANTE: 'Estudiante',
        INSTRUCTOR: 'Instructor',
        ADMINISTRADOR: 'Administrador'
    }[storedRole] || 'Estudiante';
    document.getElementById('pageSubtitle').textContent =
        `Explora y gestiona cursos · ${roleLabel}`;

    // Eventos de filtro reactivos
    searchInput.addEventListener('input', applyFilters);
    areaSelect.addEventListener('change', applyFilters);
    stateSelect.addEventListener('change', applyFilters);

    // Acciones del modal
    cancelEnrollBtn.addEventListener('click', closeModal);
    enrollModal.addEventListener('click', e => { if (e.target === enrollModal) closeModal(); });
    confirmEnrollBtn.addEventListener('click', confirmEnrollment);

    renderCursos(window.DATA.cursos);
}

// ---------- FILTRADO ----------
function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const area = areaSelect.value;
    const state = stateSelect.value;

    const filtrados = window.DATA.cursos.filter(curso => {
        // Filtro por texto
        const coincideTexto = !query
            || curso.titulo.toLowerCase().includes(query)
            || curso.descripcion.toLowerCase().includes(query);

        // Filtro por área
        const coincideArea = area === 'todas' || curso.areaSaber === area;

        // Filtro por estado
        let coincideEstado = true;
        if (state === 'inscrito') coincideEstado = curso.estadoInscripcion === 'en_progreso' || curso.estadoInscripcion === 'inscrito';
        else if (state === 'disponible') coincideEstado = curso.estadoInscripcion === null && curso.paginaDisponible;
        else if (state === 'completado') coincideEstado = curso.estadoInscripcion === 'completado';
        else if (state === 'construccion') coincideEstado = !curso.paginaDisponible;

        return coincideTexto && coincideArea && coincideEstado;
    });

    renderCursos(filtrados);
}

// ---------- RENDER DE TARJETAS ----------
// Orden deseado por estado: Disponible, Inscrito, Completado, En construcción
function ordenRango(curso) {
    switch (curso.estadoInscripcion) {
        case 'completado':  return 2;
        case 'construccion': return 3;
        case 'inscrito':
        case 'en_progreso': return 1;
        default:            return 0; // Disponible
    }
}

function renderCursos(lista) {
    const ordenada = [...lista].sort((a, b) => ordenRango(a) - ordenRango(b));
    coursesGrid.innerHTML = ordenada.map(cursoTarjeta).join('');
    resultsCount.textContent =
        ordenada.length === 1 ? 'Mostrando 1 curso' : `Mostrando ${ordenada.length} cursos`;

    emptyState.classList.toggle('hidden', ordenada.length > 0);
}

function cursoTarjeta(curso) {
    const theme = areaThemes[curso.areaSaber] || { color: colorPrimario, icono: '📘' };
    const inscripto = curso.estadoInscripcion !== null;
    const completado = curso.estadoInscripcion === 'completado';
    const disponible = curso.paginaDisponible === true;

    // Determinar botón de acción según estado
    let boton = '';
    if (!disponible) {
        // Sin página de contenido aún: botón deshabilitado
        boton = `<button class="w-full py-2 rounded-xl bg-gray-200 text-gray-500 font-semibold cursor-not-allowed" disabled
                        title="Próximamente">En Construcción</button>`;
    } else if (completado) {
        boton = `<button class="w-full py-2 rounded-xl bg-green-100 text-green-700 font-semibold cursor-not-allowed" disabled>
                    ✓ Completado</button>`;
    } else if (curso.estadoInscripcion === 'inscrito' || curso.estadoInscripcion === 'en_progreso') {
        boton = `<button class="w-full py-2 rounded-xl bg-[#7B1FA2] text-white font-semibold hover:bg-[#6A118A] transition"
                        onclick="continuarCurso(${curso.id})">Continuar</button>`;
    } else {
        boton = `<button class="w-full py-2 rounded-xl border-2 border-[#7B1FA2] text-[#7B1FA2] font-semibold hover:bg-[#7B1FA2] hover:text-white transition"
                        onclick="verCurso(${curso.id})">Inscribirse</button>`;
    }

    // Barra de progreso (solo si el usuario está inscrito)
    const progreso = inscripto => inscripto
        ? `<div class="w-full bg-gray-200 rounded-full h-2 mb-4" role="progressbar" aria-valuenow="${curso.progreso}" aria-valuemin="0" aria-valuemax="100">
              <div class="bg-[#7B1FA2] h-2 rounded-full transition-all" style="width: ${curso.progreso}%"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mb-4">
                <span>Tu progreso</span><span class="font-semibold text-[#1A3B5C]">${curso.progreso}%</span>
            </div>`
        : '';

    // Etiqueta de estado en la tarjeta
    const etiquetaEstado = curso.estadoInscripcion === 'completado'
        ? '<span class="badge bg-green-100 text-green-700">Completado</span>'
        : (curso.estadoInscripcion === 'construccion'
            ? '<span class="badge bg-gray-200 text-gray-600">En Construcción</span>'
            : '<span class="badge bg-[#FFD166] text-[#1A3B5C]">Disponible</span>');

    return `
        <article class="card overflow-hidden flex flex-col ${disponible ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-80'}"
                 style="background:${colorFondo}"
                 ${disponible ? `onclick="verCurso(${curso.id})" role="button" tabindex="0" onkeydown="if(event.key==='Enter') verCurso(${curso.id})"` : ''}>
            <!-- Portada -->
            ${curso.imagen
                ? `<div class="h-40 rounded-xl mb-4 flex items-center justify-center overflow-hidden"
                     style="background: linear-gradient(135deg, ${theme.color}, ${theme.color}cc)">
                       <img src="${curso.imagen}" alt="${curso.titulo}"
                            class="w-full h-full object-cover"
                            onerror="this.style.display='none'" />
                   </div>`
                : `<div class="h-40 rounded-xl mb-4 flex items-center justify-center text-white"
                       style="background: linear-gradient(135deg, ${theme.color}, ${theme.color}cc)">
                       <span class="text-6xl opacity-90">${theme.icono}</span>
                   </div>`}

            <!-- Cabecera: título + estado -->
            <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-bold text-[#1A3B5C] leading-snug">${curso.titulo}</h3>
                ${etiquetaEstado}
            </div>

            <!-- Área + instructor -->
            <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold px-2 py-1 rounded-lg text-white" style="background:${theme['color']}">${curso.areaSaber}</span>
                <span class="text-xs text-gray-600">· ${curso.instructor}</span>
            </div>

            <!-- Descripción corta -->
            <p class="text-sm text-gray-600 mb-4">${curso.descripcion.length > 80 ? curso.descripcion.slice(0, 80) + '…' : curso.descripcion}</p>

            <!-- Metadatos -->
            <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span>📦 ${curso.numModulos} módulos</span>
                <span>⏱ ${curso.duracionHoras} horas</span>
            </div>

            <!-- Progreso y acción -->
            ${progreso(inscripto)}
            ${boton}
        </article>`;
}

// ---------- VER CURSO ----------
function verCurso(id) {
    // Redirige a la página de detalle del curso
    window.location.href = `curso_huerta.html?id=${id}`;
}

function closeModal() {
    enrollModal.classList.add('hidden');
    enrollModal.classList.remove('flex');
    pendingCourse = null;
}

function confirmEnrollment() {
    if (!pendingCourse) return;
    // Simular inscripción
    pendingCourse.estadoInscripcion = 'inscrito';
    pendingCourse.progreso = 0;
    mostrarToast(`Te inscribiste en "${pendingCourse.titulo}". ¡Éxitos!`);
    closeModal();
    applyFilters();
}

// ---------- CONTINUAR CURSO ----------
function continuarCurso(id) {
    const curso = window.DATA.cursos.find(c => c.id === id);
    window.location.href = `curso_huerta.html?id=${curso.id}`;
    // Fallback si el navegador no abrió (simulado)
    alert(`Redirigiendo a: curso_huerta.html?id=${curso.id} · ${curso.titulo}`);
}

// ---------- TOAST ----------
let toastTimeout = null;
function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ---------- ARRANQUE ----------
document.addEventListener('DOMContentLoaded', initCursos);

// ---------- EXPONER FUNCIONES AL SCOPE GLOBAL ----------
// Los onclick inline generados en el HTML necesitan estas referencias globales,
// incluso al cargar este archivo como <script type="module">.
window.verCurso = verCurso;
window.continuarCurso = continuarCurso;