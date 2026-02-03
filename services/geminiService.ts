import { GoogleGenAI } from "@google/genai";
import { Activity } from "../types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMINI AI SERVICE - UPDATED FOR @google/genai SDK
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MDJ_ADDRESS = "5225 Rue de Courcelette, Trois-Rivières, QC G8Z 1K8";

const CONFIG = {
  MODEL: 'gemini-3-flash-preview', 
  TIMEOUT: 30000, 
  MAX_RETRIES: 3,
  TEMPERATURE: 1.0, 
  MAX_OUTPUT_TOKENS: 2048,
} as const;

export interface GenerateOptions {
  prompt: string;
  useSearch?: boolean;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

const parseAIResponse = (text: string | undefined): any | null => {
  if (!text) return null;
  try {
    let cleanText = text.trim();
    const codeBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      cleanText = codeBlockMatch[1].trim();
    }
    const jsonMatch = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      // Si on attend du JSON mais qu'on a du texte, on ne log pas d'erreur critique, 
      // car le Chat utilise ce service pour du texte libre aussi.
      return null;
    }
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
};

const getAPIKey = (): string | undefined => {
  // @ts-ignore
  if (typeof process !== 'undefined' && process?.env?.API_KEY) return process.env.API_KEY;
  // @ts-ignore
  if (typeof window !== 'undefined' && window.process?.env?.API_KEY) return window.process.env.API_KEY;
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
  return undefined;
};

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const GeminiService = {

  /**
   * Core generation function made public for ChatService usage.
   */
  generateWithRetry: async (options: GenerateOptions): Promise<string | null> => {
    const apiKey = getAPIKey();
    if (!apiKey) {
      console.error("❌ API Key missing");
      return "Erreur: Clé API manquante. Veuillez vérifier la configuration.";
    }

    const ai = new GoogleGenAI({ apiKey });

    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      try {
        console.log(`🤖 AI Generation - Attempt ${attempt}`);
        
        const config: any = {
          temperature: options.temperature ?? CONFIG.TEMPERATURE,
          maxOutputTokens: options.maxTokens ?? CONFIG.MAX_OUTPUT_TOKENS,
        };

        if (options.jsonMode) {
          config.responseMimeType = "application/json";
        }

        const response = await ai.models.generateContent({
          model: CONFIG.MODEL,
          contents: options.prompt,
          config: config
        });

        const text = response.text;
        if (!text) throw new Error("Empty response");
        return text;

      } catch (error: any) {
        console.warn(`⚠️ Attempt ${attempt} failed:`, error.message || error);
        if (attempt < CONFIG.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          console.error("❌ All attempts failed");
        }
      }
    }
    return null;
  },
  
  generatePedagogy: async (title: string, currentDesc: string) => {
    const prompt = `Tu es un expert en animation jeunesse.
    ACTIVITÉ: "${title}"
    DESCRIPTION: "${currentDesc}"
    
    Génère un JSON avec: description (40-60 mots, ton jeune), objectives (3 verbes d'action), youthTasks (3 tâches), evaluationCriteria (2 questions).`;
    
    const text = await GeminiService.generateWithRetry({ prompt, jsonMode: true });
    return parseAIResponse(text);
  },

  generateLogistics: async (title: string, venueName: string) => {
    const target = venueName?.length > 2 ? venueName : title;
    const prompt = `Planificateur Trois-Rivières.
    LIEU/ACTIVITÉ: "${target}"
    DEPUIS: ${MDJ_ADDRESS}
    
    Trouve ou estime: venueName, address, phoneNumber, website, distance (km), travelTime (min), transportRequired (bool), transportMode.
    JSON uniquement.`;

    const text = await GeminiService.generateWithRetry({ prompt, jsonMode: true });
    return parseAIResponse(text);
  },

  generateMaterials: async (title: string, description: string) => {
    const prompt = `Liste matériel pour: "${title}".
    JSON structure: { materials: [{ item, quantity, supplier: "MDJ"|"Achat" }] }`;

    const text = await GeminiService.generateWithRetry({ prompt, jsonMode: true });
    return parseAIResponse(text);
  },

  generateRisks: async (title: string, type: string) => {
    const prompt = `Analyse risques activité jeunesse: "${title}" (${type}).
    JSON structure: { hazards: [], safetyProtocols: [], requiredInsurance: string }`;

    const text = await GeminiService.generateWithRetry({ prompt, jsonMode: true });
    return parseAIResponse(text);
  },

  generateStaffing: async (title: string, type: string) => {
    const prompt = `Encadrement activité jeunesse: "${title}" (${type}).
    JSON structure: { requiredRatio, specialQualifications, supportRole }`;

    const text = await GeminiService.generateWithRetry({ prompt, jsonMode: true });
    return parseAIResponse(text);
  },

  generateBudget: async (title: string, materials: any[]) => {
    const matList = materials?.map(m => m.item).join(", ") || "Standard";
    const prompt = `Estime budget Trois-Rivières 2024 pour: "${title}". Matériel: ${matList}.
    JSON structure: { estimatedCost: number, items: [{ description, amount }] }`;

    const text = await GeminiService.generateWithRetry({ prompt, jsonMode: true });
    return parseAIResponse(text);
  },

  generateChecklist: async (title: string, desc: string) => {
    const prompt = `Dimensions RMJQ pour: "${title}".
    Choisis parmi: Relationnel, Éducatif, Créatif, Physique, Communautaire.
    JSON: { rmjqDimensions: string[] }`;

    const text = await GeminiService.generateWithRetry({ prompt, jsonMode: true });
    return parseAIResponse(text);
  },

  enrichActivityGlobal: async (activity: Activity) => {
    const prompt = `Coordonnateur MDJ La Piaule Trois-Rivières.
    Complète TOUTES les sections pour: "${activity.title}" (${activity.date}).
    Description actuelle: ${activity.description}
    Lieu: ${activity.logistics?.venueName}

    Génère un JSON complet avec:
    - description (engageante)
    - objectives (3)
    - youthTasks (3)
    - logistics (venueName, address, transport details vs ${MDJ_ADDRESS})
    - materials (5-8 items)
    - riskManagement (hazards, protocols, insurance)
    - staffing (ratio, quals)
    - budget (estimatedCost, items)
    - evaluationCriteria (2)
    - rmjqDimensions (2-3)

    Utilise des données réalistes. JSON strict.`;

    const text = await GeminiService.generateWithRetry({ 
      prompt, 
      jsonMode: true,
      maxTokens: 4000 
    });
    
    return parseAIResponse(text);
  },

  healthCheck: async () => {
    const text = await GeminiService.generateWithRetry({ prompt: "Hello", maxTokens: 5 });
    return {
      status: text ? 'healthy' : 'unhealthy',
      details: text ? `Connected to ${CONFIG.MODEL}` : 'Connection failed'
    };
  }
};

export default GeminiService;