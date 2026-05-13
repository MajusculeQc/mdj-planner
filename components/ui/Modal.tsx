import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    icon?: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    onClose,
    children,
    title,
    icon,
    maxWidth = '5xl',
    className
}) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const maxWidthClass = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        'full': 'max-w-full'
    }[maxWidth];

    return createPortal(
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className={cn(
                    "bg-white dark:bg-gray-800 w-full h-full max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300",
                    maxWidthClass,
                    className
                )}
            >
                {/* Optional Header if title is provided */}
                {title && (
                    <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                            {icon && (
                                <div className="p-3 bg-base rounded-2xl">
                                    {icon}
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-black tracking-tight uppercase text-primary leading-none">{title}</h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-base rounded-xl transition-colors text-muted hover:text-primary"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
