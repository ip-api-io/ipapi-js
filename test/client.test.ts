import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AuthenticationError,
  InvalidRequestError,
  IpApiClient,
  RateLimitError,
  ServerError,
} from "../src/index";
import { USER_AGENT } from "../src/version";

// IpInfoV1Dto example from https://ip-api.io/openapi.json
const IP_INFO_FIXTURE = {
  ip: "203.0.113.195",
  isp: "Comcast Cable Communications",
  asn: "AS7922",
  suspicious_factors: {
    is_proxy: false,
    is_tor_node: false,
    is_spam: false,
    is_crawler: false,
    is_datacenter: true,
    is_vpn: false,
    is_threat: false,
  },
  location: {
    country: "United States",
    country_code: "US",
    city: "San Francisco",
    latitude: 37.7749,
    longitude: -122.4194,
    zip: "94105",
    timezone: "America/Los_Angeles",
    local_time: "2023-06-21T14:30:00-07:00",
    local_time_unix: 1687385400,
    is_daylight_savings: true,
  },
};

function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  const fn = vi.fn<typeof fetch>(async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...headers },
    }),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

function firstCall(fn: ReturnType<typeof mockFetch>): [string, RequestInit] {
  const call = fn.mock.calls[0];
  if (!call) throw new Error("fetch was not called");
  return [String(call[0]), call[1] ?? {}];
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("IpApiClient", () => {
  it("parses lookup response and sends User-Agent", async () => {
    const fetchMock = mockFetch(200, IP_INFO_FIXTURE);
    const client = new IpApiClient();
    const info = await client.lookup("203.0.113.195");
    expect(info).toEqual(IP_INFO_FIXTURE);

    const [url, init] = firstCall(fetchMock);
    expect(url).toBe("https://ip-api.io/api/v1/ip/203.0.113.195");
    expect(init.method).toBe("GET");
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe(USER_AGENT);
  });

  it("sends api_key as a query parameter", async () => {
    const fetchMock = mockFetch(200, IP_INFO_FIXTURE);
    await new IpApiClient({ apiKey: "secret123" }).lookup();
    expect(firstCall(fetchMock)[0]).toBe("https://ip-api.io/api/v1/ip?api_key=secret123");
  });

  it("URL-encodes email path parameters", async () => {
    const fetchMock = mockFetch(200, {});
    await new IpApiClient().validateEmail("user+tag@example.com");
    expect(firstCall(fetchMock)[0]).toBe(
      "https://ip-api.io/api/v1/email/advanced/user%2Btag%40example.com",
    );
  });

  it("POSTs JSON body for batch lookups", async () => {
    const fetchMock = mockFetch(200, { results: {} });
    await new IpApiClient().lookupBatch(["8.8.8.8", "1.1.1.1"]);
    const [url, init] = firstCall(fetchMock);
    expect(url).toBe("https://ip-api.io/api/v1/ip/batch");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ ips: ["8.8.8.8", "1.1.1.1"] });
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("validates batch sizes client-side", async () => {
    const client = new IpApiClient();
    expect(() => client.lookupBatch([])).toThrow(RangeError);
    expect(() => client.lookupBatch(Array(101).fill("1.1.1.1"))).toThrow(RangeError);
    expect(() => client.validateEmailBatch([])).toThrow(RangeError);
  });

  it("throws RateLimitError with parsed x-ratelimit headers on 429", async () => {
    mockFetch(
      429,
      { message: "Rate limit exceeded" },
      {
        "x-ratelimit-limit": "1000",
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": "1718200000",
      },
    );
    const error = await new IpApiClient().lookup("8.8.8.8").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RateLimitError);
    const rateLimitError = error as RateLimitError;
    expect(rateLimitError.statusCode).toBe(429);
    expect(rateLimitError.limit).toBe(1000);
    expect(rateLimitError.remaining).toBe(0);
    expect(rateLimitError.reset).toBe(1718200000);
    expect(rateLimitError.message).toContain("Rate limit exceeded");
  });

  it("throws AuthenticationError on 401", async () => {
    mockFetch(401, { error: "Invalid API key" });
    await expect(new IpApiClient({ apiKey: "bad" }).lookup()).rejects.toBeInstanceOf(
      AuthenticationError,
    );
  });

  it("throws InvalidRequestError on 400", async () => {
    mockFetch(400, { message: "Invalid IP address" });
    await expect(new IpApiClient().lookup("not-an-ip")).rejects.toBeInstanceOf(
      InvalidRequestError,
    );
  });

  it("throws ServerError on 500", async () => {
    mockFetch(500, {});
    await expect(new IpApiClient().lookup()).rejects.toBeInstanceOf(ServerError);
  });
});
