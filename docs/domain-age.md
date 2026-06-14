# Domain age checker

Newly registered domains are a strong fraud and spam signal. `domainAge` returns how
long ago a domain was registered, derived from WHOIS data, so you can flag or block
domains created days ago.

Powers the [domain age checker](https://ip-api.io/domain-age-checker).

## `domainAge(domain)` — age of one domain

```ts
import { IpApiClient } from "ip-api-io";

const client = new IpApiClient({ apiKey: "YOUR_API_KEY" });

const age = await client.domainAge("example.com");

console.log(age.is_valid);           // true
console.log(age.registration_date);  // "1995-08-14"
console.log(age.age_in_years);       // 30
console.log(age.age_in_days);        // 11000+

if ((age.age_in_days ?? Infinity) < 30) {
  // treat brand-new domains as higher risk
}
```

### Response (`DomainAge`)

| Field | Type | Description |
|---|---|---|
| `domain` | `string` | The domain checked |
| `is_valid` | `boolean` | Whether age could be determined |
| `registration_date` | `string \| null` | First registration date |
| `age_in_years` | `number \| null` | Age in whole years |
| `age_in_days` | `number \| null` | Age in days |
| `error` | `string \| null` | Reason when `is_valid` is false |

## `domainAgeBatch(domains)` — many domains at once

Check a list of domains in one request (non-empty; throws `RangeError` if empty).

```ts
const batch = await client.domainAgeBatch([
  "example.com",
  "brand-new-domain.xyz",
]);

for (const [domain, age] of Object.entries(batch.results)) {
  console.log(domain, age.age_in_days);
}
```

### Response (`BatchDomainAgeResponse`)
`results` — a `Record<string, DomainAge>` mapping each domain to its `DomainAge`.

## See also

- [ASN & DNS lookups](asn-and-dns.md) — `whois` for the full registration record
- [Fraud detection & risk scoring](fraud-risk-scoring.md) — combine age with other signals
- Product page: [Domain age checker](https://ip-api.io/domain-age-checker)
