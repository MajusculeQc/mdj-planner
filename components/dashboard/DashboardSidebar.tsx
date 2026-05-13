import React, { useState } from 'react';
import {
    AlertCircle,
    Target,
    TrendingUp,
    Package,
    ShoppingBag,
    LayoutDashboard,
    ChevronRight,
    Users,
    Shield,
    FileLineChart
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AlertsPanel } from './AlertsPanel';
import { RmjqPanel } from './RmjqPanel';
import { BudgetPanel } from './BudgetPanel';
import { InventoryPanel } from './InventoryPanel';
import { PurchasesPanel } from './PurchasesPanel';

interface DashboardSidebarProps {
    isAdmin: boolean;
    auth: any;
    metrics: any;
    activityStore: any;
    handleCreatePRFromAlert: (item: any, qty: number) => Promise<void>;
    onRMJQSync: () => Promise<void>;
    onShowReports: () => void;
    onShowMembers: () => void;
    onShowGovernance: () => void;
    onShowFinancial: () => void;
    onShowPsoc: () => void;
    onSelectActivityCallback: (id: string, tab?: any) => void;
    onManageInventory: (item?: any) => void;
}

type TabType = 'alerts' | 'planning' | 'logistics';

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    isAdmin,
    auth,
    metrics,
    activityStore,
    handleCreatePRFromAlert,
    onRMJQSync,
    onShowReports,
    onShowMembers,
    onShowGovernance,
    onShowFinancial,
    onShowPsoc,
    onSelectActivityCallback,
    onManageInventory
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('planning');

    const tabs = [
        { id: 'planning', label: 'Planification', icon: Target },
        { id: 'logistics', label: 'Logistique', icon: Package },
    ];

    return (
        <div className="space-y-8 h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="flex p-1 rounded-2xl glass shadow-xl">
                {tabs.map((tab: any) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                            activeTab === tab.id
                                ? "bg-indigo-600 dark:bg-white/10 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10 border border-indigo-500/50 dark:border-white/10"
                                : "text-muted hover:text-primary hover:bg-base"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4 transition-transform duration-300", activeTab === tab.id ? "text-indigo-400 scale-110" : "opacity-40")} />
                        <span className="hidden xl:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'planning' && (
                    <>
                        <RmjqPanel
                            rmjqProgress={metrics.rmjqProgress}
                            selectedRmjqCategory={metrics.selectedRmjqCategory}
                            setSelectedRmjqCategory={metrics.setSelectedRmjqCategory}
                            filteredRmjqActivities={metrics.filteredRmjqActivities}
                            onSelectActivity={activityStore.setSelectedActivity}
                        />
                        <BudgetPanel
                            detailedBudget={metrics.detailedBudget}
                            onSelectActivity={onSelectActivityCallback}
                        />

                        {/* Reports Trigger */}
                        <button
                            onClick={onShowReports}
                            className="w-full group p-4 bg-indigo-600 hover:bg-indigo-500 rounded-[2rem] border border-indigo-400/30 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-1">Reddition</div>
                                    <div className="text-xs font-black text-white uppercase tracking-tight">Analyses & Rapports</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </>
                )}

                {activeTab === 'logistics' && (
                    <>
                        <PurchasesPanel
                            isAdmin={isAdmin}
                            onSelectActivity={(id) => {
                                const act = activityStore.activities.find((a: any) => a.id === id);
                                if (act) activityStore.setSelectedActivity(act);
                            }}
                            userEmail={auth.currentUser?.email || undefined}
                        />
                        <InventoryPanel
                            isAdmin={isAdmin}
                            userEmail={auth.currentUser?.email || undefined}
                            onManageItem={onManageInventory}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
