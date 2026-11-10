import { setTimeout } from 'node:timers';
import { AsyncQueue } from '@sapphire/async-queue';
import DiscordAPIError from './DiscordAPIError';
import APIRequest from './APIRequest';
import HTTPError from './HTTPError';
import RateLimitError from './RateLimitError';
import Constants from '../util/Constants';
import type { Captcha } from '../../typings';
const { Events } = Constants;
const { DEBUG, RATE_LIMIT, INVALID_REQUEST_WARNING, API_RESPONSE, API_REQUEST } = Events;

const captchaMessage = [
  'incorrect-captcha',
  'response-already-used',
  'captcha-required',
  'invalid-input-response',
  'invalid-response',
  'You need to update your app',
  'response-already-used-error',
  'rqkey-mismatch',
  'sitekey-secret-mismatch',
];

function parseResponse(res: unknown): Promise<Record<string, unknown>> {
  const r = res as {
    headers: { get: (k: string) => string | null };
    json: () => Promise<unknown>;
    arrayBuffer: () => Promise<unknown>;
  };
  if (r.headers.get('content-type')?.startsWith('application/json'))
    return r.json() as Promise<Record<string, unknown>>;
  return r.arrayBuffer() as Promise<Record<string, unknown>>;
}

function getAPIOffset(serverDate: unknown): number {
  return new Date(serverDate as string | number | Date).getTime() - Date.now();
}

function readCaptcha(data: Record<string, unknown>): Captcha | null {
  const key = data.captcha_key;
  const sitekey = data.captcha_sitekey;
  if (data.captcha_service !== 'hcaptcha' || !Array.isArray(key) || typeof sitekey !== 'string') return null;
  return {
    captcha_key: key.filter((value): value is string => typeof value === 'string'),
    captcha_sitekey: sitekey,
    captcha_service: 'hcaptcha',
    captcha_rqdata: typeof data.captcha_rqdata === 'string' ? data.captcha_rqdata : undefined,
    captcha_rqtoken: typeof data.captcha_rqtoken === 'string' ? data.captcha_rqtoken : undefined,
  };
}

function calculateReset(reset: unknown, resetAfter: unknown, serverDate: unknown): number {
  // Use direct reset time when available, server date becomes irrelevant in this case
  if (resetAfter) {
    return Date.now() + Number(resetAfter) * 1_000;
  }
  return new Date(Number(reset) * 1_000).getTime() - getAPIOffset(serverDate);
}

/* Invalid request limiting is done on a per-IP basis, not a per-token basis.
 * The best we can do is track invalid counts process-wide (on the theory that
 * users could have multiple bots run from one process) rather than per-bot.
 * Therefore, store these at file scope here rather than in the client's
 * RESTManager object.
 */
let invalidCount = 0;
let invalidCountResetTime: number | null = null;

class RequestHandler {
  manager: import('./RESTManager').default;
  queue!: import('@sapphire/async-queue').AsyncQueue;
  globalDelay: Promise<void> | null = null;
  reset: number;
  remaining: number;
  limit: number;

  constructor(manager: import('./RESTManager').default) {
    this.manager = manager;
    this.queue = new AsyncQueue();
    this.reset = -1;
    this.remaining = -1;
    this.limit = -1;
  }

  async push(request: APIRequest): Promise<unknown> {
    await this.queue.wait();
    try {
      return await this.execute(request);
    } finally {
      this.queue.shift();
    }
  }

  get globalLimited(): boolean {
    return this.manager.globalRemaining <= 0 && Date.now() < (this.manager.globalReset ?? 0);
  }

  get localLimited(): boolean {
    return this.remaining <= 0 && Date.now() < this.reset;
  }

  get limited(): boolean {
    return this.globalLimited || this.localLimited;
  }

  get _inactive(): boolean {
    return this.queue.remaining === 0 && !this.limited;
  }

