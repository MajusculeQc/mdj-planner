import React from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MessengerHeaderProps {
    activeTab: 'general' | 'private';
    onTabChange: (tab: 'general' | 'private') => void;
    contextId?: string;
    recipientName?: string;
    className?: string;
}

export const MessengerHeader: React.FC<MessengerHeaderProps> = ({
    activeTab,
    onTabChange,
    contextId,
    recipientName,
    className
}) => {
    return (
        <header className={cn("border-b border-slate-100 dark:border-white/10 bg-white/5 transition-colors", className)}>
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 transition-all">
                        <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide uppercase">
                            {activeTab === 'general' ? (contextId ? `Discussion - ${contextId}` : "Messagerie Interne") : `Privé - ${recipientName || 'Sélect.'}`}
                        </h3>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-300/60 font-bold uppercase tracking-widest mt-0.5">
                            {activeTab === 'general' ? "Équipe de l'Escale" : "Discussion Directe"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-green-500 uppercase">En ligne</span>
                </div>
            </div>

            {/* Tabs selection */}
            <div className="flex px-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 transition-colors">
                <button
                    onClick={() => onTabChange('general')}
                    className={cn(
                        "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
                        activeTab === 'general' ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-white" : "border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300"
                    )}
                >
                    Équipe
                </button>
                <button
                    onClick={() => onTabChange('private')}
                    className={cn(
                        "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
                        activeTab === 'private' ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-white" : "border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300"
                    )}
                >
                    Messages Privés
                </button>
            </div>
        </header>
    );
};
