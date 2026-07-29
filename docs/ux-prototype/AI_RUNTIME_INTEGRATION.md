# LM Studio and Ollama Integration

## Supported local interfaces

Both providers offer OpenAI-compatible endpoints for the MVP adapter:

- Ollama base URL: `http://127.0.0.1:11434/v1`
- LM Studio base URL: `http://127.0.0.1:1234/v1`
- Chat endpoint: `POST /v1/chat/completions`
- Model inventory: `GET /v1/models`

## Development mode

The included `connector/local-ai-node.mjs` binds only to `127.0.0.1`. It proxies the two provider APIs behind one local interface.

```bash
node --env-file=.env connector/local-ai-node.mjs
```

This mode is for local development and private network testing.

## Production mode

The local node should not accept public inbound traffic. It should establish outbound HTTPS to NerdCommand OS.

Job lifecycle:

```text
1. Node registers with organization and device identity.
2. Node sends heartbeat, capabilities, provider, model inventory, and health.
3. OS creates an AI job only after permission and approval checks.
4. Node claims a short-lived signed job.
5. Node verifies job signature, expiry, organization, approved model, data class, tools, budget, and approval.
6. Node calls LM Studio or Ollama locally.
7. Node returns output, usage, timing, model metadata, prompt hash, and evidence hash.
8. OS records the result and creates any required human review Command.
```

## Agent policy fields

Each agent requires:

- Agent ID.
- Human owner.
- Purpose.
- Risk tier.
- Approved model aliases.
- Approved providers and nodes.
- Data classifications.
- Tool allowlist.
- Prohibited actions.
- Budget.
- Prompt version.
- Evaluation suite.
- Approval requirements.
- Execution and correction history.
- Kill switch.

## Security rules

- Never place provider tokens in browser JavaScript.
- Never expose Ollama or LM Studio directly to the public internet as the normal design.
- Authenticate the local node and rotate its credentials.
- Encrypt traffic to NerdCommand OS.
- Sign and expire jobs.
- Minimize data in prompts.
- Record model, prompt, data source, tool calls, output, cost, and review.
- Deny customer commitments, pricing, payments, access changes, deployment, employment, or security actions without the required human authority.
