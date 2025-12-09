"use client"

import { useEffect, useState } from "react"
import { messaging } from "@/lib/firebaseClient"
import { getToken, onMessage } from "firebase/messaging"
import { useToast } from "@/components/toast/ToastProvider"

const isBrowser = typeof window !== "undefined"

export function useFcmToken() {
  const [fcmToken, setFcmToken] = useState(null)
  const toast = useToast()

  useEffect(() => {
    if (!isBrowser || !messaging) {
      return
    }

    let unsubscribe = () => { }

    const requestToken = async () => {
      try {
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        })
        if (currentToken) {
          setFcmToken(currentToken)
        }
      } catch (error) {
        console.error("토큰 가져오기 중 오류 발생:", error)
      }
    }

    const ensurePermissionAndToken = async () => {
      const { Notification } = window
      if (!Notification) return

      if (Notification.permission === "granted") {
        await requestToken()
      } else if (Notification.permission !== "denied") {
        try {
          const permission = await Notification.requestPermission()
          if (permission === "granted") {
            await requestToken()
          }
        } catch (error) {
          console.error("알림 권한 요청 오류:", error)
        }
      }
    }

    ensurePermissionAndToken()

    unsubscribe = onMessage(messaging, (payload) => {
      if (payload?.notification) {
        const { title, body } = payload.notification
        toast.info(`${title ?? ""}: ${body ?? ""}`, { duration: 5000 })
      }
    })

    return () => {
      unsubscribe?.()
    }
  }, [toast.info])

  return fcmToken
}
