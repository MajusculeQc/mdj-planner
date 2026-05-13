import { Activity } from '../types';

/**
 * Service pour l'exportation des données de l'application.
 */
export const ExportService = {
    /**
     * Génère et télécharge un rapport complet incluant TOUTES les données (évaluations, observations, indicateurs).
     */
    downloadFullAnnualCSV: (activities: Activity[]) => {
        const headers = [
            'Date', 'Titre', 'Types', 'Description',
            'Visites Gars', 'Visites Filles', 'Visites NB', 'Total Visites', 'Nouveaux Membres',
            '12-14 ans', '15-17 ans', '18 ans +', 'Notes Socio-démographiques',
            'Eval_TempsPrep', 'Eval_Deroulement', 'Eval_Imprevus', 'Eval_FaitsSaillants', 'Eval_Verbatims', 'Eval_Appreciation', 'Eval_BesoinsFuturs',
            'Clinique_Climat', 'Clinique_NotesDynamique', 'Clinique_InterventionsCount', 'Clinique_EchangesSignificatifs',
            'Comm_Benevoles_Nb', 'Comm_Benevoles_Heures', 'Comm_Benevoles_Taches',
            'Comm_JeunesBenevoles_Nb', 'Comm_JeunesBenevoles_Heures',
            'Comm_Partenariats', 'Comm_ReachSocial', 'Comm_Medias', 'Comm_NotesOutreach',
            'Comm_Financement_Actif', 'Comm_Financement_Montant', 'Comm_DonsMateriels',
            'Animation_Type'
        ];

        const escapeCSV = (str: any) => {
            if (str === null || str === undefined) return '""';
            const val = Array.isArray(str) ? str.join('; ') : str.toString();
            return `"${val.replace(/"/g, '""')}"`;
        };

        const rows = activities.sort((a, b) => a.date.localeCompare(b.date)).map(act => {
            const male = act.stats?.presentMale || 0;
            const female = act.stats?.presentFemale || 0;
            const nb = act.stats?.presentNonBinary || 0;
            const total = male + female + nb;

            return [
                act.date,
                escapeCSV(act.title),
                escapeCSV(act.types || act.type || ''),
                escapeCSV(act.description),
                male,
                female,
                nb,
                total,
                act.stats?.newMembers || 0,
                act.stats?.age12_14 || 0,
                act.stats?.age15_17 || 0,
                act.stats?.age18plus || 0,
                escapeCSV(act.stats?.sociodemographicNotes || ''),
                escapeCSV(act.evaluation?.preparationTime || ''),
                escapeCSV(act.evaluation?.unfolding || ''),
                escapeCSV(act.evaluation?.unexpectedEvents || ''),
                escapeCSV(act.evaluation?.highlights || ''),
                escapeCSV(act.evaluation?.verbatims || ''),
                escapeCSV(act.evaluation?.globalAppreciation || ''),
                escapeCSV(act.evaluation?.futureNeeds || ''),
                escapeCSV(act.clinicalObservations?.groupClimate || ''),
                escapeCSV(act.clinicalObservations?.groupDynamicsNotes || ''),
                act.clinicalObservations?.significantExchanges || 0,
                escapeCSV(act.clinicalObservations?.specificInterventions || ''),
                act.communityIndicators?.volunteerCount || 0,
                act.communityIndicators?.volunteerHours || 0,
                escapeCSV(act.communityIndicators?.volunteerTasks || ''),
                act.communityIndicators?.youthVolunteerCount || 0,
                act.communityIndicators?.youthVolunteerHours || 0,
                escapeCSV(act.communityIndicators?.partnerships || ''),
                act.communityIndicators?.socialMediaEngagement || 0,
                escapeCSV(act.communityIndicators?.mediaInterviews || ''),
                escapeCSV(act.communityIndicators?.outreachNotes || ''),
                act.communityIndicators?.isFundingActivity ? 'OUI' : 'NON',
                act.communityIndicators?.fundingAmount || 0,
                escapeCSV(act.communityIndicators?.materialDonations || ''),
                escapeCSV(act.staffing?.animationType || 'Interne')
            ].join(',');
        });

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `RAPPORT_ANNUEL_COMPLET_${new Date().getFullYear()}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * Génère et télécharge un fichier CSV de base (compatibilité ascendante).
     */
    downloadActivitiesCSV: (activities: Activity[]) => {
        const headers = ['Date', 'Titre', 'Type', 'Gars', 'Filles', 'NB', 'Total', 'Nouveaux', 'Description'];
        const escapeCSV = (str: string) => `"${(str || '').toString().replace(/"/g, '""')}"`;

        const rows = activities.sort((a, b) => a.date.localeCompare(b.date)).map(act => {
            const male = act.stats?.presentMale || 0;
            const female = act.stats?.presentFemale || 0;
            const nb = act.stats?.presentNonBinary || 0;
            return [
                act.date,
                escapeCSV(act.title),
                escapeCSV(act.types?.[0] || act.type || ''),
                male, female, nb, male + female + nb,
                act.stats?.newMembers || 0,
                escapeCSV(act.description.substring(0, 100))
            ].join(',');
        });

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `extraction_base_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
};
