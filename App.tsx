import React, { useState, useRef, useEffect } from 'react';
import { Activity, ActivityType } from './types';
import ActivityModal from './components/ActivityModal';
import { ActivityService } from './services/activityService';
import { SharePointService } from './services/sharepointService';
import { Calendar as CalendarIcon, PieChart, CheckCircle, AlertCircle, ArrowRight, LayoutGrid, ChevronLeft, ChevronRight, Upload, Plus, School, Palmtree, CalendarOff, Save, FileType, FileText, Trash2, Cloud, CloudOff } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

// Helper pour créer des objets vides rapidement
const emptyLogistics = { venueName: 'MDJ (La Piaule)', address: '5225, rue de Courcelette', transportRequired: false, departureTime: '', returnTime: '' };
const emptyStats = { level: 'Participation', tasks: [] } as any;

// Données initiales vides pour commencer propre
const INITIAL_ACTIVITIES: Activity[] = [];

// Data from provided school calendars (2025-2026 and 2026-2027)
const SCHOOL_CALENDAR_DATA: Record<string, { type: 'pedagogical' | 'holiday' | 'break', label: string }> = {
  // --- 2025-2026 ---
  '2025-08-25': { type: 'pedagogical', label: 'Pédago' },
  '2025-08-26': { type: 'pedagogical', label: 'Pédago' },
  '2025-08-27': { type: 'pedagogical', label: 'Pédago' },
  '2025-08-28': { type: 'pedagogical', label: 'Pédago' },
  '2025-09-26': { type: 'pedagogical', label: 'Pédago' },
  '2025-10-31': { type: 'pedagogical', label: 'Pédago' },
  '2025-11-14': { type: 'pedagogical', label: 'Pédago' },
  '2025-12-05': { type: 'pedagogical', label: 'Pédago' },
  '2026-01-30': { type: 'pedagogical', label: 'Pédago' },
  '2026-02-20': { type: 'pedagogical', label: 'Pédago' },
  '2026-03-20': { type: 'pedagogical', label: 'Pédago' },
  '2026-04-24': { type: 'pedagogical', label: 'Pédago' },
  '2026-05-08': { type: 'pedagogical', label: 'Pédago (Flottante)' },
  '2026-05-15': { type: 'pedagogical', label: 'Pédago' },
  '2026-05-29': { type: 'pedagogical', label: 'Pédago (Flottante)' },
  '2026-06-12': { type: 'pedagogical', label: 'Pédago (Flottante)' },
  '2026-06-25': { type: 'pedagogical', label: 'Pédago' },
  '2026-06-26': { type: 'pedagogical', label: 'Pédago' },

  '2025-09-01': { type: 'holiday', label: 'Fête du Travail' },
  '2025-10-13': { type: 'holiday', label: 'Action de grâce' },
  '2026-03-30': { type: 'holiday', label: 'Pâques' },
  '2026-05-18': { type: 'holiday', label: 'Patriotes' },
  '2026-06-24': { type: 'holiday', label: 'St-Jean' },

  '2025-12-22': { type: 'break', label: 'Fêtes' }, '2025-12-23': { type: 'break', label: 'Fêtes' }, '2025-12-24': { type: 'break', label: 'Fêtes' }, '2025-12-25': { type: 'break', label: 'Noël' }, '2025-12-26': { type: 'break', label: 'Fêtes' },
  '2025-12-29': { type: 'break', label: 'Fêtes' }, '2025-12-30': { type: 'break', label: 'Fêtes' }, '2025-12-31': { type: 'break', label: 'Fêtes' }, '2026-01-01': { type: 'break', label: 'Jour de l\'An' }, '2026-01-02': { type: 'break', label: 'Fêtes' },
  
  '2026-03-02': { type: 'break', label: 'Relâche' }, '2026-03-03': { type: 'break', label: 'Relâche' }, '2026-03-04': { type: 'break', label: 'Relâche' }, '2026-03-05': { type: 'break', label: 'Relâche' }, '2026-03-06': { type: 'break', label: 'Relâche' },
};

