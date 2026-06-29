import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export const ActivityTypeEnum = z.enum([
    'Accueil, Écoute & Milieu de Vie',
    'Réussite scolaire',
    'Accompagnement Individualisé',
    'Intervention & Gestion de Crise',
    'Animation (sorties, activités, séjours)',
    'Prévention & Sensibilisation (Interne)',
    'Prévention & Sensibilisation (Partenaire)',
    'Vie Associative & Bénévolat Jeunes',
    'Promotion, Concertation & Gestion',
    'Activité physique',
    'Atelier culinaire',
    'Activité démocratique (CJ)',
    'Prévention (Interne)',
    'Prévention (Partenaires)',
    'Accompagnement individuel',
    'Intervention & Crise',
    'Vie associative & Bénévolat',
    'Aide aux devoirs',
    'Soirée libre & Animation',
    'Sortie & Activité',
    'MDJ Fermée'
]);

export const OLD_TO_NEW_ACTIVITY_TYPES: Record<string, string> = {
    'Aide aux Devoirs & Soutien Scolaire': 'Réussite scolaire',
    'Réussite Scolaire & Milieu de Vie': 'Réussite scolaire',
    'Saines habitudes de vie': 'Animation (sorties, activités, séjours)',
    'Vie associative et démocratique': 'Vie Associative & Bénévolat Jeunes',
    'Prévention et sensibilisation': 'Prévention & Sensibilisation (Interne)',
    'Expression artistique et culturelle': 'Animation (sorties, activités, séjours)',
    'Loisirs et divertissements': 'Animation (sorties, activités, séjours)',
    'CUISINE': 'Atelier culinaire',
    'Coup de pouce': 'Accompagnement Individualisé',
    'Culte et spiritualité': 'Accueil, Écoute & Milieu de Vie',
    'Culturelle': 'Animation (sorties, activités, séjours)',
    'Formation': 'Prévention & Sensibilisation (Interne)',
    'Plein air': 'Animation (sorties, activités, séjours)',
    'Sortie': 'Animation (sorties, activités, séjours)',
    'Sportive': 'Activité physique',
    'Journée spéciale': 'Accueil, Écoute & Milieu de Vie',
    'Autre': 'Accueil, Écoute & Milieu de Vie'
};

export function normalizeActivityType(type: any, title?: string): string | null {
    if (type === null || type === undefined) return null;
    const typeStr = typeof type === 'string' ? type.trim() : '';
    if (!typeStr) return null;
    if (ActivityTypeEnum.safeParse(typeStr).success) {
        return typeStr;
    }
    const remapped = OLD_TO_NEW_ACTIVITY_TYPES[typeStr];
    if (remapped) return remapped;

    if (title) {
        const titleLower = title.toLowerCase();
        if (/soirée libre|accueil|ouverture|drop-in/.test(titleLower)) {
            return 'Accueil, Écoute & Milieu de Vie';
        } else if (/devoirs|scolaire|tutorat/.test(titleLower)) {
            return 'Réussite scolaire';
        } else if (/comité|c\.j\.|assemblée|bénévolat/.test(titleLower)) {
            return 'Vie Associative & Bénévolat Jeunes';
        } else if (/prévention|sensibilisation|atelier/.test(titleLower)) {
            return 'Prévention & Sensibilisation (Interne)';
        } else if (/sport|entraînement|physique|gym/.test(titleLower)) {
            return 'Activité physique';
        } else if (/cuisine|culinaire|recette|bouffe/.test(titleLower)) {
            return 'Atelier culinaire';
        } else if (/conseil|c\.j\.|démocratique/.test(titleLower)) {
            return 'Activité démocratique (CJ)';
        }
    }
    return 'Accueil, Écoute & Milieu de Vie'; // default remapped fallback for unrecognized non-empty strings
}


export const YouthInvolvementLevelEnum = z.enum([
    'Consultation',
    'Organisation',
    'Animation',
    'Participation',
]);

export const UserRoleEnum = z.enum(['super_admin', 'admin', 'animator', 'viewer']);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const MemberStatusEnum = z.enum(['Actif', 'Inactif', 'Suspendu']);
export const MemberGenderEnum = z.enum(['Garçon', 'Fille', 'Non-binaire', 'Préfère ne pas répondre']);
export const MemberTypeEnum = z.enum(['Membre actif jeune', 'Membre associé/adulte', 'Visiteur d\'un jour']);
export const MemberReferenceSourceEnum = z.enum(['Ami', 'École', 'DPJ', 'Travailleur de rue', 'Autre']);

export const BoardRoleEnum = z.enum(['Président(e)', 'Vice-président(e)', 'Trésorier(ère)', 'Secrétaire', 'Administrateur(trice)', 'Membre honoraire']);

// ═══════════════════════════════════════════════════════════════════════════
// SUB-SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const MaterialSchema = z.object({
    item: z.string().max(200),
    quantity: z.string().max(50),
    supplier: z.string().max(200),
    acquired: z.boolean(),
});

export const BudgetItemSchema = z.object({
    description: z.string().max(200),
    amount: z.number().min(0),
});

export const BudgetSchema = z.object({
    estimatedCost: z.number().min(0),
    actualCost: z.number().min(0),
    items: z.array(BudgetItemSchema),
    fundingSource: z.string().max(100).default('Mission globale'),
    youthDonationsCount: z.number().min(0).default(0),
    youthDonationsAmount: z.number().min(0).default(0),
    youthDiscountsCount: z.number().min(0).default(0),
    youthDiscountsAmount: z.number().min(0).default(0),
});

export const LogisticsSchema = z.object({
    venueName: z.string().max(200).default(''),
    address: z.string().max(300).default(''),
    phoneNumber: z.string().max(100).optional().nullable(),
    website: z.string().max(500).optional().nullable(),
    facebook: z.string().max(500).optional().nullable(),
    email: z.string().max(200).optional().nullable(),
    transportRequired: z.boolean().default(false),
    transportMode: z.string().max(100).optional().nullable(),
    distance: z.string().max(50).optional().nullable(),
    travelTime: z.string().max(50).optional().nullable(),
    meetingPoint: z.string().max(200).optional().nullable(),
    departureTime: z.string().max(10).optional().nullable(),
    returnTime: z.string().max(10).optional().nullable(),
    costPerPerson: z.number().min(0).default(0),
    isFree: z.boolean().default(true),
    otherAddresses: z.array(z.string()).default([]),
    websites: z.array(z.string()).default([]),
    reservedSpaces: z.array(z.string()).default([]),
}).default({
    venueName: '',
    address: '',
    transportRequired: false,
    costPerPerson: 0,
    isFree: true,
    otherAddresses: [],
    websites: [],
    reservedSpaces: []
});

