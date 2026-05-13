import React from 'react';
import { Bot, Sparkles, BrainCircuit, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatHeaderProps {
    userName: string;
    onClose: () => void;
    className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ userName, onClose, className }) => {
    return (
        <div className={cn("p-6 border-b border-slate-100 dark:border-white/10 bg-white dark:bg-gray-900 relative overflow-hidden transition-colors", className)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center relative shadow-sm dark:shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all">
                        <Bot className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight flex items-center gap-2">
                            Mentor MDJ <Sparkles className="w-3 h-3 text-amber-500 dark:text-yellow-400" />
                        </h3>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                            <BrainCircuit className="w-3 h-3" /> Assistant IA Clinique
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
