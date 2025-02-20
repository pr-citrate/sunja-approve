// app/api/notify-approval/route.js
import { NextResponse } from "next/server";
import { getXataClient } from "@/xata";
import admin from "firebase-admin";

const xata = getXataClient();

// Firebase Admin SDK 초기화 (이미 초기화된 경우 건너뛰기)
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
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
    }

    // 해당 요청 레코드를 Xata에서 읽기 (fcm 필드가 포함되어 있어야 함)
    const record = await xata.db.requests.read(id);
    if (!record) {
      return NextResponse.json({ error: "레코드를 찾을 수 없습니다." }, { status: 404 });
    }

    const fcmToken = record.fcm;
    if (!fcmToken) {
      return NextResponse.json({ error: "FCM 토큰이 없습니다." }, { status: 400 });
    }

    const message = {
      notification: {
        title: "신청 승인",
        body: "당신의 신청이 승인되었습니다.",
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log("알림 전송 성공:", response);
    return NextResponse.json({ message: "알림 전송 성공", response });
  } catch (error) {
    console.error("알림 전송 오류:", error);
    return NextResponse.json({ error: "알림 전송 실패", detail: error.message }, { status: 500 });
  }
}
