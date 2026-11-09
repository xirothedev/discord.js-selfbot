import process from 'node:process';
import type { APIPartialChannel, APIPartialGuild, Snowflake } from 'discord-api-types/v10';
import MessagePayload from './MessagePayload';
import { Message } from './Message';
import type { RawWebhookData } from '../../typings/rawDataTypes';
import type {
  BufferResolvable,
  MessageResolvable,
  NewsChannel,
  StaticImageURLOptions,
  User,
  WebhookEditData,
  WebhookEditMessageOptions,
  WebhookFetchMessageOptions,
  WebhookMessageOptions,
  WebhookType,
} from '../../typings';
import type { Client } from '../client/Client';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { WebhookTypes } = _ConstantsModule;
import DataResolver from '../util/DataResolver';
import SnowflakeUtil from '../util/SnowflakeUtil';

let deprecationEmittedForFetchMessage = false;

/**
 * Represents a webhook.
 */
class Webhook {
  declare client: Client;
  declare avatar: string | null;
  declare channelId: Snowflake | null;
  declare guildId: Snowflake | null;
  declare id: Snowflake;
  declare name: string | null;
  declare owner: User | import('discord-api-types/v10').APIUser | null;
  declare sourceGuild: import('./Guild').Guild | APIPartialGuild | null;
  declare sourceChannel: NewsChannel | APIPartialChannel | null;
  declare token: string | null;
  declare type: WebhookType;

  constructor(client: Client, data?: RawWebhookData) {
    /**
     * The client that instantiated the webhook
     * @name Webhook#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });
    if (data) this._patch(data);
  }

  _patch(data: RawWebhookData) {
    if ('name' in data) {
      /**
       * The name of the webhook
       * @type {string}
       */
      this.name = data.name ?? null;
    }

    /**
     * The token for the webhook, unavailable for follower webhooks and webhooks owned by another application.
     * @name Webhook#token
     * @type {?string}
     */
    Object.defineProperty(this, 'token', { value: data.token ?? null, writable: true, configurable: true });

    if ('avatar' in data) {
      /**
       * The avatar for the webhook
       * @type {?string}
       */
      this.avatar = data.avatar ?? null;
    }

    /**
     * The webhook's id
     * @type {Snowflake}
     */
    this.id = data.id;

    if ('type' in data && data.type !== undefined) {
      /**
       * The type of the webhook
       * @type {WebhookType}
       */
      const type: WebhookType = WebhookTypes[data.type];
      this.type = type;
    }

    if ('guild_id' in data) {
      /**
       * The guild the webhook belongs to
       * @type {Snowflake}
       */
      this.guildId = data.guild_id ?? null;
    }

    if ('channel_id' in data) {
      /**
       * The id of the channel the webhook belongs to
       * @type {Snowflake}
       */
      this.channelId = data.channel_id ?? null;
    }

    if ('user' in data) {
      /**
       * The owner of the webhook
       * @type {?(User|APIUser)}
       */
      const owner: User | import('discord-api-types/v10').APIUser | null =
        this.client.users?._add(data.user) ?? data.user ?? null;
      this.owner = owner;
    } else {
      this.owner ??= null;
    }

    if ('source_guild' in data && data.source_guild) {
      /**
       * The source guild of the webhook
       * @type {?(Guild|APIGuild)}
       */
      const sourceGuild: import('./Guild').Guild | APIPartialGuild =
        this.client.guilds?.cache.get(data.source_guild.id) ?? data.source_guild;
      this.sourceGuild = sourceGuild;
    } else {
      this.sourceGuild ??= null;
    }

