import { logout, hashPassword, updateProfilesUI } from './js/utils.js';
import { PantryClient } from './js/pantry-client.js';

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  location.href = "./index.html";
}

updateProfilesUI(user);

const pantryUsers = new PantryClient('b7d1e120-03fb-47bd-a09e-e17dcbc503dd', 'users');

const buttonLogout = document.querySelector('.logout');
const editButton = document.querySelector('.edit');
const buttonProfileAdd = document.querySelector('.profile.add');

const modalProfileAdd = document.querySelector('.modal.add-profile');
const modalProfileLogin = document.querySelector('.modal.profile-login');
const buttonCloseModalProfileAdd = modalProfileAdd.querySelector('.close-modal-button');
const buttonCloseModalProfileLogin = modalProfileLogin.querySelector('.close-modal-button');

const formProfileAdd = document.querySelector('#add-profile-form');

buttonLogout.addEventListener('click', async (e) => {
    e.stopPropagation();
    logout();
});

buttonProfileAdd.addEventListener('click', async (e) => {
    e.stopPropagation();
    // Mostra modal de adicionar perfil
    modalProfileAdd.hidden = false;
});

buttonCloseModalProfileAdd.addEventListener('click', (e) => {
    e.stopPropagation();
    // Oculta modal de adicionar perfil
    modalProfileAdd.hidden = true;
});

buttonCloseModalProfileLogin.addEventListener('click', (e) => {
    e.stopPropagation();
    // Oculta modal de adicionar perfil
    modalProfileAdd.hidden = true;
});

// Criar novo perfil
formProfileAdd.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = formProfileAdd.querySelector('#profile-name').value.trim();
  const color = formProfileAdd.querySelector('#profile-color').value;
  const password = formProfileAdd.querySelector('#profile-password').value;
  
  if (!name) {
    alert("Nome obrigatório");
    return;
  }
  
  const passwordHash = password ? await hashPassword(password) : null;

  const newProfile = {
    name,
    password: passwordHash,
    color
  }

  const userNewData = await pantryUsers.addProfile(user.email, newProfile);

  localStorage.setItem("user", JSON.stringify(userNewData));
  
  formProfileAdd.reset();
  modalProfileAdd.hidden = true;

  updateProfilesUI(userNewData);
});

let editMode = false;

editButton.addEventListener('click', () => {
  editMode = !editMode;
  editButton.textContent = editMode ? 'Concluir' : 'Editar';

  const user = JSON.parse(localStorage.getItem("user"));
  
  // Re-renderiza os perfis para exibir ou esconder botão de deletar
  updateProfilesUI(user, editMode);
});