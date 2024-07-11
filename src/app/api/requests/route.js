import { NextResponse } from "next/server";
import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function GET(req) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const data = await xata.db.requests.getMany(params);
    return NextResponse.json({ requests: data });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Error in GET request" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received body:", body); // 요청 본문을 로그에 출력
    const data = await xata.db.requests.create({
      time: body.time,
      reason: body.reason,
      contact: body.contact,
      applicants: body.applicants,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Error in POST request" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const body = await req.json();
    const data = await xata.db.requests.createOrReplace(params.id, body);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT request:", error);
    return NextResponse.json(
      { error: "Error in PUT request" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const body = await req.json();
    const data = await xata.db.requests.update(params.id, body);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PATCH request:", error);
    return NextResponse.json(
      { error: "Error in PATCH request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const data = await xata.db.requests.delete(params.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json(
      { error: "Error in DELETE request" },
      { status: 500 }
    );
  }
}