const createEmptyActivity = (date: string): Activity => ({
  id: `new-${Date.now()}`,
  title: 'Nouvelle activité',
  date: date,
  startTime: '17:30',
  endTime: '21:00',
  type: ActivityType.FREE,
  description: '',
  objectives: [],
  rmjqDimensions: [],
  youthInvolvement: { level: 'Participation', tasks: [] },
  evaluationCriteria: [],
  logistics: { venueName: 'Aréna Jérôme-Cotnoir', address: '5225, rue de Courcelette', transportRequired: false, departureTime: '', returnTime: '' },
  materials: [],
  budget: { estimatedCost: 0, actualCost: 0, items: [] },
  staffing: { leadStaff: '', supportStaff: [], requiredRatio: '', specialQualifications: '' },
  riskManagement: { hazards: [], requiredInsurance: '', safetyProtocols: [], emergencyContact: '' },
  communicationPlan: '',
  preparationScore: 0,
  backupPlan: ''
});

// Simple score calculator (duplicated from Modal for use in main view auto-enrich)
const calculateQuickScore = (act: Activity) => {
    let score = 0;
    if (act.objectives.length > 0) score++;
    if (act.youthInvolvement?.tasks?.length > 0) score++;
    if (act.evaluationCriteria?.length > 0) score++;
    if (!!act.startTime && !!act.endTime) score++;
    if (!!act.logistics.venueName) score++;
    if (!act.logistics.transportRequired || (!!act.logistics.departureTime)) score++;
    if (act.materials.length > 0) score++;
    if (!!act.staffing.leadStaff) score++;
    if (!!act.staffing.requiredRatio) score++;
    if (act.riskManagement.safetyProtocols.length > 0) score++;
    if (!!act.riskManagement.emergencyContact) score++;
    
    // Total checks = 11 (approx)
    return Math.round((score / 11) * 100);
};

