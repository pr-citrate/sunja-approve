import { NextResponse } from "next/server"
import { parse } from "qs"
import { REQUEST_STATUS } from "@/lib/constants"
import { getFirebaseAdmin } from "@/lib/server/firebaseAdmin"
import { broadcastAdminRequestNotification } from "@/lib/server/adminNotifications"
import { runXataOperation } from "@/lib/server/xataClient"
getFirebaseAdmin()

export async function GET(req) {
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true })
  const data = await runXataOperation((client) => client.db.requests.filter(params).getAll(), {
    retries: 2,
  })

  return NextResponse.json({ requests: data })
}

export async function POST(req) {
  // IP 주소 가져오기 (프록시 환경일 경우 X-Forwarded-For 사용)
  const ipHeader = req.headers.get("X-Forwarded-For") || ""
  const ip = ipHeader.split(",")[0].trim()

  try {
    const body = await req.json()
    console.log("POST /api/requests body:", body)

    // requests 테이블에 새 레코드 생성
    const record = await runXataOperation(
      (client) =>
        client.db.requests.create({
          applicant: body.applicant, // 신청자 정보 (JSONB)
          contact: body.contact, // 전화번호
          reason: body.reason, // 사유
          time: body.time, // 사용 시간
          ip, // IP 주소
          fcm: body.fcm, // 클라이언트에서 전달된 FCM 토큰 (원래 fcm 필드)
          isApproved: body.isApproved !== undefined ? body.isApproved : false,
          status: REQUEST_STATUS.PENDING,
        }),
      { retries: 2 },
    )

    // 알림 전송은 비동기로 처리하여 응답 속도를 높인다.
    void broadcastAdminRequestNotification(record)
      .then((result) => {
        if (result?.skipped) {
          console.info("관리자 알림 건너뜀", result)
        }
      })
      .catch((notificationError) => {
        console.error("알림 처리 중 오류 발생:", notificationError)
      })

    return NextResponse.json({ success: true, record, notificationsQueued: true })
  } catch (error) {
    console.error("신청 저장 및 알림 전송 오류:", error)
    const isAuthError = error?.status === 401
    return NextResponse.json(
      {
        error: isAuthError
          ? "데이터베이스 인증에 실패했습니다. XATA_API_KEY를 갱신한 뒤 다시 시도하세요."
          : error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(req) {
  const body = await req.json()
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true })
  const data = await runXataOperation(
    (client) => client.db.requests.createOrReplace(params.id, body),
    { retries: 2 },
  )

  return NextResponse.json(data)
}

export async function PATCH(req) {
  const body = await req.json()
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true })
  const data = await runXataOperation((client) => client.db.requests.update(params.id, body), {
    retries: 2,
  })

  return NextResponse.json(data)
}

export async function DELETE(req) {
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true })
  const data = await runXataOperation((client) => client.db.requests.delete(params.id), {
    retries: 2,
  })
  return NextResponse.json(data)
}
