import React, { useState } from 'react';
import { ListChecks, Zap, AlertTriangle, CheckCircle2, Package, History, MessageSquare, ClipboardCheck, Users, UserPlus, User } from 'lucide-react';
import { Activity, MaterialReservation, InventoryItem } from '../../types';
import { cn } from '../../lib/utils';

interface ControlTabProps {
    activity: Activity;
    reservations: MaterialReservation[];
    inventoryItems: InventoryItem[];
    onUpdateStats: (updates: Partial<Activity['stats']>) => void;
    onValidateConsumption: (resId: string, actualQty: number, notes: string) => Promise<void>;
    onReportDamage: (itemId: string, condition: 'Neuf' | 'Bon' | 'Usé' | 'À réparer' | 'Perdu') => Promise<void>;
    onSetActivityValidated: (activityId: string, isValidated: boolean) => Promise<void>;
}

const ControlTab: React.FC<ControlTabProps> = ({
    activity,
    reservations,
    inventoryItems,
    onUpdateStats,
    onValidateConsumption,
    onReportDamage,
    onSetActivityValidated
}) => {
    const isPastActivity = new Date(activity.date) <= new Date();
    const [loadingResId, setLoadingResId] = useState<string | null>(null);
    const [usageNotes, setUsageNotes] = useState<Record<string, string>>({});
    const [actualQuantities, setActualQuantities] = useState<Record<string, number>>({});

    const handleValidate = async (res: MaterialReservation) => {
        setLoadingResId(res.id);
        const qty = actualQuantities[res.id] ?? res.quantityRequired;
        const notes = usageNotes[res.id] ?? '';
        try {
            await onValidateConsumption(res.id, qty, notes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingResId(null);
        }
    };

    if (!isPastActivity) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <History className="w-10 h-10 text-slate-400 dark:text-gray-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Zone de Contrôle Future</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-500 max-w-xs mx-auto">
                        Cet onglet sera activé une fois l'activité terminée pour valider l'utilisation du matériel.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER STATUS */}
            <div className={cn(
                "p-6 rounded-3xl border transition-all shadow-sm flex items-center justify-between gap-4",
                activity.consumptionValidated
                    ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20"
                    : "bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20"
            )}>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-3 rounded-2xl border flex items-center justify-center",
                        activity.consumptionValidated
                            ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
                    )}>
                        {activity.consumptionValidated ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                            {activity.consumptionValidated ? "Inventaire Validé" : "Validation Requise"}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                            {activity.consumptionValidated
                                ? "Le matériel utilisé a été décompté du stock global."
                                : "Veuillez confirmer les quantités utilisées pour mettre le stock à jour."}
                        </p>
                    </div>
                </div>

                {!activity.consumptionValidated && reservations.length > 0 && (
                    <button
                        onClick={() => onSetActivityValidated(activity.id, true)}
                        className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        Tout Valider
                    </button>
                )}
            </div>

            {/* PARTICIPATION STATS */}
            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Statistiques de Participation</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <User className="w-3 h-3 text-blue-500" /> Garçons
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={activity.stats?.presentMale ?? 0}
                            onChange={(e) => onUpdateStats({ presentMale: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <User className="w-3 h-3 text-pink-500" /> Filles
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={activity.stats?.presentFemale ?? 0}
                            onChange={(e) => onUpdateStats({ presentFemale: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <User className="w-3 h-3 text-amber-500" /> Non-binaire
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={activity.stats?.presentNonBinary ?? 0}
                            onChange={(e) => onUpdateStats({ presentNonBinary: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <UserPlus className="w-3 h-3 text-emerald-500" /> Nouveaux
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={activity.stats?.newMembers ?? 0}
                            onChange={(e) => onUpdateStats({ newMembers: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center px-2">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Total des présences</span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                        {(activity.stats?.presentMale ?? 0) + (activity.stats?.presentFemale ?? 0) + (activity.stats?.presentNonBinary ?? 0)}
                    </span>
                </div>
            </div>

            {/* RESERVATIONS LIST */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Package className="w-4 h-4 text-cyan-500" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Matériel réservé</h4>
                </div>

                {reservations.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-10 text-center">
                        <p className="text-sm text-slate-500 dark:text-gray-400 italic">Aucun matériel n'avait été réservé pour cette activité.</p>
                    </div>
                ) : (
                    reservations.map((res) => {
                        const item = inventoryItems.find(i => i.id === res.itemId);
                        const isConsumable = item?.isConsumable;
                        const isValidated = res.status === 'Consommé' || res.status === 'Terminé';

                        return (
                            <div
                                key={res.id}
                                className={cn(
                                    "bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-6 shadow-sm group hover:shadow-md transition-all relative overflow-hidden",
                                    isValidated && "opacity-80"
                                )}
                            >
                                {isValidated && (
                                    <div className="absolute top-0 right-0 p-2">
                                        <div className="bg-emerald-500 text-white p-1 rounded-full">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* INFO ARTICLE */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/10">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-slate-900 dark:text-white">{res.itemName}</h5>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded-full border border-slate-200 dark:border-white/5">
                                                        Demande initiale: {res.quantityRequired}
                                                    </span>
                                                    {isConsumable ? (
                                                        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 rounded-full border border-orange-100 dark:border-orange-500/20">
                                                            Consommable
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20">
                                                            Durable
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {!isValidated && (
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">État actuel: {item?.condition || 'Bon'}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Bon', 'Usé', 'À réparer', 'Perdu'].map((cond) => (
                                                        <button
                                                            key={cond}
                                                            onClick={() => onReportDamage(res.itemId, cond as any)}
                                                            className={cn(
                                                                "text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border transition-all",
                                                                item?.condition === cond
                                                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900"
                                                                    : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-white/10 hover:border-cyan-500"
                                                            )}
                                                        >
                                                            {cond}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTROLES */}
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-2 px-1">
                                                <Zap className="w-3.5 h-3.5 text-purple-500" />
                                                <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                                                    Quantité {isConsumable ? "utilisée" : "en bon état"}
                                                </label>
                                            </div>
                                            <input
                                                type="number"
                                                disabled={isValidated}
                                                value={actualQuantities[res.id] ?? res.quantityRequired}
                                                onChange={(e) => setActualQuantities({ ...actualQuantities, [res.id]: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                            />
                                        </div>

                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-2 px-1">
                                                <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
                                                <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Observations</label>
                                            </div>
                                            <textarea
                                                disabled={isValidated}
                                                rows={2}
                                                value={usageNotes[res.id] ?? res.usageNotes ?? ''}
                                                onChange={(e) => setUsageNotes({ ...usageNotes, [res.id]: e.target.value })}
                                                placeholder="ex: Reste 2 pommes, 1 pinceau cassé..."
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none shadow-inner"
                                            />
                                        </div>

                                        {!isValidated && (
                                            <button
                                                disabled={loadingResId === res.id}
                                                onClick={() => handleValidate(res)}
                                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md mt-2 flex items-center justify-center gap-2"
                                            >
                                                {loadingResId === res.id ? "Validation..." : <><ClipboardCheck className="w-4 h-4" /> Confirmer l'usage</>}
                                            </button>
                                        )}

                                        {res.status === 'Consommé' && (
                                            <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-3 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Usage validé</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ControlTab;
