import React from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatMessageProps {
    msg: {
        id: string;
        text: string;
        userName: string;
        timestamp: number;
    };
    isAI: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ msg, isAI }) => {
    return (
        <div className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2", isAI ? 'items-start' : 'items-end')}>
            <div className="flex items-center gap-2 mb-1 px-1">
                {isAI ? <Bot className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> : <User className="w-3 h-3 text-slate-400 dark:text-gray-400" />}
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", isAI ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500')}>{msg.userName}</span>
            </div>
            <div
                className={cn("max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm dark:shadow-lg transition-all", isAI
                    ? 'bg-white dark:bg-gray-800 border border-slate-200 dark:border-indigo-500/20 text-slate-700 dark:text-gray-200 rounded-tl-none relative overflow-hidden'
                    : 'bg-indigo-600 dark:bg-white/10 border border-indigo-500 dark:border-white/5 text-white dark:text-white text-right rounded-tr-none'
                )}
            >
                {isAI && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-500/50"></div>}
                <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
        </div>
    );
};
