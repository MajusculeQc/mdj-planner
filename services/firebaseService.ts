import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, Firestore, onSnapshot, query, Unsubscribe, orderBy } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut, Auth, User, onAuthStateChanged } from "firebase/auth";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai-preview";
import { Activity } from "../types";

// --- 1. CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDDiWf0Vt5k3eVfKXw7VEY9I2AyCSfrxVQ",
  authDomain: "mdj-planner-prod.firebaseapp.com",
  projectId: "mdj-planner-prod",
  storageBucket: "mdj-planner-prod.firebasestorage.app",
  messagingSenderId: "982719306470",
  appId: "1:982719306470:web:abc541e68cda448bfdb927",
  measurementId: "G-S507RYRT6X"
};

// --- 2. INITIALISATION ---
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// On exporte les instances
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- 3. CONFIGURATION DE L'IA (GEMINI) ---
const vertexAI = getVertexAI(app);
export const model = getGenerativeModel(vertexAI, { 
    model: "gemini-1.5-flash" 
});

// --- 4. SERVICE ---
export const FirebaseService = {

  // Connexion avec GOOGLE (Compte perso ou Gmail)
  login: async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      console.error("Login Google failed", error);
      throw error;
    }
  },

  // Connexion avec MICROSOFT 365 (Pour Laurie, Charles, DG, etc.)
  loginWithMicrosoft: async (): Promise<User | null> => {
    const provider = new OAuthProvider('microsoft.com');
    
    // CORRECTION ICI : On spécifie l'ID unique de ton organisation pour éviter l'erreur AADSTS50194
    provider.setCustomParameters({
        tenant: 'e0dd87f7-e6e3-4a48-83b2-64415a9bc105', 
        prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      console.error("Login Microsoft failed", error);
      throw error;
    }
  },

  logout: async () => {
    await signOut(auth);
  },

  subscribeToAuth: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Écoute les activités en temps réel depuis Firestore
   */
  subscribeToActivities: (callback: (activities: Activity[]) => void): Unsubscribe => {
    const q = query(collection(db, "activities"), orderBy("date", "asc"));
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Activity));
      callback(activities);
    }, (error) => {
      console.error("Erreur de synchronisation Firestore:", error);
    });
  },

  save: async (activity: Activity): Promise<void> => {
    if (!activity.id) {
        throw new Error("L'activité doit avoir un ID");
    }
    await setDoc(doc(db, "activities", activity.id), activity);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "activities", id));
  }
};