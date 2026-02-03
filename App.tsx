import React, { useState, useRef, useEffect } from 'react';
import { Activity, ActivityType } from './types';
import ActivityModal from './components/ActivityModal';
import ConfigModal from './components/ConfigModal';
import { ActivityService } from './services/activityService';
import { FirebaseService, FirebaseConfig } from './services/firebaseService';
import { HtmlGeneratorService } from './services/htmlGeneratorService'; 
import { Calendar as CalendarIcon, PieChart, CheckCircle, AlertCircle, ArrowRight, LayoutGrid, ChevronLeft, ChevronRight, Upload, Plus, School, Palmtree, CalendarOff, Save, FileType, FileText, Trash2, Cloud, CloudOff, BellRing, Code, Target, Check, Utensils, LogOut, Copy, Settings, Zap, ExternalLink, Database, Wifi, WifiOff } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

// Helper pour créer des objets vides rapidement
const emptyLogistics = { 
  venueName: 'MDJ (Aréna Jérôme-Cotnoir)', 
  address: '5225 Rue de Courcelette, Trois-Rivières, QC G8Y 4L4', 
  phoneNumber: '(819) 694-7564',
  website: 'https://mdjescalejeunesse.ca',
  transportRequired: false, 
  departureTime: '', 
  returnTime: '' 
};
const emptyStats = { level: 'Participation', tasks: [] } as any;

// Helper pour générer une activité complète rapidement
const createActivity = (id: string, title: string, date: string, type: ActivityType, desc: string, logisticsOverride: any = {}, objectives: string[] = []): Activity => ({
  id,
  title,
  date,
  startTime: '17:30',
  endTime: '21:00',
  type,
  description: desc,
  objectives: objectives,
  rmjqDimensions: [],
  youthInvolvement: { level: 'Participation', tasks: [] },
  evaluationCriteria: [],
  logistics: { ...emptyLogistics, ...logisticsOverride },
  materials: [],
  budget: { estimatedCost: 0, actualCost: 0, items: [] },
  staffing: { leadStaff: '', supportStaff: [], requiredRatio: '1/15', specialQualifications: '' },
  riskManagement: { hazards: [], requiredInsurance: '', safetyProtocols: [], emergencyContact: 'Patrick Delage' },
  communicationPlan: '',
  preparationScore: 40, // Score de base pour les activités planifiées
  backupPlan: ''
});

