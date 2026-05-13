/**
 * Configuration for special days (holidays, pedagogical days, breaks).
 */
export const SPECIAL_DATES: Record<string, { type: 'holiday' | 'pedagogical' | 'break', label: string }> = {
    // --- 2025-2026 ---
    '2026-02-09': { type: 'pedagogical', label: 'Pédago' },
    '2026-03-02': { type: 'break', label: 'Relâche' },
    '2026-03-03': { type: 'break', label: 'Relâche' },
    '2026-03-04': { type: 'break', label: 'Relâche' },
    '2026-03-05': { type: 'break', label: 'Relâche' },
    '2026-03-06': { type: 'break', label: 'Relâche' },
    '2026-03-24': { type: 'pedagogical', label: 'Pédago' },
    '2026-04-03': { type: 'holiday', label: 'Vendredi Saint' },
    '2026-04-06': { type: 'holiday', label: 'Lundi Pâques' },
    '2026-05-15': { type: 'pedagogical', label: 'Pédago' },
    '2026-05-18': { type: 'holiday', label: 'Patriotes' },
    '2026-06-24': { type: 'holiday', label: 'St-Jean' },
    '2026-06-25': { type: 'pedagogical', label: 'Pédago' },
    '2026-06-26': { type: 'pedagogical', label: 'Pédago' },
    '2026-07-01': { type: 'holiday', label: 'Confédération' },
    '2026-08-31': { type: 'pedagogical', label: 'Pédago' },
    '2026-09-07': { type: 'holiday', label: 'Fête Travail' },
    '2026-10-12': { type: 'holiday', label: 'Action Grâce' },
    '2026-11-20': { type: 'pedagogical', label: 'Pédago' },
    '2026-12-23': { type: 'break', label: 'Noël' },
    '2026-12-24': { type: 'break', label: 'Noël' },
    '2026-12-25': { type: 'holiday', label: 'Noël' },
    '2026-12-28': { type: 'break', label: 'Fêtes' },
    '2026-12-29': { type: 'break', label: 'Fêtes' },
    '2026-12-30': { type: 'break', label: 'Fêtes' },
    '2026-12-31': { type: 'break', label: 'Fêtes' },

    // --- 2026-2027 ---
    '2027-01-01': { type: 'holiday', label: 'Jour An' },
    '2027-01-04': { type: 'pedagogical', label: 'Pédago' },
    '2027-03-01': { type: 'break', label: 'Relâche' },
    '2027-03-02': { type: 'break', label: 'Relâche' },
    '2027-03-03': { type: 'break', label: 'Relâche' },
    '2027-03-04': { type: 'break', label: 'Relâche' },
    '2027-03-05': { type: 'break', label: 'Relâche' },
    '2027-03-26': { type: 'holiday', label: 'Vendredi Saint' },
    '2027-03-29': { type: 'holiday', label: 'Lundi Pâques' },
    '2027-04-09': { type: 'pedagogical', label: 'Pédago' },
    '2027-05-07': { type: 'pedagogical', label: 'Pédago' },
    '2027-05-24': { type: 'holiday', label: 'Patriotes' },
    '2027-06-04': { type: 'pedagogical', label: 'Pédago' },
    '2027-06-24': { type: 'holiday', label: 'St-Jean' },
};

export const getSpecialDay = (date: string) => {
    if (SPECIAL_DATES[date]) return SPECIAL_DATES[date];
    // --- Summer Vacation Ranges ---
    if (date >= '2026-06-24' && date <= '2026-08-30') return { type: 'break', label: 'Été' };
    if (date >= '2027-06-24' && date <= '2027-08-27') return { type: 'break', label: 'Été' };
    return null;
};

export const getDynamicSpecialDay = (date: string, activities: any[]) => {
    // Check hardcoded constants first
    const hardcoded = getSpecialDay(date);
    if (hardcoded) return hardcoded;

    // Check custom activities
    const specialActivity = activities.find(a => a.date === date && a.type === 'Journée spéciale');
    if (specialActivity) {
        let sType: 'holiday' | 'pedagogical' | 'break' = 'break';
        const tLower = specialActivity.title.toLowerCase();
        if (tLower.includes('pédago')) sType = 'pedagogical';
        else if (tLower.includes('grève') || tLower.includes('férié') || tLower.includes('congé') || tLower.includes('saint')) sType = 'holiday';

        // Keep label short
        let label = specialActivity.title;
        if (label.length > 15) label = label.substring(0, 15) + '...';

        return { type: sType, label };
    }

    return null;
};
