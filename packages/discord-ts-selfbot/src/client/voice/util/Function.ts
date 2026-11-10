import dgram from "node:dgram";

type SocketType = "udp4" | "udp6";

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
import { setImmediate } from "node:timers";

function interfaceAddress(
  type: SocketType,
  interfaceAddresses?: InterfaceAddresses | null
): string | undefined {
  return interfaceAddresses ? interfaceAddresses[type] : undefined;
}

async function randomPort(
  protocol: SocketType = "udp4",
  interfaceAddresses?: InterfaceAddresses | null
): Promise<number | undefined> {
  const socket = dgram.createSocket(protocol);

  setImmediate(() =>
    socket.bind({
      address: interfaceAddress(protocol, interfaceAddresses),
      port: 0,
    })
  );

  await new Promise((resolve, reject) => {
    socket.once("error", reject);
    socket.once("listening", resolve);
  });

  const address = socket.address();
  const port = typeof address === "object" ? address.port : undefined;
  await new Promise((resolve) => socket.close(() => resolve(undefined)));
  return port;
}

async function randomPorts(
  num: number,
  protocol: SocketType = "udp4",
  interfaceAddresses: InterfaceAddresses | null = null
): Promise<(number | undefined)[]> {
  return Promise.all(
    Array.from({ length: num }).map(() =>
      randomPort(protocol, interfaceAddresses)
    )
  );
}

async function findPort(
  min: number,
  max: number,
  protocol: SocketType = "udp4",
  interfaceAddresses?: InterfaceAddresses | null
): Promise<number> {
  let port: number | undefined;

  for (let i = min; i <= max; i++) {
    const socket = dgram.createSocket(protocol);

    setImmediate(() =>
      socket.bind({
        address: interfaceAddress(protocol, interfaceAddresses),
        port: i,
      })
    );

    const error = await new Promise((resolve) => {
      socket.once("error", resolve);
      socket.once("listening", () => resolve(null));
    });

    await new Promise((resolve) => socket.close(() => resolve(undefined)));

    if (error) {
      continue;
    }

    const addressInfo = socket.address();
    if (addressInfo && addressInfo.port >= min && addressInfo.port <= max) {
      port = addressInfo.port;
      break;
    }
  }

  if (!port) {
    throw new Error("port not found");
  }
  return port;
}

function parseStreamKey(key: string): StreamKey {
  const Arr = key.split(":");
  const type = Arr[0];
  const guildId = type === "guild" ? Arr[1] : null;
  const channelId = type === "guild" ? Arr[2] : Arr[1];
  const userId = type === "guild" ? Arr[3] : Arr[2];
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
