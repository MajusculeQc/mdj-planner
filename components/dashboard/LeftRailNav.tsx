import React from 'react';
import {
    Calendar,
    Users,
    Shield,
    TrendingUp,
    FileLineChart,
    MessageSquare,
    Package,
    Settings,
    LayoutDashboard,
    Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface LeftRailNavProps {
    isAdmin: boolean;
    isStaff: boolean;
    activeSection: 'calendar' | 'members' | 'governance' | 'financial' | 'psoc' | 'web_registrations';
    onSectionChange: (section: any) => void;
    onToggleMessenger: () => void;
    onOpenSettings: () => void;
    onLogoClick?: () => void;
    hasUnreadMessages?: boolean;
}

export const LeftRailNav: React.FC<LeftRailNavProps> = ({
    isAdmin,
    isStaff,
    activeSection,
    onSectionChange,
    onToggleMessenger,
    onOpenSettings,
    onLogoClick,
    hasUnreadMessages
}) => {
    const mainItems = [
        { id: 'calendar', icon: Calendar, label: 'Calendrier' },
        ...(isStaff ? [
            { id: 'web_registrations', icon: Globe, label: 'Inscriptions Web' },
            { id: 'members', icon: Users, label: 'Registre' },
        ] : []),
        ...(isAdmin ? [
            { id: 'psoc', icon: FileLineChart, label: 'PSOC' },
            { id: 'governance', icon: Shield, label: 'CA' },
            { id: 'financial', icon: TrendingUp, label: 'Finance' },
        ] : [])
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-20 bg-surface flex flex-col items-center py-8 z-[60] shadow-xl transition-colors duration-300">
            <div
                onClick={onLogoClick}
                className="mb-10 px-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
                <img
                    src="https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/logo-du-planner-no-frame-l039escale-jeunesse-la-piaule.png"
                    alt="SOLI"
                    className="w-14 h-auto drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                />
            </div>

            <nav className="flex-1 flex flex-col items-center gap-4">
                {mainItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSectionChange(item.id)}
                        className={cn(
                            "sidebar-rail-item",
                            activeSection === item.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-muted hover:bg-base hover:text-primary"
                        )}
                        title={item.label}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 bg-surface px-2 py-0.5 border border-subtle rounded text-primary whitespace-nowrap pointer-events-none shadow-lg">
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto flex flex-col items-center gap-4">
                <button
                    onClick={onToggleMessenger}
                    className="sidebar-rail-item text-muted hover:bg-base hover:text-primary"
                    title="Messagerie"
                >
                    <MessageSquare className="w-5 h-5" />
                    {hasUnreadMessages && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
                    )}
                </button>

                <button
                    onClick={onOpenSettings}
                    className="sidebar-rail-item text-muted hover:bg-base hover:text-primary"
                    title="Paramètres"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </aside>
    );
};
