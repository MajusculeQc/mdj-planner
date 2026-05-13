import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, BarChart3, Loader2 } from 'lucide-react';
import { Activity } from '../../types';
import { AIIntelligenceService } from '../../services/aiIntelligenceService';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface TrendAnalyzerProps {
    activities: Activity[];
}

export const TrendAnalyzer: React.FC<TrendAnalyzerProps> = ({ activities }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await AIIntelligenceService.analyzeSocialClimate(activities);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'analyse du climat social.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-white/5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/10 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-500" />
                        Analyseur de Climat Social (IA)
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Synthèse intelligente des {activities.length} interventions filtrées.
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || activities.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-500 rounded-2xl px-6"
                >
                    {isAnalyzing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {isAnalyzing ? "Analyse en cours..." : "Lancer l'Analyse"}
                </Button>
            </div>

            {analysis ? (
                <div className="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-500/10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-indigo-500/20 rounded-2xl shadow-sm">
                            <Sparkles className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div className="flex-1">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <div className="whitespace-pre-wrap font-medium leading-relaxed text-slate-700 dark:text-gray-300 text-base">
                                    {analysis}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2rem] bg-slate-50/30 dark:bg-white/5 transition-all">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-10 text-indigo-500" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucune analyse générée</p>
                    <p className="text-xs text-slate-400 mt-2">Cliquez sur le bouton ci-dessus pour que Gemini traite vos verbatims.</p>
                </div>
            )}

            <div className="mt-8 flex flex-wrap gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                    Défis & Tensions
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    Bons coups & Succès
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                    Tendances récurrentes
                </div>
            </div>
        </div>
    );
};
