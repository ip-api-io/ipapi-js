/** Base error for all ip-api.io client failures. */
export class IpApiError extends Error {
  readonly statusCode?: number;
  readonly body?: string;

  constructor(message: string, statusCode?: number, body?: string) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.body = body;
  }
}

/** HTTP 401/403 — missing or invalid API key. */
export class AuthenticationError extends IpApiError {}

/**
 * HTTP 429 — quota exhausted. Exposes the x-ratelimit-* response headers;
 * `reset` is the unix timestamp when the quota renews. The client never retries.
 */
export class RateLimitError extends IpApiError {
  readonly limit?: number;
  readonly remaining?: number;
  readonly reset?: number;

  constructor(
    message: string,
    statusCode: number,
    body: string | undefined,
    limit?: number,
    remaining?: number,
    reset?: number,
  ) {
    super(message, statusCode, body);
    this.limit = limit;
    this.remaining = remaining;
    this.reset = reset;
  }
}

/** HTTP 400/404/422 — malformed input or unknown resource. */
export class InvalidRequestError extends IpApiError {}

/** HTTP 5xx — ip-api.io server-side failure. */
export class ServerError extends IpApiError {}
