export enum ActivityType {
  SOCIAL = 'Vie Associative & Social',
  CREATIVE = 'Culture & Expression',
  SPORT = 'Santé & Sports',
  EDUCATIONAL = 'Éducation & Prévention',
  OUTDOOR = 'Plein Air & Environnement',
  DEMOCRATIC = 'Vie Démocratique',
  FREE = 'Accueil & Milieu de vie'
}

export interface Material {
  item: string;
  quantity: string;
  supplier: string;
  acquired: boolean;
}

export interface Budget {
  estimatedCost: number;
  actualCost: number;
  items: { description: string; amount: number }[];
}

export interface Logistics {
  venueName: string;
  address: string;
  phoneNumber?: string;
  website?: string;
  transportRequired: boolean;
  transportMode?: string;
  distance?: string;
  travelTime?: string;
  meetingPoint?: string;
  departureTime?: string; // Heure du départ du transport
  returnTime?: string;    // Heure du retour du transport
}

export interface RiskManagement {
  hazards: string[];
  requiredInsurance: string;
  safetyProtocols: string[]; // Includes 'Code de vie' compliance
  emergencyContact: string;
  siteRules?: string[]; // New: Règlements spécifiques du site web
  complianceRequirements?: string[]; // New: Formulaires, décharges, certifications
}

export interface Staffing {
  leadStaff: string; // Adultes significatifs
  supportStaff: string[];
  requiredRatio: string;
  specialQualifications?: string;
}

export interface YouthInvolvement {
  level: 'Consultation' | 'Organisation' | 'Animation' | 'Participation';
  tasks: string[]; // Specific tasks delegated to youth
}

export interface Activity {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  type: ActivityType;
  description: string;
  objectives: string[]; // Linked to becoming Critical, Active, Responsible
  rmjqDimensions: string[]; // ['Critique', 'Actif', 'Responsable']
  logistics: Logistics;
  materials: Material[];
  budget: Budget;
  staffing: Staffing;
  riskManagement: RiskManagement;
  youthInvolvement: YouthInvolvement;
  communicationPlan: string;
  preparationScore: number; // 0-100
  backupPlan: string;
  evaluationCriteria: string[]; // Post-activity reflection
}