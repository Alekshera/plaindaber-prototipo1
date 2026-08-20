const STATUS_APROBADA = 'aprobada';
const STATUS_NO_APROBADA = 'no_aprobada';
const STATUS_PENDIENTE = 'pendiente';
const READ_KEY = 'ideaNotifRead';

document.addEventListener('DOMContentLoaded', function () {
    const user = window.currentUser || { name: "Dr. Carlos Pérez", role: "INSTRUCTOR" };

    document.getElementById('dashboardTitle').textContent = `Bienvenido, ${user.name.split(' ')[0]}`;
    document.getElementById('userAvatar').textContent = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) {
        currentDateEl.textContent = new Date().toLocaleDateString('es-ES', options);
    }

    const form = document.getElementById('courseIdeaForm');
    if (form) {
        form.addEventListener('submit', submitCourseIdea);
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetCourseIdea);
    }

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    renderIdeaStatus();

    window.addEventListener('storage', function (event) {
        if (event.key === 'courseIdeas' || event.key === READ_KEY) {
            renderIdeaStatus();
        }
    });

    window.addEventListener('pageshow', renderIdeaStatus);
    window.addEventListener('focus', renderIdeaStatus);

    const notifContainer = document.getElementById('ideaNotifications');
    if (notifContainer) {
        notifContainer.addEventListener('click', function (e) {
            const single = e.target.closest('[data-mark-read]');
            if (single) {
                markIdeaRead(Number(single.getAttribute('data-mark-read')));
                return;
            }
            if (e.target.closest('[data-mark-all-read]')) {
                markAllRead();
            }
        });
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

function submitCourseIdea(event) {
    event.preventDefault();

    const title = document.getElementById('ideaTitle').value;
    const desc = document.getElementById('ideaDesc').value;
    const category = document.getElementById('ideaCategory').value;
    const contact = document.getElementById('ideaContact').value;
    const phone = document.getElementById('ideaPhone').value;

    if (!title || !desc || !category || !contact || !phone) return;

    const ideas = JSON.parse(localStorage.getItem('courseIdeas') || '[]');
    const instructorName = (window.currentUser && window.currentUser.name) || localStorage.getItem('userName') || 'Instructor';
    ideas.push({
        id: Date.now(),
        title,
        desc,
        category,
        contact,
        phone,
        instructorName,
        status: STATUS_PENDIENTE,
        adminMessage: '',
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('courseIdeas', JSON.stringify(ideas));

    const success = document.getElementById('ideaSuccess');
    success.classList.remove('hidden');
    document.getElementById('courseIdeaForm').reset();
    setTimeout(() => success.classList.add('hidden'), 6000);

    renderIdeaStatus();
}

function resetCourseIdea() {
    document.getElementById('courseIdeaForm').reset();
    document.getElementById('ideaSuccess').classList.add('hidden');
}

function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        window.location.href = './login.html';
    }
}

function getMyIdeas() {
    const ideas = JSON.parse(localStorage.getItem('courseIdeas') || '[]');
    const instructorName = (window.currentUser && window.currentUser.name) || localStorage.getItem('userName') || 'Instructor';
    return ideas.filter(i => i.instructorName === instructorName);
}

function getReadIds() {
    return JSON.parse(localStorage.getItem(READ_KEY) || '[]').map(Number);
}

function hasNews(idea, readIds) {
    const status = idea.status || STATUS_PENDIENTE;
    return (status === STATUS_APROBADA || status === STATUS_NO_APROBADA) && !readIds.includes(Number(idea.id));
}

function renderIdeaStatus() {
    const container = document.getElementById('ideaNotifications');
    if (!container) return;

    const mine = getMyIdeas();
    const readIds = getReadIds();
    const news = mine.filter(i => hasNews(i, readIds));

    const badge = document.getElementById('instructorNotifBadge');
    if (badge) {
        if (news.length) {
            badge.style.display = 'block';
            badge.textContent = news.length > 9 ? '9+' : String(news.length);
        } else {
            badge.style.display = 'none';
        }
    }

    if (!mine.length) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = mine.map(renderBanner).join('') + (news.length > 0
        ? '<button type="button" data-mark-all-read class="mt-3 text-xs font-semibold text-[#822375] underline">Marcar todo como visto</button>'
        : '');
}

function renderBanner(idea) {
    const status = idea.status || STATUS_PENDIENTE;
    const dateText = new Date(idea.updatedAt || idea.createdAt).toLocaleDateString('es-ES');
    const title = esc(idea.title);

    if (status === STATUS_APROBADA) {
        return bannerHtml('green', `¡La idea "${title}" fue aprobada!`, idea.adminMessage, dateText, idea.id);
    }
    if (status === STATUS_NO_APROBADA) {
        return bannerHtml('red', `La idea "${title}" no fue aprobada`, idea.adminMessage, dateText, idea.id);
    }
    return bannerHtml('amber', `Aún se está procesando tu solicitud: "${title}"`, idea.adminMessage, dateText, idea.id);
}

function bannerHtml(kind, heading, message, dateText, id) {
    const styles = {
        green: 'border-green-300 bg-green-50 text-green-800',
        red: 'border-red-300 bg-red-50 text-red-800',
        amber: 'border-amber-300 bg-amber-50 text-amber-800'
    };
    const label = {
        green: 'Aprobada',
        red: 'No aprobada',
        amber: 'Pendiente'
    };
    const showMark = kind !== 'amber';

    return `
        <div class="card border-l-4 ${styles[kind]}">
            <div class="flex items-start justify-between gap-3 mb-1">
                <span class="text-xs font-semibold uppercase tracking-wide opacity-70">${label[kind]} · ${dateText}</span>
            </div>
            <h4 class="font-semibold mt-1">${heading}</h4>
            ${message ? `<p class="text-sm mt-2 opacity-90"><strong>Observaciones:</strong> ${esc(message)}</p>` : ''}
            ${showMark ? `<button type="button" data-mark-read="${id}" class="mt-3 text-xs font-semibold underline">Marcar como visto</button>` : ''}
        </div>`;
}

function markIdeaRead(id) {
    const mine = getMyIdeas();
    const match = mine.find(i => Number(i.id) === Number(id));
    if (!match) return;

    let readIds = getReadIds();
    if (!readIds.includes(Number(id))) {
        readIds.push(Number(id));
        localStorage.setItem(READ_KEY, JSON.stringify(readIds));
        renderIdeaStatus();
    }
}

function markAllRead() {
    const mine = getMyIdeas();
    let readIds = getReadIds();
    mine.forEach(function (idea) {
        if (hasNews(idea, readIds)) {
            readIds.push(Number(idea.id));
        }
    });
    localStorage.setItem(READ_KEY, JSON.stringify(readIds));
    renderIdeaStatus();
}