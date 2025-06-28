import { PantryClient } from './js/pantry-client.js';

const pantryUsers = new PantryClient('b7d1e120-03fb-47bd-a09e-e17dcbc503dd', 'users');

async function register(email, password) {
    const data = {
      email: email,
      password: await hashPassword(password),
      profiles: [],
      isLoggedIn: true
    }

    await pantryUsers.addUser(email, data);

    localStorage.setItem("user", JSON.stringify(data));
}

async function login(email, password) {
    const user = await pantryUsers.getUser(email);
      
    let isError = true;
    let responseTxt;
    let responseColor = "red";
    
    if (!user) {
        responseTxt = "Não há conta registrada com esse email";
    } else if (user.password !== await hashPassword(password)) {
        responseTxt = "Senha incorreta";
    } else {
        responseTxt = `Logado com ${user.email}`;
        responseColor = "green";
        isError = false;
    }

    if (!isError) {
        await pantryUsers.updateUser(user.email, { isLoggedIn: true });

        user.isLoggedIn = true;

        localStorage.setItem("user", JSON.stringify(user));
    }

    return { responseTxt, responseColor };
}

async function logout() {
    const user = JSON.parse(localStorage.getItem("user"));

    await pantryUsers.updateUser(user.email, { isLoggedIn: false });

    localStorage.removeItem("user");
  
    location.href = "./index.html";
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function updateProfilesUI(user, editMode) {
    const profiles = user.profiles;

    const profilesContainer = document.querySelector('.profiles');
    profilesContainer.querySelectorAll('.profile:not(.add)').forEach(el => el.remove());

    const buttonProfileAdd = document.querySelector('.profile.add');
    
    profiles.forEach(profile => {
        const button = document.createElement('button');
        button.classList.add('profile');
        button.classList.add(profile.color);
        button.setAttribute('itemid', profile.name);
        
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
                
                const userNewData = await pantryUsers.removeProfile(user.email, profile.name);
                localStorage.setItem("user", JSON.stringify(userNewData));
                
                const profileButton = document.querySelector(`[itemid="${profile.name}"]`);

                profileButton.remove();
            });
            
            button.appendChild(deleteBtn);
        }
        
        profilesContainer.insertBefore(button, buttonProfileAdd);
        
        // Clique normal no perfil (só se não estiver em edição)
        if (!editMode) {
            const modalProfileLogin = document.querySelector('.modal.profile-login');
            button.addEventListener('click', () => {
                if (profile.password) {
                    modalProfileLogin.hidden = false;
                } else {
                    location.href = "./movies.html";
                }
            });
        }
    });
}

export { register, login, logout, hashPassword, updateProfilesUI }