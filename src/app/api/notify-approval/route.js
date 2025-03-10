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
    const { id, isApproved } = await req.json();
    console.log("notify-approval 요청 id:", id);
    console.log("isApproved:", isApproved);

    // isApproved가 boolean이 아닐 경우 false로 설정
    const approvedStatus = typeof isApproved === "boolean" ? isApproved : false;

    if (!id) {
      return NextResponse.json(
        { error: "필수 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    const record = await xata.db.requests.read(id);
    if (!record) {
      return NextResponse.json(
        { error: "레코드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const fcmToken = record.fcm;
    if (!fcmToken) {
      return NextResponse.json(
        { error: "FCM 토큰이 없습니다." },
        { status: 400 }
      );
    }

    let messageTitle = "";
    let messageBody = "";
    let clickLink = "";

    // approvedStatus 값에 따라 메시지 결정
    if (approvedStatus === true) {
      messageTitle = "신청 승인";
      messageBody = "이 알림을 클릭해 PDF를 달라고 하세요.";
    } else {
      messageTitle = "신청 거부";
      messageBody = "당신의 신청이 거부되었습니다.";
    }

    const message = {
      notification: {
        title: messageTitle,
        body: messageBody,
      },
      token: fcmToken,
      webpush: {
        fcmOptions: {
          link: clickLink, // 클릭 시 이동할 링크 설정
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("알림 전송 성공:", response);

    return NextResponse.json({
      message: "알림 전송 성공",
      response: response,
      approvedStatus: approvedStatus,
    });
  } catch (error) {
    console.error("알림 전송 오류:", error);
    return NextResponse.json(
      { error: "알림 전송 실패", detail: error.message },
      { status: 500 }
    );
  }
}