export const RiskManagementSchema = z.object({
    hazards: z.array(z.string().max(200)).default([]),
    requiredInsurance: z.string().max(200).default(''),
    safetyProtocols: z.array(z.string().max(200)).default([]),
    emergencyContact: z.string().max(200).default(''),
    siteRules: z.array(z.string().max(200)).default([]),
    complianceRequirements: z.array(z.string().max(200)).default([]),
}).default({
    hazards: [],
    requiredInsurance: '',
    safetyProtocols: [],
    emergencyContact: '',
    siteRules: [],
    complianceRequirements: []
});

export const StaffingSchema = z.object({
    leadStaff: z.string().max(100).default(''),
    supportStaff: z.array(z.string().max(100)).default([]),
    requiredRatio: z.string().max(20).default(''),
    specialQualifications: z.string().max(500).default(''),
    animationType: z.enum(['Interne', 'Partenaire', 'Mixte']).default('Interne'),
}).default({
    leadStaff: '',
    supportStaff: [],
    requiredRatio: '',
    specialQualifications: '',
    animationType: 'Interne'
});

export const YouthInvolvementSchema = z.object({
    level: YouthInvolvementLevelEnum.optional().nullable(),
    tasks: z.array(z.string().max(200)).default([]),
}).default({
    level: null,
    tasks: []
});

export const ActivityDocumentSchema = z.object({
    id: z.string(),
    name: z.string().max(200),
    type: z.string().max(100),
    size: z.number().min(0),
    url: z.string(),
    dateAdded: z.number(),
});

export const CommentSchema = z.object({
    id: z.string(),
    userId: z.string(),
    userName: z.string(),
    userEmail: z.string().email(),
    text: z.string().max(2000),
    timestamp: z.number(),
});

export const ChecklistItemSchema = z.object({
    item: z.string().max(200),
    completed: z.boolean().default(false),
});

export const ChangelogEntrySchema = z.object({
    timestamp: z.number(),
    userName: z.string(),
    userEmail: z.string().email(),
    action: z.string().max(200),
});

export const ActivityStatsSchema = z.object({
    presentMale: z.number().min(0).default(0),
    presentFemale: z.number().min(0).default(0),
    presentNonBinary: z.number().min(0).default(0),
    newMembers: z.number().min(0).default(0),
    age12_14: z.number().min(0).default(0),
    age15_17: z.number().min(0).default(0),
    age18plus: z.number().min(0).default(0),
    sociodemographicNotes: z.string().max(2000).default(''),
    participantsList: z.array(z.string()).default([]), // For unique PSOC counting
    regularMealsServed: z.number().min(0).default(0),
}).default({
    presentMale: 0,
    presentFemale: 0,
    presentNonBinary: 0,
    newMembers: 0,
    age12_14: 0,
    age15_17: 0,
    age18plus: 0,
    sociodemographicNotes: '',
    participantsList: [],
    regularMealsServed: 0,
});

export const YouthContributionSchema = z.object({
    id: z.string(),
    youthName: z.string().max(200),
    volunteerHours: z.number().min(0).default(0),
    rewardGiven: z.string().max(500).default(''),
    reason: z.string().max(1000).default(''),
});

export const MaterialPreventionSchema = z.object({
    menstrualProductsDistributed: z.number().min(0).default(0),
    condomsDistributed: z.number().min(0).default(0),
    documentsDistributed: z.number().min(0).default(0),
    notes: z.string().max(1000).default(''),
});

export const AutonomousProjectSchema = z.object({
    id: z.string(),
    name: z.string().max(200),
    description: z.string().max(1000).default(''),
});

// ═══════════════════════════════════════════════════════════════════════════
// JOURNAL DE BORD (JDB) & PSOC SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const EvaluationSchema = z.object({
    preparationTime: z.string().max(100).default(''), // Temps de préparation en amont
    unfolding: z.string().max(2000).default(''),
    unexpectedEvents: z.string().max(2000).default(''), // Imprévus
    highlights: z.string().max(2000).default(''),
    verbatims: z.string().max(2000).default(''), // Citations textuelles
    globalAppreciation: z.string().max(2000).default(''),
    futureNeeds: z.string().max(2000).default(''),
    youthFeedbackRating: z.number().min(0).max(5).default(0),
    youthFeedbackComments: z.string().max(2000).default(''),
    youthFeedbackCount: z.number().min(0).default(0),
}).default({
    preparationTime: '',
    unfolding: '',
    unexpectedEvents: '',
    highlights: '',
    verbatims: '',
    globalAppreciation: '',
    futureNeeds: '',
    youthFeedbackRating: 0,
    youthFeedbackComments: '',
    youthFeedbackCount: 0,
});

export const InterventionNoteSchema = z.object({
    id: z.string(),
    youthName: z.string().max(200).default(''),
    type: z.enum(['Écoute active', 'Médiation', 'Référence externe', 'Suivi individuel', 'Gestion de crise', 'Autre']).default('Écoute active'),
    description: z.string().max(3000).default(''),
    isConfidential: z.boolean().default(true),
});

export const ClinicalObservationsSchema = z.object({
    climate: z.string().max(2000).default(''),
    dynamics: z.string().max(2000).default(''),
    relationshipQuality: z.string().max(2000).default(''),
    specificInterventions: z.string().max(3000).default(''),
    referrals: z.string().max(2000).default(''), // Références externes
    concerningSituations: z.string().max(3000).default(''),
    followUpPlanning: z.string().max(2000).default(''),
    groupClimate: z.array(z.string()).default([]), // Checkbox selections from reference
    groupDynamicsNotes: z.string().max(2000).default(''),
    significantExchanges: z.number().min(0).default(0), // Counter for informal interventions
    interventionNotes: z.array(InterventionNoteSchema).default([]),
    dpjReports: z.number().min(0).default(0),
    emergencyMeals: z.number().min(0).default(0),
    jasetteTheme: z.string().default(''),
    jasetteYouthCount: z.number().min(0).default(0),
    externalReferralsCount: z.number().min(0).default(0),
    majorInterventionsCount: z.number().min(0).default(0),
    majorInterventionsHours: z.number().min(0).default(0),
}).default({
    climate: '',
    dynamics: '',
    relationshipQuality: '',
    specificInterventions: '',
    referrals: '',
    concerningSituations: '',
    followUpPlanning: '',
    groupClimate: [],
    groupDynamicsNotes: '',
    significantExchanges: 0,
    interventionNotes: [],
    dpjReports: 0,
    emergencyMeals: 0,
    jasetteTheme: '',
    jasetteYouthCount: 0,
    externalReferralsCount: 0,
    majorInterventionsCount: 0,
    majorInterventionsHours: 0,
});

