importScripts("https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyBBBhq8LIUHlb_0xN7ZnKxafc02jsI6EKE",
    authDomain: "sunj-36e35.firebaseapp.com",
    projectId: "sunj-36e35",
    storageBucket: "sunj-36e35.firebasestorage.app",
    messagingSenderId: "281864483954",
    appId: "1:281864483954:web:29f2c8e492d9bb55febeeb",
    measurementId: "G-NQGR2K5CK6"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 백그라운드 푸시 알림 수신
messaging.onBackgroundMessage((payload) => {
    console.log("백그라운드 푸시 메시지 수신:", payload);

    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/logo.png",
    });
});
