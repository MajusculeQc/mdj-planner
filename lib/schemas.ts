import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export const ActivityTypeEnum = z.enum([
    'Accueil, Écoute & Milieu de Vie',
    'Aide aux Devoirs & Soutien Scolaire',
    'Accompagnement Individualisé',
    'Intervention & Gestion de Crise',
    'Animation (sorties, activités, séjours)',
    'Prévention & Sensibilisation (Interne)',
    'Prévention & Sensibilisation (Partenaire)',
    'Vie Associative & Bénévolat Jeunes',
    'Promotion, Concertation & Gestion',
    'Activité physique',
    'Atelier culinaire',
    'Activité démocratique (CJ)'
]);

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
}).default({
    venueName: '',
    address: '',
    transportRequired: false,
    costPerPerson: 0,
    isFree: true
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
}).default({
    preparationTime: '',
    unfolding: '',
    unexpectedEvents: '',
    highlights: '',
    verbatims: '',
    globalAppreciation: '',
    futureNeeds: '',
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
    budget: BudgetSchema.default({ estimatedCost: 0, actualCost: 0, items: [], fundingSource: 'Mission globale' }),
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
    isMDJClosed: z.boolean().default(false),
    journal: z.string().max(10000).default(''),
    stats: ActivityStatsSchema,
    evaluation: EvaluationSchema.optional().default({
        preparationTime: '', unfolding: '', unexpectedEvents: '', highlights: '', verbatims: '', globalAppreciation: '', futureNeeds: ''
    }),
    clinicalObservations: ClinicalObservationsSchema.optional().default({
        climate: '', dynamics: '', relationshipQuality: '', specificInterventions: '', referrals: '', concerningSituations: '', followUpPlanning: '', groupClimate: [], groupDynamicsNotes: '', significantExchanges: 0, interventionNotes: []
    }),
    communityIndicators: CommunityIndicatorsSchema.optional().default({
        volunteerCount: 0, volunteerHours: 0, volunteerTasks: '', youthVolunteerCount: 0, youthVolunteerHours: 0, youthVolunteerTasks: '', partnerships: '', milieuContributions: '', challenges: '', youthCommitteeDecisions: '', socialMediaEngagement: 0, mediaInterviews: '', outreachNotes: '',
        isFundingActivity: false, fundingAmount: 0, materialDonations: ''
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
    lastName: z.string().max(100),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    gender: MemberGenderEnum.default('Préfère ne pas répondre'),
    status: MemberStatusEnum.default('Actif'),
    registrationDate: z.number().default(Date.now),
    allergies: z.string().max(500).default(''),
    parentContact: z.string().max(300).default(''),
    emergencyContact: z.string().max(300).default(''),
    notes: z.string().max(1000).default(''),
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

    const sanitized: any = {
        ...raw,
        id: raw.id || `temp-${Date.now()}`,
        title: raw.title || '',
        date: raw.date || new Date().toISOString().split('T')[0],
        startTime: raw.startTime || '17:00',
        endTime: raw.endTime || '18:30',
        type: ActivityTypeEnum.safeParse(raw.type).success ? raw.type : null,
        types: Array.isArray(raw.types) && raw.types.length > 0
            ? raw.types
            : (ActivityTypeEnum.safeParse(raw.type).success ? [raw.type] : []),
        description: raw.description ?? '',
        objectives: Array.isArray(raw.objectives) ? raw.objectives.filter(Boolean) : [],
        rmjqDimensions: Array.isArray(raw.rmjqDimensions) ? raw.rmjqDimensions.filter(Boolean) : [],
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
        evaluationCriteria: Array.isArray(raw.evaluationCriteria) ? raw.evaluationCriteria : [],
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
        hasHomeworkHelp: !!raw.hasHomeworkHelp,
        isMDJClosed: !!raw.isMDJClosed,
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
            animationType: ['Interne', 'Partenaire', 'Mixte'].includes(raw.staffing?.animationType) ? raw.staffing.animationType : 'Interne',
        },

        youthInvolvement: {
            level: YouthInvolvementLevelEnum.safeParse(raw.youthInvolvement?.level).success
                ? raw.youthInvolvement.level
                : null,
            tasks: Array.isArray(raw.youthInvolvement?.tasks) ? raw.youthInvolvement.tasks : [],
        },

        pedagogy: {
            objectives: Array.isArray(raw.pedagogy?.objectives) ? raw.pedagogy.objectives : [],
            rmjqDimensions: Array.isArray(raw.pedagogy?.rmjqDimensions) ? raw.pedagogy.rmjqDimensions :
                (Array.isArray(raw.rmjqDimensions) ? raw.rmjqDimensions : []),
            psocTags: Array.isArray(raw.pedagogy?.psocTags) ? raw.pedagogy.psocTags : [],
        },

        budget: {
            estimatedCost: raw.budget?.estimatedCost ?? 0,
            actualCost: raw.budget?.actualCost ?? 0,
            items: Array.isArray(raw.budget?.items) ? raw.budget.items.map((i: any) => ({
                description: i?.description || '',
                amount: i?.amount || 0
            })) : [],
            fundingSource: raw.budget?.fundingSource ?? 'Mission globale',
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
            participantsList: Array.isArray(raw.stats?.participantsList) ? raw.stats.participantsList : [],
        },
        evaluation: {
            preparationTime: raw.evaluation?.preparationTime ?? '',
            unfolding: raw.evaluation?.unfolding ?? '',
            unexpectedEvents: raw.evaluation?.unexpectedEvents ?? '',
            highlights: raw.evaluation?.highlights ?? '',
            verbatims: raw.evaluation?.verbatims ?? '',
            globalAppreciation: raw.evaluation?.globalAppreciation ?? '',
            futureNeeds: raw.evaluation?.futureNeeds ?? '',
        },
        clinicalObservations: {
            climate: raw.clinicalObservations?.climate ?? '',
            dynamics: raw.clinicalObservations?.dynamics ?? '',
            relationshipQuality: raw.clinicalObservations?.relationshipQuality ?? '',
            specificInterventions: raw.clinicalObservations?.specificInterventions ?? '',
            referrals: raw.clinicalObservations?.referrals ?? '',
            concerningSituations: raw.clinicalObservations?.concerningSituations ?? '',
            followUpPlanning: raw.clinicalObservations?.followUpPlanning ?? '',
            groupClimate: Array.isArray(raw.clinicalObservations?.groupClimate) ? raw.clinicalObservations.groupClimate : [],
            groupDynamicsNotes: raw.clinicalObservations?.groupDynamicsNotes ?? '',
            significantExchanges: typeof raw.clinicalObservations?.significantExchanges === 'number' ? raw.clinicalObservations.significantExchanges : 0,
            interventionNotes: Array.isArray(raw.clinicalObservations?.interventionNotes) ? raw.clinicalObservations.interventionNotes.map((n: any) => ({
                id: n?.id || `note-${Date.now()}-${Math.random()}`,
                youthName: n?.youthName ?? '',
                type: n?.type ?? 'Écoute active',
                description: n?.description ?? '',
                isConfidential: n?.isConfidential ?? true,
            })) : [],
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
