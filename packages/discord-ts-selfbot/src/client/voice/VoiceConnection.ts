import EventEmitter from 'node:events';
import { getCiphers } from 'node:crypto';
import { setTimeout } from 'node:timers';
import { Collection } from '@discordjs/collection';
import VoiceUDP from './networking/VoiceUDPClient';
import VoiceWebSocket from './networking/VoiceWebSocket';
import MediaPlayer from './player/MediaPlayer';
import VoiceReceiver from './receiver/Receiver';
import _FunctionModule from './util/Function';

const { parseStreamKey } = _FunctionModule;
import PlayInterface from './util/PlayInterface';
import Silence from './util/Silence';
import _errorsModule from '../../errors';

const { Error } = _errorsModule;
import _ConstantsModule from '../../util/Constants';

const { Opcodes, VoiceOpcodes, VoiceStatus, Events } = _ConstantsModule;
import Speaking from '../../util/Speaking';
import Util from '../../util/Util';
import type { Snowflake } from 'discord-api-types/v10';
import type {
  BitFieldResolvable,
  SpeakingString,
  StreamOptions,
  UserResolvable,
  VideoCodec,
  VideoOptions,
} from '../../../typings';
import type { Client } from '../../client/Client';
import type { Guild } from '../../structures/Guild';
import type AudioDispatcher from './dispatcher/AudioDispatcher';
import type VideoDispatcher from './dispatcher/VideoDispatcher';
import type ClientVoiceManager from './ClientVoiceManager';
import type { Readable } from 'node:stream';

export interface VoiceConnectionChannel {
  id: Snowflake;
  type: string;
  client: Client;
  guild?: Guild | null;
  bitrate?: number;
}

export type SourceVideoCodec = VideoCodec | 'VP9' | 'H265' | 'AV1';

interface VoiceAuthentication {
  token: string | null;
  endpoint: string | null;
  sessionId: string | null;
  ssrc: number;
  mode?: string;
  secret?: string;
  ip?: string;
  port?: number;
  modes?: string[];
  secret_key?: Uint8Array;
}

interface VoiceReadyData {
  ssrc: number;
  ip: string;
  port: number;
  modes: string[];
  experiments?: string[];
  heartbeat_interval: number;
}

interface VoiceSessionDescriptionData {
  mode: string;
  secret: string;
  media_session_id?: string;
  audio_codec?: string;
  video_codec?: string;
}

interface VoiceSpeakingStartData {
  user_id: Snowflake;
  ssrc: number | string;
  speaking: number;
}

interface VoiceStreamingStartData {
  video_ssrc: number | string;
  user_id: Snowflake;
  audio_ssrc: number | string;
}

interface VoiceSpeakingData {
  user_id: Snowflake;
  speaking: number;
  ssrc?: number | string;
}

interface StreamUpdateData {
  paused: boolean;
  region: string | null;
  viewer_ids: string[];
}

interface StreamPacketData {
  stream_key?: string;
  rtc_server_id?: string;
  token?: string;
  endpoint?: string;
  paused?: boolean;
  region?: string | null;
  viewer_ids?: string[];
}

interface StreamPacket {
  ['t']?: string;
  d?: StreamPacketData;
}

interface VoiceStateUpdateOptions {
  guild_id?: Snowflake | null;
  channel_id?: Snowflake | null;
  self_mute?: boolean;
  self_deaf?: boolean;
  self_video?: boolean;
  flags?: number;
}

function isStreamPacket(packet: unknown): packet is StreamPacket {
  return (
    typeof packet === 'object' &&
    packet !== null &&
    't' in packet &&
    'd' in packet
  );
}

// Workaround for Discord now requiring silence to be sent before being able to receive audio
class SingleSilence extends Silence {
  _read() {
    super._read();
    this.push(null);
  }
}

const SUPPORTED_MODES = ['aead_xchacha20_poly1305_rtpsize'];

// Just in case there's some system that doesn't come with aes-256-gcm, conditionally add it as supported
if (getCiphers().includes('aes-256-gcm')) {
  SUPPORTED_MODES.unshift('aead_aes256_gcm_rtpsize');
}

const SUPPORTED_CODECS = ['VP8', 'H264'];

function sendVoicePacket(connection: VoiceConnection, packet: unknown): void {
  const send = async () => {
    try {
      await connection.sockets.ws?.sendPacket(packet);
    } catch (error: unknown) {
      connection.emit('debug', error);
    }
  };
  void send();
}

