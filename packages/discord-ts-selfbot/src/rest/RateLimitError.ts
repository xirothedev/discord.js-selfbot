class RateLimitError extends Error {
  timeout: number;
  retryAfter: number;
  method: string;
  path: string;
  route: string;
  global: boolean;
  limit: number;
  remaining?: number;
  reset?: number;
  scope: 'global' | 'route' | 'sublimit';

  constructor({
    timeout,
    retryAfter,
    limit,
    method,
    path,
    route,
    global,
    remaining,
    reset,
    scope,
  }: {
    timeout: number;
    retryAfter?: number;
    limit: number;
    method: string;
    path: string;
    route: string;
    global: boolean;
    remaining?: number;
    reset?: number;
    scope?: 'global' | 'route' | 'sublimit';
  }) {
    super(`A ${global ? 'global ' : ''}rate limit was hit on route ${route}`);

    this.name = 'RateLimitError';

    this.timeout = timeout;
    this.retryAfter = retryAfter ?? timeout;

    this.method = method;

    this.path = path;

    this.route = route;

    this.global = global;

    this.limit = limit;
    this.remaining = remaining;
    this.reset = reset;
    this.scope = scope ?? (global ? 'global' : 'route');
  }
}

export default RateLimitError;
export { RateLimitError };
