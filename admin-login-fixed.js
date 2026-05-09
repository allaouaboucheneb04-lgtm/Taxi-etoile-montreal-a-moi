
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const form = document.getElementById('adminLoginForm');
    const email = document.getElementById('adminEmail');
    const pass = document.getElementById('adminPassword');
    const msg = document.getElementById('adminLoginMessage');

    if(!form || !email || !pass) return;

    if(!window.firebase || !firebase.auth){
      if(msg) msg.textContent = "Firebase Auth n'est pas chargé.";
      return;
    }

    try{
      if(!firebase.apps.length){
        firebase.initializeApp(window.FIREBASE_CONFIG);
      }
    }catch(e){}

    form.addEventListener('submit', async function(e){
      e.preventDefault();

      if(msg) msg.textContent = "Connexion en cours...";

      try{
        await firebase.auth().signInWithEmailAndPassword(email.value.trim(), pass.value);

        if(msg) msg.textContent = "Connexion réussie.";

        window.location.assign("admin.html");

      }catch(error){
        console.error(error);
        if(msg) msg.textContent = "Erreur connexion: " + (error.message || error.code);
      }
    });
  });
})();
