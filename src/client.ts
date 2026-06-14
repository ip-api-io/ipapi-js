import {
  AuthenticationError,
  InvalidRequestError,
  IpApiError,
  RateLimitError,
  ServerError,
} from "./errors";
import type {
  AdvancedEmailValidation,
  AsnLookup,
  BatchDomainAgeResponse,
  BatchEmailValidationResponse,
  BatchIpLookupResponse,
  DomainAge,
  EmailInfo,
  ForwardDns,
  IpInfo,
  MxLookup,
  RateLimitInfo,
  ReverseDns,
  RiskScore,
  TorDetection,
  UsageSummary,
  Whois,
} from "./types";
import { USER_AGENT } from "./version";

export const MAX_BATCH_SIZE = 100;

export interface IpApiClientOptions {
  /** API key — get a free key at https://ip-api.io. Sent as the `api_key` query parameter. */
  apiKey?: string;
  /** API origin, override for testing. Default: https://ip-api.io */
  baseUrl?: string;
  /** Per-request timeout in milliseconds. Default: 10000 */
  timeoutMs?: number;
}

/** Client for the ip-api.io IP intelligence and email validation API. */
export class IpApiClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(options: IpApiClientOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "https://ip-api.io").replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  // -- IP intelligence --------------------------------------------------

  /** Geolocation + threat intelligence for an IP (or the caller's IP when omitted). */
  lookup(ip?: string): Promise<IpInfo> {
    return this.request("GET", ip ? `/api/v1/ip/${encodeURIComponent(ip)}` : "/api/v1/ip");
  }

  /** Look up to 100 IP addresses in a single request. */
  lookupBatch(ips: string[]): Promise<BatchIpLookupResponse> {
    checkBatch(ips, "ips");
    return this.request("POST", "/api/v1/ip/batch", { ips });
  }

  ipReputation(ip: string): Promise<Record<string, unknown>> {
    return this.request("GET", `/api/v1/ip-reputation/${encodeURIComponent(ip)}`);
  }

  torCheck(ip: string): Promise<TorDetection> {
    return this.request("GET", `/api/v1/tor/${encodeURIComponent(ip)}`);
  }

  asn(ip: string): Promise<AsnLookup> {
    return this.request("GET", `/api/v1/asn/${encodeURIComponent(ip)}`);
  }

  // -- Email validation ---------------------------------------------------

  /** Syntax, disposability and MX analysis of an email address. */
  emailInfo(email: string): Promise<EmailInfo> {
    return this.request("GET", `/api/v1/email/${encodeURIComponent(email)}`);
  }

  /** Advanced validation including SMTP deliverability checks. */
  validateEmail(email: string): Promise<AdvancedEmailValidation> {
    return this.request("GET", `/api/v1/email/advanced/${encodeURIComponent(email)}`);
  }

  /** Advanced-validate up to 100 email addresses in a single request. */
  validateEmailBatch(emails: string[]): Promise<BatchEmailValidationResponse> {
    checkBatch(emails, "emails");
    return this.request("POST", "/api/v1/email/advanced/batch", { emails });
  }

  // -- Risk scoring -----------------------------------------------------

  /** Fraud risk score for an IP (or the caller's IP when omitted). */
  riskScore(ip?: string): Promise<RiskScore> {
    return this.request(
      "GET",
      ip ? `/api/v1/risk-score/${encodeURIComponent(ip)}` : "/api/v1/risk-score",
    );
  }

  emailRiskScore(email: string): Promise<RiskScore> {
    return this.request("GET", `/api/v1/risk-score/email/${encodeURIComponent(email)}`);
  }

  // -- DNS & domains ------------------------------------------------------

  whois(domain: string): Promise<Whois> {
    return this.request("GET", `/api/v1/dns/whois/${encodeURIComponent(domain)}`);
  }

  reverseDns(ip: string): Promise<ReverseDns> {
    return this.request("GET", `/api/v1/dns/reverse/${encodeURIComponent(ip)}`);
  }

  forwardDns(hostname: string): Promise<ForwardDns> {
    return this.request("GET", `/api/v1/dns/forward/${encodeURIComponent(hostname)}`);
  }

  mxRecords(domain: string): Promise<MxLookup> {
    return this.request("GET", `/api/v1/dns/mx/${encodeURIComponent(domain)}`);
  }

  domainAge(domain: string): Promise<DomainAge> {
    return this.request("GET", `/api/v1/domain/age/${encodeURIComponent(domain)}`);
  }

  domainAgeBatch(domains: string[]): Promise<BatchDomainAgeResponse> {
    if (domains.length === 0) throw new RangeError("domains must not be empty");
    return this.request("POST", "/api/v1/domain/age/batch", { domains });
  }

  // -- Account ------------------------------------------------------------

  rateLimit(): Promise<RateLimitInfo> {
    return this.request("GET", "/api/v1/ratelimit");
  }

  usageSummary(): Promise<UsageSummary> {
    return this.request("GET", "/api/v1/usage/summary");
  }

  // -- Internals ------------------------------------------------------------

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let url = this.baseUrl + path;
    if (this.apiKey) {
      url += `?api_key=${encodeURIComponent(this.apiKey)}`;
    }
    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    };
    const init: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeoutMs),
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    const response = await fetch(url, init);
    if (!response.ok) {
      throw await errorFrom(response);
    }
    return (await response.json()) as T;
  }
}

function checkBatch(items: string[], name: string): void {
  if (items.length === 0) throw new RangeError(`${name} must not be empty`);
  if (items.length > MAX_BATCH_SIZE) {
    throw new RangeError(`${name} must contain at most ${MAX_BATCH_SIZE} items`);
  }
}

function headerInt(response: Response, name: string): number | undefined {
  const value = response.headers.get(name);
  if (value === null) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

async function errorFrom(response: Response): Promise<IpApiError> {
  const status = response.status;
  let bodyText = "";
  try {
    bodyText = await response.text();
  } catch {
    // keep empty body
  }
  let message = "";
  try {
    const parsed: unknown = JSON.parse(bodyText);
    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      message = String(record.message ?? record.error ?? "");
    }
  } catch {
    message = bodyText.trim().slice(0, 200);
  }
  if (!message) message = `HTTP ${status} from ip-api.io`;

  if (status === 401 || status === 403) {
    return new AuthenticationError(message, status, bodyText);
  }
  if (status === 429) {
    return new RateLimitError(
      message,
      status,
      bodyText,
      headerInt(response, "x-ratelimit-limit"),
      headerInt(response, "x-ratelimit-remaining"),
      headerInt(response, "x-ratelimit-reset"),
    );
  }
  if (status === 400 || status === 404 || status === 422) {
    return new InvalidRequestError(message, status, bodyText);
  }
  if (status >= 500) {
    return new ServerError(message, status, bodyText);
  }
  return new IpApiError(message, status, bodyText);
}
