import { Buffer } from "node:buffer";
import { createRequire } from "node:module";
import WebSocket from "ws";

const require = createRequire(import.meta.url);

interface ErlpackModule {
  pack: (data: unknown) => Buffer;
  unpack: (data: Buffer) => unknown;
}

interface WebSocketModule {
  WebSocket: typeof WebSocket;
  encoding: "json" | "etf";
  pack: (data: unknown) => string | Buffer;
  unpack: (data: unknown, type?: string) => unknown;
  create: (
    gateway: string,
    query?: Record<string, unknown>,
    options?: WebSocket.ClientOptions
  ) => WebSocket;
  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isErlpack(value: unknown): value is ErlpackModule {
  return (
    isRecord(value) &&
    typeof value.pack === "function" &&
    typeof value.unpack === "function"
  );
}

function toUint8Array(data: unknown): Uint8Array {
  if (data instanceof Uint8Array) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  return new Uint8Array(0);
}

let erlpack: ErlpackModule | null = null;

try {
  const candidate: unknown = require("erlpack");
  if (isErlpack(candidate)) {
    erlpack = candidate;
  }
} catch {
  // erlpack is optional; fall back to JSON encoding.
}

const ab = new TextDecoder();

const websocket: WebSocketModule = {
  CLOSED: WebSocket.CLOSED,
  CLOSING: WebSocket.CLOSING,
  CONNECTING: WebSocket.CONNECTING,
  OPEN: WebSocket.OPEN,
  WebSocket,
  create: (
    gateway: string,
    query: Record<string, unknown> = {},
    options?: WebSocket.ClientOptions
  ) => {
    const [gatewayPath, queryString] = gateway.split("?");
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      params.set(key, String(value));
    }
    params.set("encoding", websocket.encoding);
    if (queryString) {
      for (const [key, value] of new URLSearchParams(queryString)) {
        params.set(key, value);
      }
    }
    return new WebSocket(`${gatewayPath}?${params}`, options);
  },
  encoding: erlpack ? "etf" : "json",
  pack: erlpack ? erlpack.pack : (data) => JSON.stringify(data) ?? "",
  unpack: (data: unknown, type?: string) => {
    if (websocket.encoding === "json" || type === "json") {
      const text =
        typeof data === "string" ? data : ab.decode(toUint8Array(data));
      return JSON.parse(text);
    }
    const buffer = Buffer.isBuffer(data)
      ? data
      : Buffer.from(toUint8Array(data));
    return erlpack ? erlpack.unpack(buffer) : null;
  },
};

export default websocket;
export { websocket };
