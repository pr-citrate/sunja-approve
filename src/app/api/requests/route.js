import { getXataClient } from "@/xata";
import { NextResponse } from "next/server";

const xata = getXataClient();

export async function GET(req) {
  const { searchParams: params } = new URL(req.url);
  const data = await xata.db.requests.getMany(params);

  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();
  const data = await xata.db.requests.create(body);

  return NextResponse.json(data);
}

export async function PATCH(req) {
  const { searchParams: params } = new URL(req.url);
  const { id } = await params;
  const data = await xata.db.requests.createOrReplace(id, body);

  return NextResponse.json(data);
}

export async function PATCH(req) {
  const { searchParams: params } = new URL(req.url);
  const { id } = await params;
  const data = await xata.db.requests.update(id, body);

  return NextResponse.json(data);
}

export async function DELETE(req) {
  const { searchParams: params } = new URL(req.url);
  const { id } = await params;

  const data = xata.db.requests.delete(id);
  return NextResponse.json(data);
}
