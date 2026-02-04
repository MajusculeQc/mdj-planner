import { model } from "./firebaseService";
import { Activity } from "../types";

/**
 * SERVICE IA (CLIENT-SIDE)
 * Connecté directement à Gemini via firebaseService.ts
 */
export const AIService = {

  /**
   * Pose une question libre à l'IA (utilisé pour le ChatPanel)
   */
  askGemini: async (prompt: string): Promise<string> => {
    try {
      console.log("🚀 Envoi à Gemini...", prompt);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error("Erreur Gemini:", error);
      return "Désolé, je n'ai pas pu joindre le cerveau de la MDJ (Erreur de connexion).";
    }
  },

  /**
   * Enrichit une activité existante (Génère une meilleure description, etc.)
   * Remplace ton ancienne fonction "enrichActivity"
   */
  enrichActivity: async (activity: Partial<Activity>): Promise<string> => {
    try {
      // On construit un prompt contextuel pour l'IA
      const prompt = `
        Agis comme un animateur expert de Maison des Jeunes (12-17 ans).
        Voici une idée d'activité brute :
        - Titre : ${activity.title || "Sans titre"}
        - Description : ${activity.description || "Pas de description"}
        - Type : ${activity.type || "Général"}

        Propose-moi une version améliorée de cette activité incluant :
        1. Un titre plus "punché" et ado.
        2. Une description engageante pour l'horaire.
        3. Une liste de matériel nécessaire.
        Formatte la réponse en texte clair.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error("Erreur lors de l'enrichissement:", error);
      throw error;
    }
  }
};