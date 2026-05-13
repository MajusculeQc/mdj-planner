import { Activity } from '../types';

export const TYPE_KEYWORDS: Record<string, string[]> = {
    'Accueil, Écoute & Milieu de Vie': ['accueil', 'écoute', 'milieu de vie', 'soirée libre', 'ouverture', 'drop-in'],
    'Aide aux Devoirs & Soutien Scolaire': ['devoirs', 'scolaire', 'études', 'tutorat', 'école', 'lecture'],
    'Accompagnement Individualisé': ['accompagnement', 'suivi', 'individuel', 'rencontre', 'référence'],
    'Intervention & Gestion de Crise': ['intervention', 'crise', 'conflit', 'médiation', 'urgence'],
    'Animation (sorties, activités, séjours)': ['sortie', 'animation', 'séjour', 'camp', 'excursion', 'jeux', 'film', 'bowling', 'cinéma', 'arcade', 'tournoi', 'fête'],
    'Prévention & Sensibilisation (Interne)': ['prévention', 'sensibilisation', 'atelier', 'discussion', 'drogue', 'cyber', 'anxiété', 'stress', 'sexualité'],
    'Prévention & Sensibilisation (Partenaire)': ['partenaire', 'conférence', 'organisme', 'intervenant externe', 'inter-mdj', 'pointe du lac', 'mdj', 'entreprise', 'inc', 'ltée', 'ltee', 'coop', 'association', 'assos', 'fondation', 'comité', 'carrefour', 'club', 'centre', 'ville', 'ecole', 'college'],
    'Vie Associative & Bénévolat Jeunes': ['comité', 'assemblée', 'démocratie', 'conseil', 'bénévolat'],
    'Promotion, Concertation & Gestion': ['promotion', 'concertation', 'gestion', 'administratif', 'planification', 'rapport'],
    'Activité physique': ['sport', 'physique', 'entraînement', 'gym', 'ballon', 'hockey', 'soccer', 'basket', 'pickleball', 'yoga', 'danse'],
    'Atelier culinaire': ['cuisine', 'culinaire', 'recette', 'bouffe', 'chef', 'gâteau', 'souper', 'dîner', 'lunch'],
    'Activité démocratique (CJ)': ['c.j.', 'comité de jeunes', 'conseil de jeunes', 'élections', 'vote', 'démocratique']
};

export const RMJQ_KEYWORDS = {
    Relationnel: [
        "discussion", "rencontre", "liens", "groupe", "social", "partage",
        "médiation", "causerie", "sortie", "visite", "inter-mdj", "comité",
        "cj", "pathfinder", "banquet", "cuisine", "échange", "cohabitation"
    ],
    Responsable: [
        "corvée", "rangement", "cuisine", "budget", "organisation", "accompagnement",
        "autonomie", "citoyenneté", "bénévolat", "aide", "responsable", "comité",
        "cj", "conserve", "sécurité", "tâche", "engagement"
    ],
    Créatif: [
        "peinture", "bricolage", "musique", "dessin", "écriture", "impro",
        "théâtre", "art", "projet", "conception", "création", "déco",
        "st-patrick", "pathfinder", "imaginaire", "expression", "brico"
    ],
    Actif: [
        "jeu", "tournoi", "défi", "équipe", "extérieur", "terrain", "action",
        "participation", "compétition", "pickleball", "bouger", "marche",
        "randonnée", "activité", "bouge"
    ],
    Physique: [
        "sport", "soccer", "basket", "hockey", "plein air", "randonnée",
        "natation", "danse", "entraînement", "bouger", "pickleball",
        "marche", "gym", "cardio", "musculation"
    ],
    Critique: [
        "actualité", "débat", "revue", "médias", "fake news", "enjeux",
        "réflexion", "droit", "justice", "politique", "opinion", "comité",
        "cj", "grève", "citoyen", "conserve", "analyse", "citoyenne"
    ]
};

export const SPORT_KEYWORDS = [
    "sport", "soccer", "basket", "hockey", "plein air", "randonnée",
    "natation", "danse", "entraînement", "bouger", "pickleball",
    "marche", "gym", "cardio", "musculation", "tournament", "tournoi",
    "badminton", "volleyball", "ping-pong", "tennis", "skate", "trottinette",
    "patin", "glisse", "ski", "snowboard", "curling", "boxe", "escalade",
    "yoga", "crossfit", "vélo", "cyclisme"
];

/**
 * Suggests RMJQ dimensions based on the activity title and description.
 */
export function suggestDimensions(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const suggested: string[] = [];

    Object.entries(RMJQ_KEYWORDS).forEach(([dim, keywords]) => {
        if (keywords.some(k => text.includes(k.toLowerCase()))) {
            suggested.push(dim);
        }
    });

    return Array.from(new Set(suggested));
}

/**
 * Suggests Activity Types based on title and description.
 * Specifically handles the user request to count sports as "Activité physique".
 */
export function suggestActivityTypes(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const suggested: string[] = [];

    if (SPORT_KEYWORDS.some(k => text.includes(k.toLowerCase()))) {
        suggested.push('Activité physique');
    }

    return Array.from(new Set(suggested));
}
/**
 * Checks if an activity matches a given activity type based on keywords or explicit type.
 */
export function checkActivityTypeMatch(act: Activity, targetType: string): boolean {
    const titleLower = act.title.toLowerCase();
    const descLower = (act.description || '').toLowerCase();
    const text = `${titleLower} ${descLower}`;

    // 1. Explicit check for Homework Help property
    if (targetType === 'Aide aux Devoirs & Soutien Scolaire' && act.hasHomeworkHelp) {
        return true;
    }

    // 2. Check if text contains any keyword for this category
    const keywords = TYPE_KEYWORDS[targetType];
    if (keywords && keywords.some(k => text.includes(k.toLowerCase()))) {
        return true;
    }

    // 3. Fallback to explicit type matching
    return (act.types || []).includes(targetType as any) || act.type === targetType;
}
