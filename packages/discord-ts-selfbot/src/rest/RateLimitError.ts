class RateLimitError extends Error {
  timeout: number;
  method: string;
  path: string;
  route: string;
  global: boolean;
  limit: number;

  constructor({
    timeout,
    limit,
    method,
    path,
    route,
    global,
  }: {
    timeout: number;
    limit: number;
    method: string;
    path: string;
    route: string;
    global: boolean;
  }) {
    super(`A ${global ? 'global ' : ''}rate limit was hit on route ${route}`);

    this.name = 'RateLimitError';

    this.timeout = timeout;

    this.method = method;

    this.path = path;

    this.route = route;

    this.global = global;

    this.limit = limit;
  }
}

export default RateLimitError;
export { RateLimitError };
