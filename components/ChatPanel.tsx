import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, User, Bot, Loader2, MessageSquare } from 'lucide-react';
import { AIService } from '../services/aiService'; // On utilise le service qu'on a réparé ensemble
import { User as FirebaseUser } from 'firebase/auth';

interface Props {
  currentUser: FirebaseUser | null;
  onClose: () => void;
  isOpen: boolean;
}

// Interface locale pour les messages (en attendant que ChatService soit prêt)
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  userName: string;
  timestamp: number;
}

const ChatPanel: React.FC<Props> = ({ currentUser, onClose, isOpen }) => {
  // On utilise un état local pour l'instant pour garantir que ça marche tout de suite
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas quand un message arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessageText = input.trim();
    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Anonyme';
    
    // 1. On affiche immédiatement le message de l'utilisateur
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
      userName: userName,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      // 2. Appel à notre AIService simplifié
      // On construit un petit contexte pour que l'IA comprenne son rôle
      const contextPrompt = `
        Tu es l'assistant de la MDJ (Maison des Jeunes). 
        L'utilisateur ${userName} te dit : "${userMessageText}".
        Réponds de manière utile, concise et adaptée à une équipe d'animation.
      `;

      const aiResponseText = await AIService.askGemini(contextPrompt);

      // 3. On affiche la réponse de l'IA
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        userName: 'Gemini AI',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, newAiMsg]);

    } catch (error) {
      console.error("Erreur chat:", error);
      // Petit message d'erreur dans le chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Oups, je n'ai pas réussi à joindre le cerveau de la MDJ.",
        sender: 'ai',
        userName: 'Système',
        timestamp: Date.now()
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  // Note: J'ai remplacé les couleurs "bg-mdj-..." par des couleurs Tailwind standard (gray-900, etc.)
  // pour être sûr que ça s'affiche bien même si ton fichier de config Tailwind n'est pas complet.
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-fuchsia-500/10 rounded-lg border border-fuchsia-500/20">
                <Sparkles className="w-5 h-5 text-fuchsia-400 animate-pulse" />
            </div>
            <div>
                <h3 className="font-bold text-white text-sm">Assistant MDJ</h3>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> En ligne
                </p>
            </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-900/50">
        {messages.length === 0 && (
            <div className="text-center py-10 opacity-50">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-600"/>
                <p className="text-xs text-gray-400">Aucun message. Lance la discussion !</p>
            </div>
        )}
        
        {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            const isAI = msg.sender === 'ai';
            
            return (
                <div key={msg.id} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                        {isAI ? <Bot className="w-3 h-3 text-cyan-400"/> : <User className="w-3 h-3 text-gray-400"/>}
                        <span className="text-[10px] text-gray-400 font-bold">{msg.userName}</span>
                    </div>
                    <div 
                        className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                            isAI 
                                ? 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none' 
                                : 'bg-cyan-900/30 border border-cyan-500/30 text-cyan-100 rounded-tr-none'
                        }`}
                    >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                </div>
            );
        })}
        
        {isGenerating && (
            <div className="flex flex-col items-start">
                 <div className="flex items-center gap-2 mb-1 px-1">
                    <Bot className="w-3 h-3 text-cyan-400"/>
                    <span className="text-[10px] text-gray-400 font-bold">Gemini AI</span>
                </div>
                <div className="bg-gray-800 border border-gray-700 text-gray-400 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-fuchsia-400" />
                    Analyse en cours...
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50 backdrop-blur-md">
        <form onSubmit={handleSend} className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pose ta question..."
                disabled={isGenerating}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all outline-none"
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isGenerating}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
        </form>
        <div className="text-[9px] text-gray-600 text-center mt-2">
            Propulsé par Google Gemini
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;