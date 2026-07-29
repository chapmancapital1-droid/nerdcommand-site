# NerdCommand Local AI Node

The local node gives NerdCommand OS a provider-neutral boundary for LM Studio and Ollama.

## Local development

Ollama:

```dotenv
LOCAL_AI_PROVIDER=ollama
LOCAL_AI_BASE_URL=http://127.0.0.1:11434/v1
LOCAL_AI_MODEL=replace-with-installed-model
LOCAL_AI_API_KEY=ollama
```

LM Studio:

```dotenv
LOCAL_AI_PROVIDER=lmstudio
LOCAL_AI_BASE_URL=http://127.0.0.1:1234/v1
LOCAL_AI_MODEL=replace-with-loaded-model
LOCAL_AI_API_KEY=lm-studio
```

Run:

```bash
node --env-file=.env connector/local-ai-node.mjs
```

Health:

```bash
curl http://127.0.0.1:8787/health
```

Chat:

```bash
curl http://127.0.0.1:8787/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"replace-with-model","messages":[{"role":"user","content":"Create an operating brief."}]}'
```

## Production rule

Do not tunnel or publish the local model port as the normal architecture. The production node should make outbound authenticated requests to NerdCommand OS, claim signed jobs, enforce policy locally, run inference, and return the result with an audit record.

## Outbound production worker

`outbound-worker.mjs` implements the client side of the planned production connector contract. It requires the Stage 7 NerdCommand OS node and job endpoints. It allows only configured models, rejects tool calls in the MVP, enforces approval state, and communicates with the OS through outbound HTTPS.

```bash
node --env-file=.env connector/outbound-worker.mjs
```
