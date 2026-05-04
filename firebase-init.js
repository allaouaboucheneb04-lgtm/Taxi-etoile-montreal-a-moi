// Firebase Configuration - Taxi Etoile Montreal
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBU6OYKH1GNa6ijTJ_7v87jmoTpHkDQoaQ",
  authDomain: "etoile-taxi.firebaseapp.com",
  projectId: "etoile-taxi",
  storageBucket: "etoile-taxi.firebasestorage.app",
  messagingSenderId: "685451587801",
  appId: "1:685451587801:web:b6a787fac14a3a30250ec8",
  measurementId: "G-FLRMDHE1N0"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

window.firebaseApp = app;
window.db = db;
window.auth = auth;

console.log("Firebase Etoile Taxi connecté.");