type StreamPacketTarget = StreamConnection | StreamConnectionReadonly;

function applyStreamEvent(
  connection: VoiceConnection,
  target: StreamPacketTarget,
  event: string,
  data: StreamPacketData
): void {
  switch (event) {
    case 'STREAM_CREATE': {
      target.setSessionId(connection.authentication.sessionId);
      target.serverId = data.rtc_server_id ?? null;
      break;
    }
    case 'STREAM_SERVER_UPDATE': {
      target.setTokenAndEndpoint(data.token ?? null, data.endpoint ?? null);
      break;
    }
    case 'STREAM_DELETE': {
      target.disconnect();
      break;
    }
    case 'STREAM_UPDATE': {
      target.update({
        paused: Boolean(data.paused),
        region: data.region ?? null,
        viewer_ids: data.viewer_ids ?? [],
      });
      break;
    }
    default: {
      break;
    }
  }
}

function routeStreamPacket(connection: VoiceConnection, packet: unknown) {
  if (!isStreamPacket(packet) || !packet.t || !packet.d?.stream_key) {
    return;
  }
  const { t: event, d: data } = packet;
  if (!data.stream_key) {
    return;
  }
  const streamKey = parseStreamKey(data.stream_key);
  if (connection.channel.id !== streamKey.channelId) {
    return;
  }

  const ownConnection = connection.streamConnection;
  if (
    streamKey.userId === connection.channel.client.user?.id &&
    ownConnection
  ) {
    applyStreamEvent(connection, ownConnection, event, data);
  }

  const watchConnection = connection.streamWatchConnection.get(
    streamKey.userId
  );
  if (!watchConnection) {
    return;
  }
  if (event === 'STREAM_DELETE') {
    watchConnection.disconnect();
    watchConnection.receiver.packets.destroyAllStream();
    return;
  }
  applyStreamEvent(connection, watchConnection, event, data);
}

class VoiceConnection extends EventEmitter {
  declare voiceManager: ClientVoiceManager;
  declare channel: VoiceConnectionChannel;
  declare status: number;
  declare speaking: Readonly<Speaking>;
  declare videoStatus: boolean | null;
  declare authentication: VoiceAuthentication;
  declare player: MediaPlayer;
  declare ssrcMap: Map<
    number,
    { userId: string; speaking?: number; hasVideo?: boolean }
  >;
  declare _speaking: Map<string, Readonly<Speaking>>;
  declare sockets: {
    ws?: VoiceWebSocket | null;
    udp?: VoiceUDP | null;
  };
  declare socketFactory: {
    ws?: (connection: VoiceConnection) => VoiceWebSocket;
    udp?: (connection: VoiceConnection) => VoiceUDP;
  };
  declare receiver: VoiceReceiver;
  declare videoCodec: SourceVideoCodec;
  declare _streamConnection: StreamConnection | null;
  declare _streamWatchConnection: Collection<string, StreamConnectionReadonly>;
  declare connectTimeout?: NodeJS.Timeout;
  declare eventHook: boolean;
  declare serverId?: string | null;

  get streamConnection(): StreamConnection | null {
    return this._streamConnection;
  }

  set streamConnection(value: StreamConnection | null) {
    this._streamConnection = value;
  }

  get streamWatchConnection(): Collection<string, StreamConnectionReadonly> {
    return this._streamWatchConnection;
  }

  set streamWatchConnection(
    value: Collection<string, StreamConnectionReadonly>
  ) {
    this._streamWatchConnection = value;
  }

  constructor(
    voiceManager: ClientVoiceManager,
    channel: VoiceConnectionChannel,
    options: { socketFactory?: VoiceConnection['socketFactory'] } = {}
  ) {
    super();

    this.voiceManager = voiceManager;

    this.channel = channel;

    this.status = VoiceStatus.AUTHENTICATING;

    this.speaking = new Speaking().freeze();

    this.videoStatus = null;

    this.authentication = {
      endpoint: null,
      sessionId: null,
      ssrc: 0,
      token: null,
    };

    this.player = new MediaPlayer(
      this,
      this.constructor.name === 'StreamConnection'
    );

    this.player.on('debug', (message: string) => {
      this.emit('debug', `media player - ${message}`);
    });

    this.player.on('error', (e: Error) => {
      this.emit('warn', e);
    });

    this.once('closing', () => this.player.destroy());

    this.ssrcMap = new Map();

    this._speaking = new Map();

    this.sockets = {};

    this.socketFactory = options.socketFactory ?? {};

    this.receiver = new VoiceReceiver(this);

    this.videoCodec = 'H264';

    this.streamConnection = null;

    this.streamWatchConnection = new Collection();
  }

