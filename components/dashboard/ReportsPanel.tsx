import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FileDown, Users, TrendingUp, PieChart as PieIcon, X, Calendar, UserPlus, Target } from 'lucide-react';
import { Activity } from '../../types';
import { ExportService } from '../../services/exportService';
import { Card } from '../ui/Card';
import { cn, isAbsence } from '../../lib/utils';
import { MONTH_NAMES } from '../../lib/constants';
import { Modal } from '../ui/Modal';
import { TrendAnalyzer } from './TrendAnalyzer';
import { FirebaseService } from '../../services/firebaseService';

interface ReportsPanelProps {
    activities: Activity[];
    userEmail?: string;
    onClose: () => void;
}

const COLORS = ['#06b6d4', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ activities, userEmail, onClose }) => {
    // ═══════════════════════════════════════════════════════════════════════════
    // DATA PROCESSING
    // ═══════════════════════════════════════════════════════════════════════════

    const chartsData = useMemo(() => {
        // 1. Monthly Trends
        const monthlyMap: Record<string, { month: string, gars: number, filles: number, nb: number, total: number }> = {};

        const sortedActivities = [...activities].sort((a, b) => {
            if (!a.date || !b.date) return 0; // Handle cases where date might be missing
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        sortedActivities.forEach(act => {
            if (act.isPostponed || !act.date || isAbsence(act.title)) return;
            const date = new Date(act.date);
            if (isNaN(date.getTime())) return;
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = `${MONTH_NAMES[date.getMonth()] || 'Inconnu'} ${date.getFullYear()}`;

            if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = { month: monthLabel, gars: 0, filles: 0, nb: 0, total: 0 };
            }

            if (act.stats) { // Safety check for act.stats
                monthlyMap[monthKey].gars += act.stats.presentMale || 0;
                monthlyMap[monthKey].filles += act.stats.presentFemale || 0;
                monthlyMap[monthKey].nb += act.stats.presentNonBinary || 0;
                monthlyMap[monthKey].total += (act.stats.presentMale || 0) + (act.stats.presentFemale || 0) + (act.stats.presentNonBinary || 0);
            }
        });

        const trendData = Object.entries(monthlyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([_, data]) => data);

        const dimensionMap: Record<string, number> = {};
        activities.forEach(act => {
            if (act.isPostponed || isAbsence(act.title)) return;
            const dims = new Set<string>();
            act.rmjqDimensions?.forEach(dim => dims.add(dim));
            dims.forEach(dim => {
                dimensionMap[dim] = (dimensionMap[dim] || 0) + 1;
            });
        });

        const pieData = Object.entries(dimensionMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // 3. Overall Stats
        const validActivities = activities.filter(a => !a.isPostponed && !isAbsence(a.title));
        const totalVisits = validActivities.reduce((sum, act) => sum + (act.stats?.presentMale || 0) + (act.stats?.presentFemale || 0) + (act.stats?.presentNonBinary || 0), 0);
        const totalNew = validActivities.reduce((sum, act) => sum + (act.stats?.newMembers || 0), 0);
        const activeActivitiesCount = validActivities.length;
        const avgAttendance = activeActivitiesCount > 0 ? (totalVisits / activeActivitiesCount).toFixed(1) : "0";

        // 4. Community Indicators aggregation
        const communityStats = {
            totalVolunteerHours: validActivities.reduce((sum, act) => sum + (act.communityIndicators?.volunteerHours || 0), 0),
            totalYouthVolunteerHours: validActivities.reduce((sum, act) => sum + (act.communityIndicators?.youthVolunteerHours || 0), 0),
            totalPartnerships: validActivities.filter(act => act.communityIndicators?.partnerships).length,
            totalSocialReach: validActivities.reduce((sum, act) => sum + (act.communityIndicators?.socialMediaEngagement || 0), 0),
            totalFunding: validActivities.reduce((sum, act) => sum + (act.communityIndicators?.fundingAmount || 0), 0),
        };

        // 5. Advanced Annual Metrics (7-Module Specification)
        const uniqueMembers = new Set<string>();
        validActivities.forEach(act => {
            act.stats?.participantsList?.forEach(name => {
                // Remove (Code) or (Visiteur) suffix for better unique counting
                const cleanedName = name.replace(/\s*\(.*?\)\s*/g, '').trim();
                if (cleanedName) uniqueMembers.add(cleanedName);
            });
        });

        const openingDays = new Set(validActivities.map(a => a.date)).size;

        const animationBreakdown = {
            interne: validActivities.filter(a => a.staffing?.animationType === 'Interne' || !a.staffing?.animationType).length,
            partenaire: validActivities.filter(a => a.staffing?.animationType === 'Partenaire').length,
            mixte: validActivities.filter(a => a.staffing?.animationType === 'Mixte').length,
        };

        return { trendData, pieData, totalVisits, totalNew, avgAttendance, communityStats, uniqueMembersCount: uniqueMembers.size, openingDays, animationBreakdown };
    }, [activities]);

    return (
        <Modal
            onClose={onClose}
            title="Analyses & Rapports"
            icon={<TrendingUp className="w-6 h-6" />}
            maxWidth="full"
        >
            <div className="flex flex-col bg-base overflow-y-auto">
                <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl border-b border-subtle px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <p className="text-xs text-muted font-bold uppercase tracking-widest leading-none">MDJ L'Escale Jeunesse - Tableau de Bord Annuel</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {userEmail && (userEmail.startsWith('gestion@') || userEmail.startsWith('dg@')) && (
                            <button
                                onClick={async () => {
                                    if (confirm("Voulez-vous analyser et corriger automatiquement les types d'activités et dimensions pour toutes les activités ? (Ex: Pickleball -> Activité Physique)")) {
                                        const count = await FirebaseService.batchUpdateRMJQDimensions();
                                        alert(`${count} activités ont été mises à jour.`);
                                        window.location.reload();
                                    }
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shadow-sm active:scale-95"
                            >
                                <Target className="w-4 h-4" />
                                Audit Intelligent
                            </button>
                        )}
                        <button
                            onClick={() => ExportService.downloadFullAnnualCSV(activities)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg active:scale-95"
                        >
                            <FileDown className="w-4 h-4" />
                            Rapport Annuel Complet (Excel)
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto p-8 space-y-8 pb-20">
                    {/* KPI BOXES */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="p-6 border-l-4 border-l-indigo-500 bg-white dark:bg-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Visites</p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">{chartsData.totalVisits}</h3>
                                </div>
                                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-l-4 border-l-emerald-500 bg-white dark:bg-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nouveaux Jeunes</p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">{chartsData.totalNew}</h3>
                                </div>
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-l-4 border-l-amber-500 bg-white dark:bg-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Moyenne / Activité</p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">{chartsData.avgAttendance}</h3>
                                </div>
                                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-l-4 border-l-cyan-500 bg-white dark:bg-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Membres Uniques</p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">{chartsData.uniqueMembersCount}</h3>
                                </div>
                                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-500">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-2 italic font-bold">Pénétration réelle (individus différents)</p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-500/20">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-80">Jours d'ouverture</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black leading-none">{chartsData.openingDays}</span>
                                <span className="text-xs font-bold mb-1 opacity-80">jours d'opération</span>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-4">Type d'Animation</h4>
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span>Interne: <span className="text-indigo-500">{chartsData.animationBreakdown.interne}</span></span>
                                <span>Partenaire: <span className="text-amber-500">{chartsData.animationBreakdown.partenaire}</span></span>
                                <span>Mixte: <span className="text-emerald-500">{chartsData.animationBreakdown.mixte}</span></span>
                            </div>
                        </Card>

                        <Card className="p-6 bg-emerald-600 text-white rounded-3xl shadow-xl shadow-emerald-500/20">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-80">Total Financement</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black leading-none">{chartsData.communityStats.totalFunding.toLocaleString('fr-CA')} $</span>
                                <span className="text-xs font-bold mb-1 opacity-80">amassés</span>
                            </div>
                        </Card>
                    </div>

                    {/* COMMUNITY STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bénévolat Adultes</p>
                            <p className="text-xl font-black text-indigo-500">{chartsData.communityStats.totalVolunteerHours}h</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bénévolat Jeunes</p>
                            <p className="text-xl font-black text-emerald-500">{chartsData.communityStats.totalYouthVolunteerHours}h</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Partenariats Actifs</p>
                            <p className="text-xl font-black text-amber-500">{chartsData.communityStats.totalPartnerships}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Portée Sociale</p>
                            <p className="text-xl font-black text-cyan-500">{chartsData.communityStats.totalSocialReach}</p>
                        </div>
                    </div>

                    {/* AI TREND ANALYZER */}
                    <TrendAnalyzer activities={activities} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* TREND CHART */}
                        <Card className="lg:col-span-2 p-8 bg-white dark:bg-white/5 min-h-[450px]">
                            <div className="flex items-center gap-2 mb-8">
                                <TrendingUp className="w-5 h-5 text-indigo-500" />
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Évolution de la Fréquentation</h4>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartsData.trendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888844" />
                                        <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#888888' }} />
                                        <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#888888' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1d23', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px' }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                                        <Bar dataKey="gars" name="Garçons" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="filles" name="Filles" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="nb" name="Non-binaire" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* PIE CHART */}
                        <Card className="p-8 bg-white dark:bg-white/5 min-h-[450px]">
                            <div className="flex items-center gap-2 mb-8">
                                <PieIcon className="w-5 h-5 text-cyan-500" />
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Répartition RMJQ</h4>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartsData.pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartsData.pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1d23', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-4 max-h-[100px] overflow-y-auto pr-2">
                                {chartsData.pieData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center justify-between text-[10px] font-bold">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-slate-500 dark:text-gray-400 capitalize">{entry.name}</span>
                                        </div>
                                        <span className="text-slate-900 dark:text-white">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
