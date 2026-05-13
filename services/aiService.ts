import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Activity } from "../types";
import { getErrorMessage } from "../lib/utils";
import { db } from "./firebaseService";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";
import { AIRequestSchema } from "../lib/validations/ai";
import { AI_CONFIG } from "../config/aiConfig";

/**
 * SERVICE IA (CLIENT-SIDE)
 * Connecté directement à Gemini via @google/generative-ai (Standard SDK)
 */

const API_KEY = AI_CONFIG.apiKey;
const genAI = new GoogleGenerativeAI(API_KEY);

const PRIMARY_MODEL = AI_CONFIG.model;

export const AIService = {

  /**
   * Initializes a chat session with tool definitions
   */
  startMentorChat: async (history: any[] = []) => {
    // Validate API connection
    const validation = AIRequestSchema.safeParse({
      prompt: "init", // Dummy prompt for validation
      apiKey: AI_CONFIG.apiKey,
      modelName: PRIMARY_MODEL
    });

    if (!validation.success) {
      console.error("AI Config Validation Error:", validation.error.format());
      throw new Error("Configuration IA invalide.");
    }

    const model = genAI.getGenerativeModel({
      model: PRIMARY_MODEL,
      systemInstruction: `
            TU ES LE 'MENTOR MDJ', UN ASSISTANT EXPERT EN COORDINATION CLINIQUE.
            MDJ: L'Escale Jeunesse (Trois-Rivières).
            RÉFÉRENCES OBLIGATOIRES: RMJQ (C.A.R., Par et Pour), Méthode F.A.I.T.S.
            
            MISSION:
            1. Conseiller l'équipe sur les interventions.
            2. Valider les intentions pédagogiques.
            3. Analyser les notes (Factuel vs Jugement).
            
            OUTILS:
            - get_calendar: Trouver des activités.
            - get_activity: Voir les détails d'un projet.
            - get_observations: Lire le journal de bord d'une activité.
            - update_note: Proposer une reformulation de note (Action sécurisée).
            - search_youth: Trouver des informations sur un jeune (Profil, alertes).
          `,
      tools: [{
        functionDeclarations: [
          {
            name: "get_calendar",
            description: "Récupère les activités prévues pour une période donnée.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                startDate: { type: SchemaType.STRING, description: "Date de début YYYY-MM-DD" },
                endDate: { type: SchemaType.STRING, description: "Date de fin YYYY-MM-DD" }
              },
              required: ["startDate", "endDate"]
            }
          },
          {
            name: "get_activity",
            description: "Détails complets d'une activité.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                activityId: { type: SchemaType.STRING, description: "ID activité" }
              },
              required: ["activityId"]
            }
          },
          {
            name: "get_observations",
            description: "Récupère les notes du journal de bord pour une activité.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                activityId: { type: SchemaType.STRING, description: "ID activité" }
              },
              required: ["activityId"]
            }
          },
          {
            name: "search_youth",
            description: "Recherche un jeune dans la base de données par son nom.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                query: { type: SchemaType.STRING, description: "Nom ou partie du nom" }
              },
              required: ["query"]
            }
          },
          {
            name: "update_note",
            description: "Met à jour une note d'observation dans une activité. À utiliser après avoir validé avec l'utilisateur.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                activityId: { type: SchemaType.STRING, description: "ID activité" },
                noteId: { type: SchemaType.STRING, description: "ID de la note (index ou uuid)" },
                text: { type: SchemaType.STRING, description: "Nouveau texte de la note" }
              },
              required: ["activityId", "noteId", "text"]
            }
          }
        ]
      }]
    }, { apiVersion: AI_CONFIG.apiVersion });

    return model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2000,
      },
    });
  },

  /**
   * TOOLS IMPLEMENTATIONS
   */
  tools: {
    // ... existing tools ...
    get_calendar: async (startDate: string, endDate: string) => {
      try {
        const q = query(
          collection(db, "activities"),
          where("date", ">=", startDate),
          where("date", "<=", endDate),
          orderBy("date", "asc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({
          id: d.id,
          title: d.data().title,
          date: d.data().date,
          type: d.data().type
        }));
      } catch (error) {
        console.error("Tool: get_calendar error:", error);
        return { error: "Impossible de récupérer le calendrier." };
      }
    },

    get_activity: async (activityId: string) => {
      try {
        const docRef = doc(db, "activities", activityId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        }
        return { error: "Activité non trouvée." };
      } catch (error) {
        console.error("Tool: get_activity error:", error);
        return { error: "Erreur lors de la récupération de l'activité." };
      }
    },

    get_observations: async (activityId: string) => {
      try {
        const docRef = doc(db, "activities", activityId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            notes: data.staffNotes || [],
            observations: data.observations || []
          };
        }
        return { error: "Aucune observation trouvée pour cette activité." };
      } catch (error) {
        console.error("Tool: get_observations error:", error);
        return { error: "Erreur lors de la récupération des notes." };
      }
    },

    search_youth: async (searchQuery: string) => {
      try {
        const q = query(
          collection(db, "members"),
          where("displayName", ">=", searchQuery),
          where("displayName", "<=", searchQuery + '\uf8ff')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({
          id: d.id,
          name: d.data().displayName,
          age: d.data().age,
          alerts: d.data().alerts || []
        }));
      } catch (error) {
        console.error("Tool: search_youth error:", error);
        return { error: "Erreur lors de la recherche du jeune." };
      }
    },

    update_note: async (activityId: string, noteId: string, text: string) => {
      try {
        const docRef = doc(db, "activities", activityId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return { error: "Activité introuvable." };

        const data = docSnap.data();
        const notes = [...(data.staffNotes || [])];

        // On cherche par index ou ID
        const index = parseInt(noteId);
        if (!isNaN(index) && notes[index]) {
          notes[index].text = text;
          notes[index].updatedBy = "Mentor IA";
          notes[index].updatedAt = new Date().toISOString();
        } else {
          // Si c'est un UUID, on cherche dans la liste
          const noteIndex = notes.findIndex(n => n.id === noteId);
          if (noteIndex !== -1) {
            notes[noteIndex].text = text;
            notes[noteIndex].updatedBy = "Mentor IA";
            notes[noteIndex].updatedAt = new Date().toISOString();
          } else {
            return { error: "Note introuvable." };
          }
        }

        // On ne met pas à jour directement pour l'instant (sécurité)
        // Mais on retourne le succès fictif pour le test du loop
        return { success: true, message: "Note reformulée avec succès (Simulation)." };
      } catch (error) {
        console.error("Tool: update_note error:", error);
        return { error: "Erreur lors de la mise à jour de la note." };
      }
    }
  },

  /**
 * Pose une question libre à l'IA (legacy fallback or simple mode)
 */
  askGemini: async (prompt: string): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL }, { apiVersion: AI_CONFIG.apiVersion });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "Réponse vide.";
    } catch (e: any) {
      console.error("[IA] Error:", e);
      return `Erreur technique : ${e.message}`;
    }
  },

  /**
   * Enrichit une activité existante
   */
  enrichActivity: async (activity: Partial<Activity>): Promise<string> => {
    try {
      const prompt = `
        Agis comme un animateur expert de Maison des Jeunes (12-17 ans).
        Voici une idée d'activité brute :
        - Titre : ${activity.title ?? "Sans titre"}
        - Description : ${activity.description ?? "Pas de description"}
        - Type : ${activity.type ?? "Général"}

        Propose-moi une version améliorée de cette activité incluant :
        1. Un titre plus "punché" et ado.
        2. Une description engageante pour lhoraire.
        3. Une liste de matériel nécessaire.
        Formatte la réponse en texte clair.
      `;

      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL }, { apiVersion: AI_CONFIG.apiVersion });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      return response.text() || "";
    } catch (error: unknown) {
      console.error("[AI] Enrichment error:", getErrorMessage(error));
      throw new Error(getErrorMessage(error));
    }
  }
};
