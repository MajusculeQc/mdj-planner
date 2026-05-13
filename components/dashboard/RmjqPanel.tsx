import React from 'react';
import { Target, ListFilter } from 'lucide-react';
import { RMJQ_TARGETS } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { Activity } from '../../types';
import { Card } from '../ui/Card';

interface RmjqPanelProps {
    rmjqProgress: Record<string, number>;
    selectedRmjqCategory: string | null;
    setSelectedRmjqCategory: (cat: string | null) => void;
    filteredRmjqActivities: Activity[];
    onSelectActivity: (act: Activity) => void;
}

export const RmjqPanel: React.FC<RmjqPanelProps> = ({
    rmjqProgress,
    selectedRmjqCategory,
    setSelectedRmjqCategory,
    filteredRmjqActivities,
    onSelectActivity,
}) => {
    return (
        <div className="space-y-4">
            {/* RMJQ Targets Grid */}
            <Card>
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" /> Cibles de la MDJ
                </h3>
                <div className="space-y-5">
                    {RMJQ_TARGETS.map((target, idx) => {
                        const current = rmjqProgress[target.type] ?? 0;
                        const percent = Math.min((current / target.target) * 100, 100);
                        const isReached = current >= target.target;
                        const isSelected = selectedRmjqCategory === target.type;

                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedRmjqCategory(isSelected ? null : target.type)}
                                className={cn(
                                    'group cursor-pointer p-2 -m-2 rounded-xl transition-all',
                                    isSelected ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
                                )}
                            >
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className={cn(
                                        'text-[10px] font-bold uppercase tracking-wide transition-colors',
                                        isSelected ? 'text-cyan-300' : 'text-gray-400 group-hover:text-white'
                                    )}>
                                        {target.label}
                                    </span>
                                    {isReached ? (
                                        <span className="bg-green-500/20 text-green-400 text-[9px] px-1.5 py-0.5 rounded border border-green-500/30 font-bold">✓ Atteint</span>
                                    ) : (
                                        <span className="text-[9px] text-gray-600 font-mono">{current}/{target.target}</span>
                                    )}
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden border border-slate-200 dark:border-white/5 transition-all">
                                    <div
                                        className={cn(
                                            'h-full transition-all duration-1000 ease-out rounded-full',
                                            isReached ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-cyan-500 dark:bg-cyan-500'
                                        )}
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Filtered RMJQ Activities (Conditionally rendered inside the panel logic) */}
            {selectedRmjqCategory && (
                <div className="bg-gray-800/40 rounded-3xl p-6 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <ListFilter className="w-5 h-5 text-cyan-400" />
                            Activités : {RMJQ_TARGETS.find(t => t.type === selectedRmjqCategory)?.label}
                        </h3>
                        <button onClick={() => setSelectedRmjqCategory(null)} className="text-[10px] text-gray-500 hover:text-white">Fermer</button>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {filteredRmjqActivities.length > 0 ? filteredRmjqActivities.map(act => (
                            <div
                                key={act.id}
                                onClick={() => onSelectActivity(act)}
                                className="cursor-pointer p-2 bg-gray-900/50 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all"
                            >
                                <div className="text-xs font-bold text-white">{act.title}</div>
                                <div className="text-[10px] text-gray-500">{act.date}</div>
                            </div>
                        )) : (
                            <p className="text-xs text-gray-500 italic text-center py-4">Aucune activité trouvée pour cette catégorie ce mois-ci.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
