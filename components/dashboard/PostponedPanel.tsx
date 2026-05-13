import React from 'react';
import { CalendarX } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Activity } from '../../types';
import { Card } from '../ui/Card';

interface PostponedPanelProps {
    activities: Activity[];
    dragOverDate: string | null;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    onSelectActivity: (act: Activity) => void;
    currentUser: any;
}

export const PostponedPanel: React.FC<PostponedPanelProps> = ({
    activities,
    dragOverDate,
    onDragOver,
    onDragLeave,
    onDrop,
    onSelectActivity,
    currentUser,
}) => {
    const postponedActivities = activities.filter(a => a.isPostponed);

    return (
        <Card
            className={cn(
                "border-orange-500/10",
                dragOverDate === 'postponed' ? "bg-orange-500/10 border-orange-500/30" : ""
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="flex items-center justify-between mb-6 pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-600/10 flex items-center justify-center border border-orange-600/20">
                        <CalendarX className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-[13px] uppercase tracking-wider text-slate-800 dark:text-white">Activités à reporter</h3>
                        <p className="text-[10px] text-orange-600/60 font-bold uppercase tracking-widest">En attente de date</p>
                    </div>
                </div>
            </div>
            <div className="space-y-2 flex-1">
                {postponedActivities.map(act => (
                    <div
                        key={act.id}
                        draggable={!!currentUser}
                        onDragStart={(e) => {
                            if (!currentUser) {
                                e.preventDefault();
                                return;
                            }
                            e.dataTransfer.setData('text/plain', act.id);
                            e.currentTarget.style.opacity = '0.5';
                        }}
                        onDragEnd={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = '1';
                        }}
                        onClick={() => onSelectActivity(act)}
                        className={cn(
                            "flex justify-between items-center p-2 bg-white dark:bg-gray-900/50 hover:bg-slate-50 dark:hover:bg-gray-800 transition-all rounded-lg border border-slate-200 dark:border-orange-500/10 text-sm shadow-sm dark:shadow-none",
                            currentUser ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                        )}
                    >
                        <span className="font-medium text-slate-700 dark:text-gray-300 truncate mr-2" title={act.title}>
                            {act.title}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] text-orange-600 dark:text-orange-400/80 font-mono whitespace-nowrap bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-1.5 py-0.5 rounded">
                                Était le : {act.date}
                            </span>
                        </div>
                    </div>
                ))}
                {postponedActivities.length === 0 && (
                    <div className="text-sm text-gray-500 italic text-center py-4">
                        Aucune activité en attente de nouvelle date.
                    </div>
                )}
            </div>
        </Card>
    );
};
