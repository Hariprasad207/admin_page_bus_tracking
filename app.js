import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore, collection, doc, setDoc, getDocs, addDoc, deleteDoc,updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔐 FIXED ADMIN CREDENTIALS */
const ADMIN_USER = "RITTRANSPORT";
const ADMIN_PASS = "RIT@1234";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
    apiKey: "AIzaSyDkDltTMpyKwDJxKSep777PTyFs7Ia40do",
    authDomain: "bus-tracking-51437.firebaseapp.com",
    projectId: "bus-tracking-51437",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");
const errorText = document.getElementById("error");
const busSelect = document.getElementById("busSelect");
const stopList = document.getElementById("stopList");

/* ================= LOGIN ================= */

window.login = () => {
    const user = username.value;
    const pass = password.value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        loginBox.hidden = true;
        adminPanel.hidden = false;
        loadBuses();
    } else {
        errorText.textContent = "Invalid credentials";
    }
};

window.logout = () => {
    location.reload();
};

/* ================= BUS ================= */

async function loadBuses() {
  busSelect.innerHTML = "";
  const snap = await getDocs(collection(db, "buses"));

  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.id;
    opt.dataset.active = d.data().active ?? true;
    busSelect.appendChild(opt);
  });

  loadBusStatus();
  loadStops();
}

window.loadBusStatus = async () => {
  const busId = busSelect.value;
  if (!busId) return;

  const busDoc = await getDocs(collection(db, "buses"));
  const selectedOption = [...busSelect.options]
    .find(o => o.value === busId);

  const isActive = selectedOption.dataset.active === "true";
  document.getElementById("busStatus").value = String(isActive);
};

window.updateBusStatus = async () => {
  const busId = busSelect.value;
  const status =
    document.getElementById("busStatus").value === "true";

  if (!busId) return;

  await updateDoc(doc(db, "buses", busId), {
    active: status
  });

  alert(`Bus ${busId} status updated to ${status ? "Active" : "Inactive"}`);
};


window.createBus = async () => {
    if (!busId.value) return;
    await setDoc(doc(db, "buses", busId.value), {
        latitude: 0,
        longitude: 0
    });
    loadBuses();
};

/* ================= STOPS ================= */

window.loadStops = async () => {
    stopList.innerHTML = "";
    const busId = busSelect.value;
    if (!busId) return;

    const snap = await getDocs(collection(db, "buses", busId, "stops"));
    snap.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.data().stop_order} - ${s.data().stopname}`;
        li.onclick = () => deleteStop(busId, s.id);
        stopList.appendChild(li);
    });
};

window.addStop = async () => {
    const busId = busSelect.value;
    await addDoc(collection(db, "buses", busId, "stops"), {
        stopname: stopName.value,
        latitude: Number(lat.value),
        longitude: Number(lng.value),
        stop_order: Number(order.value),
    });
    loadStops();
};

async function deleteStop(busId, stopId) {
    await deleteDoc(doc(db, "buses", busId, "stops", stopId));
    loadStops();
};
