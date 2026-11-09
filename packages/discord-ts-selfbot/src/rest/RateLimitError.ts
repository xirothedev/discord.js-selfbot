/**
 * Represents a RateLimit error from a request.
 * @extends Error
 */
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

    /**
     * The name of the error
     * @type {string}
     */
    this.name = 'RateLimitError';

    /**
     * Time until this rate limit ends, in milliseconds
     * @type {number}
     */
    this.timeout = timeout;

    /**
     * The HTTP method used for the request
     * @type {string}
     */
    this.method = method;

    /**
     * The path of the request relative to the HTTP endpoint
     * @type {string}
     */
    this.path = path;

    /**
     * The route of the request relative to the HTTP endpoint
     * @type {string}
     */
    this.route = route;

    /**
     * Whether this rate limit is global
     * @type {boolean}
     */
    this.global = global;

    /**
     * The maximum amount of requests of this endpoint
     * @type {number}
     */
    this.limit = limit;
  }
}

export default RateLimitError;
export { RateLimitError };
