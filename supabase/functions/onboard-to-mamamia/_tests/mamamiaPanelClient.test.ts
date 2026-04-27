// Tests for the panel-style auth helper. Network is fully stubbed via
// fetch injection — we never hit the real Mamamia beta from CI.

import { assertEquals, assertRejects, assertStringIncludes } from "@std/assert";
import {
  loginAndImpersonate,
  panelMutateAsCustomer,
  __testing,
  type PanelClientOptions,
} from "../../_shared/mamamiaPanelClient.ts";

const BASE = "https://beta.example/backend";

interface RecordedCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

function recordingFetch(responses: Array<Partial<Response> & { setCookies?: string[]; bodyJson?: unknown }>): {
  fetchFn: typeof fetch;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  let i = 0;
  const fetchFn: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input as Request).url;
    const headersIn = (init as RequestInit | undefined)?.headers as Record<string, string> | undefined ?? {};
    calls.push({
      url,
      method: ((init as RequestInit | undefined)?.method ?? "GET").toUpperCase(),
      headers: headersIn,
      body: typeof (init as RequestInit | undefined)?.body === "string" ? (init as RequestInit).body as string : undefined,
    });
    const r = responses[i++] ?? { status: 200, bodyJson: { data: {} } };
    const headers = new Headers();
    for (const sc of r.setCookies ?? []) headers.append("set-cookie", sc);
    const status = r.status ?? 200;
    // 204/304 cannot carry a body — guard against the runtime check.
    const bodyAllowed = status !== 204 && status !== 304;
    const body = bodyAllowed
      ? (r.bodyJson !== undefined ? JSON.stringify(r.bodyJson) : "")
      : null;
    return new Response(body, { status, headers });
  };
  return { fetchFn, calls };
}

// ─── Cookie utilities ──────────────────────────────────────────────────────

Deno.test("parseSetCookieHeader: extracts name + value, strips attrs", () => {
  const e = __testing.parseSetCookieHeader(
    "XSRF-TOKEN=abc%3D%3D; expires=Wed; Max-Age=2592000; path=/; secure",
  );
  assertEquals(e.name, "XSRF-TOKEN");
  assertEquals(e.value, "abc%3D%3D");
});

Deno.test("mergeCookies: later Set-Cookie overrides earlier same-name", () => {
  const r1 = new Response(null, {
    headers: new Headers([["set-cookie", "X=v1; Path=/"], ["set-cookie", "Y=foo; Path=/"]]),
  });
  const r2 = new Response(null, {
    headers: new Headers([["set-cookie", "X=v2-fresh; Path=/"]]),
  });
  const jar = __testing.mergeCookies(__testing.mergeCookies(new Map(), r1), r2);
  assertEquals(jar.get("X"), "v2-fresh");
  assertEquals(jar.get("Y"), "foo");
});

Deno.test("decodeXsrf: URL-decodes the XSRF-TOKEN cookie", () => {
  const jar = new Map([["XSRF-TOKEN", "abc%3D%3D"]]);
  assertEquals(__testing.decodeXsrf(jar), "abc==");
});

// ─── loginAndImpersonate ──────────────────────────────────────────────────

