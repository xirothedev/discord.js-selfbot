import { setInterval } from "node:timers";
import { Collection } from "@discordjs/collection";
import makeFetchCookie from "fetch-cookie";
import { CookieJar } from "tough-cookie";
import { fetch as fetchOriginal } from "undici";
import APIRequest from "./APIRequest";
import type { ApiRouter } from "./APIRouter";
import routeBuilder from "./APIRouter";
import RequestHandler from "./RequestHandler";
import _errorsModule from "../errors";

const { Error } = _errorsModule;
import _ConstantsModule from "../util/Constants";
import type { BaseClient } from "../client/BaseClient";

const { Endpoints } = _ConstantsModule;

class RESTManager {
  client: BaseClient;
  handlers: Collection<string, RequestHandler>;
  versioned: boolean;
  globalLimit: number;
  globalRemaining: number;
  globalReset: number | null;
  globalDelay: Promise<void> | null;
  cookieJar: CookieJar;
  fetch: typeof fetchOriginal;
  sweepInterval?: ReturnType<typeof setInterval>;

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
    this.fetch = makeFetchCookie(fetchOriginal, this.cookieJar);
    if (client.options.restSweepInterval > 0) {
      this.sweepInterval = setInterval(() => {
        this.handlers.sweep((handler: RequestHandler) => handler._inactive);
      }, client.options.restSweepInterval * 1000).unref();
    }
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
      return token.replaceAll("Bot ", "");
    }
    throw new Error("TOKEN_MISSING");
  }

  get cdn(): ReturnType<typeof Endpoints.CDN> {
    return Endpoints.CDN(this.client.options.http.cdn);
  }

  request(
    method: string,
    url: string,
    options: Record<string, unknown> = {}
  ): unknown {
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
}

export default RESTManager;
export { RESTManager };
