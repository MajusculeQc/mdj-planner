import { useMemo } from 'react';
import { Activity, PurchaseRequest, InventoryItem } from '../types';
import { RMJQ_TARGETS } from '../lib/constants';
import { calculateActivityReadiness } from '../lib/readiness';
import { isAbsence } from '../lib/utils';
import { sanitizeActivityData } from '../lib/schemas';
import { checkActivityTypeMatch } from '../lib/rmjqUtils';

export interface BudgetItem {
    date: string;
    activityId: string;
    activityName: string;
    description: string;
    amount: number;
    category: string;
    type: 'activity' | 'purchase';
}


function categorizeBudgetItem(description: string): string {
    const desc = description.toLowerCase();
    if (desc.match(/épicerie|repas|bouffe|restaurant|souper|dîner|gâteau|snack|pizza|ingrédients|traiteur/)) return 'Nourriture';
    if (desc.match(/bus|autobus|essence|transport|taxi|km|déplacement|location véhicule/)) return 'Transport';
    if (desc.match(/matériel|équipement|fournitures|art|jeu|décoration|costume/)) return 'Matériel';
    if (desc.match(/billet|entrée|sortie|frais|accès|honoraires|location|inscription/)) return 'Activités';
    return 'Autre';
}

export interface StaffConflict {
    date: string;
    staffName: string;
    activities: { id: string; title: string; startTime: string; endTime: string }[];
}

interface UsePlanningMetricsReturn {
    displayedActivities: Activity[];
    totalBudget: number;
    rmjqProgress: Record<string, number>;
    incompleteAlerts: Activity[];
    staffConflicts: StaffConflict[];
    detailedBudget: BudgetItem[];
    filteredRmjqActivities: Activity[];
    daysToFinalize: number;
    totalAttendance: number;
    totalNewMembers: number;
    selectedRmjqCategory: string | null;
    setSelectedRmjqCategory: (cat: string | null) => void;
    checkRmjqMatch: (act: Activity, targetType: string) => boolean;
    lowStockItems: InventoryItem[];
}

