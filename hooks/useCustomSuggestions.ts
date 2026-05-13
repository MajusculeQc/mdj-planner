import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { AIIntelligenceService } from '../services/aiIntelligenceService';

export interface CustomSuggestions {
    youthTasks: string[];
    objectives: string[];
    evaluationCriteria: string[];
    materials: string[];
    [key: string]: string[];
}

const DEFAULT_DOC_PATH = 'settings/custom_suggestions';

export function useCustomSuggestions() {
    const [customSuggestions, setCustomSuggestions] = useState<CustomSuggestions>({
        youthTasks: [],
        objectives: [],
        evaluationCriteria: [],
        materials: [],
        hazards: [],
        safety: [],
        venueName: [],
        checklist: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, DEFAULT_DOC_PATH);
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data() as Partial<CustomSuggestions>;
                setCustomSuggestions({
                    youthTasks: data.youthTasks || [],
                    objectives: data.objectives || [],
                    evaluationCriteria: data.evaluationCriteria || [],
                    materials: data.materials || [],
                    hazards: data.hazards || [],
                    safety: data.safety || [],
                    venueName: data.venueName || [],
                    checklist: data.checklist || [],
                    ...data
                });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to custom suggestions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    /**
     * Adds an array of new suggestions to a specific category.
     * New values are validated, spell-checked using AI, deduplicated, and saved to Firestore.
     */
    const addSuggestions = useCallback(async (category: keyof CustomSuggestions, values: string[]) => {
        if (!values || values.length === 0) return;

        try {
            const docRef = doc(db, DEFAULT_DOC_PATH);
            const docSnap = await getDoc(docRef);

            const currentList: string[] = docSnap.exists() ? (docSnap.data()[category] || []) : [];
            const currentListLower = currentList.map(s => s.toLowerCase().trim());

            // Filter out empty values and ones that already exist locally (case insensitive)
            const toProcess = values
                .filter(v => v && v.trim())
                .filter(v => !currentListLower.includes(v.toLowerCase().trim()));

            if (toProcess.length === 0) return;

            // Spell check and format using AI
            const refinedValues: string[] = [];
            for (const val of toProcess) {
                const refined = await AIIntelligenceService.refineSuggestion(val);
                // Check again if the refined version already exists
                if (refined && !currentListLower.includes(refined.toLowerCase()) && !refinedValues.map(r => r.toLowerCase()).includes(refined.toLowerCase())) {
                    refinedValues.push(refined);
                }
            }

            if (refinedValues.length === 0) return;

            if (!docSnap.exists()) {
                await setDoc(docRef, { [category]: refinedValues }, { merge: true });
            } else {
                await updateDoc(docRef, {
                    [category]: arrayUnion(...refinedValues)
                });
            }
        } catch (error) {
            console.error(`Error adding custom suggestions to ${String(category)}:`, error);
        }
    }, []);

    return { customSuggestions, loading, addSuggestions };
}
