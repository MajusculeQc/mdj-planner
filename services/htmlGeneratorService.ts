
import { Activity, ActivityType } from "../types";

const AVATAR_MAP: Record<string, string> = {
  "Charles": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/charles-avatar-l039escale-jeunesse-la-piaule.png",
  "Charles Frenette": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/charles-avatar-l039escale-jeunesse-la-piaule.png",
  "Laurie": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/laurie-avatar-l039escale-jeunesse-la-piaule.png",
  "Laurie Bray Pratte": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/laurie-avatar-l039escale-jeunesse-la-piaule.png",
  "Mikael": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/mikael-avatar-l039escale-jeunesse-la-piaule.png",
  "Mikael Delage": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/mikael-avatar-l039escale-jeunesse-la-piaule.png",
  "Ann-Sushi": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/ann-so-avatar-l039escale-jeunesse-la-piaule.png",
  "Ann-Sushi (Stagiaire)": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/ann-so-avatar-l039escale-jeunesse-la-piaule.png",
  "Ann-So": "https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/ann-so-avatar-l039escale-jeunesse-la-piaule.png"
};

const TYPE_CONFIG: Record<ActivityType, { color: string; icon: string }> = {
  [ActivityType.SAINES_HABITUDES]: { color: "blue-600", icon: "fa-heart-pulse" },
  [ActivityType.VIE_ASSOCIATIVE]: { color: "purple-700", icon: "fa-users-line" },
  [ActivityType.PREVENTION]: { color: "orange-500", icon: "fa-shield-heart" },
  [ActivityType.CULTURELLE]: { color: "red-500", icon: "fa-palette" },
  [ActivityType.LOISIRS]: { color: "yellow-500", icon: "fa-gamepad" }
};

