
import { Activity, ActivityType } from "../types";
import { isAbsence } from "../lib/utils";

const AVATAR_MAP: Record<string, string> = {
  "Charles": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/charles-avatar-l039escale-jeunesse-la-piaule.png",
  "Charles Frenette": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/charles-avatar-l039escale-jeunesse-la-piaule.png",
  "Laurie": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/laurie-avatar-l039escale-jeunesse-la-piaule.png",
  "Laurie Bray Pratte": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/laurie-avatar-l039escale-jeunesse-la-piaule.png",
  "Mikael": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/mikael-avatar-l039escale-jeunesse-la-piaule.png",
  "Mikael Delage": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/mikael-avatar-l039escale-jeunesse-la-piaule.png",
  "Ann-Sophie": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/ann-so-avatar-l039escale-jeunesse-la-piaule.png",
  "Ann-Sophie (Stagiaire)": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/ann-so-avatar-l039escale-jeunesse-la-piaule.png",
  "Sébastien": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/sebastien-avatar-l039escale-jeunesse-la-piaule.png",
  "Sebastien": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/sebastien-avatar-l039escale-jeunesse-la-piaule.png",
  "Sébastien Johnson": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/sebastien-avatar-l039escale-jeunesse-la-piaule.png",
  "Pat": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/pat-avatar-l039escale-jeunesse-la-piaule.png",
  "Patrick": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/pat-avatar-l039escale-jeunesse-la-piaule.png",
  "Pat Delage": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/pat-avatar-l039escale-jeunesse-la-piaule.png",
  "Patrick Delage": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/pat-avatar-l039escale-jeunesse-la-piaule.png"
};


const TYPE_CONFIG: Record<string, { color: string; icon: string; defaultDescription: string }> = {
  [ActivityType.ACCUEIL]: { color: "blue-600", icon: "fa-house-chimney-user", defaultDescription: "Accueil chaleureux et écoute active." },
  [ActivityType.AIDE_DEVOIRS]: { color: "emerald-600", icon: "fa-book-open", defaultDescription: "Soutien scolaire et aide aux devoirs." },
  [ActivityType.ACCOMPAGNEMENT]: { color: "purple-600", icon: "fa-hand-holding-heart", defaultDescription: "Accompagnement personnalisé." },
  [ActivityType.INTERVENTION]: { color: "red-500", icon: "fa-shield-heart", defaultDescription: "Intervention et gestion de crise." },
  [ActivityType.ANIMATION]: { color: "yellow-500", icon: "fa-gamepad", defaultDescription: "Animation, sorties et activités." },
  [ActivityType.PREVENTION_INTERNE]: { color: "orange-500", icon: "fa-triangle-exclamation", defaultDescription: "Prévention et sensibilisation interne." },
  [ActivityType.PREVENTION_PARTENAIRE]: { color: "cyan-600", icon: "fa-handshake", defaultDescription: "Prévention en partenariat." },
  [ActivityType.VIE_ASSOCIATIVE]: { color: "indigo-500", icon: "fa-users-line", defaultDescription: "Vie associative et bénévolat jeunes." },
  [ActivityType.PROMOTION]: { color: "pink-500", icon: "fa-bullhorn", defaultDescription: "Promotion, concertation et gestion." }
};

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  backgroundImage: string;
  borderColor: string;
  cardBackground: string;
  badgeColor: string;
  badgeTextColor: string;
  titleFont: string;
  subtitleFont: string;
  subtitle: string;
}

