import React from 'react';
import { DollarSign, TrendingUp, Users, UserPlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';

interface QuickStatsProps {
    totalBudget: number;
    daysToFinalize: number;
    totalAttendance: number;
    totalNewMembers: number;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ totalBudget, daysToFinalize, totalAttendance, totalNewMembers }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="group hover:border-cyan-500/30">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
                </div>
                <div className="relative">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-1">
                        Budget Mensuel
                    </span>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                        {totalBudget}
                        <span className="text-cyan-600 dark:text-cyan-400 ml-1">$</span>
                    </div>
                    <div className="absolute -left-4 bottom-0 w-1 h-2/3 bg-cyan-500 rounded-full"></div>
                </div>
            </Card>

            <Card className="group hover:border-purple-500/30">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                </div>
                <div className="relative">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-1">
                        Échéances
                    </span>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                        {daysToFinalize}
                        <span className="text-purple-600 dark:text-purple-400 ml-1">jrs</span>
                    </div>
                    <div className="absolute -left-4 bottom-0 w-1 h-2/3 bg-purple-500 rounded-full"></div>
                </div>
            </Card>

            <Card className="group hover:border-indigo-500/30">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="relative">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-1">
                        Présences
                    </span>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                        {totalAttendance}
                        <span className="text-indigo-600 dark:text-indigo-400 ml-1">visites</span>
                    </div>
                    <div className="absolute -left-4 bottom-0 w-1 h-2/3 bg-indigo-500 rounded-full"></div>
                </div>
            </Card>

            <Card className="group hover:border-emerald-500/30">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <UserPlus className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="relative">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-1">
                        Nouveaux
                    </span>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                        {totalNewMembers}
                        <span className="text-emerald-600 dark:text-emerald-400 ml-1">jeunes</span>
                    </div>
                    <div className="absolute -left-4 bottom-0 w-1 h-2/3 bg-emerald-500 rounded-full"></div>
                </div>
            </Card>
        </div>
    );
};
