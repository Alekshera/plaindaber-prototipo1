document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('form input#email')?.closest('form');
  const registerForm = document.getElementById('register-form');

  const alertBox = document.getElementById('login-alert');
  const alertYes = document.getElementById('login-alert-yes');
  const alertNo = document.getElementById('login-alert-no');
  const alertMessage = document.getElementById('login-alert-message');
  const loginErrorAlert = document.getElementById('login-error-alert');
  const loginErrorAccept = document.getElementById('login-error-accept');
  const loginEmptyAlert = document.getElementById('login-empty-alert');
  const loginEmptyAccept = document.getElementById('login-empty-accept');
  const loginPasswordMismatchAlert = document.getElementById('login-password-mismatch-alert');
  const loginPasswordMismatchAccept = document.getElementById('login-password-mismatch-accept');

  const registerAlertName = document.getElementById('register-alert-name');
  const registerAlertNameAccept = document.getElementById('register-alert-name-accept');
  const registerAlertId = document.getElementById('register-alert-id');
  const registerAlertIdAccept = document.getElementById('register-alert-id-accept');
  const registerAlertEmpty = document.getElementById('register-alert-empty');
  const registerAlertEmptyAccept = document.getElementById('register-alert-empty-accept');
  const registerAlertTerms = document.getElementById('register-alert-terms');
  const registerAlertTermsAccept = document.getElementById('register-alert-terms-accept');
  const registerAlertAuthorize = document.getElementById('register-alert-authorize');
  const registerAlertAuthorizeAccept = document.getElementById('register-alert-authorize-accept');
  const registerAlertEmail = document.getElementById('register-alert-email');
  const registerAlertEmailAccept = document.getElementById('register-alert-email-accept');
  const registerAlertPasswordMismatch = document.getElementById('register-alert-password-mismatch');
  const registerAlertPasswordMismatchAccept = document.getElementById('register-alert-password-mismatch-accept');

  let registerErrorQueue = [];

  const validEmail = 'user@plaindaber.com';
  const validPassword = '123456';

  function showLoginAlert() {
    alertMessage.textContent = 'El usuario o contraseña no existen, ¿Ya estás registrado?';
    alertBox.classList.remove('hidden');
  }

  function hideLoginAlert() {
    alertBox.classList.add('hidden');
  }

  function showLoginErrorAlert() {
    loginErrorAlert.classList.remove('hidden');
  }

  function hideLoginErrorAlert() {
    loginErrorAlert.classList.add('hidden');
  }

  function showLoginEmptyAlert() {
    hideAllLoginAlerts();
    loginEmptyAlert.classList.remove('hidden');
  }

  function hideLoginEmptyAlert() {
    loginEmptyAlert.classList.add('hidden');
  }

  function showLoginPasswordMismatchAlert() {
    hideAllLoginAlerts();
    loginPasswordMismatchAlert.classList.remove('hidden');
  }

  function hideLoginPasswordMismatchAlert() {
    loginPasswordMismatchAlert.classList.add('hidden');
  }

  function hideAllLoginAlerts() {
    if (alertBox) {
      alertBox.classList.add('hidden');
    }
    if (loginErrorAlert) {
      loginErrorAlert.classList.add('hidden');
    }
    if (loginEmptyAlert) {
      loginEmptyAlert.classList.add('hidden');
    }
    if (loginPasswordMismatchAlert) {
      loginPasswordMismatchAlert.classList.add('hidden');
    }
  }

  function showRegisterNameAlert() {
    hideAllRegisterAlerts();
    registerAlertName.classList.remove('hidden');
  }

  function hideRegisterNameAlert() {
    registerAlertName.classList.add('hidden');
  }

  function showRegisterIdAlert() {
    hideAllRegisterAlerts();
    registerAlertId.classList.remove('hidden');
  }

  function hideRegisterIdAlert() {
    registerAlertId.classList.add('hidden');
  }

  function showRegisterEmptyAlert() {
    hideAllRegisterAlerts();
    registerAlertEmpty.classList.remove('hidden');
  }

  function showRegisterTermsAlert() {
    hideAllRegisterAlerts();
    registerAlertTerms.classList.remove('hidden');
  }

  function hideRegisterTermsAlert() {
    registerAlertTerms.classList.add('hidden');
  }

  function showRegisterAuthorizeAlert() {
    hideAllRegisterAlerts();
    registerAlertAuthorize.classList.remove('hidden');
  }

  function hideRegisterAuthorizeAlert() {
    registerAlertAuthorize.classList.add('hidden');
  }

  function showRegisterEmailAlert() {
    hideAllRegisterAlerts();
    registerAlertEmail.classList.remove('hidden');
  }

  function hideRegisterEmailAlert() {
    registerAlertEmail.classList.add('hidden');
  }

  function showRegisterPasswordMismatchAlert() {
    hideAllRegisterAlerts();
    registerAlertPasswordMismatch.classList.remove('hidden');
  }

  function hideRegisterPasswordMismatchAlert() {
    registerAlertPasswordMismatch.classList.add('hidden');
  }

  function hideRegisterEmptyAlert() {
    registerAlertEmpty.classList.add('hidden');
  }

  function hideAllRegisterAlerts() {
    if (registerAlertName) {
      registerAlertName.classList.add('hidden');
    }
    if (registerAlertId) {
      registerAlertId.classList.add('hidden');
    }
    if (registerAlertEmpty) {
      registerAlertEmpty.classList.add('hidden');
    }
    if (registerAlertTerms) {
      registerAlertTerms.classList.add('hidden');
    }
    if (registerAlertAuthorize) {
      registerAlertAuthorize.classList.add('hidden');
    }
    if (registerAlertEmail) {
      registerAlertEmail.classList.add('hidden');
    }
    if (registerAlertPasswordMismatch) {
      registerAlertPasswordMismatch.classList.add('hidden');
    }
  }

  function showNextRegisterAlert() {
    if (!registerErrorQueue.length) {
      return;
    }

    const nextError = registerErrorQueue.shift();

    if (nextError === 'empty') {
      showRegisterEmptyAlert();
    } else if (nextError === 'terms') {
      showRegisterTermsAlert();
    } else if (nextError === 'authorize') {
      showRegisterAuthorizeAlert();
    } else if (nextError === 'name') {
      showRegisterNameAlert();
    } else if (nextError === 'id') {
      showRegisterIdAlert();
    } else if (nextError === 'email') {
      showRegisterEmailAlert();
    } else if (nextError === 'password-mismatch') {
      showRegisterPasswordMismatchAlert();
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const email = event.target.querySelector('#email')?.value.trim() || '';
      const password = event.target.querySelector('#password')?.value.trim() || '';
      const confirmPassword = event.target.querySelector('#confirmPassword')?.value.trim() || '';

      if (!email || !password || !confirmPassword) {
        showLoginEmptyAlert();
        return;
      }

      if (password !== confirmPassword) {
        showLoginPasswordMismatchAlert();
        return;
      }

      if (email !== validEmail || password !== validPassword) {
        showLoginAlert();
      } else {
        // Guardar datos de sesión
        localStorage.setItem('userName', 'Usuario');
        localStorage.setItem('userRole', 'ESTUDIANTE');
        window.location.href = './dashboard.html';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const nombre = event.target.querySelector('#nombre').value.trim();
      const apellido = event.target.querySelector('#apellido').value.trim();
      const identificacion = event.target.querySelector('#identificacion').value.trim();
      const nacimiento = event.target.querySelector('#nacimiento').value;
      const rol = event.target.querySelector('#rol').value;
      const email = event.target.querySelector('#email').value.trim();
      const password = event.target.querySelector('#password').value.trim();
      const confirmPassword = event.target.querySelector('#confirmPassword').value.trim();

      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
      const idRegex = /^[0-9]+$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      registerErrorQueue = [];

      const terminos = event.target.querySelector('#terminos').checked;
      const autorizo = event.target.querySelector('#autorizo').checked;

      if (!nombre || !apellido || !identificacion || !nacimiento || !rol || !email || !password || !confirmPassword) {
        registerErrorQueue.push('empty');
      }

      if (!terminos) {
        registerErrorQueue.push('terms');
      }

      if (!autorizo) {
        registerErrorQueue.push('authorize');
      }

      if (nombre && apellido && (!nameRegex.test(nombre) || !nameRegex.test(apellido))) {
        registerErrorQueue.push('name');
      }

      if (identificacion && !idRegex.test(identificacion)) {
        registerErrorQueue.push('id');
      }

      if (email && !emailRegex.test(email)) {
        registerErrorQueue.push('email');
      }

      if (password && confirmPassword && password !== confirmPassword) {
        registerErrorQueue.push('password-mismatch');
      }

      if (registerErrorQueue.length) {
        showNextRegisterAlert();
        return;
      }

      // Guardar datos en localStorage
      const rolValue = event.target.querySelector('#rol').value;
      const rolMap = {
        'profesor': 'INSTRUCTOR',
        'estudiante': 'ESTUDIANTE',
        'administrador': 'ADMINISTRADOR'
      };
      const mappedRole = rolMap[rolValue] || 'ESTUDIANTE';
      
      localStorage.setItem('userName', `${nombre} ${apellido}`);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', mappedRole);
      
      // Redirigir según el rol
      const redirectByRole = {
        'INSTRUCTOR': './dashboard_instructor.html',
        'ADMINISTRADOR': './dashboard.html',
        'ESTUDIANTE': './dashboard.html'
      };
      window.location.href = redirectByRole[mappedRole] || './dashboard.html';
    });
  }

  if (alertYes) {
    alertYes.addEventListener('click', function () {
      hideAllLoginAlerts();
      showLoginErrorAlert();
    });
  }

  if (alertNo) {
    alertNo.addEventListener('click', function () {
      window.location.href = './registro.html';
    });
  }

  if (loginErrorAccept) {
    loginErrorAccept.addEventListener('click', function () {
      hideAllLoginAlerts();
    });
  }

  if (loginEmptyAccept) {
    loginEmptyAccept.addEventListener('click', function () {
      hideAllLoginAlerts();
    });
  }

  if (loginPasswordMismatchAccept) {
    loginPasswordMismatchAccept.addEventListener('click', function () {
      hideAllLoginAlerts();
    });
  }

  if (registerAlertNameAccept) {
    registerAlertNameAccept.addEventListener('click', function () {
      hideAllRegisterAlerts();
      showNextRegisterAlert();
    });
  }

  if (registerAlertIdAccept) {
    registerAlertIdAccept.addEventListener('click', function () {
      hideAllRegisterAlerts();
      showNextRegisterAlert();
    });
  }

  if (registerAlertEmptyAccept) {
    registerAlertEmptyAccept.addEventListener('click', function () {
      hideAllRegisterAlerts();
      showNextRegisterAlert();
    });
  }

  if (registerAlertTermsAccept) {
    registerAlertTermsAccept.addEventListener('click', function () {
      hideAllRegisterAlerts();
      showNextRegisterAlert();
    });
  }

  if (registerAlertAuthorizeAccept) {
    registerAlertAuthorizeAccept.addEventListener('click', function () {
      hideAllRegisterAlerts();
      showNextRegisterAlert();
    });
  }

  if (registerAlertEmailAccept) {
    registerAlertEmailAccept.addEventListener('click', function () {
      hideAllRegisterAlerts();
      showNextRegisterAlert();
    });
  }

  if (registerAlertPasswordMismatchAccept) {
    registerAlertPasswordMismatchAccept.addEventListener('click', function () {
      hideAllRegisterAlerts();
      showNextRegisterAlert();
    });
  }

  // Lógica para Recuperar Contraseña
  const recoverForm = document.getElementById('recover-form');
  const recoverEmptyAlert = document.getElementById('recover-empty-alert');
  const recoverEmptyAccept = document.getElementById('recover-empty-accept');
  const recoverInvalidAlert = document.getElementById('recover-invalid-alert');
  const recoverInvalidAccept = document.getElementById('recover-invalid-accept');
  const recoverSuccessAlert = document.getElementById('recover-success-alert');
  const recoverSuccessAccept = document.getElementById('recover-success-accept');

  if (recoverForm) {
    recoverForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const email = event.target.querySelector('#recover-email')?.value.trim() || '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        recoverEmptyAlert?.classList.remove('hidden');
        return;
      }

      if (!emailRegex.test(email)) {
        recoverInvalidAlert?.classList.remove('hidden');
        return;
      }

      recoverSuccessAlert?.classList.remove('hidden');
    });
  }

  if (recoverEmptyAccept) {
    recoverEmptyAccept.addEventListener('click', function () {
      recoverEmptyAlert?.classList.add('hidden');
    });
  }

  if (recoverInvalidAccept) {
    recoverInvalidAccept.addEventListener('click', function () {
      recoverInvalidAlert?.classList.add('hidden');
    });
  }

  if (recoverSuccessAccept) {
    recoverSuccessAccept.addEventListener('click', function () {
      recoverSuccessAlert?.classList.add('hidden');
      window.location.href = './login.html';
    });
  }
});
