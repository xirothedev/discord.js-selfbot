const { Buffer } = require('node:buffer');

let erlpack: any;

try {
  erlpack = require('erlpack');
  if (!erlpack.pack) erlpack = null;
} catch {} // eslint-disable-line no-empty

const WebSocket = require('ws');

const ab = new TextDecoder();

const websocket: any = {
  WebSocket,
  encoding: erlpack ? 'etf' : 'json',
  pack: erlpack ? erlpack.pack : JSON.stringify,
};

websocket.unpack = (data: any, type: any) => {
  if (websocket.encoding === 'json' || type === 'json') {
    if (typeof data !== 'string') {
      data = ab.decode(data);
    }
    return JSON.parse(data);
  }
  if (!Buffer.isBuffer(data)) data = Buffer.from(new Uint8Array(data));
  return erlpack.unpack(data);
};

websocket.create = (gateway: string, query: any = {}, ...args: any[]) => {
  const [g, q] = gateway.split('?');
  query.encoding = websocket.encoding;
  query = new URLSearchParams(query);
  if (q) new URLSearchParams(q).forEach((v, k) => query.set(k, v));
  const ws = new websocket.WebSocket(`${g}?${query}`, ...args);
  return ws;
};

for (const state of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) websocket[state] = websocket.WebSocket[state];

export = websocket;