export const CommunityIndicatorsSchema = z.object({
    volunteerCount: z.number().min(0).default(0), // Adultes
    volunteerHours: z.number().min(0).default(0),
    volunteerTasks: z.string().max(2000).default(''),
    youthVolunteerCount: z.number().min(0).default(0), // Jeunes
    youthVolunteerHours: z.number().min(0).default(0),
    youthVolunteerTasks: z.string().max(2000).default(''),
    partnerships: z.string().max(2000).default(''),
    milieuContributions: z.string().max(2000).default(''),
    challenges: z.string().max(2000).default(''),
    youthCommitteeDecisions: z.string().max(2000).default(''),
    socialMediaEngagement: z.number().min(0).default(0),
    mediaInterviews: z.string().max(2000).default(''),
    outreachNotes: z.string().max(2000).default(''),
    isFundingActivity: z.boolean().default(false),
    fundingAmount: z.number().min(0).default(0),
    materialDonations: z.string().max(2000).default(''),
    familiesHelped: z.number().min(0).default(0),
    citizenMobilizationWorkshops: z.number().min(0).default(0),
    youthSelectedExternalProjects: z.number().min(0).default(0),
    tablesFrequented: z.number().min(0).default(0),
    politicalMeetings: z.number().min(0).default(0),
    provincialAdhesions: z.number().min(0).default(0),
    youthRepresentativesWithVote: z.number().min(0).default(0),
    outreachLocation: z.string().max(300).default(''),
    outreachParticipantsCount: z.number().min(0).default(0),
    outreachMaterialCount: z.number().min(0).default(0),
    militantismCause: z.string().max(500).default(''),
    militantismYouthCount: z.number().min(0).default(0),
    militantismActions: z.string().max(2000).default(''),
    boardVolunteerHours: z.number().min(0).default(0),
    concertationHoursCDC: z.number().min(0).default(0),
    concertationHoursTROC: z.number().min(0).default(0),
    concertationPrepHours: z.number().min(0).default(0),
    fundingResearchHours: z.number().min(0).default(0),
}).default({
    volunteerCount: 0,
    volunteerHours: 0,
    volunteerTasks: '',
    youthVolunteerCount: 0,
    youthVolunteerHours: 0,
    youthVolunteerTasks: '',
    partnerships: '',
    milieuContributions: '',
    challenges: '',
    youthCommitteeDecisions: '',
    socialMediaEngagement: 0,
    mediaInterviews: '',
    outreachNotes: '',
    isFundingActivity: false,
    fundingAmount: 0,
    materialDonations: '',
    familiesHelped: 0,
    citizenMobilizationWorkshops: 0,
    youthSelectedExternalProjects: 0,
    tablesFrequented: 0,
    politicalMeetings: 0,
    provincialAdhesions: 0,
    youthRepresentativesWithVote: 0,
    outreachLocation: '',
    outreachParticipantsCount: 0,
    outreachMaterialCount: 0,
    militantismCause: '',
    militantismYouthCount: 0,
    militantismActions: '',
    boardVolunteerHours: 0,
    concertationHoursCDC: 0,
    concertationHoursTROC: 0,
    concertationPrepHours: 0,
    fundingResearchHours: 0,
});

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY & PURCHASING SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const InventoryItemSchema = z.object({
    id: z.string(),
    name: z.string().max(200),
    category: z.string().max(100),
    totalQuantity: z.number().min(0),
    condition: z.enum(['Neuf', 'Bon', 'Usé', 'À réparer', 'Perdu']).default('Bon'),
    location: z.string().max(200).default(''),
    isConsumable: z.boolean().default(false),
    minThreshold: z.number().min(0).default(0),
    unitCost: z.number().min(0).default(0),
});

export const MaterialReservationSchema = z.object({
    id: z.string(),
    activityId: z.string(),
    itemId: z.string(),
    itemName: z.string().max(200), // Denormalized for easier display
    quantityRequired: z.number().min(0),
    actualQuantityUsed: z.number().min(0).optional(),
    usageNotes: z.string().max(500).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(['Réservé', 'Conflit (Manque)', 'Consommé', 'Terminé']).default('Réservé'),
});

export const PedagogySchema = z.object({
    objectives: z.array(z.string()).default([]).nullable(),
    rmjqDimensions: z.array(z.string()).default([]).nullable(),
    psocTags: z.array(z.string()).default([]).nullable(),
}).default({
    objectives: [],
    rmjqDimensions: [],
    psocTags: [],
});

export const PurchaseRequestSchema = z.object({
    id: z.string(),
    itemId: z.string().nullable(),
    customName: z.string().max(200).nullable(),
    quantityNeeded: z.number().min(1),
    reason: z.string().max(500),
    linkedActivityId: z.string().nullable(),
    status: z.enum(['En attente d\'approbation', 'Approuvé', 'Commandé', 'Reçu', 'Refusé']).default('En attente d\'approbation'),
    estimatedCost: z.number().min(0).default(0),
    requestedBy: z.string().email(),
    timestamp: z.number(),
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ACTIVITY SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const ActivitySchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Le titre est requis').max(200),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    startTime: z.string().default('17:00'),
    endTime: z.string().default('18:30'),
    type: ActivityTypeEnum.optional().nullable(),
    types: z.array(ActivityTypeEnum).default([]),
    description: z.string().max(5000).default(''),
    objectives: z.array(z.string().max(300)).default([]),
    rmjqDimensions: z.array(z.string().max(100)).default([]).nullable(),
    pedagogy: PedagogySchema,
    logistics: LogisticsSchema,
    materials: z.array(MaterialSchema).default([]),
    materialReservations: z.array(MaterialReservationSchema).default([]),
    budget: BudgetSchema.default({ estimatedCost: 0, actualCost: 0, items: [], fundingSource: 'Mission globale', youthDonationsCount: 0, youthDonationsAmount: 0, youthDiscountsCount: 0, youthDiscountsAmount: 0 }),
    staffing: StaffingSchema,
    riskManagement: RiskManagementSchema,
    youthInvolvement: YouthInvolvementSchema,
    communicationPlan: z.string().max(5000).default(''),
    preparationScore: z.number().min(0).max(100).default(0),
    backupPlan: z.string().max(5000).default(''),
    evaluationCriteria: z.array(z.string().max(300)).default([]),
    lastEditedBy: z.string().email().optional().nullable(),
    documents: z.array(ActivityDocumentSchema).default([]),
    peerValidated: z.boolean().default(false),
    validatedBy: z.string().max(100).optional().nullable(),
    isPostponed: z.boolean().default(false),
    isMissingOnlyCost: z.boolean().default(false),
    consumptionValidated: z.boolean().default(false),
    createdByEmail: z.string().email().optional().nullable(),
    comments: z.array(CommentSchema).default([]),
    checklist: z.array(ChecklistItemSchema).default([]),
    hasHomeworkHelp: z.boolean().default(false),
    isPrevention: z.boolean().default(false),
    isFreeEvening: z.boolean().default(false),
    isOuting: z.boolean().default(false),
    isMDJClosed: z.boolean().default(false),
    isInformal: z.boolean().default(false),
    journal: z.string().max(10000).default(''),
    stats: ActivityStatsSchema,
    youthContributions: z.array(YouthContributionSchema).default([]),
    materialPrevention: MaterialPreventionSchema.default({ menstrualProductsDistributed: 0, condomsDistributed: 0, documentsDistributed: 0, notes: '' }),
    culinaryRecipe: z.string().max(500).default(''),
    autonomousProjects: z.array(AutonomousProjectSchema).default([]),
    targetParticipants: z.number().min(0).default(0),
    autonomousDeliverables: z.string().max(2000).default(''),
    ecoPractices: z.array(z.string()).default([]),
    paidParticipants: z.array(z.string()).default([]),
    evaluation: EvaluationSchema.optional().default({
        preparationTime: '', unfolding: '', unexpectedEvents: '', highlights: '', verbatims: '', globalAppreciation: '', futureNeeds: '', youthFeedbackRating: 0, youthFeedbackComments: '', youthFeedbackCount: 0
    }),
    clinicalObservations: ClinicalObservationsSchema.optional().default({
        climate: '', dynamics: '', relationshipQuality: '', specificInterventions: '', referrals: '', concerningSituations: '', followUpPlanning: '', groupClimate: [], groupDynamicsNotes: '', significantExchanges: 0, interventionNotes: [], jasetteTheme: '', jasetteYouthCount: 0,
        externalReferralsCount: 0, majorInterventionsCount: 0, majorInterventionsHours: 0
    }),
    communityIndicators: CommunityIndicatorsSchema.optional().default({
        volunteerCount: 0, volunteerHours: 0, volunteerTasks: '', youthVolunteerCount: 0, youthVolunteerHours: 0, youthVolunteerTasks: '', partnerships: '', milieuContributions: '', challenges: '', youthCommitteeDecisions: '', socialMediaEngagement: 0, mediaInterviews: '', outreachNotes: '',
        isFundingActivity: false, fundingAmount: 0, materialDonations: '', familiesHelped: 0, citizenMobilizationWorkshops: 0, youthSelectedExternalProjects: 0, tablesFrequented: 0, politicalMeetings: 0, provincialAdhesions: 0, youthRepresentativesWithVote: 0,
        outreachLocation: '', outreachParticipantsCount: 0, outreachMaterialCount: 0, militantismCause: '', militantismYouthCount: 0, militantismActions: '',
        boardVolunteerHours: 0, concertationHoursCDC: 0, concertationHoursTROC: 0, concertationPrepHours: 0, fundingResearchHours: 0
    }),
    changelog: z.array(ChangelogEntrySchema).default([]),
});

