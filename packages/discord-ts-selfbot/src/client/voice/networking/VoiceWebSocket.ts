import EventEmitter from 'node:events';
import { setTimeout, setInterval } from 'node:timers';
import WebSocket from '../../../WebSocket';
import _errorsModule from '../../../errors';

const { Error } = _errorsModule;
import _ConstantsModule from '../../../util/Constants';
import type VoiceConnection from '../VoiceConnection';
import type { WebSocket as WebSocketType } from 'ws';

const { Opcodes, VoiceOpcodes } = _ConstantsModule;

interface VoiceGatewayData {
  heartbeat_interval?: number;
  secret_key?: Uint8Array | number[];
  audio_ssrc?: number | string;
  user_id?: string;
  video_ssrc?: number | string;
  [key: string]: unknown;
}

interface VoiceGatewayPacket {
  op?: number;
  seq?: number;
  d?: VoiceGatewayData;
}

function isVoiceGatewayPacket(value: unknown): value is VoiceGatewayPacket {
  return typeof value === 'object' && value !== null;
}

interface CloseEventLike {
  code?: number;
  reason?: string;
  wasClean?: boolean;
}

class VoiceWebSocket extends EventEmitter {
  declare connection: VoiceConnection;
  declare attempts: number;
  declare _sequenceNumber: number;
  declare dead: boolean;
  declare ws: WebSocketType | null;
  declare heartbeatInterval: NodeJS.Timeout | null;

  constructor(connection: VoiceConnection) {
    super();
    this.connection = connection;

    this.attempts = 0;

    this._sequenceNumber = -1;

    this.dead = false;
    this.connection.on('closing', this.shutdown.bind(this));
  }

  get client() {
    return this.connection.client;
  }

  shutdown() {
    this.emit('debug', `[WS] shutdown requested`);
    this.dead = true;
    this.reset();
  }

  reset() {
    this.emit('debug', `[WS] reset requested`);
    if (this.ws) {
      if (this.ws.readyState !== WebSocket.CLOSED) {
        this.ws.close();
      }
      this.ws = null;
    }
    this.clearHeartbeat();
  }

  connect() {
    this.emit('debug', `[WS] connect requested`);
    if (this.dead) {
      return;
    }
    if (this.ws) {
      this.reset();
    }
    if (this.attempts >= 5) {
      this.emit(
        'debug',
        new Error('VOICE_CONNECTION_ATTEMPTS_EXCEEDED', this.attempts)
      );
      return;
    }

    this.attempts++;

    const ws = WebSocket.create(
      `wss://${this.connection.authentication.endpoint ?? ''}/`,
      Object.fromEntries([['v', 8]])
    );
    this.ws = ws;
    this.emit('debug', `[WS] connecting, ${this.attempts} attempts, ${ws.url}`);
    ws.addEventListener('open', this.onOpen.bind(this));
    ws.addEventListener('message', this.onMessage.bind(this));
    ws.addEventListener('close', this.onClose.bind(this));
    ws.addEventListener('error', this.onError.bind(this));
  }

