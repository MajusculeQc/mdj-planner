import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, query, onSnapshot, orderBy, Unsubscribe, getDoc, getDocs } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut, onAuthStateChanged, User, signInWithEmailAndPassword } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import { Activity } from "../types";
import { getErrorMessage } from "../lib/utils";
import { suggestDimensions, suggestActivityTypes } from "../lib/rmjqUtils";
import { parseActivityStrict, parseActivitySafe, sanitizeActivityData, InventoryItemSchema, MaterialReservationSchema, PurchaseRequestSchema } from "../lib/schemas";
import { InventoryItem, MaterialReservation, PurchaseRequest } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// 1. CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mdj-planner-prod.firebaseapp.com",
  projectId: "mdj-planner-prod",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mdj-planner-prod.appspot.com",
  messagingSenderId: "982719306470",
  appId: "1:982719306470:web:abc541e68cda448bfdb927",
  measurementId: "G-S507RYRT6X"
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. INITIALISATION
// ═══════════════════════════════════════════════════════════════════════════

export let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

// ═══════════════════════════════════════════════════════════════════════════
// 3. CONFIGURATION DE L'IA (GEMINI)
// ═══════════════════════════════════════════════════════════════════════════

// const vertexAI = getVertexAI(app);
// export const model = getGenerativeModel(vertexAI, {
//   model: "gemini-1.5-flash"
// });

// ═══════════════════════════════════════════════════════════════════════════
// 4. DOMAIN VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

const ALLOWED_DOMAIN = '@mdjescalejeunesse.ca';

function validateDomain(user: User): void {
  const email = user.email?.toLowerCase() ?? '';
  if (!email.endsWith(ALLOWED_DOMAIN)) {
    void signOut(auth);
    throw new Error('Seuls les comptes @mdjescalejeunesse.ca sont autorisés.');
  }
}

