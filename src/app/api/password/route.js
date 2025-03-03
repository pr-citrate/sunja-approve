import { NextResponse } from "next/server";
import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function POST(req) {
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      // JSON 요청: { name: token } 형태로 FCM 토큰 저장
      const { name } = await req.json();
      if (!name) {
        return NextResponse.json(
          { error: "토큰이 제공되지 않았습니다." },
          { status: 400 }
        );
      }
      // password 테이블에 새 레코드를 생성하여 FCM 토큰을 저장합니다.
      const record = await xata.db.password.create({ name });
      return NextResponse.json({ success: true, record });
    } else {
      // JSON이 아닌 경우: plain text로 전달된 비밀번호 검증
      const password = await req.text();
      if (password === process.env.PASSWORD) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ success: false });
      }
    }
  } catch (error) {
    console.error("토큰 저장 오류:", error);
    return NextResponse.json(
      { success: false, detail: error.message },
      { status: 500 }
    );
  }
}