  get client() {
    return this.voiceManager.client;
  }

  get dispatcher() {
    return this.player.dispatcher;
  }

  get videoDispatcher() {
    return this.player.videoDispatcher;
  }

  setSpeaking(value: BitFieldResolvable<SpeakingString, number>) {
    if (this.speaking.equals(value)) {
      return;
    }
    if (this.status !== VoiceStatus.CONNECTED) {
      return;
    }
    this.speaking = new Speaking(value).freeze();
    sendVoicePacket(this, {
      d: {
        delay: 0,
        speaking: this.speaking.bitfield,
        ssrc: this.authentication.ssrc,
      },
      op: VoiceOpcodes.SPEAKING,
    });
  }

  setVideoCodec(value: SourceVideoCodec) {
    if (!SUPPORTED_CODECS.includes(value)) {
      throw new Error('INVALID_VIDEO_CODEC', SUPPORTED_CODECS);
    }
    this.videoCodec = value;
    return this;
  }

  setVideoStatus(value: boolean) {
    if (value === this.videoStatus) {
      return;
    }
    if (this.status !== VoiceStatus.CONNECTED) {
      return;
    }
    this.videoStatus = value;
    if (value) {
      sendVoicePacket(this, {
        d: {
          audio_ssrc: this.authentication.ssrc,
          rtx_ssrc: this.authentication.ssrc + 2,
          streams: [
            {
              active: true,
              max_bitrate: 8_000_000,
              max_framerate: 60,
              max_resolution: {
                height: 0,
                type: 'source',
                width: 0,
              },
              quality: 100,
              rid: '100',
              rtx_ssrc: this.authentication.ssrc + 2,
              ssrc: this.authentication.ssrc + 1,
              type: 'video',
            },
          ],
          video_ssrc: this.authentication.ssrc + 1,
        },
        op: VoiceOpcodes.SOURCES,
      });
    } else {
      sendVoicePacket(this, {
        d: {
          audio_ssrc: this.authentication.ssrc,
          rtx_ssrc: 0,
          streams: [],
          video_ssrc: 0,
        },
        op: VoiceOpcodes.SOURCES,
      });
    }
  }

  get voice() {
    return this.client.user?.voice;
  }

  sendVoiceStateUpdate(options: VoiceStateUpdateOptions = {}): void {
    const data: Required<VoiceStateUpdateOptions> = {
      channel_id: this.channel.id,
      flags: 2,
      guild_id: this.channel.guild?.id ?? null,
      self_deaf: this.voice ? Boolean(this.voice.selfDeaf) : false,
      self_mute: this.voice ? Boolean(this.voice.selfMute) : false,
      self_video: this.voice ? Boolean(this.voice.selfVideo) : false,
      ...options,
    };

    this.emit('debug', `Sending voice state update: ${JSON.stringify(data)}`);

    this.channel.client.ws.broadcast({
      d: data,
      op: Opcodes.VOICE_STATE_UPDATE,
    });
  }

  setTokenAndEndpoint(token: string | null, endpoint: string | null) {
    this.emit(
      'debug',
      `Token "${Util.redact(token)}" and endpoint "${endpoint}"`
    );
    if (!endpoint) {
      // Signifies awaiting endpoint stage
      return;
    }

    if (!token) {
      this.authenticateFailed('VOICE_TOKEN_ABSENT');
      return;
    }

    const host = endpoint.match(/^(?<host>[^:]*)/u)?.groups?.host ?? '';
    this.emit('debug', `Endpoint resolved as ${host}`);

    if (!host) {
      this.authenticateFailed('VOICE_INVALID_ENDPOINT');
      return;
    }

    if (this.status === VoiceStatus.AUTHENTICATING) {
      this.authentication.token = token;
      this.authentication.endpoint = host;
      this.checkAuthenticated();
    } else if (
      token !== this.authentication.token ||
      host !== this.authentication.endpoint
    ) {
      this.reconnect(token, host);
    }
  }

