import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, setDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
  collection, doc, getDoc, getDocs, addDoc, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_fkxOQAgOMyoWjf6GsPx_o1IsaOHzrJU",
  authDomain: "iptv-login-dc82e.firebaseapp.com",
  projectId: "iptv-login-dc82e",
  storageBucket: "iptv-login-dc82e.firebasestorage.app",
  messagingSenderId: "639381876464",
  appId: "1:639381876464:web:c8c3efce3792b2b601dc35"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Obtém referência da subcoleção "profiles" do usuário
function getUserProfilesCollection(userId) {
  return collection(db, "accounts", userId, "profiles");
}

// Cria um novo perfil
async function createProfile(userId, profileData) {
  const profilesCol = getUserProfilesCollection(userId);
  return await addDoc(profilesCol, {
    ...profileData,
    createdAt: serverTimestamp()
  });
}

// Ouve os perfis do usuário em tempo real
function listenProfiles(userId, callback) {
  const profilesCol = getUserProfilesCollection(userId);
  const response = onSnapshot(profilesCol, (snapshot) => {
    const profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(profiles)
    callback(profiles);
  });
  return response;
}

import { deleteDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

async function deleteProfile(userId, profileId) {
  const ref = doc(db, "accounts", userId, "profiles", profileId);
  await deleteDoc(ref);
}

export { app, auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, doc, getDoc, createProfile, listenProfiles, deleteProfile };