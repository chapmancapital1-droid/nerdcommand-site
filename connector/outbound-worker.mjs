const provider = process.env.LOCAL_AI_PROVIDER ?? "ollama";
const providerBaseUrl = (
  process.env.LOCAL_AI_BASE_URL ??
  (provider === "lmstudio"
    ? "http://127.0.0.1:1234/v1"
    : "http://127.0.0.1:11434/v1")
).replace(/\/$/, "");

const providerApiKey =
  process.env.LOCAL_AI_API_KEY ??
  (provider === "lmstudio" ? "lm-studio" : "ollama");

const osUrl = (process.env.NERDCOMMAND_OS_URL ?? "").replace(/\/$/, "");
const nodeId = process.env.NERDCOMMAND_NODE_ID ?? "";
const nodeToken = process.env.NERDCOMMAND_NODE_TOKEN ?? "";
const pollMs = Number(process.env.NERDCOMMAND_NODE_POLL_MS ?? 2500);
const maxPromptChars = Number(process.env.LOCAL_AI_MAX_PROMPT_CHARS ?? 40000);
const allowedModels = new Set(
  (process.env.LOCAL_AI_ALLOWED_MODELS ?? process.env.LOCAL_AI_MODEL ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

if (!osUrl || !nodeId || !nodeToken) {
  console.error(
    "NERDCOMMAND_OS_URL, NERDCOMMAND_NODE_ID, and NERDCOMMAND_NODE_TOKEN are required.",
  );
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function osFetch(path, init = {}) {
  return fetch(`${osUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${nodeToken}`,
      "x-nerdcommand-node-id": nodeId,
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(30000),
  });
}

async function providerFetch(path, init = {}) {
  return fetch(`${providerBaseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${providerApiKey}`,
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(180000),
  });
}

function validateJob(job) {
  if (!job || typeof job !== "object") throw new Error("invalid_job");
  if (!job.id || !job.model || !Array.isArray(job.messages)) {
    throw new Error("job_missing_required_fields");
  }
  if (allowedModels.size > 0 && !allowedModels.has(job.model)) {
    throw new Error("model_not_allowed");
  }
  const promptCharacters = job.messages.reduce(
    (total, message) => total + String(message?.content ?? "").length,
    0,
  );
  if (promptCharacters > maxPromptChars) throw new Error("prompt_too_large");
  if (job.tools?.length) throw new Error("tool_execution_not_enabled_in_mvp_node");
  if (job.approval_required && job.approval_status !== "approved") {
    throw new Error("required_approval_missing");
  }
}

async function heartbeat() {
  const modelsResponse = await providerFetch("/models");
  const modelsPayload = await modelsResponse.json().catch(() => ({}));

  await osFetch(`/v1/ai/nodes/${encodeURIComponent(nodeId)}/heartbeat`, {
    method: "POST",
    body: JSON.stringify({
      provider,
      provider_base_url: providerBaseUrl.replace(/127\.0\.0\.1|localhost/, "local"),
      healthy: modelsResponse.ok,
      models: modelsPayload.data ?? modelsPayload.models ?? [],
      capabilities: ["chat.completions"],
      tools_enabled: false,
      occurred_at: new Date().toISOString(),
    }),
  });
}

async function complete(job, payload, startedAt) {
  await osFetch(`/v1/ai/jobs/${encodeURIComponent(job.id)}/complete`, {
    method: "POST",
    body: JSON.stringify({
      node_id: nodeId,
      provider,
      model: job.model,
      response: payload,
      duration_ms: Date.now() - startedAt,
      completed_at: new Date().toISOString(),
    }),
  });
}

async function fail(jobId, error, startedAt) {
  await osFetch(`/v1/ai/jobs/${encodeURIComponent(jobId)}/fail`, {
    method: "POST",
    body: JSON.stringify({
      node_id: nodeId,
      error: error instanceof Error ? error.message : "unknown_error",
      duration_ms: Date.now() - startedAt,
      failed_at: new Date().toISOString(),
    }),
  }).catch(() => undefined);
}

async function claimAndRun() {
  const claimResponse = await osFetch("/v1/ai/jobs/claim", {
    method: "POST",
    body: JSON.stringify({
      node_id: nodeId,
      provider,
      allowed_models: [...allowedModels],
      capabilities: ["chat.completions"],
    }),
  });

  if (claimResponse.status === 204) return false;
  if (!claimResponse.ok) {
    throw new Error(`claim_failed_${claimResponse.status}`);
  }

  const { job } = await claimResponse.json();
  const startedAt = Date.now();

  try {
    validateJob(job);
    const inferenceResponse = await providerFetch("/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: job.model,
        messages: job.messages,
        temperature: job.temperature ?? 0.2,
        max_tokens: job.max_tokens ?? 1200,
        stream: false,
      }),
    });

    const inferencePayload = await inferenceResponse.json().catch(() => ({}));
    if (!inferenceResponse.ok) {
      throw new Error(`provider_failed_${inferenceResponse.status}`);
    }

    await complete(job, inferencePayload, startedAt);
  } catch (error) {
    await fail(job.id, error, startedAt);
  }

  return true;
}

console.log(`NerdCommand outbound AI node ${nodeId} starting.`);
console.log(`Provider: ${provider}`);
console.log(`Allowed models: ${allowedModels.size ? [...allowedModels].join(", ") : "none configured"}`);

let lastHeartbeat = 0;
for (;;) {
  try {
    if (Date.now() - lastHeartbeat > 30000) {
      await heartbeat();
      lastHeartbeat = Date.now();
    }
    const worked = await claimAndRun();
    if (!worked) await sleep(pollMs);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] connector error:`,
      error instanceof Error ? error.message : error,
    );
    await sleep(Math.max(pollMs, 5000));
  }
}
