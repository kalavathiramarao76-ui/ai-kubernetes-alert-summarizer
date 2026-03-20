import { NextRequest } from "next/server";
import { streamAIResponse } from "@/lib/ai";
import { CORRELATE_SYSTEM_PROMPT } from "@/lib/prompts";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { alerts } = await req.json();

    if (!alerts || typeof alerts !== "string" || alerts.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Alert data is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `Analyze and correlate the following Kubernetes alerts:\n\n${alerts}`;
    const stream = await streamAIResponse(CORRELATE_SYSTEM_PROMPT, prompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Correlate API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to correlate alerts. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
