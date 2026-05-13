import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

interface ThemeToggleProps {
    className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={cn("w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-zinc-800/50 animate-pulse", className)} />
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "group relative w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all active:scale-95",
                className
            )}
            aria-label="Toggle dark mode"
            role="button"
        >
            <div className="relative w-5 h-5 overflow-hidden">
                <Sun
                    className={cn(
                        "w-5 h-5 text-amber-500 absolute transition-all duration-300",
                        theme === 'dark' ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"
                    )}
                />
                <Moon
                    className={cn(
                        "w-5 h-5 text-indigo-400 absolute transition-all duration-300",
                        theme === 'dark' ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
                    )}
                />
            </div>

            {/* Decorative hover effect */}
            <div className="absolute inset-0 rounded-xl bg-mdj-cyan/0 group-hover:bg-mdj-cyan/5 transition-colors duration-200" />
        </button>
    );
};
