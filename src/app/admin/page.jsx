"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { messaging } from "@/lib/firebaseClient";
import { getToken } from "firebase/messaging";

export default function HomePage() {
  const router = useRouter();
  const [fcmToken, setFcmToken] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGetToken = () => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-undef
      const globalWindow = window;
      if ("Notification" in globalWindow) {
        const notification = globalWindow.Notification;
        if (notification.permission === "granted") {
          getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY })
            .then((currentToken) => {
              if (currentToken) {
                console.log("FCM 토큰:", currentToken);
                setFcmToken(currentToken);
                saveTokenToPassword(currentToken);
              } else {
                console.log("토큰을 가져올 수 없습니다.");
              }
            })
            .catch((err) => {
              console.error("토큰 가져오기 중 오류 발생:", err);
            });
        } else {
          notification.requestPermission().then((permission) => {
            console.log("알림 권한 요청 결과:", permission);
            if (permission === "granted") {
              getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY })
                .then((currentToken) => {
                  if (currentToken) {
                    console.log("FCM 토큰:", currentToken);
                    setFcmToken(currentToken);
                    saveTokenToPassword(currentToken);
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
    }
  };

  const saveTokenToPassword = async (token) => {
    setIsSaving(true);
    try {
      // password 테이블의 name 필드에 토큰을 저장하는 API 호출
      const response = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: token }),
      });
      if (!response.ok) {
        throw new Error("요청 저장 실패");
      }
      console.log("password 테이블에 토큰이 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("토큰 저장 중 오류 발생:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex justify-center items-center w-full h-screen">
      <Card className="w-96 grid justify-items-center items-center p-8">
        <Label className="text-xl mb-4">선택하세요</Label>
        <Button
          className="text-lg mb-4 w-full"
          onClick={() => router.push("/admin/approve")}
        >
          신청 승인
        </Button>
        <Button
          className="text-lg mb-4 w-full"
          onClick={handleGetToken}
          disabled={isSaving}
        >
          {isSaving ? "저장 중..." : "알림 받기"}
        </Button>
        <Button
          className="text-lg mb-4 w-full"
          onClick={() => router.push("/morepeople")}
        >
          1~20인 신청
        </Button>
        {fcmToken && (
          <p className="mt-4 break-all">토큰: {fcmToken}</p>
        )}
      </Card>
    </main>
  );
}

