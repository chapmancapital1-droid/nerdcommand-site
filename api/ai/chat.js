function parseBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }
  return request.body ?? {};
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("allow", "POST");
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  let body;
  try {
    body = parseBody(request);
  } catch {
    response.status(400).json({ error: "invalid_json" });
    return;
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 4000) {
    response.status(422).json({ error: "message_must_be_1_to_4000_characters" });
    return;
  }

  const mode = process.env.AI_MODE ?? "mock";
  if (mode === "mock") {
    response.status(200).json({
      mode: "mock",
      provider: "prototype",
      model: "not-configured",
      content:
        "Prototype response: Architect AI would convert this request into a reviewable business brief, required capabilities, risks, and human approval Commands. No production action was taken.",
    });
    return;
  }

  const baseUrl = process.env.NERDCOMMAND_AI_GATEWAY_URL;
  const model = process.env.NERDCOMMAND_AI_DEFAULT_MODEL;
  if (!baseUrl || !model) {
    response.status(503).json({ error: "ai_gateway_or_model_not_configured" });
    return;
  }

  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.NERDCOMMAND_AI_GATEWAY_TOKEN
          ? { authorization: `Bearer ${process.env.NERDCOMMAND_AI_GATEWAY_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are NerdCommand Architect AI. Produce concise, reviewable recommendations. Never claim that an action was executed unless an audited tool result proves it. Mark assumptions and request human approval for consequential actions.",
          },
          { role: "user", content: message },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });

    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      response.status(502).json({
        error: "ai_gateway_error",
        upstreamStatus: upstream.status,
        details: payload,
      });
      return;
    }

    const content =
      payload.choices?.[0]?.message?.content ??
      payload.output_text ??
      payload.response ??
      "The AI gateway returned no displayable text.";

    response.status(200).json({
      mode,
      provider: "nerdcommand-gateway",
      model,
      content,
    });
  } catch (error) {
    response.status(502).json({
      error: "ai_gateway_unreachable",
      details: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
