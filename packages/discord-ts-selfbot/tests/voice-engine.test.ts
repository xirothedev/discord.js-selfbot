import { Buffer } from 'node:buffer';
import { EventEmitter } from 'node:events';
import { expect, test } from 'bun:test';
import VoiceConnection from '../src/client/voice/VoiceConnection';
import { ClientVoiceManager, Constants } from '../src/index';

const GUILD_ID = '900000000000000300';
const CHANNEL_ID = '900000000000000301';
const USER_ID = '900000000000000001';
const SESSION_MODE = 'aead_xchacha20poly1305_rtpsize';

class FakeVoiceWebSocket extends EventEmitter {
  constructor(connection) {
    super();
    this.connection = connection;
    this.connectCalls = 0;
    this.shutdownCalls = 0;
    this.packets = [];
  }

  connect() {
    this.connectCalls += 1;
  }

  sendPacket(packet) {
    this.packets.push(packet);
    return Promise.resolve(packet);
  }

  shutdown() {
    this.shutdownCalls += 1;
  }
}

class FakeVoiceUdp extends EventEmitter {
  constructor(connection) {
    super();
    this.connection = connection;
    this.addresses = [];
    this.shutdownCalls = 0;
  }

  createUDPSocket(address) {
    this.addresses.push(address);
  }

  send(packet) {
    return Promise.resolve(packet);
  }

  shutdown() {
    this.shutdownCalls += 1;
  }
}

function createVoiceHarness() {
  const client = new EventEmitter();
  client.user = { id: USER_ID, voice: null };
  client.broadcasts = [];
  client.ws = {
    broadcast(packet) {
      client.broadcasts.push(packet);
      return Promise.resolve(packet);
    },
  };

  const channel = {
    id: CHANNEL_ID,
    type: 2,
    joinable: true,
    full: false,
    guild: { id: GUILD_ID },
    client,
  };

  client.channels = {
    cache: new Map([[CHANNEL_ID, channel]]),
    resolve: value => value,
  };
  client.guilds = { cache: new Map([[GUILD_ID, { id: GUILD_ID }]]) };
  client.voiceStates = { cache: new Map() };

  const sockets = { ws: [], udp: [] };
  const manager = new ClientVoiceManager(client, {
    connectionFactory: (voiceManager, voiceChannel) =>
      new VoiceConnection(voiceManager, voiceChannel, {
        socketFactory: {
          ws: connection => {
            const ws = new FakeVoiceWebSocket(connection);
            sockets.ws.push(ws);
            return ws;
          },
          udp: connection => {
            const udp = new FakeVoiceUdp(connection);
            sockets.udp.push(udp);
            return udp;
          },
        },
      }),
  });

  return { client, channel, manager, sockets };
}

function finishVoiceHandshake(harness) {
  harness.manager.onVoiceStateUpdate({
    guild_id: GUILD_ID,
    channel_id: CHANNEL_ID,
    session_id: 'test-session',
    user_id: USER_ID,
  });
  harness.manager.onVoiceServer({
    guild_id: GUILD_ID,
    channel_id: CHANNEL_ID,
    token: 'test-voice-token',
    endpoint: 'voice.example.test:443',
  });
}

function emitVoiceReady(harness) {
  harness.sockets.ws[0].emit('ready', {
    ssrc: 4321,
    ip: '203.0.113.10',
    port: 443,
    modes: [SESSION_MODE],
  });
  harness.sockets.ws[0].emit('sessionDescription', { mode: SESSION_MODE });
}

function expectPlayError(call) {
  let error;
  try {
    call();
  } catch (caught) {
    error = caught;
  }
  expect(error).toBeInstanceOf(Error);
  expect(error.code).toBe('VOICE_PLAY_INTERFACE_BAD_TYPE');
  expect(error.message).toBe('Unknown stream type');
}

