import React from 'react';
import { Activity } from '../../types';
import { cn, isAbsence } from '../../lib/utils';
import { getStatusColor } from '../../lib/ui-utils';
import { Plus } from 'lucide-react';

interface CalendarListProps {
    calendarDays: { date: string; day: number; currentMonth: boolean }[];
    activities: Activity[];
    onSelectActivity: (act: Activity) => void;
    onCreateActivity: (date: string) => void;
}

export const CalendarList: React.FC<CalendarListProps> = ({
    calendarDays,
    activities,
    onSelectActivity,
    onCreateActivity,
}) => {
    // Only show days with activities or today for brevity on mobile
    const today = new Date().toISOString().split('T')[0];
    const relevantDays = calendarDays.filter(day => {
        if (!day.currentMonth) return false;
        const dayActs = activities.filter(a => a.date === day.date && !isAbsence(a.title) && !a.isPostponed);
        return dayActs.length > 0 || day.date === today;
    });

    return (
        <div className="space-y-6 pb-20">
            {relevantDays.map((day) => (
                <div key={day.date} className="space-y-3">
                    <div className="flex items-center justify-between sticky top-16 bg-base/80 backdrop-blur-sm py-2 z-20">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-lg font-black font-mono",
                                day.date === today ? "text-indigo-500" : "text-primary"
                            )}>
                                {day.day.toString().padStart(2, '0')}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                                {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                            </span>
                        </div>
                        <button
                            onClick={() => onCreateActivity(day.date)}
                            className="p-1 px-3 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider"
                        >
                            + Ajouter
                        </button>
                    </div>

                    <div className="space-y-2">
                        {activities.filter(a => a.date === day.date && !isAbsence(a.title) && !a.isPostponed).length === 0 ? (
                            <p className="text-[10px] text-muted italic pl-8">Aucune activité prévue.</p>
                        ) : (
                            activities.filter(a => a.date === day.date && !isAbsence(a.title) && !a.isPostponed).map((act) => (
                                <div
                                    key={act.id}
                                    onClick={() => onSelectActivity(act)}
                                    className={cn(
                                        'p-4 rounded-2xl border transition-all active:scale-[0.98] flex items-center gap-4 relative overflow-hidden',
                                        getStatusColor(act.preparationScore)
                                    )}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-60" style={{ backgroundColor: 'currentColor' }} />
                                    <div className="text-[10px] font-black text-white py-1 px-2 bg-black/40 rounded-lg ring-1 ring-white/10 shrink-0">
                                        {act.startTime}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-bold uppercase tracking-tight truncate group-active:text-white">
                                            {act.title}
                                        </h3>
                                        <p className="text-[9px] text-muted truncate opacity-80 mt-0.5">
                                            {act.logistics?.venueName || act.logistics?.address || 'Lieu non défini'}
                                        </p>
                                    </div>
                                    {act.logistics?.transportRequired && (
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 animate-pulse" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
