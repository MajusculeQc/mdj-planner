import { ActivityType } from '../types';
import type { UserRole } from './schemas';

// ═══════════════════════════════════════════════════════════════════════════
// STAFF & ROLE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const STAFF_LIST = [
    'Charles Frenette',
    'Laurie Bray Pratte',
    'Mikael Delage',
    // 'Ann-Sophie (Stagiaire)', // Ancienne employée, retirée des choix mais conservée pour les archives
    'Patrick Delage',
    'Sébastien Johnson',
] as const;

export const SUPPORT_STAFF_EXTRAS = [
    'Stagiaire',
    'Bénévole',
    'Parent-Accompagnateur',
    'Coordonnateur',
    'Intervenant externe',
] as const;

export const AUTHORIZED_VALIDATORS = [
    'Pat Delage',
    'Laurie Bray Pratte',
    'Charles Frenette',
    'Sébastien Johnson',
] as const;

export const EMPLOYEE_NAMES: Readonly<Record<string, string>> = {
    'laurie.bray.pratte@mdjescalejeunesse.ca': 'Laurie',
    'charles.frenette11@mdjescalejeunesse.ca': 'Charles',
    'dg@mdjescalejeunesse.ca': 'Pat',
    'gestion@mdjescalejeunesse.ca': 'Sébastien',
    'admin@mdjescalejeunesse.ca': 'Superadmin Maintenance',
    'mikael.delage@mdjescalejeunesse.ca': 'Mikaël',
    'ann-sophie.loranger@mdjescalejeunesse.ca': 'Ann-Sophie',
} as const;

export const EMPLOYEE_AVATARS: Readonly<Record<string, string>> = {
    'laurie.bray.pratte@mdjescalejeunesse.ca': 'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/laurie-avatar-l039escale-jeunesse-la-piaule.png',
    'charles.frenette11@mdjescalejeunesse.ca': 'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/charles-avatar-l039escale-jeunesse-la-piaule.png',
    'dg@mdjescalejeunesse.ca': 'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/pat-avatar-l039escale-jeunesse-la-piaule.png',
    'gestion@mdjescalejeunesse.ca': 'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/sebastien-avatar-l039escale-jeunesse-la-piaule.png',
    'admin@mdjescalejeunesse.ca': 'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/system-admin-mdj-l039escale-jeunesse-la-piaule.png',
    'mikael.delage@mdjescalejeunesse.ca': 'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/mikael-avatar-l039escale-jeunesse-la-piaule.png',
    'ann-sophie.loranger@mdjescalejeunesse.ca': 'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/ann-so-avatar-l039escale-jeunesse-la-piaule.png',
} as const;

/**
 * Maps email addresses to user roles.
 * admin: full access (DG, Gestion)
 * animator: can create/edit activities
 * viewer: read-only
 */
export const ROLE_MAP: Readonly<Record<string, UserRole>> = {
    'dg@mdjescalejeunesse.ca': 'admin',
    'gestion@mdjescalejeunesse.ca': 'admin',
    'admin@mdjescalejeunesse.ca': 'super_admin',
    'laurie.bray.pratte@mdjescalejeunesse.ca': 'animator',
    'charles.frenette11@mdjescalejeunesse.ca': 'animator',
    'mikael.delage@mdjescalejeunesse.ca': 'animator',
    'ann-sophie.loranger@mdjescalejeunesse.ca': 'animator',
} as const;

export const DEFAULT_ROLE: UserRole = 'viewer';

// ═══════════════════════════════════════════════════════════════════════════
// MANAGEMENT EMAIL RECIPIENTS
// ═══════════════════════════════════════════════════════════════════════════

export const MANAGEMENT_EMAILS = [
    'gestion@mdjescalejeunesse.ca',
    'dg@mdjescalejeunesse.ca',
] as const;

/**
 * Full-name → email directory for the entire team.
 * Used by the staff transfer feature to send mailto: notifications.
 */
