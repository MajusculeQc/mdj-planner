import React from 'react';
import { PieChart } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getBudgetColor, getBudgetIcon } from '../../lib/ui-utils';
import { Card } from '../ui/Card';

interface BudgetItem {
    date: string;
    activityName: string;
    description: string;
    amount: number;
    category: string;
    activityId: string;
}

interface BudgetPanelProps {
    detailedBudget: BudgetItem[];
    onSelectActivity: (activityId: string, tab: string) => void;
}

export const BudgetPanel: React.FC<BudgetPanelProps> = ({ detailedBudget, onSelectActivity }) => {
    return (
        <Card>
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" /> Détail du Budget
            </h3>
            <div className="space-y-2">
                {detailedBudget.length > 0 ? detailedBudget.map((exp, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col gap-1 p-2 border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer active:scale-[0.98] shadow-sm dark:shadow-none"
                        onClick={() => onSelectActivity(exp.activityId, 'budget')}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">{exp.date}</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{exp.amount.toFixed(2)}$</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-xs text-cyan-600 dark:text-cyan-300 font-medium truncate flex-1">{exp.activityName}</span>
                            <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px]', getBudgetColor(exp.category))}>
                                {getBudgetIcon(exp.category)}
                                <span className="truncate max-w-[80px]">{exp.description}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-xs text-slate-400 dark:text-gray-500 italic text-center py-4">
                        Aucune dépense prévue ce mois-ci.
                    </p>
                )}
            </div>
        </Card>
    );
};
