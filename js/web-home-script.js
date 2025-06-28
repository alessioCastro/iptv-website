import { hashPassword } from './js/utils.js';
import { PantryClient } from './js/pantry-client.js';

const user = localStorage.getItem("user");

if (!user) {
  location.href = "./index.html";
}

const pantryUsers = new PantryClient('b7d1e120-03fb-47bd-a09e-e17dcbc503dd', 'users');

const modal = document.querySelector('.modal');
const messageBox = document.querySelector('.message');
const profilePass = document.querySelector('#profile-pass');
const closeBtn = document.querySelector('.close-button');

const profilesContainer = document.querySelector('.profiles');
const addButton = document.querySelector('.profile.add');
const addProfileModal = document.querySelector('#add-profile-modal');
const addProfileForm = document.querySelector('#add-profile-form');

function updateProfilesUI(profiles) {
  profilesContainer.querySelectorAll('.profile:not(.add)').forEach(el => el.remove());
  
  profiles.forEach(profile => {
    const button = document.createElement('button');
    button.classList.add('profile');
    button.classList.add(profile.color);
    button.setAttribute('itemid', profile.id);
    
    const faceDiv = document.createElement('div');
    faceDiv.classList.add('face');
    faceDiv.textContent = '😊';
    
    const span = document.createElement('span');
    span.textContent = profile.name;
    
    button.appendChild(faceDiv);
    button.appendChild(span);
    
    // Adiciona botão de deletar se estiver em modo edição
    if (editMode) {
      const deleteBtn = document.createElement('span');
      deleteBtn.classList.add('delete-button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.title = 'Remover perfil';
      
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Evita abrir o modal
          await pantryUsers.removeProfile(currentUserId, profile.name);
      });
      
      button.appendChild(deleteBtn);
    }
    
    profilesContainer.insertBefore(button, addButton);
    
    // Clique normal no perfil (só se não estiver em edição)
    if (!editMode) {
      button.addEventListener('click', () => {
        if (profile.passwordHash) {
          modal.hidden = false;
          profilePass.dataset.profileId = profile.id;
        } else {
          selectProfile(profile);
        }
      });
    }
  });
}

async function selectProfile(profile) {
  localStorage.setItem('selectedProfile', JSON.stringify(profile));
  location.href = './home.html';
}

// Enviar senha para acessar perfil
profilePass.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.querySelector("#password").value;
  const profileId = profilePass.dataset.profileId;
  
  const docRef = doc(db, "accounts", currentUserId, "profiles", profileId);
  const profileSnap = await getDoc(docRef);
  
  if (!profileSnap.exists()) {
    messageBox.textContent = "Perfil não encontrado.";
    return;
  }
  
  const profile = profileSnap.data();
  const inputHash = await hashPassword(password);
  
  if (inputHash === profile.passwordHash) {
    modal.hidden = true;
    profilePass.reset();
    messageBox.textContent = "";
    selectProfile({ id: profileId, ...profile });
  } else {
    messageBox.textContent = "Senha incorreta.";
  }
});

// Fecha modal de senha
closeBtn.addEventListener('click', () => {
  modal.hidden = true;
  profilePass.reset();
  messageBox.textContent = '';
});

// Fecha modal ao clicar fora (mobile)
const isDesktop = window.innerWidth >= 768;
if (!isDesktop) {
  document.body.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.hidden = true;
      profilePass.reset();
      messageBox.textContent = '';
    }
  });
}

// Abrir modal de adicionar perfil
addButton.addEventListener('click', () => {
  addProfileModal.hidden = false;
});

// Criar novo perfil
addProfileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = addProfileForm.querySelector('#profile-name').value.trim();
  const color = addProfileForm.querySelector('#profile-color').value;
  const password = addProfileForm.querySelector('#profile-password').value;
  
  if (!name) {
    alert("Nome obrigatório");
    return;
  }
  
  const passwordHash = password ? await hashPassword(password) : null;
  
  await createProfile(currentUserId, {
    name,
    color,
    passwordHash
  });
  
  addProfileForm.reset();
  addProfileModal.hidden = true;
});

let editMode = false;

const editBtn = document.querySelector('.edit');

editBtn.addEventListener('click', () => {
  editMode = !editMode;
  editBtn.textContent = editMode ? 'Concluir' : 'Editar';
  
  // Re-renderiza os perfis para exibir ou esconder botão de deletar
  if (currentUserId) {
    listenProfiles(currentUserId, updateProfilesUI);
  }
});