  setSessionId(sessionId: string | null) {
    this.emit(
      'debug',
      `Setting sessionId ${sessionId} (stored as "${this.authentication.sessionId}")`
    );
    if (!sessionId) {
      this.authenticateFailed('VOICE_SESSION_ABSENT');
      return;
    }

    if (this.status === VoiceStatus.AUTHENTICATING) {
      this.authentication.sessionId = sessionId;
      this.checkAuthenticated();
    } else if (sessionId !== this.authentication.sessionId) {
      this.authentication.sessionId = sessionId;
      this.emit('newSession', sessionId);
    }
  }

  checkAuthenticated() {
    const { token, endpoint, sessionId } = this.authentication;
    this.emit('debug', `Authenticated with sessionId ${sessionId}`);
    if (token && endpoint && sessionId) {
      this.status = VoiceStatus.CONNECTING;
      this.emit('authenticated');
      this.connect();
    }
  }

  authenticateFailed(reason: string) {
    clearTimeout(this.connectTimeout);
    this.emit('debug', `Authenticate failed - ${reason}`);
    if (this.status === VoiceStatus.AUTHENTICATING) {
      this.emit('failed', new Error(reason));
    } else {
      this.emit('error', new Error(reason));
    }
    this.status = VoiceStatus.DISCONNECTED;
  }

  updateChannel(channel: VoiceConnectionChannel) {
    this.channel = channel;
    this.sendVoiceStateUpdate();
  }

  authenticate(options: VoiceStateUpdateOptions = {}) {
    this.sendVoiceStateUpdate(options);
    this.connectTimeout = setTimeout(
      () => this.authenticateFailed('VOICE_CONNECTION_TIMEOUT'),
      15_000
    ).unref();
  }

  reconnect(token: string, endpoint: string) {
    this.authentication.token = token;
    this.authentication.endpoint = endpoint;
    this.speaking = new Speaking().freeze();
    this.status = VoiceStatus.RECONNECTING;
    this.emit('debug', `Reconnecting to ${endpoint}`);
    this.emit('reconnecting');
    this.connect();
  }

  disconnect() {
    this.emit('closing');
    this.emit('debug', 'disconnect() triggered');
    clearTimeout(this.connectTimeout);
    const conn = this.voiceManager.connection;
    if (conn === this) {
      this.voiceManager.connection = null;
    }
    this.sendVoiceStateUpdate({
      channel_id: null,
    });
    this._disconnect();
  }

  _disconnect() {
    this.cleanup();
    this.status = VoiceStatus.DISCONNECTED;
    this.emit('disconnect');
  }

  cleanup() {
    this.player.destroy();
    this.speaking = new Speaking().freeze();
    const { ws, udp } = this.sockets;

    this.emit('debug', 'Connection clean up');

    if (ws) {
      ws.removeAllListeners('error');
      ws.removeAllListeners('ready');
      ws.removeAllListeners('sessionDescription');
      ws.removeAllListeners('speaking');
      ws.shutdown();
    }

    if (udp) {
      udp.removeAllListeners('error');
    }

    this.sockets.ws = null;
    this.sockets.udp = null;
  }

  connect() {
    this.emit('debug', `Connect triggered`);
    if (this.status !== VoiceStatus.RECONNECTING) {
      if (this.sockets.ws) {
        throw new Error('WS_CONNECTION_EXISTS');
      }
      if (this.sockets.udp) {
        throw new Error('UDP_CONNECTION_EXISTS');
      }
    }

    if (this.sockets.ws) {
      this.sockets.ws.shutdown();
    }
    if (this.sockets.udp) {
      this.sockets.udp.shutdown();
    }

    this.sockets.ws = this.socketFactory.ws
      ? this.socketFactory.ws(this)
      : new VoiceWebSocket(this);
    this.sockets.udp = this.socketFactory.udp
      ? this.socketFactory.udp(this)
      : new VoiceUDP(this);

    const { ws, udp } = this.sockets;

    ws.on('debug', (msg: string) => this.emit('debug', msg));
    udp.on('debug', (msg: string) => this.emit('debug', msg));
    ws.on('error', (err: Error) => this.emit('error', err));
    udp.on('error', (err: Error) => this.emit('error', err));
    ws.on('ready', this.onReady.bind(this));
    ws.on('sessionDescription', this.onSessionDescription.bind(this));
    ws.on('startSpeaking', this.onStartSpeaking.bind(this));
    ws.on('startStreaming', this.onStartStreaming.bind(this));

    this.sockets.ws.connect();
  }

