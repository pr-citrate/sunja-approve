import { NextResponse } from "next/server"

import { runXataOperation } from "@/lib/server/xataClient"

export async function POST(req) {
  try {
    const { token: providedToken, label } = await req.json()
    const token = (providedToken ?? "").trim()

    if (!token) {
      return NextResponse.json({ error: "토큰이 제공되지 않았습니다." }, { status: 400 })
    }

    const existing = await runXataOperation(
      (client) => client.db.admin_tokens.filter({ token }).getFirst(),
      { retries: 2 },
    )

    const payload = {
      label: label ?? existing?.label ?? null,
      lastValidatedAt: new Date().toISOString(),
    }

    if (existing) {
      const updated = await runXataOperation(
        (client) => client.db.admin_tokens.update(existing.id, payload),
        { retries: 2 },
      )
      return NextResponse.json({ success: true, record: updated, created: false })
    }

    const record = await runXataOperation(
      (client) =>
        client.db.admin_tokens.create({
          token,
          label: payload.label,
          lastValidatedAt: payload.lastValidatedAt,
        }),
      { retries: 2 },
    )

    return NextResponse.json({ success: true, record, created: true })
  } catch (error) {
    console.error("토큰 저장 오류:", error)
    return NextResponse.json({ success: false, detail: error.message }, { status: 500 })
  }
}
