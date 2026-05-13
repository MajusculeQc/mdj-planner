import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, Send, CheckCircle } from 'lucide-react';
import { FirebaseService } from '../../services/firebaseService';
import { SyncPreviewHeader } from './SyncPreviewHeader';
import { SyncActivityCard } from './SyncActivityCard';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';

interface SyncPreviewModalProps {
    onClose: () => void;
}

const SyncPreviewModal: React.FC<SyncPreviewModalProps> = ({ onClose }) => {
    const [currentDate, setCurrentDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 1); // Default to next month
    });
    const [loading, setLoading] = useState(false);
    const [activities, setActivities] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);

    const fetchPreview = async (date: Date) => {
        setLoading(true);
        setError(null);
        try {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const data = await FirebaseService.getSyncPreview(year, month);

            // Filter out internal activities (absences, meetings, etc.)
            const filteredData = data.filter((activity: any) => {
                const title = activity.title.toUpperCase();
                const internalKeywords = ['ABSENCE', 'REUNION', 'RÉUNION', 'FORMATION', 'CONGÉ', 'ADMIN', 'JDB'];
                const isInternal = internalKeywords.some(keyword => title.includes(keyword));
                const isReady = (activity.preparationScore || 0) >= 100;
                return !isInternal && isReady;
            });

            setActivities(filteredData);
        } catch (err: any) {
            console.error("Preview fetch error:", err);
            setError("Erreur lors de la récupération de la prévisualisation.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreview(currentDate);
    }, [currentDate]);

    const goToPrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleSync = async () => {
        if (!activities.length || syncing) return;
        setSyncing(true);
        setSyncSuccess(false);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            await FirebaseService.syncToWebsite(year, month);
            setSyncSuccess(true);
            setTimeout(() => setSyncSuccess(false), 5000);
        } catch (err) {
            console.error("Sync error:", err);
            alert("Erreur lors de la synchronisation.");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            title="Synchronisation Web"
            icon={<Send className="w-6 h-6" />}
            maxWidth="4xl"
        >
            <div className="flex flex-col h-full uppercase">

                <SyncPreviewHeader
                    currentDate={currentDate}
                    onPrevMonth={goToPrevMonth}
                    onNextMonth={goToNextMonth}
                    onClose={onClose}
                />

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50 dark:bg-transparent transition-colors">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-cyan-500 dark:text-cyan-400 animate-spin" />
                            <p className="text-slate-500 dark:text-gray-400 animate-pulse">Génération de la prévisualisation par l'IA...</p>
                        </div>
                    ) : error ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-red-500 dark:text-red-400">
                            <p>{error}</p>
                            <button
                                onClick={() => fetchPreview(currentDate)}
                                className="px-4 py-2 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/30 transition-all font-bold text-xs"
                            >
                                RÉESSAYER
                            </button>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-gray-500">
                            <Calendar className="w-12 h-12 opacity-20" />
                            <p>Aucune activité prévue pour ce mois.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activities.map((activity, idx) => (
                                <SyncActivityCard key={idx} activity={activity} />
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-gray-900/30 flex justify-between items-center transition-colors">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", activities.length > 0 ? "bg-green-500 animate-pulse" : "bg-slate-300 dark:bg-gray-600")}></div>
                            <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-widest font-bold">
                                {activities.length > 0 ? "Prêt pour synchronisation" : "Aucune donnée"}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-300 dark:text-gray-600 font-medium">Les images sont générées par Pollinations AI</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {syncSuccess && (
                            <div className="flex items-center gap-2 text-green-500 animate-in fade-in slide-in-from-right-2">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Synchronisé !</span>
                            </div>
                        )}
                        <button
                            onClick={handleSync}
                            disabled={activities.length === 0 || syncing}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95",
                                syncing
                                    ? "bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed shadow-none"
                                    : "bg-cyan-500 hover:bg-cyan-400 text-white shadow-cyan-900/20"
                            )}
                        >
                            {syncing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Synchronisation...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Mettre à jour le site web
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SyncPreviewModal;
