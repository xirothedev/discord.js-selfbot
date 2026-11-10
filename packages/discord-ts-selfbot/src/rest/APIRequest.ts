import { Buffer } from 'node:buffer';
import { setTimeout } from 'node:timers';
import { FormData, buildConnector, Client, ProxyAgent } from 'undici';
import _ConstantsModule from '../util/Constants';

const { ciphers } = _ConstantsModule;
import Util from '../util/Util';
import type RESTManager from '../rest/RESTManager';
import type { BaseClient } from '../client/BaseClient';

let agent: unknown = null;

class APIRequest {
  rest: RESTManager;
  client: BaseClient;
  method: string;
  route: string;
  options: Record<string, unknown>;
  retries: number;
  fullUserAgent: string;
  path: string;

  constructor(
    rest: RESTManager,
    method: string,
    path: string,
    options: Record<string, unknown>
  ) {
    this.rest = rest;
    this.client = rest.client;
    this.method = method;
    this.route = (options.route as string) ?? '';
    this.options = options;
    this.retries = 0;

    this.fullUserAgent = (
      this.client.options as { http: { headers: Record<string, string> } }
    ).http.headers['User-Agent'];

    (
      this.client.options as { ws: { properties: Record<string, string> } }
    ).ws.properties.browser_user_agent = this.fullUserAgent;

    let queryString = '';
    if (options.query) {
      const queryOptions = options.query as Record<string, unknown>;
      const query = Object.entries(queryOptions)
        .filter(([, value]) => value !== null && value !== undefined)
        .flatMap(([key, value]) =>
          Array.isArray(value)
            ? value.map((item) => [key, item])
            : [[key, value]]
        );
      queryString = new URLSearchParams(query as string[][]).toString();
    }
    this.path = `${path}${queryString && `?${queryString}`}`;
  }

  make(captchaKey?: unknown, captchaRqToken?: unknown): Promise<unknown> {
    this.ensureAgent();

    const API =
      this.options.versioned === false
        ? this.client.options.http.api
        : `${this.client.options.http.api}/v${this.client.options.http.version}`;
    const url = API + this.path;

    const headers = this.buildHeaders(captchaKey, captchaRqToken);
    const body = this.buildBody(headers);

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      (this.client.options as { restRequestTimeout: number }).restRequestTimeout
    ).unref();
    return this.rest
      .fetch(url, {
        body,
        credentials: 'include',
        dispatcher: agent as never,
        headers: headers as never,
        method: this.method.toUpperCase(),
        // Undici doesn't normalize "patch" into "PATCH" (which surprisingly follows the spec).
        redirect: 'follow',
        signal: controller.signal,
      })
      .finally(() => clearTimeout(timeout));
  }

  private ensureAgent(): void {
    if (agent) {
      return;
    }
    const proxyAgent = Util.checkUndiciProxyAgent(
      this.client.options.http.agent
    );
    agent = proxyAgent
      ? new ProxyAgent({
          ...proxyAgent,
          ciphers: ciphers.join(':'),
        } as never)
      : new Client('https://discord.com', {
          connect: buildConnector({ ciphers: ciphers.join(':') }),
        });
  }

  private buildHeaders(
    captchaKey?: unknown,
    captchaRqToken?: unknown
  ): Record<string, unknown> {
    let headers: Record<string, unknown> = {
      accept: '*/*',
      'accept-language': 'en-US',
      origin: 'https://discord.com',
      priority: 'u=1, i',
      referer: 'https://discord.com/channels/@me',
      'sec-ch-ua': '"Not:A-Brand";v="24", "Chromium";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-debug-options': 'bugReporterEnabled',
      'x-discord-locale': 'en-US',
      'x-discord-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      'x-super-properties': `${Buffer.from(
        JSON.stringify(this.client.options.ws.properties),
        'ascii'
      ).toString('base64')}`,
      ...this.client.options.http.headers,
      'User-Agent': this.fullUserAgent,
    };

    if (this.options.auth !== false) {
      headers.Authorization = this.rest.getAuth();
    }
    if (this.options.reason) {
      headers['X-Audit-Log-Reason'] = encodeURIComponent(
        String(this.options.reason)
      );
    }
    if (this.options.headers) {
      headers = Object.assign(headers, this.options.headers);
    }

    // Delete all headers if undefined
    headers = Object.fromEntries(
      Object.entries(headers).filter(([, value]) => value !== undefined)
    );
    if (this.options.webhook === true) {
      headers = {
        'User-Agent': this.client.options.http.headers['User-Agent'],
      };
    }

    // Some options
    if (this.options.DiscordContext) {
      headers['X-Context-Properties'] = Buffer.from(
        JSON.stringify(this.options.DiscordContext),
        'utf-8'
      ).toString('base64');
    }

    if (this.options.mfaToken) {
      headers['X-Discord-Mfa-Authorization'] = this.options.mfaToken;
    }

    // Captcha
    if (captchaKey && typeof captchaKey === 'string') {
      headers['X-Captcha-Key'] = captchaKey;
    }
    if (captchaRqToken && typeof captchaRqToken === 'string') {
      headers['X-Captcha-Rqtoken'] = captchaRqToken;
    }

    return headers;
  }

  private buildBody(
    headers: Record<string, unknown>
  ): FormData | string | undefined {
    let body: FormData | string | undefined;
    const files = this.options.files as unknown[] | undefined;
    if (files?.length) {
      body = new FormData();
      for (const [index, file] of files.entries()) {
        // Why undici#FormData doesn't support file stream?
        // Hacky way to support file stream
        const filePart = file as {
          file?: unknown;
          key?: string;
          name?: string;
        };
        if (filePart.file) {
          body.set(filePart.key ?? `files[${index}]`, {
            [Symbol.toStringTag]: 'File',
            name: filePart.name,
            stream: () => filePart.file,
          });
        }
      }
      if (this.options.data !== undefined) {
        if (this.options.dontUsePayloadJSON) {
          for (const [key, value] of Object.entries(
            (this.options.data ?? {}) as Record<string, unknown>
          )) {
            body.append(key, value);
          }
        } else {
          body.append('payload_json', JSON.stringify(this.options.data));
        }
      }
    } else if (this.options.data !== null && this.options.data !== undefined) {
      if (this.options.usePayloadJSON) {
        body = new FormData();
        body.append('payload_json', JSON.stringify(this.options.data));
      } else {
        body = JSON.stringify(this.options.data);
        headers['Content-Type'] = 'application/json';
      }
    }
    return body;
  }
}

export default APIRequest;
export { APIRequest };
