import React from 'react';
import { Plus, ClipboardPaste, Trash2, Copy, DollarSign, Star } from 'lucide-react';
import { Activity } from '../../types';
import { User } from 'firebase/auth';
import { cn, isAbsence } from '../../lib/utils';
import { getDynamicSpecialDay } from '../../lib/calendarConstants';
import { getStatusColor } from '../../lib/ui-utils';
import { CalendarList } from './CalendarList';

interface CalendarGridProps {
    calendarDays: { date: string; day: number; currentMonth: boolean }[];
    activities: Activity[];
    currentUser: User | null;
    isSuperAdmin: boolean;
    onSelectActivity: (act: Activity) => void;
    onCreateActivity: (date: string) => void;
    onCopyActivity: (act: Activity) => void;
    onPasteActivity: (date: string) => void;
    onDeleteActivity: (id: string) => void;
    copiedActivity: Activity | null;
    dragOverDate: string | null;
    setDragOverDate: (date: string | null) => void;
    handleDrop: (activityId: string, targetDate: string) => Promise<void>;
    onQuickSpecialDay: (date: string, label: string) => void;
    currentMonthName?: string;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
    calendarDays,
    activities,
    currentUser,
    isSuperAdmin,
    onSelectActivity,
    onCreateActivity,
    onCopyActivity,
    onPasteActivity,
    onDeleteActivity,
    copiedActivity,
    dragOverDate,
    setDragOverDate,
    handleDrop,
    onQuickSpecialDay,
    currentMonthName,
}) => {
    return (
        <div className="relative transition-all duration-500">
            {/* Desktop Grid View */}
            <div className="hidden lg:grid grid-cols-7 gap-3">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="py-2 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mt-1 block">{day}</span>
                    </div>
                ))}
                {calendarDays.map((day, i) => {
                    const dayActivities = activities.filter(a => a.date === day.date);
                    const regularActivities = dayActivities.filter(a => !isAbsence(a.title) && !a.isPostponed);
                    const specialDay = day.date ? getDynamicSpecialDay(day.date, activities) : null;
                    const isDragOver = dragOverDate === day.date;

                    return (
                        <div
                            key={i}
                            className={cn('min-h-[140px] sm:min-h-[180px] p-4 transition-all relative group flex flex-col z-10 rounded-2xl border border-subtle shadow-sm dark:shadow-xl dark:shadow-black/20',
                                day.currentMonth
                                    ? 'bg-surface hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 transition-colors duration-300'
                                    : 'bg-black/5 dark:bg-black/40 border-transparent text-slate-400 dark:text-slate-700 pointer-events-none opacity-50 dark:opacity-30',
                                isDragOver ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-900/30' : ''
                            )}
                            onDragOver={(e) => {
                                if (!day.currentMonth || !currentUser) return;
                                e.preventDefault();
                                setDragOverDate(day.date);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                if (dragOverDate === day.date) setDragOverDate(null);
                            }}
                            onDrop={async (e) => {
                                e.preventDefault();
                                setDragOverDate(null);
                                if (!day.currentMonth || !currentUser) return;

                                const activityId = e.dataTransfer.getData('text/plain');
                                if (!activityId || !day.date) return;
                                await handleDrop(activityId, day.date);
                            }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={cn('text-[13px] font-black font-mono tracking-tighter transition-colors', day.currentMonth ? 'text-muted group-hover:text-primary dark:text-slate-400 dark:group-hover:text-slate-200' : 'text-slate-300 dark:text-slate-800')}>
                                        {day.day.toString().padStart(2, '0')}
                                    </span>
                                    {day.currentMonth && currentUser && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 origin-left">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onCreateActivity(day.date); }}
                                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all"
                                                title="Ajouter"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                            {copiedActivity && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onPasteActivity(day.date); }}
                                                    className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/40 transition-all animate-pulse"
                                                    title={`Coller: ${copiedActivity.title}`}
                                                >
                                                    <ClipboardPaste className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {specialDay && (
                                    <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border',
                                        specialDay.type === 'holiday' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                            specialDay.type === 'pedagogical' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    )}>
                                        {specialDay.label}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                                {regularActivities.map((act, actIdx) => (
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
                                        style={{ zIndex: regularActivities.length - actIdx }}
                                        className={cn(
                                            'group/act p-3 rounded-2xl text-[11px] border transition-all cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 active:scale-[0.98] flex flex-col gap-1.5 relative overflow-hidden backdrop-blur-sm',
                                            getStatusColor(act.preparationScore),
                                            currentUser ? 'cursor-grab active:cursor-grabbing' : ''
                                        )}
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full opacity-60" style={{ backgroundColor: 'currentColor' }} />
                                        <div className="flex justify-between items-start gap-2 pl-1">
                                            <span className="font-bold leading-snug break-words flex-1 group-hover/act:text-white line-clamp-2 uppercase tracking-tight">{act.title}</span>
                                            {currentUser && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover/act:opacity-100 transition-all">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onCopyActivity(act); }}
                                                        className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                                                        title="Copier"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                    {isSuperAdmin && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteActivity(act.id);
                                                            }}
                                                            className="p-1 hover:bg-rose-500/20 rounded-md text-gray-400 hover:text-rose-400 transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-auto pt-1 pl-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-white py-0.5 px-1.5 bg-black/40 rounded-md ring-1 ring-white/10">{act.startTime}</span>
                                                {act.logistics?.transportRequired && (
                                                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse" title="Transport" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!act.logistics?.isFree && (act.logistics?.costPerPerson && act.logistics.costPerPerson > 0) && (
                                                    <DollarSign className="w-3 h-3 text-emerald-500/80" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile List View */}
            <div className="lg:hidden">
                <CalendarList
                    calendarDays={calendarDays}
                    activities={activities}
                    onSelectActivity={onSelectActivity}
                    onCreateActivity={onCreateActivity}
                />
            </div>
        </div>
    );
};
