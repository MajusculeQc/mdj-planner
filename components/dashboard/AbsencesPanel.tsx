import React from 'react';
import { UserX, Plus } from 'lucide-react';
import { Activity } from '../../types';
import { isAbsence } from '../../lib/utils';
import { Card } from '../ui/Card';

interface AbsencesPanelProps {
    activities: Activity[];
    currentMonthStr?: string;
    onAddAbsence?: () => void;
}

export function AbsencesPanel({ activities, onAddAbsence }: AbsencesPanelProps) {
    const today = new Date().toISOString().split('T')[0];
    const absences = activities.filter(a => isAbsence(a.title) && a.date >= today);

    const absencesGrouped = absences.reduce((acc, abs) => {
        const name = abs.title.replace(/^(?:absence|vacances?|cong[eé]s?)\s*(?:-|:)?\s*/i, '').trim();
        if (!acc[name]) acc[name] = [];
        acc[name].push(abs.date);
        return acc;
    }, {} as Record<string, string[]>);

    return (
        <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <UserX className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-black text-[13px] uppercase tracking-wider text-slate-800 dark:text-white">Absences du mois</h3>
                        <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest">Congés et vacances</p>
                    </div>
                </div>
                {onAddAbsence && (
                    <button
                        onClick={onAddAbsence}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 text-white dark:text-orange-400 border border-orange-500/50 transition-all text-[10px] font-black uppercase tracking-wider shadow-lg shadow-orange-500/20"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Ajouter</span>
                    </button>
                )}
            </div>
            <div className="space-y-2">
                {Object.entries(absencesGrouped).map(([name, dates]) => {
                    const sortedDates = dates.sort();
                    const start = sortedDates[0];
                    const end = sortedDates[sortedDates.length - 1];
                    const formatDay = (d: string) => d.split('-')[2] + '/' + d.split('-')[1];
                    return (
                        <div key={name} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-gray-900/50 rounded-lg border border-slate-100 dark:border-white/5 text-sm shadow-sm dark:shadow-none">
                            <span className="font-medium text-slate-700 dark:text-gray-300">{name}</span>
                            <span className="text-xs text-slate-500 dark:text-gray-500 font-mono bg-black/5 dark:bg-black/20 px-2 py-1 rounded">
                                {start === end ? formatDay(start) : `${formatDay(start)} au ${formatDay(end)}`} ({dates.length} jrs)
                            </span>
                        </div>
                    );
                })}
                {absences.length === 0 && (
                    <div className="text-sm text-slate-400 dark:text-gray-500 italic">Aucune absence prévue ce mois-ci.</div>
                )}
            </div>
        </Card>
    );
}
