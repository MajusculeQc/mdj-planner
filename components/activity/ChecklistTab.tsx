import React from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ListChecks, Info, AlertCircle, ArrowRight } from 'lucide-react';
import { Activity } from '../../types';
import { cn } from '../../lib/utils';
import { SUGGESTIONS } from '../../lib/constants';
import { useCustomSuggestions } from '../../hooks/useCustomSuggestions';

interface ChecklistTabProps {
    activity: Activity;
    updateActivity: (updates: Partial<Activity>) => void;
    setActiveTab: (tab: any) => void;
    readiness: any;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ activity, updateActivity, setActiveTab, readiness }) => {
    const { checklist } = activity;
    const { customSuggestions } = useCustomSuggestions();

    const checklistSuggestions = Array.from(new Set([
        ...SUGGESTIONS.checklist,
        ...(customSuggestions.checklist || [])
    ])).filter(item => item && !(checklist || []).some(ci => ci.item === item)).sort();

    const handleToggleItem = (index: number) => {
        const newChecklist = [...(checklist || [])];
        newChecklist[index].completed = !newChecklist[index].completed;
        updateActivity({ checklist: newChecklist });
    };

    const handleAddItem = (item: string) => {
        const newChecklist = [...(checklist || []), { item, completed: false }];
        updateActivity({ checklist: newChecklist });
    };

    const handleRemoveItem = (index: number) => {
        const newChecklist = (checklist || []).filter((_, i) => i !== index);
        updateActivity({ checklist: newChecklist });
    };

    const completedCount = (checklist || []).filter(i => i.completed).length;
    const totalCount = checklist?.length || 0;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const criticalFails = (readiness.checks || []).filter((c: any) => c.isCritical && !c.met);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* SYSTEM REQUIREMENTS SECTION */}
            {criticalFails.length > 0 && (
                <div className="bg-red-500/5 dark:bg-red-500/10 p-6 rounded-3xl border border-red-500/20 shadow-sm transition-all animate-pulse-slow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-500">Configuration Système Requise</h3>
                            <p className="text-[10px] text-red-400 dark:text-red-400/70 font-bold uppercase tracking-widest mt-0.5">Ces éléments bloquent la sauvegarde finale</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {criticalFails.map((check: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(check.tab)}
                                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-red-500/10 hover:border-red-500/30 text-left transition-all group"
                            >
                                <span className="text-[11px] font-bold text-slate-700 dark:text-red-200/80 uppercase tracking-tight">{check.label}</span>
                                <ArrowRight className="w-3 h-3 text-red-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* PROGRESS SECTION */}
            <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400">
                            <ListChecks className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Progression</h3>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">
                                {completedCount} sur {totalCount} tâches complétées
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">{Math.round(progress)}%</span>
                    </div>
                </div>

                <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* CHECKLIST ITEMS */}
            <section className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
                <div className="flex flex-col gap-3 mb-8 px-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">Ajouter une tâche suggérée</h3>
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                handleAddItem(e.target.value);
                                e.target.value = "";
                            }
                        }}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                    >
                        <option value="" className="text-slate-900">Choisir parmi les suggestions...</option>
                        {checklistSuggestions.map(item => (
                            <option key={item} value={item} className="text-slate-900">{item}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    {(!checklist || checklist.length === 0) ? (
                        <div className="py-12 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-gray-600">
                            <Info className="w-8 h-8 mb-3 opacity-20" />
                            <p className="text-sm italic font-medium text-center px-6">La liste est vide. Utilisez les suggestions ou ajoutez une tâche manuellement.</p>
                        </div>
                    ) : (
                        checklist.map((item, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "group flex items-center gap-4 p-4 rounded-2xl border transition-all animate-in slide-in-from-right-4 duration-300",
                                    item.completed
                                        ? "bg-slate-50 dark:bg-white/2 border-slate-100 dark:border-white/5 opacity-60"
                                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm hover:border-indigo-500/30"
                                )}
                                style={{ animationDelay: `${idx * 40}ms` }}
                            >
                                <button
                                    onClick={() => handleToggleItem(idx)}
                                    className={cn(
                                        "flex-none w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                        item.completed ? "text-green-500" : "text-slate-300 dark:text-gray-600 hover:text-indigo-500"
                                    )}
                                >
                                    {item.completed ? <CheckCircle2 className="w-6 h-6 shadow-lg shadow-green-500/20" /> : <Circle className="w-6 h-6" />}
                                </button>

                                <span className={cn(
                                    "flex-1 text-sm font-medium transition-all",
                                    item.completed ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700 dark:text-gray-200"
                                )}>
                                    {item.item}
                                </span>

                                <button
                                    onClick={() => handleRemoveItem(idx)}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}

                    <div className="mt-6 flex gap-3">
                        <input
                            type="text"
                            placeholder="Nouvelle tâche..."
                            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = e.currentTarget.value.trim();
                                    if (val) {
                                        handleAddItem(val);
                                        e.currentTarget.value = '';
                                    }
                                }
                            }}
                        />
                        <button
                            onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                const val = input.value.trim();
                                if (val) {
                                    handleAddItem(val);
                                    input.value = '';
                                }
                            }}
                            className="px-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ChecklistTab;
