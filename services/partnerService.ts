import { db } from './firebaseService';
import { collection, doc, getDocs, setDoc, query, orderBy } from 'firebase/firestore';

const COLLECTION_NAME = 'custom_partners';

export interface CustomPartner {
    id: string;
    name: string;
    category: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    facebook?: string;
    updatedAt: number;
}

export const PartnerService = {
    /**
     * Fetches all custom partners from Firestore.
     */
    getAll: async (): Promise<CustomPartner[]> => {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomPartner));
        } catch (error) {
            console.error("Error fetching custom partners:", error);
            return [];
        }
    },

    /**
     * Saves or updates a custom partner.
     */
    save: async (partner: Omit<CustomPartner, 'updatedAt'>): Promise<void> => {
        try {
            const partnerData: CustomPartner = {
                ...partner,
                updatedAt: Date.now()
            };
            await setDoc(doc(db, COLLECTION_NAME, partner.id), partnerData, { merge: true });
        } catch (error) {
            console.error("Error saving custom partner:", error);
            throw new Error("Impossible d'enregistrer le partenaire.");
        }
    }
};
