const modals = {
  0: document.querySelector('.modal.sign-up'),
  1: document.querySelector('.modal.login')
}

const forms = {
  0: document.querySelector('#sign-up-form'),
  1: document.querySelector('#login-form')
}

function openModal(arg) {
  const modal = modals[arg];
  modal.hidden = false;
}

function closeModal(arg) {
  const modal = modals[arg];
  modal.hidden = true;
  
  const form = forms[arg];
  form.reset();
  
  const messageBox = modal.querySelector('.message');
  messageBox.textContent = '';
}