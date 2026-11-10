import dgram from 'node:dgram';

type SocketType = 'udp4' | 'udp6';

interface InterfaceAddresses {
  udp4?: string;
  udp6?: string;
}

interface StreamKey {
  type: string;
  guildId: string | null;
  channelId: string;
  userId: string;
}
import { setImmediate } from 'node:timers';

function interfaceAddress(
  type: SocketType,
  interfaceAddresses?: InterfaceAddresses | null
): string | undefined {
  return interfaceAddresses ? interfaceAddresses[type] : undefined;
}

async function randomPort(
  protocol: SocketType = 'udp4',
  interfaceAddresses?: InterfaceAddresses | null
): Promise<number | undefined> {
  const socket = dgram.createSocket(protocol);

  setImmediate(() =>
    socket.bind({
      address: interfaceAddress(protocol, interfaceAddresses),
      port: 0,
    })
  );

  const bound = Promise.withResolvers<unknown>();
  socket.once('error', bound.reject);
  socket.once('listening', bound.resolve);
  await bound.promise;

  const address = socket.address();
  const port = typeof address === 'object' ? address.port : undefined;
  const closed = Promise.withResolvers<undefined>();
  socket.close(() => closed.resolve(undefined));
  await closed.promise;
  return port;
}

async function randomPorts(
  num: number,
  protocol: SocketType = 'udp4',
  interfaceAddresses: InterfaceAddresses | null = null
): Promise<(number | undefined)[]> {
  return Promise.all(
    Array.from({ length: num }).map(() =>
      randomPort(protocol, interfaceAddresses)
    )
  );
}

async function probePort(
  candidate: number,
  protocol: SocketType,
  interfaceAddresses?: InterfaceAddresses | null
): Promise<number | undefined> {
  const socket = dgram.createSocket(protocol);

  setImmediate(() =>
    socket.bind({
      address: interfaceAddress(protocol, interfaceAddresses),
      port: candidate,
    })
  );

  const bound = Promise.withResolvers<unknown>();
  socket.once('error', bound.reject);
  socket.once('listening', () => bound.resolve(null));
  const error = await bound.promise;

  const closed = Promise.withResolvers<undefined>();
  socket.close(() => closed.resolve(undefined));
  await closed.promise;

  if (error) {
    return undefined;
  }

  const addressInfo = socket.address();
  return addressInfo.port;
}

async function findAvailablePort(
  min: number,
  max: number,
  protocol: SocketType,
  interfaceAddresses?: InterfaceAddresses | null
): Promise<number | undefined> {
  const attempt = async (candidate: number): Promise<number | undefined> => {
    if (candidate > max) {
      return undefined;
    }
    const port = await probePort(candidate, protocol, interfaceAddresses);
    if (port !== undefined && port >= min && port <= max) {
      return port;
    }
    return attempt(candidate + 1);
  };

  return attempt(min);
}

async function findPort(
  min: number,
  max: number,
  protocol: SocketType = 'udp4',
  interfaceAddresses?: InterfaceAddresses | null
): Promise<number> {
  const port = await findAvailablePort(min, max, protocol, interfaceAddresses);

  if (!port) {
    throw new Error('port not found');
  }
  return port;
}

function parseStreamKey(key: string): StreamKey {
  const [type, first, second, third] = key.split(':');
  const guildId = type === 'guild' ? first : null;
  const channelId = type === 'guild' ? second : first;
  const userId = type === 'guild' ? third : second;
  return { channelId, guildId, type, userId };
}

export { randomPort, randomPorts, findPort, interfaceAddress, parseStreamKey };
export default {
  findPort,
  interfaceAddress,
  parseStreamKey,
  randomPort,
  randomPorts,
};
