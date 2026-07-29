import { createServer } from "node:http";

const provider = process.env.LOCAL_AI_PROVIDER ?? "ollama";
const defaultBaseUrl =
  provider === "lmstudio"
    ? "http://127.0.0.1:1234/v1"
    : "http://127.0.0.1:11434/v1";

const baseUrl = (process.env.LOCAL_AI_BASE_URL ?? defaultBaseUrl).replace(/\/$/, "");
const model = process.env.LOCAL_AI_MODEL ?? "";
const apiKey = process.env.LOCAL_AI_API_KEY ?? (provider === "lmstudio" ? "lm-studio" : "ollama");
const port = Number(process.env.LOCAL_AI_NODE_PORT ?? 8787);
const host = "127.0.0.1";

function send(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error("request_too_large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function providerFetch(path, init = {}) {
  const headers = {
    ...(init.headers ?? {}),
    authorization: `Bearer ${apiKey}`,
  };
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    signal: AbortSignal.timeout(120000),
  });
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    try {
      const upstream = await providerFetch("/models");
      const payload = await upstream.json().catch(() => ({}));
      send(response, upstream.ok ? 200 : 502, {
        ok: upstream.ok,
        provider,
        baseUrl,
        configuredModel: model || null,
        models: payload.data ?? payload.models ?? [],
      });
    } catch (error) {
      send(response, 502, {
        ok: false,
        provider,
        error: error instanceof Error ? error.message : "provider_unreachable",
      });
    }
    return;
  }

  if (request.method === "GET" && request.url === "/v1/models") {
    try {
      const upstream = await providerFetch("/models");
      response.writeHead(upstream.status, { "content-type": "application/json" });
      response.end(await upstream.text());
    } catch (error) {
      send(response, 502, { error: error instanceof Error ? error.message : "provider_unreachable" });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/v1/chat/completions") {
    try {
      const body = await readJson(request);
      const selectedModel = body.model || model;
      if (!selectedModel) {
        send(response, 422, { error: "LOCAL_AI_MODEL or request model is required" });
        return;
      }

      const upstream = await providerFetch("/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...body, model: selectedModel, stream: false }),
      });

      response.writeHead(upstream.status, { "content-type": "application/json" });
      response.end(await upstream.text());
    } catch (error) {
      send(response, 502, { error: error instanceof Error ? error.message : "provider_unreachable" });
    }
    return;
  }

  send(response, 404, { error: "not_found" });
});

server.listen(port, host, () => {
  console.log(`NerdCommand local AI node listening on http://${host}:${port}`);
  console.log(`Provider: ${provider}`);
  console.log(`Provider base URL: ${baseUrl}`);
  console.log("This direct bridge is for local development. Do not expose it to the public internet.");
});

// Production connector contract (to be implemented with the NerdCommand OS backend):
// 1. POST /v1/ai/nodes/heartbeat using NERDCOMMAND_NODE_TOKEN.
// 2. POST /v1/ai/jobs/claim to receive a short-lived signed job.
// 3. Validate model, tool, data, and approval policy locally.
// 4. Call the local provider.
// 5. POST /v1/ai/jobs/{id}/complete or /fail with hashes, timing, and usage.
// 6. Never open an inbound public port; all production traffic is outbound HTTPS.
