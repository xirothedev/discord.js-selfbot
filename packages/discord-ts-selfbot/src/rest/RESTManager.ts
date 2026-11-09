import { setInterval } from 'node:timers';
import { Collection } from '@discordjs/collection';
import makeFetchCookie from 'fetch-cookie';
import { CookieJar } from 'tough-cookie';
import { fetch as fetchOriginal } from 'undici';
import APIRequest from './APIRequest';
import routeBuilder from './APIRouter';
import RequestHandler from './RequestHandler';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { Endpoints } = _ConstantsModule;

class RESTManager {
  client: any;
  handlers: any;
  versioned: boolean;
  globalLimit: any;
  globalRemaining: any;
  globalReset: any;
  globalDelay: any;
  cookieJar: any;
  fetch: any;
  sweepInterval?: any;

  constructor(client: any) {
    this.client = client;
    this.handlers = new Collection();
    this.versioned = true;
    this.globalLimit = client.options.restGlobalRateLimit > 0 ? client.options.restGlobalRateLimit : Infinity;
    this.globalRemaining = this.globalLimit;
    this.globalReset = null;
    this.globalDelay = null;
    this.cookieJar = new CookieJar();
    this.fetch = makeFetchCookie(fetchOriginal, this.cookieJar);
    if (client.options.restSweepInterval > 0) {
      this.sweepInterval = setInterval(() => {
        this.handlers.sweep((handler: any) => handler._inactive);
      }, client.options.restSweepInterval * 1_000).unref();
    }
  }

  get api(): any {
    return routeBuilder(this);
  }

  getAuth(): any {
    const token = this.client.token ?? this.client.accessToken;
    if (token) return token?.replace(/Bot /g, '');
    throw new Error('TOKEN_MISSING');
  }

  get cdn(): any {
    return Endpoints.CDN(this.client.options.http.cdn);
  }

  request(method: any, url: any, options: any = {}): any {
    const apiRequest = new APIRequest(this, method, url, options);
    let handler = this.handlers.get(apiRequest.route);

    if (!handler) {
      handler = new RequestHandler(this);
      this.handlers.set(apiRequest.route, handler);
    }

    return handler.push(apiRequest);
  }

  get endpoint(): any {
    return this.client.options.http.api;
  }

  set endpoint(endpoint: any) {
    this.client.options.http.api = endpoint;
  }
}

export default RESTManager;
export { RESTManager };