const getThemeConfig = (themeName: string, date?: Date): ThemeConfig => {
  const normalizedTheme = themeName.toLowerCase().trim();
  const monthIndex = date ? date.getMonth() : new Date().getMonth();

  // Color wheel mapping for each month:
  // Jan: Red-Violet/Pink (0), Feb: Violet (1), Mar: Blue-Violet/Dark Blue (2), Apr: Blue (3),
  // May: Blue-Green (4), Jun: Green (5), Jul: Yellow-Green (6), Aug: Yellow (7),
  // Sep: Yellow-Orange (8), Oct: Orange (9), Nov: Red-Orange (10), Dec: Red (11)
  const colorWheel: Record<number, { primaryColor: string; secondaryColor: string; badgeColor: string; badgeTextColor: string }> = {
    0: { primaryColor: "#d946ef", secondaryColor: "#a21caf", badgeColor: "#c026d3", badgeTextColor: "white" },
    1: { primaryColor: "#8b5cf6", secondaryColor: "#5b21b6", badgeColor: "#7c3aed", badgeTextColor: "white" },
    2: { primaryColor: "#4338ca", secondaryColor: "#312e81", badgeColor: "#3730a3", badgeTextColor: "white" },
    3: { primaryColor: "#3b82f6", secondaryColor: "#1e3a8a", badgeColor: "#2563eb", badgeTextColor: "white" },
    4: { primaryColor: "#0d9488", secondaryColor: "#134e4a", badgeColor: "#0f766e", badgeTextColor: "white" },
    5: { primaryColor: "#22c55e", secondaryColor: "#14532d", badgeColor: "#16a34a", badgeTextColor: "white" },
    6: { primaryColor: "#84cc16", secondaryColor: "#3f6212", badgeColor: "#65a30d", badgeTextColor: "white" },
    7: { primaryColor: "#eab308", secondaryColor: "#a16207", badgeColor: "#ca8a04", badgeTextColor: "black" },
    8: { primaryColor: "#f59e0b", secondaryColor: "#78350f", badgeColor: "#d97706", badgeTextColor: "white" },
    9: { primaryColor: "#f97316", secondaryColor: "#7c2d12", badgeColor: "#ea580c", badgeTextColor: "white" },
    10: { primaryColor: "#ef4444", secondaryColor: "#7f1d1d", badgeColor: "#dc2626", badgeTextColor: "white" },
    11: { primaryColor: "#e11d48", secondaryColor: "#881337", badgeColor: "#be123c", badgeTextColor: "white" },
  };

  const monthColors = colorWheel[monthIndex];

  // Dynamic Theme based on the color wheel
  const defaultTheme: ThemeConfig = {
    primaryColor: monthColors.primaryColor,
    secondaryColor: monthColors.secondaryColor,
    accentColor: monthColors.primaryColor,
    backgroundColor: `${monthColors.primaryColor}10`, // very transparent bg
    backgroundImage: `radial-gradient(${monthColors.primaryColor}30 1px, transparent 1px)`,
    borderColor: monthColors.badgeColor,
    cardBackground: "rgba(255, 255, 255, 0.95)",
    badgeColor: monthColors.badgeColor,
    badgeTextColor: monthColors.badgeTextColor,
    titleFont: "'Pacifico', cursive",
    subtitleFont: "'Kalam', cursive",
    subtitle: monthIndex === 2 ? "Garde le cap !" : "Activités MDJ"
  };

  if (normalizedTheme.includes("noël") || normalizedTheme.includes("decembre") || normalizedTheme.includes("hiver")) {
    return {
      primaryColor: "#166534", // green-800
      secondaryColor: "#dc2626", // red-600
      accentColor: "#ef4444", // red-500
      backgroundColor: "#f0fdf4",
      backgroundImage: "radial-gradient(#bbf7d0 1px, transparent 1px)", // green-200 dots
      borderColor: "#15803d", // green-700
      cardBackground: "rgba(255, 255, 255, 0.95)",
      badgeColor: "#dc2626", // red-600
      badgeTextColor: "white",
      titleFont: "'Mountains of Christmas', cursive",
      subtitleFont: "'Mountains of Christmas', cursive",
      subtitle: "Joyeuses Fêtes !"
    };
  }

  if (normalizedTheme.includes("halloween") || normalizedTheme.includes("octobre")) {
    return {
      primaryColor: "#ea580c", // orange-600
      secondaryColor: "#000000",
      accentColor: "#f97316", // orange-500
      backgroundColor: "#fff7ed", // orange-50
      backgroundImage: "radial-gradient(#fdba74 1px, transparent 1px)",
      borderColor: "#ea580c", // orange-600
      cardBackground: "rgba(255, 255, 255, 0.95)",
      badgeColor: "#000000",
      badgeTextColor: "#fb923c", // orange-400
      titleFont: "'Creepster', cursive", // Need to import this font
      subtitleFont: "'Creepster', cursive",
      subtitle: "Frissons & Bonbons"
    };
  }

  if (normalizedTheme.includes("paques") || normalizedTheme.includes("pâques") || normalizedTheme.includes("avril")) {
    return {
      primaryColor: "#9333ea", // purple-600
      secondaryColor: "#d97706", // amber-600
      accentColor: "#fcd34d", // amber-300
      backgroundColor: "#fdf4ff", // purple-50
      backgroundImage: "radial-gradient(#e9d5ff 1px, transparent 1px)",
      borderColor: "#d8b4fe", // purple-300
      cardBackground: "rgba(255, 255, 255, 0.95)",
      badgeColor: "#9333ea",
      badgeTextColor: "white",
      titleFont: "'Fredoka One', cursive",
      subtitleFont: "'Fredoka One', cursive",
      subtitle: "Chasse aux coco !"
    };
  }

  if (normalizedTheme.includes("été") || normalizedTheme.includes("juillet") || normalizedTheme.includes("aout") || normalizedTheme.includes("août")) {
    return {
      primaryColor: "#0ea5e9", // sky-500
      secondaryColor: "#eab308", // yellow-500
      accentColor: "#38bdf8", // sky-400
      backgroundColor: "#f0f9ff", // sky-50
      backgroundImage: "radial-gradient(#bae6fd 1px, transparent 1px)",
      borderColor: "#0ea5e9",
      cardBackground: "rgba(255, 255, 255, 0.90)",
      badgeColor: "#eab308",
      badgeTextColor: "black",
      titleFont: "'Chewy', cursive",
      subtitleFont: "'Chewy', cursive",
      subtitle: "Soleil & Fun !"
    };
  }

  if (normalizedTheme.includes("rentrée") || normalizedTheme.includes("septembre")) {
    return {
      primaryColor: "#2563eb", // blue-600
      secondaryColor: "#dc2626", // red-600
      accentColor: "#facc15", // yellow-400
      backgroundColor: "#eff6ff",
      backgroundImage: "linear-gradient(#dbeafe 1px, transparent 1px), linear-gradient(90deg, #dbeafe 1px, transparent 1px)", // Graph paper like
      borderColor: "#2563eb",
      cardBackground: "rgba(255, 255, 255, 0.95)",
      badgeColor: "#2563eb",
      badgeTextColor: "white",
      titleFont: "'Schoolbell', cursive",
      subtitleFont: "'Schoolbell', cursive",
      subtitle: "C'est la rentrée !"
    };
  }

  // If the user provided a specific theme name but we don't have a preset, 
  // we use the default style but use their text as the subtitle provided it's not too long/weird.
  // Actually, let's just use the entered text as the subtitle if it's not empty, 
  // overriding the default subtitle.
  if (themeName && themeName.trim().length > 0) {
    return {
      ...defaultTheme,
      subtitle: themeName
    };
  }

  return defaultTheme;
};

