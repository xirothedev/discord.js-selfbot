import type { AnySocket, AnyTLSSocket } from './proxySocket';

function dechunkBody(raw: Uint8Array): Buffer {
  const buf = Buffer.from(raw);
  const parts: Buffer[] = [];
  let offset = 0;
  for (;;) {
    const end = buf.indexOf('\r\n', offset);
    if (end === -1) {
      break;
    }
    const size = Number.parseInt(
      buf.subarray(offset, end).toString('ascii').split(';')[0]?.trim() ?? '',
      16
    );
    if (!size) {
      break;
    }
    const start = end + 2;
    parts.push(buf.subarray(start, start + size));
    offset = start + size + 2;
  }
  return Buffer.concat(parts);
}

async function readHttpResponse(
  socket: AnySocket | AnyTLSSocket,
  signal?: AbortSignal | null
): Promise<globalThis.Response> {
  const chunks: Buffer[] = [];
  const { promise, reject, resolve } = Promise.withResolvers<undefined>();
  if (signal?.aborted) {
    reject(new Error('Request aborted'));
  } else {
    const onAbort = () => {
      socket.destroy();
      reject(new Error('Request aborted'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    socket.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    socket.once('end', () => {
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
      resolve(undefined);
    });
    socket.once('error', (error: unknown) => {
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
      reject(error);
    });
  }
  await promise;
  const raw = Buffer.concat(chunks);
  const headEnd = raw.indexOf('\r\n\r\n');
  if (headEnd === -1) {
    throw new Error('Proxy returned a malformed response');
  }
  const head = raw.subarray(0, headEnd).toString('latin1');
  let body: Buffer = Buffer.from(raw.subarray(headEnd + 4));
  const lines = head.split('\r\n');
  const statusLine = lines[0] ?? 'HTTP/1.1 500 Internal Error';
  const status = Number(statusLine.split(' ')[1] ?? 500);
  const headers = new Headers();
  for (const line of lines.slice(1)) {
    const index = line.indexOf(':');
    if (index > 0) {
      headers.append(
        line.slice(0, index).trim().toLowerCase(),
        line.slice(index + 1).trim()
      );
    }
  }
  if (headers.get('transfer-encoding')?.includes('chunked')) {
    body = dechunkBody(body);
  }
  return new globalThis.Response(new Uint8Array(body), { headers, status });
}

function sendRequest(
  socket: AnySocket | AnyTLSSocket,
  method: string,
  target: string,
  headers: Headers,
  bodyText: string
) {
  const head = [
    `${method} ${target} HTTP/1.1`,
    ...[...headers.entries()].map(([key, value]) => `${key}: ${value}`),
    '',
    '',
  ].join('\r\n');
  socket.write(head + bodyText);
}

export { dechunkBody, readHttpResponse, sendRequest };
