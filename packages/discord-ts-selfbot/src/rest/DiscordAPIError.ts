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
    }
  ) {
    const errMsg = error.message as string | undefined;
    const ErrorClass = new.target as typeof DiscordAPIError;
    const flattened = ErrorClass.flattenErrors(
      (error.errors ?? error) as unknown
    ).join("\n");
    super(
      errMsg && flattened ? `${errMsg}\n${flattened}` : (errMsg ?? flattened)
    );

    this.name = "DiscordAPIError";

    this.method = request.method;

    this.path = request.path;

    this.code = error.code as number;

    this.httpStatus = status;

    this.requestData = {
      files: request.options?.files ?? [],
      headers: request.options?.headers,
      json: request.options?.data,
    };

    this.retries = request.retries ?? 0;

    this.captcha = error?.captcha_service ? error : null;
  }

  get isBlockedByCloudflare(): boolean {
    return this.code === 40_333;
  }

  static flattenErrors(obj: unknown, key = ""): string[] {
    const messages: string[] = [];

    for (const [entryKey, value] of Object.entries(
      (obj ?? {}) as Record<string, unknown>
    )) {
      if (entryKey === "message") {
        continue;
      }
      let newKey = entryKey;
      if (key) {
        newKey = Number.isNaN(Number(entryKey))
          ? `${key}.${entryKey}`
          : `${key}[${entryKey}]`;
      }

      const nested = value as Record<string, unknown> | null;
      if (nested && Array.isArray(nested._errors)) {
        messages.push(
          `${newKey}: ${(nested._errors as { message: string }[])
            .map((entry) => entry.message)
            .join(" ")}`
        );
      } else if (nested && (nested.code ?? nested.message)) {
        messages.push(
          `${nested.code ? `${nested.code}: ` : ""}${nested.message}`.trim()
        );
      } else if (typeof value === "string") {
        messages.push(value);
      } else {
        messages.push(...this.flattenErrors(value, newKey));
      }
    }

    return messages;
  }
}

export default DiscordAPIError;
export { DiscordAPIError };
