/**
 * One-time migration script: Remap old activity types to the 9 RMJQ volets.
 * Run with: node scripts/migrate-types.mjs
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDDiWf0Vt5k3eVfKXw7VEY9I2AyCSfrxVQ",
    authDomain: "mdj-planner-prod.firebaseapp.com",
    projectId: "mdj-planner-prod",
    storageBucket: "mdj-planner-prod.firebasestorage.app",
    messagingSenderId: "982719306470",
    appId: "1:982719306470:web:abc541e68cda448bfdb927",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const OLD_TO_NEW = {
    'Saines habitudes de vie': 'Animation (sorties, activités, séjours)',
    'Vie associative et démocratique': 'Vie Associative & Bénévolat Jeunes',
    'Prévention et sensibilisation': 'Prévention & Sensibilisation (Interne)',
    'Expression artistique et culturelle': 'Animation (sorties, activités, séjours)',
    'Loisirs et divertissements': 'Animation (sorties, activités, séjours)',
    'CUISINE': 'Animation (sorties, activités, séjours)',
    'Coup de pouce': 'Accompagnement Individualisé',
    'Culte et spiritualité': 'Accueil, Écoute & Milieu de Vie',
    'Culturelle': 'Animation (sorties, activités, séjours)',
    'Formation': 'Prévention & Sensibilisation (Interne)',
    'Plein air': 'Animation (sorties, activités, séjours)',
    'Sortie': 'Animation (sorties, activités, séjours)',
    'Sportive': 'Animation (sorties, activités, séjours)',
    'Journée spéciale': 'Accueil, Écoute & Milieu de Vie',
    'Autre': 'Accueil, Écoute & Milieu de Vie'
};

const VALID_TYPES = new Set([
    'Accueil, Écoute & Milieu de Vie',
    'Aide aux Devoirs & Soutien Scolaire',
    'Accompagnement Individualisé',
    'Intervention & Gestion de Crise',
    'Animation (sorties, activités, séjours)',
    'Prévention & Sensibilisation (Interne)',
    'Prévention & Sensibilisation (Partenaire)',
    'Vie Associative & Bénévolat Jeunes',
    'Promotion, Concertation & Gestion'
]);

async function migrate() {
    console.log('🔄 Reading all activities from Firestore...');
    const querySnapshot = await getDocs(collection(db, "activities"));
    console.log(`📊 Found ${querySnapshot.size} activities total.\n`);

    let updated = 0;
    let skipped = 0;

    for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const currentType = data.type || '';
        const title = data.title || '(sans titre)';
        const date = data.date || '?';

        // Already valid
        if (VALID_TYPES.has(currentType)) {
            console.log(`  ⏭️  [${date}] "${title}" — déjà conforme (${currentType})`);
            skipped++;
            continue;
        }

        // Map old → new
        let newType = OLD_TO_NEW[currentType];

        // Keyword fallback
        if (!newType) {
            const titleLower = title.toLowerCase();
            if (/soirée libre|accueil|ouverture|drop-in/.test(titleLower)) {
                newType = 'Accueil, Écoute & Milieu de Vie';
            } else if (/devoirs|scolaire|tutorat/.test(titleLower)) {
                newType = 'Aide aux Devoirs & Soutien Scolaire';
            } else if (/comité|c\.j\.|assemblée|bénévolat/.test(titleLower)) {
                newType = 'Vie Associative & Bénévolat Jeunes';
            } else if (/prévention|sensibilisation|atelier/.test(titleLower)) {
                newType = 'Prévention & Sensibilisation (Interne)';
            } else {
                newType = 'Animation (sorties, activités, séjours)';
            }
        }

        // Apply the update
        await setDoc(doc(db, "activities", docSnapshot.id), {
            type: newType
        }, { merge: true });

        console.log(`  ✅  [${date}] "${title}": "${currentType}" → "${newType}"`);
        updated++;
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Migration terminée !`);
    console.log(`   ${updated} activités mises à jour`);
    console.log(`   ${skipped} activités déjà conformes`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Migration échouée:', err);
    process.exit(1);
});
