import { NextRequest } from "next/server";
import { streamAIResponse } from "@/lib/ai";
import { ANALYZE_SYSTEM_PROMPT } from "@/lib/prompts";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { alert } = await req.json();

    if (!alert || typeof alert !== "string" || alert.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Alert data is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = await streamAIResponse(ANALYZE_SYSTEM_PROMPT, alert);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze alert. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
