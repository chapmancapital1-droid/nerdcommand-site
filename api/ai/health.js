export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const mode = process.env.AI_MODE ?? "mock";
  if (mode === "mock") {
    response.status(200).json({
      ok: true,
      mode: "mock",
      provider: "prototype",
      model: "not-configured",
      message: "The UX is running in safe prototype mode.",
    });
    return;
  }

  const baseUrl = process.env.NERDCOMMAND_AI_GATEWAY_URL;
  if (!baseUrl) {
    response.status(503).json({
      ok: false,
      mode,
      error: "NERDCOMMAND_AI_GATEWAY_URL is not configured",
    });
    return;
  }

  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/models`, {
      headers: process.env.NERDCOMMAND_AI_GATEWAY_TOKEN
        ? { authorization: `Bearer ${process.env.NERDCOMMAND_AI_GATEWAY_TOKEN}` }
        : {},
      signal: AbortSignal.timeout(7000),
    });

    const payload = await upstream.json().catch(() => ({}));
    response.status(upstream.ok ? 200 : 502).json({
      ok: upstream.ok,
      mode,
      provider: "nerdcommand-gateway",
      upstreamStatus: upstream.status,
      models: payload.data ?? payload.models ?? [],
    });
  } catch (error) {
    response.status(502).json({
      ok: false,
      mode,
      error: error instanceof Error ? error.message : "gateway_unreachable",
    });
  }
}