test('ClientVoiceManager#joinChannel broadcasts the expected VOICE_STATE_UPDATE payload', async () => {
  const harness = createVoiceHarness();
  const joinPromise = harness.manager.joinChannel(harness.channel, { selfMute: true, selfDeaf: true });

  expect(harness.client.broadcasts).toHaveLength(1);
  expect(harness.client.broadcasts[0]).toEqual({
    op: Constants.Opcodes.VOICE_STATE_UPDATE,
    d: {
      guild_id: GUILD_ID,
      channel_id: CHANNEL_ID,
      self_mute: true,
      self_deaf: true,
      self_video: false,
      flags: 2,
    },
  });

  harness.manager.connection.authenticateFailed('VOICE_CONNECTION_TIMEOUT');
  await expect(joinPromise).rejects.toThrow('Connection not established within 15 seconds.');
  expect(harness.manager.connection).toBeNull();
});

test('VoiceConnection moves connecting -> ready over mocked voice sockets', async () => {
  const harness = createVoiceHarness();
  const joinPromise = harness.manager.joinChannel(harness.channel);
  const connection = harness.manager.connection;

  expect(connection.status).toBe(Constants.VoiceStatus.AUTHENTICATING);

  harness.manager.onVoiceStateUpdate({
    guild_id: GUILD_ID,
    channel_id: CHANNEL_ID,
    session_id: 'test-session',
    user_id: USER_ID,
  });
  expect(connection.status).toBe(Constants.VoiceStatus.AUTHENTICATING);

  harness.manager.onVoiceServer({
    guild_id: GUILD_ID,
    channel_id: CHANNEL_ID,
    token: 'test-voice-token',
    endpoint: 'voice.example.test:443',
  });
  expect(connection.status).toBe(Constants.VoiceStatus.CONNECTING);
  expect(harness.sockets.ws).toHaveLength(1);
  expect(harness.sockets.udp).toHaveLength(1);
  expect(harness.sockets.ws[0].connectCalls).toBe(1);

  harness.sockets.ws[0].emit('ready', {
    ssrc: 4321,
    ip: '203.0.113.10',
    port: 443,
    modes: [SESSION_MODE],
  });
  expect(harness.sockets.udp[0].addresses).toEqual(['203.0.113.10']);

  harness.sockets.ws[0].emit('sessionDescription', { mode: SESSION_MODE });
  const joined = await joinPromise;

  expect(joined).toBe(connection);
  expect(connection.status).toBe(Constants.VoiceStatus.CONNECTED);
  expect(connection.authentication.ssrc).toBe(4321);
  expect(harness.sockets.ws[0].packets).toContainEqual(expect.objectContaining({ op: Constants.VoiceOpcodes.SOURCES }));

  connection.disconnect();
});

test('playAudio, playVideo and playStream throw clearly for missing or unsupported input', () => {
  const harness = createVoiceHarness();
  const connection = new VoiceConnection(harness.manager, harness.channel);

  for (const method of ['playAudio', 'playVideo', 'playStream']) {
    expectPlayError(() => connection[method]());
    expectPlayError(() => connection[method](42));
    expectPlayError(() => connection[method](Buffer.from('not media')));
  }

  expectPlayError(() => connection.playAudio('/tmp/track.mp3', { type: 'unsupported' }));
});

test('disconnect destroys the voice connection and clears manager state', async () => {
  const harness = createVoiceHarness();
  const joinPromise = harness.manager.joinChannel(harness.channel);
  const connection = harness.manager.connection;

  finishVoiceHandshake(harness);
  emitVoiceReady(harness);
  await joinPromise;

  const destroyed = [];
  connection.player.dispatcher = {
    destroy() {
      destroyed.push('dispatcher');
    },
  };

  const disconnected = new Promise(resolve => connection.once('disconnect', resolve));
  connection.disconnect();
  await disconnected;

  expect(harness.manager.connection).toBeNull();
  expect(connection.status).toBe(Constants.VoiceStatus.DISCONNECTED);
  expect(connection.sockets.ws).toBeNull();
  expect(connection.sockets.udp).toBeNull();
  expect(connection.player.dispatcher).toBeNull();
  expect(destroyed).toEqual(['dispatcher']);
  expect(harness.sockets.ws[0].shutdownCalls).toBe(1);
  expect(harness.sockets.udp[0].listenerCount('error')).toBe(0);
  expect(harness.client.broadcasts.at(-1)).toEqual({
    op: Constants.Opcodes.VOICE_STATE_UPDATE,
    d: {
      guild_id: GUILD_ID,
      channel_id: null,
      self_mute: false,
      self_deaf: false,
      self_video: false,
      flags: 2,
    },
  });
});
