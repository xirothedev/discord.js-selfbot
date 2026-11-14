import { setInterval } from 'node:timers';
import { Collection } from '@discordjs/collection';
import makeFetchCookie from 'fetch-cookie';
import { CookieJar } from 'tough-cookie';
import {
  Client as UndiciClient,
  ProxyAgent,
  buildConnector,
  fetch as fetchOriginal,
} from 'undici';
import APIRequest from './APIRequest';
import type { ApiRouter } from './APIRouter';
import routeBuilder from './APIRouter';
import RequestHandler from './RequestHandler';
import MissingTokenError from './MissingTokenError';
import type { RequestOptions } from './RequestOptions';
import { createProxyFetch, parseProxyUrl } from './proxyFetch';
import type { FetchFn } from './proxySocket';
import _ConstantsModule from '../util/Constants';
import Util from '../util/Util';
import type { BaseClient } from '../client/BaseClient';

const { Endpoints, ciphers } = _ConstantsModule;

interface ClosableDispatcher {
  close: () => unknown;
}

function isClosable(value: unknown): value is ClosableDispatcher {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('close' in value)) {
    return false;
  }
  return typeof value.close === 'function';
}

class RESTManager {
  client: BaseClient;
  handlers: Collection<string, RequestHandler>;
  versioned: boolean;
  globalLimit: number;
  globalRemaining: number;
  globalReset: number | null;
  globalDelay: Promise<void> | null;
  cookieJar: CookieJar;
  fetch: (url: string, init?: Record<string, unknown>) => Promise<unknown>;
  sweepInterval?: ReturnType<typeof setInterval>;
  agent: unknown;
  invalidCount: number;
  invalidCountResetTime: number | null;

  constructor(client: BaseClient) {
    this.client = client;
    this.handlers = new Collection();
    this.versioned = true;
    this.globalLimit =
      client.options.restGlobalRateLimit > 0
        ? client.options.restGlobalRateLimit
        : Infinity;
    this.globalRemaining = this.globalLimit;
    this.globalReset = null;
    this.globalDelay = null;
    this.cookieJar = new CookieJar();
    const customFetch = client.options.http.fetch;
    const baseFetch = customFetch ?? fetchOriginal;
    const proxyFetch = createProxyFetch(
      baseFetch as FetchFn,
      client.options.http.agent
    );
    this.fetch = makeFetchCookie(
      proxyFetch as unknown as typeof fetchOriginal,
      this.cookieJar
    ) as (url: string, init?: Record<string, unknown>) => Promise<unknown>;
    this.agent = null;
    this.invalidCount = 0;
    this.invalidCountResetTime = null;
    if (client.options.restSweepInterval > 0) {
      this.sweepInterval = setInterval(() => {
        this.handlers.sweep((handler: RequestHandler) => handler._inactive);
      }, client.options.restSweepInterval * 1000).unref();
    }
  }

  getProxyUri(): string | null {
    const parsed = parseProxyUrl(this.client.options.http.agent);
    return parsed ? parsed.uri : null;
  }

  getDispatcher(): unknown {
    if (this.agent) {
      return this.agent;
    }
    const proxyAgent = Util.checkUndiciProxyAgent(
      this.client.options.http.agent
    );
    this.agent = proxyAgent
      ? new ProxyAgent({
          ...proxyAgent,
          ciphers: ciphers.join(':'),
        } as never)
      : new UndiciClient('https://discord.com', {
          connect: buildConnector({ ciphers: ciphers.join(':') }),
        });
    return this.agent;
  }

  get api(): ApiRouter {
    return routeBuilder(this);
  }

  getAuth(): string {
    const authClient = this.client as {
      token?: string | null;
      accessToken?: string;
    };
    const token = authClient.token ?? authClient.accessToken;
    if (token) {
      const clean = token.replaceAll('Bot ', '');
      if (clean.trim().length > 0) {
        return clean;
      }
    }
    throw new MissingTokenError();
  }

  get cdn(): ReturnType<typeof Endpoints.CDN> {
    return Endpoints.CDN(this.client.options.http.cdn);
  }

  request<Result = unknown>(
    method: string,
    url: string,
    options?: RequestOptions & Record<string, unknown>
  ): Promise<Result>;
  request(
    method: string,
    url: string,
    options: RequestOptions & Record<string, unknown> = {}
  ): Promise<unknown> {
    const apiRequest = new APIRequest(this, method, url, options);
    let handler = this.handlers.get(apiRequest.route);

    if (!handler) {
      handler = new RequestHandler(this);
      this.handlers.set(apiRequest.route, handler);
    }

    return handler.push(apiRequest);
  }

  get endpoint(): string {
    return this.client.options.http.api;
  }

  set endpoint(endpoint: string) {
    this.client.options.http.api = endpoint;
  }

  destroy() {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = undefined;
    }
    const { agent } = this;
    if (isClosable(agent)) {
      try {
        agent.close();
      } catch {
        // Close is best effort. The socket pool is already gone on Bun.
      }
    }
    this.agent = null;
    this.handlers.clear();
  }
}

export default RESTManager;
export { RESTManager };
