
import React, { useState, useEffect } from 'react';
import { Activity, ActivityType } from './types';
import ActivityModal from './components/ActivityModal';
import ConfigModal from './components/ConfigModal';
import ChatPanel from './components/ChatPanel';
import { ActivityService } from './services/activityService'; 
import { FirebaseService, FirebaseConfig } from './services/firebaseService';
import { HtmlGeneratorService } from './services/htmlGeneratorService'; 
import { LayoutGrid, ChevronLeft, ChevronRight, Plus, BellRing, Code, MessageSquare, User as UserIcon, Settings, LogIn, LogOut, Cloud, CloudOff, Calendar as CalendarIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { User } from 'firebase/auth';

const SCHOOL_CALENDAR_DATA: Record<string, { type: 'pedagogical' | 'holiday' | 'break', label: string }> = {
  '2026-01-30': { type: 'pedagogical', label: 'Pédago' },
  '2026-02-20': { type: 'pedagogical', label: 'Pédago' },
  '2026-03-20': { type: 'pedagogical', label: 'Pédago' },
  '2026-03-30': { type: 'holiday', label: 'Pâques' },
};

const createEmptyActivity = (date: string): Activity => ({
  id: `act-${Date.now()}`,
  title: 'Nouvelle activité',
  date: date,
  startTime: '17:30',
  endTime: '21:00',
  type: ActivityType.LOISIRS,
  description: '',
  objectives: [],
  rmjqDimensions: [],
  youthInvolvement: { level: 'Participation', tasks: [] },
  evaluationCriteria: [],
  logistics: { 
    venueName: 'MDJ (Aréna Jérôme-Cotnoir)', 
    address: '5225 Rue de Courcelette, Trois-Rivières, QC G8Y 4L4', 
    phoneNumber: '(819) 694-7564',
    website: 'https://mdjescalejeunesse.ca',
    transportRequired: false, 
    meetingPoint: 'Local 2'
  },
  materials: [],
  budget: { estimatedCost: 0, actualCost: 0, items: [] },
  staffing: { leadStaff: '', supportStaff: [], requiredRatio: '1/15' },
  riskManagement: { hazards: [], requiredInsurance: '', safetyProtocols: [], emergencyContact: 'Patrick Delage' },
  communicationPlan: '',
  preparationScore: 0,
  backupPlan: ''
});

const App = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); 
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
  
  const [isCloudEnabled, setIsCloudEnabled] = useState(FirebaseService.isConfigured());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    let unsubscribeActivities: () => void = () => {};

    const initApp = async () => {
      FirebaseService.subscribeToAuth((user) => {
        setCurrentUser(user);
      });

      if (isCloudEnabled) {
        unsubscribeActivities = FirebaseService.subscribeToActivities((cloudData) => {
          setActivities(cloudData);
        });
      } else {
        const localData = await ActivityService.getAll();
        setActivities(localData);
      }

      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 500);
      }
    };

    initApp();
    return () => unsubscribeActivities();
  }, [isCloudEnabled]);

  const handleSaveActivity = async (activityToSave: Activity) => {
    setActivities(prev => {
      const exists = prev.some(a => a.id === activityToSave.id);
      return exists ? prev.map(a => a.id === activityToSave.id ? activityToSave : a) : [...prev, activityToSave];
    });

    try {
        if (isCloudEnabled && currentUser) {
          await FirebaseService.save(activityToSave);
        } else {
          await ActivityService.save(activityToSave);
        }
    } catch (e) {
        console.error("Erreur sauvegarde", e);
    }
    setSelectedActivity(null);
  };

  const handleCreateActivity = (date: string) => {
    setSelectedActivity(createEmptyActivity(date));
  };

  const handleLogin = async () => {
    try { await FirebaseService.login(); } catch (e) { alert("Erreur de connexion Google."); }
  };

  const handleDragStart = (e: React.DragEvent, activityId: string) => {
    e.dataTransfer.setData("text/plain", activityId);
    setDraggedActivityId(activityId);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    if (!draggedActivityId) return;
    const activityToMove = activities.find(a => a.id === draggedActivityId);
    if (activityToMove && activityToMove.date !== targetDate) {
        handleSaveActivity({ ...activityToMove, date: targetDate });
    }
    setDraggedActivityId(null);
  };

  // --- CALCUL DES JOURS DU CALENDRIER ---
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Ajuster pour commencer le Lundi (1) au lieu de Dimanche (0)
    let startOffset = firstDayOfMonth.getDay(); 
    startOffset = startOffset === 0 ? 6 : startOffset - 1; 

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // Jours du mois précédent
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, currentMonth: false, date: "" });
    }

    // Jours du mois actuel
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, currentMonth: true, date: dateStr });
    }

    // Jours du mois suivant pour remplir la grille (6 semaines = 42 cases)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, currentMonth: false, date: "" });
    }

    return days;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-mdj-dark border-mdj-cyan/50 text-mdj-cyan shadow-[0_0_10px_rgba(0,255,255,0.2)]';
    if (score >= 40) return 'bg-mdj-dark border-mdj-yellow/50 text-mdj-yellow';
    return 'bg-mdj-dark border-mdj-orange/50 text-mdj-orange';
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const calendarDays = getCalendarDays();
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const displayedActivities = activities.filter(a => a.date.startsWith(currentMonthStr));
  const totalBudget = displayedActivities.reduce((sum, act) => sum + act.budget.estimatedCost, 0);

  return (
    <div className="min-h-screen bg-mdj-black font-sans text-gray-100 pb-20">
      <header className="bg-mdj-dark/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <img src="https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/mdj-header-l039escale-jeunesse-la-piaule-1.png" alt="Logo MDJ" className="h-10 w-auto" />
            <div className="hidden lg:block h-8 w-px bg-white/10"></div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-tight">Planificateur <span className="text-mdj-cyan">Jeunesse</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft className="w-4 h-4 text-mdj-cyan"/></button>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium min-w-[120px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </p>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-4 h-4 text-mdj-cyan"/></button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${isCloudEnabled ? 'bg-mdj-cyan/10 border-mdj-cyan/30 text-mdj-cyan' : 'bg-gray-500/10 border-gray-500/30 text-gray-500'}`}>
              {isCloudEnabled ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCloudEnabled ? 'En direct' : 'Local'}</span>
            </div>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setShowChat(!showChat)} className={`p-2 rounded-xl transition-all relative ${showChat ? 'bg-mdj-magenta text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                  <MessageSquare className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-mdj-dark"></span>
                </button>
                <div className="flex items-center gap-2 bg-white/5 pl-2 pr-3 py-1 rounded-full border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-mdj-cyan/20 flex items-center justify-center overflow-hidden">
                    {currentUser.photoURL ? <img src={currentUser.photoURL} className="w-6 h-6" /> : <UserIcon className="w-3.5 h-3.5 text-mdj-cyan" />}
                  </div>
                  <button onClick={() => FirebaseService.logout()} title="Déconnexion" className="p-1 text-gray-500 hover:text-red-400"><LogOut className="w-4 h-4"/></button>
                </div>
              </div>
            ) : (
              <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-mdj-cyan text-mdj-black font-bold text-xs hover:scale-105 transition-all">
                <LogIn className="w-4 h-4" /> CONNEXION
              </button>
            )}
            <button onClick={() => setShowConfig(true)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass rounded-3xl p-8 border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3"><CalendarIcon className="w-6 h-6 text-mdj-cyan"/> Calendrier interactif</h2>
              <button onClick={() => HtmlGeneratorService.downloadHtml(activities, currentDate)} className="flex items-center gap-2 bg-white/5 text-gray-300 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 text-xs font-bold uppercase">
                <Code className="w-4 h-4" /> EXPORTER HTML
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                <div key={d} className="bg-mdj-dark/80 p-3 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">{d}</div>
              ))}
              {calendarDays.map((dayObj, idx) => {
                const daysActivities = activities.filter(a => a.date === dayObj.date);
                const schoolEvent = dayObj.date ? SCHOOL_CALENDAR_DATA[dayObj.date] : null;

                return (
                  <div 
                    key={idx} 
                    onDragOver={(e) => e.preventDefault()} 
                    onDrop={(e) => dayObj.date && handleDrop(e, dayObj.date)} 
                    className={`h-32 p-2 border-t border-l border-white/5 relative group transition-colors ${!dayObj.currentMonth ? 'opacity-20 bg-black/20' : 'bg-mdj-black/60 hover:bg-white/5'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold font-mono ${schoolEvent ? 'text-mdj-cyan' : 'text-gray-600'}`}>{dayObj.day}</span>
                      {schoolEvent && <span className="text-[8px] bg-mdj-cyan/20 text-mdj-cyan px-1 rounded uppercase font-bold">{schoolEvent.label}</span>}
                    </div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                      {daysActivities.map(act => (
                        <button key={act.id} onClick={() => setSelectedActivity(act)} draggable onDragStart={(e) => handleDragStart(e, act.id)} className={`w-full text-left text-[9px] font-bold p-1.5 rounded border truncate transition-all ${getScoreColor(act.preparationScore)}`}>
                          {act.title}
                        </button>
                      ))}
                    </div>
                    {dayObj.currentMonth && dayObj.date && (
                      <button onClick={() => handleCreateActivity(dayObj.date)} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-mdj-cyan text-black rounded-full hover:scale-110 shadow-lg">
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-2xl border-l-4 border-mdj-cyan">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Budget Mensuel</div>
                <div className="text-xl font-black text-white">{totalBudget.toFixed(0)}$</div>
              </div>
              <div className="glass p-4 rounded-2xl border-l-4 border-mdj-magenta">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Progression</div>
                <div className="text-xl font-black text-white">{displayedActivities.length} act.</div>
              </div>
            </div>
            <div className="glass-strong rounded-3xl p-6 border border-white/10">
               <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><BellRing className="w-5 h-5 text-mdj-orange"/> À finaliser</h3>
               <div className="space-y-3">
                 {displayedActivities.filter(a => a.preparationScore < 80).slice(0, 5).map(act => (
                   <div key={act.id} onClick={() => setSelectedActivity(act)} className="cursor-pointer p-3 bg-mdj-black/50 rounded-xl border border-white/5 hover:border-mdj-cyan/30 transition-all">
                      <div className="text-xs font-bold text-white">{act.title}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[9px] text-gray-500 font-mono">{act.date}</span>
                        <span className="text-[9px] font-bold text-mdj-orange">{act.preparationScore}%</span>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </main>

      {selectedActivity && <ActivityModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} onSave={handleSaveActivity} />}
      {showConfig && <ConfigModal onClose={() => setShowConfig(false)} onSave={(conf) => FirebaseService.saveConfig(conf)} />}
      <ChatPanel currentUser={currentUser} isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
};

export default App;
