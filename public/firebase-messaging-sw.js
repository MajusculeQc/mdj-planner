importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDDiWf0Vt5k3eVfKXw7VEY9I2AyCSfrxVQ",
    authDomain: "mdj-planner-prod.firebaseapp.com",
    projectId: "mdj-planner-prod",
    storageBucket: "mdj-planner-prod.firebasestorage.app",
    messagingSenderId: "982719306470",
    appId: "1:982719306470:web:abc541e68cda448bfdb927"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
