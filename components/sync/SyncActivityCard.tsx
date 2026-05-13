import React from 'react';
import { cn } from '../../lib/utils';

interface SyncActivityCardProps {
    activity: {
        image: string;
        title: string;
        date: string;
        time: string;
        description: string;
        type: string;
    };
    className?: string;
}

export const SyncActivityCard: React.FC<SyncActivityCardProps> = ({ activity, className }) => {
    return (
        <div className={cn("bg-white dark:bg-gray-800/40 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all group shadow-sm dark:shadow-none", className)}>
            <div className="aspect-video relative overflow-hidden bg-slate-200 dark:bg-black">
                <img src={activity.image} alt={activity.title} className="w-full h-full object-cover opacity-90 dark:opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2">
                    <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-sm",
                        activity.type === 'Gratuit'
                            ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30"
                            : "bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                    )}>
                        {activity.type}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">{activity.title}</h3>
                <div className="flex items-center gap-3 text-xs text-cyan-600 dark:text-cyan-400 mb-3 font-mono font-bold">
                    <span>{activity.date}</span>
                    <span className="opacity-30">•</span>
                    <span>{activity.time}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-3 italic">
                    {activity.description}
                </p>
            </div>
        </div>
    );
};
