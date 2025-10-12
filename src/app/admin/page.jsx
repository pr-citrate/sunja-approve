"use client"

import { useState } from "react"
import Link from "next/link"
import { getToken } from "firebase/messaging"

import { messaging } from "@/lib/firebaseClient"

const QUICK_ACTIONS = [
  {
    href: "/admin/approve",
    label: "승인 페이지로 이동",
    description: "당일 들어온 신청을 확인하고 승인 또는 거절할 수 있습니다.",
    variant: "btn btn-primary",
  },
  {
    href: "/morepeople",
    label: "1~20인 신청 열기",
    description: "추가 인원 수요가 있을 때 바로 사용하세요.",
    variant: "btn btn-outline",
  },
]

export default function HomePage() {
  const [fcmToken, setFcmToken] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const requestPermissionIfNeeded = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      throw new Error("브라우저에서 알림을 지원하지 않습니다.")
    }

    if (Notification.permission === "granted") {
      return true
    }

    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      throw new Error("알림 권한이 거부되었습니다.")
    }
    return true
  }

  const handleGetToken = async () => {
    try {
      await requestPermissionIfNeeded()
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      })

      if (!currentToken) {
        console.log("토큰을 가져올 수 없습니다.")
        return
      }

      console.log("FCM 토큰:", currentToken)
      setFcmToken(currentToken)
      await saveAdminToken(currentToken)
    } catch (error) {
      console.error("토큰 등록 중 오류 발생:", error)
    }
  }

  const saveAdminToken = async (token) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error("요청 저장 실패")
      }

      console.log("관리자 토큰이 성공적으로 저장되었습니다.")
    } catch (error) {
      console.error("토큰 저장 중 오류 발생:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-base-200 py-12">
      <div className="hero">
        <div className="hero-content w-full max-w-3xl flex-col gap-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-base-content">관리자 도구</h1>
            <p className="text-base-content/70">
              오늘 접수된 신청을 확인하고 승인하거나, 알림을 받아 즉시 대응하세요.
            </p>
          </div>

          <div className="grid w-full gap-6 lg:grid-cols-2">
            {QUICK_ACTIONS.map((action) => (
              <div key={action.href} className="card bg-base-100 shadow-lg">
                <div className="card-body space-y-4">
                  <h2 className="text-lg font-semibold text-base-content">{action.label}</h2>
                  <p className="text-sm text-base-content/70">{action.description}</p>
                  <Link href={action.href} className={`${action.variant} w-full`}>
                    이동하기
                  </Link>
                </div>
              </div>
            ))}

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body space-y-4">
                <h2 className="text-lg font-semibold text-base-content">알림 설정</h2>
                <p className="text-sm text-base-content/70">
                  관리자 기기에서 알림을 구독하면 새 신청이 접수될 때 바로 안내해 드립니다.
                </p>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleGetToken}
                  disabled={isSaving}
                >
                  {isSaving ? "토큰 저장 중..." : "알림 받기"}
                </button>
                {fcmToken && (
                  <div className="space-y-2 rounded-xl bg-base-200 p-3 text-left text-xs text-base-content/70">
                    <p className="font-semibold text-base-content">FCM 토큰</p>
                    <code className="block max-h-24 overflow-y-auto break-words">{fcmToken}</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
