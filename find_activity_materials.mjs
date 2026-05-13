
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { readFileSync } from "fs";

// Load .env.local manually because it's not .env
const envContent = readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) env[key.trim()] = value.trim();
});

const firebaseConfig = {
    apiKey: env["VITE_FIREBASE_API_KEY"],
    authDomain: "mdj-planner-prod.firebaseapp.com",
    projectId: "mdj-planner-prod",
    storageBucket: "mdj-planner-prod.firebasestorage.app",
    messagingSenderId: "982719306470",
    appId: "1:982719306470:web:abc541e68cda448bfdb927"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findActivity() {
    console.log("Recherche de l'activité du 16 avril 2026...");
    const q = query(collection(db, "activities"), where("date", "==", "2026-04-16"));
    const querySnapshot = await getDocs(q);

    let found = false;
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.title.toLowerCase().includes("fondue")) {
            found = true;
            console.log("\n--- Activité trouvée ---");
            console.log("Titre:", data.title);
            console.log("Date:", data.date);

            console.log("\n--- Liste de matériel (Champ materials) ---");
            if (data.materials && data.materials.length > 0) {
                data.materials.forEach((m, i) => {
                    const name = typeof m === 'string' ? m : (m.item || m.name);
                    console.log(`${i + 1}. ${name}`);
                });
            } else {
                console.log("(Aucun matériel dans le champ standard)");
            }

            console.log("\n--- Réservations d'inventaire (Champ materialReservations) ---");
            if (data.materialReservations && data.materialReservations.length > 0) {
                data.materialReservations.forEach((r, i) => {
                    console.log(`${i + 1}. ${r.itemName} (Qté: ${r.quantityRequired})`);
                });
            } else {
                console.log("(Aucune réservation d'inventaire)");
            }
        }
    });

    if (!found) {
        console.log("Aucune activité 'fondue' trouvée pour le 16 avril 2026.");
    }
    process.exit(0);
}

findActivity().catch(console.error);
