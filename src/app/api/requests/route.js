import { NextResponse } from "next/server";
import { getXataClient } from "@/xata";
import { parse } from "qs";

const xata = getXataClient();

export async function GET(req) {
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true });
  const data = await xata.db.requests.filter(params).getAll();

  return NextResponse.json({ requests: data });
}

export async function POST(req) {
  // IP 주소 가져오기 (Vercel, Cloudflare 등 프록시 환경일 경우 X-Forwarded-For 사용)
  const ipHeader = req.headers.get("X-Forwarded-For") || "";
  const ip = ipHeader.split(",")[0].trim();

  const body = await req.json();
  console.log("POST /api/requests body:", body);

  // Xata의 requests 테이블에 새 레코드 생성
  const data = await xata.db.requests.create({
    // 기존 폼에서 전송된 필드들
    applicant: body.applicant,       // 예: 신청자 정보 (JSONB)
    contact: body.contact,           // 예: 전화번호
    reason: body.reason,             // 예: 사유
    time: body.time,                 // 예: 사용 시간
    ip,                              // IP 주소
    // FCM 토큰을 fcm 컬럼에 저장
    fcm: body.fcm,                   // 클라이언트에서 body.fcm으로 전송된 값
    // 상태 관련 필드들
    isApproved: body.isApproved ?? false, // 승인 여부 (없으면 null)
    status: body.status || "pending",    // 상태 (기본값 "pending")
  });

  return NextResponse.json(data);
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
