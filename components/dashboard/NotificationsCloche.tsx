import React, { useState } from 'react';
import { Bell, AlertCircle, Package, UserX, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { calculateActivityReadiness } from '../../lib/readiness';

interface NotificationsClocheProps {
    alerts: {
        incompleteAlerts: any[];
        staffConflicts: any[];
        lowStockItems: any[];
    };
    onSelectActivity: (id: string, tab?: string) => void;
    onManageInventory: (item: any) => void;
}

export const NotificationsCloche: React.FC<NotificationsClocheProps> = ({
    alerts,
    onSelectActivity,
    onManageInventory
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const incompleteAlerts = alerts?.incompleteAlerts || [];
    const staffConflicts = alerts?.staffConflicts || [];
    const lowStockItems = alerts?.lowStockItems || [];
    const totalCount = incompleteAlerts.length + staffConflicts.length + lowStockItems.length;

    if (totalCount === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "p-2.5 rounded-2xl transition-all relative",
                    isOpen ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-base text-muted hover:text-primary hover:bg-surface border border-subtle"
                )}
            >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                    {totalCount}
                </span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-4 w-80 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 glass-strong">
                        <div className="p-4 bg-indigo-600/10 border-b border-subtle flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Centre d'Alertes</h3>
                            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-primary"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {/* Incomplete Activities */}
                            {incompleteAlerts.length > 0 && (
                                <div className="p-2">
                                    <div className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-tighter">Planification ({incompleteAlerts.length})</div>
                                    {incompleteAlerts.map(alert => (
                                        <button
                                            key={alert.id}
                                            onClick={() => {
                                                const readiness = calculateActivityReadiness(alert);
                                                const firstFail = readiness.checks.find(c => c.isCritical && !c.met);
                                                onSelectActivity(alert.id, firstFail?.tab);
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-base transition-colors text-left group"
                                        >
                                            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><AlertCircle className="w-4 h-4" /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-primary truncate">{alert.title}</div>
                                                <div className="text-[10px] text-muted">{(alert.missing || []).length} champs requis</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Staff Conflicts */}
                            {staffConflicts.length > 0 && (
                                <div className="p-2 border-t border-subtle">
                                    <div className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-tighter">Conflits RH ({staffConflicts.length})</div>
                                    {staffConflicts.map((alert, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { onSelectActivity(alert.activityId); setIsOpen(false); }}
                                            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-base transition-colors text-left group"
                                        >
                                            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500"><UserX className="w-4 h-4" /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-primary truncate">{alert.employee}</div>
                                                <div className="text-[10px] text-muted">Absent le {alert.date}</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Low Stock */}
                            {lowStockItems.length > 0 && (
                                <div className="p-2 border-t border-subtle">
                                    <div className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-tighter">Inventaire ({lowStockItems.length})</div>
                                    {lowStockItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => { onManageInventory(item); setIsOpen(false); }}
                                            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-base transition-colors text-left group"
                                        >
                                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><Package className="w-4 h-4" /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-primary truncate">{item.name}</div>
                                                <div className="text-[10px] text-muted">Stock: {item.currentStock} / Mini: {item.minStock}</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