function isAuthError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export const FirebaseService = {
  login: async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: 'mdjescalejeunesse.ca',
      prompt: 'select_account'
    });
    try {
      const result = await signInWithPopup(auth, provider);
      validateDomain(result.user);
      return result.user;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('autorisés')) throw error;
      throw new Error('Erreur de connexion Google. Veuillez réessayer.');
    }
  },

  loginWithEmail: async (email: string, pass: string): Promise<User | null> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      validateDomain(result.user);
      return result.user;
    } catch (error) {
      console.error("Email Login error:", error);
      throw error;
    }
  },

  loginWithMicrosoft: async (): Promise<User | null> => {
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      tenant: 'e0dd87f7-e6e3-4a48-83b2-64415a9bc105',
      prompt: 'select_account',
      domain_hint: 'mdjescalejeunesse.ca'
    });
    try {
      const result = await signInWithPopup(auth, provider);
      validateDomain(result.user);
      return result.user;
    } catch (error: unknown) {
      if (isAuthError(error)) {
        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('Connexion annulée. Veuillez réessayer.');
        }
        if (error.code === 'auth/popup-blocked') {
          throw new Error('Pop-up bloquée. Autorisez les pop-ups pour ce site.');
        }
        if (error.message.includes('autorisés')) throw error;
      }
      throw new Error('Erreur de connexion Microsoft. Veuillez réessayer.');
    }
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  subscribeToAuth: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  subscribeToActivities: (callback: (activities: Activity[]) => void): Unsubscribe => {
    if (!auth.currentUser) return () => { };
    const q = query(collection(db, "activities"), orderBy("date", "asc"));
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs
        .map(d => {
          const raw = { id: d.id, ...d.data() };
          return parseActivitySafe(raw) || sanitizeActivityData(raw);
        });
      callback(activities);
    }, (error: unknown) => {
      const email = auth.currentUser?.email || 'N/A';
      console.error(`[Firestore] Activities sync error (${email}):`, getErrorMessage(error));
    });
  },

  save: async (activity: Activity): Promise<void> => {
    if (!activity.id) throw new Error("L'activité doit avoir un ID");

    // Auto-categorize if types are empty or only "Animation"
    const currentTypes = activity.types || [];
    if (currentTypes.length === 0 || (currentTypes.length === 1 && currentTypes[0] === 'Animation (sorties, activités, séjours)')) {
      const suggestions = suggestActivityTypes(activity.title, activity.description || "");
      if (suggestions.length > 0) {
        activity.types = Array.from(new Set([...currentTypes, ...suggestions])) as any;
      }
    }

    // Validate schema before saving
    const validated = parseActivityStrict(activity);
    await setDoc(doc(db, "activities", activity.id), validated);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "activities", id));
  },

  getSyncPreview: async (year?: number, month?: number): Promise<any[]> => {
    const functions = getFunctions(app);
    const getPreview = httpsCallable(functions, 'getSyncPreview');
    try {
      const result = await getPreview({ year, month });
      return (result.data as any) || [];
    } catch (error) {
      console.error("Cloud Function Error (getSyncPreview):", error);
      throw error;
    }
  },

  syncToWebsite: async (year: number, month: number): Promise<{ success: boolean; count: number }> => {
    const functions = getFunctions(app);
    const sync = httpsCallable(functions, 'syncToWebsite');
    try {
      const result = await sync({ year, month });
      return result.data as { success: boolean; count: number };
    } catch (error) {
      console.error("Cloud Function Error (syncToWebsite):", error);
      throw error;
    }
  },

  getTheme: async (monthStr: string): Promise<string> => {
    try {
      const docRef = doc(db, "themes", monthStr);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { theme?: string };
        return data.theme || "";
      }
      return "";
    } catch (error) {
      console.error("Error getting theme:", error);
      return "";
    }
  },

  saveTheme: async (monthStr: string, theme: string): Promise<void> => {
    try {
      await setDoc(doc(db, "themes", monthStr), { theme });
    } catch (error) {
      console.error("Error saving theme:", error);
      throw new Error("Impossible de sauvegarder la thématique.");
    }
  },

  subscribeToMessages: (callback: (messages: any[]) => void): Unsubscribe => {
    if (!auth.currentUser) return () => { };
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });
      // Note: We could add MessageSchema validation here if needed,
      // but InternalMessenger already validates the content.
      callback(messages);
    }, (error: unknown) => {
      const email = auth.currentUser?.email || 'N/A';
      const msg = getErrorMessage(error);
      if (msg.toLowerCase().includes("permission")) {
        console.warn(`[Firestore] Messages: Access restricted for ${email}`);
      } else {
        console.error(`[Firestore] Message sync error (${email}):`, msg);
      }
    });
  },

  sendMessage: async (message: any): Promise<void> => {
    const docRef = doc(collection(db, "messages"));
    await setDoc(docRef, {
      ...message,
      timestamp: new Date(),
      isRead: false
    });
  },

  markMessagesAsRead: async (messageIds: string[]): Promise<void> => {
    if (messageIds.length === 0) return;
    const { writeBatch } = await import("firebase/firestore");
    const batch = writeBatch(db);
    messageIds.forEach(id => {
      const docRef = doc(db, "messages", id);
      batch.update(docRef, { isRead: true });
    });
    await batch.commit();
  },

  batchUpdateRMJQDimensions: async (): Promise<number> => {
    const querySnapshot = await getDocs(collection(db, "activities"));
    let count = 0;
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data() as Activity;
      const dimSuggestions = suggestDimensions(data.title, data.description || "");
      const typeSuggestions = suggestActivityTypes(data.title, data.description || "");

      let needsUpdate = false;
      const updatedData: Partial<Activity> = {};

      if (dimSuggestions.length > 0) {
        const updatedDimensions = Array.from(new Set([...(data.rmjqDimensions || []), ...dimSuggestions]));
        if (updatedDimensions.length !== (data.rmjqDimensions || []).length) {
          updatedData.rmjqDimensions = updatedDimensions;
          needsUpdate = true;
        }
      }

      if (typeSuggestions.length > 0) {
        const updatedTypes = Array.from(new Set([...(data.types || []), ...typeSuggestions]));
        if (updatedTypes.length !== (data.types || []).length) {
          updatedData.types = updatedTypes as any;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await setDoc(doc(db, "activities", docSnapshot.id), {
          ...data,
          ...updatedData
        }, { merge: true });
        count++;
      }
    }
    return count;
  },

  /**
   * Migration: remap old activity types to the new 9 RMJQ volets.
   * Returns { updated, skipped, details[] } for audit.
   */
  migrateActivityTypes: async (): Promise<{ updated: number; skipped: number; details: string[] }> => {
    const OLD_TO_NEW: Record<string, string> = {
      'Saines habitudes de vie': 'Animation (sorties, activités, séjours)',
      'Vie associative et démocratique': 'Vie Associative & Bénévolat Jeunes',
      'Prévention et sensibilisation': 'Prévention & Sensibilisation (Interne)',
      'Expression artistique et culturelle': 'Animation (sorties, activités, séjours)',
      'Loisirs et divertissements': 'Animation (sorties, activités, séjours)',
      'CUISINE': 'Animation (sorties, activités, séjours)',
      'Coup de pouce': 'Accompagnement Individualisé',
      'Culte et spiritualité': 'Accueil, Écoute & Milieu de Vie',
      'Culturelle': 'Animation (sorties, activités, séjours)',
      'Formation': 'Prévention & Sensibilisation (Interne)',
      'Plein air': 'Animation (sorties, activités, séjours)',
      'Sortie': 'Animation (sorties, activités, séjours)',
      'Sportive': 'Animation (sorties, activités, séjours)',
      'Journée spéciale': 'Accueil, Écoute & Milieu de Vie',
      'Autre': 'Accueil, Écoute & Milieu de Vie'
    };

    const VALID_TYPES = new Set([
      'Accueil, Écoute & Milieu de Vie',
      'Aide aux Devoirs & Soutien Scolaire',
      'Accompagnement Individualisé',
      'Intervention & Gestion de Crise',
      'Animation (sorties, activités, séjours)',
      'Prévention & Sensibilisation (Interne)',
      'Prévention & Sensibilisation (Partenaire)',
      'Vie Associative & Bénévolat Jeunes',
      'Promotion, Concertation & Gestion'
    ]);

    const querySnapshot = await getDocs(collection(db, "activities"));
    let updated = 0;
    let skipped = 0;
    const details: string[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const currentType = data.type || '';
      const title = data.title || '(sans titre)';

      // Already valid — skip
      if (VALID_TYPES.has(currentType)) {
        skipped++;
        continue;
      }

      // Map old type to new
      let newType = OLD_TO_NEW[currentType];

      // If not in mapping, try keyword detection
      if (!newType) {
        const titleLower = title.toLowerCase();
        if (/soirée libre|accueil|ouverture|drop-in/.test(titleLower)) {
          newType = 'Accueil, Écoute & Milieu de Vie';
        } else if (/devoirs|scolaire|tutorat/.test(titleLower)) {
          newType = 'Aide aux Devoirs & Soutien Scolaire';
        } else if (/comité|c\.j\.|assemblée|bénévolat/.test(titleLower)) {
          newType = 'Vie Associative & Bénévolat Jeunes';
        } else if (/prévention|sensibilisation|atelier/.test(titleLower)) {
          newType = 'Prévention & Sensibilisation (Interne)';
        } else {
          newType = 'Animation (sorties, activités, séjours)';
        }
      }

      await setDoc(doc(db, "activities", docSnapshot.id), {
        type: newType
      }, { merge: true });

      details.push(`✅ "${title}" (${data.date}): "${currentType}" → "${newType}"`);
      updated++;
    }

    console.log(`[Migration] ${updated} activités mises à jour, ${skipped} déjà conformes.`);
    details.forEach(d => console.log(d));

    return { updated, skipped, details };
  },

  notifyTransfer: async (activity: Activity, previousLead: string, newLead: string, newLeadEmail: string, senderName: string): Promise<void> => {
    // 1. Send Internal Message
    const internalMsg = {
      senderId: 'SYSTEM',
      senderName: 'MDJ Planner',
      recipientId: newLeadEmail,
      content: `📢 TRANSFERT : ${senderName} t'a confié la responsabilité de "${activity.title}" (${activity.date}).`,
      timestamp: new Date()
    };
    await FirebaseService.sendMessage(internalMsg);

    // 2. Trigger Automated Email via Cloud Function
    const functions = getFunctions(app);
    const sendEmail = httpsCallable(functions, 'sendTransferNotification');
    try {
      await sendEmail({ activity, previousLead, newLead, newLeadEmail, senderName });
    } catch (error) {
      console.error("Failed to send transfer email:", error);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. INVENTORY & PURCHASING
  // ═══════════════════════════════════════════════════════════════════════════

  subscribeToInventory: (callback: (items: InventoryItem[]) => void): Unsubscribe => {
    if (!auth.currentUser) return () => { };
    const q = query(collection(db, "inventory_items"), orderBy("name", "asc"));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem));
      callback(items);
    }, (error: unknown) => {
      const email = auth.currentUser?.email || 'N/A';
      const msg = getErrorMessage(error);
      if (msg.toLowerCase().includes("permission")) {
        console.warn(`[Firestore] Inventory: Access restricted for ${email}`);
      } else {
        console.error(`[Firestore] Inventory sync error (${email}):`, msg);
      }
      callback([]); // Ensure loading finishes even on error
    });
  },

  getInventoryItem: async (id: string): Promise<InventoryItem | null> => {
    const docSnap = await getDoc(doc(db, "inventory_items", id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
    }
    return null;
  },

  saveInventoryItem: async (item: InventoryItem): Promise<void> => {
    const validated = InventoryItemSchema.parse(item);
    await setDoc(doc(db, "inventory_items", item.id), validated);
  },

  updateInventoryItemCondition: async (id: string, condition: 'Neuf' | 'Bon' | 'Usé' | 'À réparer' | 'Perdu'): Promise<void> => {
    await setDoc(doc(db, "inventory_items", id), { condition }, { merge: true });
  },

  deleteInventoryItem: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "inventory_items", id));
  },

  subscribeToReservations: (callback: (reservations: MaterialReservation[]) => void): Unsubscribe => {
    if (!auth.currentUser) return () => { };
    const q = collection(db, "material_reservations");
    return onSnapshot(q, (snapshot) => {
      const reservations = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MaterialReservation));
      callback(reservations);
    }, (error: unknown) => {
      const email = auth.currentUser?.email || 'N/A';
      const msg = getErrorMessage(error);
      if (msg.toLowerCase().includes("permission")) {
        console.warn(`[Firestore] Reservations: Access restricted for ${email}`);
      } else {
        console.error(`[Firestore] Reservations sync error (${email}):`, msg);
      }
      callback([]);
    });
  },

  saveReservation: async (res: MaterialReservation): Promise<void> => {
    const validated = MaterialReservationSchema.parse(res);
    await setDoc(doc(db, "material_reservations", res.id), validated);
  },

  updateReservationUsage: async (id: string, data: Partial<MaterialReservation>): Promise<void> => {
    await setDoc(doc(db, "material_reservations", id), data, { merge: true });
  },

  deleteReservation: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "material_reservations", id));
  },

  subscribeToPurchases: (callback: (requests: PurchaseRequest[]) => void): Unsubscribe => {
    if (!auth.currentUser) return () => { };
    const q = query(collection(db, "purchase_requests"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PurchaseRequest));
      callback(requests);
    }, (error: unknown) => {
      const email = auth.currentUser?.email || 'N/A';
      const msg = getErrorMessage(error);
      if (msg.toLowerCase().includes("permission")) {
        console.warn(`[Firestore] Purchases: Access restricted for ${email}`);
      } else {
        console.error(`[Firestore] Purchases sync error (${email}):`, msg);
      }
      callback([]);
    });
  },

  /**
   * PUSH NOTIFICATIONS (FCM)
   */
  requestMessagingPermission: async (): Promise<string | null> => {
    if (!messaging) return null;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        let token = null;
        try {
          const vKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'YOUR_PUBLIC_VAPID_KEY_HERE';
          if (vKey === 'YOUR_PUBLIC_VAPID_KEY_HERE') {
            console.warn("FCM: VAPID Key non configurée (VITE_FIREBASE_VAPID_KEY). Notifications push ignorées.");
            return null;
          }
          token = await getToken(messaging, { vapidKey: vKey });
        } catch (e) {
          console.warn("FCM Token failed: ", getErrorMessage(e));
        }
        if (token && auth.currentUser) {
          await FirebaseService.saveUserToken(auth.currentUser.email!, token);
        }
        return token;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
    return null;
  },

  saveUserToken: async (email: string, token: string) => {
    await setDoc(doc(db, "user_tokens", email), {
      token,
      updatedAt: Date.now()
    }, { merge: true });
  },

  onMessageListener: () =>
    new Promise((resolve) => {
      if (!messaging) return;
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }),

  savePurchaseRequest: async (req: PurchaseRequest): Promise<void> => {
    const validated = PurchaseRequestSchema.parse(req);
    await setDoc(doc(db, "purchase_requests", req.id), validated);
  },

  deletePurchaseRequest: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "purchase_requests", id));
  },

  setActivityConsumptionValidated: async (activityId: string, isValidated: boolean): Promise<void> => {
    await setDoc(doc(db, "activities", activityId), { consumptionValidated: isValidated }, { merge: true });
  },

  /**
   * Upload an avatar to Firebase Storage with timeout and error handling.
   */
  uploadAvatar: async (file: File, userEmail: string): Promise<string> => {
    const fileExt = file.name.split('.').pop() || 'png';
    const cleanEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const storageRef = ref(storage, `avatars/${cleanEmail}_${Date.now()}.${fileExt}`);

    console.log(`[Storage] Starting upload for ${userEmail} to bucket: ${storage.app.options.storageBucket}`);

    // Create a promise that rejects after 15 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: L'envoi de l'image prend trop de temps (vérifiez votre connexion ou les permissions Storage).")), 15000)
    );

    try {
      // Use uploadBytes with a timeout
      const uploadPromise = uploadBytes(storageRef, file);
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]) as any;
      
      console.log(`[Storage] Upload successful, generating download URL...`);
      return await getDownloadURL(snapshot.ref);
    } catch (error: any) {
      console.error("[Storage] Upload failed:", error);
      if (error.code === 'storage/unauthorized') {
        throw new Error("Accès refusé : Vérifiez les règles de sécurité Firebase Storage.");
      }
      if (error.code === 'storage/quota-exceeded') {
        throw new Error("Quota dépassé : Le stockage Firebase est plein.");
      }
      throw error;
    }
  }
};