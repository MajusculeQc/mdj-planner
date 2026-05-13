import React from 'react';
import { MessageSquare, Book, Send, Trash2, Calendar, User, Clock } from 'lucide-react';
import { Activity, ActivityComment } from '../../types';
import { cn } from '../../lib/utils';

interface CommentsTabProps {
    activity: Activity;
    updateActivity: (updates: Partial<Activity>) => void;
    addComment: (text: string) => void;
    currentUser: any;
}

const CommentsTab: React.FC<CommentsTabProps> = ({
    activity,
    updateActivity,
    addComment,
    currentUser
}) => {
    const [newComment, setNewComment] = React.useState('');
    const { comments, journal } = activity;

    const handleSendComment = () => {
        if (!newComment.trim()) return;
        addComment(newComment.trim());
        setNewComment('');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">


            {/* COMMENTAIRES & CHAT D'ÉQUIPE */}
            <section className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-100 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Discussion d'équipe</h3>
                </div>

                <div className="flex flex-col h-[500px]">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-6">
                        {(!comments || comments.length === 0) ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-20">
                                <MessageSquare className="w-16 h-16 mb-4" />
                                <p className="italic text-sm">Aucun commentaire pour le moment.</p>
                            </div>
                        ) : (
                            comments.map((comment: ActivityComment) => (
                                <div
                                    key={comment.id}
                                    className={cn(
                                        "max-w-[85%] p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2",
                                        comment.userEmail === currentUser?.email
                                            ? "ml-auto bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                            : "mr-auto bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-gray-200"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                                                {comment.userName.charAt(0)}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{comment.userName}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-60">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">{new Date(comment.timestamp).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed">{comment.text}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative flex gap-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-2xl p-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                placeholder="Ajouter une note ou taguer un collègue..."
                                className="flex-1 bg-transparent px-4 text-sm text-slate-900 dark:text-white outline-none"
                            />
                            <button
                                onClick={handleSendComment}
                                disabled={!newComment.trim()}
                                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CommentsTab;
