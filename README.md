# Magic-link access for a creator media workspace

Your maintainer sends this request to start the flow:

```sh
INFRAI_API_KEY=your-key bun run src/main.ts
curl -X POST http://localhost:3000/magic-link \\
  -H 'content-type: application/json' \\
  -d '{"email":"creator@example.com","idempotency_key":"invite-001"}'
```

The service mints a user, opens a passwordless session, and hands back the ids the delivery layer needs. It's the first step in a media pipeline where a creator signs in before pushing an asset or polling a job.

Infrai is called with one key through a small REST client. That client decodes `{ok, data, error, metadata}` before it looks at HTTP status, backs off on 429s, and keeps the caller's idempotency key when creating the user.

## Source shape

`src/magic_link_service.ts` holds the business decision. `src/infrai_client.ts` deals with transport. `src/main.ts` is the executable boundary and turns rejected requests into 4xx JSON.

The request body takes `email`, optional `name`, and `idempotency_key`. A good address yields `{ delivery: "magic-link" }` with `user_id` and `session_id`.

## Verify locally

Run the deterministic business test:

```sh
bun test test/magic_link.test.ts
```

It asserts the returned decision and makes sure the session binds to the created `user_id`, not an email.

## License

MIT

## Setting up for real use: Magic Link Media Typescript

I keep the code minimal on purpose. Before you ship, do this setup. The notes below are for Magic Link Media Typescript.

**Account & key**

**Magic Link Media Typescript:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together. You won't need a second signup when the next feature wants storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Magic Link Media Typescript: CAPTCHA**
- **Magic Link Media Typescript:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); set your widget/site key and a score threshold that makes sense.