import { NextResponse } from "next/server";

export async function POST(req) {
  const password = await req.text();
  if (password === process.env.PASSWORD) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false });
  }
}
