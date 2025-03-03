import { NextResponse } from "next/server";
import { getXataClient } from "@/xata";
import { parse } from "qs";
import admin from "firebase-admin";

const xata = getXataClient();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export async function GET(req) {
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true });
  const data = await xata.db.requests.filter(params).getAll();

  return NextResponse.json({ requests: data });
}

export async function POST(req) {
  // IP 주소 가져오기 (프록시 환경일 경우 X-Forwarded-For 사용)
  const ipHeader = req.headers.get("X-Forwarded-For") || "";
  const ip = ipHeader.split(",")[0].trim();

  try {
    const body = await req.json();
    console.log("POST /api/requests body:", body);

    // requests 테이블에 새 레코드 생성
    const record = await xata.db.requests.create({
      applicant: body.applicant, // 신청자 정보 (JSONB)
      contact: body.contact,     // 전화번호
      reason: body.reason,       // 사유
      time: body.time,           // 사용 시간
      ip,                        // IP 주소
      fcm: body.fcm,             // 클라이언트에서 전달된 FCM 토큰 (원래 fcm 필드)
      isApproved: body.isApproved !== undefined ? body.isApproved : false,
      status: body.status || "pending",
    });

    // 저장 후 password 테이블에서 name 필드(FCM 토큰)를 가진 모든 레코드를 조회
    const passwordRecords = await xata.db.password.filter({ name: { $ne: null } }).getAll();
    // 각 레코드의 name 필드를 토큰으로 보고 중복 제거
    const tokens = Array.from(
      new Set(passwordRecords.map((record) => record.name).filter(Boolean))
    );

    let notifResponses = [];
    if (tokens.length === 0) {
      console.warn("전송할 FCM 토큰이 없습니다.");
    } else {
      // 알림 메시지 구성 (제목과 본문: "신청이 들어왔습니다")
      const messagePayload = {
        notification: {
          title: "신청이 들어왔습니다",
          body: "신청이 들어왔습니다",
        },
        data: {
          requestId: record.id, // 추가 데이터로 새 신청 레코드 ID 전달
        },
      };

      // 각 토큰에 대해 개별 메시지 전송
      const sendPromises = tokens.map((token) => {
        const message = { ...messagePayload, token };
        return admin.messaging().send(message);
      });

      notifResponses = await Promise.all(sendPromises);
      console.log("푸시 알림 전송 결과:", notifResponses);
    }

    return NextResponse.json({ success: true, record, notifications: notifResponses });
  } catch (error) {
    console.error("신청 저장 및 알림 전송 오류:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const body = await req.json();
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true });
  const data = await xata.db.requests.createOrReplace(params.id, body);

  return NextResponse.json(data);
}

export async function PATCH(req) {
  const body = await req.json();
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true });
  const data = await xata.db.requests.update(params.id, body);

  return NextResponse.json(data);
}

export async function DELETE(req) {
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true });
  const data = await xata.db.requests.delete(params.id);
  return NextResponse.json(data);
}
