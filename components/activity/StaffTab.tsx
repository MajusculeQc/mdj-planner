import React from 'react';
import { Users, User, ShieldAlert, BadgeCheck, AlertCircle, Trash2, ArrowRightLeft, Loader2, Award } from 'lucide-react';
import { Activity, Staffing } from '../../types';
import { cn } from '../../lib/utils';
import { TEAM_DIRECTORY, STAFF_LIST, SUPPORT_STAFF_EXTRAS, SUGGESTIONS, SAFETY_RATIO_GUIDELINES } from '../../lib/constants';
import { ConflictStatus } from '../../lib/staffConflict';
import { useCustomSuggestions } from '../../hooks/useCustomSuggestions';

interface StaffTabProps {
    activity: Activity;
    updateStaffing: (updates: Partial<Staffing>) => void;
    availableLeadStaff: string[];
    availableSupportStaff: string[];
    checkStaffConflict: (staffName: string, targetActivityId: string, targetDate: string, allActivities: Activity[]) => ConflictStatus;
    getConflictingActivities: (staffName: string, targetActivityId: string, targetDate: string, allActivities: Activity[]) => Activity[];
    allActivities: Activity[];
    showTransfer: boolean;
    setShowTransfer: (show: boolean) => void;
    handleTransferResponsibility: (newLeadEmail: string) => Promise<void>;
    isTransferring: boolean;
}