  onReady(data: VoiceReadyData) {
    Object.assign(this.authentication, data);
    for (const mode of data.modes) {
      if (SUPPORTED_MODES.includes(mode)) {
        this.authentication.mode = mode;
        this.emit('debug', `Selecting the ${mode} mode`);
        break;
      }
    }
    this.sockets.udp?.createUDPSocket(data.ip);
  }

  onSessionDescription(data: VoiceSessionDescriptionData) {
    Object.assign(this.authentication, data);
    this.status = VoiceStatus.CONNECTED;
    const ready = () => {
      clearTimeout(this.connectTimeout);
      this.emit(
        'debug',
        `Ready with authentication details: ${JSON.stringify(this.authentication)}`
      );
      this.emit('ready');
    };
    if (this.player.dispatcher || this.player.videoDispatcher) {
      ready();
    } else {
      // This serves to provide support for voice receive, sending audio is required to receive it.
      const dispatcher = this.playAudio(new SingleSilence(), {
        type: 'opus',
        volume: false,
      });
      dispatcher.once('finish', ready);
    }
  }

  onStartSpeaking({ user_id, ssrc, speaking }: VoiceSpeakingStartData) {
    this.ssrcMap.set(+ssrc, {
      ...this.ssrcMap.get(+ssrc),
      speaking,
      userId: user_id,
    });
  }

  onStartStreaming({
    video_ssrc,
    user_id,
    audio_ssrc,
  }: VoiceStreamingStartData) {
    this.ssrcMap.set(+audio_ssrc, {
      ...this.ssrcMap.get(+audio_ssrc),
      // Maybe ?
      hasVideo: Boolean(video_ssrc),
      userId: user_id,
    });
  }

  onSpeaking({ user_id, speaking: speakingBits }: VoiceSpeakingData) {
    const speaking = new Speaking(speakingBits).freeze();
    const { guild } = this.channel;
    const user = this.client.users.cache.get(user_id);
    const old = this._speaking.get(user_id) || new Speaking(0).freeze();
    this._speaking.set(user_id, speaking);
    if (this.status === VoiceStatus.CONNECTED) {
      this.emit('speaking', user, speaking);
      if (!speaking.has(Speaking.FLAGS.SPEAKING)) {
        this.receiver.packets._stoppedSpeaking(user_id);
      }
    }

    if (guild && user && !speaking.equals(old)) {
      const member = guild.members.cache.get(user_id);
      if (member) {
        this.client.emit(Events.GUILD_MEMBER_SPEAKING, member, speaking);
      }
    }
  }

  declare playAudio: (
    resource: Readable | string,
    options?: StreamOptions
  ) => AudioDispatcher;
  declare playVideo: (
    resource: Readable | string,
    options?: VideoOptions
  ) => VideoDispatcher;

  createStreamConnection(): Promise<StreamConnection> {
    const { streamConnection } = this;
    if (streamConnection) {
      return Promise.resolve(streamConnection);
    }

    const pending = Promise.withResolvers<StreamConnection>();
    const { resolve, reject } = pending;

    const connection = new StreamConnection(
      this.voiceManager,
      this.channel,
      this
    );
    this.streamConnection = connection;
    // Sync :?
    connection.setVideoCodec(this.videoCodec);
    // Setup event...
    if (!this.eventHook) {
      // Dont listen this event two times :/
      this.eventHook = true;
      this.channel.client.on('raw', (packet: unknown) => {
        routeStreamPacket(this, packet);
      });
    }

    connection.sendSignalScreenshare();
    connection.sendScreenshareState(true);

    connection.on('debug', (msg: string) =>
      this.channel.client.emit(
        'debug',
        `[VOICE STREAM (${this.channel.guild?.id || this.channel.id}:${connection.status})]: ${msg}`
      )
    );
    connection.once('failed', (reason: unknown) => {
      this.streamConnection = null;
      reject(reason);
    });

    connection.on('error', reject);

    connection.once('authenticated', () => {
      connection.once('ready', () => {
        resolve(connection);
        connection.removeListener('error', reject);
      });
      connection.once('disconnect', () => {
        this.streamConnection = null;
      });
    });

    return pending.promise;
  }

