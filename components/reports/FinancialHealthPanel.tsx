import React, { useState, useEffect } from 'react';
import { useFinancialHealth } from '../../hooks/useFinancialHealth';
import { DollarSign, AlertTriangle, TrendingUp, Target, Save, CheckCircle, Percent } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../hooks/useAuth';

interface FinancialHealthPanelProps {
    userEmail?: string;
    onClose: () => void;
}

export const FinancialHealthPanel: React.FC<FinancialHealthPanelProps> = ({ userEmail, onClose }) => {
    // Determine current fiscal year (April 1st to March 31st for Quebec NPOs)
    const today = new Date();
    const currentFiscalYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

    const [selectedYear, setSelectedYear] = useState<number>(currentFiscalYear);
    const { financialData, isLoading, saveFinancialData } = useFinancialHealth(selectedYear);
    const [formData, setFormData] = useState({
        psocRevenue: 0,
        otherGrantsRevenue: 0,
        autonomousRevenue: 0,
        totalExpenses: 0,
        accumulatedSurplus: 0
    });
    const [isEditing, setIsEditing] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        console.log("FinancialHealthPanel mounted for year:", selectedYear);
    }, [selectedYear]);

    useEffect(() => {
        if (financialData) {
            setFormData({
                psocRevenue: financialData.psocRevenue,
                otherGrantsRevenue: financialData.otherGrantsRevenue,
                autonomousRevenue: financialData.autonomousRevenue,
                totalExpenses: financialData.totalExpenses,
                accumulatedSurplus: financialData.accumulatedSurplus
            });
        }
    }, [financialData]);

    const handleSave = async () => {
        try {
            await saveFinancialData(formData, userEmail);
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            alert("Erreur lors de la sauvegarde.");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    // --- Calculations ---
    const totalRevenues = formData.psocRevenue + formData.otherGrantsRevenue + formData.autonomousRevenue;
    const surplusRatio = formData.totalExpenses > 0 ? (formData.accumulatedSurplus / formData.totalExpenses) * 100 : 0;
    const isOver25Percent = surplusRatio > 25;

    // Audit Thresholds (Typical Quebec NPO Rules - approx)
    let auditRequirement = "Compilation";
    if (totalRevenues >= 250000 && totalRevenues < 500000) auditRequirement = "Mission d'examen";
    if (totalRevenues >= 500000) auditRequirement = "Audit complet (Vérification)";

    return (
        <Modal
            onClose={onClose}
            title="Santé Financière & Conformité"
            icon={<DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            maxWidth="4xl"
        >
            <div className="p-6 space-y-8 bg-slate-50/50 dark:bg-gray-900/20">
                <div className="flex items-center gap-4 pb-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Année Financière</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-sm font-bold rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                        >
                            {[0, 1, 2].map(i => {
                                const y = currentFiscalYear - i;
                                return <option key={y} value={y}>{y} - {y + 1}</option>
                            })}
                        </select>
                    </div>
                </div>

                {isLoading && !financialData ? (
                    <div className="flex justify-center py-12"><p className="animate-pulse text-slate-400">Chargement...</p></div>
                ) : (
                    <>
                        {/* THE 25% RULE WIDGET */}
                        <div className={cn(
                            "rounded-2xl p-6 border-2 transition-all shadow-sm relative overflow-hidden",
                            isOver25Percent ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50" : "bg-white border-emerald-100 dark:bg-gray-800 dark:border-emerald-900/30"
                        )}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                                        <Percent className={cn("w-5 h-5", isOver25Percent ? "text-red-500" : "text-emerald-500")} />
                                        Règle des 25% (PSOC)
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 max-w-md">Le cumul des surplus ne doit pas dépasser 25% des dépenses de l'année précédente (ou en cours) pour éviter des coupures de subvention.</p>
                                </div>
                                <div className={cn(
                                    "px-4 py-2 rounded-xl text-2xl font-black tracking-tighter",
                                    isOver25Percent ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                )}>
                                    {surplusRatio.toFixed(1)}%
                                </div>
                            </div>

                            {/* PROGRESS BAR */}
                            <div className="h-4 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden flex relative">
                                <div
                                    className={cn("h-full transition-all duration-1000", isOver25Percent ? "bg-red-500" : "bg-emerald-500")}
                                    style={{ width: `${Math.min(surplusRatio, 100)}%` }}
                                ></div>
                                {/* 25% Marker */}
                                <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-slate-800 dark:bg-white z-10 opacity-50 h-full"></div>
                            </div>

                            {isOver25Percent && (
                                <div className="mt-4 flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    Attention : Le surplus cumulé dépasse le seuil permis. Vous risquez des pénalités du PSOC. Planifiez des dépenses d'immobilisation ou des projets spéciaux.
                                </div>
                            )}
                        </div>

                        {/* DATA INPUT SECTIONS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* REVENUES & EXPENSES FORM */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-gray-700">
                                    <h4 className="font-bold text-slate-700 dark:text-gray-300">Saisie Financière</h4>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>{isEditing ? "Annuler" : "Modifier"}</Button>
                                </div>

                                <div className="grid gap-3">
                                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Revenus PSOC</label>
                                        {isEditing ? (
                                            <input type="number" name="psocRevenue" value={formData.psocRevenue || ''} onChange={handleInputChange} className="w-32 text-right bg-slate-50 dark:bg-gray-900 border rounded px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-emerald-500/50" />
                                        ) : <span className="font-medium dark:text-white">{formData.psocRevenue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>}
                                    </div>
                                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Autres Subventions</label>
                                        {isEditing ? (
                                            <input type="number" name="otherGrantsRevenue" value={formData.otherGrantsRevenue || ''} onChange={handleInputChange} className="w-32 text-right bg-slate-50 dark:bg-gray-900 border rounded px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-emerald-500/50" />
                                        ) : <span className="font-medium dark:text-white">{formData.otherGrantsRevenue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>}
                                    </div>
                                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Revenus Autonomes</label>
                                        {isEditing ? (
                                            <input type="number" name="autonomousRevenue" value={formData.autonomousRevenue || ''} onChange={handleInputChange} className="w-32 text-right bg-slate-50 dark:bg-gray-900 border rounded px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-emerald-500/50" />
                                        ) : <span className="font-medium dark:text-white">{formData.autonomousRevenue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>}
                                    </div>

                                    <div className="my-2 border-t border-slate-200 dark:border-gray-700"></div>

                                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Dépenses Totales</label>
                                        {isEditing ? (
                                            <input type="number" name="totalExpenses" value={formData.totalExpenses || ''} onChange={handleInputChange} className="w-32 text-right bg-slate-50 dark:bg-gray-900 border rounded px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-red-500/50" />
                                        ) : <span className="font-medium text-red-600 dark:text-red-400">{formData.totalExpenses.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>}
                                    </div>

                                    <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm mt-2">
                                        <div>
                                            <label className="text-[10px] font-black tracking-widest text-indigo-500 uppercase block mb-1">Surplus Cumulé (Bilan)</label>
                                            <p className="text-[10px] text-indigo-400/80 leading-tight">Inclut les années antérieures.</p>
                                        </div>
                                        {isEditing ? (
                                            <input type="number" name="accumulatedSurplus" value={formData.accumulatedSurplus || ''} onChange={handleInputChange} className="w-32 text-right bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded px-2 py-1 text-sm font-black text-indigo-700 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500/50" />
                                        ) : <span className="text-lg font-black text-indigo-700 dark:text-indigo-400">{formData.accumulatedSurplus.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end pt-2">
                                        <Button variant="primary" onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-500"><Save className="w-4 h-4 mr-2" /> Enregistrer les montants</Button>
                                    </div>
                                )}
                                {saveSuccess && (
                                    <div className="text-center font-bold text-sm text-emerald-600 dark:text-emerald-400 flex justify-center items-center gap-2"><CheckCircle className="w-4 h-4" /> Données sauvegardées</div>
                                )}
                            </div>

                            {/* AUDIT ALERTS & THRESHOLDS */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-700 dark:text-gray-300 border-b border-slate-200 dark:border-gray-700 pb-2">Seuils d'Audit</h4>

                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-slate-200 dark:border-gray-700 shadow-sm h-full flex flex-col justify-center">
                                    <div className="text-center mb-6">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Revenus Totaux (Année)</p>
                                        <p className="text-4xl font-black tracking-tighter dark:text-white">
                                            {totalRevenues.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 })}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className={cn("p-3 rounded-xl border flex items-center justify-between transition-colors", totalRevenues < 250000 ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50" : "bg-slate-50 border-transparent dark:bg-gray-900 opacity-50")}>
                                            <div>
                                                <p className={cn("font-bold text-sm", totalRevenues < 250000 ? "text-amber-700 dark:text-amber-400" : "text-slate-500")}>Mission de Compilation</p>
                                                <p className="text-[10px] text-slate-400">Revenus &lt; 250k$</p>
                                            </div>
                                            {totalRevenues < 250000 && <Target className="w-5 h-5 text-amber-500" />}
                                        </div>

                                        <div className={cn("p-3 rounded-xl border flex items-center justify-between transition-colors", totalRevenues >= 250000 && totalRevenues < 500000 ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50" : "bg-slate-50 border-transparent dark:bg-gray-900 opacity-50")}>
                                            <div>
                                                <p className={cn("font-bold text-sm", totalRevenues >= 250000 && totalRevenues < 500000 ? "text-amber-700 dark:text-amber-400" : "text-slate-500")}>Mission d'Examen</p>
                                                <p className="text-[10px] text-slate-400">250k$ à 500k$</p>
                                            </div>
                                            {totalRevenues >= 250000 && totalRevenues < 500000 && <Target className="w-5 h-5 text-amber-500" />}
                                        </div>

                                        <div className={cn("p-3 rounded-xl border flex items-center justify-between transition-colors", totalRevenues >= 500000 ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50" : "bg-slate-50 border-transparent dark:bg-gray-900 opacity-50")}>
                                            <div>
                                                <p className={cn("font-bold text-sm", totalRevenues >= 500000 ? "text-red-700 dark:text-red-400" : "text-slate-500")}>Audit Complet (Réviseur)</p>
                                                <p className="text-[10px] text-slate-400">&gt; 500k$</p>
                                            </div>
                                            {totalRevenues >= 500000 && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                        </div>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <p className="text-xs text-slate-500">Exigence actuelle pré-assemblée :</p>
                                        <p className="font-black text-sm uppercase text-slate-700 dark:text-white mt-1">{auditRequirement}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};
