import { NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/server/firebaseAdmin"
import { sendApprovalNotification } from "@/lib/server/userNotifications"

// Firebase Admin 초기화 (빌드 시에는 null일 수 있음)
const firebaseAdmin = getFirebaseAdmin()

export async function POST(req) {
  try {
    const { id, isApproved } = await req.json()
    console.log("notify-approval 요청 id:", id)
    console.log("isApproved:", isApproved)

    // isApproved가 boolean이 아닐 경우 false로 설정
    const approvedStatus = typeof isApproved === "boolean" ? isApproved : false

    if (!id) {
      return NextResponse.json({ error: "필수 데이터가 누락되었습니다." }, { status: 400 })
    }

    const notification = await sendApprovalNotification(id, approvedStatus)
    if (!notification.success && notification.error === "record-not-found") {
      return NextResponse.json({ error: "레코드를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("알림 전송 오류:", error)
    return NextResponse.json({ error: "알림 전송 실패", detail: error.message }, { status: 500 })
  }
}
