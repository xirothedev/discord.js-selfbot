import udp from 'dgram';
import EventEmitter from 'events';
import { isIP } from 'net';
import { Buffer } from 'node:buffer';
import _errorsModule from '../../../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../../../util/Constants';
const { VoiceOpcodes } = _ConstantsModule;
import VoiceCodec from '../util/VoiceCodec';

class VoiceConnectionUDPClient extends EventEmitter {
  declare voiceConnection: import('../VoiceConnection').default;
  declare socket: udp.Socket | null;
  declare discordAddress: string | null;
  declare localAddress: string | null;
  declare localPort: number | null;

  constructor(voiceConnection: import('../VoiceConnection').default) {
    super();

    this.voiceConnection = voiceConnection;

    this.socket = null;

    this.discordAddress = null;

    this.localAddress = null;

    this.localPort = null;

    this.voiceConnection.on('closing', this.shutdown.bind(this));
  }

  shutdown() {
    this.emit('debug', `[UDP] shutdown requested`);
    if (this.socket) {
      this.socket.removeAllListeners('message');
      try {
        this.socket.close();
      } finally {
        this.socket = null;
      }
    }
  }

  get discordPort() {
    return this.voiceConnection.authentication.port;
  }

  send(packet: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      if (!this.socket) throw new Error('UDP_SEND_FAIL');
      if (!this.discordAddress || !this.discordPort) throw new Error('UDP_ADDRESS_MALFORMED');
      this.socket.send(packet, 0, packet.length, this.discordPort, this.discordAddress, error => {
        if (error) {
          this.emit('debug', `[UDP] >> ERROR: ${error}`);
          reject(error);
        } else {
          resolve(packet);
        }
      });
    });
  }

  async createUDPSocket(address: string) {
    this.discordAddress = address;
    const socket = (this.socket = udp.createSocket('udp4'));
    socket.on('error', (e: Error) => {
      this.emit('debug', `[UDP] Error: ${e}`);
      this.emit('error', e);
    });
    socket.on('close', () => {
      this.emit('debug', '[UDP] socket closed');
    });
    this.emit('debug', `[UDP] created socket`);
    socket.once('message', (message: Buffer) => {
      this.emit('debug', `[UDP] message: [${[...message]}] (${message})`);
      if (message.readUInt16BE(0) !== 2) {
        throw new Error('UDP_WRONG_HANDSHAKE');
      }
      // Stop if the sockets have been deleted because the connection has been closed already
      if (!this.voiceConnection.sockets.ws) return;

      const packet = parseLocalPacket(message);
      if ('error' in packet) {
        this.emit('debug', `[UDP] ERROR: ${String(packet.error)}`);
        this.emit('error', packet.error);
        return;
      }

      this.emit('debug', `[UDP] Parse local packet: ${packet.address}:${packet.port}`);

      this.localAddress = packet.address;
      this.localPort = packet.port;

      this.voiceConnection.sockets.ws.sendPacket({
        op: VoiceOpcodes.SELECT_PROTOCOL,
        d: {
          protocol: 'udp',
          codecs: VoiceCodec.getAllPayloadType(),
          data: {
            address: packet.address,
            port: packet.port,
            mode: this.voiceConnection.authentication.mode,
          },
        },
      });

      // Write = false
      Object.defineProperty(this.voiceConnection, 'videoCodec', {
        value: this.voiceConnection.videoCodec,
        writable: false,
      });

      this.emit('debug', `[UDP] << ${JSON.stringify(packet)}`);

      socket.on('message', (buffer: Buffer) => this.voiceConnection.receiver.packets.push(buffer));
    });

    const blankMessage = Buffer.alloc(74);
    blankMessage.writeUInt16BE(1, 0);
    blankMessage.writeUInt16BE(70, 2);
    blankMessage.writeUInt32BE(this.voiceConnection.authentication.ssrc, 4);
    this.emit('debug', `Sending IP discovery packet: [${[...blankMessage]}]`);
    await this.send(blankMessage);
    this.emit('debug', `Successfully sent IP discovery packet`);
  }
}

function parseLocalPacket(
  message: Buffer | Uint8Array,
): { address: string; port: number; error?: undefined } | { address?: undefined; port?: undefined; error: unknown } {
  try {
    const packet = Buffer.from(message);
    const address = packet.subarray(8, packet.indexOf(0, 8)).toString('utf8');
    if (!isIP(address)) {
      throw new Error('UDP_ADDRESS_MALFORMED');
    }
    const port = packet.readUInt16BE(packet.length - 2);
    return { address, port };
  } catch (error) {
    return { error };
  }
}

export default VoiceConnectionUDPClient;
export { VoiceConnectionUDPClient };
