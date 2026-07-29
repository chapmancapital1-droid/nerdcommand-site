# Vercel Deployment

## Prototype deployment

1. Push this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Use the repository root as the project root.
4. Do not set a framework preset; this is a static HTML project with Vercel functions in `/api`.
5. Add `AI_MODE=mock` to Preview and Production.
6. Deploy.
7. Assign `nerdcommand.com` only after Preview review and public-claim approval.

## Environment separation

Development:

```dotenv
AI_MODE=mock
```

Preview:

```dotenv
AI_MODE=mock
```

Staging after OS Gateway exists:

```dotenv
AI_MODE=gateway
NERDCOMMAND_AI_GATEWAY_URL=https://staging-api.example/v1/ai
NERDCOMMAND_AI_GATEWAY_TOKEN=stored-in-vercel
NERDCOMMAND_AI_DEFAULT_MODEL=approved-model-alias
```

Production:

Use an OS Gateway URL and token dedicated to production. Never set it to a private laptop's `localhost` address.

## Git flow

```text
feature branch
-> pull request
-> checks
-> Vercel Preview
-> product/design/security review
-> merge to main
-> Vercel Production
-> smoke tests
-> monitoring
-> release record
```

## Production smoke tests

- Home and product routes return 200.
- OS shell loads.
- Product Registry hides planned/internal features from availability claims.
- AI health shows mock or a healthy gateway.
- AI chat handles unavailable gateway without leaking internals.
- Security headers are present.
- Mobile navigation works.
- Keyboard navigation works.
- 404 works.
- Rollback to prior deployment is rehearsed.