  globalDelayFor(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        this.manager.globalDelay = null;
        resolve();
      }, ms).unref();
    });
  }

  /*
   * Determines whether the request should be queued or whether a RateLimitError should be thrown
   */
  async onRateLimit(request: APIRequest, limit: number, timeout: number, isGlobal: boolean): Promise<void> {
    const { options } = this.manager.client;
    if (!options.rejectOnRateLimit) return;

    const rateLimitData = {
      timeout,
      limit,
      method: request.method,
      path: request.path,
      route: request.route,
      global: isGlobal,
    };
    const shouldThrow =
      typeof options.rejectOnRateLimit === 'function'
        ? await options.rejectOnRateLimit(rateLimitData)
        : (options.rejectOnRateLimit as string[]).some((route: string) =>
            rateLimitData.route.startsWith(route.toLowerCase()),
          );
    if (shouldThrow) {
      throw new RateLimitError(rateLimitData);
    }
  }

  async execute(request: APIRequest, captchaKey?: unknown, captchaToken?: unknown): Promise<unknown> {
    /*
     * After calculations have been done, pre-emptively stop further requests
     * Potentially loop until this task can run if e.g. the global rate limit is hit twice
     */
    while (this.limited) {
      const isGlobal = this.globalLimited;
      let limit: number, timeout: number, delayPromise: Promise<void> | null;

      if (isGlobal) {
        // Set the variables based on the global rate limit
        limit = this.manager.globalLimit;
        timeout = (this.manager.globalReset ?? Date.now()) + this.manager.client.options.restTimeOffset - Date.now();
      } else {
        // Set the variables based on the route-specific rate limit
        limit = this.limit;
        timeout = this.reset + this.manager.client.options.restTimeOffset - Date.now();
      }

      if (this.manager.client.listenerCount(RATE_LIMIT)) {
        this.manager.client.emit(RATE_LIMIT, {
          timeout,
          limit,
          method: request.method,
          path: request.path,
          route: request.route,
          global: isGlobal,
        });
      }

      if (isGlobal) {
        // If this is the first task to reach the global timeout, set the global delay
        if (!this.manager.globalDelay) {
          // The global delay function should clear the global delay state when it is resolved
          this.manager.globalDelay = this.globalDelayFor(timeout);
        }
        delayPromise = this.manager.globalDelay;
      } else {
        delayPromise = Bun.sleep(Math.max(1, timeout));
      }

      // Determine whether a RateLimitError should be thrown
      await this.onRateLimit(request, limit, timeout, isGlobal); // eslint-disable-line no-await-in-loop

      // Wait for the timeout to expire in order to avoid an actual 429
      await delayPromise; // eslint-disable-line no-await-in-loop
    }

    // As the request goes out, update the global usage information
    if (!this.manager.globalReset || this.manager.globalReset < Date.now()) {
      this.manager.globalReset = Date.now() + 1_000;
      this.manager.globalRemaining = this.manager.globalLimit;
    }
    this.manager.globalRemaining--;

    if (this.manager.client.listenerCount(API_REQUEST)) {
      this.manager.client.emit(API_REQUEST, {
        method: request.method,
        path: request.path,
        route: request.route,
        options: request.options,
        retries: request.retries,
      });
    }

    // Perform the request
    let res: {
      ok: boolean;
      status: number;
      statusText: string;
      headers: { get: (k: string) => string | null };
      clone: () => unknown;
      json: () => Promise<unknown>;
      text: () => Promise<string>;
      arrayBuffer: () => Promise<unknown>;
    };
    try {
      res = (await request.make(captchaKey, captchaToken)) as typeof res;
    } catch (error: unknown) {
      // Retry the specified number of times for request abortions
      const e = error as { message?: string; constructor?: { name?: string }; status?: number };
      if (request.retries === this.manager.client.options.retryLimit) {
        throw new HTTPError(e.message ?? 'Unknown error', e.constructor?.name ?? 'Error', e.status, request);
      }

      request.retries++;
      return this.execute(request);
    }

    if (this.manager.client.listenerCount(API_RESPONSE)) {
      this.manager.client.emit(
        API_RESPONSE,
        {
          method: request.method,
          path: request.path,
          route: request.route,
          options: request.options,
          retries: request.retries,
        },
        res.clone(),
      );
    }

    let sublimitTimeout: number | null = null;
    if (res.headers) {
      const serverDate = res.headers.get('date');
      const limit = res.headers.get('x-ratelimit-limit');
      const remaining = res.headers.get('x-ratelimit-remaining');
      const reset = res.headers.get('x-ratelimit-reset');
      const resetAfter = res.headers.get('x-ratelimit-reset-after');
      this.limit = limit ? Number(limit) : Infinity;
      this.remaining = remaining ? Number(remaining) : 1;

      this.reset = reset || resetAfter ? calculateReset(reset, resetAfter, serverDate) : Date.now();

      // https://github.com/discord/discord-api-docs/issues/182
      if (!resetAfter && request.route.includes('reactions')) {
        this.reset = new Date(serverDate as string).getTime() - getAPIOffset(serverDate) + 250;
      }

      // Handle retryAfter, which means we have actually hit a rate limit
      const retryAfterHeader = res.headers.get('retry-after');
      let retryAfter: number = retryAfterHeader ? Number(retryAfterHeader) * 1_000 : -1;
      if (retryAfter > 0) {
        // If the global rate limit header is set, that means we hit the global rate limit
        if (res.headers.get('x-ratelimit-global')) {
          this.manager.globalRemaining = 0;
          this.manager.globalReset = Date.now() + retryAfter;
        } else if (!this.localLimited) {
          /*
           * This is a sublimit (e.g. 2 channel name changes/10 minutes) since the headers don't indicate a
           * route-wide rate limit. Don't update remaining or reset to avoid rate limiting the whole
           * endpoint, just set a reset time on the request itself to avoid retrying too soon.
           */
          sublimitTimeout = retryAfter;
        }
      }
    }

    // Count the invalid requests
    if (res.status === 401 || res.status === 403 || res.status === 429) {
      if (!invalidCountResetTime || invalidCountResetTime < Date.now()) {
        invalidCountResetTime = Date.now() + 1_000 * 60 * 10;
        invalidCount = 0;
      }
      invalidCount++;

      const emitInvalid =
        this.manager.client.listenerCount(INVALID_REQUEST_WARNING) &&
        this.manager.client.options.invalidRequestWarningInterval > 0 &&
        invalidCount % this.manager.client.options.invalidRequestWarningInterval === 0;
      if (emitInvalid) {
        this.manager.client.emit(INVALID_REQUEST_WARNING, {
          count: invalidCount,
          remainingTime: invalidCountResetTime - Date.now(),
        });
      }
    }

    // Handle 2xx and 3xx responses
    if (res.ok) {
      // Nothing wrong with the request, proceed with the next one
      return parseResponse(res);
    }

    // Handle 4xx responses
    if (res.status >= 400 && res.status < 500) {
      // Handle ratelimited requests
      if (res.status === 429) {
        const isGlobal = this.globalLimited;
        let limit: number, timeout: number;
        if (isGlobal) {
          // Set the variables based on the global rate limit
          limit = this.manager.globalLimit;
          timeout = (this.manager.globalReset ?? Date.now()) + this.manager.client.options.restTimeOffset - Date.now();
        } else {
          // Set the variables based on the route-specific rate limit
          limit = this.limit;
          timeout = this.reset + this.manager.client.options.restTimeOffset - Date.now();
        }

        this.manager.client.emit(
          DEBUG,
          `[Request Handler] Hit a 429 while executing a request.
    Global  : ${isGlobal}
    Method  : ${request.method}
    Path    : ${request.path}
    Route   : ${request.route}
    Limit   : ${limit}
    Timeout : ${timeout}ms
    Sublimit: ${sublimitTimeout ? `${sublimitTimeout}ms` : 'None'}`,
        );

        await this.onRateLimit(request, limit, timeout, isGlobal);

        // If caused by a sublimit, wait it out here so other requests on the route can be handled
        if (sublimitTimeout) {
          await Bun.sleep(Math.max(1, sublimitTimeout));
        }
        return this.execute(request);
      }

      // Handle possible malformed requests
      let data: Record<string, unknown>;
      try {
        data = await parseResponse(res);
        // Captcha
        const captcha = readCaptcha(data);
        if (
          captcha &&
          typeof this.manager.client.options.captchaSolver == 'function' &&
          request.retries < this.manager.client.options.captchaRetryLimit &&
          captchaMessage.some(s => captcha.captcha_key[0]?.includes(s))
        ) {
          // Retry the request after a captcha is solved
          this.manager.client.emit(
            DEBUG,
            `[Request Handler] Hit a captcha while executing a request (${captcha.captcha_key.join(', ')})
    Method  : ${request.method}
    Path    : ${request.path}
    Route   : ${request.route}
    Sitekey : ${captcha.captcha_sitekey}
    rqToken : ${data.captcha_rqtoken}`,
          );
          const captchaSolution = await this.manager.client.options.captchaSolver(captcha, request.fullUserAgent);
          this.manager.client.emit(
            DEBUG,
            `[Request Handler] Captcha details:
    Method  : ${request.method}
    Path    : ${request.path}
    Route   : ${request.route}
    Key     : ${captchaSolution ? `${captchaSolution.slice(0, 120)}...` : '[Captcha not solved]'}
    rqToken : ${data.captcha_rqtoken}`,
          );
          request.retries++;
          return this.execute(request, captchaSolution, data.captcha_rqtoken);
        }
        // Two factor handling
        if (data?.code && data.code == 60003 && request.options.auth !== false && request.retries < 1) {
          // https://gist.github.com/Dziurwa14/de2498e5ee28d2089f095aa037957cbb
          // 60003: Two factor is required for this operation
          if (
            (data as { mfa?: { methods?: Array<{ type: string }> } }).mfa?.methods?.find(
              (o: { type: string }) => o.type === 'totp',
            ) &&
            typeof this.manager.client.options.TOTPKey === 'string'
          ) {
            // Get mfa code
            const otp = this.manager.client.authenticator.generate(this.manager.client.options.TOTPKey);
            this.manager.client.emit(
              DEBUG,
              `[Request Handler] ${data.message}
    Method  : ${request.method}
    Path    : ${request.path}
    Route   : ${request.route}
    mfaCode : ${otp}`,
            );
            // Get ticket
            const mfaData = (data as { mfa?: { ticket?: string } }).mfa;
            const mfaPost = (await this.manager.client.api.mfa.finish.post({
              data: {
                ticket: mfaData?.ticket,
                data: otp,
                mfa_type: 'totp',
              },
            })) as { token?: string };
            request.options.mfaToken = mfaPost.token;
            request.retries++;
            return this.execute(request);
          }
        }
      } catch (err: unknown) {
        const e = err as { message?: string; constructor?: { name?: string }; status?: number };
        throw new HTTPError(e.message ?? 'Unknown error', e.constructor?.name ?? 'Error', e.status, request);
      }

      throw new DiscordAPIError(data, res.status, request);
    }

    // Handle 5xx responses
    if (res.status >= 500 && res.status < 600) {
      // Retry the specified number of times for possible serverside issues
      if (request.retries === this.manager.client.options.retryLimit) {
        throw new HTTPError(res.statusText, 'HTTPError', res.status, request);
      }

      request.retries++;
      return this.execute(request);
    }

    // Fallback in the rare case a status code outside the range 200..=599 is returned
    return null;
  }
}

export default RequestHandler;
export { RequestHandler };
