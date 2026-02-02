
import { Activity, ActivityType } from "../types";

// Mapping des avatars selon les noms utilisés dans l'application
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

// Configuration des styles par type d'activité (Couleurs + Icônes)
const TYPE_CONFIG: Record<ActivityType, { color: string; icon: string }> = {
  [ActivityType.SAINES_HABITUDES]: { color: "bg-blue-600", icon: "fa-heart-pulse" },
  [ActivityType.VIE_ASSOCIATIVE]: { color: "bg-purple-700", icon: "fa-users-line" },
  [ActivityType.PREVENTION]: { color: "bg-orange-500", icon: "fa-shield-heart" },
  [ActivityType.CULTURELLE]: { color: "bg-red-500", icon: "fa-palette" },
  [ActivityType.LOISIRS]: { color: "bg-yellow-500", icon: "fa-gamepad" }
};

// Helper pour obtenir la configuration d'une activité
const getActivityConfig = (act: Activity) => {
  // Overrides spécifiques basés sur le titre ou le contexte comme dans l'exemple HTML
  if (act.title.toLowerCase().includes("randonnée")) return { color: "bg-blue-600", icon: "fa-person-walking" };
  if (act.title.toLowerCase().includes("camping")) return { color: "bg-orange-500", icon: "fa-campground" };
  if (act.title.toLowerCase().includes("justice")) return { color: "bg-orange-500", icon: "fa-user-shield" };
  if (act.title.toLowerCase().includes("sexuelle")) return { color: "bg-orange-500", icon: "fa-hands-holding-child" };
  if (act.title.toLowerCase().includes("autochtone")) return { color: "bg-purple-600", icon: "fa-feather" };
  if (act.title.toLowerCase().includes("banquet")) return { color: "bg-yellow-500", icon: "fa-dragon" };
  
  // Default mapping
  return TYPE_CONFIG[act.type] || { color: "bg-gray-500", icon: "fa-calendar" };
};

