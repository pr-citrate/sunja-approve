"use client"
/* eslint-env browser */

import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage as firebaseOnMessage } from "firebase/messaging"

// Firebase 콘솔에서 제공하는 설정값으로 변경하세요.
const firebaseConfig = {
  apiKey: "AIzaSyC247JpsaLZNtSIAHS8zrpKqVVs4pi-ExE",
  authDomain: "sunja-d2423.firebaseapp.com",
  projectId: "sunja-d2423",
  storageBucket: "sunja-d2423.firebasestorage.app",
  messagingSenderId: "401866580480",
  appId: "1:401866580480:web:3bc7935a160d5780aaaee5",
  measurementId: "G-3YJ3BXSTXD",
}

const app = initializeApp(firebaseConfig)

// 클라이언트 환경에서만 Messaging 초기화 진행
let messaging = null
if (typeof window !== "undefined") {
  messaging = getMessaging(app)
}

export { messaging, getToken, firebaseOnMessage as onMessage }
