import process from 'node:process';
import type { APIWebhookSourceChannel, APIWebhookSourceGuild, Snowflake } from 'discord-api-types/v10';
import MessagePayload from './MessagePayload';
import { Message } from './Message';
import type { RawMessageData, RawWebhookData } from '../../typings/rawDataTypes';
import type {
  BufferResolvable,
  MessageResolvable,
  StaticImageURLOptions,
  WebhookEditData,
  WebhookEditMessageOptions,
  WebhookFetchMessageOptions,
  WebhookMessageOptions,
  WebhookType,
} from '../../typings';
import type { Client } from '../client/Client';
import type { Channel } from './Channel';
import type User from './User';
import { isTextBasedChannel } from '../types/channels';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { WebhookTypes } = _ConstantsModule;
import DataResolver from '../util/DataResolver';
import SnowflakeUtil from '../util/SnowflakeUtil';

let deprecationEmittedForFetchMessage = false;

class Webhook {
  declare client: Client;
  declare avatar: string | null;
  declare channelId: Snowflake | null;
  declare guildId: Snowflake | null;
  declare id: Snowflake;
  declare name: string | null;
  declare owner: User | import('discord-api-types/v10').APIUser | null;
  declare sourceGuild: import('./Guild').Guild | APIWebhookSourceGuild | null;
  declare sourceChannel: Channel | APIWebhookSourceChannel | null;
  declare token: string | null;
  declare type: WebhookType;

  constructor(client: Client, data?: RawWebhookData) {
    Object.defineProperty(this, 'client', { value: client });
    if (data) this._patch(data);
  }

  _patch(data: RawWebhookData) {
    if ('name' in data) {
      this.name = data.name ?? null;
    }

    Object.defineProperty(this, 'token', { value: data.token ?? null, writable: true, configurable: true });

    if ('avatar' in data) {
      this.avatar = data.avatar ?? null;
    }

    this.id = data.id;

    if ('type' in data && data.type !== undefined) {
      const type: WebhookType = WebhookTypes[data.type];
      this.type = type;
    }

    if ('guild_id' in data) {
      this.guildId = data.guild_id ?? null;
    }

    if ('channel_id' in data) {
      this.channelId = data.channel_id ?? null;
    }

    if ('user' in data) {
      const owner: User | import('discord-api-types/v10').APIUser | null =
        this.client.users?._add(data.user) ?? data.user ?? null;
      this.owner = owner;
    } else {
      this.owner ??= null;
    }

    if ('source_guild' in data && data.source_guild) {
      const sourceGuild: import('./Guild').Guild | APIWebhookSourceGuild =
        this.client.guilds?.cache.get(data.source_guild.id) ?? data.source_guild;
      this.sourceGuild = sourceGuild;
    } else {
      this.sourceGuild ??= null;
    }

    if ('source_channel' in data) {
      const sourceChannel: Channel | APIWebhookSourceChannel | null = data.source_channel?.id
        ? (this.client.channels?.cache.get(data.source_channel.id) ?? data.source_channel)
        : (data.source_channel ?? null);
      this.sourceChannel = sourceChannel;
    } else {
      this.sourceChannel ??= null;
    }
  }

  async send(
    options: string | MessagePayload | WebhookMessageOptions,
  ): Promise<Message | import('discord-api-types/v10').APIMessage> {
    if (!this.token) throw new Error('WEBHOOK_TOKEN_UNAVAILABLE');

    let messagePayload;

    if (options instanceof MessagePayload) {
      messagePayload = options.resolveData();
    } else {
      messagePayload = MessagePayload.create(this, options).resolveData();
    }

    const { data, files } = await messagePayload.resolveFiles();
    const d = await this.client.api.webhooks(this.id, this.token).post<RawMessageData>({
      data,
      files,
      query: {
        thread_id: 'threadId' in messagePayload.options ? messagePayload.options.threadId : undefined,
        wait: true,
        with_components: 'withComponents' in messagePayload.options ? messagePayload.options.withComponents : undefined,
      },
      auth: false,
      webhook: true,
    });
    const channel = this.client.channels.cache.get(d.channel_id);
    const existing = channel && isTextBasedChannel(channel) ? channel.messages.cache.get(d.id) : null;
    return existing ?? new Message(this.client, d);
  }

  async sendSlackMessage(body: unknown) {
    if (!this.token) throw new Error('WEBHOOK_TOKEN_UNAVAILABLE');

    const data = await this.client.api.webhooks(this.id, this.token).slack.post({
      query: { wait: true },
      auth: false,
      data: body,
      webhook: true,
    });
    return String(data) === 'ok';
  }

