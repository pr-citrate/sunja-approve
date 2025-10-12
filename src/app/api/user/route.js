import { NextResponse } from "next/server"
import { parse } from "qs"
import { runXataOperation } from "@/lib/server/xataClient"

export async function GET(req) {
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true })
  const data = await runXataOperation((client) => client.db.requests.filter(params).getMany(), {
    retries: 2,
  })

  return NextResponse.json({ requests: data })
}

export async function POST(req) {
  const body = await req.json()
  const data = await runXataOperation((client) => client.db.requests.create(body), { retries: 2 })

  return NextResponse.json(data)
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
