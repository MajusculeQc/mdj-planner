import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    noPadding?: boolean;
}

export function Card({ children, className, noPadding = false, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "bento-card glass rounded-[2rem] border border-white/5 shadow-none relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1",
                !noPadding && "p-6",
                className
            )}
            {...props}
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <div className="w-32 h-32 bg-indigo-500 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 w-full h-full flex flex-col">
                {children}
            </div>
        </div>
    );
}
