import { Activity, ActivityType } from "../types";

const STORAGE_KEY = 'mdj_activities_db_v4';

const DEFAULT_LOGISTICS = {
  venueName: 'MDJ (Aréna Jérôme-Cotnoir)',
  address: '5225 Rue de Courcelette, Trois-Rivières, QC G8Y 4L4',
  phoneNumber: '(819) 694-7564',
  website: 'https://mdjescalejeunesse.ca',
  transportRequired: false,
  meetingPoint: 'Local 2'
};

const FEB_2026_DATA: Activity[] = [
  {
    id: 'feb-03',
    title: 'Fêtes des Lockhead',
    date: '2026-02-03',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.LOISIRS,
    description: 'Célébration pour Médé-Tortue & Gaby-Shloupi.',
    objectives: ["Sentiment d'appartenance", "Plaisir"],
    rmjqDimensions: ['Relationnel'],
    logistics: { ...DEFAULT_LOGISTICS },
    materials: [{ item: 'Gâteau', quantity: '1', supplier: 'MDJ', acquired: true }],
    budget: { estimatedCost: 20, actualCost: 0, items: [{ description: 'Gâteau', amount: 20 }] },
    staffing: { leadStaff: 'Mikael Delage', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: ['Code de vie'], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: ['Décoration'] },
    communicationPlan: '',
    preparationScore: 90,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-04',
    title: 'CJ (Comité Jeunes) + Atelier Cœurs',
    date: '2026-02-04',
    startTime: '16:30',
    endTime: '21:00',
    type: ActivityType.VIE_ASSOCIATIVE,
    description: 'Rencontre du comité suivie d\'une soirée art créative sur le thème des cœurs.',
    objectives: ["Implication citoyenne", "Expression artistique"],
    rmjqDimensions: ['Responsable', 'Créatif'],
    logistics: { ...DEFAULT_LOGISTICS },
    materials: [],
    budget: { estimatedCost: 10, actualCost: 0, items: [{ description: 'Matériel art', amount: 10 }] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: ['Respect des idées'], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Organisation', tasks: ['Prise de décision', 'Animation'] },
    communicationPlan: '',
    preparationScore: 85,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-05',
    title: 'Décoration MDJ',
    date: '2026-02-05',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.CULTURELLE,
    description: 'Aménagement et décoration de la MDJ pour le thème Arts & Amour.',
    objectives: ["Appropriation du milieu"],
    rmjqDimensions: ['Actif'],
    logistics: { ...DEFAULT_LOGISTICS },
    materials: [],
    budget: { estimatedCost: 0, actualCost: 0, items: [] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: [], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Animation', tasks: ['Choix déco'] },
    communicationPlan: '',
    preparationScore: 80,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-06',
    title: 'Marche extérieure',
    date: '2026-02-06',
    startTime: '18:30',
    endTime: '19:30',
    type: ActivityType.SAINES_HABITUDES,
    description: 'Sortie active dans le quartier. La MDJ est fermée de 18h30 à 19h30.',
    objectives: ["Activité physique"],
    rmjqDimensions: ['Physique'],
    logistics: { ...DEFAULT_LOGISTICS, transportRequired: false },
    materials: [],
    budget: { estimatedCost: 0, actualCost: 0, items: [] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte'], requiredRatio: '1/15' },
    riskManagement: { hazards: ['Froid', 'Circulation'], safetyProtocols: ['Dénombrement'], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: [] },
    communicationPlan: '',
    preparationScore: 100,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-10',
    title: 'Soirée Libre (Détente)',
    date: '2026-02-10',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.LOISIRS,
    description: 'Temps libre et socialisation à la MDJ.',
    objectives: ["Bien-être mental"],
    rmjqDimensions: ['Relationnel'],
    logistics: { ...DEFAULT_LOGISTICS },
    materials: [],
    budget: { estimatedCost: 0, actualCost: 0, items: [] },
    staffing: { leadStaff: 'Mikael Delage', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: [], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: [] },
    communicationPlan: '',
    preparationScore: 100,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-11',
    title: 'Marathon de Jeux',
    date: '2026-02-11',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.LOISIRS,
    description: 'Soirée consacrée aux jeux de société et à la compétition amicale.',
    objectives: ["Habiletés sociales"],
    rmjqDimensions: ['Relationnel'],
    logistics: { ...DEFAULT_LOGISTICS },
    materials: [],
    budget: { estimatedCost: 0, actualCost: 0, items: [] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: [], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: [] },
    communicationPlan: '',
    preparationScore: 95,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-12',
    title: 'Randonnée Moulin Seigneurial',
    date: '2026-02-12',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.SAINES_HABITUDES,
    description: 'Randonnée en sentier au Moulin seigneurial de Pointe-du-Lac.',
    objectives: ["Plein air"],
    rmjqDimensions: ['Physique'],
    logistics: { 
      ...DEFAULT_LOGISTICS, 
      venueName: 'Moulin seigneurial', 
      address: '11930 rue Notre-Dame O.', 
      transportRequired: true,
      transportMode: 'Véhicules des intervenants',
      departureTime: '17:45',
      returnTime: '20:45'
    },
    materials: [],
    budget: { estimatedCost: 15, actualCost: 0, items: [{ description: 'Frais accès', amount: 15 }] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: ['Froid', 'Chutes'], safetyProtocols: ['Buddy system'], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: [] },
    communicationPlan: '',
    preparationScore: 75,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-13',
    title: 'Tête-à-tête : Justice',
    date: '2026-02-13',
    startTime: '17:00',
    endTime: '19:00',
    type: ActivityType.PREVENTION,
    description: 'Rencontre avec Équijustice Trois-Rivières sur les droits et la justice.',
    objectives: ["Connaissance des droits", "Esprit critique"],
    rmjqDimensions: ['Critique'],
    logistics: { ...DEFAULT_LOGISTICS, venueName: 'Équijustice', address: '543 rue Laviolette' },
    materials: [],
    budget: { estimatedCost: 0, actualCost: 0, items: [] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: [], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Consultation', tasks: [] },
    communicationPlan: '',
    preparationScore: 85,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-17',
    title: 'Soirée Libre (Social)',
    date: '2026-02-17',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.LOISIRS,
    description: 'Détente et socialisation.',
    objectives: ["Sentiment d'appartenance"],
    rmjqDimensions: ['Relationnel'],
    logistics: { ...DEFAULT_LOGISTICS },
    materials: [],
    budget: { estimatedCost: 0, actualCost: 0, items: [] },
    staffing: { leadStaff: 'Mikael Delage', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: [], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: [] },
    communicationPlan: '',
    preparationScore: 100,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-18',
    title: 'Formation Camping d\'Hiver',
    date: '2026-02-18',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.PREVENTION,
    description: 'Formation théorique sur les techniques de survie et sécurité hivernale.',
    objectives: ["Sécurité en plein air"],
    rmjqDimensions: ['Critique'],
    logistics: { ...DEFAULT_LOGISTICS },
    materials: [],
    budget: { estimatedCost: 0, actualCost: 0, items: [] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: [], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: [] },
    communicationPlan: '',
    preparationScore: 80,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-19',
    title: 'Pathfinder & Banquet',
    date: '2026-02-19',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.LOISIRS,
    description: 'Soirée jeu de rôle fantastique avec un grand banquet préparé ensemble.',
    objectives: ["Imaginaire", "Cuisine collective"],
    rmjqDimensions: ['Créatif', 'Relationnel'],
    logistics: { ...DEFAULT_LOGISTICS },
    materials: [{ item: 'Ingrédients repas', quantity: 'Lot', supplier: 'Achat', acquired: false }],
    budget: { estimatedCost: 60, actualCost: 0, items: [{ description: 'Épicerie', amount: 60 }] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: ['Coupures', 'Brûlures'], safetyProtocols: ['Supervision cuisine'], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Organisation', tasks: ['Cuisine', 'Maître de jeu'] },
    communicationPlan: '',
    preparationScore: 65,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-20',
    title: 'Campus Escalade',
    date: '2026-02-20',
    startTime: '18:00',
    endTime: '21:00',
    type: ActivityType.SAINES_HABITUDES,
    description: 'Sortie sportive d\'escalade de bloc.',
    objectives: ["Dépassement de soi"],
    rmjqDimensions: ['Physique'],
    logistics: { 
        ...DEFAULT_LOGISTICS, 
        venueName: 'Campus Escalade', 
        address: '3375 rue Girard',
        transportRequired: true,
        transportMode: 'Véhicules des intervenants',
        departureTime: '18:15',
        returnTime: '20:45'
    },
    materials: [],
    budget: { estimatedCost: 120, actualCost: 0, items: [{ description: 'Entrées bloc', amount: 120 }] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte'], requiredRatio: '1/15' },
    riskManagement: { hazards: ['Chutes'], safetyProtocols: ['Échauffement'], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: [] },
    communicationPlan: '',
    preparationScore: 50,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-24',
    title: 'Soirée Libre (Détente)',
    date: '2026-02-24',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.LOISIRS,
    description: 'Détente et socialisation.',
    objectives: ["Bien-être mental"],
    rmjqDimensions: ['Relationnel'],
    logistics: { ...DEFAULT_LOGISTICS },
    materials: [],
    budget: { estimatedCost: 0, actualCost: 0, items: [] },
    staffing: { leadStaff: 'Mikael Delage', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: [], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: [] },
    communicationPlan: '',
    preparationScore: 100,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-25',
    title: 'Atelier Santé Sexuelle',
    date: '2026-02-25',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.PREVENTION,
    description: 'Atelier discussion sur la prévention, l\'avortement et la santé sexuelle.',
    objectives: ["Esprit critique", "Prévention"],
    rmjqDimensions: ['Critique'],
    logistics: { ...DEFAULT_LOGISTICS },
    materials: [],
    budget: { estimatedCost: 0, actualCost: 0, items: [] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: [], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Consultation', tasks: [] },
    communicationPlan: '',
    preparationScore: 70,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-26',
    title: 'Amitié Autochtone',
    date: '2026-02-26',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.CULTURELLE,
    description: 'Soirée de plaisir avec les jeunes du Centre d\'Amitié Autochtone.',
    objectives: ["Ouverture culturelle"],
    rmjqDimensions: ['Relationnel', 'Créatif'],
    logistics: { 
      ...DEFAULT_LOGISTICS, 
      venueName: 'Centre Amitié Autochtone', 
      address: '3900 rue Laurent-Létourneau',
      transportRequired: true,
      transportMode: 'Véhicules des intervenants'
    },
    materials: [],
    budget: { estimatedCost: 40, actualCost: 0, items: [{ description: 'Frais activité', amount: 40 }] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte', 'Ann-Sushi (Stagiaire)'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: [], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: [] },
    communicationPlan: '',
    preparationScore: 60,
    backupPlan: '',
    evaluationCriteria: []
  },
  {
    id: 'feb-27',
    title: 'Pickleball',
    date: '2026-02-27',
    startTime: '17:30',
    endTime: '21:00',
    type: ActivityType.SAINES_HABITUDES,
    description: 'Activité sportive au Pavillon St-Arnaud.',
    objectives: ["Activité physique"],
    rmjqDimensions: ['Physique'],
    logistics: { 
      ...DEFAULT_LOGISTICS, 
      venueName: 'Pavillon St-Arnaud', 
      address: '2900 rue Mgr-St-Arnaud',
      transportRequired: true,
      transportMode: 'Véhicules des intervenants'
    },
    materials: [],
    budget: { estimatedCost: 0, actualCost: 0, items: [] },
    staffing: { leadStaff: 'Charles Frenette', supportStaff: ['Laurie Bray Pratte'], requiredRatio: '1/15' },
    riskManagement: { hazards: [], safetyProtocols: [], requiredInsurance: '', emergencyContact: 'Patrick Delage' },
    youthInvolvement: { level: 'Participation', tasks: [] },
    communicationPlan: '',
    preparationScore: 90,
    backupPlan: '',
    evaluationCriteria: []
  }
];

export const ActivityService = {
  getAll: async (): Promise<Activity[]> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        await ActivityService.saveAll(FEB_2026_DATA);
        return FEB_2026_DATA;
      }
      return JSON.parse(data) as Activity[];
    } catch (error) {
      console.error("Database load error", error);
      return [];
    }
  },

  save: async (activity: Activity): Promise<void> => {
    try {
      const current = await ActivityService.getAll();
      const index = current.findIndex(a => a.id === activity.id);
      
      let updated = [...current];
      if (index >= 0) {
        updated[index] = activity;
      } else {
        updated.push(activity);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Database save error", error);
      throw new Error("Impossible de sauvegarder l'activité.");
    }
  },

  saveAll: async (activities: Activity[]): Promise<void> => {
     try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
     } catch (error) {
       console.error("Database bulk save error", error);
     }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const current = await ActivityService.getAll();
      const updated = current.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Database delete error", error);
    }
  },

  reset: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
  }
};