import { STAFF_LIST, SUPPORT_STAFF_EXTRAS, TEAM_DIRECTORY } from './lib/constants';

const DEFAULT_SUPPORT_STAFF = [
    ...STAFF_LIST,
    ...SUPPORT_STAFF_EXTRAS,
];

console.log("DEFAULT_SUPPORT_STAFF size:", DEFAULT_SUPPORT_STAFF.length);
console.log("TEAM_DIRECTORY keys size:", Object.keys(TEAM_DIRECTORY).length);

const isAbsence = (title: string) => {
    if (!title) return false;
    const t = title.toUpperCase();
    return t.startsWith('ABSENCE') || t.startsWith('VACANCE') || t.startsWith('CONGÉ') || t.startsWith('CONGE');
};

const allActivities = [
    { title: 'Vacances - Pat', date: '2026-03-06' }
];

const activityDate = '2026-03-06';

const absencesToday = allActivities.filter((a) => a.date === activityDate && isAbsence(a.title));
console.log("Absences today:", absencesToday);

const absentNames = absencesToday.map((a) => {
    const match = a.title.match(/^(?:absence|vacances?|cong[eé]s?)\s*(?:-|:)?\s*(.+)$/i);
    return match ? match[1].trim().toLowerCase() : '';
});
console.log("Absent names extracted:", absentNames);

const output = DEFAULT_SUPPORT_STAFF.filter((name: string) => {
    const nameLower = name.toLowerCase();
    return !absentNames.some((absent: string) => absent && absent.length >= 2 && (nameLower.includes(absent) || absent.includes(nameLower)));
});

console.log("FINAL OUTPUT SIZE:", output.length);
console.log("OUTPUT:", output);
