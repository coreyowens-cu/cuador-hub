/**
 * /app/api/claude/route.js
 * Secure server-side proxy for the Anthropic API.
 * The API key never leaves the server.
 */

export const runtime = "edge";

export async function POST(request) {
  try {
    const body = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured. See .env.local" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
      },
      body: JSON.stringify({
        model: body.model || "claude-sonnet-4-20250514",
        max_tokens: body.max_tokens || 2048,
        system: body.system,
        messages: body.messages,
        ...(body.stream ? { stream: true } : {}),
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return new Response(err, {
        status: anthropicRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream support — pass through if streaming
    if (body.stream) {
      return new Response(anthropicRes.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    const data = await anthropicRes.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
