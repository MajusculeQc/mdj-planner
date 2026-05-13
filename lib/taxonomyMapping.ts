/**
 * Unified impacts mapping CAR objectives to RMJQ dimensions.
 * This is used to present a single choice to the user that populates both taxonomies.
 */
export interface UnifiedImpact {
    id: string;
    label: string; // C.A.R. label (most descriptive)
    dimensions: string[]; // Corresponding RMJQ dimensions
    icon?: string;
}

export const UNIFIED_IMPACTS: UnifiedImpact[] = [
    { id: 'critique', label: "Développer l'esprit critique", dimensions: ["Critique"] },
    { id: 'autonomie', label: "Favoriser l'autonomie", dimensions: ["Prise en charge et autonomie"] },
    { id: 'liens', label: "Créer des liens significatifs", dimensions: ["Relationnel", "Rapport égalitaire"] },
    { id: 'habitudes', label: "Saines habitudes de vie", dimensions: ["Physique", "Actif"] },
    { id: 'estime', label: "Estime de soi", dimensions: ["Relationnel"] },
    { id: 'communaute', label: "Ouverture sur la communauté", dimensions: ["Ouverture sur la communauté", "Apprentissage de la vie démocratique"] },
    { id: 'emotions', label: "Gestion des émotions", dimensions: ["Relationnel"] },
    { id: 'culture', label: "Ouverture culturelle", dimensions: ["Ouverture sur la communauté", "Créatif"] },
    { id: 'equipe', label: "Favoriser l'esprit d'équipe", dimensions: ["Relationnel", "Rapport égalitaire"] },
    { id: 'creativite', label: "Développer la créativité", dimensions: ["Créatif"] },
    { id: 'physique', label: "Encourager l'activité physique", dimensions: ["Physique", "Actif"] },
    { id: 'environnement', label: "Sensibiliser à l'environnement", dimensions: ["Critique", "Éducation et sensibilisation"] },
    { id: 'habiletes', label: "Apprendre de nouvelles habiletés", dimensions: ["Prise en charge et autonomie"] },
    { id: 'inclusion', label: "Favoriser l'inclusion sociale", dimensions: ["Relationnel", "Accès aux droits et conditions de vie"] },
    { id: 'curiosite', label: "Stimuler la curiosité intellectuelle", dimensions: ["Critique", "Apprentissage de la vie démocratique"] }
];

export const CAR_TO_RMJQ_MAPPING: Record<string, string[]> = UNIFIED_IMPACTS.reduce((acc, curr) => ({
    ...acc,
    [curr.label]: curr.dimensions
}), {});

export const TYPE_TO_PSOC_MAPPING: Record<string, string[]> = {
    "Accueil, Écoute & Milieu de Vie": ["Relation d'aide", "Information & Référence", "Prévention globale"],
    "Aide aux Devoirs & Soutien Scolaire": ["Prévention globale"],
    "Animation (sorties, activités, séjours)": ["Prévention globale"],
    "Intervention & Gestion de Crise": ["Relation d'aide", "Information & Référence", "Défense des droits"],
    "Vie Associative & Bénévolat Jeunes": ["Mobilisation citoyenne", "Soutien aux comités"],
    "Prévention & Sensibilisation (Interne)": ["Sensibilisation", "Prévention globale"],
    "Prévention & Sensibilisation (Partenaire)": ["Sensibilisation", "Prévention globale"],
    "Accompagnement Individualisé": ["Relation d'aide", "Information & Référence"],
    "Promotion, Concertation & Gestion": ["Défense des droits", "Mobilisation citoyenne"]
};

/**
 * Returns suggested RMJQ dimensions based on a list of CAR objectives.
 */
export function getRMJQFromObjectives(objectives: string[]): string[] {
    const dimensions = new Set<string>();
    objectives.forEach(obj => {
        // Handle exact matches or partial matches (if user edited the text)
        const match = UNIFIED_IMPACTS.find(u => obj.startsWith(u.label));
        if (match) {
            match.dimensions.forEach(m => dimensions.add(m));
        }
    });
    return Array.from(dimensions);
}

/**
 * Returns default PSOC tags for an activity type or array of types.
 */
export function getPSOCFromType(types: string | string[]): string[] {
    if (Array.isArray(types)) {
        const allTags = new Set<string>();
        types.forEach(t => {
            (TYPE_TO_PSOC_MAPPING[t] || []).forEach(tag => allTags.add(tag));
        });
        return Array.from(allTags);
    }
    return TYPE_TO_PSOC_MAPPING[types] || [];
}
