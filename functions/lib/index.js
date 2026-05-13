"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessageCreated = exports.onPurchaseRequestUpdated = exports.onActivityUpdated = exports.syncToWebsite = exports.getSyncPreview = exports.onReservationWrite = exports.sendTransferNotification = exports.checkMissingActivities = exports.triggerManualBackup = exports.backupToSharePoint = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const logger = require("firebase-functions/logger");
var backupCron_1 = require("./backupCron");
Object.defineProperty(exports, "backupToSharePoint", { enumerable: true, get: function () { return backupCron_1.backupToSharePoint; } });
Object.defineProperty(exports, "triggerManualBackup", { enumerable: true, get: function () { return backupCron_1.triggerManualBackup; } });
admin.initializeApp();
const db = admin.firestore();
// SMTP Configuration from Environment Variables
const mailTransport = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const EMPLOYEE_MAILS = {
    "charles frenette": "charles.frenette@mdjescalejeunesse.ca",
    "mikael delage": "mikael.delage@mdjescalejeunesse.ca",
    "laurie bray": "laurie.bray.pratte@mdjescalejeunesse.ca",
    "laurie pratte": "laurie.bray.pratte@mdjescalejeunesse.ca",
    "sebastien johnson": "sbastien.johnson@mdjescalejeunesse.ca",
    "sébastien johnson": "sbastien.johnson@mdjescalejeunesse.ca",
    "patrice ducharme": "patrice.ducharme@mdjescalejeunesse.ca",
    pat: "patrice.ducharme@mdjescalejeunesse.ca",
    gabriel: "gabriel.pomerleau@mdjescalejeunesse.ca",
    gab: "gabriel.pomerleau@mdjescalejeunesse.ca",
    justine: "justine.roy@mdjescalejeunesse.ca",
    sarah: "sarah.beaudoin@mdjescalejeunesse.ca"
};
const getEmailFromName = (name) => {
    if (!name)
        return null;
    const lowerName = name.toLowerCase().trim();
    for (const [key, email] of Object.entries(EMPLOYEE_MAILS)) {
        if (lowerName.includes(key))
            return email;
    }
    return null;
};
const isAbsence = (title) => {
    if (!title)
        return false;
    const t = title.toUpperCase();
    return t.startsWith('ABSENCE') || t.startsWith('VACANCE') || t.startsWith('CONGÉ') || t.startsWith('CONGE');
};
exports.checkMissingActivities = (0, scheduler_1.onSchedule)({
    schedule: "every monday 08:00",
    timeZone: "America/Toronto",
}, async (event) => {
    logger.info("Starting Monday morning activity check...");
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.error("Missing SMTP credentials (SMTP_USER or SMTP_PASS). Cannot send emails.");
        return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);
    const snapshot = await db.collection("activities").get();
    const incompleteActivities = [];
    // Filter incomplete activities within 30 days
    snapshot.forEach((doc) => {
        const act = doc.data();
        if (isAbsence(act.title))
            return;
        if (act.isPostponed === true)
            return;
        const actDate = new Date(act.date + "T00:00:00");
        if (actDate >= today && actDate <= thirtyDaysLater) {
            if (act.preparationScore !== undefined && act.preparationScore < 100) {
                incompleteActivities.push(Object.assign(Object.assign({}, act), { id: doc.id }));
            }
        }
    });
    if (incompleteActivities.length === 0) {
        logger.info("No incomplete activities found for the next 30 days. No emails to send.");
        return;
    }
    // Group by Lead Staff
    const groupedByStaff = {};
    const unassignedAlerts = [];
    incompleteActivities.forEach(act => {
        var _a;
        const lead = (_a = act.staffing) === null || _a === void 0 ? void 0 : _a.leadStaff;
        if (lead && lead !== "À combler" && lead.trim() !== "") {
            if (!groupedByStaff[lead])
                groupedByStaff[lead] = [];
            groupedByStaff[lead].push(act);
        }
        else {
            if (act.createdByEmail) {
                if (!groupedByStaff[act.createdByEmail])
                    groupedByStaff[act.createdByEmail] = [];
                groupedByStaff[act.createdByEmail].push(act);
            }
            else {
                unassignedAlerts.push(act);
            }
        }
    });
    // Add missing days (Open days with NO activities)
    for (let i = 0; i <= 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dayOfWeek = checkDate.getDay();
        if (dayOfWeek >= 2 && dayOfWeek <= 5) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const hasActivity = snapshot.docs.some(d => {
                const a = d.data();
                return a.date === dateStr && !isAbsence(a.title);
            });
            if (!hasActivity) {
                unassignedAlerts.push({
                    id: `missing_${dateStr}`,
                    title: "⚠️ AUCUNE ACTIVITÉ PRÉVUE (Ouverture du centre)",
                    date: dateStr,
                    preparationScore: 0
                });
            }
        }
    }
    // Send personalized emails
    for (const [staffIdentifier, activities] of Object.entries(groupedByStaff)) {
        const emailAddress = staffIdentifier.includes("@") ? staffIdentifier : getEmailFromName(staffIdentifier);
        const displayName = staffIdentifier.includes("@") ? staffIdentifier.split("@")[0] : staffIdentifier;
        if (!emailAddress) {
            logger.warn(`Could not resolve email for staff: ${staffIdentifier}`);
            continue;
        }
        await sendEmailToStaff(displayName, emailAddress, activities);
        logger.info(`Email sent to ${emailAddress} with ${activities.length} alerts.`);
    }
    // Send unassigned and open days alerts to coordination (info@)
    if (unassignedAlerts.length > 0) {
        await sendEmailToStaff("Équipe de Coordination", process.env.SMTP_USER, unassignedAlerts, true);
        logger.info(`Coordination email sent for ${unassignedAlerts.length} unassigned/missing days.`);
    }
    logger.info("Monday morning check completed successfully.");
});
async function sendEmailToStaff(name, toEmail, activities, isCoordination = false) {
    // Sort activities by date
    activities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const activitiesHtml = activities.map(act => `
    <li style="margin-bottom: 10px; padding: 10px; background-color: #f8fafc; border-left: 4px solid #ef4444; border-radius: 4px;">
      <strong>${act.date}</strong> : ${act.title} 
      <br/><span style="color: #64748b; font-size: 12px;">Score de préparation : ${act.preparationScore}%</span>
    </li>
  `).join("");
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h2 style="color: #38bdf8; margin: 0;">MDJ Planner - Alertes Hebdomadaires</h2>
      </div>
      <div style="padding: 20px;">
        <p>Bonjour <strong>${name}</strong>,</p>
        <p>Voici un récapitulatif des planifications nécessitant votre attention pour les 30 prochains jours :</p>
        <ul style="list-style-type: none; padding: 0;">
          ${activitiesHtml}
        </ul>
        <p style="margin-top: 20px;">
          ${isCoordination ? "<em>Note : Ces activités n'ont pas de responsable assigné, ou il manque des activités pour les jours d'ouverture.</em>" : "Veuillez vous connecter au MDJ Planner pour compléter les informations manquantes (Objectifs, Besoins, RMJQ, etc.)."}
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://mdj-planner-prod.web.app" style="background-color: #38bdf8; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ouvrir le Planificateur</a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;">
        Ce courriel est généré automatiquement. Merci de ne pas y répondre.
      </div>
    </div>
  `;
    const mailOptions = {
        from: '"MDJ Planner" <' + process.env.SMTP_USER + '>',
        to: toEmail,
        subject: "Action Requise : Planifications incomplètes (30 prochains jours)",
        html: emailHtml,
    };
    await mailTransport.sendMail(mailOptions);
}
exports.sendTransferNotification = (0, https_1.onCall)(async (request) => {
    const { activity, previousLead, newLead, newLeadEmail, senderName } = request.data;
    if (!newLeadEmail) {
        throw new https_1.HttpsError('invalid-argument', 'Missing recipient email.');
    }
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h2 style="color: #f472b6; margin: 0;">MDJ Planner - Transfert de Responsabilité</h2>
      </div>
      <div style="padding: 20px;">
        <p>Bonjour <strong>${newLead}</strong>,</p>
        <p><strong>${senderName}</strong> t'a transféré la responsabilité de l'activité suivante :</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #f472b6; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #0f172a;">${activity.title}</h3>
          <p style="margin: 5px 0;">📅 <strong>Date :</strong> ${activity.date}</p>
          <p style="margin: 5px 0;">🕐 <strong>Horaire :</strong> ${activity.startTime || "N/A"} - ${activity.endTime || "N/A"}</p>
          <p style="margin: 5px 0;">👤 <strong>Ancien responsable :</strong> ${previousLead}</p>
        </div>

        <p>Merci de consulter le planificateur pour voir les détails de l'activité et valider les besoins (matériel, budget, etc.).</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://mdj-planner-prod.web.app" style="background-color: #f472b6; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accéder à l'activité</a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;">
        Ce courriel est généré automatiquement par le MDJ Planner.
      </div>
    </div>
  `;
    const mailOptions = {
        from: '"MDJ Planner" <' + process.env.SMTP_USER + '>',
        to: newLeadEmail,
        subject: `[Transfert] ${activity.title} — ${activity.date}`,
        html: emailHtml,
    };
    try {
        await mailTransport.sendMail(mailOptions);
        return { success: true };
    }
    catch (error) {
        logger.error("Error sending transfer email:", error);
        throw new Error('Failed to send email.');
    }
});
exports.onReservationWrite = (0, https_1.onCall)(async (request) => {
    // Logic for automated inventory conflict detection and purchase request generation
    const { reservationId, itemId, quantityRequired, date, activityId, requesterEmail } = request.data;
    const itemDoc = await db.collection("inventory_items").doc(itemId).get();
    if (!itemDoc.exists)
        return { success: false, error: "Item not found" };
    const item = itemDoc.data();
    const totalStock = item.totalQuantity || 0;
    // Check other reservations on the same date
    const resSnapshot = await db.collection("material_reservations")
        .where("itemId", "==", itemId)
        .where("date", "==", date)
        .where("status", "==", "Réservé")
        .get();
    let reservedQuantity = 0;
    resSnapshot.forEach(doc => {
        if (doc.id !== reservationId) {
            reservedQuantity += doc.data().quantityRequired || 0;
        }
    });
    const available = Math.max(0, totalStock - reservedQuantity);
    const missing = Math.max(0, quantityRequired - available);
    if (missing > 0) {
        // Create purchase request
        const prId = `pr-${Date.now()}`;
        await db.collection("purchase_requests").doc(prId).set({
            id: prId,
            itemId,
            customName: item.name,
            quantityNeeded: missing,
            reason: `Manque automatique détecté par le système pour l'activité ${activityId}`,
            linkedActivityId: activityId,
            status: "En attente d'approbation",
            estimatedCost: (item.unitCost || 0) * missing,
            requestedBy: requesterEmail || "Système",
            timestamp: Date.now()
        });
        // Update reservation status to Conflict
        await db.collection("material_reservations").doc(reservationId).update({
            status: "Conflit (Manque)"
        });
        return { success: true, conflict: true, missing };
    }
    return { success: true, conflict: false };
});
exports.getSyncPreview = (0, https_1.onCall)(async (request) => {
    const { year, month } = request.data;
    if (!year || !month) {
        throw new https_1.HttpsError('invalid-argument', 'Year and Month are required.');
    }
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = `${year}-${String(month).padStart(2, '0')}-31`;
    const snapshot = await db.collection("activities")
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();
    const activities = [];
    snapshot.forEach(doc => {
        var _a;
        const data = doc.data();
        if (data.isPostponed)
            return;
        // Generate a stable seed for the image based on activity ID
        const seed = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const prompt = `cyberpunk style, futuristic, ${data.title}, ${data.description || ''}, neon lights, high detail`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=450&nologo=true&seed=${seed}`;
        activities.push({
            id: doc.id,
            title: data.title,
            date: data.date,
            time: `${data.startTime || '15:00'} - ${data.endTime || '21:00'}`,
            description: data.description || "Aucune description fournie.",
            type: (((_a = data.logistics) === null || _a === void 0 ? void 0 : _a.costPerPerson) || 0) > 0 ? "Payant" : "Gratuit",
            image: imageUrl
        });
    });
    // Sort by date
    activities.sort((a, b) => a.date.localeCompare(b.date));
    return activities;
});
exports.syncToWebsite = (0, https_1.onCall)(async (request) => {
    const { year, month } = request.data;
    if (!year || !month) {
        throw new https_1.HttpsError('invalid-argument', 'Year and Month are required.');
    }
    // 1. Logic for activities (similar to preview but for sync)
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = `${year}-${String(month).padStart(2, '0')}-31`;
    const snapshot = await db.collection("activities")
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();
    const activities = [];
    snapshot.forEach(doc => {
        var _a;
        const data = doc.data();
        if (data.isPostponed)
            return;
        const seed = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const prompt = `cyberpunk style, futuristic, ${data.title}, ${data.description || ''}, neon lights, high detail`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=450&nologo=true&seed=${seed}`;
        activities.push({
            id: doc.id,
            title: data.title,
            date: data.date,
            time: `${data.startTime || '15:00'} - ${data.endTime || '21:00'}`,
            description: data.description || "Aucune description fournie.",
            type: (((_a = data.logistics) === null || _a === void 0 ? void 0 : _a.costPerPerson) || 0) > 0 ? "Payant" : "Gratuit",
            image: imageUrl
        });
    });
    // 2. Batch write to 'web_activities' collection
    const batch = db.batch();
    // Clear existing web_activities for that month range
    const existingSnapshot = await db.collection("web_activities")
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();
    existingSnapshot.forEach(doc => batch.delete(doc.ref));
    // Then add the new ones
    activities.forEach((act) => {
        const docRef = db.collection("web_activities").doc(act.id);
        batch.set(docRef, Object.assign(Object.assign({}, act), { syncedAt: admin.firestore.FieldValue.serverTimestamp() }));
    });
    await batch.commit();
    return { success: true, count: activities.length };
});
/**
 * PUSH NOTIFICATIONS HELPERS & TRIGGERS
 */