  joinStreamConnection(
    user: UserResolvable
  ): Promise<StreamConnectionReadonly> {
    const userId = this.client.users.resolveId(user);
    // Check if user is streaming
    if (!userId) {
      return Promise.reject(new Error('VOICE_USER_MISSING'));
    }
    const voiceState =
      this.channel.guild?.voiceStates.cache.get(userId) ||
      this.client.voiceStates.cache.get(userId);
    if (!voiceState || !voiceState.streaming) {
      return Promise.reject(new Error('VOICE_USER_NOT_STREAMING'));
    }
    const existing = this.streamWatchConnection.get(userId);
    if (existing) {
      return Promise.resolve(existing);
    }

    const pending = Promise.withResolvers<StreamConnectionReadonly>();
    const { resolve, reject } = pending;

    const connection = new StreamConnectionReadonly(
      this.voiceManager,
      this.channel,
      this,
      userId
    );
    this.streamWatchConnection.set(userId, connection);
    connection.setVideoCodec(this.videoCodec);
    // Setup event...
    if (!this.eventHook) {
      // Dont listen this event two times :/
      this.eventHook = true;
      this.channel.client.on('raw', (packet: unknown) => {
        routeStreamPacket(this, packet);
      });
    }

    connection.sendSignalScreenshare();

    connection.on('debug', (msg: string) =>
      this.channel.client.emit(
        'debug',
        `[VOICE STREAM WATCH (${userId}>${this.channel.guild?.id || this.channel.id}:${
          connection.status
        })]: ${msg}`
      )
    );
    connection.once('failed', (reason: unknown) => {
      this.streamWatchConnection.delete(userId);
      reject(reason);
    });

    connection.on('error', reject);

    connection.once('authenticated', () => {
      connection.once('ready', () => {
        resolve(connection);
        connection.removeListener('error', reject);
      });
      connection.once('disconnect', () => {
        this.streamWatchConnection.delete(userId);
      });
    });

    return pending.promise;
  }
}

class StreamConnection extends VoiceConnection {
  #requestDisconnect = false;
  declare voiceConnection: VoiceConnection;
  declare serverId: string | null;
  declare isPaused: boolean | null;
  declare viewerIds: string[];
  declare region: string | null;
  constructor(
    voiceManager: ClientVoiceManager,
    channel: VoiceConnectionChannel,
    voiceConnection: VoiceConnection
  ) {
    super(voiceManager, channel);

    this.voiceConnection = voiceConnection;

    Object.defineProperty(this, 'voiceConnection', {
      value: voiceConnection,
      writable: false,
    });

    this.serverId = null;

    this.isPaused = null;

    this.viewerIds = [];

    this.region = null;
  }

  override createStreamConnection() {
    return Promise.resolve(this);
  }

  override joinStreamConnection(): never {
    throw new Error('STREAM_CANNOT_JOIN');
  }

  get streamConnection() {
    return this;
  }

  set streamConnection(_value: StreamConnection | null) {
    // Why ?
  }

  get streamWatchConnection(): Collection<string, StreamConnectionReadonly> {
    return new Collection();
  }

  set streamWatchConnection(
    _value: Collection<string, StreamConnectionReadonly>
  ) {
    // Why ?
  }

  override disconnect() {
    if (this.#requestDisconnect) {
      return;
    }
    this.emit('closing');
    this.emit('debug', 'Stream: disconnect() triggered');
    clearTimeout(this.connectTimeout);
    if (this.voiceConnection.streamConnection === this) {
      this.voiceConnection.streamConnection = null;
    }
    this.sendStopScreenshare();
    this._disconnect();
  }

  sendSignalScreenshare() {
    const data = {
      channel_id: this.channel.id,
      guild_id: this.channel.guild?.id || null,
      preferred_region: null,
      type: ['DM', 'GROUP_DM'].includes(this.channel.type) ? 'call' : 'guild',
    };
    this.emit('debug', `Signal Stream: ${JSON.stringify(data)}`);
    return this.channel.client.ws.broadcast({
      d: data,
      op: Opcodes.STREAM_CREATE,
    });
  }

