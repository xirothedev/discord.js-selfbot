import dgram from 'dgram';
import { setImmediate } from 'node:timers';

/**
 * @typedef {Object} InterfaceAddresses
 * @property {string} [udp4] - IPv4 address
 * @property {string} [udp6] - IPv6 address
 */

/**
 * Get the interface address for a given socket type.
 * @param {"udp4"|"udp6"} type - The socket type.
 * @param {InterfaceAddresses} [interfaceAddresses] - The interface addresses mapping.
 * @returns {string|undefined} The interface address if available.
 */
function interfaceAddress(type: any, interfaceAddresses: any) {
  return interfaceAddresses ? interfaceAddresses[type] : undefined;
}

/**
 * Get a random available port.
 * @param {"udp4"|"udp6"} [protocol="udp4"] - The socket type.
 * @param {InterfaceAddresses} [interfaceAddresses] - The interface addresses mapping.
 * @returns {Promise<number>} The assigned random port.
 */
async function randomPort(protocol: any = 'udp4', interfaceAddresses: any) {
  const socket = dgram.createSocket(protocol);

  setImmediate(() =>
    socket.bind({
      port: 0,
      address: interfaceAddress(protocol, interfaceAddresses),
    }),
  );

  await new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.once('listening', resolve);
  });

  const port = socket.address()?.port;
  await new Promise(resolve => socket.close(() => resolve(undefined)));
  return port;
}

/**
 * Get multiple random available ports.
 * @param {number} num - Number of ports to find.
 * @param {"udp4"|"udp6"} [protocol="udp4"] - The socket type.
 * @param {InterfaceAddresses} [interfaceAddresses] - The interface addresses mapping.
 * @returns {Promise<number[]>} An array of assigned random ports.
 */
async function randomPorts(num: any, protocol: any = 'udp4', interfaceAddresses: any = null) {
  return Promise.all(Array.from({ length: num }).map(() => randomPort(protocol, interfaceAddresses)));
}

/**
 * Find an available port within a given range.
 * @param {number} min - The minimum port number.
 * @param {number} max - The maximum port number.
 * @param {"udp4"|"udp6"} [protocol="udp4"] - The socket type.
 * @param {InterfaceAddresses} [interfaceAddresses] - The interface addresses mapping.
 * @returns {Promise<number>} The available port within range.
 * @throws {Error} If no port is found within the range.
 */
async function findPort(min: any, max: any, protocol: any = 'udp4', interfaceAddresses: any) {
  let port;

  for (let i = min; i <= max; i++) {
    const socket = dgram.createSocket(protocol);

    setImmediate(() =>
      socket.bind({
        port: i,
        address: interfaceAddress(protocol, interfaceAddresses),
      }),
    );

    const error = await new Promise(resolve => {
      socket.once('error', resolve);
      socket.once('listening', () => resolve(null));
    });

    await new Promise(resolve => socket.close(() => resolve(undefined)));

    if (error) continue;

    const addressInfo = socket.address();
    if (addressInfo && addressInfo.port >= min && addressInfo.port <= max) {
      port = addressInfo.port;
      break;
    }
  }

  if (!port) throw new Error('port not found');
  return port;
}

function parseStreamKey(key: any) {
  const Arr = key.split(':');
  const type = Arr[0];
  const guildId = type == 'guild' ? Arr[1] : null;
  const channelId = type == 'guild' ? Arr[2] : Arr[1];
  const userId = type == 'guild' ? Arr[3] : Arr[2];
  return { type, guildId, channelId, userId };
}

export { randomPort, randomPorts, findPort, interfaceAddress, parseStreamKey };
export default {
  randomPort,
  randomPorts,
  findPort,
  interfaceAddress,
  parseStreamKey,
};
