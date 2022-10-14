
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js"


// Configuraciones del web app's Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDAWdmdp_7wfHg1ztQYbzD-Ydz6z3wF5wQ",
    authDomain: "fir-desafiobbva.firebaseapp.com",
    projectId: "fir-desafiobbva",
    storageBucket: "fir-desafiobbva.appspot.com",
    messagingSenderId: "847110730726",
    appId: "1:847110730726:web:8c3c246d9c03057db91c27"
};

// Inicialización de Firebase y BD
const app = initializeApp(firebaseConfig);
const db = getFirestore();

// Obtención de Reemplazos
export const onGetReplacements = (callback) => onSnapshot(collection(db, 'replacements'), callback);

// Obtención de Vacaciones Registradas
export const onGetHolidays = (callback) => onSnapshot(collection(db, 'holidays'), callback);

// Registro de vacaciones
export const registerHoliday = (name, email, startDate, endDate, idReplacement) => {
    addDoc(collection(db, 'holidays'), {name, email, startDate, endDate, idReplacement});
}