/** Generates a short, punchy 5-7 word description for use in the HTML calendar card. */
const getPunchyDescription = (title: string, rawDescription?: string): string => {
  const t = title.toLowerCase();

  // Keyword-based punchy slogans
  const punchyMap: { keywords: string[]; slogan: string }[] = [
    { keywords: ['soirée libre', 'libre'], slogan: 'Temps libre, plaisir garanti !' },
    { keywords: ['pickleball'], slogan: 'Sport, adrénaline et bonne humeur !' },
    { keywords: ['pathfinder', 'banquet'], slogan: 'Aventure épique pour vrais héros !' },
    { keywords: ['cuisine', 'conserve', 'recette', 'culinaire'], slogan: 'Aux fourneaux, on régale tout le monde !' },
    { keywords: ['pâques', 'paques', 'oeufs'], slogan: 'Chasse aux œufs et surprises colorées !' },
    { keywords: ['parc', 'plein air', 'nature', 'randonnée', 'rivière', 'printanière'], slogan: 'Plein air et grands espaces vous attendent !' },
    { keywords: ['prévention', 'abus', 'sensibili'], slogan: 'Ensemble against contre ce qui nuit.' },
    { keywords: ['cyber', 'sécurité', 'internet', 'numérique'], slogan: 'Navigue en ligne, protège-toi !' },
    { keywords: ['cinéma', 'film', 'popcorn'], slogan: 'Lumières, caméra, action !' },
    { keywords: ['jeu', 'tournoi', 'jeux de société'], slogan: 'Stratégie, rires et compétition !' },
    { keywords: ['francophonie', 'musique', 'concert'], slogan: 'Célèbre la langue, la culture et la fierté !' },
    { keywords: ['saint-patrick', 'trèfle', 'déco', 'décoration'], slogan: 'Crée, décore et exprime ton talent !' },
    { keywords: ['financement', 'cannette', 'collecte', 'levée'], slogan: 'Chaque cannette compte, agis maintenant !' },
    { keywords: ['rassemblement', 'régional', 'bureau', 'circonscription', 'député'], slogan: 'Unis pour faire entendre notre voix !' },
    { keywords: ['grève', 'pancarte', 'manifestation', 'marche'], slogan: 'Descends dans la rue, fais la différence !' },
    { keywords: ['formation', 'faire', 'ressource', 'bénévolat'], slogan: 'Apprends, échange et grandis ensemble !' },
    { keywords: ['escape', 'cj', 'conseil', 'jeunes'], slogan: 'Ta voix compte, viens décider !' },
    { keywords: ['anna', 'mer', 'organisme', 'présentation'], slogan: 'Découvres un monde de possibilités !' },
    { keywords: ['halloween', 'costumes'], slogan: 'Frissons, costumes et bonbons !' },
    { keywords: ['noël', 'noel', 'réveillon'], slogan: 'Magie, joie et esprit des fêtes !' },
    { keywords: ['karaoké', 'karoke', 'chanson'], slogan: 'Micro en main, chante et profite !' },
  ];

  for (const entry of punchyMap) {
    if (entry.keywords.some(kw => t.includes(kw))) {
      return entry.slogan;
    }
  }

  // Fallback: first meaningful sentence, max 60 chars
  const clean = (rawDescription || '').trim().replace(/\s+/g, ' ');
  if (!clean) return 'Une activité à ne pas manquer !';
  const firstDot = clean.search(/[.!?]/);
  const sentence = firstDot > 0 ? clean.substring(0, firstDot + 1) : clean;
  if (sentence.length <= 65) return sentence;
  const cut = sentence.substring(0, 62);
  return cut.substring(0, cut.lastIndexOf(' ')) + '…';
};

