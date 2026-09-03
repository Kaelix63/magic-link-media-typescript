import assert from "node:assert/strict";
import { startMagicLink } from "../src/magic_link_service";

const calls: Array<{ path: string; body: Record<string, unknown> }> = [];
const fake = { request: async (path: string, body: Record<string, unknown>) => {
  calls.push({ path, body });
  return path.includes("user/create") ? { user_id: "u_123" } : { session_id: "s_456" };
} } as any;
const result = await startMagicLink(fake, { email: "creator@example.com", idempotency_key: "upload-1" });
assert.deepEqual(result, { user_id: "u_123", session_id: "s_456", delivery: "magic-link" });
assert.equal(calls[0].body.idempotency_key, "upload-1");
assert.equal(calls[1].body.user_id, "u_123");
console.log("magic-link decision test passed");