const App = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date()); // Start current date
  const [isImporting, setIsImporting] = useState(false);
  
  // Cloud / Auth State
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [userAccount, setUserAccount] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Remove loading screen when App is mounted
  useEffect(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.remove();
      }, 500);
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    loadData();
  }, [isCloudMode]); // Reload if mode changes

  const loadData = async () => {
    const service = isCloudMode ? SharePointService : ActivityService;
    try {
        const data = await service.getAll();
        setActivities(data.length > 0 ? data : (isCloudMode ? [] : INITIAL_ACTIVITIES));
    } catch (e) {
        console.error("Erreur chargement", e);
        if (isCloudMode) {
            alert("Erreur de connexion SharePoint. Vérifiez votre configuration.");
            setIsCloudMode(false); // Fallback to local
        }
    }
  };

  const handleMicrosoftLogin = async () => {
      try {
          const account = await SharePointService.login();
          setUserAccount(account);
          setIsCloudMode(true);
      } catch (e) {
          alert("La connexion Microsoft a échoué.");
      }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday ... 6 = Saturday
    // We want Monday to be 0 for the grid
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getSchoolEvent = (dateStr: string) => {
    return SCHOOL_CALENDAR_DATA[dateStr] || null;
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startPadding = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const handleSaveActivity = async (activityToSave: Activity) => {
    const service = isCloudMode ? SharePointService : ActivityService;
    
    // Update State Optimistically
    setActivities(prev => {
      const exists = prev.some(a => a.id === activityToSave.id);
      if (exists) {
        return prev.map(a => a.id === activityToSave.id ? activityToSave : a);
      } else {
        return [...prev, activityToSave];
      }
    });

    // Persist
    await service.save(activityToSave);
    
    setSelectedActivity(null);
  };

  const handleCreateActivity = (date: string) => {
    const newActivity = createEmptyActivity(date);
    setSelectedActivity(newActivity);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // --- RESET HANDLER ---
  const handleReset = async () => {
    if (isCloudMode) {
        alert("La réinitialisation globale est désactivée en mode Cloud pour protéger les données partagées.");
        return;
    }
    if(confirm("ATTENTION: Voulez-vous vraiment effacer toutes les données locales et recommencer à zéro ?")) {
       await ActivityService.reset();
       window.location.reload();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const fileName = file.name.toLowerCase();
      let extractedText = "";

      if (fileName.endsWith('.html')) {
          const text = await file.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');

          // Tentative de détection du mois/année
          const titleText = doc.title.toUpperCase();
          let year = 2026;
          let monthIndex = 1; // Février par défaut

          const yearMatch = titleText.match(/20\d{2}/);
          if (yearMatch) year = parseInt(yearMatch[0]);

          const months = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
          const foundMonth = months.findIndex(m => titleText.includes(m) || doc.querySelector('h1')?.textContent?.toUpperCase().includes(m));
          if (foundMonth !== -1) monthIndex = foundMonth;

          const cards = doc.querySelectorAll('.event-card');
          const newActivities: Activity[] = [];

          cards.forEach((card) => {
              const dayText = card.querySelector('.date-badge')?.textContent?.trim();
              if (!dayText) return;
              
              const day = parseInt(dayText);
              const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              const title = card.querySelector('.event-title')?.textContent?.trim() || "Activité importée";
              // On utilise innerText pour conserver les sauts de ligne si possible
              const details = (card.querySelector('.event-details') as HTMLElement)?.innerText || "";
              const costBadge = card.querySelector('.event-cost')?.textContent?.trim();
              
              // Détection du staff via les images
              const staffImgs = card.querySelectorAll('.employee-icon');
              const staffNames = Array.from(staffImgs).map(img => img.getAttribute('title')).filter(t => t) as string[];

              const activity = createEmptyActivity(dateStr);
              activity.title = title;
              activity.description = details;
              
              // Heuristics basiques
              if (costBadge?.toLowerCase().includes('payant')) {
                   activity.budget.estimatedCost = 50; // Valeur par défaut pour payant
                   activity.budget.items = [{description: 'Coût activité', amount: 50}];
              }
              
              if (staffNames.length > 0) {
                  activity.staffing.leadStaff = staffNames[0];
                  activity.staffing.supportStaff = staffNames.slice(1);
              }

              // Détection du type
              const iconClass = card.querySelector('.event-icon')?.className || "";
              if (iconClass.includes('fa-palette') || title.includes('Art') || title.includes('Décoration')) activity.type = ActivityType.CREATIVE;
              else if (iconClass.includes('fa-person-walking') || title.includes('Marche') || title.includes('Randonnée')) activity.type = ActivityType.OUTDOOR;
              else if (iconClass.includes('fa-table-tennis') || title.includes('Escalade') || title.includes('Sport')) activity.type = ActivityType.SPORT;
              else if (title.toLowerCase().includes('social') || title.includes('Jeux')) activity.type = ActivityType.SOCIAL;

              activity.preparationScore = calculateQuickScore(activity);
              newActivities.push(activity);
          });

          if (newActivities.length > 0) {
              setActivities(prev => {
                  const combined = [...prev];
                  newActivities.forEach(newAct => {
                      // On remplace si une activité existe déjà le même jour avec le même titre
                      const existingIdx = combined.findIndex(a => a.date === newAct.date && a.title === newAct.title);
                      if (existingIdx >= 0) combined[existingIdx] = newAct;
                      else combined.push(newAct);
                  });
                  return combined.sort((a,b) => a.date.localeCompare(b.date));
              });
              // Save to current service
              const service = isCloudMode ? SharePointService : ActivityService;
              // Note: ActivityService has saveAll, SharePoint doesn't (saves one by one)
              if (!isCloudMode) {
                  await ActivityService.saveAll(newActivities);
              } else {
                  // Basic loop for SP (Caution: might hit rate limits)
                  for(const act of newActivities) await SharePointService.save(act);
              }
              
              alert(`${newActivities.length} activités importées !`);
              setCurrentDate(new Date(year, monthIndex)); 
          } else {
              alert("Aucune activité trouvée dans ce fichier HTML.");
          }

      } else {
          // ... (Existing handlers for PDF/DOCX remain similar) ...
          alert("Importation DOCX/PDF non implémentée en mode cloud pour l'instant.");
          setIsImporting(false);
          return;
      }

    } catch (error) {
      console.error("Import error:", error);
      alert(`Erreur lors de l'importation: ${error instanceof Error ? error.message : "Fichier illisible."}`);
    } finally {
        setIsImporting(false);
        if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-mdj-dark border-mdj-cyan/50 text-mdj-cyan shadow-[0_0_10px_rgba(0,255,255,0.2)]';
    if (score >= 40) return 'bg-mdj-dark border-mdj-yellow/50 text-mdj-yellow';
    return 'bg-mdj-dark border-mdj-orange/50 text-mdj-orange';
  };

  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const displayedActivities = activities.filter(a => a.date.startsWith(currentMonthStr));

  const totalBudget = displayedActivities.reduce((sum, act) => sum + act.budget.estimatedCost, 0);
  const preparedCount = displayedActivities.filter(a => a.preparationScore >= 80).length;

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  return (
    <div className="min-h-screen bg-mdj-black font-sans text-gray-100 selection:bg-mdj-cyan selection:text-mdj-black pb-20">
      <header className="bg-mdj-dark/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/mdj-header-l039escale-jeunesse-la-piaule-1.png" alt="Logo MDJ" className="h-12 w-auto drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]" />
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-tight">Planificateur <span className="text-mdj-cyan">Jeunesse</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft className="w-4 h-4 text-mdj-cyan"/></button>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium min-w-[120px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </p>
                <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-4 h-4 text-mdj-cyan"/></button>
              </div>
            </div>
          </div>
          <div className="flex gap-4 text-sm items-center">
             {/* Microsoft Login Button */}
             <button 
               onClick={isCloudMode ? () => setIsCloudMode(false) : handleMicrosoftLogin}
               className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider ${isCloudMode ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
               title={isCloudMode ? `Connecté: ${userAccount?.username}` : "Connexion Microsoft"}
             >
                {isCloudMode ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
                {isCloudMode ? "CLOUD ACTIF" : "MODE LOCAL"}
             </button>

            <div className="hidden md:flex items-center gap-2 bg-mdj-black/50 px-4 py-2 rounded-full border border-mdj-cyan/30 text-mdj-cyan font-bold shadow-[0_0_10px_rgba(0,255,255,0.1)]">
              <PieChart className="w-4 h-4" />
              <span className="font-mono">{totalBudget.toFixed(0)}$</span>
            </div>
             <div className="hidden md:flex items-center gap-2 bg-mdj-black/50 px-4 py-2 rounded-full border border-mdj-magenta/30 text-mdj-magenta font-bold shadow-[0_0_10px_rgba(255,0,255,0.1)]">
              <CheckCircle className="w-4 h-4" />
              <span>Prêts: {preparedCount}/{displayedActivities.length}</span>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".html" className="hidden" />
            <button onClick={handleImportClick} disabled={isImporting} className="flex items-center gap-2 bg-mdj-orange/20 text-mdj-orange border border-mdj-orange/30 px-3 py-2 rounded-full hover:bg-mdj-orange/30 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50">
              {isImporting ? <div className="animate-spin w-4 h-4 border-2 border-mdj-orange border-t-transparent rounded-full"></div> : <FileText className="w-4 h-4" />} 
              {isImporting ? 'LECTURE...' : 'IMPORTER'}
            </button>
            <button onClick={handleReset} className={`p-2 rounded-full transition-colors ${isCloudMode ? 'text-gray-600 cursor-not-allowed' : 'text-red-500 hover:bg-red-500/10'}`} title="Réinitialiser tout">
                <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 glass rounded-3xl shadow-2xl p-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-mdj-cyan/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3"><LayoutGrid className="w-6 h-6 text-mdj-cyan"/> Calendrier - {monthNames[currentDate.getMonth()]}</h2>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-mdj-orange rounded-full shadow-[0_0_5px_#FF7A59]"></span> À faire</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-mdj-yellow rounded-full shadow-[0_0_5px_#FFFF00]"></span> En cours</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-mdj-cyan rounded-full shadow-[0_0_5px_#00FFFF]"></span> Prêt</div>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10 shadow-inner relative z-10">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                <div key={d} className="bg-mdj-dark/80 p-3 text-center text-xs font-bold text-mdj-cyan uppercase tracking-widest">{d}</div>
              ))}
              {Array.from({ length: startPadding }).map((_, i) => (
                 <div key={`pad-${i}`} className="bg-mdj-black/40 h-32 p-2"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const daysActivities = activities.filter(a => a.date === dateStr);
                const schoolEvent = getSchoolEvent(dateStr);
                let dayCellClass = "h-32 p-2 border-t border-l border-white/5 transition-colors relative group ";
                if (schoolEvent?.type === 'pedagogical') dayCellClass += "bg-mdj-yellow/20 hover:bg-mdj-yellow/30";
                else if (schoolEvent?.type === 'holiday') dayCellClass += "bg-mdj-magenta/20 hover:bg-mdj-magenta/30";
                else if (schoolEvent?.type === 'break') dayCellClass += "bg-mdj-cyan/10 hover:bg-mdj-cyan/20";
                else dayCellClass += "bg-mdj-black/60 hover:bg-white/5";

                return (
                  <div key={day} className={dayCellClass} title={schoolEvent?.label}>
                    <div className="flex justify-end items-start mb-1"><span className="text-sm font-bold text-gray-500 font-mono">{day}</span></div>
                    <div className="mt-1 space-y-1.5 overflow-y-auto max-h-[75px] custom-scrollbar">
                      {daysActivities.map(act => (
                        <button key={act.id} onClick={(e) => { e.stopPropagation(); setSelectedActivity(act); }} className={`w-full text-left text-[10px] font-bold p-1.5 rounded border truncate transition-all hover:scale-[1.02] ${getScoreColor(act.preparationScore)} bg-mdj-black`}>
                          {act.title}
                        </button>
                      ))}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleCreateActivity(dateStr); }} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-mdj-cyan text-black rounded-full hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,255,0.3)] z-10" title="Ajouter une activité">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-3xl shadow-xl p-6 border border-white/10">
               <h3 className="font-display font-bold text-white mb-6 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-mdj-orange"/> Priorités (Urgent)</h3>
               <div className="space-y-3">
                 {displayedActivities.filter(a => a.preparationScore < 50).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 5).map(act => (
                   <div key={act.id} onClick={() => setSelectedActivity(act)} className="cursor-pointer flex justify-between items-center p-3 bg-mdj-dark/50 rounded-xl border border-mdj-orange/30 hover:border-mdj-orange hover:bg-mdj-orange/10 transition-all group">
                      <div><div className="text-sm font-bold text-white group-hover:text-mdj-orange transition-colors">{act.title}</div><div className="text-xs text-mdj-orange font-mono">{act.date}</div></div>
                      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-mdj-orange group-hover:translate-x-1 transition-all"/>
                   </div>
                 ))}
                 {displayedActivities.filter(a => a.preparationScore < 50).length === 0 && (
                   <div className="flex flex-col items-center justify-center py-8 text-mdj-cyan bg-mdj-cyan/10 rounded-xl border border-mdj-cyan/20">
                     <CheckCircle className="w-10 h-10 mb-2 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]" /><span className="font-bold text-sm uppercase tracking-wide">Tout est sous contrôle !</span>
                   </div>
                 )}
               </div>
            </div>

            <div className="glass rounded-3xl shadow-xl p-6 border border-white/10">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><School className="w-5 h-5 text-white"/> Calendrier Scolaire</h3>
              <div className="space-y-2 text-xs">
                 <div className="flex items-center gap-2 text-gray-300"><div className="w-6 h-6 rounded bg-mdj-yellow/20 border border-mdj-yellow/30 flex items-center justify-center text-mdj-yellow"><School className="w-3 h-3"/></div><span>Journée Pédagogique (Opportunité)</span></div>
                 <div className="flex items-center gap-2 text-gray-300"><div className="w-6 h-6 rounded bg-mdj-magenta/20 border border-mdj-magenta/30 flex items-center justify-center text-mdj-magenta"><CalendarOff className="w-3 h-3"/></div><span>Férié / Congé</span></div>
                 <div className="flex items-center gap-2 text-gray-300"><div className="w-6 h-6 rounded bg-mdj-cyan/10 border border-mdj-cyan/30 flex items-center justify-center text-mdj-cyan"><Palmtree className="w-3 h-3"/></div><span>Relâche / Fêtes / Été</span></div>
              </div>
            </div>

            <div className="glass rounded-3xl shadow-xl p-6 border border-white/10">
               <h3 className="font-display font-bold text-white mb-4">Répartition Budget</h3>
               <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayedActivities.filter(a => a.budget.estimatedCost > 0)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" tickFormatter={(val) => val.split('-')[2]} fontSize={10} stroke="#94a3b8" />
                      <YAxis fontSize={10} stroke="#94a3b8" />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} formatter={(value: number) => [`${value}$`, 'Coût Est.']} />
                      <Bar dataKey="budget.estimatedCost" radius={[4, 4, 0, 0]}>
                        {displayedActivities.filter(a => a.budget.estimatedCost > 0).map((entry, index) => (<Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00FFFF' : '#FF00FF'} />))}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>
      </main>

      {selectedActivity && <ActivityModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} onSave={handleSaveActivity} />}
    </div>
  );
};

export default App;