export const TEAM_DIRECTORY: Readonly<Record<string, string>> = {
    'Charles Frenette': 'charles.frenette11@mdjescalejeunesse.ca',
    // 'Ann-Sophie Loranger': 'ann-sophie.loranger@mdjescalejeunesse.ca', // Ancienne employée, retirée des choix mais conservée pour les archives
    'Pat Delage': 'dg@mdjescalejeunesse.ca',
    'Sébastien Johnson': 'gestion@mdjescalejeunesse.ca',
    'Mikael Delage': 'mikael.delage@mdjescalejeunesse.ca',
    'Laurie Bray Pratte': 'laurie.bray.pratte@mdjescalejeunesse.ca',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// MONTH NAMES
// ═══════════════════════════════════════════════════════════════════════════

export const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// RMJQ TARGETS
// ═══════════════════════════════════════════════════════════════════════════

export const RMJQ_TARGETS = [
    { label: 'Activités Physiques', type: ActivityType.PHYSIQUE, target: 2 },
    { label: 'Ateliers de Prévention', type: ActivityType.PREVENTION_INTERNE, target: 2 },
    { label: 'Ateliers Culinaires', type: ActivityType.CULINAIRE, target: 2 },
    { label: 'Activités Démocratiques (CJ)', type: ActivityType.DEMOCRATIQUE, target: 2 },
    { label: 'Aide aux devoirs', type: ActivityType.AIDE_DEVOIRS, target: 15 },
    { label: 'Activité avec Partenaire', type: ActivityType.PREVENTION_PARTENAIRE, target: 1 },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------
// ÉCOSYSTÈME PARTENAIRES (ORGANISATION MÉTIER)
// ---------------------------------------------------------
export const ECOSYSTEME_PARTENAIRES = {
    'Loisirs et Sports': {
        'Adrénaline Urbaine': {
            name: 'Adrénaline Urbaine',
            address: '2300, rue des Grands Marchés, Trois-Rivières, QC G9B 1X6',
            phone: '(819) 840-3556',
            email: 'serviceclient@adrenalineurbaine.ca',
            website: 'https://adrenalineurbaine.ca',
            facebook: 'https://www.facebook.com/AdrenalineUrbaine',
        },
        'Aquaradical': {
            name: 'Aquaradical',
            address: '1900, av. Melville, Trois-Rivières, QC G9A 5G4',
            phone: '(819) 693-3532',
            email: 'info@aquaradical.com',
            website: 'https://aquaradical.com',
            facebook: 'https://www.facebook.com/aquaradical',
        },
        'Arbraska Shawinigan': {
            name: 'Arbraska Shawinigan',
            address: '1900, av. Melville, Shawinigan, QC G9N 6T8',
            phone: '1 877 886-5500',
            email: 'info@arbraska.com',
            website: 'https://ilemelville.com/arbraska/',
            facebook: 'https://www.facebook.com/Arbraska',
        },
        'Campus Escalade': {
            name: 'Campus Escalade',
            address: '3375, rue Girard, Trois-Rivières, QC G8Z 2M5',
            phone: '(819) 840-3444',
            email: 'info@campusescalade.com',
            website: 'https://campusescalade.com',
            facebook: 'https://www.facebook.com/campusescalade',
        },
        'Complexe sportif Alphonse-Desjardins': {
            name: 'Complexe sportif Alphonse-Desjardins',
            address: '260, rue Dessureault, Trois-Rivières, QC G8T 9T9',
            phone: '(819) 373-5121',
            email: 'info@csad.ca',
            website: 'https://csad.ca',
            facebook: 'https://www.facebook.com/CSADTR',
        },
    },
    'Culture et Divertissement': {
        'Bibliothèque Gatien-Lapointe': {
            name: 'Bibliothèque Gatien-Lapointe',
            address: '1425, pl. de l\'Hôtel-de-Ville, Trois-Rivières, QC G9A 5L9',
            phone: '311',
            email: '311@v3r.net',
            website: 'https://www.v3r.net',
            facebook: 'https://www.facebook.com/v3r.net',
        },
        'Boréalis': {
            name: 'Boréalis',
            address: '200, avenue des Draveurs, Trois-Rivières, QC G9A 2J2',
            phone: '(819) 372-4633',
            email: 'borealis@culture3r.com',
            website: 'https://www.borealis3r.ca',
            facebook: 'https://www.facebook.com/Borealis3R',
        },
        'Cabane à sucre du Boisé': {
            name: 'Cabane à sucre du Boisé',
            address: '1670, rue Louis-de-France, Trois-Rivières, QC G8W 2C2',
            phone: '(819) 373-0682',
            email: 'info@cabaneasucreduboise.com',
            website: 'https://cabaneasucreduboise.com',
            facebook: 'https://www.facebook.com/cabaneasucreduboise',
        },
        'Cinéma du Cap': {
            name: 'Cinéma du Cap',
            address: '1180, rue Rochefort, Trois-Rivières, QC G8T 7J6',
            phone: '(819) 375-4000',
            email: 'info@cinetroisrivieres.com',
            website: 'https://cinetroisrivieres.com',
            facebook: 'https://www.facebook.com/cinemafleurdelys',
        },
        'Cinéma Fleur de Lys': {
            name: 'Cinéma Fleur de Lys',
            address: '4520 Boulevard des Récollets, Trois-Rivières, QC G9A 4N2',
            phone: '(819) 376-6154',
            website: 'https://cinentreprise.com/cinema/cinema-fleur-de-lys/',
            facebook: 'https://www.facebook.com/cineentreprise',
            email: 'info@cinentreprise.com',
        },
        'Culture Trois-Rivières': {
            name: 'Culture Trois-Rivières',
            address: '1425, pl. de l\'Hôtel-de-Ville, Trois-Rivières, QC G9A 5H3',
            phone: '(819) 372-4633',
            email: 'billetterie@culture3r.com',
            website: 'https://www.culture3r.com',
            facebook: 'https://www.facebook.com/Culture3R',
        },
        'Enigma': {
            name: 'Enigma',
            address: '1916, rue Bellefeuille, Trois-Rivières, QC G9A 3Y2',
            phone: '(819) 840-2512',
            email: 'allo@monenigma.ca',
            website: 'https://monenigma.ca',
            facebook: 'https://www.facebook.com/monenigma.ca',
        },
        'Musée POP': {
            name: 'Musée POP',
            address: '200, rue Laviolette, Trois-Rivières, QC G9A 6L5',
            phone: '(819) 372-0406',
            email: 'info@museepop.ca',
            website: 'https://museepop.ca',
            facebook: 'https://www.facebook.com/museepop',
        },
        'Poterie et Cie': {
            name: 'Poterie et Cie',
            address: '1406, rue Aubuchon, Trois-Rivières, QC G8Z 4C4',
            phone: '(819) 376-7444',
            email: 'info@poterieetcie.com',
            website: 'https://poterieetcie.com',
            facebook: 'https://www.facebook.com/poterieetcie',
        },
    },
    'Santé et Prévention': {
        'Accalmie': {
            name: 'Accalmie',
            address: '1905, rue Royale, Trois-Rivières, QC G9A 4K8',
            phone: '(819) 840-0549',
            email: 'info@preventiondusuicide.com',
            website: 'https://preventiondusuicide.com',
            facebook: 'https://www.facebook.com/CPSAccalmie',
        },
        'Action Toxicomanie': {
            name: 'Action Toxicomanie',
            address: '1900, av. Melville, Trois-Rivières, QC G9A 5H3',
            phone: '1 866 673-8837',
            email: 'info@actiontox.com',
            website: 'https://actiontox.com',
            facebook: 'https://www.facebook.com/actiontoxicomanie',
        },
        'Anna et la mer': {
            name: 'Anna et la mer',
            address: '1754, rue Jean-Nicolet, Trois-Rivières, QC G8Z 2B4',
            phone: '(819) 372-1105',
            email: 'annaetlamer@annaetlamer.com',
            website: 'https://annaetlamer.com',
            facebook: 'https://www.facebook.com/annaetlamer',
        },
        'La Lanterne': {
            name: 'La Lanterne',
            address: '17, rue Fusey, bur. 208, Trois-Rivières, QC G8T 2T4',
            phone: '(819) 375-1011',
            email: 'infolalanterne@videotron.ca',
            website: 'https://lalanterne.org',
            facebook: 'https://www.facebook.com/lalanternetr',
        },
        'Tandem Mauricie': {
            name: 'Tandem Mauricie',
            address: '1493, rue Laviolette, Trois-Rivières, QC G9A 1W5',
            phone: '(819) 379-3801',
            email: 'direction@tandemmauricie.ca',
            website: 'https://tandemmauricie.ca',
            facebook: 'https://www.facebook.com/tandemmauricie',
        },
    },
    'Inclusion et Droits': {
        'Centre d\'Amitié Autochtone de T-R': {
            name: 'Centre d\'Amitié Autochtone de Trois-Rivières',
            address: '1000, boul. du Saint-Maurice, Trois-Rivières, QC G9A 3R3',
            phone: '(819) 371-3333',
            email: 'info@caatr.ca',
            website: 'https://caatr.ca',
            facebook: 'https://www.facebook.com/Centreamitieautochtonetroisrivieres',
        },
        'Gris Mauricie': {
            name: 'Gris Mauricie',
            address: '118, rue Radisson, bur. 102, Trois-Rivières, QC G9A 2C4',
            phone: '(819) 840-6615',
            email: 'info@grismcdq.org',
            website: 'https://grismcdq.org',
            facebook: 'https://www.facebook.com/grismcdq',
        },
        'Info-Justice Mauricie': {
            name: 'Info-Justice Mauricie',
            address: '1350, rue Royale, bur. 401, Trois-Rivières, QC G9A 4J4',
            phone: '(819) 415-5835',
            email: 'mauricie@info-justice.ca',
            website: '',
            facebook: 'https://www.facebook.com/infojusticeqc',
        },
        'SANA Trois-Rivières': {
            name: 'SANA Trois-Rivières',
            address: '3175, boul. des Récollets, Trois-Rivières, QC G9A 6J2',
            phone: '(819) 375-2196',
            email: 'info@sana3r.ca',
            website: 'https://sana3r.ca',
            facebook: 'https://www.facebook.com/SanaTroisRivieres',
        },
        'Trans Mauricie': {
            name: 'Trans Mauricie',
            address: '1060, rue St-François-Xavier, bur. 350, Trois-Rivières, QC G9A 1R8',
            phone: '(819) 313-7787',
            email: 'transmcdq@gmail.com',
            website: '',
            facebook: 'https://www.facebook.com/TransMCDQ',
        },
        'Équijustice Trois-Rivières': {
            name: 'Équijustice Trois-Rivières',
            address: '543 Rue Laviolette, Trois-Rivières, QC G9A 1V4',
            phone: '(819) 372-9913',
            website: 'https://equijustice.ca/fr/membres/trois-rivieres',
            facebook: 'https://www.facebook.com/EquijusticeTR',
            email: 'troisrivieres@equijustice.ca',
        },
    },
    'Services Publics': {
        'Bureaux députés (Jean Boulet)': {
            name: 'Bureaux députés (Jean Boulet)',
            address: '1500, rue Royale, Bureau 180, Trois-Rivières, QC G9A 6E6',
            phone: '819 371-6901',
            email: 'Jean.Boulet.TRRI@assnat.qc.ca',
            website: 'https://www.assnat.qc.ca/fr/deputes/boulet-jean-17855/index.html',
            facebook: 'https://www.facebook.com/JeanBouletTR',
        },
        'Service de police de Trois-Rivières': {
            name: 'Service de police de Trois-Rivières',
            address: '2250, boul. des Forges, Trois-Rivières, QC G8Z 1T3',
            phone: '819-370-6700',
            website: 'https://www.v3r.net/police',
            facebook: 'https://www.facebook.com/Policetroisrivieres',
            email: 'sptr.communautaire@v3r.net',
        },
        'Ville de Trois-Rivières (311)': {
            name: 'Ville de Trois-Rivières (311)',
            address: '1425, pl. de l\'Hôtel-de-Ville, Trois-Rivières, QC G9A 5H3',
            phone: '311',
            email: '311@v3r.net',
            website: 'https://www.v3r.net',
            facebook: 'https://www.facebook.com/v3r.net',
        },
    },
    'Développement et Proximité': {
        'Autonomie Jeunesse': {
            name: 'Autonomie Jeunesse',
            address: '3425, rue de Courval, Trois-Rivières, QC G8Z 1S8',
            phone: '(819) 371-2035',
            email: 'cdj@autonomiejeunesse.com',
            website: '',
            facebook: 'https://www.facebook.com/centredejourautonomiejeunesse',
        },
        'CJE Trois-Rivières': {
            name: 'CJE Trois-Rivières',
            address: '580, rue Barkoff, bur. 300, Trois-Rivières, QC G8T 2A1',
            phone: '(819) 376-0179',
            email: 'info@cjetrdc.com',
            website: 'https://cjetrdc.com',
            facebook: 'https://www.facebook.com/cjetrdc',
        },
        'Cultive le partage (La Brouette)': {
            name: 'Cultive le partage (La Brouette)',
            address: '280, rue Saint-Georges, Trois-Rivières, QC G9A 2J4',
            phone: '(819) 375-3331',
            email: 'kim@cultivelepartage.com',
            website: 'https://labrouette.ca',
            facebook: 'https://www.facebook.com/cultivelepartage.labrouette',
        },
        'Point de Rue': {
            name: 'Point de Rue',
            address: '337, rue Laurier, Trois-Rivières, QC G9A 2R4',
            phone: '(819) 694-4545',
            email: 'info@pointderue.com',
            website: 'https://pointderue.com',
            facebook: 'https://www.facebook.com/PointdeRue',
        },
        'Ressource F.A.I.R.E.': {
            name: 'Ressource F.A.I.R.E.',
            address: '1400, rue De Courval, Trois-Rivières, QC G8Z 1Z3',
            phone: '(819) 375-1215',
            email: 'directionfaire@gmail.com',
            website: '',
            facebook: 'https://www.facebook.com/RessourceFAIRE',
        },
        'Technoscience Mauricie / C-d-Q': {
            name: 'Technoscience Mauricie',
            address: '3351, boul. des Forges (UQTR), Trois-Rivières, QC G9A 5H7',
            phone: '(819) 376-5077',
            email: 'info@technoscience-mcq.ca',
            website: 'https://technoscience-mcq.ca',
            facebook: 'https://www.facebook.com/technosciencemcq',
        },
    },
    'Réseau Inter-MDJ': {
        'MDJ Action Jeunesse': {
            name: 'MDJ Action Jeunesse',
            address: '5585, rue Jean-Paul Lavergne, Trois-Rivières, QC G8Y 3Y5',
            phone: '(819) 373-4974',
            email: 'mdjactionjeunesse.coordo@gmail.com',
            website: 'https://mdjactionjeunesse.com',
            facebook: 'https://www.facebook.com/mdjactionjeunesse',
        },
        'MDJ Alternative Jeunesse': {
            name: 'MDJ Alternative Jeunesse',
            address: '973, rue Royale, Trois-Rivières, QC G9A 4H7',
            phone: '(819) 373-6065',
            email: 'coordoaltern@cgocable.ca',
            website: 'https://www.mdjalternativejeunesse.com',
            facebook: 'https://www.facebook.com/MdjAlternativeJeunesse',
        },
        'MDJ de Pointe-du-Lac': {
            name: 'MDJ de Pointe-du-Lac',
            address: '10555, ch. Sainte-Marguerite, Trois-Rivières, QC G9B 6N6',
            phone: '(819) 377-5092',
            email: 'mdjpointedulac@hotmail.com',
            website: 'https://mdjpointedulac.ca',
            facebook: 'https://www.facebook.com/mdjpointedulac',
        },
        'MDJ Le Chakado': {
            name: 'MDJ Le Chakado',
            address: '1191, rue Boisclair, Trois-Rivières, QC G8V 2S5',
            phone: '(819) 373-1399',
            email: 'lechakado@hotmail.com',
            website: '',
            facebook: 'https://www.facebook.com/mdjlechakado',
        },
        'MDJ Le Transit': {
            name: 'MDJ Le Transit',
            address: '75, rue Thuney, Trois-Rivières, QC G8T 6L5',
            phone: '(819) 371-2982',
            email: 'letransit@qc.aira.com',
            website: 'https://mdjletransit.com',
            facebook: 'https://www.facebook.com/mdjletransit',
        },
    },
    'Lieux Divers': {
        'Carnaval hivernal': {
            name: 'Carnaval hivernal',
            address: 'Parcs divers, Trois-Rivières, QC',
            phone: '311',
            email: '311@v3r.net',
            website: 'https://www.v3r.net',
            facebook: 'https://www.facebook.com/v3r.net',
        },
        'En ligne / Terrain': {
            name: 'En ligne / Terrain',
            address: 'Trois-Rivières, QC',
            phone: '',
            email: '',
            website: '',
            facebook: '',
        }
    }
} as const;

// ---------------------------------------------------------
// AUTRES LIEUX ET SERVICES (V3R, PARCS, ETC.)
// ---------------------------------------------------------
export const SERVICES_CIVIQUES = {
    'Boulodrome Trois-Rivières': {
        name: 'Boulodrome Trois-Rivières',
        address: '1701 Rue Notre-Dame Est, Trois-Rivières, QC G8T 8Y4',
        phone: '(819) 373-3666',
        website: 'https://www.facebook.com/groups/petanqueamis',
        facebook: 'https://www.facebook.com/groups/petanqueamis',
        email: 'petanqueamis1996@outlook.com',
    },
    'Moulin seigneurial de Pointe-du-Lac': {
        name: 'Moulin seigneurial de Pointe-du-Lac',
        address: '11930 Rue Notre-Dame Ouest, Trois-Rivières, QC G9B 6X1',
        phone: '(819) 377-1396',
        website: 'https://moulin-pointedulac.com',
        facebook: 'https://www.facebook.com/moulinpointedulac',
        email: 'communication@moulin-pointedulac.com',
    },
    'Parc Pie-XII': {
        name: 'Parc Pie-XII',
        address: '2850 Rue Monseigneur-Saint-Arnaud, Trois-Rivières, QC G9A 4L9',
        phone: '(819) 374-2002',
        website: 'https://www.v3r.net/activites-et-loisirs/parcs/parc-pie-xii',
        facebook: 'https://www.facebook.com/v3r.net',
        email: '311@v3r.net',
    },
    'Pavillon St-Arnaud': {
        name: 'Pavillon St-Arnaud',
        address: '2900 Rue Monseigneur-Saint-Arnaud, Trois-Rivières, QC G9A 5L2',
        phone: '(819) 374-2422',
        website: 'https://pavillonst-arnaud.com',
        facebook: 'https://www.facebook.com/pavillonstarnaud',
        email: 'info@pavillonst-arnaud.com',
    },
    'Piscine de l\'Exposition': {
        name: 'Piscine de l\'Exposition',
        address: '1500 Avenue Gilles-Villeneuve, Trois-Rivières, QC G8Z 3R7',
        phone: '(819) 694-4496',
        website: 'https://www.v3r.net/activites-et-loisirs/parcs/piscine-et-pataugeoire-du-parc-de-lexposition',
        facebook: 'https://www.facebook.com/v3r.net',
        email: '311@v3r.net',
    }
} as const;

// Extraction plate de tous les partenaires depuis les écosystèmes
const EXTRAIT_PARTENAIRES = Object.values(ECOSYSTEME_PARTENAIRES).reduce((acc, current) => {
    return { ...acc, ...current };
}, {});

export const VENUES = {
    'MDJ Escale Jeunesse - La Piaule': {
        name: 'MDJ Escale Jeunesse - La Piaule',
        address: '5225 Rue de Courcelette, Trois-Rivières, QC G8Y 4L4',
        phone: '(819) 694-7564',
        website: 'https://mdjescalejeunesse.ca',
        facebook: 'https://www.facebook.com/EscaleJeunesseLaPiauleMDJ/',
        email: 'info@mdjescalejeunesse.ca',
    },
    ...EXTRAIT_PARTENAIRES,
    ...SERVICES_CIVIQUES
} as const;


export const DEFAULT_VENUE = VENUES['MDJ Escale Jeunesse - La Piaule'];

/**
 * Normalizes venue names to avoid duplicates in suggestion lists.
 */
export function normalizeVenueName(name: string): string {
    if (!name) return "";
    const n = name.toLowerCase().trim();

    // MDJ Variations
    if (n === 'mdj' || n.includes('jérôme-cotnoir') || n.includes('jerome-cotnoir') || n.includes('piaule') || n.includes('escale jeunesse')) {
        return 'MDJ Escale Jeunesse - La Piaule';
    }
    if (n.includes('action jeunesse')) {
        return 'MDJ Action Jeunesse';
    }
    if (n.includes('alternative jeunesse')) {
        return 'MDJ Alternative Jeunesse';
    }
    if (n.includes('chakado')) {
        return 'MDJ Le Chakado';
    }
    if (n.includes('transit')) {
        return 'MDJ Le Transit';
    }
    if (n.includes('pointe-du-lac') && n.includes('mdj')) {
        return 'MDJ de Pointe-du-Lac';
    }

    // Pavillon St-Arnaud Variations
    if (n.includes('st-arnaud') || n.includes('saint-arnaud')) {
        return 'Pavillon St-Arnaud';
    }

    // Moulin seigneurial
    if (n.includes('moulin') && n.includes('seigneurial')) {
        return 'Moulin seigneurial de Pointe-du-Lac';
    }

    // Boulodrome
    if (n.includes('boulodrome')) {
        return 'Boulodrome Trois-Rivières';
    }

    // Piscine
    if (n.includes('piscine') && n.includes('exposition')) {
        return 'Piscine de l\'Exposition';
    }

    // Équijustice
    if (n.includes('équijustice') || n.includes('equijustice')) {
        return 'Équijustice Trois-Rivières';
    }

    // Technoscience
    if (n.includes('technoscience')) {
        return 'Technoscience Mauricie / C-d-Q';
    }

    // Cultive le partage
    if (n.includes('cultive le partage') || n.includes('brouette')) {
        return 'Cultive le partage (La Brouette)';
    }

    // Amitié Autochtone
    if (n.includes('amitié autochtone') || n.includes('caatr')) {
        return 'Centre d\'Amitié Autochtone de T-R';
    }

    // Action Toxicomanie
    if (n.includes('action tox')) {
        return 'Action Toxicomanie';
    }

    // SANA
    if (n.includes('sana')) {
        return 'SANA Trois-Rivières';
    }

    return name;
}

export const DEFAULT_EMERGENCY_CONTACT = 'Patrick Delage (DG) | 819-694-7564 | 450-501-3254';
export const DEFAULT_RATIO = '1/12';
export const DEFAULT_START_TIME = '17:30';
export const DEFAULT_END_TIME = '21:00';
export const HOMEWORK_HELP_START_TIME = '16:30';
export const HOMEWORK_HELP_END_TIME = '17:30';

export const SAFETY_RATIO_GUIDELINES = {
    STANDARD: { label: 'Animation régulière', ratio: '1/12', description: '1 intervenant pour 12 jeunes' },
    OUTINGS: { label: 'Sorties extérieures', ratio: '1/8', description: '1 intervenant pour 8 jeunes' },
    HIGH_RISK: { label: 'Activités à haut risque', ratio: '1/6', description: 'Selon normes (souvent 1:6)' },
    NIGHT_CAMPS: { label: 'Séjours de nuit / Camps', ratio: 'Min 2', description: 'Minimum 2 intervenants' },
    RULE_OF_GOLD: { label: 'Minimum de deux', description: 'Au moins 2 membres du personnel en tout temps' }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export function getEmployeeName(email?: string): string {
    if (!email) return '';
    const normalized = email.toLowerCase();
    return EMPLOYEE_NAMES[normalized] ?? email.split('@')[0];
}

export function getUserRole(email?: string): UserRole {
    if (!email) return DEFAULT_ROLE;
    return ROLE_MAP[email.toLowerCase()] ?? DEFAULT_ROLE;
}

// ═══════════════════════════════════════════════════════════════════════════
// PLANNING SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const SUGGESTIONS = {
    objectives: [
        "Développer l'esprit critique", "Favoriser l'autonomie", "Créer des liens significatifs",
        "Saines habitudes de vie", "Estime de soi", "Ouverture sur la communauté",
        "Gestion des émotions", "Ouverture culturelle", "Favoriser l'esprit d'équipe",
        "Développer la créativité", "Encourager l'activité physique", "Sensibiliser à l'environnement",
        "Apprendre de nouvelles habiletés", "Favoriser l'inclusion sociale", "Stimuler la curiosité intellectuelle"
    ],
    tasks: [
        "Préparation de la salle", "Accueil des participants", "Animation d'un segment",
        "Responsable de la musique", "Prise de photos", "Nettoyage et rangement",
        "Gestion des collations", "Cuisine collective", "Maître de jeu (RPG)",
        "Choix de la thématique", "Préparation du matériel",
        "Gestion de l'inscription", "Promotion (Réseaux sociaux)"
    ],
    evaluation: [
        "Niveau de participation active", "Respect des consignes de sécurité", "Qualité des interactions (climat)",
        "Plaisir exprimé par les jeunes", "Atteinte des objectifs pédagogiques", "Gestion des conflits",
        "Nombre de participants engagés", "Atteinte de l'objectif physique", "Absence d'incidents mineurs",
        "Ponctualité du transport", "Budget respecté",
        "Qualité des créations produites", "Niveau de coopération observé", "Utilisation adéquate du matériel",
        "Demande de récidive par les jeunes"
    ],
    materials: [
        "Trousse de premiers soins", "Bouteilles d'eau", "Dossards", "Système de son",
        "Collations / Repas", "Tablettes/Caméra", "Jeux de société", "Matériel d'art", "Équipement de sport",
        "Consoles et jeux vidéo", "Ingrédients de cuisine", "Projecteur et écran",
        "Tapis de sol / Poufs", "Papeterie et stylos", "Prix ou récompenses"
    ],
    hazards: [
        "Chutes ou glissades", "Blessures physiques (sport/activité)", "Conflits entre participants", "Rejets ou intimidation",
        "Réactions allergiques", "Coupures ou brûlures", "Égarement (Sortie)", "Conditions météorologiques défavorables",
        "Pannes mécaniques (transport)", "Pertes d'équipement"
    ],
    safety: [
        "Dénombrement régulier des jeunes", "Cellulaire d'urgence chargé", "Vérification des antécédents médicaux",
        "Respect du Code de vie", "Port de l'équipement de sécurité", "Système Copain-Copain (jumelage)",
        "Supervision cuisine", "Réseau cellulaire disponible", "Trousse de premiers soins complète",
        "Point de rassemblement défini", "Vérification des présences (début/fin)", "Contact d'urgence informé",
        "Plan B intérieur validé"
    ],
    compliance: [
        "Formulaire de consentement signé", "Fiche santé à jour", "Décharge de responsabilité du lieu",
        "Permis de conduire vérifié", "Autorisation parentale signée", "Paiement reçu (si applicable)",
        "Respect du ratio 1:12", "Vérification des antécédents", "Assurance responsabilité civile"
    ],
    siteRules: [
        "Interdiction de fumer/vapotage", "Respect du matériel du lieu", "Politesse envers le personnel", "Pas de flânage dans les corridors",
        "Pas de violence verbale ou physique", "Partage équitable du temps de jeu",
        "Nettoyage de son espace après usage", "Consommation interdite (drogue/alcool)", "Engagement dans l'activité choisie"
    ],
    budget: [
        "Transport (Autobus/Essence)", "Billets d'admission", "Épicerie / Repas",
        "Matériel d'animation", "Honoraires intervenant externe", "Location de salle",
        "Achat de matériel", "Location d'équipement",
        "Publicité / Impression", "Assurances spéciales", "Imprévus (10%)"
    ],
    qualifications: [
        "Secourisme (Norme CNESST)", "Antécédents judiciaires", "Hygiène/Salubrité (MAPAQ)",
        "SIMDUT 2015", "EpiPen / Épinéphrine", "Administration Naloxone", "Prévention Harcèlement",
        "Sécurité Incendie", "Prévention Infections", "Permis de conduire classe 4B", "Formation DAFA"
    ],
    rmjqDimensions: [
        "Relationnel", "Responsable", "Créatif", "Actif", "Physique", "Critique",
        "Accès aux droits et conditions de vie", "Apprentissage de la vie démocratique",
        "Prise en charge et autonomie", "Rapport égalitaire", "Ouverture sur la communauté",
        "Éducation et sensibilisation"
    ],
    youthTasks: [
        "Préparation de la salle", "Accueil des participants", "Animation d'un segment",
        "Responsable de la musique", "Prise de photos", "Nettoyage et rangement",
        "Gestion des collations", "Cuisine collective", "Maître de jeu (RPG)"
    ],
    description: [
        "Activité sportive dynamique", "Atelier de discussion thématique", "Sortie culturelle enrichissante",
        "Cuisine collective participative", "Tournoi de jeux vidéo", "Atelier créatif et artistique"
    ],
    checklist: [
        "Réserver le minibus", "Acheter les collations", "Vérifier la trousse de secours",
        "Confirmer la présence de l'invité", "Imprimer les feuilles de route", "Préparer le matériel audio"
    ],
    venueName: Object.keys(VENUES)
};

export const getCombinedList = (key: keyof typeof SUGGESTIONS, activity: any) => {
    const custom = (activity?.customSuggestions?.[key] || []);
    const baselineList = SUGGESTIONS[key] || [];
    const combined = [...(Array.isArray(baselineList) ? baselineList : []), ...(Array.isArray(custom) ? custom : [])].filter(Boolean) as string[];

    // Smart Deduplication logic
    const seen = new Set<string>();
    const result: string[] = [];

    const normalize = (s: string) => s.toLowerCase()
        .replace(/[éèêë]/g, 'e')
        .replace(/[àâä]/g, 'a')
        .replace(/[îï]/g, 'i')
        .replace(/[ôö]/g, 'o')
        .replace(/[ûü]/g, 'u')
        .replace(/s$/g, '') // remove trailing s
        .replace(/[^\w\s]/gi, '') // remove punctuation
        .trim();

    // Sort by length (descending) so more descriptive terms are prioritized when fuzzy-matched
    const sortedCombined = combined.sort((a, b) => b.length - a.length);

    for (const item of sortedCombined) {
        const norm = normalize(item);
        if (!seen.has(norm)) {
            seen.add(norm);
            result.push(item);
        }
    }

    return result.sort((a, b) => {
        if (a === 'MDJ Escale Jeunesse - La Piaule') return -1;
        if (b === 'MDJ Escale Jeunesse - La Piaule') return 1;
        return a.localeCompare(b);
    });
};
