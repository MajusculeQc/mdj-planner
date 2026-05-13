import { Activity } from '../types';
import { STAFF_LIST } from './constants';
import { isAbsence } from './utils';

export interface ReadinessCheck {
    label: string;
    met: boolean;
    tab: string;
    optional: boolean;
    isCritical?: boolean; // Required for saving
}

export function calculateActivityReadiness(activity: Activity) {
    let score = 0;
    let totalChecks = 0;
    const checks: ReadinessCheck[] = [];
    const isSpecial = isAbsence(activity.title);

    // Check if activity is in the past (today or earlier)
    const today = new Date().toISOString().split('T')[0];
    const isPast = activity.date <= today;

    const addCheck = (label: string, condition: boolean, tab: string, optional: boolean = false, isCritical: boolean = false) => {
        // MDJ FERMÉE : toutes les conditions sont considérées comme remplies
        const effectiveCondition = activity.isMDJClosed ? true : condition;

        // If it's a special activity (absence/strike) OR an activity in the past, 
        // most pedagogy/logistics are NOT critical to allow saving the Journal de Bord.
        const effectiveCritical = (isSpecial) ? (label.includes("Titre") || label.includes("Type") || label.includes("Date")) : isCritical;

        if (!optional && effectiveCritical) {
            totalChecks++;
            if (effectiveCondition) score++;
        }
        checks.push({ label: optional ? `${label} (Optionnel)` : label, met: effectiveCondition, tab, optional, isCritical: effectiveCritical });
    };

    addCheck("Titre de l'activité (min 3 car.)", (activity.title || '').trim().length >= 3, 'pedagogy', false, true);
    addCheck("Type d'activité sélectionné", (activity.types || []).length > 0, 'pedagogy', false, true);
    addCheck("Description pédagogique (min 30 car.)", (activity.description || '').trim().length >= 30, 'pedagogy', false, true);
    addCheck("Objectifs RMJQ (min 2, min 10 car.)", (activity.objectives || []).length >= 2 && (activity.objectives || []).every((o: string) => o.trim().length >= 10), 'pedagogy', false, true);
    addCheck("Niveau d'implication des jeunes", !!activity.youthInvolvement?.level, 'pedagogy', false, true);
    addCheck("Tâches confiées aux jeunes (min 1)", (activity.youthInvolvement?.tasks || []).length > 0, 'pedagogy', false, true);
    addCheck("Critères d'évaluation définis", (activity.evaluationCriteria || []).length > 0, 'pedagogy', true);
    addCheck("Horaires définis", !!activity.startTime && !!activity.endTime, 'logistics', false, true);
    addCheck("Lieu et transport validés", !!activity.logistics.venueName && (!activity.logistics.transportRequired || !!activity.logistics.transportMode), 'logistics', false, true);
    addCheck("Heures transport définies", !activity.logistics.transportRequired || (!!activity.logistics.departureTime && !!activity.logistics.returnTime), 'logistics', false, true);

    const isCostDefined = (activity.logistics.costPerPerson !== undefined && activity.logistics.costPerPerson !== null);
    const isFree = !!activity.logistics.isFree;
    addCheck("Coût par personne défini", isCostDefined || isFree, 'logistics', false, true);

    addCheck("Matériel listé", (activity.materials || []).length > 0, 'materials', true);

    // staffing
    const leadStaffName = (activity.staffing?.leadStaff || '').trim();
    const isLeadNamed = (STAFF_LIST as readonly string[]).includes(leadStaffName);

    const validNamedSupport = (activity.staffing?.supportStaff || [])
        .map((s: string) => (s || '').trim())
        .filter((s: string) => s !== "" && (STAFF_LIST as readonly string[]).includes(s));

    // Pour le 100%, on exige au moins 2 personnes (Responsable nommé + au moins 1 accompagnateur nommé ou non)
    const hasLeadNamed = isLeadNamed;
    const hasAnySupport = (activity.staffing?.supportStaff || []).length >= 1;
    addCheck("Équipe (Minimum 2 intervenants)", (hasLeadNamed && hasAnySupport), 'staff', false, true);

    addCheck("Ratio d'encadrement respecté", !!activity.staffing.requiredRatio, 'staff', false, true);
    addCheck("Risques & Code de vie", activity.riskManagement.safetyProtocols.length > 0, 'risk', false, true);
    addCheck("Plan B / Notes terrain", !!activity.backupPlan, 'risk', true);
    addCheck("Contact d'urgence", !!activity.riskManagement.emergencyContact, 'risk', false, true);
    addCheck("Dimensions RMJQ sélectionnées", (activity.rmjqDimensions || []).length > 0, 'pedagogy', false, true);
    addCheck("Assurances & Autorisations", !!activity.riskManagement.requiredInsurance, 'risk', true);
    addCheck("Documents joints", (activity.documents || []).length > 0, 'documents', true);

    // Journal De Bord (Optional for initial saving, but encouraged for reporting)
    addCheck("Bilan de déroulement (JDB)", !!activity.evaluation?.unfolding, 'jdb', true);
    addCheck("Bons coups documentés (JDB)", !!activity.evaluation?.highlights, 'jdb', true);
    addCheck("Climat général observé (JDB)", !!activity.clinicalObservations?.climate, 'jdb', true);
    addCheck("Statistiques de présence (PSOC)",
        activity.stats.presentMale > 0 || activity.stats.presentFemale > 0 || activity.stats.presentNonBinary > 0 || (activity.stats.participantsList || []).length > 0,
        'jdb', true);

    const percentage = activity.isMDJClosed ? 100 : (totalChecks === 0 ? 0 : Math.round((score / totalChecks) * 100));
    // Uniquement le coût manque si score === totalChecks - 1 ET que le coût n'est pas défini ET que ce n'est pas gratuit
    const isMissingOnlyCost = !activity.isMDJClosed && !(isCostDefined || isFree) && (score === totalChecks - 1);

    return { percentage, isMissingOnlyCost, checks };
}
