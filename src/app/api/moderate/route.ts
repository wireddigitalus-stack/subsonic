import { NextResponse } from "next/server";
import { evaluateChatMessage } from "@/lib/ai-moderator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, authorRole } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const report = evaluateChatMessage(content, authorRole || "MEMBER");
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
