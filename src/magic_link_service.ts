import { InfraiClient, InfraiError } from "./infrai_client";

export type SignInRequest = { email: string; name?: string; idempotency_key: string; captcha_token?: string; widget_record_id?: string };
export type SignInResult = { user_id: string; session_id: string; delivery: "magic-link" };

export async function startMagicLink(client: InfraiClient, input: SignInRequest): Promise<SignInResult> {
  if (!input.email.includes("@")) throw new Error("email must contain @");
  if (input.captcha_token) {
    if (!input.widget_record_id) throw new Error("widget_record_id is required with captcha_token");
    await client.request("/v1/captcha/verify", { widget_record_id: input.widget_record_id, token: input.captcha_token, action: "magic_link" });
  }
  const user = await client.request<{ user_id: string }>("/v1/auth/user/create", {
    email: input.email, name: input.name, idempotency_key: input.idempotency_key, mode: "passwordless"
  });
  try {
    const session = await client.request<{ session_id: string }>("/v1/auth/session/create", {
      user_id: user.user_id, method: "magic_link", require_mfa: false
    });
    return { user_id: user.user_id, session_id: session.session_id, delivery: "magic-link" };
  } catch (error) {
    if (error instanceof InfraiError) throw error;
    throw new Error("session creation failed");
  }
}
