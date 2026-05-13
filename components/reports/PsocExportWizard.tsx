import React, { useState, useEffect, useMemo } from 'react';
import { Download, FileLineChart, X, Users, HeartHandshake, TrendingUp, Globe2, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Activity, FinancialHealth } from '../../types';
import { useFinancialHealth } from '../../hooks/useFinancialHealth';
import { Modal } from '../ui/Modal';
import { ExportService } from '../../services/exportService';

interface PsocExportWizardProps {
    activities: Activity[];
    onClose: () => void;
}

export const PsocExportWizard: React.FC<PsocExportWizardProps> = ({ activities, onClose }) => {
    const today = new Date();
    const currentFiscalYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const [selectedYear, setSelectedYear] = useState<number>(currentFiscalYear);
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    const { financialData } = useFinancialHealth(selectedYear);

    useEffect(() => {
        console.log("PsocExportWizard mounted for fiscal year:", selectedYear);
    }, [selectedYear]);

    // Filter activities for the selected fiscal year (April 1st to March 31st)
    const filteredActivities = useMemo(() => {
        const start = `${selectedYear}-04-01`;
        const end = `${selectedYear + 1}-03-31`;
        return activities.filter(a => a.date >= start && a.date <= end);
    }, [activities, selectedYear]);

    // --- Statistics Consolidation ---
    const stats = useMemo(() => {
        const initial = {
            totalActivities: filteredActivities.length,
            totalVisits: 0,
            presentMale: 0,
            presentFemale: 0,
            presentNonBinary: 0,
            newMembers: 0,
            totalVolunteerHours: 0,
            totalYouthVolunteerHours: 0,
            socialMediaReach: 0,
            uniqueParticipants: new Set<string>(),
            types: {} as Record<string, number>,
            mediaMentions: [] as string[]
        };

        filteredActivities.forEach(act => {
            const m = act.stats?.presentMale || 0;
            const f = act.stats?.presentFemale || 0;
            const nb = act.stats?.presentNonBinary || 0;

            initial.presentMale += m;
            initial.presentFemale += f;
            initial.presentNonBinary += nb;
            initial.totalVisits += (m + f + nb);
            initial.newMembers += act.stats?.newMembers || 0;

            initial.totalVolunteerHours += act.communityIndicators?.volunteerHours || 0;
            initial.totalYouthVolunteerHours += act.communityIndicators?.youthVolunteerHours || 0;
            initial.socialMediaReach += act.communityIndicators?.socialMediaEngagement || 0;

            if (act.types && act.types.length > 0) {
                act.types.forEach(t => {
                    initial.types[t] = (initial.types[t] || 0) + 1;
                });
            } else if (act.type) {
                initial.types[act.type] = (initial.types[act.type] || 0) + 1;
            }

            if (act.communityIndicators?.mediaInterviews) {
                initial.mediaMentions.push(act.communityIndicators.mediaInterviews);
            }

            act.stats?.participantsList?.forEach(p => initial.uniqueParticipants.add(p));
        });

        return initial;
    }, [filteredActivities]);

    const handleExport = () => {
        setIsExporting(true);
        try {
            // Enhanced CSV export with all indicators
            const headers = [
                'Indicateur',
                'Valeur',
                'Description'
            ];

            const rows = [
                ['Année Financière', `${selectedYear}-${selectedYear + 1}`, 'Période de rapport'],
                ['Nombre d\'activités', stats.totalActivities, 'Total des séances tenues'],
                ['Total des visites', stats.totalVisits, 'Achalandage brut'],
                ['Garçons (Visites)', stats.presentMale, ''],
                ['Filles (Visites)', stats.presentFemale, ''],
                ['Non-Binaires (Visites)', stats.presentNonBinary, ''],
                ['Nouveaux Membres', stats.newMembers, 'Jeunes inscrits durant l\'année'],
                ['Membres Uniques (Estimé)', stats.uniqueParticipants.size, 'Basé sur le registre nominatif'],
                ['Heures Bénévolat (Adultes)', stats.totalVolunteerHours, ''],
                ['Heures Bénévolat (Jeunes)', stats.totalYouthVolunteerHours, ''],
                ['Engagement Réseaux Sociaux', stats.socialMediaReach, 'Reach cumulatif'],
                ['Revenus PSOC', financialData?.psocRevenue || 0, 'Subvention mission globale'],
                ['Dépenses Totales', financialData?.totalExpenses || 0, 'Budget annuel consommé'],
                ['Ratio Surplus/Dépenses', financialData && financialData.totalExpenses > 0 ? ((financialData.accumulatedSurplus / financialData.totalExpenses) * 100).toFixed(2) + '%' : '0%', 'Règle du 25%']
            ];

            const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `rapport_psoc_${selectedYear}.csv`);
            link.click();

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            title="Assistant d'Exportation PSOC"
            icon={<FileLineChart className="w-6 h-6" />}
            maxWidth="5xl"
            className="bg-slate-50 dark:bg-gray-900"
        >
            <div className="flex flex-col">

                {/* Selection & Quick Stats */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
                        <div className="space-y-1 text-center md:text-left">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Période fiscale</label>
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="bg-slate-100 dark:bg-gray-900 border-none text-lg font-black rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {[0, 1, 2, 3].map(i => {
                                        const y = currentFiscalYear - i;
                                        return <option key={y} value={y}>{y} - {y + 1}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center px-4 border-r border-slate-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Activités</p>
                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.totalActivities}</p>
                            </div>
                            <div className="text-center px-4 border-r border-slate-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Visites</p>
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.totalVisits}</p>
                            </div>
                            <div className="text-center px-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Jeunes Uniques</p>
                                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.uniqueParticipants.size}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Participation Breakdown */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
                            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Participation (Genre)
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-500">Gars</span>
                                    <span className="font-bold">{stats.presentMale}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-500">Filles</span>
                                    <span className="font-bold">{stats.presentFemale}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-500">Non-binaires</span>
                                    <span className="font-bold">{stats.presentNonBinary}</span>
                                </div>
                            </div>
                        </div>

                        {/* Community Outreach */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
                            <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
                                <Globe2 className="w-4 h-4" /> Rayonnement
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-500">Bénévolat (h)</span>
                                    <span className="font-bold">{stats.totalVolunteerHours + stats.totalYouthVolunteerHours}h</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-500">Reach Social</span>
                                    <span className="font-bold">{stats.socialMediaReach}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-slate-500">Médias (Mentions)</span>
                                    <span className="font-bold">{stats.mediaMentions.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
                            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Santé Financière
                            </h4>
                            {financialData ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-slate-500">Revenus PSOC</span>
                                        <span className="font-bold">${financialData.psocRevenue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-slate-500">Ratio Surplus</span>
                                        <span className={financialData.accumulatedSurplus / financialData.totalExpenses > 0.25 ? "text-red-500 font-black" : "font-bold"}>
                                            {((financialData.accumulatedSurplus / (financialData.totalExpenses || 1)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-slate-500">Nouveaux Jeunes</span>
                                        <span className="font-bold">{stats.newMembers}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic py-4">Aucune donnée financière saisie pour cette année.</p>
                            )}
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 text-amber-800 dark:text-amber-300">
                        <h5 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <HeartHandshake className="w-4 h-4" /> RappelPSOC
                        </h5>
                        <p className="text-xs leading-relaxed font-medium">
                            Le rapport annuel doit être déposé via le portail du MSSS. Assurez-vous que les données saisies dans les journaux de bord correspondent aux factures et au rapport d'impôt (T3010) avant l'exportation finale.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center shrink-0">
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <div className="flex gap-3">
                        {exportSuccess && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-in fade-in slide-in-from-right-4">
                                <CheckCircle className="w-4 h-4" /> Rapport généré !
                            </span>
                        )}
                        <Button
                            onClick={handleExport}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8"
                            disabled={isExporting || stats.totalActivities === 0}
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                            Exporter en CSV (Reddition)
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
