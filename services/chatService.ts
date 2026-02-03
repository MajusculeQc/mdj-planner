import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getFirestore, Firestore } from "firebase/firestore";
import { FirebaseService } from "./firebaseService";

/**
 * Service de Chat Collaboratif
 * Implémente la logique temps réel décrite dans le guide.
 */
export const ChatService = {
    
    getDb: (): Firestore => {
        const app = FirebaseService.initialize();
        if (!app) throw new Error("Firebase non initialisé");
        return getFirestore(app);
    },

    /**
     * Écoute les messages d'une session spécifique en temps réel.
     */
    subscribeToMessages: (sessionId: string, callback: (msgs: any[]) => void) => {
        try {
            const db = ChatService.getDb();
            const messagesRef = collection(db, "sessions", sessionId, "messages");
            
            // Tri par date pour l'ordre chronologique
            const q = query(messagesRef, orderBy("createdAt", "asc"));

            return onSnapshot(q, (snapshot) => {
                const messages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(messages);
            }, (error) => {
                console.error("Erreur Chat:", error);
            });
        } catch (e) {
            console.error("Impossible de s'abonner au chat (Hors ligne ?)", e);
            return () => {};
        }
    },

    /**
     * Envoie un message (Utilisateur ou IA) à la base de données partagée.
     */
    sendMessage: async (sessionId: string, text: string, role: 'user' | 'model', userName: string = 'Système') => {
        const db = ChatService.getDb();
        const messagesRef = collection(db, "sessions", sessionId, "messages");
        
        await addDoc(messagesRef, {
            text: text,
            role: role,
            createdAt: serverTimestamp(),
            user: userName,
            timestamp: Date.now() // Fallback pour le tri si serverTimestamp est en attente
        });
    }
};