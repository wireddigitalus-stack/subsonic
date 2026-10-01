import { NextResponse } from "next/server";
import { buildNexusSystemPrompt, getNexusDeterministicAnswer, NexusQueryContext } from "@/lib/nexus-brain";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, context } = body as { transcript?: string; context?: NexusQueryContext };

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return NextResponse.json(
        { error: "Transcript required for NEXUS query" },
        { status: 400 }
      );
    }

    const cleanQuery = transcript.trim();
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. If Gemini API key is available, call Google Gemini 2.5 Flash
    if (geminiKey) {
      try {
        const systemPrompt = buildNexusSystemPrompt(context);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${systemPrompt}\n\nUSER TRANSMISSION ON VOICE FREQUENCY:\n"${cleanQuery}"\n\nProvide your concise spoken response (2 to 4 sentences). Never use markdown bolding, asterisks, or bullet points because this will be spoken out loud by text-to-speech.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.35,
                maxOutputTokens: 220,
              },
            }),
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const candidateText =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (candidateText) {
            // Clean up any stray markdown symbols for speech synthesis
            const cleanSpokenText = candidateText
              .replace(/[*#_`~]/g, "")
              .replace(/\n+/g, " ")
              .trim();

            return NextResponse.json({
              text: cleanSpokenText,
              mood: "informative",
              source: "gemini",
            });
          }
        }
      } catch (geminiErr) {
        console.warn("NEXUS Gemini API error, falling back to local brain:", geminiErr);
      }
    }

    // 2. Deterministic fallback (offline or API issue)
    const fallbackText = getNexusDeterministicAnswer(cleanQuery, context);
    return NextResponse.json({
      text: fallbackText,
      mood: "informative",
      source: "local-brain",
    });
  } catch (error) {
    console.error("NEXUS Voice Route error:", error);
    return NextResponse.json(
      { error: "NEXUS Telemetry Core encountered a processing fault." },
      { status: 500 }
    );
  }
}