// ═══════════════════════════════════════════════════════════════════════════
// INFERRED TYPES (use these instead of raw interfaces)
// ═══════════════════════════════════════════════════════════════════════════

export const MemberSchema = z.object({
    id: z.string(),
    code: z.string().max(20).optional(), // Ex: JM-2009
    firstName: z.string().max(100),
    preferredFirstName: z.string().max(100).optional().nullable(),
    lastName: z.string().max(100),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    gender: MemberGenderEnum.default('Préfère ne pas répondre'),
    status: MemberStatusEnum.default('Actif'),
    memberType: MemberTypeEnum.default('Membre actif jeune'),
    registrationDate: z.number().default(Date.now),
    allergies: z.string().max(500).default(''),
    parentContact: z.string().max(300).default(''),
    emergencyContact: z.string().max(300).default(''),
    notes: z.string().max(1000).default(''),
    schoolOrNeighbourhood: z.string().max(200).default(''),
    referenceSource: MemberReferenceSourceEnum.default('Autre'),
    createdByEmail: z.string().email().optional(),
    updatedAt: z.number().default(Date.now),
});

export const BoardMemberSchema = z.object({
    id: z.string(),
    firstName: z.string().max(100),
    lastName: z.string().max(100),
    role: BoardRoleEnum.default('Administrateur(trice)'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().max(20).optional().or(z.literal('')),
    joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    termEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide').optional().or(z.literal('')),
    status: z.enum(['Actif', 'Ancien']).default('Actif'),
    notes: z.string().max(1000).default(''),
    updatedAt: z.number().default(Date.now),
});

export const VaultDocumentSchema = z.object({
    id: z.string(),
    title: z.string().max(200),
    type: z.enum(['Procès-verbal', 'Rapport d\'activité', 'États financiers', 'Politique interne', 'Autre']),
    uploadDate: z.number().default(Date.now),
    url: z.string().url(),
    sizeBytes: z.number().default(0),
    uploadedByEmail: z.string().email(),
    associatedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format (YYYY-MM-DD)').optional().or(z.literal('')),
    description: z.string().max(500).default('')
});

export const FinancialHealthSchema = z.object({
    id: z.string(),
    year: z.number(),
    psocRevenue: z.number().default(0),
    otherGrantsRevenue: z.number().default(0),
    autonomousRevenue: z.number().default(0),
    totalExpenses: z.number().default(0),
    accumulatedSurplus: z.number().default(0), // Surplus des années antérieures + année en cours
    updatedAt: z.number().default(Date.now()),
    updatedByEmail: z.string().email().optional()
});

export type ActivityZod = z.infer<typeof ActivitySchema>;
export type MemberZod = z.infer<typeof MemberSchema>;
export type BoardMemberZod = z.infer<typeof BoardMemberSchema>;
export type VaultDocumentZod = z.infer<typeof VaultDocumentSchema>;
export type FinancialHealthZod = z.infer<typeof FinancialHealthSchema>;

export type MaterialZod = z.infer<typeof MaterialSchema>;
export type BudgetZod = z.infer<typeof BudgetSchema>;
export type LogisticsZod = z.infer<typeof LogisticsSchema>;
export type RiskManagementZod = z.infer<typeof RiskManagementSchema>;
export type StaffingZod = z.infer<typeof StaffingSchema>;
export type YouthInvolvementZod = z.infer<typeof YouthInvolvementSchema>;
export type ActivityDocumentZod = z.infer<typeof ActivityDocumentSchema>;
export type CommentZod = z.infer<typeof CommentSchema>;
export type ChangelogEntryZod = z.infer<typeof ChangelogEntrySchema>;
export type InventoryItemZod = z.infer<typeof InventoryItemSchema>;
export type MaterialReservationZod = z.infer<typeof MaterialReservationSchema>;
export type PurchaseRequestZod = z.infer<typeof PurchaseRequestSchema>;

export type EvaluationZod = z.infer<typeof EvaluationSchema>;
export type ClinicalObservationsZod = z.infer<typeof ClinicalObservationsSchema>;
export type CommunityIndicatorsZod = z.infer<typeof CommunityIndicatorsSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// SAFE PARSE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validates activity data, returning the parsed result or null.
 * Logs validation errors but does not throw — use for incoming Firestore data.
 */
export function parseActivitySafe(data: any): ActivityZod | null {
    const sanitized = sanitizeActivityData(data);
    const result = ActivitySchema.safeParse(sanitized);
    if (!result.success) {
        const title = data.title || data.id || 'Unknown';
        console.warn(`[Schema] Activity "${title}" validation failed:`,
            result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(' | ')
        );
        return null;
    }
    return result.data;
}

/**
 * Sanitizes activity data by providing fallbacks for null/undefined fields.
 * Ensures the data structure matches the expectations of ActivitySchema.
 */
export function sanitizeActivityData(raw: any): ActivityZod {
    if (!raw) throw new Error("Données d'activité manquantes");

    const title = raw.title || '';
    const normalizedType = normalizeActivityType(raw.type, title);
    
    const rawTypesList = Array.isArray(raw.types) ? raw.types : (raw.type ? [raw.type] : []);
    const mappedTypes = rawTypesList
        .map((t: any) => normalizeActivityType(t, title))
        .filter((t: string | null): t is string => t !== null);

    // Bidirectional synchronization to prevent ANY data loss
    if (raw.isFreeEvening && !mappedTypes.includes('Soirée libre & Animation')) {
        mappedTypes.push('Soirée libre & Animation');
    }
    if (raw.hasHomeworkHelp && !mappedTypes.includes('Aide aux devoirs')) {
        mappedTypes.push('Aide aux devoirs');
    }
    if (raw.isOuting && !mappedTypes.includes('Sortie & Activité')) {
        mappedTypes.push('Sortie & Activité');
    }
    if (raw.isMDJClosed && !mappedTypes.includes('MDJ Fermée')) {
        mappedTypes.push('MDJ Fermée');
    }
    if (raw.isPrevention && !mappedTypes.includes('Prévention (Interne)') && !mappedTypes.includes('Prévention (Partenaires)') && !mappedTypes.includes('Prévention & Sensibilisation (Interne)') && !mappedTypes.includes('Prévention & Sensibilisation (Partenaire)')) {
        mappedTypes.push('Prévention (Interne)');
    }
    if ((raw.staffing?.animationType === 'Partenaire' || raw.staffing?.animationType === 'Mixte') && !mappedTypes.includes('Prévention (Partenaires)')) {
        mappedTypes.push('Prévention (Partenaires)');
    }

    // Bidirectional sync: Category 2 -> Category 1 (for retrocompatibility with old data)
    if (mappedTypes.includes('Accueil, Écoute & Milieu de Vie') && !mappedTypes.includes('Soirée libre & Animation')) {
        mappedTypes.push('Soirée libre & Animation');
    }
    if (mappedTypes.includes('Réussite scolaire') && !mappedTypes.includes('Aide aux devoirs')) {
        mappedTypes.push('Aide aux devoirs');
    }
    if (mappedTypes.includes('Accompagnement Individualisé') && !mappedTypes.includes('Accompagnement individuel')) {
        mappedTypes.push('Accompagnement individuel');
    }
    if (mappedTypes.includes('Intervention & Gestion de Crise') && !mappedTypes.includes('Intervention & Crise')) {
        mappedTypes.push('Intervention & Crise');
    }
    if (mappedTypes.includes('Prévention & Sensibilisation (Interne)') && !mappedTypes.includes('Prévention (Interne)')) {
        mappedTypes.push('Prévention (Interne)');
    }
    if (mappedTypes.includes('Prévention & Sensibilisation (Partenaire)') && !mappedTypes.includes('Prévention (Partenaires)')) {
        mappedTypes.push('Prévention (Partenaires)');
    }
    if (mappedTypes.includes('Promotion, Concertation & Gestion') && !mappedTypes.includes('MDJ Fermée')) {
        mappedTypes.push('MDJ Fermée');
    }
    if (mappedTypes.includes('Vie Associative & Bénévolat Jeunes') && !mappedTypes.includes('Vie associative & Bénévolat') && !mappedTypes.includes('Activité démocratique (CJ)')) {
        mappedTypes.push('Vie associative & Bénévolat');
    }
    if (mappedTypes.includes('Animation (sorties, activités, séjours)') && !mappedTypes.includes('Sortie & Activité') && !mappedTypes.includes('Activité physique') && !mappedTypes.includes('Atelier culinaire')) {
        mappedTypes.push('Sortie & Activité');
    }

    // Bidirectional sync: Category 1 -> Category 2 (for auto-tagging new data)
    if (mappedTypes.includes('Soirée libre & Animation') && !mappedTypes.includes('Accueil, Écoute & Milieu de Vie')) {
        mappedTypes.push('Accueil, Écoute & Milieu de Vie');
    }
    if (mappedTypes.includes('Aide aux devoirs') && !mappedTypes.includes('Réussite scolaire')) {
        mappedTypes.push('Réussite scolaire');
    }
    if (mappedTypes.includes('Accompagnement individuel') && !mappedTypes.includes('Accompagnement Individualisé')) {
        mappedTypes.push('Accompagnement Individualisé');
    }
    if (mappedTypes.includes('Intervention & Crise') && !mappedTypes.includes('Intervention & Gestion de Crise')) {
        mappedTypes.push('Intervention & Gestion de Crise');
    }
    if (mappedTypes.includes('Vie associative & Bénévolat') && !mappedTypes.includes('Vie Associative & Bénévolat Jeunes')) {
        mappedTypes.push('Vie Associative & Bénévolat Jeunes');
    }
    if (mappedTypes.includes('Prévention (Interne)') && !mappedTypes.includes('Prévention & Sensibilisation (Interne)')) {
        mappedTypes.push('Prévention & Sensibilisation (Interne)');
    }
    if (mappedTypes.includes('Prévention (Partenaires)') && !mappedTypes.includes('Prévention & Sensibilisation (Partenaire)')) {
        mappedTypes.push('Prévention & Sensibilisation (Partenaire)');
    }
    if (mappedTypes.includes('MDJ Fermée') && !mappedTypes.includes('Promotion, Concertation & Gestion')) {
        mappedTypes.push('Promotion, Concertation & Gestion');
    }
    if (mappedTypes.includes('Sortie & Activité') && !mappedTypes.includes('Animation (sorties, activités, séjours)')) {
        mappedTypes.push('Animation (sorties, activités, séjours)');
    }
    if (mappedTypes.includes('Activité physique') && !mappedTypes.includes('Animation (sorties, activités, séjours)')) {
        mappedTypes.push('Animation (sorties, activités, séjours)');
    }
    if (mappedTypes.includes('Atelier culinaire') && !mappedTypes.includes('Animation (sorties, activités, séjours)')) {
        mappedTypes.push('Animation (sorties, activités, séjours)');
    }
    if (mappedTypes.includes('Activité démocratique (CJ)') && !mappedTypes.includes('Vie Associative & Bénévolat Jeunes')) {
        mappedTypes.push('Vie Associative & Bénévolat Jeunes');
    }

    const uniqueTypes = Array.from(new Set(mappedTypes));

    const isFreeEvening = uniqueTypes.includes('Soirée libre & Animation') || uniqueTypes.includes('Accueil, Écoute & Milieu de Vie');
    const hasHomeworkHelp = uniqueTypes.includes('Aide aux devoirs') || uniqueTypes.includes('Réussite scolaire');
    const isOuting = uniqueTypes.includes('Sortie & Activité');
    const isPrevention = uniqueTypes.includes('Prévention (Interne)') || uniqueTypes.includes('Prévention (Partenaires)') || uniqueTypes.includes('Prévention & Sensibilisation (Interne)') || uniqueTypes.includes('Prévention & Sensibilisation (Partenaire)');
    const isMDJClosed = uniqueTypes.includes('MDJ Fermée') || uniqueTypes.includes('Promotion, Concertation & Gestion');

    const sanitized: any = {
        ...raw,
        id: raw.id || `temp-${Date.now()}`,
        title: title,
        date: raw.date || new Date().toISOString().split('T')[0],
        startTime: raw.startTime || '17:00',
        endTime: raw.endTime || '18:30',
        type: normalizedType || (uniqueTypes[0] || null),
        types: uniqueTypes,
        description: raw.description ?? '',
        objectives: Array.isArray(raw.objectives) ? Array.from(new Set(raw.objectives.filter(Boolean))) : [],
        rmjqDimensions: Array.isArray(raw.rmjqDimensions) ? Array.from(new Set(raw.rmjqDimensions.filter(Boolean))) : [],
        materials: Array.isArray(raw.materials) ? raw.materials.map((m: any) => ({
            item: m?.item || '',
            quantity: m?.quantity || '',
            supplier: m?.supplier || '',
            acquired: !!m?.acquired
        })) : [],
        materialReservations: Array.isArray(raw.materialReservations) ? raw.materialReservations.map((mr: any) => ({
            id: mr?.id || `res-${Date.now()}-${Math.random()}`,
            activityId: mr?.activityId || raw.id || '',
            itemId: mr?.itemId || '',
            itemName: mr?.itemName || '',
            quantityRequired: typeof mr?.quantityRequired === 'number' ? mr?.quantityRequired : 0,
            actualQuantityUsed: typeof mr?.actualQuantityUsed === 'number' ? mr?.actualQuantityUsed : 0,
            usageNotes: mr?.usageNotes ?? '',
            date: mr?.date || raw.date || new Date().toISOString().split('T')[0],
            status: ['Réservé', 'Conflit (Manque)', 'Consommé', 'Terminé'].includes(mr?.status) ? mr.status : 'Réservé'
        })) : [],
        evaluationCriteria: Array.isArray(raw.evaluationCriteria) ? Array.from(new Set(raw.evaluationCriteria.filter(Boolean))) : [],
        documents: Array.isArray(raw.documents) ? raw.documents.map((d: any) => ({
            id: d?.id || '',
            name: d?.name || '',
            type: d?.type || 'file',
            size: d?.size || 0,
            url: d?.url || '',
            dateAdded: d?.dateAdded || Date.now()
        })) : [],
        comments: Array.isArray(raw.comments) ? raw.comments.map((c: any) => ({
            id: c?.id || `comment-${Date.now()}-${Math.random()}`,
            userId: c?.userId || '',
            userName: c?.userName || 'Inconnu',
            userEmail: c?.userEmail || 'inconnu@mdjescalejeunesse.ca',
            text: c?.text || '',
            timestamp: typeof c?.timestamp === 'number' ? c?.timestamp : Date.now()
        })) : [],
        checklist: Array.isArray(raw.checklist) ? raw.checklist.map((item: any) => ({
            item: item?.item || '',
            completed: !!item?.completed
        })) : [],
        hasHomeworkHelp: hasHomeworkHelp,
        isPrevention: isPrevention,
        isFreeEvening: isFreeEvening,
        isOuting: isOuting,
        isMDJClosed: isMDJClosed,
        isInformal: !!raw.isInformal,
        journal: raw.journal ?? '',
        changelog: Array.isArray(raw.changelog) ? raw.changelog.map((entry: any) => ({
            timestamp: typeof entry?.timestamp === 'number' ? entry?.timestamp : Date.now(),
            userName: entry?.userName || 'Système',
            userEmail: entry?.userEmail || 'systeme@mdjescalejeunesse.ca',
            action: entry?.action || 'Modification'
        })) : [],
        isPostponed: !!raw.isPostponed,
        isMissingOnlyCost: !!raw.isMissingOnlyCost,
        consumptionValidated: !!raw.consumptionValidated,
        peerValidated: !!raw.peerValidated,
        preparationScore: typeof raw.preparationScore === 'number' ? raw.preparationScore : 0,
        communicationPlan: raw.communicationPlan ?? '',
        backupPlan: raw.backupPlan ?? '',
        lastEditedBy: raw.lastEditedBy ?? null,
        validatedBy: raw.validatedBy ?? null,
        createdByEmail: raw.createdByEmail ?? null,

        logistics: {
            venueName: raw.logistics?.venueName ?? '',
            address: raw.logistics?.address ?? '',
            phoneNumber: raw.logistics?.phoneNumber ?? null,
            website: raw.logistics?.website ?? null,
            facebook: raw.logistics?.facebook ?? null,
            email: raw.logistics?.email ?? null,
            transportRequired: !!raw.logistics?.transportRequired,
            transportMode: raw.logistics?.transportMode ?? null,
            distance: raw.logistics?.distance ?? null,
            travelTime: raw.logistics?.travelTime ?? null,
            meetingPoint: raw.logistics?.meetingPoint ?? null,
            departureTime: raw.logistics?.departureTime ?? null,
            returnTime: raw.logistics?.returnTime ?? null,
            costPerPerson: raw.logistics?.costPerPerson ?? 0,
            isFree: raw.logistics?.isFree ?? (raw.logistics?.costPerPerson ? false : true),
            otherAddresses: Array.isArray(raw.logistics?.otherAddresses) ? raw.logistics.otherAddresses : [],
            websites: Array.isArray(raw.logistics?.websites) ? raw.logistics.websites : [],
            reservedSpaces: Array.isArray(raw.logistics?.reservedSpaces) ? raw.logistics.reservedSpaces.filter(Boolean) : [],
        },

        riskManagement: {
            hazards: Array.isArray(raw.riskManagement?.hazards) ? raw.riskManagement.hazards : [],
            requiredInsurance: raw.riskManagement?.requiredInsurance ?? '',
            safetyProtocols: Array.isArray(raw.riskManagement?.safetyProtocols) ? raw.riskManagement.safetyProtocols : [],
            emergencyContact: raw.riskManagement?.emergencyContact ?? '',
            siteRules: Array.isArray(raw.riskManagement?.siteRules) ? raw.riskManagement.siteRules : [],
            complianceRequirements: Array.isArray(raw.riskManagement?.complianceRequirements) ? raw.riskManagement.complianceRequirements : [],
        },

        staffing: {
            leadStaff: (raw.staffing?.leadStaff ?? '').trim(),
            supportStaff: Array.isArray(raw.staffing?.supportStaff)
                ? raw.staffing.supportStaff.map((s: string) => (s || '').trim()).filter(Boolean)
                : [],
            requiredRatio: raw.staffing?.requiredRatio ?? '',
            specialQualifications: raw.staffing?.specialQualifications ?? '',
            animationType: (() => {
                const hasPartenaire = uniqueTypes.includes('Prévention (Partenaires)') || uniqueTypes.includes('Prévention & Sensibilisation (Partenaire)');
                const hasInterne = uniqueTypes.some((t: any) => t !== 'Prévention (Partenaires)' && t !== 'Prévention & Sensibilisation (Partenaire)');
                if (hasPartenaire && hasInterne) return 'Mixte';
                if (hasPartenaire) return 'Partenaire';
                return 'Interne';
            })(),
        },

        youthInvolvement: {
            level: YouthInvolvementLevelEnum.safeParse(raw.youthInvolvement?.level).success
                ? raw.youthInvolvement.level
                : null,
            tasks: Array.isArray(raw.youthInvolvement?.tasks) ? Array.from(new Set(raw.youthInvolvement.tasks.filter(Boolean))) : [],
        },

        pedagogy: {
            objectives: Array.isArray(raw.objectives) ? Array.from(new Set(raw.objectives.filter(Boolean))) : [],
            rmjqDimensions: Array.isArray(raw.rmjqDimensions) ? Array.from(new Set(raw.rmjqDimensions.filter(Boolean))) : [],
            psocTags: Array.isArray(raw.pedagogy?.psocTags) ? Array.from(new Set(raw.pedagogy.psocTags.filter(Boolean))) : [],
        },

        budget: {
            estimatedCost: raw.budget?.estimatedCost ?? 0,
            actualCost: raw.budget?.actualCost ?? 0,
            items: Array.isArray(raw.budget?.items) ? raw.budget.items.map((i: any) => ({
                description: i?.description || '',
                amount: i?.amount || 0
            })) : [],
            fundingSource: raw.budget?.fundingSource ?? 'Mission globale',
            youthDonationsCount: typeof raw.budget?.youthDonationsCount === 'number' ? raw.budget.youthDonationsCount : 0,
            youthDonationsAmount: typeof raw.budget?.youthDonationsAmount === 'number' ? raw.budget.youthDonationsAmount : 0,
            youthDiscountsCount: typeof raw.budget?.youthDiscountsCount === 'number' ? raw.budget.youthDiscountsCount : 0,
            youthDiscountsAmount: typeof raw.budget?.youthDiscountsAmount === 'number' ? raw.budget.youthDiscountsAmount : 0,
        },
        stats: {
            presentMale: typeof raw.stats?.presentMale === 'number' ? raw.stats.presentMale : 0,
            presentFemale: typeof raw.stats?.presentFemale === 'number' ? raw.stats.presentFemale : 0,
            presentNonBinary: typeof raw.stats?.presentNonBinary === 'number' ? raw.stats.presentNonBinary : 0,
            newMembers: typeof raw.stats?.newMembers === 'number' ? raw.stats.newMembers : 0,
            age12_14: typeof raw.stats?.age12_14 === 'number' ? raw.stats.age12_14 : 0,
            age15_17: typeof raw.stats?.age15_17 === 'number' ? raw.stats.age15_17 : 0,
            age18plus: typeof raw.stats?.age18plus === 'number' ? raw.stats.age18plus : 0,
            sociodemographicNotes: raw.stats?.sociodemographicNotes ?? '',
            participantsList: Array.isArray(raw.stats?.participantsList) ? Array.from(new Set(raw.stats.participantsList.filter(Boolean))) : [],
            regularMealsServed: typeof raw.stats?.regularMealsServed === 'number' ? raw.stats.regularMealsServed : 0,
        },
        youthContributions: Array.isArray(raw.youthContributions) ? raw.youthContributions.map((yc: any) => ({
            id: yc?.id || `yc-${Date.now()}-${Math.random()}`,
            youthName: yc?.youthName || '',
            volunteerHours: typeof yc?.volunteerHours === 'number' ? yc.volunteerHours : 0,
            rewardGiven: yc?.rewardGiven || '',
            reason: yc?.reason || ''
        })) : [],
        materialPrevention: {
            menstrualProductsDistributed: typeof raw.materialPrevention?.menstrualProductsDistributed === 'number' ? raw.materialPrevention.menstrualProductsDistributed : 0,
            condomsDistributed: typeof raw.materialPrevention?.condomsDistributed === 'number' ? raw.materialPrevention.condomsDistributed : 0,
            documentsDistributed: typeof raw.materialPrevention?.documentsDistributed === 'number' ? raw.materialPrevention.documentsDistributed : 0,
            notes: raw.materialPrevention?.notes || '',
        },
        culinaryRecipe: raw.culinaryRecipe ?? '',
        autonomousProjects: Array.isArray(raw.autonomousProjects) ? raw.autonomousProjects.map((ap: any) => ({
            id: ap?.id || `ap-${Date.now()}-${Math.random()}`,
            name: ap?.name || '',
            description: ap?.description ?? '',
        })) : [],
        targetParticipants: typeof raw.targetParticipants === 'number' ? raw.targetParticipants : 0,
        autonomousDeliverables: raw.autonomousDeliverables ?? '',
        ecoPractices: Array.isArray(raw.ecoPractices) ? raw.ecoPractices.filter(Boolean) : [],
        paidParticipants: Array.isArray(raw.paidParticipants) ? Array.from(new Set(raw.paidParticipants.filter(Boolean))) : [],
        evaluation: {
            preparationTime: raw.evaluation?.preparationTime ?? '',
            unfolding: raw.evaluation?.unfolding ?? '',
            unexpectedEvents: raw.evaluation?.unexpectedEvents ?? '',
            highlights: raw.evaluation?.highlights ?? '',
            verbatims: raw.evaluation?.verbatims ?? '',
            globalAppreciation: raw.evaluation?.globalAppreciation ?? '',
            futureNeeds: raw.evaluation?.futureNeeds ?? '',
            youthFeedbackRating: typeof raw.evaluation?.youthFeedbackRating === 'number' ? raw.evaluation.youthFeedbackRating : 0,
            youthFeedbackComments: raw.evaluation?.youthFeedbackComments ?? '',
            youthFeedbackCount: typeof raw.evaluation?.youthFeedbackCount === 'number' ? raw.evaluation.youthFeedbackCount : 0,
        },
        clinicalObservations: {
            climate: raw.clinicalObservations?.climate ?? '',
            dynamics: raw.clinicalObservations?.dynamics ?? '',
            relationshipQuality: raw.clinicalObservations?.relationshipQuality ?? '',
            specificInterventions: raw.clinicalObservations?.specificInterventions ?? '',
            referrals: raw.clinicalObservations?.referrals ?? '',
            concerningSituations: raw.clinicalObservations?.concerningSituations ?? '',
            followUpPlanning: raw.clinicalObservations?.followUpPlanning ?? '',
            groupClimate: Array.isArray(raw.clinicalObservations?.groupClimate) ? Array.from(new Set(raw.clinicalObservations.groupClimate.filter(Boolean))) : [],
            groupDynamicsNotes: raw.clinicalObservations?.groupDynamicsNotes ?? '',
            significantExchanges: typeof raw.clinicalObservations?.significantExchanges === 'number' ? raw.clinicalObservations.significantExchanges : 0,
            interventionNotes: Array.isArray(raw.clinicalObservations?.interventionNotes) ? raw.clinicalObservations.interventionNotes.map((n: any) => ({
                id: n?.id || `note-${Date.now()}-${Math.random()}`,
                youthName: n?.youthName ?? '',
                type: n?.type ?? 'Écoute active',
                description: n?.description ?? '',
                isConfidential: n?.isConfidential ?? true,
            })) : [],
            dpjReports: typeof raw.clinicalObservations?.dpjReports === 'number' ? raw.clinicalObservations.dpjReports : 0,
            emergencyMeals: typeof raw.clinicalObservations?.emergencyMeals === 'number' ? raw.clinicalObservations.emergencyMeals : 0,
            jasetteTheme: raw.clinicalObservations?.jasetteTheme ?? '',
            jasetteYouthCount: typeof raw.clinicalObservations?.jasetteYouthCount === 'number' ? raw.clinicalObservations.jasetteYouthCount : 0,
            externalReferralsCount: typeof raw.clinicalObservations?.externalReferralsCount === 'number' ? raw.clinicalObservations.externalReferralsCount : 0,
            majorInterventionsCount: typeof raw.clinicalObservations?.majorInterventionsCount === 'number' ? raw.clinicalObservations.majorInterventionsCount : 0,
            majorInterventionsHours: typeof raw.clinicalObservations?.majorInterventionsHours === 'number' ? raw.clinicalObservations.majorInterventionsHours : 0,
        },
        communityIndicators: {
            volunteerCount: typeof raw.communityIndicators?.volunteerCount === 'number' ? raw.communityIndicators.volunteerCount : 0,
            volunteerHours: typeof raw.communityIndicators?.volunteerHours === 'number' ? raw.communityIndicators.volunteerHours : 0,
            volunteerTasks: raw.communityIndicators?.volunteerTasks ?? '',
            youthVolunteerCount: typeof raw.communityIndicators?.youthVolunteerCount === 'number' ? raw.communityIndicators.youthVolunteerCount : 0,
            youthVolunteerHours: typeof raw.communityIndicators?.youthVolunteerHours === 'number' ? raw.communityIndicators.youthVolunteerHours : 0,
            youthVolunteerTasks: raw.communityIndicators?.youthVolunteerTasks ?? '',
            partnerships: raw.communityIndicators?.partnerships ?? '',
            milieuContributions: raw.communityIndicators?.milieuContributions ?? '',
            challenges: raw.communityIndicators?.challenges ?? '',
            youthCommitteeDecisions: raw.communityIndicators?.youthCommitteeDecisions ?? '',
            socialMediaEngagement: typeof raw.communityIndicators?.socialMediaEngagement === 'number' ? raw.communityIndicators.socialMediaEngagement : 0,
            mediaInterviews: raw.communityIndicators?.mediaInterviews ?? '',
            outreachNotes: raw.communityIndicators?.outreachNotes ?? '',
            isFundingActivity: !!raw.communityIndicators?.isFundingActivity,
            fundingAmount: typeof raw.communityIndicators?.fundingAmount === 'number' ? raw.communityIndicators.fundingAmount : 0,
            materialDonations: raw.communityIndicators?.materialDonations ?? '',
            familiesHelped: typeof raw.communityIndicators?.familiesHelped === 'number' ? raw.communityIndicators.familiesHelped : 0,
            citizenMobilizationWorkshops: typeof raw.communityIndicators?.citizenMobilizationWorkshops === 'number' ? raw.communityIndicators.citizenMobilizationWorkshops : 0,
            youthSelectedExternalProjects: typeof raw.communityIndicators?.youthSelectedExternalProjects === 'number' ? raw.communityIndicators.youthSelectedExternalProjects : 0,
            tablesFrequented: typeof raw.communityIndicators?.tablesFrequented === 'number' ? raw.communityIndicators.tablesFrequented : 0,
            politicalMeetings: typeof raw.communityIndicators?.politicalMeetings === 'number' ? raw.communityIndicators.politicalMeetings : 0,
            provincialAdhesions: typeof raw.communityIndicators?.provincialAdhesions === 'number' ? raw.communityIndicators.provincialAdhesions : 0,
            youthRepresentativesWithVote: typeof raw.communityIndicators?.youthRepresentativesWithVote === 'number' ? raw.communityIndicators.youthRepresentativesWithVote : 0,
            outreachLocation: raw.communityIndicators?.outreachLocation ?? '',
            outreachParticipantsCount: typeof raw.communityIndicators?.outreachParticipantsCount === 'number' ? raw.communityIndicators.outreachParticipantsCount : 0,
            outreachMaterialCount: typeof raw.communityIndicators?.outreachMaterialCount === 'number' ? raw.communityIndicators.outreachMaterialCount : 0,
            militantismCause: raw.communityIndicators?.militantismCause ?? '',
            militantismYouthCount: typeof raw.communityIndicators?.militantismYouthCount === 'number' ? raw.communityIndicators.militantismYouthCount : 0,
            militantismActions: raw.communityIndicators?.militantismActions ?? '',
            boardVolunteerHours: typeof raw.communityIndicators?.boardVolunteerHours === 'number' ? raw.communityIndicators.boardVolunteerHours : 0,
            concertationHoursCDC: typeof raw.communityIndicators?.concertationHoursCDC === 'number' ? raw.communityIndicators.concertationHoursCDC : 0,
            concertationHoursTROC: typeof raw.communityIndicators?.concertationHoursTROC === 'number' ? raw.communityIndicators.concertationHoursTROC : 0,
            concertationPrepHours: typeof raw.communityIndicators?.concertationPrepHours === 'number' ? raw.communityIndicators.concertationPrepHours : 0,
            fundingResearchHours: typeof raw.communityIndicators?.fundingResearchHours === 'number' ? raw.communityIndicators.fundingResearchHours : 0,
        },
    };

    return sanitized as ActivityZod;
}

/**
 * Validates activity data strictly — throws on failure.
 */
export function parseActivityStrict(data: unknown): ActivityZod {
    const sanitized = sanitizeActivityData(data);
    return ActivitySchema.parse(sanitized);
}
