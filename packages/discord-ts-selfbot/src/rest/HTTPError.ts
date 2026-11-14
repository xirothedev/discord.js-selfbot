class HTTPError extends Error {
  override name: string;
  code: number;
  status: number;
  method: string;
  path: string;
  requestData: unknown;
  override cause: unknown;
  retryable: boolean;

  constructor(
    message: string,
    name: string,
    code: unknown,
    request: {
      method: string;
      path: string;
      options?: { data?: unknown; files?: unknown[]; headers?: unknown };
    },
    details?: { status?: unknown; cause?: unknown; retryable?: boolean }
  ) {
    super(
      message,
      details?.cause === undefined ? undefined : { cause: details.cause }
    );

    this.name = 'HTTPError';
    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: true,
      value: name,
      writable: true,
    });

    this.code = (code as number) ?? 500;
    this.status = typeof details?.status === 'number' ? details.status : 0;

    this.method = request.method;

    this.path = request.path;

    this.requestData = {
      files: request.options?.files ?? [],
      headers: request.options?.headers,
      json: request.options?.data,
    };

    this.cause = details?.cause;
    this.retryable =
      details?.retryable ?? (this.status === 0 || this.status >= 500);
  }
}

export default HTTPError;
export { HTTPError };
