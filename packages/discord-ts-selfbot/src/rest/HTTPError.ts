class HTTPError extends Error {
  override name: string;
  code: number;
  method: string;
  path: string;
  requestData: unknown;

  constructor(
    message: string,
    name: string,
    code: unknown,
    request: { method: string; path: string; options?: { data?: unknown; files?: unknown[]; headers?: unknown } },
  ) {
    super(message);

    this.name = name;

    this.code = (code as number) ?? 500;

    this.method = request.method;

    this.path = request.path;

    this.requestData = {
      json: request.options?.data,
      files: request.options?.files ?? [],
      headers: request.options?.headers,
    };
  }
}

export default HTTPError;
export { HTTPError };
