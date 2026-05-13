/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURATION IA CENTRALE
 * ═══════════════════════════════════════════════════════════════════════════
 * Ce fichier permet de changer le modèle Gemini utilisé dans toute l'app
 * en un seul endroit.
 */

export const AI_CONFIG = {
    // La clé API est récupérée depuis .env.local (VITE_GEMINI_API_KEY)
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",

    // MODÈLE ACTIF : Changez cette valeur pour basculer entre Flash et Pro
    // Valeurs communes : 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'
    model: 'gemini-1.5-flash',

    // Version de l'API (v1beta offre souvent une meilleure compatibilité pour les outils/instructions)
    apiVersion: 'v1beta' as const,

    // Paramètres par défaut
    defaults: {
        temperature: 1.0,
        maxOutputTokens: 2048,
    }
};
