import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, Firestore, onSnapshot, query, Unsubscribe, orderBy } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, Auth, User, onAuthStateChanged } from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { Activity } from "../types";

const CONFIG_KEY = 'mdj_firebase_config';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export const FirebaseService = {
  
  isConfigured: () => {
    return !!localStorage.getItem(CONFIG_KEY);
  },

  initialize: () => {
    if (app) return app;

    const configStr = localStorage.getItem(CONFIG_KEY);
    if (!configStr) return null;

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

  saveConfig: (config: FirebaseConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    window.location.reload(); // Recharger pour appliquer la nouvelle config
  },

  login: async (): Promise<User | null> => {
    if (!auth) FirebaseService.initialize();
    if (!auth) throw new Error("Firebase non configuré");

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      console.error("Login failed", error);
      throw error;
    }
  },

  logout: async () => {
    if (auth) await signOut(auth);
  },

  subscribeToAuth: (callback: (user: User | null) => void) => {
    if (!auth) FirebaseService.initialize();
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Écoute les activités en temps réel depuis Firestore
   */
  subscribeToActivities: (callback: (activities: Activity[]) => void): Unsubscribe => {
    if (!db) FirebaseService.initialize();
    if (!db) return () => {};

    const q = query(collection(db, "activities"), orderBy("date", "asc"));
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => doc.data() as Activity);
      callback(activities);
    }, (error) => {
      console.error("Erreur de synchronisation Firestore:", error);
    });
  },

  save: async (activity: Activity): Promise<void> => {
    if (!db) throw new Error("Base de données non connectée");
    await setDoc(doc(db, "activities", activity.id), activity);
  },

  delete: async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, "activities", id));
  }
};