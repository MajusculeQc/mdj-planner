import React, { useState, useRef, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { BrainCircuit } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MessengerHeader } from './MessengerHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

// --- SCHEMA & TYPES ---

export const MessageSchema = z.object({
    id: z.string(),
    senderId: z.string(),
    senderName: z.string(),
    senderAvatar: z.string().optional(),
    content: z.string().min(1, "Message cannot be empty").max(500, "Message too long"),
    timestamp: z.date(),
    isRead: z.boolean(),
    contextId: z.string().optional(),
    recipientId: z.string().optional(), // Keeps backward compatibility for 1-on-1
    recipientIds: z.array(z.string()).optional(), // New field for group messaging
    recipientName: z.string().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export interface InternalMessengerProps {
    currentUser: { id: string; name: string; avatar?: string };
    initialMessages: Message[];
    contextId?: string;
    onSendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
    onMarkAsRead?: (messageIds: string[]) => Promise<void>;
    teamDirectory: Record<string, string>;
    className?: string;
}

// --- MAIN COMPONENT ---

const InternalMessenger: React.FC<InternalMessengerProps> = ({
    currentUser,
    initialMessages,
    contextId,
    onSendMessage,
    onMarkAsRead,
    teamDirectory,
    className
}) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState<'general' | 'private'>('general');
    const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    const teamMembers = useMemo(() => {
        return Object.entries(teamDirectory)
            .map(([name, id]) => ({ name, id }))
            .filter(m => m.id !== currentUser.id);
    }, [teamDirectory, currentUser.id]);

    // Calculate unread counts per conversation (group or private)
    const unreadCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        messages.forEach(m => {
            if (!m.isRead && m.senderId !== currentUser.id) {
                // If it's a private message to current user
                if (m.recipientId === currentUser.id && !m.recipientIds) {
                    counts[m.senderId] = (counts[m.senderId] || 0) + 1;
                }
                // If it's a group message involving current user
                else if (m.recipientIds?.includes(currentUser.id)) {
                    // For group icons/badges, we might need a different UI, 
                    // but for now let's tag the sender
                    counts[m.senderId] = (counts[m.senderId] || 0) + 1;
                }
            }
        });
        return counts;
    }, [messages, currentUser.id]);

    const filteredMessages = useMemo(() => {
        if (activeTab === 'general') {
            return messages.filter(m => !m.recipientId && !m.recipientIds && (!contextId || m.contextId === contextId));
        } else {
            if (selectedRecipientIds.length === 0) return [];

            // Current selection set of participants (IDs)
            const currentSelection = new Set([...selectedRecipientIds, currentUser.id]);

            return messages.filter(m => {
                const messageParticipants = new Set([m.senderId]);
                if (m.recipientId) messageParticipants.add(m.recipientId);
                if (m.recipientIds) m.recipientIds.forEach(id => messageParticipants.add(id));

                if (messageParticipants.size !== currentSelection.size) return false;
                for (const id of currentSelection) {
                    if (!messageParticipants.has(id)) return false;
                }
                return true;
            });
        }
    }, [messages, contextId, activeTab, selectedRecipientIds, currentUser.id]);

    // Mark messages as read when they appear in the filtered list
    useEffect(() => {
        const unreadIds = filteredMessages
            .filter(m => !m.isRead && m.senderId !== currentUser.id)
            .map(m => m.id);

        if (unreadIds.length > 0 && onMarkAsRead) {
            onMarkAsRead(unreadIds);
        }
    }, [filteredMessages, currentUser.id, onMarkAsRead]);

    const selectedRecipientNames = useMemo(() => {
        return teamMembers
            .filter(m => selectedRecipientIds.includes(m.id))
            .map(m => m.name)
            .join(', ');
    }, [teamMembers, selectedRecipientIds]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [filteredMessages]);

    const handleSend = async () => {
        if (status === 'loading' || !inputValue.trim()) return;

        try {
            const content = inputValue.trim();
            MessageSchema.shape.content.parse(content);
            setStatus('loading');

            await onSendMessage({
                senderId: currentUser.id,
                senderName: currentUser.name,
                content,
                contextId,
                recipientId: activeTab === 'private' && selectedRecipientIds.length === 1 ? selectedRecipientIds[0] : undefined,
                recipientIds: activeTab === 'private' && selectedRecipientIds.length > 1 ? selectedRecipientIds : undefined,
                recipientName: activeTab === 'private' ? selectedRecipientNames : undefined
            });

            setInputValue('');
            setStatus('idle');
        } catch (err) {
            console.error("[InternalMessenger] Error sending message:", err);
            setStatus('error');
        }
    };

    return (
        <section className={cn(
            "flex h-[600px] bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl transition-all",
            className
        )}>
            {/* Sidebar for Private Conversations */}
            <aside className="w-16 sm:w-56 border-r border-slate-100 dark:border-white/10 flex flex-col bg-slate-50/50 dark:bg-black/20">
                <div className="p-4 border-b border-slate-100 dark:border-white/10">
                    <button
                        onClick={() => {
                            setActiveTab('general');
                            setSelectedRecipientIds([]);
                        }}
                        className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-xl transition-all",
                            activeTab === 'general' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5"
                        )}
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <BrainCircuit className="w-4 h-4" />
                        </div>
                        <span className="hidden sm:block text-[11px] font-bold uppercase tracking-tight">Équipe</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    <p className="px-2 py-1 text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">Membres</p>
                    {teamMembers.map(member => {
                        const isSelected = selectedRecipientIds.includes(member.id);
                        return (
                            <button
                                key={member.id}
                                onClick={() => {
                                    if (activeTab !== 'private') setActiveTab('private');
                                    setSelectedRecipientIds(prev =>
                                        prev.includes(member.id)
                                            ? prev.filter(id => id !== member.id)
                                            : [...prev, member.id]
                                    );
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-xl transition-all relative group",
                                    activeTab === 'private' && isSelected
                                        ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30"
                                        : "text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full border flex items-center justify-center uppercase font-black text-[10px] transition-all",
                                        isSelected
                                            ? "bg-indigo-500 text-white border-indigo-400"
                                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white"
                                    )}>
                                        {member.name.substring(0, 2)}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 transition-all flex items-center justify-center",
                                        isSelected ? "bg-green-500" : "bg-slate-200 dark:bg-gray-700"
                                    )}>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                </div>
                                <div className="hidden sm:block text-left min-w-0 flex-1">
                                    <p className="text-[11px] font-bold truncate leading-none mb-1">{member.name}</p>
                                    <p className="text-[9px] opacity-60 truncate">
                                        {isSelected ? "Sélectionné" : "Discussion"}
                                    </p>
                                </div>
                                {unreadCounts[member.id] > 0 && !isSelected && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40">
                                        {unreadCounts[member.id]}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'private' && selectedRecipientIds.length > 0 && (
                    <div className="p-3 border-t border-slate-100 dark:border-white/10 bg-indigo-500/5">
                        <button
                            onClick={() => setSelectedRecipientIds([])}
                            className="w-full py-2 text-[8px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <MessengerHeader
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    contextId={contextId}
                    recipientName={selectedRecipientNames}
                />

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar bg-white dark:bg-gray-950/20 transition-colors"
                    aria-label="Liste des messages"
                >
                    {filteredMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                            <BrainCircuit className="w-12 h-12 text-indigo-400/20 mb-4" />
                            <p className="text-sm font-medium text-gray-500 italic">
                                {activeTab === 'general' ? "Aucun message d'équipe." : (selectedRecipientIds.length === 0 ? "Sélect. un membre." : `Démarrer une discussion avec ${selectedRecipientNames}.`)}
                            </p>
                        </div>
                    ) : (
                        filteredMessages.map(msg => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isOwn={msg.senderId === currentUser.id}
                            />
                        ))
                    )}
                </div>

                <footer className="p-4 bg-white dark:bg-white/5 border-t border-slate-100 dark:border-white/10 transition-colors">
                    <MessageInput
                        value={inputValue}
                        onChange={setInputValue}
                        onSend={handleSend}
                        placeholder={activeTab === 'general' ? "Message à l'équipe..." : (selectedRecipientIds.length === 0 ? "Choisir destinataire(s)..." : `Message à ${selectedRecipientNames}...`)}
                        isLoading={status === 'loading'}
                        colorScheme="indigo"
                        className={cn(status === 'error' && "animate-shake")}
                    />
                    {status === 'error' && (
                        <p className="text-[10px] text-red-500 dark:text-red-400 mt-2 ml-2 font-bold uppercase tracking-widest">
                            ⚠️ Erreur lors de l'envoi.
                        </p>
                    )}
                </footer>
            </div>
        </section>
    );
};

export default InternalMessenger;
