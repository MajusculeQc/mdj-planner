import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { AIService } from '../../services/aiService';
import { User as FirebaseUser } from 'firebase/auth';
import { EMPLOYEE_NAMES, MANAGEMENT_EMAILS } from '../../lib/constants';
import { getErrorMessage } from '../../lib/utils';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';

interface Props {
  currentUser: FirebaseUser | null;
  onClose: () => void;
  isOpen: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  userName: string;
  timestamp: number;
}

const ChatPanel: React.FC<Props> = memo(({ currentUser, onClose, isOpen }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userEmail = currentUser?.email?.toLowerCase() ?? '';
  const userName = EMPLOYEE_NAMES[userEmail] ?? currentUser?.displayName ?? 'Intervenant';
  const isExpert = (MANAGEMENT_EMAILS as readonly string[]).includes(userEmail);
  const memberInfo = { name: userName, isExpert };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  const chatSessionRef = useRef<any>(null);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating) return;

    const userMessageText = input.trim();

    // 1. User Message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
      userName: memberInfo.name,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      // 2. Initialize or reuse chat session
      if (!chatSessionRef.current) {
        chatSessionRef.current = await AIService.startMentorChat();
      }

      // 3. Clinical Context & Instructions
      const mentorInstruction = `
        RÔLE: Tu es le 'Mentor MDJ', un Assistant IA expert en coordination clinique et en intervention jeunesse. 
        CONTEXTE: Tu aides l'équipe de la MDJ L'Escale Jeunesse (Trois-Rivières). 
        INTERLOCUTEUR: ${memberInfo.name} (${memberInfo.isExpert ? "Direction" : "Intervenant"}).
        
        CAPACITÉS: Tu peux lire le calendrier et les activités. Si l'utilisateur pose une question sur une date ou une activité, utilise tes OUTILS.
        
        RÈGLES D'OR:
        - Applique le Cadre de référence RMJQ (C.A.R., Par et Pour).
        - Méthode F.A.I.T.S pour les notes (Factuel, Analytique, Impartial, Temporel, Spécifique).
        - Réponse courte, structurée, ton bienveillant.
      `;

      const prompt = messages.length === 0 ? `${mentorInstruction}\n\nUSER: ${userMessageText}` : userMessageText;
      let result = await chatSessionRef.current.sendMessage(prompt);
      let response = result.response;

      // 4. Tool Call Loop
      let iterations = 0;
      while (response.functionCalls()?.length > 0 && iterations < 5) {
        iterations++;
        const toolResults = [];

        for (const call of response.functionCalls()) {
          console.log(`[Mentor] Calling tool: ${call.name}`, call.args);
          const toolFn = (AIService.tools as any)[call.name];
          if (toolFn) {
            const toolResult = await toolFn(...Object.values(call.args));
            toolResults.push({
              functionResponse: {
                name: call.name,
                response: { content: toolResult }
              }
            });
          }
        }

        if (toolResults.length > 0) {
          result = await chatSessionRef.current.sendMessage(toolResults);
          response = result.response;
        } else {
          break;
        }
      }

      const aiResponseText = response.text() || "J'ai traité votre demande, mais je n'ai pas de commentaire particulier sur ces données.";

      // 5. Mentor Answer
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        userName: 'Mentor IA',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, newAiMsg]);

    } catch (error: unknown) {
      console.error('[Chat] Error:', getErrorMessage(error));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Désolé, j'ai une difficulté technique à accéder aux données cliniques. Réessaie dans un instant.",
        sender: 'ai',
        userName: 'Système',
        timestamp: Date.now()
      }]);
    } finally {
      setIsGenerating(false);
    }
  }, [input, isGenerating, memberInfo, messages.length, scrollToBottom]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-slate-200 dark:border-white/10 flex flex-col z-50 shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all animate-in slide-in-from-right">
      <ChatHeader userName={memberInfo.name} onClose={onClose} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-gray-950/50 custom-scrollbar transition-colors">
        {messages.length === 0 && (
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-600/20 flex-shrink-0 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/30 mt-1">
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-5 border border-slate-200 dark:border-indigo-500/20 text-sm text-slate-600 dark:text-gray-300 shadow-sm dark:shadow-lg relative overflow-hidden transition-all">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl"></div>
                <p className="mb-3 font-bold text-slate-900 dark:text-white text-base">Bonjour {memberInfo.name} ! 👋</p>
                <p className="mb-3 leading-relaxed">Je suis votre <strong>Assistant IA</strong> dédié. Je combine le Cadre de référence de la RMJQ avec les données de votre planificateur.</p>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">Je peux vous aider à :</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>Valider l'intention pédagogique d'une activité.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>Reformuler une note d'observation (Faits vs Jugements).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>Questions techniques sur l'outil.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} isAI={msg.sender === 'ai'} />
        ))}

        {isGenerating && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="flex items-center gap-2 mb-1 px-1">
              <Bot className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 font-bold uppercase">L'IA réfléchit...</span>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-indigo-500/20 rounded-2xl rounded-tl-none p-4 flex gap-3 items-center shadow-sm transition-all">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">Analyse du cadre de référence...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="p-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-gray-900 transition-colors">
        <MessageInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Posez une question clinique, technique ou sur la RMJQ..."
          isLoading={isGenerating}
          colorScheme="indigo"
        />
        <p className="text-[9px] text-slate-400 dark:text-gray-500 text-center mt-3 flex justify-center gap-2 font-medium">
          <span>IA générative expérimentale</span> • <span>Vérifiez les informations critiques</span>
        </p>
      </footer>
    </div>
  );
});

ChatPanel.displayName = 'ChatPanel';

export default ChatPanel;