import React from 'react';

export const CalendarLegend: React.FC = () => {
    return (
        <div className="flex items-center justify-between gap-3 px-2 mb-3">
            {/* School Legend */}
            <div className="flex items-center gap-5">
                {[
                    { color: '#a855f7', label: 'Pédag.' },
                    { color: '#f43f5e', label: 'Férié' },
                    { color: '#2dd4bf', label: 'Relâche' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-5">
                {[
                    { color: '#f97316', label: 'À faire' },
                    { color: '#fbbf24', label: 'En cours' },
                    { color: '#34d399', label: 'Prêt' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
