import { getFunctions, httpsCallable } from "firebase/functions";
import { FirebaseService } from "./firebaseService";
import { Activity } from "../types";

/**
 * SERVICE IA PRODUCTION (VERTEX AI via CLOUD FUNCTIONS)
 */
export const AIService = {
  
  enrichActivity: async (activity: Partial<Activity>): Promise<any> => {
    const app = FirebaseService.initialize();
    if (!app) throw new Error("Firebase non configuré.");
    
    const functions = getFunctions(app, 'us-central1');
    const enrichFn = httpsCallable(functions, 'enrichActivity');

    try {
      console.log("🚀 Appel IA (Backend)...");
      const result = await enrichFn({
        title: activity.title,
        date: activity.date,
        description: activity.description,
        type: activity.type
      });
      
      return result.data;
    } catch (error: any) {
      console.error("Erreur IA Backend:", error.message);
      throw error;
    }
  }
};