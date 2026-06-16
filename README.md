# ip-api-io — Official JavaScript/TypeScript client for [ip-api.io](https://ip-api.io)

[![npm](https://img.shields.io/npm/v/ip-api-io)](https://www.npmjs.com/package/ip-api-io)
[![test](https://github.com/ip-api-io/ipapi-js/actions/workflows/test.yml/badge.svg)](https://github.com/ip-api-io/ipapi-js/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

The official JavaScript/TypeScript client for the [ip-api.io](https://ip-api.io) IP
intelligence platform. One typed, zero-dependency client covers
[IP geolocation](https://ip-api.io/what-is-my-ip), [email validation](https://ip-api.io/email-validation)
and [verification](https://ip-api.io/email-verification-api) (syntax, MX, SMTP deliverability),
[fraud detection](https://ip-api.io/fraud-detection-api) and [risk scoring](https://ip-api.io/risk-score),
[VPN](https://ip-api.io/vpn-detection-api)/[proxy](https://ip-api.io/proxy-detection-api)/[Tor detection](https://ip-api.io/tor-detection),
[disposable email detection](https://ip-api.io/disposable-email-checker), [ASN lookup](https://ip-api.io/asn-lookup),
[WHOIS](https://ip-api.io/whois-lookup), [reverse DNS](https://ip-api.io/reverse-dns-lookup),
[MX records](https://ip-api.io/mx-record-lookup) and [domain age](https://ip-api.io/domain-age-checker).

Built on the global `fetch` (Node ≥18, Deno, Bun and browsers) — zero dependencies, fully
typed, ESM + CJS.

## Install

```bash
npm install ip-api-io
```

## Quickstart

```ts
import { IpApiClient } from "ip-api-io";

const client = new IpApiClient({ apiKey: "YOUR_API_KEY" }); // free key at https://ip-api.io

// Where is this IP, and is it risky?
const info = await client.lookup("8.8.8.8");
console.log(info.location.country);            // "United States"
console.log(info.suspicious_factors.is_vpn);   // false

const risk = await client.riskScore("8.8.8.8");
console.log(risk.score, risk.risk_level);      // 0 "low"

const email = await client.validateEmail("user@example.com");
console.log(email.reachable, email.disposable); // "yes" false
```

An API key is required — the API rejects keyless requests with `401`. Sign up at
[ip-api.io](https://ip-api.io) for a free key.

## Documentation

Each guide below documents the methods for one capability, with runnable examples and a
link to the matching ip-api.io product page:

- **[IP geolocation & bulk lookup](docs/ip-geolocation.md)** — `lookup`, `lookupBatch`
- **[Email validation & verification](docs/email-validation.md)** — `emailInfo`, `validateEmail`, `validateEmailBatch`
- **[Fraud detection & risk scoring](docs/fraud-risk-scoring.md)** — `riskScore`, `emailRiskScore`, `ipReputation`
- **[VPN, proxy & Tor detection](docs/vpn-proxy-tor.md)** — `torCheck`, `suspicious_factors`
- **[ASN & DNS lookups](docs/asn-and-dns.md)** — `asn`, `whois`, `reverseDns`, `forwardDns`, `mxRecords`
- **[Domain age checker](docs/domain-age.md)** — `domainAge`, `domainAgeBatch`
- **[Errors, rate limits & usage](docs/error-handling.md)** — error types, `rateLimit`, `usageSummary`

## Methods

Every method maps to one ip-api.io endpoint and its product page:

| Method | Endpoint | Product page |
|---|---|---|
| `lookup(ip?)` | `GET /api/v1/ip[/{ip}]` | [IP geolocation](https://ip-api.io/what-is-my-ip) |
| `lookupBatch(ips)` | `POST /api/v1/ip/batch` (≤100 IPs) | [Bulk IP lookup](https://ip-api.io/bulk-ip-lookup) |
| `emailInfo(email)` | `GET /api/v1/email/{email}` | [Email validation](https://ip-api.io/email-validation) |
| `validateEmail(email)` | `GET /api/v1/email/advanced/{email}` | [Advanced email validation](https://ip-api.io/advanced-email-validation) |
| `validateEmailBatch(emails)` | `POST /api/v1/email/advanced/batch` (≤100) | [Email list cleaning](https://ip-api.io/email-list-cleaning) |
| `riskScore(ip?)` | `GET /api/v1/risk-score[/{ip}]` | [Risk score](https://ip-api.io/risk-score) |
| `emailRiskScore(email)` | `GET /api/v1/risk-score/email/{email}` | [Fraud detection](https://ip-api.io/fraud-detection-api) |
| `ipReputation(ip)` | `GET /api/v1/ip-reputation/{ip}` | [IP reputation](https://ip-api.io/ip-reputation) |
| `torCheck(ip)` | `GET /api/v1/tor/{ip}` | [Tor detection](https://ip-api.io/tor-detection) |
| `asn(ip)` | `GET /api/v1/asn/{ip}` | [ASN lookup](https://ip-api.io/asn-lookup) |
| `whois(domain)` | `GET /api/v1/dns/whois/{domain}` | [WHOIS lookup](https://ip-api.io/whois-lookup) |
| `reverseDns(ip)` | `GET /api/v1/dns/reverse/{ip}` | [Reverse DNS](https://ip-api.io/reverse-dns-lookup) |
| `forwardDns(hostname)` | `GET /api/v1/dns/forward/{hostname}` | — |
| `mxRecords(domain)` | `GET /api/v1/dns/mx/{domain}` | [MX record lookup](https://ip-api.io/mx-record-lookup) |
| `domainAge(domain)` | `GET /api/v1/domain/age/{domain}` | [Domain age checker](https://ip-api.io/domain-age-checker) |
| `domainAgeBatch(domains)` | `POST /api/v1/domain/age/batch` | [Domain age checker](https://ip-api.io/domain-age-checker) |
| `rateLimit()` | `GET /api/v1/ratelimit` | — |
| `usageSummary()` | `GET /api/v1/usage/summary` | — |

All responses are fully typed (`IpInfo`, `RiskScore`, `AdvancedEmailValidation`, …) and
exported from the package.

## Error handling

The client throws typed errors and **never retries** — on `429`, `RateLimitError.reset`
tells you when your quota renews:

```ts
import { IpApiClient, RateLimitError, AuthenticationError } from "ip-api-io";

const client = new IpApiClient({ apiKey: "YOUR_API_KEY" });
try {
  await client.lookup("8.8.8.8");
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`limit=${error.limit} remaining=${error.remaining} resetsAt=${error.reset}`);
  } else if (error instanceof AuthenticationError) {
    console.log("invalid API key");
  }
}
```

See [docs/error-handling.md](docs/error-handling.md) for the full error taxonomy.

## Links

- Full tutorial: https://ip-api.io/docs/sdk/javascript
- Website: https://ip-api.io
- API reference: https://ip-api.io/api-docs.html
- OpenAPI spec: https://ip-api.io/openapi.json
- Get a free API key: https://ip-api.io

---

`ip-api-io` is the official client for [ip-api.io](https://ip-api.io).
It is not affiliated with ip-api.com or ipapi.com.
