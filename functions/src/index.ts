import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

admin.initializeApp();

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const LOCATION = 'us-central1';
const MODEL_NAME = 'gemini-3-pro-preview';

const vertexAI = new VertexAI({ project: PROJECT_ID!, location: LOCATION });
const generativeModel = vertexAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: {
    temperature: 1.0,
    topP: 0.95,
    maxOutputTokens: 4000,
    responseMimeType: 'application/json',
  },
});

const MDJ_ADDRESS = "5225 Rue de Courcelette, Trois-Rivières, QC G8Z 1K8";

/**
 * Fonction d'enrichissement global d'activité (Production-grade)
 */
export const enrichActivity = functions.https.onCall(async (data, context) => {
  // 1. Sécurité : Vérifier l'authentification et App Check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Utilisateur non connecté.');
  }

  const { title, date, description, type } = data;

  const systemInstruction = `Tu es l'expert coordinateur de la MDJ La Piaule à Trois-Rivières.
  Ton rôle est de transformer une idée brute en plan d'activité professionnel conforme aux standards du RMJQ.
  
  CONTEXTE:
  - Adresse source: ${MDJ_ADDRESS}
  - Public: Jeunes 12-17 ans.
  - Objectif: Rendre les jeunes Critiques, Actifs et Responsables.
  
  STRUCTURE JSON REQUISE:
  {
    "description": "Texte engageant pour les jeunes",
    "objectives": ["string x3"],
    "youthTasks": ["string x3"],
    "logistics": { "venueName": "string", "address": "string", "transportRequired": boolean, "distance": "string", "travelTime": "string" },
    "materials": [{ "item": "string", "quantity": "string", "supplier": "MDJ|Achat" }],
    "riskManagement": { "hazards": ["string"], "safetyProtocols": ["string"] },
    "budget": { "estimatedCost": number, "items": [{ "description": "string", "amount": number }] },
    "rmjqDimensions": ["string"]
  }`;

  const prompt = `Génère le plan complet pour l'activité: "${title}" le ${date}. 
  Description actuelle: ${description || 'À définir'}
  Type d'activité: ${type}`;

  try {
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\n" + prompt }] }],
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Réponse IA vide.");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de la génération IA.');
  }
});
