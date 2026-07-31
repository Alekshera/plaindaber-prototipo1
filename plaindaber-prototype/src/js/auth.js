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
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const email = event.target.querySelector('#email')?.value.trim() || '';
      const password = event.target.querySelector('#password')?.value.trim() || '';

      if (!email || !password) {
        showLoginEmptyAlert();
        return;
      }

      if (email !== validEmail || password !== validPassword) {
        showLoginAlert();
      } else {
        alert('Acceso correcto');
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

      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
      const idRegex = /^[0-9]+$/;

      registerErrorQueue = [];

      const terminos = event.target.querySelector('#terminos').checked;
      const autorizo = event.target.querySelector('#autorizo').checked;

      if (!nombre || !apellido || !identificacion || !nacimiento || !rol) {
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

      if (registerErrorQueue.length) {
        showNextRegisterAlert();
        return;
      }

      alert('Registro exitoso');
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
      window.location.href = '../pages/registro.html';
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
});