export function usePlanningMetrics(
    activities: Activity[],
    currentMonthStr: string,
    selectedRmjqCategoryState: [string | null, (v: string | null) => void],
    purchaseRequests: PurchaseRequest[] = [],
    inventoryItems: InventoryItem[] = []
): UsePlanningMetricsReturn {
    const [selectedRmjqCategory, setSelectedRmjqCategory] = selectedRmjqCategoryState;

    const displayedActivities = useMemo(
        () => activities.filter(a => a.date.startsWith(currentMonthStr)),
        [activities, currentMonthStr],
    );

    const totalBudget = useMemo(() => {
        const activityBudget = displayedActivities.reduce((sum, act) => sum + (act.budget?.estimatedCost ?? 0), 0);
        const purchaseBudget = purchaseRequests
            .filter(pr => pr.status !== 'Refusé')
            .reduce((sum, pr) => sum + (pr.estimatedCost || 0), 0);
        return activityBudget + purchaseBudget;
    }, [displayedActivities, purchaseRequests]);

    const rmjqProgress = useMemo(() => {
        const counts: Record<string, number> = {};
        RMJQ_TARGETS.forEach(t => { counts[t.type] = 0; });
        displayedActivities.forEach(act => {
            RMJQ_TARGETS.forEach(target => {
                if (checkActivityTypeMatch(act, target.type)) {
                    counts[target.type] = (counts[target.type] ?? 0) + 1;
                }
            });
        });
        return counts;
    }, [displayedActivities]);

    const incompleteAlerts = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);

        const alerts: Activity[] = [];

        // 1. Incomplete activities (ignoring absences)
        activities.forEach(a => {
            if (isAbsence(a.title) || !a.date) return;

            const actDate = new Date(a.date + 'T00:00:00');
            if (isNaN(actDate.getTime())) return;

            const { percentage } = calculateActivityReadiness(a);
            if (actDate >= today && actDate <= thirtyDaysLater && percentage < 100) {
                alerts.push(a);
            }
        });

        // 2. Missing activities on open days (Tuesday=2, Wednesday=3, Thursday=4, Friday=5)
        for (let i = 0; i <= 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            const dayOfWeek = checkDate.getDay();

            // Only alert for Tuesday to Friday
            if (dayOfWeek >= 2 && dayOfWeek <= 5) {
                // Ensure date string is local YYYY-MM-DD
                const year = checkDate.getFullYear();
                const month = String(checkDate.getMonth() + 1).padStart(2, '0');
                const day = String(checkDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const hasActivity = activities.some(a => a.date === dateStr && !isAbsence(a.title));

                if (!hasActivity) {
                    alerts.push(sanitizeActivityData({
                        id: `missing_${dateStr}`,
                        title: '⚠️ AUCUNE ACTIVITÉ PRÉVUE',
                        date: dateStr,
                        startTime: '17:30',
                        endTime: '21:00',
                        type: 'Loisirs et divertissements',
                        description: 'Le centre est ouvert but aucune activité n\'est prévue pour les jeunes.',
                        preparationScore: 0,
                    }));
                }
            }
        }

        return alerts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [activities]);

    const staffConflicts = useMemo((): StaffConflict[] => {
        // Group activities by date, excluding absences and past events
        const byDate: Record<string, Activity[]> = {};
        activities.forEach(a => {
            if (a.isPostponed) return;
            if (isAbsence(a.title)) return;
            byDate[a.date] = byDate[a.date] ?? [];
            byDate[a.date].push(a);
        });

        const conflicts: StaffConflict[] = [];
        Object.entries(byDate).forEach(([date, acts]) => {
            if (acts.length < 2) return;
            // Collect all staff per activity
            const staffMap: Record<string, typeof acts> = {};
            acts.forEach(act => {
                const allStaff = [act.staffing.leadStaff, ...act.staffing.supportStaff].filter(Boolean);
                allStaff.forEach(name => {
                    if (!name || name === 'À combler') return;
                    staffMap[name] = staffMap[name] ?? [];
                    staffMap[name].push(act);
                });
            });
            // A conflict exists when the same person is on 2+ activities same day
            Object.entries(staffMap).forEach(([name, involvedActs]) => {
                if (involvedActs.length >= 2) {
                    conflicts.push({
                        date,
                        staffName: name,
                        activities: involvedActs.map(a => ({
                            id: a.id,
                            title: a.title,
                            startTime: a.startTime || '17:00',
                            endTime: a.endTime || '18:30',
                        })),
                    });
                }
            });
        });
        return conflicts.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    }, [activities]);

    const detailedBudget = useMemo(() => {
        const items: BudgetItem[] = [];
        displayedActivities.forEach(act => {
            act.budget.items.forEach(item => {
                if (item.amount > 0) {
                    items.push({
                        date: act.date,
                        activityId: act.id,
                        activityName: act.title,
                        description: item.description,
                        amount: item.amount,
                        category: categorizeBudgetItem(item.description),
                        type: 'activity'
                    });
                }
            });
        });

        // Add purchase requests to detailed budget
        purchaseRequests.forEach(pr => {
            if (pr.status !== 'Refusé') {
                const activity = activities.find(a => a.id === pr.linkedActivityId);
                items.push({
                    date: activity ? activity.date : new Date(pr.timestamp).toISOString().split('T')[0],
                    activityId: pr.linkedActivityId || 'general',
                    activityName: activity ? activity.title : 'Achat Général',
                    description: `ACHAT: ${pr.customName} (${pr.quantityNeeded})`,
                    amount: pr.estimatedCost,
                    category: 'Matériel',
                    type: 'purchase'
                });
            }
        });

        return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [displayedActivities, purchaseRequests, activities]);

    const filteredRmjqActivities = useMemo(() => {
        if (!selectedRmjqCategory) return [];
        return displayedActivities.filter(act => checkActivityTypeMatch(act, selectedRmjqCategory));
    }, [displayedActivities, selectedRmjqCategory]);

    const daysToFinalize = useMemo(() => {
        const uniqueIncompleteDays = new Set<string>();
        displayedActivities.forEach(act => {
            const { percentage } = calculateActivityReadiness(act);
            if (percentage < 100) {
                uniqueIncompleteDays.add(act.date);
            }
        });
        return uniqueIncompleteDays.size;
    }, [displayedActivities]);

    const { totalAttendance, totalNewMembers } = useMemo(() => {
        let attendance = 0;
        let newMembers = 0;
        displayedActivities.forEach(act => {
            if (act.stats) {
                attendance += (act.stats.presentMale || 0) + (act.stats.presentFemale || 0) + (act.stats.presentNonBinary || 0);
                newMembers += (act.stats.newMembers || 0);
            }
        });
        return { totalAttendance: attendance, totalNewMembers: newMembers };
    }, [displayedActivities]);

    const lowStockItems = useMemo(() => {
        return inventoryItems.filter(item => item.totalQuantity <= item.minThreshold && item.minThreshold > 0);
    }, [inventoryItems]);

    return {
        displayedActivities,
        totalBudget,
        rmjqProgress,
        incompleteAlerts,
        staffConflicts,
        detailedBudget,
        filteredRmjqActivities,
        daysToFinalize,
        totalAttendance,
        totalNewMembers,
        selectedRmjqCategory,
        setSelectedRmjqCategory,
        checkRmjqMatch: checkActivityTypeMatch,
        lowStockItems,
    };
}
