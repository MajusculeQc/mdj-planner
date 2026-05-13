import { GoogleGenerativeAI } from "@google/generative-ai";
import { Activity } from "../types";
import { AI_CONFIG } from "../config/aiConfig";

const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);

export const AIIntelligenceService = {
    /**
     * Refine raw notes into a structured Journal de Bord entry.
     */
    refineJDBNotes: async (rawNotes: string, activityTitle: string): Promise<string> => {
        if (!rawNotes.trim()) return "";

        try {
            const model = genAI.getGenerativeModel({ model: AI_CONFIG.model }, { apiVersion: AI_CONFIG.apiVersion });

            const prompt = `
          Tu es un assistant expert pour une Maison des Jeunes (MDJ). 
          Ta tâche est de transformer les notes brutes d'un intervenant en un compte-rendu professionnel, structuré et empathique pour le Journal de Bord.

          Titre de l'activité: ${activityTitle}
          Notes brutes: "${rawNotes}"

          Instructions:
          1. Organise le texte par points clairs (Déroulement, Faits saillants, Observations).
          2. Utilise un ton professionnel mais qui reflète la réalité du milieu communautaire.
          3. Ne change pas les faits, améliore seulement la structure et la clarté.
          4. Garde le texte concis.
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text() || "";
        } catch (error) {
            console.error("AI Refinement Error:", error);
            // Fallback for critical tasks
            try {
                const model = genAI.getGenerativeModel({ model: AI_CONFIG.model }, { apiVersion: AI_CONFIG.apiVersion });
                const result = await model.generateContent(`Refine these notes: ${rawNotes}`);
                const response = await result.response;
                return response.text() || "";
            } catch (fallbackError) {
                throw new Error("Impossible de raffiner les notes via l'IA.");
            }
        }
    },

    /**
     * Analyze social climate across multiple activities.
     */
    analyzeSocialClimate: async (activities: Activity[]): Promise<string> => {
        if (activities.length === 0) return "Aucune donnée à analyser.";

        const summaryData = activities.map(a => ({
            date: a.date,
            title: a.title,
            climate: a.clinicalObservations?.groupClimate || [],
            notes: a.clinicalObservations?.groupDynamicsNotes || ""
        }));

        try {
            const model = genAI.getGenerativeModel({ model: AI_CONFIG.model }, { apiVersion: AI_CONFIG.apiVersion });

            const prompt = `
          Analyse les données suivantes provenant de plusieurs interventions en Maison des Jeunes pour dégager une synthèse du climat social de la période.
          
          Données: ${JSON.stringify(summaryData)}

          Instructions:
          1. Identifie les tendances d'ambiance récurrentes.
          2. Repère les défis ou tensions qui reviennent.
          3. Souligne les points positifs ou succès d'intervention.
          4. Rédige un court paragraphe de synthèse (max 300 mots).
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text() || "Analyse indisponible.";
        } catch (error) {
            console.error("AI Social Climate Analysis Error:", error);
            throw new Error("Impossible d'analyser le climat social.");
        }
    },

    /**
     * Refine and spell-check a short suggestion (task, objective, etc.)
     */
    refineSuggestion: async (rawText: string): Promise<string> => {
        if (!rawText || !rawText.trim()) return "";
        try {
            const prompt = `Corrige les fautes d'orthographe et reformule de façon courte, affirmative et professionnelle cette courte phrase/expression (qui est soit une tâche, soit un objectif, soit du matériel). Ne retourne QUE le texte corrigé, sans guillemets, sans point final, sans commentaires, et avec une majuscule au début.\n\nTexte brut: "${rawText}"`;

            const model = genAI.getGenerativeModel({ model: AI_CONFIG.model }, { apiVersion: AI_CONFIG.apiVersion });
            const result = await model.generateContent(prompt);
            const response = await result.response;

            return (response.text() || rawText).trim().replace(/^["']|["']$/g, '');
        } catch (error) {
            console.error("AI Refine Suggestion Error:", error);
            const trimmed = rawText.trim();
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        }
    },

    /**
     * Specifically correct spelling, grammar and syntax errors.
     * Preserves the user's intent and tone, but makes it professional and correct.
     */
    correctText: async (text: string): Promise<string> => {
        if (!text || !text.trim()) return "";
        try {
            const model = genAI.getGenerativeModel({ model: AI_CONFIG.model }, { apiVersion: AI_CONFIG.apiVersion });

            const prompt = `
          Tu es un correcteur expert en langue française spécialisé dans le milieu communautaire et de la jeunesse.
          Ta mission est de corriger les fautes d'orthographe, de grammaire, de syntaxe et de ponctuation du texte suivant.
          
          Règles strictes:
          1. Conserve le sens original et le ton de l'auteur.
          2. Ne reformule pas inutilement, sauf si la syntaxe est vraiment problématique.
          3. Retourne UNIQUEMENT le texte corrigé, sans commentaires, sans guillemets autour.
          4. Si le texte est déjà correct, retourne-le tel quel.
          
          Texte à corriger: "${text}"
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return (response.text() || text).trim().replace(/^["']|["']$/g, '');
        } catch (error) {
            console.error("AI Spelling Correction Error:", error);
            return text;
        }
    }
};
