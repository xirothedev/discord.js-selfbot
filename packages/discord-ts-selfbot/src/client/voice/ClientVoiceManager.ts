import VoiceConnection from './VoiceConnection';
import type { VoiceConnectionChannel, SourceVideoCodec } from './VoiceConnection';
import type { Snowflake } from 'discord-api-types/v10';
import type { Client } from '../../client/Client';
import _errorsModule from '../../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

interface VoiceServerUpdatePayload {
  guild_id?: Snowflake | null;
  channel_id?: Snowflake | null;
  token?: string | null;
  endpoint?: string | null;
}

interface VoiceStateUpdatePayload {
  guild_id?: Snowflake | null;
  session_id?: string;
  channel_id?: Snowflake | null;
  user_id?: Snowflake;
}

interface ClientVoiceManagerOptions {
  connectionFactory?: (voiceManager: ClientVoiceManager, channel: VoiceConnectionChannel) => VoiceConnection;
}

interface JoinChannelConfig {
  selfMute?: boolean;
  selfDeaf?: boolean;
  selfVideo?: boolean;
  videoCodec?: SourceVideoCodec;
}

type VoiceAdapter = {
  destroy(): void;
  onVoiceServerUpdate(payload: unknown): void;
  onVoiceStateUpdate(payload: unknown): void;
};

class ClientVoiceManager {
  declare client: Client;
  declare connectionFactory: (voiceManager: ClientVoiceManager, channel: VoiceConnectionChannel) => VoiceConnection;
  declare connection: VoiceConnection | null;
  declare adapters: Map<string, VoiceAdapter>;

  constructor(client: Client, options: ClientVoiceManagerOptions = {}) {
    Object.defineProperty(this, 'client', { value: client });

    this.connectionFactory =
      options.connectionFactory ?? ((voiceManager, channel) => new VoiceConnection(voiceManager, channel));

    this.connection = null;

    this.adapters = new Map();

    client.on(Events.SHARD_DISCONNECT, (_: unknown, shardId: number) => {
      for (const [guildId, adapter] of this.adapters.entries()) {
        if (client.guilds.cache.get(guildId)?.shardId === shardId) {
          // Because it has 1 shard => adapter.destroy();
        }
        adapter.destroy();
      }
    });
  }

  onVoiceServer(payload: VoiceServerUpdatePayload) {
    const { guild_id, channel_id, token, endpoint } = payload;
    this.client.emit(
      'debug',
      `[VOICE] voiceServer ${channel_id ? 'channel' : 'guild'}: ${
        channel_id || guild_id
      } token: ${token} endpoint: ${endpoint}`,
    );
    const connection = this.connection;
    if (connection) connection.setTokenAndEndpoint(token ?? null, endpoint ?? null);
    // Djs / voice
    if (payload.guild_id) {
      this.adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload);
    } else if (payload.channel_id) {
      this.adapters.get(payload.channel_id)?.onVoiceServerUpdate(payload);
    }
  }

  onVoiceStateUpdate(payload: VoiceStateUpdatePayload) {
    const { guild_id, session_id, channel_id } = payload;
    // @discordjs/voice
    if (payload.guild_id && payload.session_id && payload.user_id === this.client.user?.id) {
      this.adapters.get(payload.guild_id)?.onVoiceStateUpdate(payload);
    } else if (payload.channel_id && payload.session_id && payload.user_id === this.client.user?.id) {
      this.adapters.get(payload.channel_id)?.onVoiceStateUpdate(payload);
    }
    // Main lib
    const connection = this.connection;
    this.client.emit('debug', `[VOICE] connection? ${!!connection}, ${guild_id} ${session_id} ${channel_id}`);
    if (!connection) return;
    if (!channel_id) {
      connection._disconnect();
      this.connection = null;
      return;
    }
    const channel = this.client.channels.cache.get(channel_id);
    if (channel) {
      connection.channel = channel;
      connection.setSessionId(session_id ?? null);
    } else {
      this.client.emit('debug', `[VOICE] disconnecting from guild ${guild_id} as channel ${channel_id} is uncached`);
      connection.disconnect();
    }
  }

  joinChannel(channel: VoiceConnectionChannel | Snowflake, config: JoinChannelConfig = {}): Promise<VoiceConnection> {
    return new Promise((resolve, reject) => {
      const resolved = this.client.channels.resolve(channel);
      if (!resolved) throw new Error('VOICE_JOIN_CHANNEL', String(channel));
      if (!['DM', 'GROUP_DM'].includes(resolved.type) && !('joinable' in resolved && resolved.joinable)) {
        throw new Error('VOICE_JOIN_CHANNEL', String(resolved));
      }

      let connection = this.connection;

      if (connection) {
        if (connection.channel.id !== resolved.id) {
          connection.updateChannel(resolved);
        }
        resolve(connection);
        return;
      } else {
        connection = this.connectionFactory(this, resolved);
        if (config?.videoCodec) connection.setVideoCodec(config.videoCodec);
        connection.on('debug', (msg: string) =>
          this.client.emit(
            'debug',
            `[VOICE (${connection!.channel.guild?.id || connection!.channel.id}:${connection!.status})]: ${msg}`,
          ),
        );
        connection.authenticate({
          self_mute: Boolean(config.selfMute),
          self_deaf: Boolean(config.selfDeaf),
          self_video: Boolean(config.selfVideo),
        });
        this.connection = connection;
      }

      connection.once('failed', (reason: unknown) => {
        this.connection = null;
        reject(reason);
      });

      connection.on('error', reject);

      connection.once('authenticated', () => {
        connection.once('ready', () => {
          resolve(connection);
          connection.removeListener('error', reject);
        });
        connection.once('disconnect', () => {
          this.connection = null;
        });
      });
    });
  }
}

export default ClientVoiceManager;
export { ClientVoiceManager };
