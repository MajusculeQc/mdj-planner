import React, { useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MessageInputProps {
    value: string;
    onChange: (val: string) => void;
    onSend: () => void;
    placeholder: string;
    isLoading: boolean;
    colorScheme?: 'indigo' | 'cyan';
    className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    value,
    onChange,
    onSend,
    placeholder,
    isLoading,
    colorScheme = 'indigo',
    className
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const isIndigo = colorScheme === 'indigo';

    return (
        <div className={cn("relative flex items-end gap-2", className)}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                    "w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all resize-none max-h-32 custom-scrollbar",
                    isIndigo
                        ? "focus:ring-indigo-500/50 focus:border-indigo-500"
                        : "focus:ring-cyan-500/50 focus:border-cyan-500"
                )}
                rows={1}
                style={{ minHeight: '44px' }}
            />
            <button
                type="button"
                onClick={onSend}
                disabled={!value.trim() || isLoading}
                className={cn(
                    "absolute right-2 bottom-2 p-2 text-white rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                    isIndigo
                        ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                        : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20"
                )}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
        </div>
    );
};
