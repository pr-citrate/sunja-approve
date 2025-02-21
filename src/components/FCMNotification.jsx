"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebaseClient";

export default function FCMNotification() {
    const [fcmToken, setFcmToken] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
                getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY })
                    .then((currentToken) => {
                        if (currentToken) {
                            console.log("FCM 토큰:", currentToken);
                            setFcmToken(currentToken);
                            // 필요 시 서버에 토큰 전송
                        } else {
                            console.log("토큰을 가져올 수 없습니다.");
                        }
                    })
                    .catch((err) => {
                        console.error("토큰 가져오기 중 오류 발생:", err);
                    });
            } else {
                Notification.requestPermission().then((permission) => {
                    console.log("알림 권한 요청 결과:", permission);
                    if (permission === "granted") {
                        getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY })
                            .then((currentToken) => {
                                if (currentToken) {
                                    console.log("FCM 토큰:", currentToken);
                                    setFcmToken(currentToken);
                                    // 필요 시 서버에 토큰 전송
                                } else {
                                    console.log("토큰을 가져올 수 없습니다.");
                                }
                            })
                            .catch((err) => {
                                console.error("토큰 가져오기 중 오류 발생:", err);
                            });
                    } else {
                        console.log("알림 권한이 거부되었습니다.");
                    }
                });
            }
        }
    }, []);

    return null; // UI를 렌더링하지 않습니다.
}
