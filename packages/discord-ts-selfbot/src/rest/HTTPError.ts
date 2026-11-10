/**
 * Represents an HTTP error from a request.
 * @extends Error
 */
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

    /**
     * The name of the error
     * @type {string}
     */
    this.name = name;

    /**
     * HTTP error code returned from the request
     * @type {number}
     */
    this.code = (code as number) ?? 500;

    /**
     * The HTTP method used for the request
     * @type {string}
     */
    this.method = request.method;

    /**
     * The path of the request relative to the HTTP endpoint
     * @type {string}
     */
    this.path = request.path;

    /**
     * The HTTP data that was sent to Discord
     * @typedef {Object} HTTPErrorData
     * @property {*} json The JSON data that was sent
     * @property {HTTPAttachmentData[]} files The files that were sent with this request, if any
     */

    /**
     * The attachment data that is sent to Discord
     * @typedef {Object} HTTPAttachmentData
     * @property {string|Buffer|Stream} attachment The source of this attachment data
     * @property {string} name The file name
     * @property {Buffer|Stream} file The file buffer
     */

    /**
     * The data associated with the request that caused this error
     * @type {HTTPErrorData}
     */
    this.requestData = {
      json: request.options?.data,
      files: request.options?.files ?? [],
      headers: request.options?.headers,
    };
  }
}

export default HTTPError;
export { HTTPError };
