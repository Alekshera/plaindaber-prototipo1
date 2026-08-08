document.addEventListener('DOMContentLoaded', function () {
    const user = window.currentUser || { name: "Dr. Carlos Pérez", role: "INSTRUCTOR" };

    document.getElementById('dashboardTitle').textContent = `Bienvenido, ${user.name.split(' ')[0]}`;
    document.getElementById('userAvatar').textContent = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('es-ES', options);

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
});

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
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('courseIdeas', JSON.stringify(ideas));

    const success = document.getElementById('ideaSuccess');
    success.classList.remove('hidden');
    document.getElementById('courseIdeaForm').reset();
    setTimeout(() => success.classList.add('hidden'), 6000);
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
