import { useState, useEffect, useCallback, useMemo } from 'react';
import { Activity, ActivityType } from '../types';
import { FirebaseService } from '../services/firebaseService';
import { sanitizeActivityData } from '../lib/schemas';
import { DEFAULT_VENUE, DEFAULT_EMERGENCY_CONTACT, DEFAULT_RATIO, DEFAULT_START_TIME, DEFAULT_END_TIME, getEmployeeName } from '../lib/constants';
import { calculateActivityReadiness } from '../lib/readiness';
import { FilterState } from '../components/dashboard/DashboardFilters';
import { checkActivityTypeMatch } from '../lib/rmjqUtils';
import { isAbsence } from '../lib/utils';

function createEmptyActivity(date: string, currentUserEmail?: string): Activity {
    return sanitizeActivityData({
        id: `act-${Date.now()}`,
        title: 'Nouvelle activité',
        date,
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        type: null,
        rmjqDimensions: [],
        youthInvolvement: { level: null, tasks: [] },
        createdByEmail: currentUserEmail,
        logistics: {
            venueName: DEFAULT_VENUE.name,
            address: DEFAULT_VENUE.address,
            phoneNumber: DEFAULT_VENUE.phone,
            website: DEFAULT_VENUE.website,
            meetingPoint: 'Local 2',
        },
    });
}

interface UseActivitiesReturn {
    activities: Activity[];
    filteredActivities: Activity[];
    isLoading: boolean;
    filters: FilterState;
    setFilters: (f: FilterState) => void;
    selectedActivity: Activity | null;
    setSelectedActivity: (a: Activity | null) => void;
    handleSaveActivity: (activity: Activity) => Promise<void>;
    handleUpdateActivity: (activity: Activity) => Promise<void>;
    handleCreateActivity: (date: string) => void;
    handleOpenNewActivity: () => void;
    handleDeleteActivity: (id: string, e: React.MouseEvent) => Promise<void>;
    handleDeleteActivityFromModal: (id: string) => Promise<void>;
    draggedActivityId: string | null;
    handleDragStart: (e: React.DragEvent, activityId: string) => void;
    handleDrop: (e: React.DragEvent, targetDate: string) => Promise<void>;
    copiedActivity: Activity | null;
    handleCopyActivity: (activity: Activity) => void;
    handlePasteActivity: (date: string) => Promise<void>;
    handleExportHtml: () => void;
    setConsumptionValidated: (activityId: string, isValidated: boolean) => Promise<void>;
    handleCloneActivity: (activity: Activity) => Promise<void>;
    handleQuickSpecialDay: (date: string, label: string) => Promise<void>;
}

