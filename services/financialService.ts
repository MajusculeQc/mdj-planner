import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from './firebaseService';
import { FinancialHealth } from '../types';
import { FinancialHealthSchema } from '../lib/schemas';

const FINANCIAL_COLLECTION = 'financial_health';

export const fetchFinancialHealthForYear = async (year: number): Promise<FinancialHealth | null> => {
    try {
        const q = query(collection(db, FINANCIAL_COLLECTION), where('year', '==', year));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const data = snapshot.docs[0].data();
        const parsed = FinancialHealthSchema.safeParse(data);
        if (parsed.success) {
            return parsed.data;
        } else {
            console.error(`Invalid financial data for year ${year}:`, parsed.error);
            return null;
        }
    } catch (error) {
        console.error("Error fetching financial health:", error);
        throw error;
    }
};

export const saveFinancialHealth = async (data: Omit<FinancialHealth, 'id'>, id?: string): Promise<FinancialHealth> => {
    try {
        // Use provided ID or generate a new one based on the year to ensure one record per year
        const docId = id || `financial_${data.year}`;
        const ref = doc(db, FINANCIAL_COLLECTION, docId);

        const healthData: FinancialHealth = {
            ...data,
            id: docId,
            updatedAt: Date.now()
        };

        const validated = FinancialHealthSchema.parse(healthData);
        await setDoc(ref, validated, { merge: true }); // Merge to update existing or create new
        return validated;
    } catch (error) {
        console.error("Error saving financial health:", error);
        throw error;
    }
};
