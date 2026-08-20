const STATUS = {
    APROBADA: 'aprobada',
    NO_APROBADA: 'no_aprobada',
    PENDIENTE: 'pendiente',
    ELIMINAR: 'eliminar'
};

const MODAL_TITLES = {
    [STATUS.APROBADA]: 'Aprobar idea',
    [STATUS.NO_APROBADA]: 'No aprobar idea',
    [STATUS.PENDIENTE]: 'Aún procesando'
};

const MODAL_SUBTITLES = {
    [STATUS.APROBADA]: 'La idea será marcada como aprobada. Puedes agregar observaciones (opcional).',
    [STATUS.NO_APROBADA]: 'La idea será marcada como no aprobada. El motivo es obligatorio para notificar al profesor.',
    [STATUS.PENDIENTE]: 'La idea quedará en procesamiento. Puedes agregar observaciones (opcional).'
};

let currentFilter = 'todas';
let modalAction = null;

document.addEventListener('DOMContentLoaded', function () {
    const user = window.currentUser || { name: "Admin Usuario", role: "ADMINISTRADOR" };

    document.getElementById('dashboardTitle').textContent = `Bienvenido, ${user.name.split(' ')[0]}`;
    document.getElementById('userAvatar').textContent = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) {
        currentDateEl.textContent = new Date().toLocaleDateString('es-ES', options);
    }

    renderProposals();

    window.addEventListener('storage', function (event) {
        if (event.key === 'courseIdeas') {
            renderProposals();
        }
    });

    window.addEventListener('pageshow', renderProposals);
    window.addEventListener('focus', renderProposals);

    const container = document.getElementById('proposalsContainer');
    if (container) {
        container.addEventListener('click', onCardAction);
    }

    document.querySelectorAll('#proposalFilters .filter-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            currentFilter = btn.getAttribute('data-filter') || 'todas';
            document.querySelectorAll('#proposalFilters .filter-btn').forEach(function (b) {
                b.classList.remove('active-filter');
            });
            btn.classList.add('active-filter');
            renderProposals();
        });
    });

    document.getElementById('statusModalConfirm')?.addEventListener('click', confirmModal);
    document.getElementById('statusModalCancel')?.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });
    const modal = document.getElementById('statusModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
    }

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

