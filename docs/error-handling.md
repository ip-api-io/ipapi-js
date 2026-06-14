# Errors, rate limits & usage

The client maps every HTTP failure to a typed error and **never retries** — you stay
in control of back-off. It also exposes your current quota so you can throttle before
you hit a limit.

## Error taxonomy

Every error extends `IpApiError`, which carries `statusCode` and the raw response
`body`. Catch the specific subclass you care about:

| Error | HTTP status | Meaning |
|---|---|---|
| `AuthenticationError` | 401, 403 | Missing or invalid API key |
| `RateLimitError` | 429 | Quota exhausted (see below) |
| `InvalidRequestError` | 400, 404, 422 | Malformed input or unknown resource |
| `ServerError` | 5xx | ip-api.io server-side failure |
| `IpApiError` | other | Base / fallback |

```ts
import {
  IpApiClient,
  IpApiError,
  AuthenticationError,
  RateLimitError,
  InvalidRequestError,
  ServerError,
} from "ip-api-io";

const client = new IpApiClient({ apiKey: "YOUR_API_KEY" });

try {
  const info = await client.lookup("8.8.8.8");
  console.log(info.location.country);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`quota hit — resets at ${error.reset}`);
  } else if (error instanceof AuthenticationError) {
    console.log("check your API key");
  } else if (error instanceof InvalidRequestError) {
    console.log("bad request:", error.message);
  } else if (error instanceof ServerError) {
    console.log("ip-api.io is having trouble, try later");
  } else if (error instanceof IpApiError) {
    console.log(`error ${error.statusCode}: ${error.message}`);
  } else {
    throw error; // network / timeout — native fetch error
  }
}
```

Transport failures (DNS, connection, timeout) surface as the native `fetch` error
(e.g. an `AbortError` once `timeoutMs` elapses), not an `IpApiError`.

## Rate limits

On HTTP 429 the client throws `RateLimitError`, parsed from the `x-ratelimit-*`
response headers. Because the client never retries, **`reset` tells you when to**:

```ts
try {
  await client.lookup("8.8.8.8");
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(error.limit);      // your quota for the window
    console.log(error.remaining);  // requests left (0 here)
    console.log(error.reset);      // unix timestamp when quota renews
    const waitMs = (error.reset ?? 0) * 1000 - Date.now();
    // schedule a retry after `waitMs` instead of hammering the API
  }
}
```

## `rateLimit()` — check quota proactively

Read your current limits without triggering a 429, so you can throttle in advance.

```ts
const rl = await client.rateLimit();

console.log(rl.plan_name);
console.log(rl.ip_api.remaining, "/", rl.ip_api.limit);
console.log(rl.email_api.usage_percent, "% used");
console.log(rl.next_renewal_date);
```

`RateLimitInfo`: `plan_id`, `plan_name`, `ip_api` and `email_api`
(`ApiLimitInfo`: `limit`, `remaining`, `used`, `usage_percent`), `interval_seconds`,
`next_renewal_date`, `status`.

## `usageSummary()` — account usage

Aggregate usage for the current period — handy for dashboards and internal alerts.

```ts
const usage = await client.usageSummary();

console.log(usage.totalRequests, usage.successfulRequests);
console.log(usage.rateLimitedRequests, usage.quotaConsumed);
console.log(usage.periodStart, "→", usage.periodEnd);
```

`UsageSummary`: `apiKey`, `apiType`, `periodStart`, `periodEnd`, `totalRequests`,
`successfulRequests`, `rateLimitedRequests`, `quotaConsumed`, `batchOperations`,
`avgRequestDurationMs`.

## See also

- [IP geolocation & bulk lookup](ip-geolocation.md) — the most common call
- API reference: https://ip-api.io/api-docs.html
- Get a free API key: https://ip-api.io
