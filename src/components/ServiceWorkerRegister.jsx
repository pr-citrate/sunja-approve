// components/ServiceWorkerRegister.jsx
"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Firebase 메시징용 서비스 워커를 등록합니다.
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Firebase Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Firebase Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
