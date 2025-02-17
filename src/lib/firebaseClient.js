// src/lib/firebaseClient.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage as firebaseOnMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

// Firebase 콘솔에서 제공하는 설정값으로 변경하세요.
const firebaseConfig = {
  apiKey: "AIzaSyC247JpsaLZNtSIAHS8zrpKqVVs4pi-ExE",
  authDomain: "sunja-d2423.firebaseapp.com",
  projectId: "sunja-d2423",
  storageBucket: "sunja-d2423.firebasestorage.app",
  messagingSenderId: "401866580480",
  appId: "1:401866580480:web:3bc7935a160d5780aaaee5",
  measurementId: "G-3YJ3BXSTXD"
};

const app = initializeApp(firebaseConfig);
let analytics;
// 클라이언트에서만 Analytics를 초기화합니다.
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// 클라이언트에서만 Messaging 초기화를 진행합니다.
let messaging = null;
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

export { messaging, getToken, firebaseOnMessage as onMessage };
