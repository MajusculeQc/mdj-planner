const titles = [
    "Vacances",
    "Congés",
    "Absence",
    "Vacances ",
    "Congé",
    "Congés de la relâche",
    "Absence Pat"
];

titles.forEach(title => {
    const match = title.match(/^(?:absence|vacances?|cong[eé]s?)\s*(?:-|:)?\s*(.+)$/i);
    const extracted = match ? match[1].trim().toLowerCase() : '';
    console.log(`Title: "${title}" -> Extracted: "${extracted}", Length: ${extracted.length}`);
});