export const HtmlGeneratorService = {

  generateCalendarHTML: (activities: Activity[], currentDate: Date): string => {
    const monthNames = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
    const monthName = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const currentMonthStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Filtrer et trier les activités du mois
    const monthActivities = activities
      .filter(a => a.date.startsWith(currentMonthStr))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Génération des cartes
    const cardsHtml = monthActivities.map(act => {
      const dateObj = new Date(act.date + 'T00:00:00'); // Force local
      const dayNum = dateObj.getDate();
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const dayName = days[dateObj.getDay()];
      
      const config = getActivityConfig(act);
      const isPaid = act.budget.estimatedCost > 0 || act.budget.items.some(i => i.amount > 0);
      const costLabel = isPaid ? "Payant" : "Gratuit";
      
      // Extraction du staff pour les avatars
      const allStaff = [act.staffing.leadStaff, ...act.staffing.supportStaff].filter(Boolean);
      
      const avatarsHtml = allStaff.map((name, index) => {
         const url = AVATAR_MAP[name] || AVATAR_MAP[name.split(' ')[0]]; // Try full name, then first name
         if (!url) return '';
         const isMirror = name.toLowerCase().includes('ann'); // Mirror Ann-Sushi as in example
         return `<img src="${url}" class="employee-icon ${isMirror ? 'mirror-image' : ''}" title="${name}">`;
      }).join('');

      return `
            <div class="event-card">
                <div class="p-4 text-center event-content flex flex-col items-center h-full">
                    <div class="date-badge ${config.color}">${dayNum}</div>
                    <div class="day-badge">${dayName}</div>
                    
                    ${dayName !== 'Vendredi' && dayName !== 'Samedi' ? 
                      `<div class="homework-indicator"><i class="fa-solid fa-book-open homework-icon" title="Aide aux devoirs"></i></div>` : ''}
                    
                    <div class="mt-8 flex gap-2 justify-center items-center">
                        <i class="fa-solid ${config.icon} fa-fw event-icon ${config.color.replace('bg-', 'text-')}"></i>
                    </div>
                    
                    <h3 class="event-title mt-2">${act.title}</h3>
                    <p class="event-details">${act.description.substring(0, 45)}${act.description.length > 45 ? '...' : ''}</p>
                    
                    <span class="event-cost ${config.color}">${costLabel}</span>
                </div>
                <div class="avatars-container">
                    ${avatarsHtml}
                </div>
            </div>`;
    }).join('');

    // Template complet
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendrier MDJ - ${monthName} ${year}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;900&family=Kalam:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #F8FAFC;
            background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
            background-size: 20px 20px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .event-card {
            background-color: #FFFFFF;
            border: 1px solid #cbd5e1;
            transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            min-height: 320px;
            border-radius: 1rem;
            overflow: visible; 
            break-inside: avoid;
            page-break-inside: avoid;
        }
        .event-card:hover {
            transform: scale(1.03);
            z-index: 50;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-color: #3b82f6;
        }
        .date-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            border-radius: 8px;
            min-width: 40px;
            height: 40px;
            padding: 0 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            font-weight: 800;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 5;
            border: 2px solid white;
        }
        .day-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #1e293b;
            color: white;
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 0.85rem;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 5;
            border: 2px solid white;
        }
        .event-icon { font-size: 2.5rem; margin: 0.5rem 0; }
        .homework-indicator { position: absolute; top: 50px; left: 15px; }
        .homework-icon { font-size: 1.2rem; color: #60a5fa; }
        .event-title { font-size: 1.1rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.25rem; color: #1e293b; }
        .event-details { font-size: 0.9rem; font-weight: 500; color: #64748b; margin-bottom: 0.5rem; flex-grow: 1; }
        .event-cost { font-size: 0.85rem; font-weight: 600; padding: 4px 12px; border-radius: 99px; color: white; margin-top: auto; margin-bottom: 0.5rem; }
        .employee-icon { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-left: -15px; background-color: white; border: 2px solid white; }
        .employee-icon:first-child { margin-left: 0; }
        .mirror-image { transform: scaleX(-1); }
        .avatars-container { display: flex; justify-content: center; align-items: center; padding: 0.75rem; background-color: #f8fafc; border-top: 1px solid #e2e8f0; min-height: 80px; border-radius: 0 0 1rem 1rem; }
        .header-panel { background-color: #FFFFFF; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        @media print {
            body { background: white; margin: 0; padding: 0; }
            .header-panel, .glass-panel { box-shadow: none; border: 1px solid #ddd; }
            .no-print { display: none !important; }
            @page { margin: 0.5cm; size: letter landscape; }
        }
    </style>
</head>
<body class="p-4">
    <div class="max-w-7xl mx-auto">
        <!-- HEADER -->
        <div class="mb-6 header-panel p-6 rounded-2xl relative">
            <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div class="w-full lg:w-1/4 flex justify-center lg:justify-start order-1">
                    <img src="https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/logomdj-l039escale-jeunesse-la-piaule.webp" alt="Logo MDJ" class="w-32 h-32 object-contain">
                </div>
                <div class="w-full lg:w-2/4 flex flex-col items-center text-center order-2">
                    <h1 class="text-6xl font-black text-gray-800 tracking-tight leading-none mb-4">${monthName}</h1>
                    <div class="w-16 h-1 bg-blue-500 rounded-full mb-4"></div>
                    <div class="text-sm text-gray-600 space-y-1">
                        <p class="font-bold text-blue-900 uppercase">Maison des jeunes Escale Jeunesse - La Piaule</p>
                        <p>5225, rue de Courcelette, G8Y 4L4</p>
                        <p class="font-semibold text-blue-600">(819) 694-7564 • info@mdjescalejeunesse.ca</p>
                    </div>
                </div>
                <div class="w-full lg:w-1/4 flex justify-center lg:justify-end order-3">
                    <img src="https://mdjvercheres.org/wp-content/uploads/2023/12/L_RMJQ-MembreOfficiel_MaisonOUTL_K.png" alt="RMJQ" class="h-24 w-auto object-contain">
                </div>
            </div>
        </div>

        <!-- LÉGENDE -->
        <div class="mb-6 bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
             <div class="flex flex-wrap justify-center gap-3 text-xs font-bold text-gray-600 uppercase">
                <div class="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-200"><span class="w-3 h-3 rounded-full bg-blue-600 mr-2"></span>Saines habitudes</div>
                <div class="flex items-center bg-purple-50 px-3 py-1 rounded-full border border-purple-200"><span class="w-3 h-3 rounded-full bg-purple-600 mr-2"></span>Vie associative</div>
                <div class="flex items-center bg-orange-50 px-3 py-1 rounded-full border border-orange-200"><span class="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>Prévention</div>
                <div class="flex items-center bg-red-50 px-3 py-1 rounded-full border border-red-200"><span class="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Culture & Art</div>
                <div class="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200"><span class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>Loisirs</div>
            </div>
        </div>

        <!-- GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      // Calcul du score et couleur
      const score = activity.preparationScore;
      let scoreColor = "#FF7A59";
      if (score >= 80) scoreColor = "#00FFFF";
      else if (score >= 40) scoreColor = "#FFFF00";
      
      const config = getActivityConfig(activity);
      
      return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche Activité - ${activity.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Montserrat:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
      @page { size: letter; margin: 0.5in; }
      body { font-family: 'Montserrat', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; color: #1e293b; font-size: 11px; }
      .header { background: #0f172a; color: white; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1rem; position: relative; overflow: hidden; }
      .header h1 { font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem; font-weight: 700; }
      .section-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-transform: uppercase; font-size: 0.9rem; margin-bottom: 0.5rem; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem; }
      .box { border: 1px solid #cbd5e1; border-radius: 0.5rem; padding: 0.75rem; background: #fff; height: 100%; box-shadow: 0 1px 2px rgba(0,0,0,0.05); page-break-inside: avoid; }
      .checklist-item { display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.4rem; page-break-inside: avoid; }
      .checkbox { width: 14px; height: 14px; border: 1px solid #64748b; border-radius: 2px; flex-shrink: 0; margin-top: 2px; }
      .tag { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; color: #475569; border: 1px solid #e2e8f0; }
      table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
      th { text-align: left; background: #f8fafc; padding: 4px; border-bottom: 1px solid #cbd5e1; font-weight: 600; }
      td { padding: 4px; border-bottom: 1px solid #e2e8f0; }
      .alert-box { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; padding: 0.5rem; border-radius: 0.5rem; }
      .success-box { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 0.5rem; border-radius: 0.5rem; }
      .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
      .footer-notes { border: 2px dashed #cbd5e1; border-radius: 0.5rem; height: 100px; padding: 0.5rem; color: #94a3b8; font-style: italic; }
      .score-circle { width: 40px; height: 40px; border-radius: 50%; background: ${scoreColor}; color: #0f172a; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
  </style>
</head>
<body>

  <!-- EN-TÊTE -->
  <div class="header">
      <div class="flex justify-between items-start relative z-10">
          <div>
              <div class="text-xs uppercase tracking-widest opacity-80 mb-1">Fiche Activité / Cahier des charges</div>
              <h1>${activity.title}</h1>
              <div class="flex items-center gap-4 mt-2 text-sm font-medium">
                  <span class="flex items-center gap-2"><i class="fa-regular fa-calendar"></i> ${activity.date}</span>
                  <span class="flex items-center gap-2"><i class="fa-regular fa-clock"></i> ${activity.startTime} - ${activity.endTime}</span>
                  <span class="bg-white/20 px-2 py-0.5 rounded text-xs uppercase">${activity.type}</span>
              </div>
          </div>
          <div class="flex flex-col items-center gap-1">
               <div class="score-circle">${score}%</div>
               <span class="text-[0.6rem] uppercase font-bold opacity-80">Prêt</span>
          </div>
      </div>
  </div>

  <div class="grid grid-cols-12 gap-4 mb-4">
      
      <!-- LOGISTIQUE & TRANSPORT -->
      <div class="col-span-5 flex flex-col gap-4">
          <div class="box">
              <h3 class="section-title"><i class="fa-solid fa-map-location-dot"></i> Logistique & Transport</h3>
              <div class="space-y-3">
                  <div>
                      <div class="font-bold text-xs text-slate-500 uppercase">Lieu</div>
                      <div class="text-sm font-bold">${activity.logistics.venueName}</div>
                      <div class="text-xs text-slate-600">${activity.logistics.address}</div>
                  </div>
                  <div class="info-grid">
                      <div>
                          <div class="font-bold text-xs text-slate-500 uppercase">Contact Lieu</div>
                          <div class="text-xs">${activity.logistics.phoneNumber || '-'}</div>
                      </div>
                       <div>
                          <div class="font-bold text-xs text-slate-500 uppercase">Distance</div>
                          <div class="text-xs">${activity.logistics.distance || 'Sur place'}</div>
                      </div>
                  </div>
                  
                  ${activity.logistics.transportRequired ? `
                  <div class="alert-box">
                      <div class="flex items-center gap-2 font-bold mb-1 text-xs uppercase"><i class="fa-solid fa-bus"></i> Transport Requis</div>
                      <div class="grid grid-cols-2 gap-2 text-xs">
                          <div><span class="font-bold">Départ:</span> ${activity.logistics.departureTime}</div>
                          <div><span class="font-bold">Retour:</span> ${activity.logistics.returnTime}</div>
                          <div class="col-span-2"><span class="font-bold">Mode:</span> ${activity.logistics.transportMode || 'Non spécifié'}</div>
                      </div>
                  </div>` : `
                  <div class="success-box text-xs flex items-center gap-2">
                      <i class="fa-solid fa-person-walking"></i> Aucun transport nécessaire
                  </div>`}
              </div>
          </div>
      </div>

      <!-- PÉDAGOGIE & JEUNES -->
      <div class="col-span-7 flex flex-col gap-4">
          <div class="box">
              <h3 class="section-title"><i class="fa-solid fa-hands-holding-circle"></i> Pédagogie & Encadrement</h3>
              
              <div class="mb-3">
                  <div class="font-bold text-xs text-slate-500 uppercase mb-1">Description</div>
                  <p class="text-xs leading-relaxed italic text-slate-700">"${activity.description}"</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                  <div>
                      <div class="font-bold text-xs text-slate-500 uppercase mb-1">Objectifs</div>
                      ${activity.objectives.map(o => `
                          <div class="checklist-item text-xs">
                              <div class="checkbox"></div>
                              <span>${o}</span>
                          </div>
                      `).join('')}
                  </div>
                  <div>
                      <div class="font-bold text-xs text-slate-500 uppercase mb-1">Tâches Jeunes (${activity.youthInvolvement.level})</div>
                       ${activity.youthInvolvement.tasks?.length ? activity.youthInvolvement.tasks.map(t => `
                          <div class="checklist-item text-xs">
                              <div class="checkbox"></div>
                              <span>${t}</span>
                          </div>
                      `).join('') : '<span class="text-xs text-slate-400 italic">Aucune tâche spécifique</span>'}
                  </div>
              </div>
          </div>
      </div>
  </div>

  <div class="grid grid-cols-12 gap-4 mb-4">
      
      <!-- ÉQUIPE -->
      <div class="col-span-4">
          <div class="box">
               <h3 class="section-title"><i class="fa-solid fa-users"></i> Équipe</h3>
               <div class="mb-3">
                   <div class="font-bold text-xs text-slate-500 uppercase">Lead (Adulte Significatif)</div>
                   <div class="font-bold text-sm">${activity.staffing.leadStaff || 'Non assigné'}</div>
               </div>
               <div class="mb-3">
                   <div class="font-bold text-xs text-slate-500 uppercase">Soutien</div>
                   <div class="flex flex-wrap gap-1 mt-1">
                      ${activity.staffing.supportStaff.map(s => `<span class="tag">${s}</span>`).join('')}
                   </div>
               </div>
               <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                    <div>
                       <div class="font-bold text-[10px] text-slate-500 uppercase">Ratio</div>
                       <div class="font-mono text-xs">${activity.staffing.requiredRatio}</div>
                    </div>
                     <div>
                       <div class="font-bold text-[10px] text-slate-500 uppercase">Qualifs</div>
                       <div class="text-[10px] leading-tight">${activity.staffing.specialQualifications || 'Aucune'}</div>
                    </div>
               </div>
          </div>
      </div>

      <!-- MATÉRIEL -->
      <div class="col-span-8">
          <div class="box">
               <h3 class="section-title"><i class="fa-solid fa-box-open"></i> Matériel & Collations</h3>
               <table>
                  <thead>
                      <tr>
                          <th style="width: 30px;"></th>
                          <th>Item</th>
                          <th>Qté</th>
                          <th>Responsable</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${activity.materials.map(m => `
                          <tr>
                              <td><div class="checkbox"></div></td>
                              <td>${m.item}</td>
                              <td>${m.quantity}</td>
                              <td>${m.supplier}</td>
                          </tr>
                      `).join('')}
                       ${activity.materials.length === 0 ? '<tr><td colspan="4" class="text-center italic text-slate-400 py-2">Aucun matériel listé</td></tr>' : ''}
                  </tbody>
               </table>
          </div>
      </div>
  </div>

   <div class="grid grid-cols-12 gap-4 mb-4">
      
      <!-- RISQUES & URGENCE -->
      <div class="col-span-7">
          <div class="box bg-slate-50">
               <h3 class="section-title"><i class="fa-solid fa-triangle-exclamation"></i> Gestion des Risques</h3>
               <div class="grid grid-cols-2 gap-4">
                   <div>
                       <div class="font-bold text-xs text-slate-500 uppercase mb-1">Dangers Potentiels</div>
                       <ul class="list-disc list-inside text-xs text-slate-700 space-y-1">
                           ${activity.riskManagement.hazards.map(h => `<li>${h}</li>`).join('')}
                       </ul>
                   </div>
                   <div>
                        <div class="font-bold text-xs text-slate-500 uppercase mb-1">Protocoles Sécurité</div>
                        ${activity.riskManagement.safetyProtocols.map(p => `
                          <div class="checklist-item text-xs">
                              <div class="checkbox"></div>
                              <span>${p}</span>
                          </div>
                      `).join('')}
                   </div>
               </div>
               <div class="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                   <div class="text-xs"><span class="font-bold">Assurances:</span> ${activity.riskManagement.requiredInsurance || 'Standard MDJ'}</div>
                   <div class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold"><i class="fa-solid fa-phone"></i> Urgence: ${activity.riskManagement.emergencyContact}</div>
               </div>
          </div>
      </div>

      <!-- BUDGET -->
      <div class="col-span-5">
          <div class="box">
               <h3 class="section-title"><i class="fa-solid fa-coins"></i> Budget Estimé</h3>
               <div class="flex justify-between items-end mb-2">
                   <div class="text-xs text-slate-500">Total</div>
                   <div class="text-xl font-bold font-mono">${activity.budget.estimatedCost.toFixed(2)} $</div>
               </div>
               <table>
                  <tbody>
                      ${activity.budget.items.map(i => `
                          <tr>
                              <td>${i.description}</td>
                              <td class="text-right font-mono">${i.amount.toFixed(2)} $</td>
                          </tr>
                      `).join('')}
                  </tbody>
               </table>
          </div>
      </div>
  </div>

  <!-- PIED DE PAGE -->
  <div class="grid grid-cols-2 gap-4 mt-6">
      <div>
          <div class="font-bold text-xs text-slate-500 uppercase mb-1">Notes terrain / Imprévus</div>
          <div class="footer-notes"></div>
      </div>
      <div>
          <div class="font-bold text-xs text-slate-500 uppercase mb-1">Signature Responsable</div>
          <div class="footer-notes"></div>
      </div>
  </div>
  
  <div class="text-center text-[10px] text-slate-400 mt-4">
      Généré par Planificateur MDJ - ${new Date().toLocaleDateString()}
  </div>

  <script>
      window.onload = function() { window.print(); }
  </script>
</body>
</html>
      `;
  },

  downloadActivityDetail: (activity: Activity) => {
    const html = HtmlGeneratorService.generateActivityDetailHTML(activity);
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    
    // Ouvrir dans un nouvel onglet pour impression directe
    const win = window.open(url, '_blank');
    if(!win) {
         // Fallback si popup bloquée
         const a = document.createElement('a');
         a.href = url;
         a.download = `Fiche_${activity.title.replace(/\s+/g, '_')}.html`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
    }
  }
};
