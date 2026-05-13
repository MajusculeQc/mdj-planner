import React from 'react';
import { Filter, X, User, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { STAFF_LIST } from '../../lib/constants';
import { ActivityType } from '../../types';
import { cn } from '../../lib/utils';

export interface FilterState {
    staff: string | null;
    type: string | null;
    status: 'all' | 'ready' | 'incomplete';
}

interface DashboardFiltersProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ filters, onFilterChange }) => {
    const hasActiveFilters = filters.staff !== null || filters.type !== null || filters.status !== 'all';

    const clearFilters = () => {
        onFilterChange({
            staff: null,
            type: null,
            status: 'all'
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-2 transition-all animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-muted ml-4 mr-2">
                <Filter className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Filtrer</span>
            </div>

            {/* Staff Filter */}
            <div className="flex items-center gap-2 bg-surface border border-subtle rounded-2xl px-4 py-2 hover:bg-base transition-colors group">
                <User className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <select
                    value={filters.staff || ""}
                    onChange={(e) => onFilterChange({ ...filters, staff: e.target.value || null })}
                    className="bg-transparent text-[11px] font-bold text-primary outline-none cursor-pointer min-w-[140px]"
                >
                    <option value="" className="bg-surface text-primary">Tous les intervenants</option>
                    {STAFF_LIST.map(staff => (
                        <option key={staff} value={staff} className="bg-surface text-primary">{staff}</option>
                    ))}
                </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 bg-surface border border-subtle rounded-2xl px-4 py-2 hover:bg-base transition-colors group">
                <Tag className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <select
                    value={filters.type || ""}
                    onChange={(e) => onFilterChange({ ...filters, type: e.target.value || null })}
                    className="bg-transparent text-[11px] font-bold text-primary outline-none cursor-pointer min-w-[120px]"
                >
                    <option value="" className="bg-surface text-primary">Tous les types</option>
                    {Object.entries(ActivityType).map(([key, label]) => (
                        <option key={key} value={label} className="bg-surface text-primary">{label}</option>
                    ))}
                </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-surface border border-subtle rounded-2xl p-1 ml-auto sm:ml-0">
                <button
                    onClick={() => onFilterChange({ ...filters, status: 'all' })}
                    className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        filters.status === 'all' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-muted hover:text-primary"
                    )}
                >
                    Tous
                </button>
                <button
                    onClick={() => onFilterChange({ ...filters, status: 'ready' })}
                    className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        filters.status === 'ready' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-muted hover:text-emerald-500"
                    )}
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Prêts
                </button>
                <button
                    onClick={() => onFilterChange({ ...filters, status: 'incomplete' })}
                    className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        filters.status === 'incomplete' ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "text-muted hover:text-rose-500"
                    )}
                >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Incomplets
                </button>
            </div>

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-rose-400 ml-auto transition-colors px-4"
                >
                    <X className="w-4 h-4" />
                    Effacer
                </button>
            )}
        </div>
    );
};
