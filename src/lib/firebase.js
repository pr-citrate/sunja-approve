"use client";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBBBhq8LIUHlb_0xN7ZnKxafc02jsI6EKE",
  authDomain: "sunj-36e35.firebaseapp.com",
  projectId: "sunj-36e35",
  storageBucket: "sunj-36e35.firebasestorage.app",
  messagingSenderId: "281864483954",
  appId: "1:281864483954:web:29f2c8e492d9bb55febeeb",
  measurementId: "G-NQGR2K5CK6",
};

// Firebase 앱 초기화
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// 브라우저에서 푸시 알림을 받을 권한 요청
export const requestNotificationPermission = async () => {
  try {
    // eslint-disable-next-line no-undef
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("알림 권한이 허용되었습니다.");
      return getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY",
      });
    } else {
      console.log("알림 권한이 거부되었습니다.");
    }
  } catch (error) {
    console.error("알림 권한 요청 중 오류 발생:", error);
  }
};

// 포그라운드 메시지 수신 처리
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("포그라운드 알림 수신:", payload);
      resolve(payload);
    });
  });

export { messaging };
