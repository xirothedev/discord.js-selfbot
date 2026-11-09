/**
 * Represents an error from the Discord API.
 * @extends Error
 */
class DiscordAPIError extends Error {
  method: string;
  path: string;
  code: number;
  httpStatus: number;
  requestData: unknown;
  retries: number;
  captcha: unknown;

  constructor(
    error: Record<string, unknown>,
    status: number,
    request: {
      method: string;
      path: string;
      options?: { data?: unknown; files?: unknown[]; headers?: unknown };
      retries?: number;
    },
  ) {
    super();
    const errMsg = error.message as string | undefined;
    const flattened = (this.constructor as typeof DiscordAPIError)
      .flattenErrors((error.errors ?? error) as unknown)
      .join('\n');
    this.name = 'DiscordAPIError';
    this.message = errMsg && flattened ? `${errMsg}\n${flattened}` : (errMsg ?? flattened);

    /**
     * The HTTP method used for the request
     * @type {string}
     */
    this.method = request.method;

    /**
     * The path of the request relative to the HTTP endpoint
     * @type {string}
     */
    this.path = request.path;

    /**
     * HTTP error code returned by Discord
     * @type {number}
     */
    this.code = error.code as number;

    /**
     * The HTTP status code
     * @type {number}
     */
    this.httpStatus = status;

    /**
     * The data associated with the request that caused this error
     * @type {HTTPErrorData}
     */
    this.requestData = {
      json: request.options?.data,
      files: request.options?.files ?? [],
      headers: request.options?.headers,
    };

    /**
     * The number of times this request has been retried
     * @type {number}
     */
    this.retries = request.retries ?? 0;

    /**
     * @typedef {Object} Captcha
     * @property {Array<string>} captcha_key ['message']
     * @property {string} captcha_sitekey Captcha sitekey (hcaptcha)
     * @property {string} captcha_service hcaptcha
     * @property {string} [captcha_rqdata]
     * @property {string} [captcha_rqtoken]
     */

    /**
     * Captcha response data if the request requires a captcha
     * @type {Captcha | null}
     */
    this.captcha = error?.captcha_service ? error : null;
  }

  /**
   * A special `40333` JSON error code is returned if your request is blocked by Cloudflare.
   * This may be due to a malformed request or improper user agent.
   * The response resembles a normal error structure:
   * @type {boolean}
   * @example
   * {
   *  "message": "internal network error",
   *  "code": 40333
   * }
   */
  get isBlockedByCloudflare(): boolean {
    return this.code === 40333;
  }

  /**
   * Flattens an errors object returned from the API into an array.
   * @param {APIError} obj Discord errors object
   * @param {string} [key] Used internally to determine key names of nested fields
   * @returns {string[]}
   * @private
   */
  static flattenErrors(obj: unknown, key = ''): string[] {
    let messages: string[] = [];

    for (const [k, v] of Object.entries((obj ?? {}) as Record<string, unknown>)) {
      if (k === 'message') continue;
      const newKey = key ? (isNaN(Number(k)) ? `${key}.${k}` : `${key}[${k}]`) : k;

      const vo = v as Record<string, unknown> | null;
      if (vo && Array.isArray(vo._errors)) {
        messages.push(`${newKey}: ${(vo._errors as Array<{ message: string }>).map(e => e.message).join(' ')}`);
      } else if (vo && (vo.code ?? vo.message)) {
        messages.push(`${vo.code ? `${vo.code}: ` : ''}${vo.message}`.trim());
      } else if (typeof v === 'string') {
        messages.push(v);
      } else {
        messages = messages.concat(this.flattenErrors(v, newKey));
      }
    }

    return messages;
  }
}

export default DiscordAPIError;
export { DiscordAPIError };

/**
 * @external APIError
 * @see {@link https://discord.com/developers/docs/reference#error-messages}
 */
