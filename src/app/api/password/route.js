
import { getXataClient } from "@/xata";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

const xata = getXataClient();

export async function POST(req) {
  try {
    const { password, ...body } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);
    const data = await xata.db.password.create({
      value: hashedPassword,
      ...body,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error handling password:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
