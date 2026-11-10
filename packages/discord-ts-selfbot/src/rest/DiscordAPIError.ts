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

    this.method = request.method;

    this.path = request.path;

    this.code = error.code as number;

    this.httpStatus = status;

    this.requestData = {
      json: request.options?.data,
      files: request.options?.files ?? [],
      headers: request.options?.headers,
    };

    this.retries = request.retries ?? 0;

    this.captcha = error?.captcha_service ? error : null;
  }

  get isBlockedByCloudflare(): boolean {
    return this.code === 40333;
  }

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
