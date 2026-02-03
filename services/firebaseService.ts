import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, Firestore } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, Auth, User } from "firebase/auth";
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
  
  // --- CONFIGURATION ---

  /**
   * Check if configuration exists in localStorage
   */
  hasConfig: (): boolean => {
    return !!localStorage.getItem(CONFIG_KEY);
  },

  /**
   * Save configuration to localStorage and initialize
   */
  saveConfig: (config: FirebaseConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    FirebaseService.initialize();
  },

  /**
   * Load config and initialize Firebase App
   */
  initialize: () => {
    if (app) return app; // Already initialized

    const configStr = localStorage.getItem(CONFIG_KEY);
    if (!configStr) {
      console.warn("Firebase not configured");
      return null;
    }

    try {
      const config = JSON.parse(configStr);
      // Check if app already exists in Firebase global namespace to prevent "Duplicate App" errors
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

  /**
   * Clear config and sign out
   */
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
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Login failed", error);
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

  // --- DATABASE (FIRESTORE) ---

  getAll: async (): Promise<Activity[]> => {
    if (!db) FirebaseService.initialize();
    if (!db) return [];

    try {
      const querySnapshot = await getDocs(collection(db, "activities"));
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id // Ensure ID matches doc ID
      })) as Activity[];
    } catch (error) {
      console.error("Firestore GET Error:", error);
      throw error;
    }
  },

  save: async (activity: Activity): Promise<void> => {
    if (!db) throw new Error("Base de données non connectée");

    try {
      // Use setDoc to create or update document with specific ID
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