
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, writeBatch, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = window.FIREBASE_CONFIG || {
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
const RESERVATIONS_COLLECTION = "reservations";

function $(id){ return document.getElementById(id); }

function val(id){
  const el = $(id);
  return el ? String(el.value || "").trim() : "";
}

function bool(id){
  const el = $(id);
  return !!(el && el.checked);
}

function splitDateTime(value){
  if(!value) return { date:"", time:"" };
  const [date, timeRaw=""] = String(value).split("T");
  return { date, time: timeRaw.slice(0,5) };
}

function localInputValue(date){
  const pad = n => String(n).padStart(2,"0");
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildData(){
  const dt = splitDateTime(val("heure"));
  const retourDt = splitDateTime(val("heureRetour"));
  const allerRetour = bool("allerRetour");

  const reservation = {
    clientName: val("nom"),
    name: val("nom"),
    phone: val("telephone"),
    email: val("email"),
    passengers: Number(val("passagers") || 1),
    flightNumber: val("numeroVol"),
    pickup: val("depart"),
    dropoff: val("arrivee"),
    destination: val("arrivee"),
    datetime: val("heure"),
    date: dt.date,
    time: dt.time,
    vehicleType: val("vehicule") || "berline",
    luggage: Number(val("valises") || 0),
    notes: val("notes"),
    status: "pending",
    source: "site-web",
    createdAt: serverTimestamp(),
    tripType: allerRetour ? "Aller-retour" : "Aller simple",
    allerRetour
  };

  const emailParams = {
    // Variables pour ton template ADMIN actuel
    name: reservation.name,
    phone: reservation.phone,
    email: reservation.email,
    pickup: reservation.pickup,
    destination: reservation.destination,
    date: reservation.date,
    time: reservation.time,
    passengers: String(reservation.passengers),
    trip_type: reservation.tripType,
    message: reservation.notes || "",

    // Variables compatibles avec l'autre version du template
    client_name: reservation.name,
    client_phone: reservation.phone,
    client_email: reservation.email,

    vehicle: reservation.vehicleType,
    luggage: String(reservation.luggage),
    flight_number: reservation.flightNumber || "",
    return_date: retourDt.date,
    return_time: retourDt.time,
    return_notes: val("notesRetour")
  };

  return { reservation, emailParams };
}

async function sendEmails(emailParams){
  if(!window.emailjs) {
    console.warn("EmailJS non chargé.");
    return;
  }

  const publicKey = window.EMAILJS_PUBLIC_KEY || "yboy22jWUXe2Qfpak";
  const serviceId = window.EMAILJS_SERVICE_ID || "service_mq6perp";
  const adminTemplate = window.EMAILJS_ADMIN_TEMPLATE_ID || window.EMAILJS_TEMPLATE_ID || "template_430p3gg";
  const clientTemplate = window.EMAILJS_CLIENT_TEMPLATE_ID || "template_tt0etny";

  try { window.emailjs.init(publicKey); } catch(e) {}

  await window.emailjs.send(serviceId, adminTemplate, emailParams);

  if(emailParams.email){
    await window.emailjs.send(serviceId, clientTemplate, emailParams);
  }
}

function showMessage(text, type="info"){
  let box = $("formMessage");
  if(!box){
    box = document.createElement("div");
    box.id = "formMessage";
    box.className = "form-message";
    const form = $("reservationForm");
    form?.prepend(box);
  }
  box.textContent = text;
  box.className = "form-message " + type;
}

function setLoading(isLoading){
  const btn = document.querySelector("#reservationForm button[type='submit']");
  if(!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Envoi en cours..." : "Envoyer la réservation";
}

async function handleSubmit(e){
  e.preventDefault();

  const form = $("reservationForm");
  if(!form.reportValidity()) return;

  setLoading(true);
  showMessage("Envoi de la réservation...", "info");

  const { reservation, emailParams } = buildData();

  try{
    if(reservation.allerRetour){
      const batch = writeBatch(db);
      const allerRef = doc(collection(db, RESERVATIONS_COLLECTION));
      const retourRef = doc(collection(db, RESERVATIONS_COLLECTION));

      batch.set(allerRef, {
        ...reservation,
        direction: "aller",
        groupId: `rt_${Date.now()}`,
        linkedTripId: retourRef.id
      });

      batch.set(retourRef, {
        ...reservation,
        pickup: reservation.destination,
        dropoff: reservation.pickup,
        destination: reservation.pickup,
        datetime: val("heureRetour") || reservation.datetime,
        notes: val("notesRetour") || "",
        direction: "retour",
        linkedTripId: allerRef.id
      });

      await batch.commit();
    } else {
      await addDoc(collection(db, RESERVATIONS_COLLECTION), {
        ...reservation,
        direction: "aller-simple"
      });
    }

    try{
      await sendEmails(emailParams);
    }catch(emailError){
      console.error("Erreur EmailJS:", emailError);
      // La réservation reste enregistrée même si l'email échoue.
    }

    showMessage("Réservation envoyée avec succès.", "success");
    form.reset();

    setTimeout(() => {
      window.location.href = "merci.html";
    }, 900);

  }catch(error){
    console.error("Erreur réservation:", error);
    showMessage("Erreur : la réservation n’a pas été envoyée. Vérifiez Firebase Rules ou la connexion.", "error");
  }finally{
    setLoading(false);
  }
}

function setupUI(){
  const form = $("reservationForm");
  if(form) form.addEventListener("submit", handleSubmit);

  const retour = $("allerRetour");
  const retourFields = $("retourFields");
  retour?.addEventListener("change", () => {
    retourFields?.classList.toggle("hidden", !retour.checked);
  });

  document.querySelectorAll(".quick-destination-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = $(btn.dataset.target || "arrivee");
      if(target) target.value = btn.dataset.address || "";
    });
  });

  document.querySelectorAll(".datetime-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = $(btn.dataset.target || "heure");
      if(!target) return;

      if(btn.dataset.mode === "now"){
        const d = new Date(Date.now() + 15 * 60000);
        target.value = localInputValue(d);
      } else {
        target.focus();
        target.showPicker?.();
      }
    });
  });

  const now = new Date(Date.now() + 10 * 60000);
  if($("heure")) $("heure").min = localInputValue(now);
}

document.addEventListener("DOMContentLoaded", setupUI);
