import { NextResponse } from "next/server";
import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function GET(req) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  try {
    const data = await xata.db.requests.getMany(params);
    console.log("GET 요청 데이터:", data); // 콘솔에 반환되는 데이터 출력
    return NextResponse.json({ requests: data });
  } catch (error) {
    console.error("데이터 불러오기 오류:", error);
    return NextResponse.json({ error: "데이터 불러오기 오류" });
  }
}

export async function POST(req) {
  const body = await req.json();
  console.log("POST 요청 데이터:", body); // 콘솔에 요청 데이터 출력
  try {
    const data = await xata.db.requests.create(body);
    console.log("저장된 데이터:", data); // 콘솔에 저장된 데이터 출력
    return NextResponse.json(data);
  } catch (error) {
    console.error("데이터 저장 오류:", error);
    return NextResponse.json({ error: "데이터 저장 오류" });
  }
}

export async function PATCH(req) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const body = await req.json();
  try {
    const data = await xata.db.requests.update(params.id, body);
    return NextResponse.json(data);
  } catch (error) {
    console.error("데이터 업데이트 오류:", error);
    return NextResponse.json({ error: "데이터 업데이트 오류" });
  }
}

export async function DELETE(req) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  try {
    const data = await xata.db.requests.delete(params.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("데이터 삭제 오류:", error);
    return NextResponse.json({ error: "데이터 삭제 오류" });
  }
}
