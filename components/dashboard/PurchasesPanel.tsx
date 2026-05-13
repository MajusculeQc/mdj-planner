import React from 'react';
import {
    ShoppingBag,
    Package,
    ShoppingCart,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Plus,
    Search,
    Filter,
    ArrowRight,
    Truck,
    ExternalLink,
    Check,
    X
} from 'lucide-react';
import { PurchaseRequest } from '../../types';
import { cn } from '../../lib/utils';
import { usePurchases } from '../../hooks/usePurchases';
import { FirebaseService } from '../../services/firebaseService';
import { InventoryService } from '../../services/inventoryService';

interface PurchasesPanelProps {
    isAdmin: boolean;
    onSelectActivity?: (id: string) => void;
    userEmail?: string;
}

export const PurchasesPanel: React.FC<PurchasesPanelProps> = ({ isAdmin, onSelectActivity, userEmail }) => {
    const { requests, isLoading, saveRequest } = usePurchases(userEmail);
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'pending' | 'ordered' | 'history'>('pending');
    const [newRequest, setNewRequest] = React.useState({
        customName: '',
        quantityNeeded: 1,
        reason: '',
        estimatedCost: 0
    });

    const pendingRequests = requests.filter(r => r.status === "En attente d'approbation");
    const orderedRequests = requests.filter(r => r.status === "Commandé");

    // Skeleton content for loading state
    const SkeletonContent = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-white/5 rounded-2xl" />
            ))}
        </div>
    );

    const handleStatusChange = async (req: PurchaseRequest, newStatus: PurchaseRequest['status']) => {
        try {
            await saveRequest({ ...req, status: newStatus });

            // If received, update inventory stock
            if (newStatus === "Reçu" && req.itemId) {
                await InventoryService.processRestock(req.itemId, req.quantityNeeded);
            }
        } catch (error) {
            console.error("Error updating purchase status:", error);
        }
    };

    const handleAddRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const request: PurchaseRequest = {
                id: `req-${Date.now()}`,
                itemId: null,
                customName: newRequest.customName,
                quantityNeeded: newRequest.quantityNeeded,
                reason: newRequest.reason,
                linkedActivityId: null,
                status: "En attente d'approbation",
                estimatedCost: newRequest.estimatedCost,
                requestedBy: userEmail || 'anonyme@mdjescalejeunesse.ca',
                timestamp: Date.now()
            };
            await saveRequest(request);
            setNewRequest({ customName: '', quantityNeeded: 1, reason: '', estimatedCost: 0 });
            setShowAddForm(false);
        } catch (error) {
            console.error("Error adding request:", error);
        }
    };

    return (
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md h-[400px]">
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/30 dark:bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">Achats & Commandes</h3>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                            {pendingRequests.length} en attente • {orderedRequests.length} en cours
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={cn(
                        "p-2 rounded-xl border transition-all",
                        showAddForm
                            ? "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white border-slate-200 dark:border-white/10"
                            : "bg-orange-600 text-white border-orange-500 hover:bg-orange-700 shadow-sm"
                    )}
                >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
            </div>

            {/* Tabs */}
            {!showAddForm && (
                <div className="flex p-1 bg-slate-100/50 dark:bg-black/20 gap-1">
                    {[
                        { id: 'pending', label: 'En attente', count: pendingRequests.length },
                        { id: 'ordered', label: 'En cours', count: orderedRequests.length },
                        { id: 'history', label: 'Historique', count: requests.length - pendingRequests.length - orderedRequests.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            {tab.label} {tab.count > 0 && `(${tab.count})`}
                        </button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <SkeletonContent />
            ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {showAddForm ? (
                        <form onSubmit={handleAddRequest} className="space-y-4 p-2 bg-orange-50/50 dark:bg-orange-500/5 rounded-2xl border border-orange-200/50 dark:border-orange-500/20 animate-in zoom-in-95">
                            <h4 className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Nouvelle demande</h4>
                            <div className="space-y-3">
                                <input
                                    autoFocus
                                    placeholder="Nom de l'article..."
                                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500"
                                    value={newRequest.customName}
                                    onChange={e => setNewRequest({ ...newRequest, customName: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Quantité</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500"
                                            value={newRequest.quantityNeeded}
                                            onChange={e => setNewRequest({ ...newRequest, quantityNeeded: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Coût estimé ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500"
                                            value={newRequest.estimatedCost}
                                            onChange={e => setNewRequest({ ...newRequest, estimatedCost: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Raison / Usage..."
                                    rows={2}
                                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500 resize-none"
                                    value={newRequest.reason}
                                    onChange={e => setNewRequest({ ...newRequest, reason: e.target.value })}
                                />
                                <button
                                    type="submit"
                                    disabled={!newRequest.customName}
                                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black uppercase text-[10px] py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20"
                                >
                                    Envoyer la demande
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {requests.filter(req => {
                                if (activeTab === 'pending') return req.status === "En attente d'approbation";
                                if (activeTab === 'ordered') return ["Approuvé", "Commandé"].includes(req.status);
                                if (activeTab === 'history') return ["Reçu", "Refusé"].includes(req.status);
                                return false;
                            }).length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-gray-700 opacity-50 space-y-2 mt-8">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-center px-4">Aucune demande dans cette section</p>
                                </div>
                            ) : (
                                requests.filter(req => {
                                    if (activeTab === 'pending') return req.status === "En attente d'approbation";
                                    if (activeTab === 'ordered') return ["Approuvé", "Commandé"].includes(req.status);
                                    if (activeTab === 'history') return ["Reçu", "Refusé"].includes(req.status);
                                    return false;
                                }).map(req => {
                                    const isPending = req.status === "En attente d'approbation";
                                    const isApproved = req.status === "Approuvé";
                                    const isOrdered = req.status === "Commandé";
                                    const isReceived = req.status === "Reçu";
                                    const isRefused = req.status === "Refusé";

                                    return (
                                        <div key={req.id} className={cn(
                                            "p-3 rounded-2xl border transition-all animate-in fade-in slide-in-from-right-4",
                                            isOrdered ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20 shadow-sm shadow-blue-500/5 text-blue-900 dark:text-blue-100" :
                                                isReceived ? "bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 opacity-70" :
                                                    isRefused ? "bg-rose-50/30 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10 opacity-60" :
                                                        "bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 shadow-sm"
                                        )}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-xs font-black uppercase tracking-tight",
                                                            (isReceived || isRefused) && "line-through opacity-50"
                                                        )}>
                                                            {req.customName || "Article inconnu"}
                                                        </span>
                                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 uppercase tabular-nums">
                                                            x{req.quantityNeeded || 0}
                                                        </span>
                                                    </div>
                                                    {req.reason && (
                                                        <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                                                            {req.reason}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Workflow Buttons */}
                                                {isAdmin && !isReceived && !isRefused && (
                                                    <div className="flex items-center gap-1">
                                                        {isPending && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusChange(req, "Approuvé")}
                                                                    className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                                                                    title="Approuver"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(req, "Refusé")}
                                                                    className="p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                                                                    title="Refuser"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {isApproved && (
                                                            <button
                                                                onClick={() => handleStatusChange(req, "Commandé")}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
                                                                title="Marquer comme commandé"
                                                            >
                                                                <Truck className="w-3 h-3" /> Commander
                                                            </button>
                                                        )}
                                                        {isOrdered && (
                                                            <button
                                                                onClick={() => handleStatusChange(req, "Reçu")}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
                                                                title="Confirmer la réception"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" /> Reçu
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                                                            <Clock className="w-2 h-2 text-slate-500 dark:text-slate-400" />
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 tabular-nums uppercase">
                                                            {req.timestamp ? new Date(req.timestamp).toLocaleDateString() : '--'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] font-black text-orange-600/70 dark:text-orange-400/50 uppercase tracking-tighter tabular-nums">
                                                        {(req.estimatedCost || 0).toFixed(2)} $
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 italic lowercase truncate max-w-[80px]">
                                                        {req.requestedBy?.split('@')[0]}
                                                    </span>
                                                    {req.linkedActivityId && onSelectActivity && (
                                                        <button
                                                            onClick={() => onSelectActivity(req.linkedActivityId!)}
                                                            className="text-indigo-500 hover:text-indigo-600 p-1 transition-colors"
                                                            title="Voir activité liée"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