export function useActivities(currentUserEmail?: string): UseActivitiesReturn {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
    const [copiedActivity, setCopiedActivity] = useState<Activity | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        staff: null,
        type: null,
        status: 'all'
    });

    useEffect(() => {
        if (!currentUserEmail) {
            setIsLoading(false);
            return;
        }
        const unsubscribe = FirebaseService.subscribeToActivities((cloudActivities) => {
            const enriched = cloudActivities.map(act => {
                const readiness = calculateActivityReadiness(act);
                return {
                    ...act,
                    preparationScore: readiness.percentage,
                    isMissingOnlyCost: readiness.isMissingOnlyCost
                };
            });
            setActivities(enriched);
            setIsLoading(false);
        });
        return unsubscribe;
    }, [currentUserEmail]);

    const filteredActivities = useState<Activity[]>([]); // We will use useMemo instead

    const memoizedFilteredActivities = useState<Activity[]>([]); // Legacy placeholder

    const actualFilteredActivities = useMemo(() => {
        return activities.filter(act => {
            // Global Filter: Always exclude absences and postponed activities from the main calendar view
            // to avoid skewing metrics and cluttering the grid.
            if (isAbsence(act.title)) return false;
            if (act.isPostponed) return false;

            // Staff filter
            if (filters.staff) {
                const isLead = act.staffing.leadStaff === filters.staff;
                const isSupport = act.staffing.supportStaff.includes(filters.staff);
                if (!isLead && !isSupport) return false;
            }

            // Type filter
            if (filters.type && !checkActivityTypeMatch(act, filters.type)) {
                return false;
            }

            // Status filter
            if (filters.status !== 'all') {
                const { percentage } = calculateActivityReadiness(act);
                if (filters.status === 'ready' && percentage < 100) return false;
                if (filters.status === 'incomplete' && percentage === 100) return false;
            }

            return true;
        });
    }, [activities, filters]);

    const handleSaveActivity = useCallback(async (activityToSave: Activity) => {
        const userName = getEmployeeName(currentUserEmail);
        const newEntry = {
            timestamp: Date.now(),
            userEmail: currentUserEmail || 'inconnu',
            userName: userName || 'Inconnu',
            action: 'Modification enregistrée',
        };
        const activityWithSignature = {
            ...activityToSave,
            lastEditedBy: currentUserEmail || undefined,
            changelog: [...(activityToSave.changelog || []), newEntry],
        };

        setActivities(prev => {
            const exists = prev.some(a => a.id === activityWithSignature.id);
            return exists
                ? prev.map(a => a.id === activityWithSignature.id ? activityWithSignature : a)
                : [...prev, activityWithSignature];
        });

        try {
            await FirebaseService.save(activityWithSignature);
        } catch {
            alert("Erreur de sauvegarde. Vérifiez votre connexion.");
        }
        setSelectedActivity(null);
    }, [currentUserEmail]);

    const handleCreateActivity = useCallback((date: string) => {
        setSelectedActivity(createEmptyActivity(date, currentUserEmail || undefined));
    }, [currentUserEmail]);

    const handleDeleteActivity = useCallback(async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) return;
        try {
            await FirebaseService.delete(id);
        } catch {
            alert("Erreur lors de la suppression.");
        }
    }, []);

    const handleDeleteActivityFromModal = useCallback(async (id: string) => {
        try {
            await FirebaseService.delete(id);
            setSelectedActivity(null);
        } catch {
            alert("Erreur lors de la suppression.");
        }
    }, []);

    const handleDragStart = useCallback((e: React.DragEvent, activityId: string) => {
        e.dataTransfer.setData("text/plain", activityId);
        setDraggedActivityId(activityId);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent, targetDate: string) => {
        e.preventDefault();
        if (!draggedActivityId) return;
        const activityToMove = activities.find(a => a.id === draggedActivityId);
        if (activityToMove && activityToMove.date !== targetDate) {
            await handleSaveActivity({ ...activityToMove, date: targetDate });
        }
        setDraggedActivityId(null);
    }, [draggedActivityId, activities, handleSaveActivity]);

    const handleOpenNewActivity = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        setSelectedActivity(createEmptyActivity(today, currentUserEmail || undefined));
    }, [currentUserEmail]);

    const handleCopyActivity = useCallback((activity: Activity) => {
        setCopiedActivity(activity);
    }, []);

    const handlePasteActivity = useCallback(async (date: string) => {
        if (!copiedActivity) return;
        const newActivity = {
            ...copiedActivity,
            id: `act-${Date.now()}`,
            date,
            type: null, // Force re-selection
            rmjqDimensions: [], // Force re-selection
            youthInvolvement: { level: null, tasks: [] }, // Force re-selection
            changelog: [{
                timestamp: Date.now(),
                userEmail: currentUserEmail || 'inconnu',
                userName: getEmployeeName(currentUserEmail) || 'Inconnu',
                action: `Copiée depuis le ${copiedActivity.date}`,
            }],
        };
        await handleSaveActivity(newActivity);
    }, [copiedActivity, currentUserEmail, handleSaveActivity]);

    const handleExportHtml = useCallback(() => {
        const activeActivities = activities.filter(a => a.isPostponed !== true);
    }, [activities]);

    const handleCloneActivity = useCallback(async (activityToClone: Activity) => {
        if (!currentUserEmail || !currentUserEmail.endsWith('@mdjescalejeunesse.ca')) {
            alert("Vous n'avez pas la permission de cloner une activité.");
            return;
        }

        const currentDate = new Date(activityToClone.date + 'T00:00:00');
        const nextWeek = new Date(currentDate);
        nextWeek.setDate(currentDate.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        // Sanitize for cloning: reset results and transactional data
        const clonedActivity: Activity = sanitizeActivityData({
            ...activityToClone,
            id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            date: nextWeekStr,
            status: 'draft',
            type: null, // Force re-selection
            rmjqDimensions: [], // Force re-selection
            youthInvolvement: { level: null, tasks: [] }, // Force re-selection
            stats: {
                presentMale: 0,
                presentFemale: 0,
                presentNonBinary: 0,
                newMembers: 0
            },
            documents: [],
            comments: [],
            checklist: (activityToClone.checklist || []).map(item => ({
                item: item.item,
                completed: false
            })),
            journal: "",
            consumptionValidated: false,
            materialReservations: [],
            lastEditedBy: currentUserEmail || null,
            createdByEmail: currentUserEmail || null,
        });

        const newEntry = {
            timestamp: Date.now(),
            userEmail: currentUserEmail || 'systeme@mdjescalejeunesse.ca',
            userName: getEmployeeName(currentUserEmail) || 'Inconnu',
            action: `Activité clonée depuis le ${activityToClone.date}`,
        };
        clonedActivity.changelog = [newEntry];

        try {
            await FirebaseService.save(clonedActivity);
            alert(`Activité clonée avec succès pour le ${nextWeekStr}`);
        } catch (error) {
            console.error("Error cloning activity:", error);
            alert("Erreur lors du clonage de l'activité.");
        }
    }, [currentUserEmail]);

    const handleQuickSpecialDay = useCallback(async (date: string, label: string) => {
        const existing = activities.find(a => a.date === date && a.title === label);

        if (!label.trim()) {
            if (existing) {
                await FirebaseService.delete(existing.id);
            }
            return;
        }

        const activityData: any = existing ? {
            ...existing,
            title: label,
            lastEditedBy: currentUserEmail
        } : {
            id: `special-${Date.now()}`,
            title: label,
            date,
            type: 'Journée spéciale',
            startTime: '08:00',
            endTime: '23:59',
            createdByEmail: currentUserEmail,
            description: 'Journée spéciale au calendrier.',
            rmjqDimensions: [],
            youthInvolvement: { level: 'Participation', tasks: [] },
            logistics: { venueName: 'MDJ', address: '', transportRequired: false },
        };

        const sanitized = sanitizeActivityData(activityData);
        await FirebaseService.save(sanitized);
    }, [activities, currentUserEmail]);

    const setConsumptionValidated = useCallback(async (activityId: string, isValidated: boolean) => {
        try {
            await FirebaseService.setActivityConsumptionValidated(activityId, isValidated);
        } catch (error) {
            console.error("Error setting consumption validated:", error);
            throw error;
        }
    }, []);

    const handleUpdateActivity = handleSaveActivity;

    return {
        activities,
        filteredActivities: actualFilteredActivities,
        isLoading,
        filters,
        setFilters,
        selectedActivity,
        setSelectedActivity,
        handleSaveActivity,
        handleUpdateActivity,
        handleCreateActivity,
        handleOpenNewActivity,
        handleDeleteActivity,
        handleDeleteActivityFromModal,
        draggedActivityId,
        handleDragStart,
        handleDrop,
        copiedActivity,
        handleCopyActivity,
        handlePasteActivity,
        handleExportHtml,
        setConsumptionValidated,
        handleCloneActivity,
        handleQuickSpecialDay,
    };
}
