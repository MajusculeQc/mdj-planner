import React from 'react';
import { History } from 'lucide-react';
import { Activity } from '../../types';
import { cn } from '../../lib/utils';

interface JournalTabProps {
    activity: Activity;
}

const JournalTab: React.FC<JournalTabProps> = ({ activity }) => {
    const changelog = activity.changelog || [];

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center">
                        <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Journal des modifications</h3>
                        <p className="text-xs text-slate-500 dark:text-gray-500">Historique de toutes les modifications apportées à cette activité</p>
                    </div>
                </div>

                {changelog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/5">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                            <History className="w-8 h-8 text-slate-400 dark:text-gray-600" />
                        </div>
                        <p className="text-slate-500 dark:text-gray-400 font-medium">Aucune modification enregistrée</p>
                        <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">Les modifications futures seront affichées ici</p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-purple-500/40 via-slate-200 dark:via-white/5 to-transparent"></div>
                        <div className="space-y-1">
                            {[...changelog].reverse().map((entry, idx) => {
                                const date = new Date(entry.timestamp);
                                const formattedDate = date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
                                const formattedTime = date.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <div key={idx} className="flex items-start gap-4 pl-2 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <div className="relative z-10 w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-500/10 border-2 border-purple-200 dark:border-purple-500/30 flex items-center justify-center shrink-0 group-hover:border-purple-400 dark:group-hover:border-purple-500/50 transition-colors">
                                            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">{entry.userName.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold text-slate-800 dark:text-white">{entry.userName}</span>
                                                <span className="text-[10px] text-slate-500 dark:text-gray-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5 font-medium">{entry.action}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">{formattedDate} à {formattedTime}</span>
                                                <span className="text-[10px] text-slate-400 dark:text-gray-600 truncate">{entry.userEmail}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalTab;