// Données Février 2026 - Updated with correct RMJQ Activity Types & New Activities (Cooking + Pathfinder)
const INITIAL_ACTIVITIES: Activity[] = [
  createActivity('feb-03', 'Fêtes des Lockheed', '2026-02-03', ActivityType.LOISIRS, 'Célébration pour Médé-Tortue & Gaby-Shloupi.', {}, [
    "Loisirs et divertissement (Célébration, sentiment d'appartenance)."
  ]),
  createActivity('feb-04', 'CJ + Atelier Créatif', '2026-02-04', ActivityType.VIE_ASSOCIATIVE, 'Comité Jeunes à 16h30 suivi d\'une soirée Art.', { venueName: 'MDJ (Comité + Salle d\'art)' }, [
    "Vie associative (Pouvoir d'agir) & Expression artistique (Créativité)."
  ]),
  createActivity('feb-05', 'Décoration', '2026-02-05', ActivityType.CULTURELLE, 'Soirée Déco pour embellir la MDJ.', {}, [
    "Expression artistique et culturelle (Appropriation du milieu de vie)."
  ]),
  createActivity('feb-06', 'Marche extérieure', '2026-02-06', ActivityType.SAINES_HABITUDES, 'Promenade santé. Note: MDJ fermée de 18h30 à 19h30.', { venueName: 'Extérieur (Quartier)', transportRequired: false }, [
    "Saines habitudes de vie (Activité physique, bien-être mental)."
  ]),
  
  // 10 FÉVRIER - PATHFINDER SESSION 1 (AJOUTÉ)
  createActivity('feb-10', 'Pathfinder : La Quête', '2026-02-10', ActivityType.LOISIRS, 'Première session du mois. Création de personnages et début de l\'aventure.', {}, [
    "Loisirs et divertissement (Imaginaire, collaboration, résolution de problèmes)."
  ]),

  createActivity('feb-11', 'Marathon de Jeux', '2026-02-11', ActivityType.LOISIRS, 'Grande soirée jeux de société.', {}, [
    "Loisirs et divertissement (Habiletés sociales, respect des règles)."
  ]),
  
  // 12 FÉVRIER - RANDONNÉE
  {
    ...createActivity('feb-12', 'Randonnée en sentier', '2026-02-12', ActivityType.SAINES_HABITUDES, 'Sortie plein air au Moulin.', {
      venueName: 'Moulin seigneurial de Pointe-du-Lac',
      address: '11930, rue Notre-Dame Ouest, Trois-Rivières, QC G9B 6X1',
      phoneNumber: '(819) 377-1396',
      website: 'moulinpointedulac.recitsquifontjaser.com',
      transportRequired: true,
      transportMode: 'Véhicules MDJ',
      distance: '28.4 km (Aller-retour)',
      departureTime: '17:45',
      returnTime: '20:30'
    }, [
      "Saines habitudes de vie (Activité physique et contact avec la nature)."
    ]),
    riskManagement: {
      hazards: ['Chutes sur la glace', 'Égarement en forêt', 'Météo extrême'],
      requiredInsurance: '',
      safetyProtocols: [
        'Validation de l\'équipement (bottes, mitaines, multicouches) avant départ',
        'Système de jumelage (Buddy system)',
        'Trousse de premiers soins portable'
      ],
      emergencyContact: 'Patrick Delage'
    }
  },

  createActivity('feb-13', 'Tête-à-tête : Justice', '2026-02-13', ActivityType.PREVENTION, 'Rencontre sur la justice réparatrice et la médiation.', {
    venueName: 'Équijustice Trois-Rivières',
    address: '543, rue Laviolette, Trois-Rivières (Québec) G9A 1V4',
    phoneNumber: '(819) 372-9913',
    website: 'equijustice.ca/fr/membres/trois-rivieres',
    transportRequired: true,
    departureTime: '16:45',
    returnTime: '19:00',
    meetingPoint: 'MDJ'
  }, [
    "Prévention et sensibilisation (Connaissance des droits et responsabilités)."
  ]),
  
  createActivity('feb-17', 'Soirée Libre', '2026-02-17', ActivityType.LOISIRS, 'Détente.', {}, [
    "Saines habitudes de vie & Loisirs (Socialisation informelle)."
  ]),
  createActivity('feb-18', 'Camping d\'hiver (Théorie)', '2026-02-18', ActivityType.PREVENTION, 'Formation théorique pour la préparation au camping.', {}, [
    "Prévention et sensibilisation (Sécurité, autonomie en milieu naturel)."
  ]),
  
  // 19 FÉVRIER - PATHFINDER SESSION 2
  createActivity('feb-19', 'Pathfinder & Banquet', '2026-02-19', ActivityType.LOISIRS, 'Soirée Jeu de rôle sur table avec repas spécial.', {}, [
    "Loisirs (Imaginaire) & Saines habitudes de vie (Alimentation/Banquet)."
  ]),

  // 20 FÉVRIER - ESCALADE
  {
    ...createActivity('feb-20', 'Campus Escalade', '2026-02-20', ActivityType.SAINES_HABITUDES, 'Sortie sportive d\'escalade de bloc. Tarifs: Jeunes 20,68$, Adultes 25,28$.', {
      venueName: 'Campus Escalade',
      address: '3375, rue Girard, Trois-Rivières, QC G8Z 2M5',
      phoneNumber: '(819) 840-3161',
      website: 'campusescalade.com',
      transportRequired: true,
      distance: '3.2 km (Aller-retour)',
      departureTime: '18:00',
      returnTime: '20:30'
    }, [
      "Saines habitudes de vie (Dépassement de soi, activité physique)."
    ]),
    budget: {
      estimatedCost: 300, 
      actualCost: 0, 
      items: [
        { description: 'Entrées Jeunes (~12 x 20,68$)', amount: 248.16 },
        { description: 'Entrées Adultes (~2 x 25,28$)', amount: 50.56 }
      ]
    },
    riskManagement: {
      hazards: ['Chutes de hauteur', 'Blessures musculosquelettiques'],
      requiredInsurance: 'Assurance civile MDJ + Décharge Campus',
      safetyProtocols: [
        'Vérification des formulaires de décharge/consentement',
        'Respect strict des consignes du centre',
        'Échauffement obligatoire'
      ],
      complianceRequirements: ['Formulaires de consentement parentaux signés'],
      emergencyContact: 'Patrick Delage'
    },
    staffing: {
      leadStaff: 'Charles Frenette',
      supportStaff: ['Laurie Bray Pratte', 'Mikael Delage', 'Ann-Sushi'],
      requiredRatio: '1/6',
      specialQualifications: 'Vigilance accrue (Équipe complète requise)'
    }
  },
  
  // 24 FÉVRIER - ATELIER CUISINE (MODIFIÉ: Jeunes aux fourneaux)
  {
    ...createActivity('feb-24', 'Cuisine : Jeunes aux fourneaux', '2026-02-24', ActivityType.SAINES_HABITUDES, 'Atelier culinaire où les jeunes préparent des Tacos pour le groupe.', { venueName: 'Cuisine MDJ' }, [
      "Saines habitudes de vie (Alimentation, compétences culinaires, autonomie)."
    ]),
    youthInvolvement: {
      level: 'Organisation',
      tasks: ['Couper les légumes', 'Cuisson de la viande', 'Mise en place du buffet']
    }
  },

  // 25 FÉVRIER - SANTÉ SEXUELLE
  {
    ...createActivity('feb-25', 'Prévention & Santé sexuelle', '2026-02-25', ActivityType.PREVENTION, 'Atelier discussion sans tabou.', {}, [
      "Prévention et sensibilisation & Vie associative (Esprit critique)."
    ]),
    riskManagement: {
      hazards: ['Inconfort émotionnel', 'Jugement des pairs', 'Divulgation personnelle non-désirée'],
      requiredInsurance: '',
      safetyProtocols: [
        'Instauration d\'un climat de non-jugement',
        'Rappel de la confidentialité absolue',
        'Distribution discrète de ressources (dépliants) à la sortie'
      ],
      emergencyContact: 'Patrick Delage'
    }
  },

  createActivity('feb-26', 'Amitié Autochtone', '2026-02-26', ActivityType.CULTURELLE, 'Visite et échange culturel.', {
    venueName: 'Centre d’amitié autochtone (CAATR)',
    address: '3900, rue Laurent-Létourneau, Trois-Rivières, QC G8Y 6G3',
    phoneNumber: '(819) 840-6155',
    website: 'caatr.ca',
    transportRequired: true,
    departureTime: '17:30',
    returnTime: '20:00'
  }, [
    "Expression artistique et culturelle (Ouverture à la diversité)."
  ]),
  
  // 27 FÉVRIER - PICKLEBALL
  {
    ...createActivity('feb-27', 'Pickleball', '2026-02-27', ActivityType.SAINES_HABITUDES, 'Sport de raquette.', {
      venueName: 'Pavillon St-Arnaud',
      address: '2900, rue Mgr-St-Arnaud, Trois-Rivières, QC G9A 5L2',
      phoneNumber: '(819) 374-2422',
      website: 'pavillonst-arnaud.com',
      transportRequired: true,
      distance: '8.4 km (Aller-retour)',
      departureTime: '18:15',
      returnTime: '20:15'
    }, [
      "Saines habitudes de vie (Santé physique par le sport)."
    ]),
    riskManagement: {
      hazards: ['Blessures sportives légères (entorses)', 'Impacts de balle'],
      requiredInsurance: '',
      safetyProtocols: ['Port de chaussures adéquates', 'Échauffement'],
      emergencyContact: 'Patrick Delage'
    }
  }
];

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
  type: ActivityType.LOISIRS,
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

