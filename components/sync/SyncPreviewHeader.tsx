import React from 'react';
import { Cloud, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { MONTH_NAMES } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface SyncPreviewHeaderProps {
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onClose: () => void;
    className?: string;
}

export const SyncPreviewHeader: React.FC<SyncPreviewHeaderProps> = ({
    currentDate,
    onPrevMonth,
    onNextMonth,
    onClose,
    className
}) => {
    return (
        <div className={cn("p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-gray-900/50 transition-colors", className)}>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-500/20 rounded-2xl border border-cyan-200 dark:border-cyan-500/30 transition-colors">
                    <Cloud className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        Prévisualisation Web
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <button onClick={onPrevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        </button>
                        <span className="text-sm font-bold text-slate-600 dark:text-gray-300 min-w-[140px] text-center uppercase tracking-widest">
                            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={onNextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <ChevronRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        </button>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="w-6 h-6" />
            </button>
        </div>
    );
};
