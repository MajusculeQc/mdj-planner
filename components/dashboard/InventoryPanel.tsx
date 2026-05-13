import React, { useState } from 'react';
import { Package, Search, Plus, AlertTriangle, MapPin, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import { InventoryItem } from '../../types';
import { cn } from '../../lib/utils';
import { useInventory } from '../../hooks/useInventory';
import { InventoryItemModal } from './InventoryItemModal';

interface InventoryPanelProps {
    isAdmin: boolean;
    userEmail?: string;
    onManageItem: (item?: InventoryItem) => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ isAdmin, userEmail, onManageItem }) => {
    const { items, isLoading, deleteItem } = useInventory(userEmail);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockItems = items.filter(i => i.totalQuantity <= i.minThreshold);

    const handleEdit = (item: InventoryItem) => {
        onManageItem(item);
    };

    const handleAddNew = () => {
        onManageItem(undefined);
    };

    // Skeleton content for loading state
    const SkeletonContent = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-2xl" />
            ))}
        </div>
    );

    return (
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md h-[400px]">
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/30 dark:bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">Inventaire MDJ</h3>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                            {items.length} articles • {lowStockItems.length} alertes stock
                        </p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleAddNew}
                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="p-4 border-b border-slate-100 dark:border-white/5">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all placeholder-slate-400"
                    />
                </div>
            </div>

            {isLoading ? (
                <SkeletonContent />
            ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filteredItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-gray-700 opacity-50 space-y-2">
                            <Package className="w-8 h-8" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Aucun article trouvé</p>
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <div key={item.id} className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm flex items-center justify-between group hover:border-indigo-500/30 transition-all animate-in fade-in slide-in-from-right-4">
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-slate-700 dark:text-white truncate">{item.name}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                                            <MapPin className="w-2.5 h-2.5" /> {item.location || "N/A"}
                                        </span>
                                        <span className="text-[9px] text-slate-300 dark:text-gray-600">•</span>
                                        <span className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tighter">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                        <span className={cn(
                                            "text-xs font-black",
                                            item.totalQuantity <= item.minThreshold ? "text-red-500" : "text-slate-700 dark:text-gray-300"
                                        )}>
                                            {item.totalQuantity}
                                        </span>
                                        {item.totalQuantity <= item.minThreshold && (
                                            <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 ml-auto" />
                                        )}
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-500 rounded-lg"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Supprimer ${item.name} ?`)) deleteItem(item.id);
                                                }}
                                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-lg"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                        ))
                    }
                </div>
            )}

        </div>
    );
};