async function sendPushNotification(email, title, body, data) {
    var _a;
    if (!email)
        return;
    try {
        const tokenDoc = await db.collection("user_tokens").doc(email).get();
        const fcmToken = (_a = tokenDoc.data()) === null || _a === void 0 ? void 0 : _a.token;
        if (fcmToken) {
            const message = {
                notification: { title, body },
                token: fcmToken,
                data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined,
                android: { priority: "high" },
                apns: { payload: { aps: { contentAvailable: true } } }
            };
            await admin.messaging().send(message);
            logger.info(`Notification sent to ${email}: ${title}`);
        }
    }
    catch (error) {
        logger.error(`Error sending notification to ${email}:`, error);
    }
}
exports.onActivityUpdated = (0, firestore_1.onDocumentUpdated)("activities/{activityId}", async (event) => {
    var _a, _b, _c, _d;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!before || !after)
        return;
    // Notify if Lead Staff changed
    if (((_c = after.staffing) === null || _c === void 0 ? void 0 : _c.leadStaff) && after.staffing.leadStaff !== ((_d = before.staffing) === null || _d === void 0 ? void 0 : _d.leadStaff)) {
        const email = getEmailFromName(after.staffing.leadStaff);
        if (email) {
            await sendPushNotification(email, "Nouvelle responsabilité !", `Tu as été assigné comme responsable de l'activité: ${after.title} (${after.date})`, { activityId: event.params.activityId });
        }
    }
});
exports.onPurchaseRequestUpdated = (0, firestore_1.onDocumentUpdated)("purchase_requests/{prId}", async (event) => {
    var _a, _b;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!before || !after)
        return;
    // Notify if status changed
    if (after.status !== before.status && after.requestedBy) {
        await sendPushNotification(after.requestedBy, "Mise à jour d'achat", `Ta demande pour "${after.customName}" est passée à: ${after.status}`, { prId: event.params.prId });
    }
});
exports.onMessageCreated = (0, firestore_1.onDocumentCreated)("messages/{messageId}", async (event) => {
    var _a;
    const msg = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!msg || !msg.recipientId || msg.senderId === msg.recipientId)
        return;
    await sendPushNotification(msg.recipientId, `Nouveau message de ${msg.senderName || 'Collègue'}`, msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''), { messageId: event.params.messageId });
});
//# sourceMappingURL=index.js.map