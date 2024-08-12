import { NextResponse } from "next/server";
import { getXataClient } from "@/xata";
import { parse } from "qs";

const xata = getXataClient();

export async function GET(req) {
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true });
  const data = await xata.db.requests.filter(params).getMany();

  return NextResponse.json({ requests: data });
}

export async function POST(req) {
  const ip = req.headers.get("X-Forwarded-For").split(",")[0];
  const body = await req.json();
  const data = await xata.db.requests.create({ ...body, ip: ip });

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
