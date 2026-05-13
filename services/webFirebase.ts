import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration du MDJ Site Web (mdjsiteweb2026)
// Ces informations proviennent du projet MDJWEB2026
const webConfig = {
    apiKey: import.meta.env.VITE_WEB_FIREBASE_API_KEY,
    authDomain: "mdjsiteweb2026.firebaseapp.com",
    projectId: "mdjsiteweb2026",
    storageBucket: "mdjsiteweb2026.firebasestorage.app",
    messagingSenderId: "590614471733",
    appId: "1:590614471733:web:70bd63c0e8351d25ae3d7c",
    measurementId: "G-KRJCSQMQ2R"
};

// Initialiser une app Firebase "secondaire" nommée "web"
export const webApp = getApps().find(app => app.name === "web")
    || initializeApp(webConfig, "web");

export const webDb = getFirestore(webApp);
