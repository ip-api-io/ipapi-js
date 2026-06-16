# ASN & DNS lookups

Resolve the network and DNS layer behind an IP or domain: which autonomous system
owns an address, who registered a domain, what a host's PTR record is, and which mail
servers a domain uses.

Powers [ASN lookup](https://ip-api.io/asn-lookup),
[WHOIS lookup](https://ip-api.io/whois-lookup),
[reverse DNS](https://ip-api.io/reverse-dns-lookup) and
[MX record lookup](https://ip-api.io/mx-record-lookup).

## `asn(ip)` — autonomous system for an IP

Returns the ASN, owning organization, network range and country for an IP — and
whether it belongs to a datacenter.

```ts
import { IpApiClient } from "ip-api-io";

const client = new IpApiClient({ apiKey: "YOUR_API_KEY" });

const asn = await client.asn("8.8.8.8");

console.log(asn.asn);            // 15169
console.log(asn.organization);  // "Google LLC"
console.log(asn.network);       // "8.8.8.0/24"
console.log(asn.is_datacenter); // true
console.log(asn.country_code);  // "US"
```

### Response (`AsnLookup`)
`ip`, `asn`, `organization`, `network`, `is_datacenter`, `country`, `country_code`.

## `whois(domain)` — domain registration

WHOIS record for a domain: registrar, registration/expiry/update dates, name servers,
status codes and the raw WHOIS text.

```ts
const whois = await client.whois("example.com");

console.log(whois.registrar?.name);   // "RESERVED-Internet Assigned Numbers Authority"
console.log(whois.registered_on);     // "1995-08-14"
console.log(whois.expires_on);
console.log(whois.name_servers);      // ["a.iana-servers.net", ...]
console.log(whois.status[0]?.humanized);
```

### Response (`Whois`)
`domain`, `registrar` (`name`, `url`, `iana_id`), `registered_on`, `expires_on`,
`updated_on`, `name_servers`, `status` (`code`, `humanized`), `raw`, `error`.

## `reverseDns(ip)` — PTR record for an IP

```ts
const rdns = await client.reverseDns("8.8.8.8");

console.log(rdns.hostname);    // "dns.google"
console.log(rdns.ptr_record);
console.log(rdns.ttl);
```

### Response (`ReverseDns`)
`ip`, `hostname`, `ptr_record`, `ttl`.

## `forwardDns(hostname)` — resolve a hostname to addresses

```ts
const fdns = await client.forwardDns("dns.google");

for (const record of fdns.addresses) {
  console.log(record.type, record.address, record.ttl); // "A" "8.8.8.8" 300
}
```

### Response (`ForwardDns`)
`hostname`, `addresses` (each `type`, `address`, `ttl`).

## `mxRecords(domain)` — mail servers for a domain

```ts
const mx = await client.mxRecords("example.com");

for (const record of mx.mx_records) {
  console.log(record.priority, record.hostname, record.ttl);
}
```

### Response (`MxLookup`)
`domain`, `mx_records` (each `priority`, `hostname`, `ttl`).

## See also

- [IP geolocation & bulk lookup](ip-geolocation.md) — geolocation for the same IP
- [Email validation & verification](email-validation.md) — MX records feed deliverability
- [Domain age checker](domain-age.md) — registration age from WHOIS data
- Product pages: [ASN lookup](https://ip-api.io/asn-lookup) · [WHOIS lookup](https://ip-api.io/whois-lookup) · [Reverse DNS](https://ip-api.io/reverse-dns-lookup) · [MX record lookup](https://ip-api.io/mx-record-lookup)
- [Full tutorial on ip-api.io](https://ip-api.io/docs/sdk/javascript/asn-dns)
