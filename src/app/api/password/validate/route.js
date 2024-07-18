import { NextResponse } from "next/server";
import { getXataClient } from "@/xata";
import { compare } from "bcrypt";
import { parse } from "qs";

const xata = getXataClient();

export async function GET(req) {
  const params = parse(req.nextUrl.search, { ignoreQueryPrefix: true });
  const data = await xata.db.password.getFirst(params.name);
  const res = await compare(params.password, data.value);

  return NextResponse.json(res);
}
