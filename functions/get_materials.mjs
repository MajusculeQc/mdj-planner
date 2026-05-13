
import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("../cle-export.json", "utf8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getMaterials() {
    console.log("Recherche de l'activité 'Fondue au chocolat' du 16 avril 2026...");
    const snapshot = await db.collection("activities")
        .where("date", "==", "2026-04-16")
        .get();

    if (snapshot.empty) {
        console.log("Aucune activité trouvée pour cette date.");
        process.exit(0);
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.title.toLowerCase().includes("fondue")) {
            console.log("\n--- " + data.title + " ---");

            console.log("\nMATÉRIEL (Champ standard) :");
            if (data.materials && data.materials.length > 0) {
                data.materials.forEach((m, i) => {
                    const name = typeof m === 'string' ? m : (m.item || m.name);
                    if (name) console.log(`- ${name}`);
                });
            } else {
                console.log("(Vide)");
            }

            console.log("\nRÉSERVATIONS D'INVENTAIRE :");
            if (data.materialReservations && data.materialReservations.length > 0) {
                data.materialReservations.forEach((r, i) => {
                    console.log(`- ${r.itemName} (Qté: ${r.quantityRequired})`);
                });
            } else {
                console.log("(Vide)");
            }
        }
    });
    process.exit(0);
}

getMaterials().catch(err => {
    console.error(err);
    process.exit(1);
});
