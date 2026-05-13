import React, { useMemo } from 'react';
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown, Info, DollarSign, ShoppingBag } from 'lucide-react';
import { Activity, Budget, BudgetItem } from '../../types';
import { cn } from '../../lib/utils';
import { usePurchases } from '../../hooks/usePurchases';

interface BudgetTabProps {
    activity: Activity;
    updateBudget: (updates: Partial<Budget>) => void;
    userEmail?: string;
}

const BudgetTab: React.FC<BudgetTabProps> = ({ activity, updateBudget, userEmail }) => {
    const { budget } = activity;
    const { getRequestsForActivity } = usePurchases(userEmail);

    // Linked purchase requests for this activity
    const linkedRequests = useMemo(() => getRequestsForActivity(activity.id), [getRequestsForActivity, activity.id]);
    const purchaseRequestsTotal = linkedRequests
        .filter(r => r.status !== 'Refusé')
        .reduce((sum, r) => sum + r.estimatedCost, 0);

    const handleAddLineItem = () => {
        const items = [...(budget.items || []), { description: "", amount: 0 }];
        updateBudget({ items });
    };

    const handleUpdateLineItem = (index: number, updates: Partial<BudgetItem>) => {
        const items = [...(budget.items || [])];
        items[index] = { ...items[index], ...updates };
        updateBudget({ items });
    };

    const handleRemoveLineItem = (index: number) => {
        const items = (budget.items || []).filter((_, i) => i !== index);
        updateBudget({ items });
    };

    // Calculate sum of line items + purchase requests
    const lineItemsTotal = (budget.items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalEstimated = (budget.estimatedCost || 0) + purchaseRequestsTotal;
    const variance = (budget.actualCost || 0) - totalEstimated;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    {purchaseRequestsTotal > 0 && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black uppercase rounded-lg shadow-lg z-10 animate-bounce">
                            Inclut Achats
                        </div>
                    )}
                    <div className="flex items-center gap-2 mb-4 text-slate-400 dark:text-gray-500">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Estimation Totale (Initiale + Achats)</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-800 dark:text-white">{totalEstimated.toFixed(2)}</span>
                        <span className="text-sm font-bold text-slate-400">$</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-12 h-12 text-green-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-slate-400 dark:text-gray-500">
                        <Wallet className="w-4 h-4 text-green-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Coût Réel</span>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            value={budget.actualCost}
                            onChange={(e) => updateBudget({ actualCost: Number(e.target.value) })}
                            className="w-full bg-transparent text-3xl font-black text-slate-800 dark:text-white focus:outline-none focus:ring-0"
                            step="0.01"
                        />
                        <div className="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-green-500 rounded-full opacity-30"></div>
                    </div>
                </div>

                <div className={cn(
                    "rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all",
                    variance > 0
                        ? "bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10"
                        : "bg-green-50 dark:bg-green-500/5 border-green-100 dark:border-green-500/10"
                )}>
                    <div className="flex items-center gap-2 mb-4">
                        {variance > 0 ? <TrendingUp className="w-4 h-4 text-red-500" /> : <TrendingDown className="w-4 h-4 text-green-500" />}
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            variance > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                        )}>Différence / Écart</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={cn(
                            "text-2xl font-black",
                            variance > 0 ? "text-red-600 dark:text-red-300" : "text-green-600 dark:text-green-300"
                        )}>{variance > 0 ? '+' : ''}{variance.toFixed(2)}</span>
                        <span className="text-sm font-bold opacity-40">$</span>
                    </div>
                </div>
            </div>

            {/* PURCHASE REQUESTS SECTION (IF ANY) */}
            {linkedRequests.length > 0 && (
                <section className="bg-orange-50/50 dark:bg-orange-500/5 rounded-3xl p-8 border border-orange-100 dark:border-orange-500/20 shadow-sm animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Demandes d'achats liées</h3>
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase mt-1">Générées automatiquement ou manuellement</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase mb-1">Total Achats</p>
                            <p className="text-lg font-black text-orange-600 dark:text-orange-400">{purchaseRequestsTotal.toFixed(2)} $</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {linkedRequests.map((req, idx) => (
                            <div key={req.id} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700 dark:text-white">{req.customName} ({req.quantityNeeded})</span>
                                    <span className={cn(
                                        "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded w-fit mt-1",
                                        req.status === 'Approuvé' ? 'bg-green-500 text-white' :
                                            req.status === 'Refusé' ? 'bg-red-500 text-white' :
                                                'bg-orange-500 text-white'
                                    )}>
                                        {req.status}
                                    </span>
                                </div>
                                <span className="text-sm font-black text-slate-800 dark:text-white">{req.estimatedCost.toFixed(2)} $</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* FUNDING SOURCE - PSOC */}
            <section className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-6 border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-100">Source de financement</h3>
                            {!budget.fundingSource && <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-500 text-[8px] font-black uppercase animate-pulse">REQUIS</span>}
                        </div>
                        <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 font-bold uppercase tracking-widest mt-0.5">Crucial pour le rapport financier PSOC</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {['Mission globale', 'Projet ponctuel', 'Entente de services', 'Autofinancement/Levée de fonds', 'Donation', 'Bourse', 'Autre'].map((source) => {
                        const isSelected = budget.fundingSource === source;
                        return (
                            <button
                                key={source}
                                onClick={() => updateBudget({ fundingSource: source })}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                                    isSelected
                                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                                        : "bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-300"
                                )}
                            >
                                {source}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* LINE ITEMS SECTION */}
            <section className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-100 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <Plus className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Détail des dépenses (Activités)</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase mb-1">Total des items</p>
                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{lineItemsTotal.toFixed(2)} $</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {budget.items.length === 0 ? (
                        <div className="py-12 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-gray-600">
                            <Info className="w-8 h-8 mb-3 opacity-20" />
                            <p className="text-sm italic font-medium">Aucune dépense détaillée ajoutée.</p>
                        </div>
                    ) : (
                        budget.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl group animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1">Description</label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => handleUpdateLineItem(idx, { description: e.target.value })}
                                        className="w-full bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500/30 outline-none"
                                        placeholder="ex: Ingrédients pour la pizza"
                                    />
                                </div>
                                <div className="w-32 space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1">Montant ($)</label>
                                    <input
                                        type="number"
                                        value={item.amount}
                                        onChange={(e) => handleUpdateLineItem(idx, { amount: Number(e.target.value) })}
                                        className="w-full bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500/30 outline-none"
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex items-end pb-1.5">
                                    <button
                                        onClick={() => handleRemoveLineItem(idx)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    <button
                        onClick={handleAddLineItem}
                        className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-600/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all mt-4 flex items-center justify-center gap-2 group"
                    >
                        <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                        Ajouter une dépense détaillée
                    </button>
                </div>
            </section>
        </div>
    );
};

export default BudgetTab;
