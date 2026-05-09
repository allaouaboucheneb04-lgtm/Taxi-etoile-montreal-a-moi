
(function(){
  function normalizeAdminCards(){
    const keywords = ['Détails course','Téléphone :','Passagers :','Date/heure :','Départ :','Arrivée :'];
    document.querySelectorAll('div, article, li').forEach(el => {
      const text = (el.innerText || '').slice(0,400);
      if(keywords.some(k => text.includes(k)) && el.children.length >= 2){
        if(!el.closest('.reservation-card') && !el.classList.contains('reservation-card')){
          el.classList.add('reservation-card');
        }
      }
    });
  }
  document.addEventListener('DOMContentLoaded', normalizeAdminCards);
  setInterval(normalizeAdminCards, 1200);
})();
