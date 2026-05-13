import React from 'react';
import { ShieldAlert, AlertTriangle, LifeBuoy, PhoneCall, FileCheck, ClipboardList, Plus, Square, X, Trash2 } from 'lucide-react';
import { Activity, RiskManagement } from '../../types';
import { cn } from '../../lib/utils';
import { SUGGESTIONS, getCombinedList } from '../../lib/constants';
import { useCustomSuggestions } from '../../hooks/useCustomSuggestions';

interface RiskTabProps {
    activity: Activity;
    updateRiskManagement: (updates: Partial<RiskManagement>) => void;
    updateActivity: (updates: Partial<Activity>) => void;
}

const RiskTab: React.FC<RiskTabProps> = ({ activity, updateRiskManagement, updateActivity }) => {
    const { riskManagement } = activity;

    const suggestions = {
        siteRules: getCombinedList('siteRules', activity).filter(s => !(riskManagement.siteRules || []).includes(s)),
        compliance: getCombinedList('compliance', activity).filter(s => !(riskManagement.complianceRequirements || []).includes(s)),
        hazards: getCombinedList('hazards', activity).filter(s => !(riskManagement.hazards || []).includes(s)),
        safety: getCombinedList('safety', activity).filter(s => !(riskManagement.safetyProtocols || []).includes(s)),
    };

    const toggleItem = (field: keyof RiskManagement, value: string) => {
        const current = (riskManagement[field] as string[]) || [];
        if (current.includes(value)) {
            updateRiskManagement({ [field]: current.filter(item => item !== value) });
        } else {
            updateRiskManagement({ [field]: [...current, value] });
        }
    };

    const handleAddCustom = (field: keyof RiskManagement) => {
        const val = prompt(`Ajouter un item à : ${field === 'hazards' ? 'Risques' : 'Protocoles'}`);
        if (val) {
            const current = (riskManagement[field] as string[]) || [];
            updateRiskManagement({ [field]: [...current, val] });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* TOP GRID: RULES & COMPLIANCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Règles du site</h3>
                    </div>
                    <div className="space-y-1.5">
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    toggleItem('siteRules', e.target.value);
                                    e.target.value = "";
                                }
                            }}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        >
                            <option value="" className="text-slate-900">Règlement suggéré...</option>
                            {suggestions.siteRules.map(s => (
                                <option key={s} value={s} className="text-slate-900">{s}</option>
                            ))}
                        </select>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {riskManagement.siteRules.map((rule, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2 animate-in zoom-in-95">
                                    {rule}
                                    <button onClick={() => toggleItem('siteRules', rule)} className="hover:text-red-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Conformité</h3>
                    </div>
                    <div className="space-y-1.5">
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    toggleItem('complianceRequirements', e.target.value);
                                    e.target.value = "";
                                }
                            }}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                        >
                            <option value="" className="text-slate-900">Conformité suggérée...</option>
                            {suggestions.compliance.map(s => (
                                <option key={s} value={s} className="text-slate-900">{s}</option>
                            ))}
                        </select>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {riskManagement.complianceRequirements.map((req, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 rounded-xl text-xs text-cyan-700 dark:text-cyan-300 flex items-center gap-2 animate-in zoom-in-95">
                                    {req}
                                    <button onClick={() => toggleItem('complianceRequirements', req)} className="hover:text-red-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* MAIN RISK ASSESSMENT */}
            {/* MAIN RISK ASSESSMENT */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md relative overflow-hidden",
                ((riskManagement.safetyProtocols || []).length === 0 && !activity.isMDJClosed) ? "border-red-500/50 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-slate-100 dark:border-white/10 shadow-sm"
            )}>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Évaluation et Réduction des Risques</h3>
                        {(riskManagement.safetyProtocols || []).length === 0 && !activity.isMDJClosed && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* HAZARDS */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Risques Potentiels</span>
                            </div>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        toggleItem('hazards', e.target.value);
                                        e.target.value = "";
                                    }
                                }}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                            >
                                <option value="" className="text-slate-900">Risque suggéré...</option>
                                {suggestions.hazards.map(s => (
                                    <option key={s} value={s} className="text-slate-900">{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {riskManagement.hazards.map((h, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-xs text-red-800 dark:text-red-300 font-medium animate-in zoom-in-95 group">
                                    {h}
                                    <button onClick={() => toggleItem('hazards', h)} className="text-red-400 hover:text-red-600 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => handleAddCustom('hazards')}
                                className="px-3 py-1.5 border border-dashed border-red-200 dark:border-red-500/20 rounded-xl text-[10px] font-bold uppercase text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-3 h-3" /> Autre
                            </button>
                        </div>
                    </div>

                    {/* PROTOCOLS */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-2 text-green-600 dark:text-green-400">
                                <LifeBuoy className="w-4 h-4" />
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Protocoles de Sécurité</span>
                                    {(riskManagement.safetyProtocols || []).length === 0 && !activity.isMDJClosed && <span className="px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[7px] font-black uppercase animate-pulse whitespace-nowrap">MIN 1</span>}
                                </div>
                            </div>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        toggleItem('safetyProtocols', e.target.value);
                                        e.target.value = "";
                                    }
                                }}
                                className={cn(
                                    "w-full bg-slate-50 dark:bg-white/5 border rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all",
                                    ((riskManagement.safetyProtocols || []).length === 0 && !activity.isMDJClosed) ? "border-red-500/30" : "border-slate-200 dark:border-white/10"
                                )}
                            >
                                <option value="" className="text-slate-900">Protocole suggéré...</option>
                                {suggestions.safety.map(s => (
                                    <option key={s} value={s} className="text-slate-900">{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {riskManagement.safetyProtocols.map((p, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl text-xs text-green-800 dark:text-green-300 font-medium animate-in zoom-in-95 group">
                                    {p}
                                    <button onClick={() => toggleItem('safetyProtocols', p)} className="text-green-400 hover:text-green-600 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => handleAddCustom('safetyProtocols')}
                                className="px-3 py-1.5 border border-dashed border-green-200 dark:border-green-500/20 rounded-xl text-[10px] font-bold uppercase text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-3 h-3" /> Autre
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* EMERGENCY & BACKUP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className={cn(
                    "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md relative overflow-hidden",
                    (!riskManagement.emergencyContact && !activity.isMDJClosed) ? "border-red-500/50 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-slate-100 dark:border-white/10 shadow-sm"
                )}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400">
                            <PhoneCall className="w-5 h-5" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Contact d'urgence</h3>
                            {!riskManagement.emergencyContact && !activity.isMDJClosed && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                        </div>
                    </div>
                    <input
                        type="text"
                        value={riskManagement.emergencyContact}
                        onChange={(e) => updateRiskManagement({ emergencyContact: e.target.value })}
                        className={cn(
                            "w-full bg-slate-50 dark:bg-gray-800/50 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500/20 outline-none transition-all",
                            (!riskManagement.emergencyContact && !activity.isMDJClosed) ? "border-red-500/30" : "border-slate-200 dark:border-white/10"
                        )}
                        placeholder="ex: 911 ou hôpital local..."
                    />
                </section>

                <section className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-all">
                        <LifeBuoy className="w-12 h-12 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <LifeBuoy className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Plan B (Optionnel)</h3>
                    </div>
                    <textarea
                        value={activity.backupPlan}
                        onChange={(e) => updateActivity({ backupPlan: e.target.value })}
                        rows={1}
                        className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                        placeholder="Que fait-on s'il pleut ou s'il y a un imprévu ?"
                    />
                </section>
            </div>
        </div>
    );
};

export default RiskTab;
