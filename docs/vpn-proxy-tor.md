# VPN, proxy & Tor detection

Catch traffic that hides behind anonymizers. Every `lookup` already returns the
`suspicious_factors` flags for proxy, VPN, Tor, datacenter, spam and crawler; the
dedicated `torCheck` adds live Tor exit-node confirmation.

Powers [VPN detection](https://ip-api.io/vpn-detection-api),
[proxy detection](https://ip-api.io/proxy-detection-api) and
[Tor detection](https://ip-api.io/tor-detection).

## `suspicious_factors` — flags on every lookup

No extra call needed: read the flags from a normal [`lookup`](ip-geolocation.md).

```ts
import { IpApiClient } from "ip-api-io";

const client = new IpApiClient({ apiKey: "YOUR_API_KEY" });

const info = await client.lookup("185.220.101.1");
const f = info.suspicious_factors;

console.log(f.is_vpn);         // VPN service
console.log(f.is_proxy);       // open / anonymizing proxy
console.log(f.is_tor_node);    // Tor node
console.log(f.is_datacenter);  // hosting / datacenter IP (often a bot)
console.log(f.is_spam);        // known spam source
console.log(f.is_crawler);     // known crawler / bot
console.log(f.is_threat);      // listed on a threat feed

if (f.is_vpn || f.is_proxy || f.is_tor_node) {
  // require step-up verification
}
```

### `SuspiciousFactors`

| Field | Type | Meaning |
|---|---|---|
| `is_proxy` | `boolean` | Open or anonymizing proxy |
| `is_vpn` | `boolean` | Commercial VPN endpoint |
| `is_tor_node` | `boolean` | Part of the Tor network |
| `is_datacenter` | `boolean` | Hosting / datacenter range |
| `is_spam` | `boolean` | Known spam source |
| `is_crawler` | `boolean` | Known crawler / bot |
| `is_threat` | `boolean` | Listed on a threat feed |

## `torCheck(ip)` — confirm a Tor exit node

A dedicated check against the live Tor node list, with a count of matching nodes.

```ts
const tor = await client.torCheck("185.220.101.1");

console.log(tor.is_tor);          // true
console.log(tor.tor_node_count);  // number of matching Tor nodes
```

### Response (`TorDetection`)

| Field | Type | Description |
|---|---|---|
| `ip` | `string` | The checked IP |
| `is_tor` | `boolean` | Whether the IP is a Tor node |
| `tor_node_count` | `number` | Matching nodes for the IP |

> Want one number instead of individual flags? See
> [Fraud detection & risk scoring](fraud-risk-scoring.md) — `riskScore` folds all of
> these signals into a 0–100 score.

## See also

- [IP geolocation & bulk lookup](ip-geolocation.md) — where `suspicious_factors` comes from
- [Fraud detection & risk scoring](fraud-risk-scoring.md) — combine the flags into a score
- Product pages: [VPN detection](https://ip-api.io/vpn-detection-api) · [Proxy detection](https://ip-api.io/proxy-detection-api) · [Tor detection](https://ip-api.io/tor-detection)
- [Full tutorial on ip-api.io](https://ip-api.io/docs/sdk/javascript/vpn-proxy-tor)
