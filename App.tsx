import React, { useState, useEffect } from 'react';
import { Activity, ActivityType } from './types';
import ActivityModal from './components/ActivityModal';
import { ActivityService } from './services/activityService'; 
import { HtmlGeneratorService } from './services/htmlGeneratorService'; 
import { PieChart, CheckCircle, AlertCircle, LayoutGrid, ChevronLeft, ChevronRight, Plus, BellRing, Code, Target, Check, Utensils } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const emptyLogistics = { 
  venueName: 'MDJ (Aréna Jérôme-Cotnoir)', 
  address: '5225 Rue de Courcelette, Trois-Rivières, QC G8Y 4L4', 
  phoneNumber: '(819) 694-7564',
  website: 'https://mdjescalejeunesse.ca',
  transportRequired: false, 
  departureTime: '', 
  returnTime: '' 
};

const SCHOOL_CALENDAR_DATA: Record<string, { type: 'pedagogical' | 'holiday' | 'break', label: string }> = {
  '2026-01-30': { type: 'pedagogical', label: 'Pédago' },
  '2026-02-20': { type: 'pedagogical', label: 'Pédago' },
  '2026-03-20': { type: 'pedagogical', label: 'Pédago' },
  '2026-03-30': { type: 'holiday', label: 'Pâques' },
  '2026-03-02': { type: 'break', label: 'Relâche' }, '2026-03-03': { type: 'break', label: 'Relâche' }, '2026-03-04': { type: 'break', label: 'Relâche' }, '2026-03-05': { type: 'break', label: 'Relâche' }, '2026-03-06': { type: 'break', label: 'Relâche' },
};

const createEmptyActivity = (date: string): Activity => ({
  id: `new-${Date.now()}`,
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
  logistics: { ...emptyLogistics },
  materials: [],
  budget: { estimatedCost: 0, actualCost: 0, items: [] },
  staffing: { leadStaff: '', supportStaff: [], requiredRatio: '1/15', specialQualifications: '' },
  riskManagement: { hazards: [], requiredInsurance: '', safetyProtocols: [], emergencyContact: 'Patrick Delage' },
  communicationPlan: '',
  preparationScore: 0,
  backupPlan: ''
});