function esc(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getIdeas() {
    return JSON.parse(localStorage.getItem('courseIdeas') || '[]');
}

function ideaStatus(idea) {
    return idea.status || STATUS.PENDIENTE;
}

function getStatusMeta(status) {
    if (status === STATUS.APROBADA) {
        return { label: 'Aprobada', badge: 'bg-green-100 text-green-700' };
    }
    if (status === STATUS.NO_APROBADA) {
        return { label: 'No aprobada', badge: 'bg-red-100 text-red-700' };
    }
    return { label: 'Pendiente', badge: 'bg-amber-100 text-amber-700' };
}

function renderProposals() {
    const container = document.getElementById('proposalsContainer');
    const empty = document.getElementById('proposalsEmpty');
    if (!container) return;

    const ideas = getIdeas().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    updateFilterCounts(ideas);

    const filtered = currentFilter === 'todas'
        ? ideas
        : ideas.filter(i => ideaStatus(i) === currentFilter);

    if (!filtered.length) {
        container.innerHTML = '';
        empty.textContent = ideas.length
            ? 'No hay propuestas con ese estado.'
            : 'Aún no hay propuestas enviadas por los instructores.';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    container.innerHTML = filtered.map(renderCard).join('');
}

function updateFilterCounts(ideas) {
    const counts = {
        todas: ideas.length,
        pendiente: ideas.filter(i => ideaStatus(i) === STATUS.PENDIENTE).length,
        aprobada: ideas.filter(i => ideaStatus(i) === STATUS.APROBADA).length,
        no_aprobada: ideas.filter(i => ideaStatus(i) === STATUS.NO_APROBADA).length
    };
    document.getElementById('filterTodasCount').textContent = `(${counts.todas})`;
    document.getElementById('filterPendienteCount').textContent = `(${counts.pendiente})`;
    document.getElementById('filterAprobadaCount').textContent = `(${counts.aprobada})`;
    document.getElementById('filterNoAprobadaCount').textContent = `(${counts.no_aprobada})`;
}

function renderCard(idea) {
    const status = ideaStatus(idea);
    const meta = getStatusMeta(status);
    const dateText = new Date(idea.updatedAt || idea.createdAt).toLocaleDateString('es-ES');

    const canChange = status === STATUS.PENDIENTE;
    const statusButtons = canChange ? [
        { action: STATUS.APROBADA, label: 'Aprobada', active: 'bg-green-600 text-white border-green-600', normal: 'bg-green-100 text-green-700 border-green-300' },
        { action: STATUS.NO_APROBADA, label: 'No aprobada', active: 'bg-red-600 text-white border-red-600', normal: 'bg-red-100 text-red-700 border-red-300' },
        { action: STATUS.PENDIENTE, label: 'Pendiente', active: 'bg-amber-500 text-white border-amber-500', normal: 'bg-amber-100 text-amber-700 border-amber-300' }
    ].map(function (b) {
        const isActive = status === b.action;
        const cls = isActive ? b.active : b.normal;
        return `<button type="button" data-action="${b.action}" data-id="${idea.id}" class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${cls}">${b.label}</button>`;
    }).join('') : '';

    return `
        <div class="card">
            <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-1 rounded-lg text-xs font-semibold ${meta.badge}">${meta.label}</span>
                <span class="text-xs text-gray-500">${dateText}</span>
            </div>
            <h3 class="font-bold text-[#1A3B5C] mb-2 line-clamp-2">${esc(idea.title)}</h3>
            <p class="text-sm text-gray-600 mb-4 line-clamp-3">${esc(idea.desc)}</p>
            <p class="text-xs text-gray-500">Contacto: ${esc(idea.contact)}</p>
            <p class="text-xs text-gray-500 mt-1">Teléfono: ${esc(idea.phone || 'No registrado')}</p>
            <p class="text-xs text-gray-500 mt-1">Instructor: ${esc(idea.instructorName || 'Instructor')}</p>
            ${idea.adminMessage ? `<p class="text-sm text-gray-700 mt-3 p-3 bg-[#F7F9FC] rounded-lg"><strong>Observaciones:</strong> ${esc(idea.adminMessage)}</p>` : ''}
            <div class="flex flex-wrap items-center gap-2 mt-4">
                ${canChange ? '' : '<span class="text-xs font-semibold text-gray-500">Decisión final, no modificable</span>'}
                ${statusButtons}
                <button type="button" data-action="${STATUS.ELIMINAR}" data-id="${idea.id}" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-300 hover:bg-red-600 hover:text-white transition">Eliminar</button>
            </div>
        </div>`;
}

function onCardAction(event) {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;

    const id = Number(btn.getAttribute('data-id'));
    const action = btn.getAttribute('data-action');

    if (action === STATUS.ELIMINAR) {
        if (confirm('¿Estás seguro de que deseas eliminar esta propuesta?')) {
            updateIdeaStatus(id, STATUS.ELIMINAR, '');
        }
        return;
    }

    openModal(id, action);
}

function openModal(id, action) {
    modalAction = { id, action };

    const title = document.getElementById('statusModalTitle');
    const subtitle = document.getElementById('statusModalSubtitle');
    const error = document.getElementById('statusModalError');
    const msg = document.getElementById('statusMessage');

    if (title) title.textContent = MODAL_TITLES[action] || '';
    if (subtitle) subtitle.textContent = MODAL_SUBTITLES[action] || '';
    if (error) error.classList.add('hidden');
    if (msg) {
        msg.value = '';
        setTimeout(() => msg.focus(), 50);
    }

    const modal = document.getElementById('statusModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeModal() {
    const modal = document.getElementById('statusModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    modalAction = null;
}

function confirmModal() {
    if (!modalAction) return;

    const { id, action } = modalAction;
    const msg = document.getElementById('statusMessage').value.trim();
    const error = document.getElementById('statusModalError');

    if (action === STATUS.NO_APROBADA && !msg) {
        if (error) error.classList.remove('hidden');
        return;
    }

    updateIdeaStatus(id, action, msg);
    closeModal();
}

function updateIdeaStatus(id, action, message) {
    const ideas = getIdeas();
    const idx = ideas.findIndex(i => Number(i.id) === Number(id));
    if (idx === -1) return;

    const current = ideaStatus(ideas[idx]);
    if (action !== STATUS.ELIMINAR && (current === STATUS.APROBADA || current === STATUS.NO_APROBADA)) {
        return;
    }

    if (action === STATUS.ELIMINAR) {
        ideas.splice(idx, 1);
    } else {
        ideas[idx].status = action;
        ideas[idx].adminMessage = message || '';
        ideas[idx].updatedAt = new Date().toISOString();
    }

    localStorage.setItem('courseIdeas', JSON.stringify(ideas));
    renderProposals();
}

function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        window.location.href = './login.html';
    }
}