import { Buffer } from 'node:buffer';
import { setTimeout } from 'node:timers';
import { FormData, buildConnector, Client, ProxyAgent } from 'undici';
import _ConstantsModule from '../util/Constants';
const { ciphers } = _ConstantsModule;
import Util from '../util/Util';

let agent: unknown = null;

class APIRequest {
  rest: import('../rest/RESTManager').default;
  client: import('../client/BaseClient').BaseClient;
  method: string;
  route: string;
  options: Record<string, unknown>;
  retries: number;
  fullUserAgent: string;
  path: string;

  constructor(
    rest: import('../rest/RESTManager').default,
    method: string,
    path: string,
    options: Record<string, unknown>,
  ) {
    this.rest = rest;
    this.client = rest.client;
    this.method = method;
    this.route = (options.route as string) ?? '';
    this.options = options;
    this.retries = 0;

    this.fullUserAgent = (this.client.options as { http: { headers: Record<string, string> } }).http.headers[
      'User-Agent'
    ];

    (this.client.options as { ws: { properties: Record<string, string> } }).ws.properties.browser_user_agent =
      this.fullUserAgent;

    let queryString = '';
    if (options.query) {
      const q = options.query as Record<string, unknown>;
      const query = Object.entries(q)
        .filter(([, value]) => value !== null && typeof value !== 'undefined')
        .flatMap(([key, value]) => (Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]));
      queryString = new URLSearchParams(query as string[][]).toString();
    }
    this.path = `${path}${queryString && `?${queryString}`}`;
  }

  make(captchaKey?: unknown, captchaRqToken?: unknown): Promise<unknown> {
    if (!agent) {
      const r_ = Util.checkUndiciProxyAgent(this.client.options.http.agent);
      if (!r_) {
        agent = new Client('https://discord.com', {
          connect: buildConnector({ ciphers: ciphers.join(':') }),
        });
      } else {
        agent = new ProxyAgent({
          ...r_,
          ciphers: ciphers.join(':'),
        } as never);
      }
    }

    const API =
      this.options.versioned === false
        ? this.client.options.http.api
        : `${this.client.options.http.api}/v${this.client.options.http.version}`;
    const url = API + this.path;

    let headers: Record<string, unknown> = {
      accept: '*/*',
      'accept-language': 'en-US',
      priority: 'u=1, i',
      referer: 'https://discord.com/channels/@me',
      'sec-ch-ua': '"Not:A-Brand";v="24", "Chromium";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-discord-locale': 'en-US',
      'x-discord-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      'x-super-properties': `${Buffer.from(JSON.stringify(this.client.options.ws.properties), 'ascii').toString(
        'base64',
      )}`,
      origin: 'https://discord.com',
      'x-debug-options': 'bugReporterEnabled',
      ...this.client.options.http.headers,
      'User-Agent': this.fullUserAgent,
    };

    if (this.options.auth !== false) headers.Authorization = this.rest.getAuth();
    if (this.options.reason) headers['X-Audit-Log-Reason'] = encodeURIComponent(String(this.options.reason));
    if (this.options.headers) headers = Object.assign(headers, this.options.headers);

    // Delete all headers if undefined
    for (const [key, value] of Object.entries(headers)) {
      if (value === undefined) delete headers[key];
    }
    if (this.options.webhook === true) {
      headers = {
        'User-Agent': this.client.options.http.headers['User-Agent'],
      };
    }

    // Some options
    if (this.options.DiscordContext) {
      headers['X-Context-Properties'] = Buffer.from(JSON.stringify(this.options.DiscordContext), 'utf8').toString(
        'base64',
      );
    }

    if (this.options.mfaToken) {
      headers['X-Discord-Mfa-Authorization'] = this.options.mfaToken;
    }

    // Captcha
    if (captchaKey && typeof captchaKey == 'string') headers['X-Captcha-Key'] = captchaKey;
    if (captchaRqToken && typeof captchaRqToken == 'string') headers['X-Captcha-Rqtoken'] = captchaRqToken;

    let body: FormData | string | undefined;
    const files = this.options.files as unknown[] | undefined;
    if (files?.length) {
      body = new FormData();
      for (const [index, file] of files.entries()) {
        // Why undici#FormData doesn't support file stream?
        // Hacky way to support file stream
        const f = file as { file?: unknown; key?: string; name?: string };
        if (f.file) {
          body.set(f.key ?? `files[${index}]`, {
            [Symbol.toStringTag]: 'File',
            name: f.name,
            stream: () => f.file,
          });
        }
      }
      if (typeof this.options.data !== 'undefined') {
        if (this.options.dontUsePayloadJSON) {
          for (const [key, value] of Object.entries((this.options.data ?? {}) as Record<string, unknown>))
            body.append(key, value);
        } else {
          body.append('payload_json', JSON.stringify(this.options.data));
        }
      }
      // eslint-disable-next-line eqeqeq
    } else if (this.options.data != null) {
      if (this.options.usePayloadJSON) {
        body = new FormData();
        body.append('payload_json', JSON.stringify(this.options.data));
      } else {
        body = JSON.stringify(this.options.data);
        headers['Content-Type'] = 'application/json';
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      (this.client.options as { restRequestTimeout: number }).restRequestTimeout,
    ).unref();
    return this.rest
      .fetch(url, {
        method: this.method.toUpperCase(), // Undici doesn't normalize "patch" into "PATCH" (which surprisingly follows the spec).
        headers: headers as never,
        body,
        signal: controller.signal,
        redirect: 'follow',
        dispatcher: agent as never,
        credentials: 'include',
      })
      .finally(() => clearTimeout(timeout));
  }
}

export default APIRequest;
export { APIRequest };
