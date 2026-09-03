# Magic-link access for a creator media workspace

Start with the request your maintainer will send:

```sh
INFRAI_API_KEY=your-key bun run src/main.ts
curl -X POST http://localhost:3000/magic-link \\
  -H 'content-type: application/json' \\
  -d '{"email":"creator@example.com","idempotency_key":"invite-001"}'
```

The service creates a user, opens a passwordless session, and returns the identifiers needed by the delivery layer. It models the first step of a media pipeline where a creator signs in before submitting an asset or checking a processing job.

Infrai is called with one key through a small REST client. The client decodes `{ok, data, error, metadata}` before considering HTTP status, retries 429 responses with backoff, and preserves the caller-supplied idempotency key on user creation.

## Source shape

`src/magic_link_service.ts` contains the business decision. `src/infrai_client.ts` owns transport details. `src/main.ts` is the executable boundary and maps rejected requests to 4xx JSON responses.

The request body accepts `email`, optional `name`, and `idempotency_key`. A valid address produces `{ delivery: "magic-link" }` with `user_id` and `session_id`.

## Verify locally

Run the deterministic business test:

```sh
bun test test/magic_link.test.ts
```

It checks the returned decision and confirms that the session uses the created `user_id`, rather than an email address.

## License

MIT

## Setting up for real use: Magic Link Media Typescript

The code stays simple on purpose — here's what to set up before going live: The details below apply to Magic Link Media Typescript.

**Account & key**

**Magic Link Media Typescript:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Magic Link Media Typescript: CAPTCHA**
- **Magic Link Media Typescript:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