export const HtmlGeneratorService = {

  generateCalendarHTML: (activities: Activity[], currentDate: Date, themeName: string = ""): string => {
    const theme = getThemeConfig(themeName, currentDate);
    const monthNames = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
    const monthName = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const currentMonthStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // ── School calendar special dates ──────────────────────────────────
    const SPECIAL_DATES: Record<string, { type: 'holiday' | 'pedagogical' | 'break', label: string }> = {
      '2026-02-09': { type: 'pedagogical', label: 'Pédago' },
      '2026-03-02': { type: 'break', label: 'Relâche' },
      '2026-03-03': { type: 'break', label: 'Relâche' },
      '2026-03-04': { type: 'break', label: 'Relâche' },
      '2026-03-05': { type: 'break', label: 'Relâche' },
      '2026-03-06': { type: 'break', label: 'Relâche' },
      '2026-03-23': { type: 'holiday', label: 'Grève' },
      '2026-03-24': { type: 'holiday', label: 'Grève' },
      '2026-03-25': { type: 'holiday', label: 'Grève' },
      '2026-03-26': { type: 'holiday', label: 'Grève' },
      '2026-03-27': { type: 'holiday', label: 'Grève' },
      '2026-03-30': { type: 'holiday', label: 'Grève' },
      '2026-03-31': { type: 'holiday', label: 'Grève' },
      '2026-04-01': { type: 'holiday', label: 'Grève' },
      '2026-04-02': { type: 'holiday', label: 'Grève' },
      '2026-04-03': { type: 'holiday', label: 'Vendredi Saint' },
      '2026-04-06': { type: 'holiday', label: 'Lundi Pâques' },
      '2026-05-18': { type: 'holiday', label: 'Patriotes' },
      '2026-06-24': { type: 'holiday', label: 'St-Jean' },
      '2026-07-01': { type: 'holiday', label: 'Confédération' },
      '2026-08-31': { type: 'pedagogical', label: 'Pédago' },
      '2026-09-07': { type: 'holiday', label: 'Fête Travail' },
      '2026-10-12': { type: 'holiday', label: 'Action Grâce' },
      '2026-11-20': { type: 'pedagogical', label: 'Pédago' },
      '2026-12-23': { type: 'break', label: 'Noël' },
      '2026-12-24': { type: 'break', label: 'Noël' },
      '2026-12-25': { type: 'holiday', label: 'Noël' },
      '2027-01-01': { type: 'holiday', label: 'Jour An' },
      '2027-03-01': { type: 'break', label: 'Relâche' },
      '2027-03-02': { type: 'break', label: 'Relâche' },
      '2027-03-03': { type: 'break', label: 'Relâche' },
      '2027-03-04': { type: 'break', label: 'Relâche' },
      '2027-03-05': { type: 'break', label: 'Relâche' },
      '2027-05-24': { type: 'holiday', label: 'Patriotes' },
    };

    const specialDateColors: Record<string, string> = {
      holiday: '#6366f1',    // indigo
      pedagogical: '#0ea5e9', // sky
      break: '#10b981',       // emerald
    };

    // ── Filter out absences and postponed activities ───────────────────
    const monthActivities = activities
      .filter(a => a.date.startsWith(currentMonthStr))
      .filter(a => !a.isPostponed)
      .filter(a => !isAbsence(a.title))
      .filter(a => !a.title.toLowerCase().includes('reporté') && !a.title.toLowerCase().includes('reporte') && !a.title.toLowerCase().includes('annulé'))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── Group activities by date (one card per day) ─────────────────────
    const byDate: Record<string, Activity[]> = {};
    monthActivities.forEach(act => {
      byDate[act.date] = byDate[act.date] ?? [];
      byDate[act.date].push(act);
    });

    const cardsHtml = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, acts]) => {
        const dateObj = new Date(date + 'T00:00:00');
        const dayNum = dateObj.getDate();
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const dayName = days[dateObj.getDay()];

        // ── Special date badge ───────────────────────────────────────────
        const specialDate = SPECIAL_DATES[date];
        const isStrike = specialDate?.label === 'Grève';

        // ── Strike Filtering ─────────────────────────────────────────────
        let currentActs = [...acts];
        const allOriginalStaff = [...new Set(acts.flatMap(a => [a.staffing?.leadStaff, ...(a.staffing?.supportStaff || [])]).filter(Boolean))];

        if (isStrike) {
          if (date === '2026-03-24') {
            currentActs = currentActs.filter(a => a.title.toLowerCase().includes('pancarte'));
          } else if (date === '2026-03-25') {
            currentActs = currentActs.filter(a => a.title.toLowerCase().includes('cuisine'));
          } else {
            currentActs = [];
          }

          // If empty, add a placeholder
          if (currentActs.length === 0) {
            currentActs.push({
              id: 'closed',
              title: "MDJ Fermée",
              type: 'Loisirs et divertissements' as any,
              description: "Le reste des activités est annulé.",
              budget: { estimatedCost: 0 },
              staffing: {
                leadStaff: allOriginalStaff[0] || '',
                supportStaff: allOriginalStaff.slice(1)
              }
            } as any);
          }
        }
        const specialBadgeHtml = specialDate
          ? `<div class="special-date-badge" style="background:${specialDateColors[specialDate.type]}15; border:1px solid ${specialDateColors[specialDate.type]}50; color:${specialDateColors[specialDate.type]};">
                          <i class="fa-solid ${specialDate.type === 'break' ? 'fa-umbrella-beach' : specialDate.type === 'pedagogical' ? 'fa-chalkboard-user' : 'fa-star'}" style="font-size:0.6rem; margin-right:3px;"></i>${specialDate.label}
                       </div>`
          : '';

        // ── One activity block per activity in this day ──────────────────
        const activityBlocksHtml = currentActs.map(act => {
          const config = (act.type && TYPE_CONFIG[act.type as ActivityType]) ? TYPE_CONFIG[act.type as ActivityType] : { color: "pink-500", icon: "fa-star", defaultDescription: "Activité spéciale !" };
          const isPaid = act.budget.estimatedCost > 0;

          let finalDescription = getPunchyDescription(act.title, act.description);

          let allStaff = [...new Set([act.staffing?.leadStaff, ...(act.staffing?.supportStaff || [])].filter(Boolean))];

          const avatarsHtml = allStaff.map((name) => {
            const url = AVATAR_MAP[name] || AVATAR_MAP[name.split(' ')[0]];
            if (!url) return '';
            const isMirror = name.toLowerCase().includes('ann') || name.toLowerCase().includes('pat');
            return `<img src="${url}" class="employee-icon ${isMirror ? 'mirror-image' : ''}" title="${name}" alt="${name}" data-fallback="${name.split(' ')[0]}">`;
          }).join('');

          return `
                <div style="margin-top:${acts.indexOf(act) > 0 ? '10px' : '0'}; padding-top:${acts.indexOf(act) > 0 ? '10px' : '0'}; border-top:${acts.indexOf(act) > 0 ? '1px dashed rgba(0,0,0,0.12)' : 'none'}; text-align:center; display:flex; flex-direction:column; align-items:center;">
                    <div style="margin-bottom:4px;">
                        <i class="fa-solid ${config.icon} fa-fw event-icon text-${config.color}"></i>
                    </div>
                    <h3 class="event-title" style="font-size:${currentActs.length > 1 ? '0.72rem' : '0.82rem'}; text-align:center;">${act.title}</h3>
                    <p class="event-details" style="font-size:${currentActs.length > 1 ? '0.62rem' : '0.70rem'}; text-align:center;">${finalDescription}</p>
                    <span class="event-cost bg-${config.color}">${isPaid ? 'Payant' : 'Gratuit'}</span>
                    <div class="avatars-container" style="margin-top:6px; justify-content:center; display:flex; flex-wrap:wrap;">${avatarsHtml}</div>
                </div>`;
        }).join('');

        return `
            <div class="event-card">
                <div style="position:relative; display:flex; flex-direction:column; align-items:center; height:100%; padding:14px; box-sizing:border-box;">
                    <!-- Top row: date | special badge | day — all absolutely positioned -->
                    <div class="date-badge">${dayNum}</div>
                    ${specialBadgeHtml ? `<div style="position:absolute; top:12px; left:50%; transform:translateX(-50%); z-index:10;">${specialBadgeHtml}</div>` : ''}
                    <div class="day-badge">${dayName}</div>
                    
                    ${currentActs.some(a => a.hasHomeworkHelp) ?
            `<div class="homework-indicator" style="display:flex; flex-direction:column; align-items:center;">
                        <i class="fa-solid fa-book-open homework-icon" title="Aide aux devoirs"></i>
                        <span style="font-size:0.5rem; color:#60a5fa; font-weight:700; margin-top:-2px;">Ouvert 16h30-17h30</span>
                      </div>` : ''
          }
                    <!-- Content zone: fills remaining space, centered -->
                    <div style="margin-top:72px; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; text-align:center;">
                        ${activityBlocksHtml}
                    </div>
                </div>
            </div>`;
      }).join('');


    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendrier MDJ - ${monthName} ${year}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800;900&family=Kalam:wght@400;700&family=Pacifico&family=Mountains+of+Christmas:wght@700&family=Creepster&family=Fredoka+One&family=Chewy&family=Schoolbell&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: ${theme.backgroundColor}; background-image: ${theme.backgroundImage}; background-size: 20px 20px; }
        .theme-font { font-family: ${theme.titleFont}; }
        .subtitle-font { font-family: ${theme.subtitleFont}; }
        .kalam { font-family: 'Kalam', cursive; }
        .event-card { background: ${theme.cardBackground}; border: 2px solid ${theme.borderColor}; border-radius: 1.5rem; display: flex; flex-direction: column; min-height: 350px; position: relative; break-inside: avoid; }
        .date-badge { position: absolute; top: 10px; left: 10px; background: ${theme.badgeColor}; color: ${theme.badgeTextColor}; border-radius: 12px; min-width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; border: 2px solid white; z-index: 10; }
        .day-badge { position: absolute; top: 10px; right: 10px; background: ${theme.badgeColor}; opacity: 0.9; color: ${theme.badgeTextColor}; border-radius: 8px; padding: 4px 10px; font-size: 0.8rem; font-weight: 800; border: 2px solid white; z-index: 10; font-family: 'Kalam', cursive; }
        .homework-icon { color: #60a5fa; font-size: 1.2rem; }
        .homework-indicator { position: absolute; top: 38px; left: 50%; transform: translateX(-50%); z-index: 5; }
        .event-icon { font-size: 2.8rem; }
        .event-title { font-size: 1.1rem; font-weight: 900; color: ${theme.secondaryColor}; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .event-details { font-size: 0.85rem; color: #4b5563; font-weight: 500; flex-grow: 1; margin: 0.5rem 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
        .event-cost { font-size: 0.8rem; font-weight: 800; color: white; padding: 4px 12px; border-radius: 99px; }
        .avatars-container { display: flex; justify-content: center; align-items: center; padding: 0.75rem; background: rgba(255, 255, 255, 0.5); border-top: 1px solid ${theme.borderColor}40; border-radius: 0 0 1.5rem 1.5rem; min-height: 80px; }
        .employee-icon { position: relative; width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.15); margin-left: -15px; background: white; color: transparent; text-align: center; }
        .employee-icon::before { content: attr(data-fallback); position: absolute; inset: 0; background: #f3f4f6; color: #374151; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border-radius: 50%; overflow: hidden; padding: 2px; line-height: 1.1; }
        .employee-icon:first-child { margin-left: 0; }
        .mirror-image { transform: scaleX(-1); }
        .special-date-badge { display: inline-flex; align-items: center; font-size: 0.65rem; font-weight: 700; border-radius: 99px; padding: 2px 8px; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .header-panel { background: white; border: 2px solid ${theme.borderColor}40; border-radius: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        @media print { 
            body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
            .header-panel { border: 1px solid #ddd; box-shadow: none; break-inside: avoid; } 
            .event-card { break-inside: avoid; page-break-inside: avoid; }
            @page { size: 11in 8.5in; margin: 0.4in; } 
        }
    </style>
</head>
<body class="p-6">
    <div class="max-w-7xl mx-auto">
        <!-- HEADER STYLE MDJ -->
        <div class="header-panel p-8 mb-8">
            <div class="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div class="w-full lg:w-1/4 flex justify-center lg:justify-start items-center">
                    <img src="https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/logo-du-planner-no-frame-l039escale-jeunesse-la-piaule.png" style="width: 280px !important; max-width: none !important; height: auto;" class="object-contain">
                </div>
                <div class="w-full lg:w-2/4 text-center">
                    <h1 class="text-7xl font-black mb-4 theme-font leading-none" style="color: ${theme.primaryColor}">${monthName}</h1>
                    <p class="text-2xl font-bold subtitle-font tracking-widest mt-2 uppercase" style="color: ${theme.secondaryColor}">${theme.subtitle}</p>
                    <div class="h-1 w-24 mx-auto my-4 rounded-full" style="background-color: ${theme.accentColor}"></div>
                    <div class="text-xs text-gray-700 font-bold space-y-1">
                        <p class="uppercase tracking-widest" style="color: ${theme.primaryColor}">SOLI - Le Complice de votre Mission Sociale</p>
                        <p>Maison des jeunes Escale Jeunesse - La Piaule</p>
                        <p>5225, rue de Courcelette, G8Y 4L4 | (819) 694-7564</p>
                        <p class="text-blue-500">16h30-17h30 : Devoirs | 17h30-21h00 : Activités</p>
                    </div>
                    <!-- LÉGENDE AIDE AUX DEVOIRS -->
                    <div class="mt-4 p-2 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center gap-3 text-[10px] leading-tight max-w-sm mx-auto shadow-sm">
                        <i class="fa-solid fa-book-open text-blue-500 text-sm"></i>
                        <p class="text-slate-600 text-center">
                            <span class="font-bold text-blue-600 uppercase">Aide aux devoirs :</span> <br/>
                            Ce service est maintenu malgré la grève, tous les soirs de semaine sauf le vendredi 27 mars.
                        </p>
                    </div>
                </div>
                <div class="w-full lg:w-1/4 flex justify-center lg:justify-end items-center">
                    <img src="https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/gemini-generated-image-xk6dh4xk6dh4xk6d-1-l039escale-jeunesse-la-piaule.png" style="width: 200px !important; height: auto;" class="drop-shadow-lg rounded-2xl">
                </div>
            </div>
        </div>

        <!-- GRID DES ÉVÉNEMENTS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${cardsHtml}
        </div>
    </div>
</body>
</html>`;
  },

  downloadHtml: (activities: Activity[], currentDate: Date, themeName?: string) => {
    const html = HtmlGeneratorService.generateCalendarHTML(activities, currentDate, themeName);
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const monthNames = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
    a.download = `Calendrier_MDJ_${monthNames[currentDate.getMonth()]}_${currentDate.getFullYear()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  generateActivityDetailHTML: (activity: Activity): string => {
    // (Reste inchangé pour la fiche technique)
    return `...`;
  },

  downloadActivityDetail: (activity: Activity) => {
    const html = HtmlGeneratorService.generateActivityDetailHTML(activity);
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
};
