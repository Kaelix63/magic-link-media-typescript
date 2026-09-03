import { InfraiClient, InfraiError } from "./infrai_client";
import { startMagicLink } from "./magic_link_service";
import { z } from "zod";

const requestSchema = z.object({ email: z.string().email(), name: z.string().optional(), idempotency_key: z.string().min(1), captcha_token: z.string().optional(), widget_record_id: z.string().optional() });

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before starting the example");

const port = Number(process.env.PORT ?? 3000);
const client = new InfraiClient(key);
const server = Bun.serve({
  port,
  async fetch(request: Request) {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/magic-link") {
      return new Response(JSON.stringify({ error: "Use POST /magic-link" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    try {
      const body = requestSchema.parse(await request.json());
      const result = await startMagicLink(client, body);
      return Response.json(result, { status: 202 });
    } catch (error) {
      if (error instanceof InfraiError) return Response.json({ error: error.code }, { status: Math.min(Math.max(error.status, 400), 499) });
      return Response.json({ error: "invalid request" }, { status: 400 });
    }
  }
});
console.log(`magic-link service listening on ${server.port}`);
