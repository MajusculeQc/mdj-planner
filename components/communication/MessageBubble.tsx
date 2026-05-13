import React from 'react';
import { User as UserIcon, Check, CheckCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Message } from './InternalMessenger';

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 8400) return `${Math.floor(diffInSeconds / 3600)}h`;

    return date.toLocaleDateString('fr-CA', { hour: '2-digit', minute: '2-digit' });
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => (
    <div className={cn(
        "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isOwn ? "justify-end" : "justify-start"
    )}>
        <div className={cn(
            "flex max-w-[80%] gap-2",
            isOwn ? "flex-row-reverse" : "flex-row"
        )}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-600/20 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 transition-all">
                {message.senderAvatar ? (
                    <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full object-cover" />
                ) : (
                    <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1">
                {!isOwn && (
                    <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-wider">
                        {message.senderName}
                    </span>
                )}
                <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all",
                    isOwn
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-100 border border-slate-200 dark:border-white/5 rounded-tl-none"
                )}>
                    {message.content}
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 px-1",
                    isOwn ? "justify-end" : "justify-start"
                )}>
                    <span className="text-[9px] text-gray-500 font-medium">
                        {formatRelativeTime(message.timestamp)}
                    </span>
                    {isOwn && (
                        message.isRead ? (
                            <CheckCheck className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
                        ) : (
                            <Check className="w-3 h-3 text-slate-400 dark:text-gray-500" />
                        )
                    )}
                </div>
            </div>
        </div>
    </div>
);
