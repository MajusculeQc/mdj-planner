import { Activity } from '../types';
import { isAbsence } from './utils';

/** Returns the conflict status for assigning a staff member to an activity. */
export type ConflictStatus = 'DUPLICATE' | 'MULTI_BLOCK' | 'CLEAN';

/**
 * Checks if assigning `staffName` to `targetActivityId` causes a conflict.
 * - DUPLICATE: The staff member is already assigned to this exact activity (lead or support).
 * - MULTI_BLOCK: The staff member is assigned to a DIFFERENT activity on the same date.
 * - CLEAN: No conflict.
 */
export function checkStaffConflict(
    staffName: string,
    targetActivityId: string,
    targetDate: string,
    allActivities: Activity[],
): ConflictStatus {
    if (!staffName || !targetActivityId || !targetDate) return 'CLEAN';

    const targetActivity = allActivities.find(a => a.id === targetActivityId);
    if (!targetActivity) return 'CLEAN';

    // Hard constraint: already assigned to THIS activity
    const isLeadOnThis = targetActivity.staffing.leadStaff === staffName;
    const isSupportOnThis = targetActivity.staffing.supportStaff.includes(staffName);
    if (isLeadOnThis || isSupportOnThis) return 'DUPLICATE';

    // Soft constraint: on a different ACTIVE activity the same day (excludes postponed & absences)
    const otherActivitiesSameDay = allActivities.filter(
        a => a.id !== targetActivityId &&
            a.date === targetDate &&
            !a.isPostponed &&
            !isAbsence(a.title),
    );

    const isOnSameDay = otherActivitiesSameDay.some(
        a => a.staffing.leadStaff === staffName || a.staffing.supportStaff.includes(staffName),
    );

    return isOnSameDay ? 'MULTI_BLOCK' : 'CLEAN';
}

/** Returns the list of other ACTIVE activities (same day, different activity) that the staff is already on. */
export function getConflictingActivities(
    staffName: string,
    targetActivityId: string,
    targetDate: string,
    allActivities: Activity[],
): Activity[] {
    return allActivities.filter(
        a => a.id !== targetActivityId &&
            a.date === targetDate &&
            !a.isPostponed &&
            !isAbsence(a.title) &&
            (a.staffing.leadStaff === staffName || a.staffing.supportStaff.includes(staffName)),
    );
}
