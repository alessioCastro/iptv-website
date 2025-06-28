import { login, hashPassword, register } from './js/utils.js';
import { PantryClient } from './js/pantry-client.js';

let user = localStorage.getItem("user");

if (user) {
  location.href = "./profiles.html";
}

const pantryUsers = new PantryClient('b7d1e120-03fb-47bd-a09e-e17dcbc503dd', 'users');

const signUpForm = document.querySelector("#sign-up-form");

signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Impede o recarregamento da página
  
  const email = signUpForm.querySelector("#email").value;
  const password = signUpForm.querySelector("#password").value;
  
  const signUpMessage = document.querySelector("#sign-up-message");

  try {
    register(email, password);

    signUpMessage.textContent = `Conta criada com sucesso (${email})`;
    signUpMessage.style.color = "green";

    location.href = "./profiles.html";
  } catch (err) {
    signUpMessage.textContent = "Erro: " + err.message;
    signUpMessage.style.color = "red";
  }
});

const loginForm = document.querySelector("#login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Impede o recarregamento da página
  
  const email = loginForm.querySelector("#email").value;
  const password = loginForm.querySelector("#password").value;
  
  const loginMessage = document.querySelector("#login-message");

  const { responseTxt, responseColor } = await login(email, password);

  loginMessage.textContent = responseTxt;
  loginMessage.style.color = responseColor;

  // Redireciona para outra página
  setTimeout(async () => {
    location.href = "./profiles.html";
  }, 3000);
});