  sendScreenshareState(isPaused = false) {
    if (isPaused === this.isPaused) {
      return;
    }
    this.emit(
      'streamUpdate',
      {
        isPaused: this.isPaused,
        region: this.region,
        viewerIds: this.viewerIds,
      },
      {
        isPaused,
        region: this.region,
        viewerIds: this.viewerIds,
      }
    );
    this.isPaused = isPaused;
    this.channel.client.ws.broadcast({
      d: {
        paused: isPaused,
        stream_key: this.streamKey,
      },
      op: Opcodes.STREAM_SET_PAUSED,
    });
  }

  sendStopScreenshare() {
    this.#requestDisconnect = true;
    this.channel.client.ws.broadcast({
      d: {
        stream_key: this.streamKey,
      },
      op: Opcodes.STREAM_DELETE,
    });
  }

  update(data: StreamUpdateData) {
    this.emit(
      'streamUpdate',
      {
        isPaused: this.isPaused,
        region: this.region,
        viewerIds: [...this.viewerIds],
      },
      {
        isPaused: data.paused,
        region: data.region,
        viewerIds: data.viewer_ids,
      }
    );
    this.viewerIds = data.viewer_ids;
    this.region = data.region;
  }

  get streamKey() {
    return `${
      ['DM', 'GROUP_DM'].includes(this.channel.type)
        ? 'call'
        : `guild:${this.channel.guild?.id ?? this.channel.id}`
    }:${this.channel.id}:${this.channel.client.user?.id}`;
  }
}

class StreamConnectionReadonly extends VoiceConnection {
  #requestDisconnect = false;
  declare voiceConnection: VoiceConnection;
  declare userId: string;
  declare serverId: string | null;
  declare isPaused: boolean;
  declare viewerIds: string[];
  declare region: string | null;
  constructor(
    voiceManager: ClientVoiceManager,
    channel: VoiceConnectionChannel,
    voiceConnection: VoiceConnection,
    userId: Snowflake
  ) {
    super(voiceManager, channel);

    this.voiceConnection = voiceConnection;

    this.userId = userId;

    Object.defineProperty(this, 'voiceConnection', {
      value: voiceConnection,
      writable: false,
    });

    this.serverId = null;

    this.isPaused = false;

    this.viewerIds = [];

    this.region = null;
  }

  override createStreamConnection(): never {
    throw new Error('STREAM_CONNECTION_READONLY');
  }

  override joinStreamConnection(): Promise<this> {
    return Promise.resolve(this);
  }

  get streamConnection() {
    return null;
  }

  set streamConnection(_value: StreamConnection | null) {
    // Why ?
  }

  get streamWatchConnection(): Collection<string, StreamConnectionReadonly> {
    return new Collection();
  }

  set streamWatchConnection(
    _value: Collection<string, StreamConnectionReadonly>
  ) {
    // Why ?
  }

  override disconnect() {
    if (this.#requestDisconnect) {
      return;
    }
    this.emit('closing');
    this.emit('debug', 'Stream: disconnect() triggered');
    clearTimeout(this.connectTimeout);
    this.voiceConnection.streamWatchConnection.delete(this.userId);
    this.sendStopScreenshare();
    this._disconnect();
  }

  sendSignalScreenshare() {
    this.emit('debug', `Signal Stream Watch: ${this.streamKey}`);
    return this.channel.client.ws.broadcast({
      d: {
        stream_key: this.streamKey,
      },
      op: Opcodes.STREAM_WATCH,
    });
  }

  sendStopScreenshare() {
    this.#requestDisconnect = true;
    this.channel.client.ws.broadcast({
      d: {
        stream_key: this.streamKey,
      },
      op: Opcodes.STREAM_DELETE,
    });
  }

  update(data: StreamUpdateData) {
    this.emit(
      'streamUpdate',
      {
        isPaused: this.isPaused,
        region: this.region,
        viewerIds: [...this.viewerIds],
      },
      {
        isPaused: data.paused,
        region: data.region,
        viewerIds: data.viewer_ids,
      }
    );
    this.isPaused = data.paused;
    this.viewerIds = data.viewer_ids;
    this.region = data.region;
  }

  get streamKey() {
    return `${
      ['DM', 'GROUP_DM'].includes(this.channel.type)
        ? 'call'
        : `guild:${this.channel.guild?.id ?? this.channel.id}`
    }:${this.channel.id}:${this.userId}`;
  }
}

PlayInterface.applyToClass(VoiceConnection);
PlayInterface.applyToClass(StreamConnection);

export default VoiceConnection;
export { VoiceConnection };
