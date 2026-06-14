# IP geolocation & bulk lookup

Turn any IP address into geolocation, network and threat intelligence. A single
`lookup` returns the country, city, coordinates, timezone, ISP and ASN of an IP,
plus the `suspicious_factors` flags used for fraud screening (proxy, VPN, Tor,
datacenter, spam, crawler, threat).

Powers the [IP geolocation API](https://ip-api.io/what-is-my-ip) and the
[bulk IP lookup](https://ip-api.io/bulk-ip-lookup) product.

## `lookup(ip?)` — geolocate one IP

Pass an IPv4/IPv6 address, or omit the argument to geolocate the caller's own IP.

```ts
import { IpApiClient } from "ip-api-io";

const client = new IpApiClient({ apiKey: "YOUR_API_KEY" });

const info = await client.lookup("8.8.8.8");

console.log(info.ip);                          // "8.8.8.8"
console.log(info.isp);                         // "Google LLC"
console.log(info.location.country);            // "United States"
console.log(info.location.city);               // "Mountain View"
console.log(info.location.latitude, info.location.longitude);
console.log(info.location.timezone);           // "America/Los_Angeles"
console.log(info.suspicious_factors.is_datacenter); // true
```

```ts
// Geolocate the machine making the request
const me = await client.lookup();
console.log(me.ip, me.location.country);
```

### Response (`IpInfo`)

| Field | Type | Description |
|---|---|---|
| `ip` | `string` | The looked-up address |
| `isp` | `string \| null` | Internet service provider |
| `asn` | `string \| null` | Autonomous system the IP belongs to |
| `location` | `IpLocation` | `country`, `country_code`, `city`, `latitude`, `longitude`, `zip`, `timezone`, `local_time`, `local_time_unix`, `is_daylight_savings` |
| `suspicious_factors` | `SuspiciousFactors` | `is_proxy`, `is_vpn`, `is_tor_node`, `is_datacenter`, `is_spam`, `is_crawler`, `is_threat` |

> The `suspicious_factors` block is the fastest way to flag risky traffic in one call.
> For a single 0–100 score, see [Fraud detection & risk scoring](fraud-risk-scoring.md);
> for the individual checks, see [VPN, proxy & Tor detection](vpn-proxy-tor.md).

## `lookupBatch(ips)` — geolocate up to 100 IPs

Look up to 100 addresses in one request — ideal for enriching logs, sign-up events or
historical data without a round trip per IP. Throws `RangeError` if the array is empty
or longer than 100.

```ts
const batch = await client.lookupBatch(["8.8.8.8", "1.1.1.1", "9.9.9.9"]);

console.log(batch.total_processed);     // 3
console.log(batch.successful_lookups);  // 3
console.log(batch.failed_lookups);      // 0

for (const [ip, info] of Object.entries(batch.results)) {
  console.log(ip, info.location.country, info.suspicious_factors.is_vpn);
}
```

### Response (`BatchIpLookupResponse`)

| Field | Type | Description |
|---|---|---|
| `results` | `Record<string, IpInfo>` | Map of IP → `IpInfo` |
| `total_processed` | `number` | IPs received |
| `successful_lookups` | `number` | IPs resolved |
| `failed_lookups` | `number` | IPs that could not be resolved |

## See also

- [Fraud detection & risk scoring](fraud-risk-scoring.md) — turn the flags into a score
- [VPN, proxy & Tor detection](vpn-proxy-tor.md) — the individual threat checks
- [ASN & DNS lookups](asn-and-dns.md) — network ownership for an IP
- Product pages: [IP geolocation](https://ip-api.io/what-is-my-ip) · [Bulk IP lookup](https://ip-api.io/bulk-ip-lookup)
