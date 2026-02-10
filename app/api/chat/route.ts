/* eslint-disable */
export const runtime = "nodejs";

import { generateResponse } from "@/lib/services/species-chat";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object" || typeof (body as any).message !== "string") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const message = (body as any).message;
    const response = await generateResponse(message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Upstream provider error or invalid request" }, { status: 502 });
  }
}