    if ('source_channel' in data) {
      /**
       * The source channel of the webhook
       * @type {?(NewsChannel|APIChannel)}
       */
      const sourceChannel: NewsChannel | APIPartialChannel =
        this.client.channels?.cache.get(data.source_channel?.id) ?? data.source_channel;
      this.sourceChannel = sourceChannel;
    } else {
      this.sourceChannel ??= null;
    }
  }

  /**
   * Options that can be passed into send.
   * @typedef {BaseMessageOptionsWithPoll} WebhookMessageOptions
   * @property {string} [username=this.name] Username override for the message
   * @property {string} [avatarURL] Avatar URL override for the message
   * @property {Snowflake} [threadId] The id of the thread in the channel to send to.
   * <info>For interaction webhooks, this property is ignored</info>
   * @property {string} [threadName] Name of the thread to create (only available if webhook is in a forum channel)
   * @property {MessageFlags} [flags] Which flags to set for the message. Only `SUPPRESS_EMBEDS` can be set.
   * @property {Snowflake[]} [appliedTags]
   * The tags to apply to the created thread (only available if the webhook is in a forum channel)
   * @property {boolean} [withComponents] Whether to allow sending non-interactive components in the message.
   * <info>For application-owned webhooks, this property is ignored</info>
   */

  /**
   * Options that can be passed into editMessage.
   * @typedef {Object} WebhookEditMessageOptions
   * @property {MessageEmbed[]|APIEmbed[]} [embeds] See {@link WebhookMessageOptions#embeds}
   * @property {string} [content] See {@link BaseMessageOptions#content}
   * @property {FileOptions[]|BufferResolvable[]|MessageAttachment[]} [files] See {@link BaseMessageOptions#files}
   * @property {MessageMentionOptions} [allowedMentions] See {@link BaseMessageOptions#allowedMentions}
   * @property {MessageAttachment[]} [attachments] Attachments to send with the message
   * @property {MessageActionRow[]|MessageActionRowOptions[]} [components]
   * Action rows containing interactive components for the message (buttons, select menus)
   * @property {Snowflake} [threadId] The id of the thread this message belongs to
   * <info>For interaction webhooks, this property is ignored</info>
   * @property {boolean} [withComponents] Whether to allow sending non-interactive components in the message.
   * <info>For application-owned webhooks, this property is ignored</info>
   */

  /**
   * Sends a message with this webhook.
   * @param {string|MessagePayload|WebhookMessageOptions} options The options to provide
   * @returns {Promise<Message|APIMessage>}
   * @example
   * // Send a basic message
   * webhook.send('hello!')
   *   .then(message => console.log(`Sent message: ${message.content}`))
   *   .catch(console.error);
   * @example
   * // Send a basic message in a thread
   * webhook.send({ content: 'hello!', threadId: '836856309672348295' })
   *   .then(message => console.log(`Sent message: ${message.content}`))
   *   .catch(console.error);
   * @example
   * // Send a remote file
   * webhook.send({
   *   files: ['https://cdn.discordapp.com/icons/222078108977594368/6e1019b3179d71046e463a75915e7244.png?size=2048']
   * })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Send a local file
   * webhook.send({
   *   files: [{
   *     attachment: 'entire/path/to/file.jpg',
   *     name: 'file.jpg'
   *   }]
   * })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Send an embed with a local image inside
   * webhook.send({
   *   content: 'This is an embed',
   *   embeds: [{
   *     thumbnail: {
   *          url: 'attachment://file.jpg'
   *       }
   *    }],
   *    files: [{
   *       attachment: 'entire/path/to/file.jpg',
   *       name: 'file.jpg'
   *    }]
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
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
    const d = await this.client.api.webhooks(this.id, this.token).post({
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
    return this.client.channels?.cache.get(d.channel_id)?.messages.cache.get(d.id) ?? new Message(this.client, d);
  }

  /**
   * Sends a raw slack message with this webhook.
   * @param {Object} body The raw body to send
   * @returns {Promise<boolean>}
   * @example
   * // Send a slack message
   * webhook.sendSlackMessage({
   *   'username': 'Wumpus',
   *   'attachments': [{
   *     'pretext': 'this looks pretty cool',
   *     'color': '#F0F',
   *     'footer_icon': 'http://snek.s3.amazonaws.com/topSnek.png',
   *     'footer': 'Powered by sneks',
   *     'ts': Date.now() / 1_000
   *   }]
   * }).catch(console.error);
   * @see {@link https://api.slack.com/messaging/webhooks}
   */
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

  /**
   * Options used to edit a {@link Webhook}.
   * @typedef {Object} WebhookEditData
   * @property {string} [name=this.name] The new name for the webhook
   * @property {?(BufferResolvable)} [avatar] The new avatar for the webhook
   * @property {GuildTextChannelResolvable|VoiceChannel|StageChannel|ForumChannel|MediaChannel} [channel]
   * The new channel for the webhook
   */

  /**
   * Edits this webhook.
   * @param {WebhookEditData} options Options for editing the webhook
   * @param {string} [reason] Reason for editing the webhook
   * @returns {Promise<Webhook>}
   */
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
    const data = await this.client.api.webhooks(this.id, channel ? undefined : this.token).patch({
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

  /**
   * Options that can be passed into fetchMessage.
   * @typedef {options} WebhookFetchMessageOptions
   * @property {boolean} [cache=true] Whether to cache the message.
   * @property {Snowflake} [threadId] The id of the thread this message belongs to.
   * <info>For interaction webhooks, this property is ignored</info>
   */

  /**
   * Gets a message that was sent by this webhook.
   * @param {Snowflake|'@original'} message The id of the message to fetch
   * @param {WebhookFetchMessageOptions|boolean} [cacheOrOptions={}] The options to provide to fetch the message.
   * <warn>A **deprecated** boolean may be passed instead to specify whether to cache the message.</warn>
   * @returns {Promise<Message|APIMessage>} Returns the raw message data if the webhook was instantiated as a
   * {@link WebhookClient} or if the channel is uncached, otherwise a {@link Message} will be returned
   */
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
      .get({
        query: {
          thread_id: cacheOrOptions.threadId,
        },
        auth: false,
        webhook: true,
      });
    return (
      this.client.channels?.cache.get(data.channel_id)?.messages.cache.get(data.id) ?? new Message(this.client, data)
    );
  }

  /**
   * Edits a message that was sent by this webhook.
   * @param {MessageResolvable|'@original'} message The message to edit
   * @param {string|MessagePayload|WebhookEditMessageOptions} options The options to provide
   * @returns {Promise<Message|APIMessage>} Returns the raw message data if the webhook was instantiated as a
   * {@link WebhookClient} or if the channel is uncached, otherwise a {@link Message} will be returned
   */
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
      .patch({
        data,
        files,
        query: {
          thread_id: messagePayload.options.threadId,
          with_components: messagePayload.options.withComponents,
        },
        auth: false,
        webhook: true,
      });

    const messageManager = this.client.channels?.cache.get(d.channel_id)?.messages;
    if (!messageManager) return d;

    const existing = messageManager.cache.get(d.id);
    if (!existing) return new Message(this.client, d);

    const clone = existing._clone();
    clone._patch(d);
    return clone;
  }

  /**
   * Deletes the webhook.
   * @param {string} [reason] Reason for deleting this webhook
   * @returns {Promise<void>}
   */
  async delete(reason?: string) {
    await this.client.api.webhooks(this.id, this.token).delete({ reason, auth: !this.token, webhook: true });
  }

  /**
   * Delete a message that was sent by this webhook.
   * @param {MessageResolvable|'@original'} message The message to delete
   * @param {Snowflake} [threadId] The id of the thread this message belongs to
   * @returns {Promise<void>}
   */
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

  /**
   * The channel the webhook belongs to
   * @type {?(TextChannel|VoiceChannel|NewsChannel|ForumChannel|MediaChannel)}
   * @readonly
   */
  get channel() {
    return this.client.channels.resolve(this.channelId);
  }

  /**
   * The timestamp the webhook was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  /**
   * The time the webhook was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The URL of this webhook
   * @type {string}
   * @readonly
   */
  get url() {
    return this.client.options.http.api + this.client.api.webhooks(this.id, this.token);
  }

  /**
   * A link to the webhook's avatar.
   * @param {StaticImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  avatarURL({ format, size }: StaticImageURLOptions = {}) {
    if (!this.avatar) return null;
    return this.client.rest.cdn.Avatar(this.id, this.avatar, format, size);
  }

  /**
   * Whether or not this webhook is a channel follower webhook.
   * @returns {boolean}
   */
  isChannelFollower() {
    return this.type === 'Channel Follower';
  }

  /**
   * Whether or not this webhook is an incoming webhook.
   * @returns {boolean}
   */
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
