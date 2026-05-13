
import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("../cle-export.json", "utf8"));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function getDetailedActivity() {
    console.log("Analyse détaillée de l'activité 'Fondue' du 16 avril 2026...");
    const snapshot = await db.collection("activities")
        .where("date", "==", "2026-04-16")
        .get();

    if (snapshot.empty) {
        console.log("Aucune activité trouvée pour cette date.");
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.title.toLowerCase().includes("fondue")) {
            console.log("\n========================================");
            console.log("DÉTAILS DU DOCUMENT STORED");
            console.log("========================================");
            console.log("ID Document     :", doc.id);
            console.log("Titre           :", data.title);
            console.log("Date            :", data.date);
            console.log("Créé par        :", data.createdByEmail || "Inconnu");
            console.log("Description     :", data.description?.substring(0, 100) + "...");

            console.log("\nCONTENU DU CHAMP 'materials' :");
            console.log(JSON.stringify(data.materials, null, 2));

            console.log("\nCONTENU DU CHAMP 'materialReservations' :");
            console.log(JSON.stringify(data.materialReservations, null, 2));

            if (data.journal) {
                console.log("\nHISTORIQUE DE MODIFICATION (journal) :");
                console.log(JSON.stringify(data.journal.slice(-3), null, 2)); // 3 dernières entrées
            }
        }
    });
}

getDetailedActivity().catch(err => {
    console.error(err);
    process.exit(1);
});
