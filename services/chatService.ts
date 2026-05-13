// import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import { app } from "./firebaseService"; // On importe l'app déjà prête

// Initialisation du modèle IA
// const vertexAI = getVertexAI(app);
// const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const ChatService = {
  sendMessage: async (message: string, history: ChatMessage[]): Promise<string> => {
    try {
      // Conversion de l'historique pour Gemini
      const chatHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      /*
      const chat = model.startChat({
        history: chatHistory,
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
      */
      return "Le service de chat est temporairement désactivé pour maintenance technique (Conflit SDK Firebase).";
    } catch (error) {
      console.error("Erreur Gemini:", error);
      return "Désolé, je rencontre des difficultés techniques pour répondre.";
    }
  }
};