import React, { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AIIntelligenceService } from '../../services/aiIntelligenceService';

interface AICorrectButtonProps {
    text: string;
    onCorrect: (correctedText: string) => void;
    className?: string;
    label?: string;
    variant?: 'icon' | 'button';
}

/**
 * A reusable premium button to correct spelling and grammar using AI.
 */
const AICorrectButton: React.FC<AICorrectButtonProps> = ({
    text,
    onCorrect,
    className,
    label = "Corriger",
    variant = 'icon'
}) => {
    const [isCorrecting, setIsCorrecting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCorrect = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!text || !text.trim() || isCorrecting) return;

        setIsCorrecting(true);
        try {
            const corrected = await AIIntelligenceService.correctText(text);
            if (corrected && corrected !== text) {
                onCorrect(corrected);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            }
        } catch (error) {
            console.error("Correction error:", error);
        } finally {
            setIsCorrecting(false);
        }
    };

    if (variant === 'button') {
        return (
            <button
                onClick={handleCorrect}
                disabled={isCorrecting || !text?.trim()}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    isCorrecting 
                        ? "bg-slate-100 dark:bg-white/5 text-slate-400 animate-pulse cursor-wait" 
                        : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20",
                    className
                )}
            >
                {isCorrecting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : showSuccess ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                    <Sparkles className="w-3 h-3" />
                )}
                {isCorrecting ? "Correction..." : showSuccess ? "Corrigé !" : label}
            </button>
        );
    }

    return (
        <button
            onClick={handleCorrect}
            disabled={isCorrecting || !text?.trim()}
            title="Corriger l'orthographe et la grammaire (IA)"
            className={cn(
                "p-1.5 rounded-lg transition-all",
                isCorrecting 
                    ? "bg-slate-100 dark:bg-white/5 text-slate-400 animate-pulse cursor-wait" 
                    : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10",
                showSuccess && "text-emerald-500",
                className
            )}
        >
            {isCorrecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : showSuccess ? (
                <Check className="w-3.5 h-3.5" />
            ) : (
                <Sparkles className="w-3.5 h-3.5" />
            )}
        </button>
    );
};

export default AICorrectButton;
