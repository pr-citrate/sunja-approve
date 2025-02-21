import { NextResponse } from "next/server";
import { getXataClient } from "@/xata";
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

export async function POST(req) {
  try {
    // 요청 본문을 JSON으로 파싱하고 id, isApproved 값을 추출
    const { id, isApproved } = await req.json();
    console.log("서버에서 받은 데이터:", { id, isApproved }); // 받은 데이터 확인

    // 필수 데이터가 없으면 오류 반환
    if (!id || isApproved === undefined) {
      return NextResponse.json({ error: "필수 데이터가 누락되었습니다." }, { status: 400 });
    }

    // Xata 데이터베이스에서 해당 요청을 읽어오기
    const record = await xata.db.requests.read(id);
    if (!record) {
      return NextResponse.json({ error: "레코드를 찾을 수 없습니다." }, { status: 404 });
    }

    const fcmToken = record.fcm;
    if (!fcmToken) {
      return NextResponse.json({ error: "FCM 토큰이 없습니다." }, { status: 400 });
    }

    let messageTitle = "";
    let messageBody = "";

    // isApproved 값에 따른 상태 메시지 설정
    if (isApproved === true) {
      messageTitle = "신청 승인";
      messageBody = "당신의 신청이 승인되었습니다.";
    } else if (isApproved === false) {
      messageTitle = "신청 거부";
      messageBody = "당신의 신청이 거부되었습니다.";
    } else {
      return NextResponse.json({ error: "유효하지 않은 상태입니다." }, { status: 400 });
    }

    const message = {
      notification: {
        title: messageTitle,
        body: messageBody,
      },
      token: fcmToken,
    };

    // Firebase Cloud Messaging을 사용하여 푸시 알림 전송
    const response = await admin.messaging().send(message);
    console.log("알림 전송 성공:", response);

    // 응답 본문을 정확히 반환
    return NextResponse.json({ message: "알림 전송 성공", response: response });
  } catch (error) {
    console.error("알림 전송 오류:", error);

    // 에러 메시지를 JSON 형식으로 반환
    return NextResponse.json({ error: "알림 전송 실패", detail: error.message }, { status: 500 });
  }
}
