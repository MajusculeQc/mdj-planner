import React, { useState } from 'react';
import {
    Package,
    X,
    Save,
    Trash2,
    AlertCircle,
    MapPin,
    Layers,
    Database,
    DollarSign,
    ChevronRight,
    Tag,
    Activity,
    Box
} from 'lucide-react';
import { InventoryItem } from '../../types';
import { cn } from '../../lib/utils';

interface InventoryItemModalProps {
    item?: InventoryItem; // If provided, we are editing
    onClose: () => void;
    onSave: (item: InventoryItem) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

export const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
    item,
    onClose,
    onSave,
    onDelete
}) => {
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        name: '',
        category: 'Général',
        totalQuantity: 0,
        minThreshold: 0,
        location: '',
        unitCost: 0,
        condition: 'Bon',
        isConsumable: false,
        ...item
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.name.trim().length < 3) {
            setError("Le nom de l'article doit faire au moins 3 caractères.");
            return;
        }
        if (!formData.category || formData.category === 'Général') {
            const confirm = window.confirm("La catégorie est réglée sur 'Général'. Est-ce correct ? Un classement précis est préférable.");
            if (!confirm) return;
        }
        if (!formData.location || formData.location.trim().length < 3) {
            setError("La localisation précise est requise (min 3 car.).");
            return;
        }
        if (formData.totalQuantity === undefined || formData.totalQuantity < 0) {
            setError("La quantité doit être définie.");
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            const finalItem: InventoryItem = {
                id: item?.id || `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: formData.name!,
                category: formData.category || 'Général',
                totalQuantity: Number(formData.totalQuantity) || 0,
                minThreshold: Number(formData.minThreshold) || 0,
                location: formData.location || '',
                unitCost: Number(formData.unitCost) || 0,
                condition: formData.condition || 'Bon',
                isConsumable: !!formData.isConsumable,
            };
            await onSave(finalItem);
            onClose();
        } catch (err: any) {
            setError(err.message || "Erreur lors de la sauvegarde.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-[#000000]/80 backdrop-blur-xl flex items-center justify-center z-[100] p-0 sm:p-4 lg:p-8 animate-in fade-in duration-300">
            <div className="bg-slate-50 dark:bg-[#0F172A] w-full max-w-6xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10 animate-in zoom-in-95 duration-500">

                {/* Header (Premium) */}
                <div className="relative p-6 lg:p-10 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-600/20">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                {item ? 'Éditer l\'Article' : 'Ajouter un Article'}
                            </h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">MDJ Escale Jeunesse</span>
                                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-gray-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">
                                    {item ? `Fiche #${item.id.slice(-6)}` : 'Nouvel Article'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl text-slate-400 dark:text-gray-500 transition-all hover:rotate-90"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Body (Grid Layout) */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10">

                    {error && (
                        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500 animate-in shake duration-500">
                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                            <p className="font-bold text-sm tracking-tight">{error}</p>
                        </div>
                    )}

                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2 h-2 rounded-full animate-pulse",
                                formData.name && (formData.totalQuantity || 0) >= 0 && formData.location ? "bg-emerald-500" : "bg-red-500"
                            )} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                                Statut de la Planification : {formData.name && (formData.totalQuantity || 0) >= 0 && formData.location ? 'COMPLET' : 'INCOMPLET'}
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {!formData.name && <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">NOM REQUIS</span>}
                            {(!formData.location) && <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">LIEU REQUIS</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* Section 1: Core Details */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Tag className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Détails de Base</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Nom complet</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className={cn(
                                            "w-full bg-white dark:bg-white/5 border rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-slate-300 dark:placeholder-gray-700 font-bold text-lg",
                                            !formData.name ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse-slow" : "border-slate-200 dark:border-white/10"
                                        )}
                                        placeholder="ex: Ballons Molten G7X"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Catégorie Technique</label>
                                    <div className="relative">
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full appearance-none bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700 dark:text-gray-200 cursor-pointer"
                                        >
                                            <option value="Sports">🏀 Sports & Plein Air</option>
                                            <option value="Arts">🎨 Arts & Créativité</option>
                                            <option value="Cuisine">🍕 Cuisine & Nutrition</option>
                                            <option value="Bricolage">🛠️ Bricolage & Ateliers</option>
                                            <option value="Électronique">💻 Électronique & Gaming</option>
                                            <option value="Général">📦 Logistique & Général</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">État de l'équipement</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Neuf', 'Bon', 'Usagé'].map(st => (
                                            <button
                                                key={st}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, condition: st as any })}
                                                className={cn(
                                                    "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                    formData.condition === st
                                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-y-[-2px]"
                                                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-gray-500 hover:border-indigo-400"
                                                )}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Logistics & Location */}
                        <div className="space-y-8 bg-slate-100/50 dark:bg-white/[0.02] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <Database className="w-4 h-4 text-cyan-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Stock & Logistique</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400">Quantité en Stock</label>
                                    <div className="relative">
                                        <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-600" />
                                        <input
                                            type="number"
                                            value={formData.totalQuantity}
                                            onChange={e => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all font-black text-xl"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400">Seuil de Sécurité</label>
                                    <div className="relative">
                                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/60" />
                                        <input
                                            type="number"
                                            value={formData.minThreshold}
                                            onChange={e => setFormData({ ...formData, minThreshold: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-black text-xl text-red-500"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400">Localisation Précise</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className={cn(
                                            "w-full bg-white dark:bg-black/20 border rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold",
                                            !formData.location ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse-slow" : "border-slate-200 dark:border-white/10"
                                        )}
                                        placeholder="ex: Niveau 2, Étagère B4"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Financials & Misc */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Finance & Propriétés</h3>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400">Coût à l'unité</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg">$</div>
                                        <input
                                            type="number"
                                            value={formData.unitCost}
                                            onChange={e => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-4 focus:border-emerald-500 outline-none transition-all font-black text-xl text-emerald-600 dark:text-emerald-400"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                        <p className="text-[8px] font-black uppercase text-emerald-500">Valorisation</p>
                                        <p className="font-black text-emerald-600">{((formData.totalQuantity || 0) * (formData.unitCost || 0)).toFixed(2)} $</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-indigo-600/5 dark:bg-white/5 border border-indigo-200 dark:border-white/10 rounded-[2.5rem] space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Type Consommable</p>
                                        <p className="text-[9px] text-slate-400 dark:text-gray-500 mt-1">L'article s'use ou disparaît à l'usage.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isConsumable: !formData.isConsumable })}
                                        className={cn(
                                            "w-14 h-8 rounded-full relative transition-colors duration-500",
                                            formData.isConsumable ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 bg-white w-6 h-6 rounded-full shadow-lg transition-transform duration-500",
                                            formData.isConsumable ? "left-7" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>

                {/* Footer (Actions) */}
                <div className="p-6 lg:p-10 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-6">
                    {item && onDelete ? (
                        <button
                            type="button"
                            onClick={async () => {
                                if (window.confirm("Archiver et supprimer définitivement cette fiche d'inventaire ?")) {
                                    await onDelete(item.id);
                                    onClose();
                                }
                            }}
                            className="flex items-center gap-3 px-6 py-4 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 rounded-3xl transition-all group"
                        >
                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>Supprimer la Fiche</span>
                        </button>
                    ) : <div />}

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-8 py-5 rounded-3xl text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                        >
                            Abandonner
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-4 px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? <Layers className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {item ? 'Sauvegarder les modifications' : 'Confirmer la Création'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
