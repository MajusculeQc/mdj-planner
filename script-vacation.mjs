import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDDiWf0Vt5k3eVfKXw7VEY9I2AyCSfrxVQ",
    projectId: "mdj-planner-prod"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dates = ['2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08'];

async function run() {
    for (const date of dates) {
        const id = 'act-vac-pat-' + date;
        const act = {
            id,
            title: 'ABSENCE - PAT',
            date,
            startTime: '00:00',
            endTime: '23:59',
            type: 'Vie associative',
            description: "En vacances jusqu'à lundi prochain",
            status: 'draft',
            budget: { estimatedCost: 0, actualCost: 0, items: [] },
            materials: [],
            staffing: { leadStaff: '', supportStaff: [], requiredRatio: '' },
            evaluationCriteria: [],
            rmjqDimensions: [],
            logistics: { location: '', transportRequired: false },
            riskManagement: { hazards: [], safetyProtocols: [] },
            comments: []
        };
        try {
            await setDoc(doc(db, "activities", id), act);
            console.log("Added", date);
        } catch (e) { console.error(e); }
    }
    process.exit(0);
}
run();
