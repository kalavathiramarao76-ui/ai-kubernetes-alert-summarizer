import { NextRequest } from "next/server";
import { streamAIResponse } from "@/lib/ai";
import { CORRELATE_SYSTEM_PROMPT } from "@/lib/prompts";
import { checkAndIncrementUsage, isAuthenticated } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    const authed = await isAuthenticated(ip);

    if (!authed) {
      const { allowed, count } = await checkAndIncrementUsage(ip);
      if (!allowed) {
        return new Response(
          JSON.stringify({
            error: "FREE_LIMIT_REACHED",
            message: `Free trial complete. You've used ${count} of 3 free generations. Sign in with Google to continue.`,
            count,
            remaining: 0,
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

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
