// Live smoke test against https://ip-api.io.
// Usage: npm run build && IPAPI_API_KEY=... node examples/smoke.mjs
// The API requires a key; without IPAPI_API_KEY this script skips.
import { IpApiClient } from "../dist/index.js";

const apiKey = process.env.IPAPI_API_KEY;
if (!apiKey) {
  console.log("SKIPPED: set IPAPI_API_KEY to run the live smoke test");
  process.exit(0);
}

const client = new IpApiClient({ apiKey });

const info = await client.lookup("8.8.8.8");
if (info.ip !== "8.8.8.8") throw new Error(`unexpected response: ${JSON.stringify(info)}`);
console.log(`lookup(8.8.8.8): ${info.location.country} / ${info.asn}`);

const rl = await client.rateLimit();
console.log(`rate_limit: plan=${rl.plan_id} ip_api remaining=${rl.ip_api.remaining}`);

console.log("smoke OK");
