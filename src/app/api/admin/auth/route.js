import { NextResponse } from "next/server"

const ADMIN_PASSWORD = process.env.PASSWORD ?? process.env.ADMIN_PASSWORD

export async function POST(req) {
  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ error: "비밀번호가 설정되어 있지 않습니다." }, { status: 500 })
  }

  const contentType = req.headers.get("content-type") || ""
  const provided = contentType.includes("application/json")
    ? (await req.json()).password
    : await req.text()

  if (!provided) {
    return NextResponse.json({ error: "비밀번호가 제공되지 않았습니다." }, { status: 400 })
  }

  return NextResponse.json({ success: provided === ADMIN_PASSWORD })
}
