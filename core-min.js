import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBd1fw2nWohvcveNCilf6xg4xZDCNdmEQw",
  authDomain: "juegos-16e17.firebaseapp.com",
  databaseURL: "https://juegos-16e17-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "juegos-16e17",
  storageBucket: "juegos-16e17.firebasestorage.app",
  messagingSenderId: "566680151031",
  appId: "1:566680151031:web:9a400f22df8bda0e6184f2",
  measurementId: "G-YJVGWVQ3V3"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const rtdb = getDatabase(app, firebaseConfig.databaseURL);

export const configEntorno = {
    dbPath: firebaseConfig.databaseURL,
    uiTheme: "neon-glass",
    version: "2.1.0"
};

export { app, analytics, db, rtdb };