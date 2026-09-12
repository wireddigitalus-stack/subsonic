import { NextResponse } from "next/server";
import { evaluateChatMessage, ModerationResult } from "@/lib/ai-moderator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, authorRole } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. If Gemini API key is available, use Google Gemini 2.5 Flash
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are the Subsonic Society AI Sentinel, an elite safety & policy moderation system for a precision rimfire shooting competition community.
Analyze this chat message from author role "${authorRole || "MEMBER"}":
"${content}"

Check against:
1. Firearm / suppressor / ammunition commerce: Strict prohibition of private/unregulated sales or trades (policyScore: 90-100, shouldBlock: true).
2. Physical threats or harassment toward shooters, match directors, or range safety officers (threatScore: 80-100, shouldBlock: true).
3. Unsportsmanlike conduct, cheating accusations, or pencil-whipping disputes (status: FLAGGED, toxicityScore: 60-90).
4. Spam bots or external solicitation links (shouldBlock: true).

Output JSON matching this exact structure:
{
  "status": "APPROVED" | "FLAGGED" | "REJECTED",
  "toxicityScore": number,
  "threatScore": number,
  "policyScore": number,
  "sentiment": "POSITIVE" | "NEUTRAL" | "SUSPICIOUS" | "TOXIC",
  "flagReason": string | null,
  "shouldBlock": boolean
}`
                    }
                  ]
                }
              ],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const report: ModerationResult & { aiEngine: string } = {
              status: parsed.status || "APPROVED",
              toxicityScore: typeof parsed.toxicityScore === "number" ? parsed.toxicityScore : 0,
              threatScore: typeof parsed.threatScore === "number" ? parsed.threatScore : 0,
              policyScore: typeof parsed.policyScore === "number" ? parsed.policyScore : 0,
              sentiment: parsed.sentiment || "NEUTRAL",
              flagReason: parsed.flagReason || undefined,
              shouldBlock: Boolean(parsed.shouldBlock),
              timestamp: new Date().toISOString(),
              aiEngine: "Google Gemini 2.5 Flash",
            };
            return NextResponse.json({ report, engine: "gemini-2.5-flash" });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to local sentinel engine:", geminiError);
      }
    }

    // 2. High-speed local NLP rules fallback
    const report = evaluateChatMessage(content, authorRole || "MEMBER");
    return NextResponse.json({ report, engine: "local-sentinel-fallback" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
