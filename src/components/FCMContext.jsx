"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { messaging } from "@/lib/firebaseClient";
import { getToken, onMessage } from "firebase/messaging";
import { toast } from "react-toastify";

const FCMContext = createContext();

export const FCMProvider = ({ children }) => {
    const [fcmToken, setFcmToken] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            const requestAndSetToken = () => {
                getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY })
                    .then((currentToken) => {
                        if (currentToken) {
                            console.log("FCM 토큰:", currentToken);
                            setFcmToken(currentToken);
                        } else {
                            console.log("토큰을 가져올 수 없습니다.");
                        }
                    })
                    .catch((err) => {
                        console.error("토큰 가져오기 중 오류 발생:", err);
                    });
            };

            if (Notification.permission === "granted") {
                requestAndSetToken();
            } else {
                Notification.requestPermission().then((permission) => {
                    console.log("알림 권한 요청 결과:", permission);
                    if (permission === "granted") {
                        requestAndSetToken();
                    } else {
                        console.log("알림 권한이 거부되었습니다.");
                    }
                });
            }

            // 포그라운드 메시지 수신 처리
            onMessage(messaging, (payload) => {
                console.log("포그라운드 메시지 수신:", payload);
                if (payload.notification) {
                    const { title, body } = payload.notification;
                    toast.info(`${title}: ${body}`);
                }
            });
        }
    }, []);

    return (
        <FCMContext.Provider value={{ fcmToken }}>
            {children}
        </FCMContext.Provider>
    );
};

export const useFCM = () => useContext(FCMContext);
