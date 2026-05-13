import { TEAM_DIRECTORY } from './lib/constants';

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
const absentNames = absencesToday.map((a) => {
    const match = a.title.match(/^(?:absence|vacances?|cong[eé]s?)\s*(?:-|:)?\s*(.+)$/i);
    return match ? match[1].trim().toLowerCase() : '';
});

const output = Object.keys(TEAM_DIRECTORY).filter((name: string) => {
    const nameLower = name.toLowerCase();
    return !absentNames.some((absent: string) => absent && absent.length >= 2 && (nameLower.includes(absent) || absent.includes(nameLower)));
});

console.log("FINAL OUTPUT SIZE LEAD STAFF:", output.length);
console.log("OUTPUT LEAD STAFF:", output);