Deno.test("loginAndImpersonate: full flow — csrf-cookie → LoginAgency → ImpersonateCustomer", async () => {
  const { fetchFn, calls } = recordingFetch([
    // 1. csrf-cookie response
    {
      status: 204,
      setCookies: [
        "XSRF-TOKEN=token-1%3D%3D; path=/; samesite=none; secure",
        "mamamia_beta_session=sess-1; httponly; path=/",
      ],
    },
    // 2. LoginAgency response — Laravel rotates session
    {
      status: 200,
      bodyJson: { data: { LoginAgency: { id: 8190, email: "primundus+portal@mamamia.app" } } },
      setCookies: [
        "XSRF-TOKEN=token-2%3D%3D; path=/",
        "mamamia_beta_session=sess-2-logged-in; httponly; path=/",
      ],
    },
    // 3. ImpersonateCustomer response — flips to customer-mode
    {
      status: 200,
      bodyJson: { data: { ImpersonateCustomer: { id: 8204, email: "m.kepinski@mamamia.app" } } },
      setCookies: [
        "XSRF-TOKEN=token-3%3D%3D; path=/",
        "mamamia_beta_session=sess-3-as-customer; httponly; path=/",
      ],
    },
  ]);

  const session = await loginAndImpersonate(
    { baseUrl: BASE, fetchFn },
    "primundus+portal@mamamia.app",
    "secret-pass",
    7576,
  );

  // Final jar should reflect impersonate-state cookies (3rd response).
  assertStringIncludes(session.cookies, "mamamia_beta_session=sess-3-as-customer");
  assertEquals(session.xsrf, "token-3==");

  // 3 sequential calls
  assertEquals(calls.length, 3);
  assertEquals(calls[0].url, `${BASE}/sanctum/csrf-cookie`);
  assertEquals(calls[1].url, `${BASE}/graphql/auth`);
  assertEquals(calls[2].url, `${BASE}/graphql/auth`);

  // LoginAgency request should carry XSRF from csrf-cookie + jar cookies.
  assertEquals(calls[1].headers["X-XSRF-TOKEN"], "token-1==");
  assertStringIncludes(calls[1].headers["Cookie"] ?? "", "mamamia_beta_session=sess-1");
  const loginBody = JSON.parse(calls[1].body!);
  assertEquals(loginBody.operationName, "LoginAgency");
  assertEquals(loginBody.variables.email, "primundus+portal@mamamia.app");

  // Impersonate request should carry the rotated XSRF + logged-in session.
  assertEquals(calls[2].headers["X-XSRF-TOKEN"], "token-2==");
  assertStringIncludes(calls[2].headers["Cookie"] ?? "", "mamamia_beta_session=sess-2-logged-in");
  const impBody = JSON.parse(calls[2].body!);
  assertEquals(impBody.operationName, "ImpersonateCustomer");
  assertEquals(impBody.variables.customer_id, 7576);
});

Deno.test("loginAndImpersonate: propagates GraphQL errors", async () => {
  const { fetchFn } = recordingFetch([
    { status: 204, setCookies: ["XSRF-TOKEN=t1; path=/"] },
    { status: 200, bodyJson: { errors: [{ message: "Niepoprawne dane logowania." }] } },
  ]);
  await assertRejects(
    () => loginAndImpersonate({ baseUrl: BASE, fetchFn }, "x", "wrong-pass", 1),
    Error,
    "Niepoprawne dane logowania",
  );
});

Deno.test("loginAndImpersonate: csrf-cookie HTTP failure aborts", async () => {
  const { fetchFn } = recordingFetch([
    { status: 503 },
  ]);
  await assertRejects(
    () => loginAndImpersonate({ baseUrl: BASE, fetchFn }, "x", "y", 1),
    Error,
    "csrf-cookie failed: HTTP 503",
  );
});

// ─── panelMutateAsCustomer ────────────────────────────────────────────────

Deno.test("panelMutateAsCustomer: posts to /graphql with cookie + xsrf header", async () => {
  const { fetchFn, calls } = recordingFetch([
    {
      status: 200,
      bodyJson: { data: { SendInvitationCaregiver: true } },
    },
  ]);
  const result = await panelMutateAsCustomer<{ SendInvitationCaregiver: boolean }>(
    { baseUrl: BASE, fetchFn },
    {
      cookies: "XSRF-TOKEN=%24abc; mamamia_beta_session=sess-as-customer",
      xsrf: "$abc",
    },
    "mutation Inv($id: Int) { SendInvitationCaregiver(caregiver_id: $id) }",
    { id: 10061 },
    "SendInvitationCaregiver",
  );
  assertEquals(result.SendInvitationCaregiver, true);

  assertEquals(calls[0].url, `${BASE}/graphql`);
  assertEquals(calls[0].headers["X-XSRF-TOKEN"], "$abc");
  assertStringIncludes(calls[0].headers["Cookie"] ?? "", "mamamia_beta_session=sess-as-customer");
  const body = JSON.parse(calls[0].body!);
  assertEquals(body.operationName, "SendInvitationCaregiver");
  assertEquals(body.variables.id, 10061);
});

Deno.test("panelMutateAsCustomer: throws on backend error message", async () => {
  const { fetchFn } = recordingFetch([
    { status: 200, bodyJson: { errors: [{ message: "Unauthorized" }] } },
  ]);
  await assertRejects(
    () => panelMutateAsCustomer(
      { baseUrl: BASE, fetchFn },
      { cookies: "XSRF-TOKEN=t", xsrf: "t" },
      "mutation X { X }",
      {},
      "X",
    ),
    Error,
    "Unauthorized",
  );
});
