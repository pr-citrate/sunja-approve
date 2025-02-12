import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();

  if (password === "111711") {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false });
  }
}
