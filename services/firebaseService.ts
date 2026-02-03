import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, Firestore, onSnapshot, query, Unsubscribe } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, Auth, User, onAuthStateChanged } from "firebase/auth";
import { Activity } from "../types";

const CONFIG_KEY = 'mdj_firebase_config';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export const FirebaseService = {
  
  // --- CONFIGURATION ---

  hasConfig: (): boolean => {
    return !!localStorage.getItem(CONFIG_KEY);
  },

  saveConfig: (config: FirebaseConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    FirebaseService.initialize();
  },

  initialize: () => {
    if (app) return app;

    const configStr = localStorage.getItem(CONFIG_KEY);
    if (!configStr) {
      return null;
    }

    try {
      const config = JSON.parse(configStr);
      if (!getApps().length) {
        app = initializeApp(config);
      } else {
        app = getApp();
      }
      
      db = getFirestore(app);
      auth = getAuth(app);
      return app;
    } catch (e) {
      console.error("Firebase Initialization Error:", e);
      return null;
    }
  },

  resetConfig: async () => {
    if (auth) await signOut(auth);
    localStorage.removeItem(CONFIG_KEY);
    app = null;
    db = null;
    auth = null;
    window.location.reload();
  },

  // --- AUTHENTICATION ---

  login: async (): Promise<User | null> => {
    if (!auth) FirebaseService.initialize();
    if (!auth) throw new Error("Firebase non configuré");

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Validation UX du domaine (La sécurité réelle est dans les règles Firestore)
      /* 
      if (user.email && !user.email.endsWith('@mdjescalejeunesse.ca')) {
         // Optionnel
      } 
      */
      
      return user;
    } catch (error: any) {
      console.error("Login failed", error);
      
      // GESTION ERREUR DOMAINE NON AUTORISÉ
      if (error.code === 'auth/unauthorized-domain') {
         const domain = window.location.hostname;
         const message = `⛔ DOMAINE NON AUTORISÉ (${domain})\n\n` +
                         `Ce domaine n'est pas autorisé dans votre Console Firebase.\n\n` +
                         `ACTION REQUISE :\n` +
                         `1. Allez sur console.firebase.google.com\n` +
                         `2. Ouvrez votre projet > Authentication > Settings > Authorized Domains\n` +
                         `3. Cliquez sur "Add domain" et ajoutez : ${domain}\n\n` +
                         `La fenêtre de configuration va s'ouvrir pour vous aider.`;
         alert(message);
      } else if (error.code !== 'auth/popup-closed-by-user') {
        alert(`Erreur de connexion Google: ${error.message}`);
      }
      throw error;
    }
  },

  logout: async () => {
    if (!auth) return;
    await signOut(auth);
  },

  getUser: (): User | null => {
    if (!auth) return null;
    return auth.currentUser;
  },

  subscribeToAuth: (callback: (user: User | null) => void) => {
    if (!auth) FirebaseService.initialize();
    if (!auth) {
        callback(null);
        return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  // --- DATABASE TEMPS RÉEL (FIRESTORE) ---

  subscribeToActivities: (callback: (activities: Activity[]) => void): Unsubscribe => {
    if (!db) FirebaseService.initialize();
    if (!db) throw new Error("Base de données non disponible");

    const q = query(collection(db, "activities"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id 
      })) as Activity[];
      
      callback(activities);
    }, (error) => {
      console.error("Erreur de synchronisation:", error);
      if (error.code === 'permission-denied') {
         console.warn("Permissions insuffisantes pour lire les activités.");
      }
    });

    return unsubscribe;
  },

  getAll: async (): Promise<Activity[]> => {
    return new Promise((resolve, reject) => {
        const unsub = FirebaseService.subscribeToActivities((data) => {
            unsub();
            resolve(data);
        });
    });
  },

  save: async (activity: Activity): Promise<void> => {
    if (!db) throw new Error("Base de données non connectée");

    try {
      await setDoc(doc(db, "activities", activity.id), activity);
    } catch (error) {
      console.error("Firestore SAVE Error:", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "activities", id));
    } catch (error) {
      console.error("Firestore DELETE Error:", error);
      throw error;
    }
  }
};