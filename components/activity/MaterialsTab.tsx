import React, { useState, useMemo } from 'react';
import { Package, Plus, Trash2, ShoppingCart, CheckCircle2, Circle, Search, AlertTriangle, Info, Clock } from 'lucide-react';
import { Activity, MaterialReservation, InventoryItem } from '../../types';
import { cn } from '../../lib/utils';
import { useInventory } from '../../hooks/useInventory';
import { SUGGESTIONS, getCombinedList } from '../../lib/constants';
import { useCustomSuggestions } from '../../hooks/useCustomSuggestions';
import { useReservations } from '../../hooks/useReservations';
import { InventoryService } from '../../services/inventoryService';

interface MaterialsTabProps {
    activity: Activity;
    updateActivity: (updates: Partial<Activity>) => void;
    userEmail?: string;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ activity, updateActivity, userEmail }) => {
    const { materialReservations = [] } = activity;
    const { items: inventoryItems, isLoading: loadingInventory } = useInventory(userEmail);
    const { customSuggestions } = useCustomSuggestions();

    const materialSuggestions = getCombinedList('materials', activity).filter(m => !materialReservations.some(r => r.itemName.toLowerCase() === m.toLowerCase()));
    const { reservations: allReservations, isLoading: loadingReservations } = useReservations(inventoryItems, userEmail);

    const [searchTerm, setSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);

    // Filtered items based on search
    const filteredItems = useMemo(() => {
        if (!searchTerm || !Array.isArray(inventoryItems)) return [];
        return inventoryItems.filter(item =>
            item && item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [inventoryItems, searchTerm]);

    const handleAddItemFromInventory = (item: InventoryItem) => {
        const newRes: MaterialReservation = {
            id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            activityId: activity.id,
            itemId: item.id,
            itemName: item.name,
            quantityRequired: 1,
            date: activity.date,
            status: 'Réservé'
        };

        // Validate status immediately
        const validatedRes = InventoryService.updateReservationStatus(newRes, item, allReservations);

        const newReservations = [...materialReservations, validatedRes];
        updateActivity({ materialReservations: newReservations });
        setSearchTerm("");
        setShowResults(false);
    };

    const handleAddManualMaterial = () => {
        const newRes: MaterialReservation = {
            id: `res-${Date.now()}`,
            activityId: activity.id,
            itemId: 'manual',
            itemName: searchTerm || "Nouvel article",
            quantityRequired: 1,
            date: activity.date,
            status: 'Réservé'
        };
        const newReservations = [...materialReservations, newRes];
        updateActivity({ materialReservations: newReservations });
        setSearchTerm("");
        setShowResults(false);
    };

    const handleUpdateReservation = (id: string, updates: Partial<MaterialReservation>) => {
        const newReservations = materialReservations.map(r => {
            if (r.id === id) {
                const updated = { ...r, ...updates };
                const item = inventoryItems.find(i => i.id === updated.itemId);
                if (item) {
                    return InventoryService.updateReservationStatus(updated, item, allReservations.filter(res => res.id !== id));
                }
                return updated;
            }
            return r;
        });
        updateActivity({ materialReservations: newReservations });
    };

    const handleRemoveReservation = (id: string) => {
        const newReservations = materialReservations.filter(r => r.id !== id);
        updateActivity({ materialReservations: newReservations });
    };

    const handleCreatePR = async (res: MaterialReservation, missingQty: number) => {
        if (!userEmail) {
            alert("Vous devez être connecté pour effectuer cette action.");
            return;
        }

        const item = inventoryItems.find(i => i.id === res.itemId);
        if (!item) return;

        try {
            await InventoryService.autoCreatePurchaseRequest(
                item,
                missingQty,
                activity.id,
                userEmail
            );
            alert(`Demande d'achat créée pour ${missingQty} ${item.name}.`);
        } catch (error) {
            console.error("PR creation error:", error);
            alert("Erreur lors de la création de la demande d'achat.");
        }
    };

    const conflictCount = materialReservations.filter(r => r.status === 'Conflit (Manque)').length;
    const totalCount = materialReservations.length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* INVENTORY HEADER & SEARCH */}
            <div className="flex flex-col gap-4 bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Inventaire & Réservations</h3>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">
                                {totalCount} matériel{totalCount > 1 ? 's' : ''} • {conflictCount > 0 ? `${conflictCount} en conflit` : 'Tous disponibles'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative mt-2">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher dans l'inventaire MDJ..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder-slate-400 dark:placeholder-gray-600 font-medium"
                        />
                    </div>

                    {showResults && searchTerm && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-mdj-dark border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {filteredItems.length > 0 ? (
                                <div className="p-1">
                                    {filteredItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleAddItemFromInventory(item)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-bold text-slate-700 dark:text-white group-hover:text-indigo-500 transition-colors">{item.name}</span>
                                                <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-tight">{item.category} • {item.location}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "text-[10px] font-black px-2 py-0.5 rounded-full",
                                                    item.totalQuantity > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    Stock: {item.totalQuantity}
                                                </span>
                                                <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center">
                                    <p className="text-xs text-slate-500 italic mb-3">Aucun article trouvé dans l'inventaire.</p>
                                    <button
                                        onClick={handleAddManualMaterial}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Plus className="w-3 h-3" /> Ajouter "{searchTerm}" manuellement
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase px-1">Matériel suggéré</label>
                        <select
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                    const existing = inventoryItems.find(i => i.name.toLowerCase() === val.toLowerCase());
                                    if (existing) handleAddItemFromInventory(existing);
                                    else {
                                        setSearchTerm(val);
                                        handleAddManualMaterial();
                                    }
                                    e.target.value = "";
                                }
                            }}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        >
                            <option value="" className="text-slate-900">Sélectionner un article...</option>
                            {materialSuggestions.map(m => (
                                <option key={m} value={m} className="text-slate-900">{m}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* RESERVATIONS LIST */}
            <div className="space-y-4">
                {totalCount === 0 ? (
                    <div className="py-20 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-300 dark:text-gray-700">
                        <ShoppingCart className="w-12 h-12 mb-4 opacity-10" />
                        <p className="text-sm font-medium italic">Aucun matériel réservé pour cette activité.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {materialReservations.map((res, idx) => {
                            const item = inventoryItems.find(i => i.id === res.itemId);
                            const available = item ? InventoryService.getAvailableQuantity(item, allReservations.filter(r => r.id !== res.id), res.date, res.quantityRequired).available : 0;
                            const isConflict = res.status === 'Conflit (Manque)';

                            return (
                                <div
                                    key={res.id}
                                    className={cn(
                                        "group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border transition-all duration-300 animate-in slide-in-from-right-4",
                                        isConflict
                                            ? "bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20"
                                            : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/30"
                                    )}
                                    style={{ animationDelay: `${idx * 40}ms` }}
                                >
                                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-4 gap-4">
                                        {/* Material Info */}
                                        <div className="sm:col-span-2 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-800 dark:text-white">{res.itemName}</span>
                                                {isConflict && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter bg-red-500 text-white px-1.5 py-0.5 rounded animate-pulse">
                                                        <AlertTriangle className="w-2.5 h-2.5" /> Manque
                                                    </span>
                                                )}
                                                {!isConflict && item && (
                                                    <span className="text-[8px] font-black uppercase tracking-tighter bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">
                                                        Réservé
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium italic">
                                                {item ? `${item.category} • Stock total: ${item.totalQuantity}` : 'Article saisi manuellement'}
                                            </p>
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1 block">Qté Requise</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={res.quantityRequired}
                                                    onChange={(e) => handleUpdateReservation(res.id, { quantityRequired: parseInt(e.target.value) || 0 })}
                                                    className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    min="1"
                                                />
                                            </div>
                                        </div>

                                        {/* Availability / Action */}
                                        <div className="flex items-center sm:justify-end gap-3">
                                            {isConflict && (
                                                <button
                                                    onClick={() => {
                                                        const { missing } = InventoryService.getAvailableQuantity(
                                                            item!,
                                                            allReservations.filter(r => r.id !== res.id),
                                                            res.date,
                                                            res.quantityRequired
                                                        );
                                                        handleCreatePR(res, missing);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-sm"
                                                >
                                                    <Plus className="w-3 h-3" /> Achat
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRemoveReservation(res.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialsTab;
