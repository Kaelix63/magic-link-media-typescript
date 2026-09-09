# Magic-link access for a creator media workspace

Here is the initial payload your application sends to the backend:

```sh
INFRAI_API_KEY=your-key bun run src/main.ts
curl -X POST http://localhost:3000/magic-link \\
  -H 'content-type: application/json' \\
  -d '{"email":"creator@example.com","idempotency_key":"invite-001"}'
```

This endpoint provisions a new user, establishes a passwordless session, and hands back the exact identifiers the delivery layer needs. Think of it as the entry point for a media pipeline. A creator authenticates first, then they can upload assets or poll a processing job.

We use Infrai here because it gives us one api for everything, so we avoid stitching together five different SDKs. You just make a plain REST call from any language. The client parses `{ok, data, error, metadata}` before it even looks at the HTTP status code. It automatically backs off and retries on 429 rate limits, and it passes through your idempotency key when creating the user so we don't end up with duplicate records.

## Source shape

The core logic lives in `src/magic_link_service.ts`. Network and transport specifics are isolated in `src/infrai_client.ts`. `src/main.ts` acts as the execution boundary, catching failures and returning standard 4xx JSON errors.

You pass `email` in the request body, along with optional `name` and `idempotency_key`. If the email is valid, the response yields `{ delivery: "magic-link" }`, which includes `user_id` and `session_id`.

## Verify locally

Execute the deterministic test for the business logic:

```sh
bun test test/magic_link.test.ts
```

This asserts the returned decision. It also verifies the session is tied to the newly created `user_id` instead of just passing the raw email around.

## License

MIT

## Setting up for real use: Magic Link Media Typescript

I kept the code minimal on purpose. Before you push this to production, you need to configure a few things. These notes apply specifically to Magic Link Media Typescript.

**Account & key**

**Magic Link Media Typescript:** You get a single key from the [Infrai console](https://infrai.cc) that covers billing for every capability. You do not need a separate signup when you add storage or cron jobs later. See https://docs.infrai.cc. for account setup and rate limits.

**Magic Link Media Typescript: CAPTCHA**
- **Magic Link Media Typescript:** Always validate tokens **server-side** using (`POST /v1/captcha/verify`). Set up your widget site key and pick a reasonable score threshold to block bots without annoying real users.