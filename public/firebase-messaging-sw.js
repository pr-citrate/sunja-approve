// public/firebase-messaging-sw.js

// Firebase SDK의 compat 버전을 import합니다.
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// Firebase 초기화 – firebaseClient.js와 동일한 설정 사용
const firebaseConfig = {
    apiKey: "AIzaSyC247JpsaLZNtSIAHS8zrpKqVVs4pi-ExE",
    authDomain: "sunja-d2423.firebaseapp.com",
    projectId: "sunja-d2423",
    storageBucket: "sunja-d2423.firebasestorage.app",
    messagingSenderId: "401866580480",
    appId: "1:401866580480:web:3bc7935a160d5780aaaee5",
    measurementId: "G-3YJ3BXSTXD"
};

const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] 백그라운드 메시지 수신:", payload);
    const notificationTitle = payload.notification?.title || "백그라운드 알림";
    const notificationOptions = {
        body: payload.notification?.body || "알림 내용이 없습니다.",
        icon: "/icons/icon-192x192.png", // 아이콘 파일은 프로젝트 내에 준비해 주세요.
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