export const HtmlGeneratorService = {

  generateCalendarHTML: (activities: Activity[], currentDate: Date): string => {
    const monthNames = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
    const monthName = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const currentMonthStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const monthActivities = activities
      .filter(a => a.date.startsWith(currentMonthStr))
      .sort((a, b) => a.date.localeCompare(b.date));

    const cardsHtml = monthActivities.map(act => {
      const dateObj = new Date(act.date + 'T00:00:00'); 
      const dayNum = dateObj.getDate();
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const dayName = days[dateObj.getDay()];
      
      const config = TYPE_CONFIG[act.type] || { color: "pink-500", icon: "fa-star" };
      const isPaid = act.budget.estimatedCost > 0;
      
      const allStaff = [act.staffing.leadStaff, ...act.staffing.supportStaff].filter(Boolean);
      const avatarsHtml = allStaff.map((name) => {
         const url = AVATAR_MAP[name] || AVATAR_MAP[name.split(' ')[0]];
         if (!url) return '';
         const isMirror = name.toLowerCase().includes('ann');
         return `<img src="${url}" class="employee-icon ${isMirror ? 'mirror-image' : ''}" title="${name}">`;
      }).join('');

      return `
            <div class="event-card">
                <div class="p-4 text-center event-content flex flex-col items-center h-full">
                    <div class="date-badge">${dayNum}</div>
                    <div class="day-badge">${dayName}</div>
                    
                    ${dayName !== 'Vendredi' && dayName !== 'Samedi' ? 
                      `<div class="homework-indicator"><i class="fa-solid fa-book-open homework-icon" title="Aide aux devoirs"></i></div>` : ''}
                    
                    <div class="mt-8">
                        <i class="fa-solid ${config.icon} fa-fw event-icon text-${config.color}"></i>
                    </div>
                    
                    <h3 class="event-title mt-2">${act.title}</h3>
                    <p class="event-details">${act.description.substring(0, 50)}...</p>
                    
                    <span class="event-cost bg-${config.color}">${isPaid ? 'Payant' : 'Gratuit'}</span>
                </div>
                <div class="avatars-container">
                    ${avatarsHtml}
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
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800;900&family=Kalam:wght@400;700&family=Pacifico&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #FFF0F5; background-image: radial-gradient(#fbcfe8 1px, transparent 1px); background-size: 20px 20px; }
        .love-font { font-family: 'Pacifico', cursive; }
        .kalam { font-family: 'Kalam', cursive; }
        .event-card { background: rgba(255, 255, 255, 0.95); border: 2px solid #ec4899; border-radius: 1.5rem; display: flex; flex-direction: column; min-height: 350px; position: relative; break-inside: avoid; }
        .date-badge { position: absolute; top: 10px; left: 10px; background: #be185d; color: white; border-radius: 12px; min-width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; border: 2px solid white; z-index: 10; }
        .day-badge { position: absolute; top: 10px; right: 10px; background: #831843; color: white; border-radius: 8px; padding: 4px 10px; font-size: 0.8rem; font-weight: 800; border: 2px solid white; z-index: 10; font-family: 'Kalam', cursive; }
        .homework-icon { color: #60a5fa; font-size: 1.2rem; }
        .homework-indicator { position: absolute; top: 55px; left: 15px; }
        .event-icon { font-size: 2.8rem; }
        .event-title { font-size: 1.1rem; font-weight: 900; color: #831843; line-height: 1.2; }
        .event-details { font-size: 0.85rem; color: #4b5563; font-weight: 500; flex-grow: 1; margin: 0.5rem 0; }
        .event-cost { font-size: 0.8rem; font-weight: 800; color: white; padding: 4px 12px; border-radius: 99px; }
        .avatars-container { display: flex; justify-content: center; align-items: center; padding: 0.75rem; background: rgba(253, 230, 237, 0.6); border-top: 1px solid #fbcfe8; border-radius: 0 0 1.5rem 1.5rem; min-height: 80px; }
        .employee-icon { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.15); margin-left: -15px; background: white; }
        .employee-icon:first-child { margin-left: 0; }
        .mirror-image { transform: scaleX(-1); }
        .header-panel { background: white; border: 2px solid #fce7f3; border-radius: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        @media print { body { background: white; } .header-panel { border: 1px solid #ddd; } @page { margin: 1cm; size: landscape; } }
    </style>
</head>
<body class="p-6">
    <div class="max-w-7xl mx-auto">
        <!-- HEADER STYLE MDJ -->
        <div class="header-panel p-8 mb-8">
            <div class="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div class="w-full lg:w-1/4 flex justify-center lg:justify-start">
                    <div class="bg-white p-3 rounded-2xl shadow-md border border-pink-100">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://forms.office.com/r/K4evdFFNBe" class="w-32 h-32">
                        <p class="text-[9px] text-center font-black text-pink-500 mt-2 uppercase tracking-tighter">Scanner pour s'inscrire</p>
                    </div>
                </div>
                <div class="w-full lg:w-2/4 text-center">
                    <h1 class="text-7xl font-black text-pink-700 love-font leading-none">${monthName}</h1>
                    <p class="text-2xl font-bold kalam text-pink-800 tracking-widest mt-2 uppercase">Arts & Amour</p>
                    <div class="h-1 w-24 bg-pink-400 mx-auto my-4 rounded-full"></div>
                    <div class="text-xs text-gray-700 font-bold space-y-1">
                        <p class="uppercase tracking-widest text-pink-600">Maison des jeunes Escale Jeunesse - La Piaule</p>
                        <p>5225, rue de Courcelette, G8Y 4L4 | (819) 694-7564</p>
                        <p class="text-blue-500">16h30-17h30 : Devoirs | 17h30-21h00 : Activités</p>
                    </div>
                </div>
                <div class="w-full lg:w-1/4 flex justify-center lg:justify-end">
                    <img src="https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/mdj-logo-fevrier-transparence-l039escale-jeunesse-la-piaule.png" class="w-56 h-auto drop-shadow-lg">
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

  downloadHtml: (activities: Activity[], currentDate: Date) => {
    const html = HtmlGeneratorService.generateCalendarHTML(activities, currentDate);
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
