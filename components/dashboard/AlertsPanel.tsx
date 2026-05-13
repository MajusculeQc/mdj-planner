import React from 'react';
import { AlertCircle, Trash2, Sparkles, Loader2, Users, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Activity, InventoryItem } from '../../types';
import { StaffConflict } from '../../hooks/usePlanningMetrics';
import { calculateActivityReadiness, ReadinessCheck } from '../../lib/readiness';
import { getEmployeeName } from '../../lib/constants';
import { isSuperAdmin } from '../../lib/auth-utils';
import { User } from 'firebase/auth';
import { Card } from '../ui/Card';

interface AlertsPanelProps {
    alerts: Activity[];
    staffConflicts: StaffConflict[];
    currentUser: User | null;
    onSelectActivity: (act: Activity) => void;
    onDeleteActivity: (id: string, e: React.MouseEvent) => void;
    onRMJQSync?: () => Promise<void>;
    isAdmin?: boolean;
    lowStockItems?: InventoryItem[];
    onCreatePR?: (item: InventoryItem, missingQty: number) => Promise<void>;
}

export function AlertsPanel({ alerts, staffConflicts, currentUser, onSelectActivity, onDeleteActivity, onRMJQSync, isAdmin, lowStockItems = [], onCreatePR }: AlertsPanelProps) {
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [expandedAlerts, setExpandedAlerts] = React.useState<Set<string>>(new Set());

    const toggleExpanded = (id: string) => {
        setExpandedAlerts(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSync = async () => {
        if (!onRMJQSync) return;
        setIsSyncing(true);
        try {
            await onRMJQSync();
        } finally {
            setIsSyncing(false);
        }
    };
    return (
        <Card className="h-fit">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" /> Alertes
                    <span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded ml-1">({alerts.length} jours)</span>
                    {staffConflicts.length > 0 && (
                        <span className="text-[10px] bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded ml-1 animate-pulse">
                            ⚡ {staffConflicts.length} conflit{staffConflicts.length > 1 ? 's' : ''}
                        </span>
                    )}
                </h3>
                {isAdmin && onRMJQSync && (
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="p-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-500/20 transition-all flex items-center gap-2 group disabled:opacity-50"
                        title="Synchronisation Globale RMJQ (IA)"
                    >
                        {isSyncing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Sync IA</span>
                    </button>
                )}
            </div>

            {/* ── Staff Double-Booking Conflicts ─────────────────────────── */}
            {staffConflicts.length > 0 && (
                <div className="mb-4 space-y-2">
                    <p className="text-[9px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest flex items-center gap-1 mb-1">
                        <Users className="w-3 h-3" /> Dédoublements d'intervenants
                    </p>
                    {staffConflicts.map((conflict, idx) => (
                        <div key={`${conflict.date}-${conflict.staffName}-${idx}`} className="p-3 bg-orange-50 dark:bg-orange-500/5 rounded-2xl border border-orange-100 dark:border-orange-500/30 group">
                            <div className="flex items-center gap-2">
                                <span className="text-orange-500 dark:text-orange-400 font-black text-xs">⚡</span>
                                <span className="text-xs font-bold text-orange-600 dark:text-orange-300">{conflict.staffName.split(' ')[0]}</span>
                                <span className="text-[9px] text-orange-400/60 dark:text-orange-400/60 font-mono">{conflict.date}</span>
                            </div>
                            <div className="mt-1.5 flex flex-col gap-0.5 pl-4">
                                {conflict.activities.map(a => (
                                    <div key={a.id} className="text-[9px] text-orange-600 dark:text-orange-400/80 flex items-start gap-1">
                                        <span className="shrink-0 mt-0.5">•</span>
                                        <span className="leading-tight truncate">{a.title} <span className="opacity-50">({a.startTime}–{a.endTime})</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Low Stock Alerts ─────────────────────────── */}
            {lowStockItems.length > 0 && (
                <div className="mb-6 space-y-2">
                    <p className="text-[9px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest flex items-center gap-1 mb-1">
                        <Package className="w-3 h-3" /> Stocks critiques
                    </p>
                    {lowStockItems.map(item => (
                        <div key={item.id} className="p-3 bg-orange-50 dark:bg-orange-500/5 rounded-2xl border border-orange-100 dark:border-orange-500/30">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-800 dark:text-white">{item.name}</span>
                                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-black">
                                        Reste: {item.totalQuantity} (Seuil: {item.minThreshold})
                                    </span>
                                </div>
                                <button
                                    onClick={() => onCreatePR?.(item, Math.max(1, item.minThreshold - item.totalQuantity))}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500 hover:bg-orange-400 text-white font-black animate-pulse uppercase tracking-tighter transition-all"
                                >
                                    Commander
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-3">
                {alerts.length > 0 ? alerts.map(act => {
                    const readiness = calculateActivityReadiness(act);
                    const missingChecks = readiness.checks.filter(c => !c.met && !c.optional);

                    return (
                        <div key={act.id} className="p-3 bg-slate-50 dark:bg-gray-950/60 rounded-2xl border border-slate-100 dark:border-white/5 group relative hover:border-red-300 dark:hover:border-red-500/30 transition-all flex justify-between items-center gap-2 cursor-pointer shadow-sm dark:shadow-none" onClick={() => onSelectActivity(act)}>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-700 dark:text-gray-200 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{act.title}</div>
                                <div className="text-[9px] text-slate-400 dark:text-gray-500 flex items-center gap-2 mt-1 font-mono uppercase tracking-tighter">
                                    {act.date || 'Sans date'} • {act.preparationScore || 0}%
                                    {act.staffing?.leadStaff && <span className="hidden sm:inline-block text-[9px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 px-1.5 rounded border border-red-200 dark:border-red-500/30">{(act.staffing.leadStaff || '').split(' ')[0]}</span>}
                                </div>

                                {/* Missing Items Details */}
                                {act.id.startsWith('missing_') && act.title.includes('⚠️') ? (
                                    <div className="mt-2 text-[10px] text-red-600 dark:text-red-400/80 leading-tight">
                                        • Associer une activité ou fermer le centre.
                                    </div>
                                ) : missingChecks.length > 0 && (
                                    <div className="mt-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleExpanded(act.id); }}
                                            className="flex items-center gap-1 text-[9px] font-bold text-red-500 hover:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md transition-colors"
                                        >
                                            {expandedAlerts.has(act.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            {missingChecks.length} correctif{missingChecks.length > 1 ? 's' : ''} à faire
                                        </button>
                                        {expandedAlerts.has(act.id) && (
                                            <div className="mt-1.5 flex flex-col gap-0.5 pl-2 border-l-2 border-red-500/20 py-0.5">
                                                {missingChecks.map((c: ReadinessCheck, i: number) => (
                                                    <div key={i} className="text-[9px] text-red-600 dark:text-red-400/80 flex items-start gap-1">
                                                        <span className="shrink-0 mt-0.5">•</span>
                                                        <span className="leading-tight">{c.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {(!act.createdByEmail || act.createdByEmail === currentUser?.email || isSuperAdmin(currentUser?.email)) && (
                                    <button onClick={(e) => onDeleteActivity(act.id, e)} className="p-1.5 hover:bg-red-500/10 rounded-full text-red-500 transition-colors" title="Supprimer">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-xs text-green-600 dark:text-green-500/50 italic text-center py-2 flex flex-col items-center gap-2"><span>✅ Tout est prêt pour les 30 prochains jours !</span></div>
                )}
            </div>
        </Card>
    );
}