const App = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Vue forcée sur Février 2026 pour le Coordinateur
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); 
  
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);

  const isEditorEnv = typeof window !== 'undefined' && window.location.hostname.includes('aistudio.google.com');

  // CHARGEMENT ET RÉCUPÉRATION DES DONNÉES
  useEffect(() => {
    const loadData = async () => {
        try {
            console.log("Synchronisation avec la base de données locale (Février 2026)...");
            const data = await ActivityService.getAll();
            setActivities(data);
        } catch (e) {
            console.error("Erreur chargement local", e);
        }
    };
    loadData();

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => loadingScreen.remove(), 500);
    }
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getSchoolEvent = (dateStr: string) => SCHOOL_CALENDAR_DATA[dateStr] || null;

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startPadding = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const handleSaveActivity = async (activityToSave: Activity) => {
    setActivities(prev => {
      const exists = prev.some(a => a.id === activityToSave.id);
      if (exists) {
        return prev.map(a => a.id === activityToSave.id ? activityToSave : a);
      } else {
        return [...prev, activityToSave];
      }
    });

    try {
        await ActivityService.save(activityToSave);
    } catch (e) {
        console.error("Erreur sauvegarde locale", e);
    }
    setSelectedActivity(null);
  };

  const handleDeleteActivity = async (activityId: string) => {
      if(!confirm("Supprimer cette activité ?")) return;
      setActivities(prev => prev.filter(a => a.id !== activityId));
      setSelectedActivity(null);
      await ActivityService.delete(activityId);
  };

  const handleDragStart = (e: React.DragEvent, activityId: string) => {
    e.dataTransfer.setData("text/plain", activityId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedActivityId(activityId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    if (!draggedActivityId) return;

    const activityToMove = activities.find(a => a.id === draggedActivityId);
    if (activityToMove && activityToMove.date !== targetDate) {
        const updatedActivity = { ...activityToMove, date: targetDate };
        setActivities(prev => prev.map(a => a.id === draggedActivityId ? updatedActivity : a));
        await ActivityService.save(updatedActivity);
    }
    setDraggedActivityId(null);
  };

  const handleCreateActivity = (date: string) => {
    const newActivity = createEmptyActivity(date);
    setSelectedActivity(newActivity);
  };

  // --- HELPERS UI ---

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

  const getUrgentAlerts = () => {
    // Liste des activités de février nécessitant attention
    return displayedActivities.filter(act => act.preparationScore < 80).sort((a,b) => a.date.localeCompare(b.date));
  };

  const urgentAlerts = getUrgentAlerts();

  const getRMJQProgress = () => {
    const counts: Record<string, number> = {};
    Object.values(ActivityType).forEach(t => counts[t] = 0);
    let cookingCount = 0;

    displayedActivities.forEach(act => {
        if(counts[act.type] !== undefined) counts[act.type]++;
        const titleLower = act.title.toLowerCase();
        if (titleLower.includes('cuisine') || titleLower.includes('tacos') || titleLower.includes('repas') || titleLower.includes('banquet')) {
            cookingCount++;
        }
    });
    
    const results: { type: string; count: number; target: number; met: boolean }[] = Object.values(ActivityType).map(type => ({
        type,
        count: counts[type],
        target: 2,
        met: counts[type] >= 2
    }));

    results.push({
        type: "Atelier Cuisine",
        count: cookingCount,
        target: 1,
        met: cookingCount >= 1
    });

    return results;
  };

  const rmjqProgress = getRMJQProgress();

  return (
    <div className="min-h-screen bg-mdj-black font-sans text-gray-100 selection:bg-mdj-cyan selection:text-mdj-black pb-20">
      <header className="bg-mdj-dark/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/mdj-header-l039escale-jeunesse-la-piaule-1.png" alt="Logo MDJ" className="h-12 w-auto drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]" />
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
          <div className="flex gap-4 text-sm items-center">
            <div className="hidden md:flex items-center gap-2 bg-mdj-black/50 px-4 py-2 rounded-full border border-mdj-cyan/30 text-mdj-cyan font-bold shadow-[0_0_10px_rgba(0,255,255,0.1)]">
              <PieChart className="w-4 h-4" />
              <span className="font-mono">{totalBudget.toFixed(0)}$</span>
            </div>
             <div className="hidden md:flex items-center gap-2 bg-mdj-black/50 px-4 py-2 rounded-full border border-mdj-magenta/30 text-mdj-magenta font-bold shadow-[0_0_10px_rgba(255,0,255,0.1)]">
              <CheckCircle className="w-4 h-4" />
              <span>Prêts: {preparedCount}/{displayedActivities.length}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 glass rounded-3xl shadow-2xl p-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-mdj-cyan/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3"><LayoutGrid className="w-6 h-6 text-mdj-cyan"/> Calendrier - {monthNames[currentDate.getMonth()]}</h2>
              <button 
                onClick={() => HtmlGeneratorService.downloadHtml(activities, currentDate)} 
                className="flex items-center gap-2 bg-mdj-cyan/20 text-mdj-cyan border border-mdj-cyan/30 px-4 py-2 rounded-xl hover:bg-mdj-cyan/30 transition-all text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,255,0.1)]"
              >
                <Code className="w-4 h-4" /> EXPORTER HTML
              </button>
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
                  <div 
                    key={day} 
                    className={dayCellClass} 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dateStr)}
                  >
                    <div className="flex justify-end items-start mb-1"><span className="text-sm font-bold text-gray-500 font-mono">{day}</span></div>
                    <div className="mt-1 space-y-1.5 overflow-y-auto max-h-[75px] custom-scrollbar">
                      {daysActivities.map(act => (
                        <button 
                            key={act.id} 
                            onClick={(e) => { e.stopPropagation(); setSelectedActivity(act); }} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, act.id)}
                            className={`w-full text-left text-[10px] font-bold p-1.5 rounded border truncate transition-all hover:scale-[1.02] ${getScoreColor(act.preparationScore)} bg-mdj-black cursor-move`}
                        >
                          {act.title}
                        </button>
                      ))}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleCreateActivity(dateStr); }} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-mdj-cyan text-black rounded-full hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,255,0.3)] z-10">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-strong rounded-3xl shadow-xl p-6 border border-white/10">
               <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2 text-red-400">
                 <BellRing className="w-5 h-5 animate-bounce-soft"/> À Finaliser (Février)
               </h3>
               {urgentAlerts.length > 0 ? (
                 <div className="space-y-3">
                   {urgentAlerts.map(act => (
                     <div key={act.id} onClick={() => setSelectedActivity(act)} className="cursor-pointer p-3 bg-mdj-black/50 rounded-xl border border-white/10 hover:border-mdj-cyan/30 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start">
                           <div>
                             <div className="text-sm font-bold text-white group-hover:text-mdj-cyan transition-colors">{act.title}</div>
                             <div className="text-xs text-gray-500 font-mono mt-0.5">{act.date} • {act.preparationScore}%</div>
                           </div>
                           <AlertCircle className="w-4 h-4 text-mdj-orange"/>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                    <span className="text-xs italic text-green-400 flex items-center gap-2"><Check className="w-4 h-4"/> Toute la programmation est prête !</span>
                 </div>
               )}
            </div>

            <div className="glass rounded-3xl shadow-xl p-6 border border-white/10">
               <h3 className="font-display font-bold text-white mb-6 flex items-center gap-2"><Target className="w-5 h-5 text-mdj-orange"/> Cibles RMJQ - Février</h3>
               <div className="space-y-4">
                 {rmjqProgress.map((prog, idx) => (
                   <div key={idx} className="bg-mdj-dark/50 rounded-xl p-3 border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-300 uppercase truncate pr-2 flex items-center gap-2">
                              {prog.type === 'Atelier Cuisine' && <Utensils className="w-3 h-3 text-mdj-cyan"/>}
                              {prog.type}
                          </span>
                          {prog.met ? 
                            <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 font-bold"><Check className="w-3 h-3"/> Atteint</span> : 
                            <span className="text-[10px] text-gray-500 font-mono">{prog.count}/{prog.target}</span>
                          }
                      </div>
                      <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${prog.met ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-mdj-cyan'}`}
                            style={{ width: `${Math.min((prog.count / prog.target) * 100, 100)}%` }}
                          ></div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="glass rounded-3xl shadow-xl p-6 border border-white/10">
               <h3 className="font-display font-bold text-white mb-4">Budget de Février</h3>
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