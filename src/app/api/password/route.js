import { getXataClient } from "@/xata";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

const xata = getXataClient();

export async function POST(req) {
  const { password, ...body } = await req.json();
  const data = await xata.db.password.create({
    value: await hash(password, 10),
    ...body,
  });

  return NextResponse.json(data);
}
