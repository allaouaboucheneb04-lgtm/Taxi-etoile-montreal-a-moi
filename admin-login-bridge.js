
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const email = document.getElementById('adminEmail');
    const pass = document.getElementById('adminPassword');
    const form = document.getElementById('adminLoginForm');

    // Create common aliases used by older code without changing UI
    if(email && !document.getElementById('email')){
      email.setAttribute('name','email');
    }
    if(pass && !document.getElementById('password')){
      pass.setAttribute('name','password');
    }

    // Fallback login using Firebase compat if available
    if(form && window.firebase && firebase.auth){
      form.addEventListener('submit', async function(e){
        e.preventDefault();
        const msg = document.getElementById('adminLoginMessage');
        try{
          await firebase.auth().signInWithEmailAndPassword(email.value.trim(), pass.value);
          if(msg) msg.textContent = 'Connexion réussie...';
          window.location.href = 'admin.html';
        }catch(err){
          if(msg) msg.textContent = 'Erreur: ' + (err.message || err.code);
        }
      });
    }
  });
})();
