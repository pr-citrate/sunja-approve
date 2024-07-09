import { NextResponse } from "next/server";
import { getXataClient } from "@/xata";
import { compare } from "bcrypt";

const xata = getXataClient();

export async function GET(req) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const data = await xata.db.password.getFirst(params.name);
  const res = await compare(params.password, data.value);

  return NextResponse.json(res);
}