const App = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  // Initialisation sur Février 2026 (Mois 1 = Février)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); 
  
  // Drag and Drop State
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);

  // Cloud / Auth State
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [userAccount, setUserAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Detect Environment
  const isBoltEnv = typeof window !== 'undefined' && (
      window.location.hostname.includes('bolt.new') || 
      window.location.hostname.includes('stackblitz') || 
      window.location.hostname.includes('usercontent.goog')
  );

  const isEditorEnv = typeof window !== 'undefined' && window.location.hostname.includes('aistudio.google.com');

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

  // Initial Data Load & Firebase Auth Check
  useEffect(() => {
    const init = async () => {
       if (FirebaseService.hasConfig()) {
           FirebaseService.initialize();
           const user = FirebaseService.getUser();
           if (user) {
               setUserAccount(user);
               setIsCloudMode(true);
           }
       }
       loadData();
    };
    init();
  }, [isCloudMode]);

  const loadData = async () => {
    const service = isCloudMode ? FirebaseService : ActivityService;
    try {
        const data = await service.getAll();
        setActivities(data.length > 0 ? data : (isCloudMode ? [] : INITIAL_ACTIVITIES));
    } catch (e) {
        console.error("Erreur chargement", e);
        if (isCloudMode) {
            alert("Erreur de synchronisation Firebase. Vérifiez votre connexion.");
        }
    }
  };

  const handleConnectClick = async () => {
      if (isCloudMode) {
          // Déconnexion
          await FirebaseService.logout();
          setUserAccount(null);
          setIsCloudMode(false);
          // Optionnel : Reset la config si on veut changer de projet
          // FirebaseService.resetConfig(); 
          window.location.reload();
          return;
      }

      // Connexion
      if (!FirebaseService.hasConfig()) {
          setShowConfigModal(true);
      } else {
          try {
              setIsLoading(true);
              const user = await FirebaseService.login();
              if (user) {
                  setUserAccount(user);
                  setIsCloudMode(true);
              }
          } catch (e) {
              alert("Erreur de connexion Google.");
          } finally {
              setIsLoading(false);
          }
      }
  };

  const handleConfigSave = async (config: FirebaseConfig) => {
      FirebaseService.saveConfig(config);
      setShowConfigModal(false);
      // Auto-trigger login
      handleConnectClick();
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
    const service = isCloudMode ? FirebaseService : ActivityService;
    
    // Update State Optimistically
    setActivities(prev => {
      const exists = prev.some(a => a.id === activityToSave.id);
      if (exists) {
        return prev.map(a => a.id === activityToSave.id ? activityToSave : a);
      } else {
        return [...prev, activityToSave];
      }
    });

    try {
        await service.save(activityToSave);
    } catch (e) {
        alert("Erreur lors de la sauvegarde cloud.");
    }
    
    setSelectedActivity(null);
  };

  const handleDeleteActivity = async (activityId: string) => {
      if(!confirm("Supprimer cette activité ?")) return;
      
      // Optimistic delete
      setActivities(prev => prev.filter(a => a.id !== activityId));
      setSelectedActivity(null);

      const service = isCloudMode ? FirebaseService : ActivityService;
      await service.delete(activityId);
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, activityId: string) => {
    e.dataTransfer.setData("text/plain", activityId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedActivityId(activityId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Essential to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    if (!draggedActivityId) return;

    const activityToMove = activities.find(a => a.id === draggedActivityId);
    if (activityToMove && activityToMove.date !== targetDate) {
        // Create updated activity with new date
        const updatedActivity = { ...activityToMove, date: targetDate };
        
        // Optimistic Update
        setActivities(prev => prev.map(a => a.id === draggedActivityId ? updatedActivity : a));
        
        // Persist
        const service = isCloudMode ? FirebaseService : ActivityService;
        await service.save(updatedActivity);
    }
    setDraggedActivityId(null);
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

  // --- RESET HANDLER ---
  const handleReset = async () => {
    if (isCloudMode) {
        if(confirm("ATTENTION: En mode Firebase, ceci effacera votre configuration locale et vous déconnectera.\n\n(Les données sur le serveur ne seront pas effacées).")) {
             FirebaseService.resetConfig();
        }
        return;
    }
    if(confirm("ATTENTION: Voulez-vous vraiment effacer toutes les données locales et recommencer à zéro ?")) {
       await ActivityService.reset();
       window.location.reload();
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

  // --- LOGIQUE ALERTE URGENCE 14 JOURS ---
  const getUrgentAlerts = () => {
    // On simule "aujourd'hui" comme étant le début du mois affiché dans le simulateur (par défaut 1er Fév 2026)
    // Cela permet de voir la fonctionnalité en action avec les données de test.
    const simulatedToday = new Date(currentDate); 
    const twoWeeksLater = new Date(simulatedToday);
    twoWeeksLater.setDate(simulatedToday.getDate() + 14);

    return activities.filter(act => {
       const actDate = new Date(act.date + 'T00:00:00'); // Force local time
       // Est dans la fenêtre des 14 jours ET n'est pas "Prêt" (< 80%)
       return actDate >= simulatedToday && actDate <= twoWeeksLater && act.preparationScore < 80;
    }).sort((a,b) => a.date.localeCompare(b.date));
  };

  const urgentAlerts = getUrgentAlerts();

  // --- RMJQ TARGETS CALCULATION ---
  const getRMJQProgress = () => {
    const counts: Record<string, number> = {};
    Object.values(ActivityType).forEach(t => counts[t] = 0);
    
    // Compteur spécifique cuisine
    let cookingCount = 0;

    displayedActivities.forEach(act => {
        if(counts[act.type] !== undefined) counts[act.type]++;
        
        // Détection "Atelier Cuisine"
        const titleLower = act.title.toLowerCase();
        if (titleLower.includes('cuisine') || titleLower.includes('tacos') || titleLower.includes('repas')) {
            cookingCount++;
        }
    });
    
    const results: { type: string; count: number; target: number; met: boolean }[] = Object.values(ActivityType).map(type => ({
        type,
        count: counts[type],
        target: 2,
        met: counts[type] >= 2
    }));

    // Ajout de la cible spécifique pour la cuisine
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
        {isEditorEnv && (
           <div className="bg-red-500 text-white px-4 py-2 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Attention: Vous êtes dans l'éditeur. Ouvrez l'aperçu dans un nouvel onglet.
           </div>
        )}
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
             
             {isBoltEnv && (
                 <div className="hidden md:flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" title="Environnement de développement détecté">
                     <Zap className="w-3 h-3" /> BOLT
                 </div>
             )}

             {/* Connection Status Indicator / Toggle */}
            <button
                onClick={handleConnectClick}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider ${
                    isCloudMode 
                    ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30' 
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                title={isCloudMode ? "Déconnecter de Firebase" : "Connecter à Firebase"}
            >
                {isLoading ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : isCloudMode ? (
                    <>
                        <Database className="w-4 h-4" />
                        <span className="hidden md:inline">FIREBASE ACTIF</span>
                        <Check className="w-3 h-3 ml-1" />
                    </>
                ) : (
                    <>
                        <Database className="w-4 h-4 opacity-50" />
                        <span className="hidden md:inline">LOCAL SEULEMENT</span>
                    </>
                )}
            </button>

            <div className="hidden md:flex items-center gap-2 bg-mdj-black/50 px-4 py-2 rounded-full border border-mdj-cyan/30 text-mdj-cyan font-bold shadow-[0_0_10px_rgba(0,255,255,0.1)]">
              <PieChart className="w-4 h-4" />
              <span className="font-mono">{totalBudget.toFixed(0)}$</span>
            </div>
             <div className="hidden md:flex items-center gap-2 bg-mdj-black/50 px-4 py-2 rounded-full border border-mdj-magenta/30 text-mdj-magenta font-bold shadow-[0_0_10px_rgba(255,0,255,0.1)]">
              <CheckCircle className="w-4 h-4" />
              <span>Prêts: {preparedCount}/{displayedActivities.length}</span>
            </div>
            
            <button onClick={handleReset} className={`p-2 rounded-full transition-colors ${isCloudMode ? 'text-gray-600 hover:text-red-500' : 'text-red-500 hover:bg-red-500/10'}`} title="Réinitialiser">
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
              
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => HtmlGeneratorService.downloadHtml(activities, currentDate)} 
                   className="flex items-center gap-2 bg-mdj-cyan/20 text-mdj-cyan border border-mdj-cyan/30 px-4 py-2 rounded-xl hover:bg-mdj-cyan/30 transition-all text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                   title="Générer le calendrier HTML pour impression"
                 >
                   <Code className="w-4 h-4" />
                   EXPORTER HTML
                 </button>
              </div>

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
                  <div 
                    key={day} 
                    className={dayCellClass} 
                    title={schoolEvent?.label}
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
                    <button onClick={(e) => { e.stopPropagation(); handleCreateActivity(dateStr); }} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-mdj-cyan text-black rounded-full hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,255,0.3)] z-10" title="Ajouter une activité">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            
            {/* ALERTES URGENTES 2 SEMAINES */}
            <div className={`glass-strong rounded-3xl shadow-xl p-6 border ${urgentAlerts.length > 0 ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}>
               <h3 className={`font-display font-bold mb-4 flex items-center gap-2 ${urgentAlerts.length > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                 <BellRing className={`w-5 h-5 ${urgentAlerts.length > 0 ? 'animate-bounce-soft' : ''}`}/> Alertes (14 jours)
               </h3>
               {urgentAlerts.length > 0 ? (
                 <div className="space-y-3">
                   {urgentAlerts.map(act => (
                     <div key={act.id} onClick={() => setSelectedActivity(act)} className="cursor-pointer p-3 bg-red-500/10 rounded-xl border border-red-500/30 hover:bg-red-500/20 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <div className="flex justify-between items-start pl-2">
                           <div>
                             <div className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">{act.title}</div>
                             <div className="text-xs text-red-400 font-mono mt-0.5">{act.date} • {act.preparationScore}%</div>
                           </div>
                           <AlertCircle className="w-4 h-4 text-red-500"/>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteActivity(act.id); }} className="text-red-400 hover:text-white p-1"><Trash2 className="w-3 h-3"/></button>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                    <span className="text-xs italic">Aucune urgence imminente.</span>
                 </div>
               )}
            </div>

            {/* RMJQ TARGETS DASHBOARD */}
            <div className="glass rounded-3xl shadow-xl p-6 border border-white/10">
               <h3 className="font-display font-bold text-white mb-6 flex items-center gap-2"><Target className="w-5 h-5 text-mdj-orange"/> Cibles RMJQ</h3>
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

      {showConfigModal && (
        <ConfigModal 
          onSave={handleConfigSave} 
          onClose={() => setShowConfigModal(false)} 
        />
      )}

      {selectedActivity && <ActivityModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} onSave={handleSaveActivity} />}
    </div>
  );
};

export default App;