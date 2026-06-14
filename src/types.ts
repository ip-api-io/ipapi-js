/** Response types mirroring the schemas in https://ip-api.io/openapi.json. */

export interface SuspiciousFactors {
  is_proxy: boolean;
  is_tor_node: boolean;
  is_spam: boolean;
  is_crawler: boolean;
  is_datacenter: boolean;
  is_vpn: boolean;
  is_threat: boolean;
}

export interface IpLocation {
  country: string | null;
  country_code: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  zip: string | null;
  timezone: string | null;
  local_time: string | null;
  local_time_unix: number | null;
  is_daylight_savings: boolean | null;
}

export interface IpInfo {
  ip: string;
  isp?: string | null;
  asn?: string | null;
  suspicious_factors: SuspiciousFactors;
  location: IpLocation;
}

export interface BatchIpLookupResponse {
  results: Record<string, IpInfo>;
  total_processed: number;
  successful_lookups: number;
  failed_lookups: number;
}

export interface MxRecord {
  priority: number;
  hostname: string;
  ttl: number;
}

export interface EmailSyntax {
  domain?: string | null;
  username?: string | null;
  is_valid: boolean;
  error_reasons: string[];
}

export interface EmailInfo {
  email: string;
  is_disposable: boolean;
  has_mx_records: boolean;
  mx_records: MxRecord[];
  syntax: EmailSyntax;
}

export interface AdvancedSyntax {
  username: string;
  domain: string;
  valid: boolean;
}

export interface AdvancedSmtp {
  host_exists: boolean;
  full_inbox: boolean;
  catch_all: boolean;
  deliverable: boolean;
  disabled: boolean;
}

export interface AdvancedGravatar {
  has_gravatar: boolean;
  gravatar_url: string;
}

export interface AdvancedEmailValidation {
  email: string;
  reachable: string;
  syntax: AdvancedSyntax;
  smtp?: AdvancedSmtp | null;
  gravatar?: AdvancedGravatar | null;
  suggestion?: string;
  disposable: boolean;
  role_account: boolean;
  free: boolean;
  has_mx_records: boolean;
}

export interface BatchEmailValidationResponse {
  results: Record<string, AdvancedEmailValidation>;
  totalProcessed: number;
  successfulValidations: number;
  failedValidations: number;
}

export interface IpFactors {
  is_proxy: boolean;
  is_tor_node: boolean;
  is_spam: boolean;
  is_vpn: boolean;
  is_datacenter: boolean;
  risk_contribution: number;
}

export interface EmailFactors {
  is_disposable: boolean;
  is_valid_syntax: boolean;
  risk_contribution: number;
}

export interface RiskScoreFactors {
  ip_factors?: IpFactors | null;
  email_factors?: EmailFactors | null;
}

export interface RiskScore {
  score: number;
  risk_level: string;
  ip?: string | null;
  email?: string | null;
  factors: RiskScoreFactors;
}

export interface TorDetection {
  ip: string;
  is_tor: boolean;
  tor_node_count: number;
}

export interface AsnLookup {
  ip: string;
  asn?: number | null;
  organization?: string | null;
  network?: string | null;
  is_datacenter: boolean;
  country?: string | null;
  country_code?: string | null;
}

export interface DomainAge {
  domain: string;
  is_valid: boolean;
  registration_date?: string | null;
  age_in_years?: number | null;
  age_in_days?: number | null;
  error?: string | null;
}

export interface BatchDomainAgeResponse {
  results: Record<string, DomainAge>;
}

export interface WhoisRegistrar {
  name?: string | null;
  url?: string | null;
  iana_id?: string | null;
}

export interface WhoisStatus {
  code: string;
  humanized: string;
}

export interface Whois {
  domain: string;
  registrar?: WhoisRegistrar | null;
  registered_on?: string | null;
  expires_on?: string | null;
  updated_on?: string | null;
  name_servers: string[];
  status: WhoisStatus[];
  raw: string;
  error?: string | null;
}

export interface ReverseDns {
  ip: string;
  hostname?: string | null;
  ptr_record?: string | null;
  ttl?: number | null;
}

export interface ForwardLookupRecord {
  type: string;
  address: string;
  ttl: number;
}

export interface ForwardDns {
  hostname: string;
  addresses: ForwardLookupRecord[];
}

export interface MxLookup {
  domain: string;
  mx_records: MxRecord[];
}

export interface ApiLimitInfo {
  limit: number;
  remaining: number;
  used: number;
  usage_percent: number;
}

export interface RateLimitInfo {
  plan_id: string;
  plan_name?: string | null;
  ip_api: ApiLimitInfo;
  email_api: ApiLimitInfo;
  interval_seconds: number;
  next_renewal_date?: string | null;
  status?: string | null;
}

export interface UsageSummary {
  apiKey: string;
  apiType: string;
  periodStart: string;
  periodEnd: string;
  totalRequests: number;
  successfulRequests: number;
  rateLimitedRequests: number;
  quotaConsumed: number;
  batchOperations: number;
  avgRequestDurationMs?: number | null;
}