  async edit({ name, avatar, channel }: WebhookEditData, reason?: string) {
    let resolvedAvatar: BufferResolvable | string | null | undefined = avatar;
    if (resolvedAvatar && !(typeof resolvedAvatar === 'string' && resolvedAvatar.startsWith('data:'))) {
      resolvedAvatar = await DataResolver.resolveImage(resolvedAvatar);
    }
    const channelId = channel
      ? typeof channel === 'object' && channel !== null && 'id' in channel
        ? channel.id
        : channel
      : undefined;
    const data = await this.client.api.webhooks(this.id, channel ? undefined : this.token).patch<RawWebhookData>({
      data: { name: name ?? this.name ?? undefined, avatar: resolvedAvatar, channel_id: channelId },
      reason,
      auth: !this.token || Boolean(channelId),
      webhook: true,
    });

    this.name = data.name ?? null;
    this.avatar = data.avatar ?? null;
    this.channelId = data.channel_id ?? null;
    return this;
  }

  async fetchMessage(
    message: Snowflake | '@original',
    cacheOrOptions: WebhookFetchMessageOptions | boolean = { cache: true },
  ): Promise<Message | import('discord-api-types/v10').APIMessage> {
    if (typeof cacheOrOptions === 'boolean') {
      if (!deprecationEmittedForFetchMessage) {
        process.emitWarning(
          'Passing a boolean to cache the message in Webhook#fetchMessage is deprecated. Pass an object instead.',
          'DeprecationWarning',
        );

        deprecationEmittedForFetchMessage = true;
      }

      cacheOrOptions = { cache: cacheOrOptions };
    }

    if (!this.token) throw new Error('WEBHOOK_TOKEN_UNAVAILABLE');

    const data = await this.client.api
      .webhooks(this.id, this.token)
      .messages(message)
      .get<RawMessageData>({
        query: {
          thread_id: cacheOrOptions.threadId,
        },
        auth: false,
        webhook: true,
      });
    const channel = this.client.channels.cache.get(data.channel_id);
    const existing = channel && isTextBasedChannel(channel) ? channel.messages.cache.get(data.id) : null;
    return existing ?? new Message(this.client, data);
  }

  async editMessage(
    message: MessageResolvable | '@original',
    options: string | MessagePayload | WebhookEditMessageOptions,
  ): Promise<Message | import('discord-api-types/v10').APIMessage> {
    if (!this.token) throw new Error('WEBHOOK_TOKEN_UNAVAILABLE');

    let messagePayload;

    if (options instanceof MessagePayload) messagePayload = options;
    else messagePayload = MessagePayload.create(this, options);

    const { data, files } = await messagePayload.resolveData().resolveFiles();

    const d = await this.client.api
      .webhooks(this.id, this.token)
      .messages(typeof message === 'string' ? message : message.id)
      .patch<RawMessageData>({
        data,
        files,
        query: {
          thread_id: messagePayload.options.threadId,
          with_components: messagePayload.options.withComponents,
        },
        auth: false,
        webhook: true,
      });

    const channel = this.client.channels.cache.get(d.channel_id);
    const messageManager = channel && isTextBasedChannel(channel) ? channel.messages : null;
    if (!messageManager) return d;

    const existing = messageManager.cache.get(d.id);
    if (!existing) return new Message(this.client, d);

    const clone = existing._clone();
    clone._patch(d);
    return clone;
  }

  async delete(reason?: string) {
    await this.client.api.webhooks(this.id, this.token).delete({ reason, auth: !this.token, webhook: true });
  }

  async deleteMessage(message: MessageResolvable | '@original', threadId?: Snowflake) {
    if (!this.token) throw new Error('WEBHOOK_TOKEN_UNAVAILABLE');

    await this.client.api
      .webhooks(this.id, this.token)
      .messages(typeof message === 'string' ? message : message.id)
      .delete({
        query: {
          thread_id: threadId,
        },
        auth: false,
        webhook: true,
      });
  }

  get channel() {
    const channel = this.client.channels.resolve(this.channelId);
    return channel && isTextBasedChannel(channel) ? channel : null;
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  get url() {
    return this.client.options.http.api + this.client.api.webhooks(this.id, this.token);
  }

  avatarURL({ format = 'webp', size }: StaticImageURLOptions = {}) {
    if (!this.avatar) return null;
    return this.client.rest.cdn.Avatar(this.id, this.avatar, format, size);
  }

  isChannelFollower() {
    return this.type === 'Channel Follower';
  }

  isIncoming() {
    return this.type === 'Incoming';
  }

  static applyToClass(structure: { prototype: object }, ignore: string[] = []) {
    for (const prop of [
      'send',
      'sendSlackMessage',
      'fetchMessage',
      'edit',
      'editMessage',
      'delete',
      'deleteMessage',
      'createdTimestamp',
      'createdAt',
      'url',
    ]) {
      if (ignore.includes(prop)) continue;
      const descriptor = Object.getOwnPropertyDescriptor(Webhook.prototype, prop);
      if (descriptor) Object.defineProperty(structure.prototype, prop, descriptor);
    }
  }
}

export default Webhook;
export { Webhook };
