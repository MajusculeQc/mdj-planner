import React from 'react';
import {
    Calendar,
    Users,
    MessageSquare,
    Settings,
    Globe,
    Shield,
    TrendingUp,
    FileLineChart,
    Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileBottomNavProps {
    isAdmin: boolean;
    isStaff: boolean;
    activeSection: 'calendar' | 'members' | 'governance' | 'financial' | 'psoc' | 'web_registrations';
    onSectionChange: (section: any) => void;
    onToggleMessenger: () => void;
    onOpenSettings: () => void;
    hasUnreadMessages?: boolean;
    onCreateActivity?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    isAdmin,
    isStaff,
    activeSection,
    onSectionChange,
    onToggleMessenger,
    onOpenSettings,
    hasUnreadMessages,
    onCreateActivity
}) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-xl border-t border-subtle flex items-center justify-around px-2 z-[60] lg:hidden">
            <button
                onClick={() => onSectionChange('calendar')}
                className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    activeSection === 'calendar' ? "text-indigo-500" : "text-muted"
                )}
            >
                <Calendar className="w-5 h-5" />
                <span className="text-[10px] font-bold">Calendrier</span>
            </button>

            {isStaff && (
                <button
                    onClick={() => onSectionChange('members')}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all",
                        activeSection === 'members' ? "text-indigo-500" : "text-muted"
                    )}
                >
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Membres</span>
                </button>
            )}

            {onCreateActivity && (
                <button
                    onClick={onCreateActivity}
                    className="flex flex-col items-center -translate-y-4 bg-indigo-600 w-12 h-12 rounded-full shadow-lg shadow-indigo-500/40 text-white flex-shrink-0"
                >
                    <Plus className="w-6 h-6 m-auto" />
                </button>
            )}

            <button
                onClick={onToggleMessenger}
                className={cn(
                    "flex flex-col items-center gap-1 transition-all relative",
                    "text-muted"
                )}
            >
                <MessageSquare className="w-5 h-5" />
                <span className="text-[10px] font-bold">Messages</span>
                {hasUnreadMessages && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-surface shadow-sm" />
                )}
            </button>

            <button
                onClick={onOpenSettings}
                className="flex flex-col items-center gap-1 text-muted"
            >
                <Settings className="w-5 h-5" />
                <span className="text-[10px] font-bold">Plus</span>
            </button>
        </nav>
    );
};
