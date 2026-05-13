import React from 'react';
import { BookOpen, Target, Users, Search, Sparkles, Wand2, Plus, Square, X, Globe } from 'lucide-react';
import { Activity, YouthInvolvement } from '../../types';
import { cn } from '../../lib/utils';
import { SUGGESTIONS, getCombinedList } from '../../lib/constants';
import { UNIFIED_IMPACTS, UnifiedImpact } from '../../lib/taxonomyMapping';
import { useCustomSuggestions } from '../../hooks/useCustomSuggestions';
import AICorrectButton from '../ui/AICorrectButton';

interface PedagogyTabProps {
    activity: Activity;
    updateActivity: (updates: Partial<Activity>) => void;
    updateYouthInvolvement: (updates: Partial<YouthInvolvement>) => void;
    autoSuggestAll: () => Promise<void>;
    isGenerating: boolean;
    readiness: any;
}

const PedagogyTab: React.FC<PedagogyTabProps> = ({
    activity,
    updateActivity,
    updateYouthInvolvement,
    autoSuggestAll,
    isGenerating,
    readiness
}) => {
    const { customSuggestions } = useCustomSuggestions();

    const taskSuggestions = getCombinedList('youthTasks', activity).filter(t => !(activity.youthInvolvement?.tasks || []).includes(t));

    const isCriticalMissing = (label: string) =>
        readiness.checks.some((c: any) => c.label.includes(label) && c.isCritical && !c.met);

    // Toggle a unified impact (CAR Label + RMJQ Dimensions)
    const toggleImpact = (impact: UnifiedImpact) => {
        const currentObjectives = activity.objectives || [];
        const currentRmjq = activity.rmjqDimensions || [];

        const isSelected = currentObjectives.includes(impact.label);

        let nextObjectives: string[];
        let nextRmjq: string[];

        if (isSelected) {
            // Remove
            nextObjectives = currentObjectives.filter(o => o !== impact.label);
            nextRmjq = currentRmjq.filter(d => !impact.dimensions.includes(d));
        } else {
            // Add
            nextObjectives = [...currentObjectives, impact.label];
            nextRmjq = Array.from(new Set([...currentRmjq, ...impact.dimensions]));
        }

        updateActivity({
            objectives: nextObjectives,
            rmjqDimensions: nextRmjq
        });
    };

    const handleAddTaskFromDropdown = (val: string) => {
        if (!val) return;
        const currentTasks = activity.youthInvolvement?.tasks || [];
        if (!currentTasks.includes(val)) {
            updateYouthInvolvement({ tasks: [...currentTasks, val] });
        }
    };

    const handleAddTask = () => {
        updateYouthInvolvement({ tasks: [...(activity.youthInvolvement?.tasks || []), ""] });
    };

    const handleUpdateTask = (index: number, value: string) => {
        const newTasks = [...(activity.youthInvolvement?.tasks || [])];
        newTasks[index] = value;
        updateYouthInvolvement({ tasks: newTasks });
    };

    const handleRemoveTask = (index: number) => {
        updateYouthInvolvement({ tasks: (activity.youthInvolvement?.tasks || []).filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* TYPE D'ACTIVITÉ - CRITIQUE */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md relative overflow-hidden",
                ((activity.types || []).length === 0 && !activity.isMDJClosed) ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-slate-100 dark:border-white/10"
            )}>
                {(activity.types || []).length === 0 && !activity.isMDJClosed && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl animate-pulse">
                        SÉLECTION REQUISE
                    </div>
                )}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Type d'activité</h3>
                            {(activity.types || []).length === 0 && !activity.isMDJClosed && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Catégorisation obligatoire pour les rapports</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {['Accueil, Écoute & Milieu de Vie', 'Aide aux Devoirs & Soutien Scolaire', 'Accompagnement Individualisé', 'Intervention & Gestion de Crise', 'Animation (sorties, activités, séjours)', 'Prévention & Sensibilisation (Interne)', 'Prévention & Sensibilisation (Partenaire)', 'Vie Associative & Bénévolat Jeunes', 'Promotion, Concertation & Gestion'].map((t) => {
                        const isSelected = (activity.types || []).includes(t as any);
                        return (
                            <button
                                key={t}
                                onClick={() => {
                                    const currentTypes = activity.types || [];
                                    const nextTypes = isSelected
                                        ? currentTypes.filter(type => type !== t)
                                        : [...currentTypes, t as any];
                                    updateActivity({ types: nextTypes });
                                }}
                                className={cn(
                                    "px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all border text-left",
                                    isSelected
                                        ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]"
                                        : "bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20",
                                    (activity.types || []).length === 0 && !activity.isMDJClosed && "border-red-500/30 animate-pulse-slow"
                                )}
                            >
                                {t}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* DESCRIPTION SECTION */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md relative overflow-hidden",
                ((activity.description || '').trim().length < 30 && !activity.isMDJClosed) ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-slate-100 dark:border-white/10"
            )}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Identité & Intention</h3>
                                {(activity.description || '').trim().length < 30 && !activity.isMDJClosed && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Description et thématique de l'activité</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest block">Description Pédagogique (min. 30 caractères)</label>
                        <div className="flex items-center gap-4">
                            <AICorrectButton 
                                text={activity.description} 
                                onCorrect={(corrected) => updateActivity({ description: corrected })}
                                variant="button"
                                className="h-7"
                            />
                            <div className={cn(
                                "text-[10px] font-bold transition-colors",
                                (activity.description || '').length < 30 && !activity.isMDJClosed ? "text-red-500" : "text-slate-400"
                            )}>{(activity.description || '').length} / 30</div>
                        </div>
                    </div>
                    <textarea
                        value={activity.description}
                        onChange={(e) => updateActivity({ description: e.target.value })}
                        rows={5}
                        className={cn(
                            "w-full bg-slate-50 dark:bg-gray-800/50 border rounded-2xl px-5 py-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all",
                            ((activity.description || '').trim().length < 30 && !activity.isMDJClosed)
                                ? "border-red-500/50 bg-red-500/[0.02] shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                : "border-slate-200 dark:border-white/10"
                        )}
                        placeholder="Décrivez l'intention pédagogique ou le déroulement détaillé..."
                    />
                </div>
            </section>

            {/* DIMENSIONS RMJQ */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md relative overflow-hidden",
                ((activity.rmjqDimensions || []).length === 0 && !activity.isMDJClosed) ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-slate-100 dark:border-white/10"
            )}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Dimensions RMJQ (Min. 1)</h3>
                            {(activity.rmjqDimensions || []).length === 0 && !activity.isMDJClosed && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Axes d'intervention privilégiés</p>
                    </div>
                </div>

                <div className={cn(
                    "flex flex-wrap gap-2 p-4 rounded-2xl transition-all",
                    (activity.rmjqDimensions || []).length === 0 ? "bg-red-500/[0.02] border-2 border-red-500/30 border-dashed animate-pulse-slow font-black" : "bg-slate-50 dark:bg-white/5"
                )}>
                    {SUGGESTIONS.rmjqDimensions.map(dim => (
                        <button
                            key={dim}
                            onClick={() => {
                                const current = activity.rmjqDimensions || [];
                                const next = current.includes(dim)
                                    ? current.filter(d => d !== dim)
                                    : [...current, dim];
                                updateActivity({ rmjqDimensions: next });
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                                (activity.rmjqDimensions || []).includes(dim)
                                    ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/20 scale-105"
                                    : "bg-white dark:bg-gray-800 border-slate-200 dark:border-white/5 text-slate-500 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20"
                            )}
                        >
                            {dim}
                        </button>
                    ))}
                </div>
            </section>

            {/* IMPACTS & FINALITÉS (UNIFIÉ CAR/RMJQ) */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md relative overflow-hidden",
                (((activity.objectives || []).length < 2 || (activity.objectives || []).some(o => o.trim().length < 10)) && !activity.isMDJClosed) ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-slate-100 dark:border-white/10"
            )}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Impacts & Finalités (Min. 2)</h3>
                                {((activity.objectives || []).length < 2 || (activity.objectives || []).some(o => o.trim().length < 10)) && !activity.isMDJClosed && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Objectifs C.A.R. & Dimensions RMJQ unifiés</p>
                        </div>
                    </div>
                    <button
                        onClick={autoSuggestAll}
                        disabled={isGenerating || !activity.title}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95",
                            "disabled:opacity-30 disabled:grayscale disabled:scale-100"
                        )}
                    >
                        {isGenerating ? <Sparkles className="w-3 h-3 animate-pulse" /> : <Wand2 className="w-3 h-3" />}
                        Magie IA
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Ajouter un impact pédagogique</label>
                            <span className={cn(
                                "text-[9px] font-black tracking-widest uppercase",
                                (activity.objectives || []).length >= 2 || activity.isMDJClosed ? "text-orange-500" : "text-red-500 animate-pulse"
                            )}>
                                {(activity.objectives || []).length} / 2 MINIMUM
                            </span>
                        </div>
                        <select
                            onChange={(e) => {
                                const impactLabel = e.target.value;
                                if (impactLabel) {
                                    const impact = UNIFIED_IMPACTS.find(u => u.label === impactLabel);
                                    if (impact) toggleImpact(impact);
                                    e.target.value = "";
                                }
                            }}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all mb-4"
                        >
                            <option value="" className="text-slate-900">Choisir dans la liste...</option>
                            {UNIFIED_IMPACTS
                                .filter(impact => !(activity.objectives || []).includes(impact.label))
                                .map(impact => (
                                    <option key={impact.id} value={impact.label} className="text-slate-900">{impact.label}</option>
                                ))}
                        </select>

                        <div className={cn(
                            "flex flex-wrap gap-3 p-4 rounded-2xl transition-all",
                            (((activity.objectives || []).length < 2) && !activity.isMDJClosed) ? "bg-red-500/[0.02] border-2 border-red-500/30 border-dashed animate-pulse-slow font-black" : "bg-slate-50 dark:bg-white/5"
                        )}>
                            {UNIFIED_IMPACTS.filter(i => (activity.objectives || []).includes(i.label)).map((impact) => (
                                <div
                                    key={impact.id}
                                    className="p-3 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 flex items-center gap-3 animate-in zoom-in-95 group shadow-sm"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase leading-tight">
                                            {impact.label}
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                            {impact.dimensions.map(d => (
                                                <span key={d} className="text-[7px] font-black text-orange-500 uppercase tracking-tighter">
                                                    RMJQ: {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleImpact(impact)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            {(activity.objectives || []).length === 0 && <div className="text-[10px] text-slate-400 italic">Aucun impact sélectionné</div>}
                        </div>
                    </div>
                </div>
            </section>

            {/* YOUTH INVOLVEMENT */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md relative overflow-hidden",
                ((!activity.youthInvolvement?.level || (activity.youthInvolvement?.tasks || []).length === 0) && !activity.isMDJClosed) ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-slate-100 dark:border-white/10"
            )}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Implication des Jeunes</h3>
                            {(!activity.youthInvolvement?.level || (activity.youthInvolvement?.tasks || []).length === 0) && !activity.isMDJClosed && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Participation et co-construction</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* NIVEAU */}
                    <div className={cn(
                        "space-y-4 p-4 rounded-2xl transition-all",
                        (!activity.youthInvolvement?.level && !activity.isMDJClosed) ? "bg-red-500/[0.02] border-2 border-red-500/30 border-dashed animate-pulse-slow" : "bg-slate-50 dark:bg-white/5"
                    )}>
                        <label className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest block px-1">Niveau de participation</label>
                        <div className="flex flex-wrap gap-2">
                            {['Consultation', 'Organisation', 'Animation', 'Participation'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => updateYouthInvolvement({ level: level as any })}
                                    className={cn(
                                        "flex-1 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                                        activity.youthInvolvement?.level === level
                                            ? "bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20 scale-105"
                                            : "bg-white dark:bg-gray-800 border-slate-200 dark:border-white/5 text-slate-500 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20"
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TÂCHES */}
                    <div className={cn(
                        "space-y-4 p-4 rounded-2xl transition-all",
                        ((activity.youthInvolvement?.tasks || []).length === 0 && !activity.isMDJClosed) ? "bg-red-500/[0.02] border-2 border-red-500/30 border-dashed animate-pulse-slow" : "bg-slate-50 dark:bg-white/5"
                    )}>
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest block">Tâches confiées (Min. 1)</label>
                        </div>
                        <div className="space-y-3">
                            <select
                                onChange={(e) => {
                                    handleAddTaskFromDropdown(e.target.value);
                                    e.target.value = "";
                                }}
                                className="w-full bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                            >
                                <option value="" className="text-slate-900">Choisir une suggestion...</option>
                                {taskSuggestions.map(t => (
                                    <option key={t} value={t} className="text-slate-900">{t}</option>
                                ))}
                            </select>

                            <div className="space-y-2">
                                {(activity.youthInvolvement?.tasks || []).map((task, idx) => (
                                    <div key={idx} className="flex items-center gap-2 group p-1">
                                        <input
                                            type="text"
                                            value={task}
                                            onChange={(e) => handleUpdateTask(idx, e.target.value)}
                                            className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                            placeholder="Saisir une tâche..."
                                        />
                                        <AICorrectButton 
                                            text={task} 
                                            onCorrect={(corrected) => handleUpdateTask(idx, corrected)}
                                        />
                                        <button
                                            onClick={() => handleRemoveTask(idx)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleAddTask}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all uppercase tracking-widest w-full justify-center border border-dashed border-amber-200 dark:border-amber-500/20"
                            >
                                <Plus className="w-3.5 h-3.5" /> Ajouter une tâche personnalisée
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* TAGS PSOC - REPORTING */}
            <section className="bg-teal-50/30 dark:bg-teal-900/10 rounded-3xl p-6 border border-teal-100/50 dark:border-teal-500/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-500/20 border border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-400">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-900 dark:text-teal-100">Catégories PSOC</h3>
                            <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-700 dark:text-teal-300 text-[8px] font-black uppercase">FINANCEMENT</span>
                        </div>
                        <p className="text-[10px] text-teal-600/70 dark:text-teal-400/70 font-bold uppercase tracking-widest mt-0.5">Associez l'activité aux axes de financement</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <select
                        onChange={(e) => {
                            const tag = e.target.value;
                            if (tag) {
                                const currentTags = activity.pedagogy?.psocTags || [];
                                const newTags = currentTags.includes(tag) ? currentTags : [...currentTags, tag];
                                updateActivity({ pedagogy: { ...activity.pedagogy, psocTags: newTags } as any });
                                e.target.value = "";
                            }
                        }}
                        className="w-full bg-white dark:bg-white/5 border border-teal-200 dark:border-teal-500/20 rounded-xl px-4 py-2.5 text-sm text-teal-900 dark:text-teal-100 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                    >
                        <option value="" className="text-slate-900">Ajouter un axe PSOC...</option>
                        {['Prévention globale', 'Relation d\'aide', 'Information & Référence', 'Travail de milieu', 'Soutien aux comités', 'Sensibilisation', 'Défense des droits', 'Mobilisation citoyenne']
                            .filter(tag => !(activity.pedagogy?.psocTags || []).includes(tag))
                            .map(tag => (
                                <option key={tag} value={tag} className="text-slate-900">{tag}</option>
                            ))}
                    </select>

                    <div className="flex flex-wrap gap-2">
                        {(activity.pedagogy?.psocTags || []).map((tag) => (
                            <div
                                key={tag}
                                className="px-3 py-1.5 bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-teal-700 dark:text-teal-300 flex items-center gap-2 animate-in zoom-in-95"
                            >
                                {tag}
                                <button
                                    onClick={() => {
                                        const newTags = (activity.pedagogy?.psocTags || []).filter(t => t !== tag);
                                        updateActivity({ pedagogy: { ...activity.pedagogy, psocTags: newTags } as any });
                                    }}
                                    className="hover:text-red-500 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PedagogyTab;
