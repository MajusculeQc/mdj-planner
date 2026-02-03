import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, User, Bot, Loader2, MessageSquare } from 'lucide-react';
import { ChatService } from '../services/chatService';
import { GeminiService } from '../services/geminiService';
import { User as FirebaseUser } from 'firebase/auth';

interface Props {
  currentUser: FirebaseUser | null;
  onClose: () => void;
  isOpen: boolean;
}

const SESSION_ID = "general-planning-2026"; // Pour l'instant, une seule salle commune pour toute l'équipe

const ChatPanel: React.FC<Props> = ({ currentUser, onClose, isOpen }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Abonnement au Chat Temps Réel
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const unsubscribe = ChatService.subscribeToMessages(SESSION_ID, (msgs) => {
        setMessages(msgs);
        scrollToBottom();
    });

    return () => unsubscribe();
  }, [isOpen, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !currentUser) return;

    const userMessage = input.trim();
    const userName = currentUser.displayName || currentUser.email || 'Anonyme';
    
    setInput('');
    setIsGenerating(true);

    try {
        // 1. Envoyer le message utilisateur à Firestore (Visible par tous instantanément)
        await ChatService.sendMessage(SESSION_ID, userMessage, 'user', userName);

        // 2. Appeler Gemini (Client-side simulation of backend workflow)
        // Dans une architecture parfaite, ceci serait fait par une Cloud Function.
        // Ici, le client qui a posé la question se charge de générer la réponse pour tout le monde.
        
        const prompt = `Contexte: Tu es un assistant pédagogique pour une Maison de Jeunes (MDJ). 
        L'équipe discute de planification d'activités. Sois concis, créatif et utile.
        
        Question de ${userName}: ${userMessage}`;

        // Utilisation du GeminiService existant mais en mode texte brut
        const aiResponseText = await GeminiService.generateWithRetry({ 
            prompt: prompt, 
            jsonMode: false,
            maxTokens: 1000
        });

        if (aiResponseText) {
            // 3. Sauvegarder la réponse de l'IA dans Firestore (Visible par tous)
            await ChatService.sendMessage(SESSION_ID, aiResponseText, 'model', 'Gemini AI');
        }

    } catch (error) {
        console.error("Erreur chat:", error);
    } finally {
        setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-mdj-dark border-l border-white/10 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-mdj-black/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-mdj-magenta/10 rounded-lg border border-mdj-magenta/20">
                <Sparkles className="w-5 h-5 text-mdj-magenta animate-pulse" />
            </div>
            <div>
                <h3 className="font-bold text-white text-sm">Assistant Collaboratif</h3>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> En direct
                </p>
            </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-mdj-black/30">
        {messages.length === 0 && (
            <div className="text-center py-10 opacity-50">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-600"/>
                <p className="text-xs text-gray-400">Aucun message. Lancez la discussion !</p>
            </div>
        )}
        
        {messages.map((msg) => {
            const isMe = msg.user === (currentUser?.displayName || currentUser?.email);
            const isAI = msg.role === 'model';
            
            return (
                <div key={msg.id} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                        {isAI ? <Bot className="w-3 h-3 text-mdj-cyan"/> : <User className="w-3 h-3 text-gray-400"/>}
                        <span className="text-[10px] text-gray-400 font-bold">{msg.user}</span>
                    </div>
                    <div 
                        className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                            isAI 
                                ? 'bg-mdj-dark border border-white/10 text-gray-200 rounded-tl-none' 
                                : 'bg-mdj-cyan/10 border border-mdj-cyan/20 text-mdj-cyan rounded-tr-none'
                        }`}
                    >
                        {msg.text}
                    </div>
                </div>
            );
        })}
        
        {isGenerating && (
            <div className="flex flex-col items-start">
                 <div className="flex items-center gap-2 mb-1 px-1">
                    <Bot className="w-3 h-3 text-mdj-cyan"/>
                    <span className="text-[10px] text-gray-400 font-bold">Gemini AI</span>
                </div>
                <div className="bg-mdj-dark border border-white/10 text-gray-400 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-mdj-magenta" />
                    Analyse en cours...
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-mdj-black/50 backdrop-blur-md">
        <form onSubmit={handleSend} className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Discuter avec l'équipe & Gemini..."
                disabled={isGenerating}
                className="w-full bg-mdj-dark border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-mdj-magenta focus:border-mdj-magenta transition-all"
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isGenerating}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-mdj-magenta text-white rounded-lg hover:bg-magenta-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
        </form>
        <div className="text-[9px] text-gray-600 text-center mt-2">
            Les réponses de l'IA sont partagées avec toute l'équipe.
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;