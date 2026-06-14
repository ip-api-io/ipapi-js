# Email validation & verification

Check whether an email address is real, deliverable and safe to accept — before it
ever enters your database. The SDK exposes three levels: a fast syntax/MX/disposable
check, full SMTP verification, and a batch endpoint for cleaning whole lists.

Powers [email validation](https://ip-api.io/email-validation),
[advanced email validation](https://ip-api.io/advanced-email-validation),
[email verification](https://ip-api.io/email-verification-api),
[disposable email detection](https://ip-api.io/disposable-email-checker) and
[email list cleaning](https://ip-api.io/email-list-cleaning).

## `emailInfo(email)` — fast syntax, MX & disposable check

A lightweight check (no SMTP probe): validates syntax, confirms the domain has MX
records, and flags disposable/throwaway providers. Use it inline on sign-up forms.

```ts
import { IpApiClient } from "ip-api-io";

const client = new IpApiClient({ apiKey: "YOUR_API_KEY" });

const info = await client.emailInfo("user@example.com");

console.log(info.syntax.is_valid);    // true
console.log(info.is_disposable);      // false
console.log(info.has_mx_records);     // true
console.log(info.mx_records[0]?.hostname);
```

### Response (`EmailInfo`)

| Field | Type | Description |
|---|---|---|
| `email` | `string` | The address checked |
| `is_disposable` | `boolean` | Throwaway / temporary provider |
| `has_mx_records` | `boolean` | Domain can receive mail |
| `mx_records` | `MxRecord[]` | `priority`, `hostname`, `ttl` |
| `syntax` | `EmailSyntax` | `is_valid`, `domain`, `username`, `error_reasons` |

## `validateEmail(email)` — full SMTP deliverability

Advanced verification that connects to the mail server to confirm the mailbox is
deliverable, and adds role-account, free-provider, catch-all and Gravatar signals.
Use it before sending important mail or accepting a paying customer.

```ts
const result = await client.validateEmail("user@example.com");

console.log(result.reachable);          // "yes" | "no" | "unknown"
console.log(result.smtp?.deliverable);  // true
console.log(result.smtp?.catch_all);    // false
console.log(result.disposable);         // false
console.log(result.role_account);       // false  (e.g. info@, support@)
console.log(result.free);               // false  (e.g. gmail.com)
console.log(result.suggestion);         // typo fix, e.g. "user@gmail.com"
```

### Response (`AdvancedEmailValidation`)

| Field | Type | Description |
|---|---|---|
| `email` | `string` | The address checked |
| `reachable` | `string` | `"yes"`, `"no"` or `"unknown"` |
| `syntax` | `AdvancedSyntax` | `username`, `domain`, `valid` |
| `smtp` | `AdvancedSmtp \| null` | `host_exists`, `deliverable`, `full_inbox`, `catch_all`, `disabled` |
| `gravatar` | `AdvancedGravatar \| null` | `has_gravatar`, `gravatar_url` |
| `suggestion` | `string?` | Suggested correction for a likely typo |
| `disposable` | `boolean` | Throwaway provider |
| `role_account` | `boolean` | Role address (info@, sales@, …) |
| `free` | `boolean` | Free webmail provider |
| `has_mx_records` | `boolean` | Domain can receive mail |

## `validateEmailBatch(emails)` — clean a list (≤100)

Advanced-validate up to 100 addresses in one request — the building block for
[email list cleaning](https://ip-api.io/email-list-cleaning). Throws `RangeError`
if the array is empty or longer than 100.

```ts
const batch = await client.validateEmailBatch([
  "user@example.com",
  "fake@mailinator.com",
  "info@example.org",
]);

console.log(batch.totalProcessed);          // 3
console.log(batch.successfulValidations);   // 3

for (const [email, result] of Object.entries(batch.results)) {
  console.log(email, result.reachable, result.disposable);
}
```

### Response (`BatchEmailValidationResponse`)

| Field | Type | Description |
|---|---|---|
| `results` | `Record<string, AdvancedEmailValidation>` | Map of email → result |
| `totalProcessed` | `number` | Emails received |
| `successfulValidations` | `number` | Emails validated |
| `failedValidations` | `number` | Emails that errored |

## See also

- [Fraud detection & risk scoring](fraud-risk-scoring.md) — `emailRiskScore` for a 0–100 score
- [ASN & DNS lookups](asn-and-dns.md) — `mxRecords` to inspect a domain's mail servers
- Product pages: [Email validation](https://ip-api.io/email-validation) · [Advanced validation](https://ip-api.io/advanced-email-validation) · [Email verification API](https://ip-api.io/email-verification-api) · [Disposable email checker](https://ip-api.io/disposable-email-checker) · [Email list cleaning](https://ip-api.io/email-list-cleaning)