  send(data: string): Promise<string> {
    this.emit('debug', `[WS] >> ${data}`);
    const { ws } = this;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('WS_NOT_OPEN', data));
    }
    const pending = Promise.withResolvers<string>();
    ws.send(data, {}, (sendError) => {
      if (sendError) {
        pending.reject(sendError);
      } else {
        pending.resolve(data);
      }
    });
    return pending.promise;
  }

  async sendPacket(packet: unknown): Promise<string> {
    return this.send(JSON.stringify(packet));
  }

  onOpen() {
    this.emit(
      'debug',
      `[WS] opened at gateway ${this.connection.authentication.endpoint}`
    );
    const packet: VoiceGatewayPacket = {
      d: {
        server_id:
          this.connection.serverId ||
          this.connection.channel.guild?.id ||
          this.connection.channel.id,
        session_id: this.connection.authentication.sessionId,
        token: this.connection.authentication.token,
        user_id: this.client.user?.id,
        video: false,
      },
      op: Opcodes.DISPATCH,
    };
    this.sendPacket(packet).catch(() => {
      this.emit('error', new Error('VOICE_JOIN_SOCKET_CLOSED'));
    });
  }

  onMessage(event: { data: unknown }) {
    let packet: unknown;
    try {
      packet = WebSocket.unpack(event.data, 'json');
    } catch (error) {
      this.onError(error);
      return;
    }
    if (isVoiceGatewayPacket(packet)) {
      this.onPacket(packet);
    }
  }

  onClose(event: CloseEventLike) {
    this.emit(
      'debug',
      `[WS] closed with code ${event.code} and reason: ${event.reason}`
    );
    if (event.code === 4017) {
      this.dead = true;
      this.emit(
        'error',
        new Error(
          'DAVE (E2EE) protocol required by Discord; voice connections are not supported until DAVE is implemented'
        )
      );
      return;
    }
    if (!this.dead) {
      setTimeout(this.connect.bind(this), this.attempts * 1000).unref();
    }
  }

  onError(error: unknown) {
    this.emit('debug', `[WS] Error: ${String(error)}`);
    this.emit('error', error);
  }

  onPacket(packet: VoiceGatewayPacket) {
    this.emit('debug', `[WS] << ${JSON.stringify(packet)}`);
    if (packet.seq) {
      this._sequenceNumber = packet.seq;
    }
    switch (packet.op) {
      case VoiceOpcodes.HELLO: {
        if (typeof packet.d?.heartbeat_interval === 'number') {
          this.setHeartbeat(packet.d.heartbeat_interval);
        }
        break;
      }
      case VoiceOpcodes.READY: {
        this.emit('ready', packet.d);
        this.connection.setVideoStatus(false);
        break;
      }
      case VoiceOpcodes.SESSION_DESCRIPTION: {
        if (packet.d?.secret_key) {
          packet.d.secret_key = new Uint8Array(packet.d.secret_key);
        }
        this.emit('sessionDescription', packet.d);
        break;
      }
      case VoiceOpcodes.CLIENT_CONNECT: {
        if (packet.d?.audio_ssrc !== undefined && packet.d.user_id) {
          this.connection.ssrcMap.set(+packet.d.audio_ssrc, {
            hasVideo: Boolean(packet.d.video_ssrc),
            speaking: 0,
            userId: packet.d.user_id,
          });
        }
        break;
      }
      case VoiceOpcodes.CLIENT_DISCONNECT: {
        const userId = packet.d?.user_id;
        const streamInfo = userId
          ? this.connection.receiver.packets.streams.get(userId)
          : undefined;
        if (userId && streamInfo) {
          this.connection.receiver.packets.streams.delete(userId);
          streamInfo.stream.push(null);
        }
        break;
      }
      case VoiceOpcodes.SPEAKING: {
        this.emit('startSpeaking', packet.d);
        break;
      }
      case VoiceOpcodes.SOURCES: {
        this.emit('startStreaming', packet.d);
        break;
      }
      default: {
        this.emit('unknownPacket', packet);
        break;
      }
    }
  }

  setHeartbeat(interval: number) {
    if (!interval || Number.isNaN(interval)) {
      this.onError(new Error('VOICE_INVALID_HEARTBEAT'));
      return;
    }
    if (this.heartbeatInterval) {
      this.emit('warn', 'A voice heartbeat interval is being overwritten');
      clearInterval(this.heartbeatInterval);
    }
    this.heartbeatInterval = setInterval(
      this.sendHeartbeat.bind(this),
      interval
    ).unref();
  }

  clearHeartbeat() {
    if (!this.heartbeatInterval) {
      this.emit(
        'warn',
        'Tried to clear a heartbeat interval that does not exist'
      );
      return;
    }
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
  }

  sendHeartbeat() {
    this.sendPacket({
      d: Object.fromEntries([
        ['seq_ack', this._sequenceNumber],
        ['t', Date.now()],
      ]),
      op: VoiceOpcodes.HEARTBEAT,
    }).catch(() => {
      this.emit('warn', 'Tried to send heartbeat, but connection is not open');
      this.clearHeartbeat();
    });
  }
}

export default VoiceWebSocket;
export { VoiceWebSocket };