const StaffTab: React.FC<StaffTabProps> = ({
    activity,
    updateStaffing,
    availableLeadStaff,
    availableSupportStaff,
    checkStaffConflict,
    getConflictingActivities,
    allActivities,
    showTransfer,
    setShowTransfer,
    handleTransferResponsibility,
    isTransferring
}) => {
    const { staffing } = activity;
    const { customSuggestions } = useCustomSuggestions();

    const qualificationSuggestions = Array.from(new Set([
        ...SUGGESTIONS.qualifications,
        ...(customSuggestions.qualifications || [])
    ])).filter(q => q && !(staffing.specialQualifications || '').toLowerCase().includes(q.toLowerCase())).sort();

    const handleToggleSupportStaff = (staff: string) => {
        const current = staffing.supportStaff || [];
        if (current.includes(staff)) {
            updateStaffing({ supportStaff: current.filter(s => s !== staff) });
        } else {
            updateStaffing({ supportStaff: [...current, staff] });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* LEAD STAFF SECTION */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md",
                (!staffing.leadStaff && !activity.isMDJClosed)
                    ? "border-red-500/50 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    : "border-slate-100 dark:border-white/10 shadow-sm"
            )}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Responsable de l'activité</h3>
                                {!staffing.leadStaff && !activity.isMDJClosed && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Intervenant principal en charge</p>
                        </div>
                    </div>
                    {staffing.leadStaff && !showTransfer && (
                        <button
                            onClick={() => setShowTransfer(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all uppercase tracking-widest"
                        >
                            <ArrowRightLeft className="w-3 h-3" /> Transférer
                        </button>
                    )}
                </div>

                {showTransfer ? (
                    <div className="p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl animate-in zoom-in-95 duration-200">
                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> Sélectionner le nouveau responsable
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {availableLeadStaff.filter(s => s !== staffing.leadStaff).map(staff => (
                                <button
                                    key={staff}
                                    onClick={() => handleTransferResponsibility(TEAM_DIRECTORY[staff])}
                                    disabled={isTransferring}
                                    className="px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-500/20 text-slate-700 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all disabled:opacity-50"
                                >
                                    {isTransferring ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : staff}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowTransfer(false)}
                            className="mt-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 uppercase underline"
                        >
                            Annuler le transfert
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                        {STAFF_LIST.map(staff => {
                            const isSelected = staffing.leadStaff === staff;
                            const status = !isSelected ? checkStaffConflict(staff, activity.id, activity.date, allActivities) : 'CLEAN';
                            const hasConflict = status === 'MULTI_BLOCK';
                            const conflicts = hasConflict ? getConflictingActivities(staff, activity.id, activity.date, allActivities) : [];

                            return (
                                <div key={staff} className="relative group">
                                    <button
                                        onClick={() => updateStaffing({ leadStaff: staff })}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border text-center flex flex-col items-center gap-1 min-h-[50px] justify-center",
                                            isSelected
                                                ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.3)] scale-[1.02]"
                                                : hasConflict
                                                    ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-500"
                                                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10"
                                        )}
                                    >
                                        {staff}
                                        {isSelected && <BadgeCheck className="w-3 h-3" />}
                                        {hasConflict && <AlertCircle className="w-3 h-3 animate-pulse" />}
                                    </button>

                                    {hasConflict && conflicts.length > 0 && (
                                        <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-red-600 text-white text-[9px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <p className="font-bold mb-1">DÉJÀ OCCUPÉ(E) :</p>
                                            {conflicts.map((c, i) => (
                                                <p key={i}>• {c.title} ({c.startTime}-{c.endTime})</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* SUPPORT STAFF SECTION */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md",
                ((staffing.supportStaff || []).length === 0 && !activity.isMDJClosed)
                    ? "border-red-500/50 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    : "border-slate-100 dark:border-white/10 shadow-sm"
            )}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Équipe de soutien</h3>
                            {(staffing.supportStaff || []).length === 0 && !activity.isMDJClosed && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Intervenants en support</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                        {[...STAFF_LIST, ...SUPPORT_STAFF_EXTRAS]
                            .filter(s => s !== staffing.leadStaff)
                            .map(staff => {
                                const isSelected = (staffing.supportStaff || []).includes(staff);
                                const status = !isSelected ? checkStaffConflict(staff, activity.id, activity.date, allActivities) : 'CLEAN';
                                const hasConflict = status === 'MULTI_BLOCK';

                                return (
                                    <button
                                        key={staff}
                                        onClick={() => handleToggleSupportStaff(staff)}
                                        className={cn(
                                            "px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border text-center flex items-center justify-center gap-2 min-h-[50px]",
                                            isSelected
                                                ? "bg-cyan-600 text-white border-cyan-400 shadow-[0_0_20px_rgba(8,145,178,0.3)] scale-[1.02]"
                                                : hasConflict
                                                    ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/10 text-red-400"
                                                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-500 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10"
                                        )}
                                    >
                                        {staff}
                                        {isSelected && <BadgeCheck className="w-3 h-3" />}
                                    </button>
                                );
                            })}
                    </div>

                    <div className={cn(
                        "pt-6 border-t border-slate-100 dark:border-white/5 p-4 rounded-2xl transition-all",
                        (!staffing.requiredRatio && !activity.isMDJClosed) ? "bg-red-500/[0.03] border-red-500/30 border-2 border-dashed animate-pulse-slow" : ""
                    )}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                                    <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Ratio d'encadrement requis</label>
                                    {!staffing.requiredRatio && !activity.isMDJClosed && <span className="px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['1/6', '1/8', '1/12', '1/15', 'Min. 2 staff', 'Libre'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => updateStaffing({ requiredRatio: r })}
                                            className={cn(
                                                "px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border whitespace-nowrap min-w-[32px] flex items-center justify-center",
                                                staffing.requiredRatio === r
                                                    ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                                                    : "bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
                                            )}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={staffing.requiredRatio === 'Libre' ? '' : staffing.requiredRatio}
                                    onChange={(e) => updateStaffing({ requiredRatio: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Saisir un autre ratio (ex: 2/25)..."
                                />

                                {/* Safety Guidelines Info Box */}
                                <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShieldAlert className="w-4 h-4 text-indigo-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Rappel des normes de sécurité</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-3 group/item">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover/item:bg-indigo-400 transition-colors" />
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300">Animation régulière:</span>
                                                <span className="text-[11px] font-black text-slate-900 dark:text-white ml-auto">1:12</span>
                                            </div>
                                            <div className="flex items-center gap-3 group/item">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover/item:bg-indigo-400 transition-colors" />
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300">Sorties extérieures:</span>
                                                <span className="text-[11px] font-black text-slate-900 dark:text-white ml-auto">1:8</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-3 group/item">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover/item:bg-indigo-400 transition-colors" />
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300">Activités haut risque:</span>
                                                <span className="text-[11px] font-black text-slate-900 dark:text-white ml-auto">1:6</span>
                                            </div>
                                            <div className="flex items-center gap-3 group/item">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover/item:bg-indigo-400 transition-colors" />
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300">Règle d'or:</span>
                                                <span className="text-[11px] font-black text-slate-900 dark:text-white ml-auto">Min. 2 staff</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Award className="w-3.5 h-3.5 text-cyan-500" />
                                    <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Qualifications spécifiques requises</label>
                                </div>

                                <div className="space-y-3">
                                    <select
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) {
                                                const current = staffing.specialQualifications;
                                                const newValue = current
                                                    ? current.includes(val) ? current : `${current}, ${val}`
                                                    : val;
                                                updateStaffing({ specialQualifications: newValue });
                                                e.target.value = "";
                                            }
                                        }}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                                    >
                                        <option value="" className="text-slate-900">Choisir une qualification...</option>
                                        {qualificationSuggestions.map(q => (
                                            <option key={q} value={q} className="text-slate-900">{q}</option>
                                        ))}
                                    </select>

                                    <textarea
                                        value={staffing.specialQualifications}
                                        onChange={(e) => updateStaffing({ specialQualifications: e.target.value })}
                                        rows={2}
                                        className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none shadow-inner"
                                        placeholder="ex: Secourisme CNESST, SIMDUT, MAPAQ..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default StaffTab;
