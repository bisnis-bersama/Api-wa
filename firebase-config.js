// Konfigurasi Firebase proyek Toko Siap Antar.
// Gunakan proyek yang sama dengan Firebase Console tempat Rules dipasang.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxqZhl6t3RwrXMwVdJeIkg0NzGfwvlweM",
  authDomain: "toko-siap-antar-9a7bb.firebaseapp.com",
  projectId: "toko-siap-antar-9a7bb",
  storageBucket: "toko-siap-antar-9a7bb.firebasestorage.app",
  messagingSenderId: "351335838712",
  appId: "1:351335838712:web:14cc2c7b91bb0c9e1b5c0d"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
