import { Buffer } from 'node:buffer';
import type { Stream } from 'node:stream';
import { AllowedMentionsTypes } from 'discord-api-types/v10';
import type { APIAllowedMentions } from 'discord-api-types/v10';
import BaseMessageComponent from './BaseMessageComponent';
import MessageEmbed from './MessageEmbed';
import _errorsModule from '../errors';
const { RangeError, Error: DjsError } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { PollLayoutTypes, MessageReferenceTypes } = _ConstantsModule;
import DataResolver from '../util/DataResolver';
import MessageFlags from '../util/MessageFlags';
import SnowflakeUtil from '../util/SnowflakeUtil';
import Util from '../util/Util';
import Webhook from './Webhook';
import WebhookClient from '../client/WebhookClient';
import User from './User';
import _GuildMemberModule from './GuildMember';
const { GuildMember } = _GuildMemberModule;
import _MessageModule from './Message';
const { Message } = _MessageModule;
import MessageManager from '../managers/MessageManager';
import Interaction from './Interaction';
import InteractionWebhook from './InteractionWebhook';
import type {
  BitFieldResolvable,
  BufferResolvable,
  ChannelResolvable,
  FileOptions,
  GuildResolvable,
  HTTPAttachmentData,
  MessageAttachment,
  MessageFlagsString,
  MessageMentionOptions,
  MessageOptions,
  MessageResolvable,
  Snowflake,
} from '../../typings';
import type { RawMessagePayloadData } from '../../typings/rawDataTypes';
import type { Client } from '../client/Client';

type MessageReferenceLike = MessageResolvable | { id: Snowflake; channelId?: Snowflake; guildId?: Snowflake | null };

type MessagePayloadOptions = Omit<MessageOptions, 'reply' | 'forward' | 'flags'> & {
  reply?: { messageReference: MessageReferenceLike; failIfNotExists?: boolean };
  forward?: { message: MessageReferenceLike; channel?: ChannelResolvable; guild?: GuildResolvable };
  flags?: BitFieldResolvable<MessageFlagsString, number> | MessageOptions['flags'];
  username?: string;
  avatarURL?: string;
  threadName?: string;
  threadId?: Snowflake;
  appliedTags?: Snowflake[];
  withComponents?: boolean;
};

interface MessagePayloadTarget {
  client: Client;
  messages?: MessageManager;
  name?: string;
  author?: User | null;
  id?: Snowflake;
}

function resolveTargetMessageId(target: MessagePayloadTarget, reference: MessageReferenceLike): string | null {
  if (typeof reference === 'object' && 'id' in reference) return reference.id;
  if (target.messages) return target.messages.resolveId(reference);
  if (target instanceof MessageManager) return target.resolveId(reference);
  return null;
}

function isStream(value: unknown): value is Stream {
  return typeof value === 'object' && value !== null && 'pipe' in value && typeof value.pipe === 'function';
}

function toAllowedMentions(mentions: MessageMentionOptions): APIAllowedMentions {
  return {
    parse: mentions.parse?.map(type => {
      switch (type) {
        case 'everyone':
          return AllowedMentionsTypes.Everyone;
        case 'roles':
          return AllowedMentionsTypes.Role;
        case 'users':
          return AllowedMentionsTypes.User;
      }
    }),
    roles: mentions.roles,
    users: mentions.users,
    replied_user: mentions.repliedUser,
  };
}

/**
 * Represents a message to be sent to the API.
 */
class MessagePayload {
  declare target: MessagePayloadTarget;
  declare options: MessagePayloadOptions;
  declare data: RawMessagePayloadData | null;
  declare files: HTTPAttachmentData[] | null;
  /**
   * @param {MessageTarget} target The target for this message to be sent to
   * @param {MessageOptions|WebhookMessageOptions} options Options passed in from send
   */
  constructor(target: MessagePayloadTarget, options: MessagePayloadOptions = {}) {
    /**
     * The target for this message to be sent to
     * @type {MessageTarget}
     */
    this.target = target;

    /**
     * Options passed in from send
     * @type {MessageOptions|WebhookMessageOptions}
     */
    this.options = options;

    /**
     * Data sendable to the API
     * @type {?APIMessage}
     */
    this.data = null;

    /**
     * @typedef {Object} MessageFile
     * @property {Buffer|string|Stream} attachment The original attachment that generated this file
     * @property {string} name The name of this file
     * @property {Buffer|Stream} file The file to be sent to the API
     */

    /**
     * Files sendable to the API
     * @type {?MessageFile[]}
     */
    this.files = null;
  }

  /**
   * Whether or not the target is a {@link Webhook} or a {@link WebhookClient}
   * @type {boolean}
   * @readonly
   */
  get isWebhook() {
    return this.target instanceof Webhook || this.target instanceof WebhookClient;
  }

  /**
   * Whether or not the target is a {@link User}
   * @type {boolean}
   * @readonly
   */
  get isUser() {
    return this.target instanceof User || this.target instanceof GuildMember;
  }

  /**
   * Whether or not the target is a {@link Message}
   * @type {boolean}
   * @readonly
   */
  get isMessage() {
    return this.target instanceof Message;
  }

  /**
   * Whether or not the target is a {@link MessageManager}
   * @type {boolean}
   * @readonly
   */
  get isMessageManager() {
    return this.target instanceof MessageManager;
  }

  /**
   * Whether or not the target is an {@link Interaction} or an {@link InteractionWebhook}
   * @type {boolean}
   * @readonly
   */
  get isInteraction() {
    return this.target instanceof Interaction || this.target instanceof InteractionWebhook;
  }

  /**
   * Makes the content of this message.
   * @returns {?string}
   */
  makeContent(): string | undefined {
    let content: string | undefined;
    if (this.options.content === null) {
      content = '';
    } else if (typeof this.options.content !== 'undefined') {
      content = Util.verifyString(this.options.content, RangeError, 'MESSAGE_CONTENT_TYPE', false);
    }

    return content;
  }

  /**
   * Resolves data.
   * @returns {MessagePayload}
   */
  resolveData() {
    if (this.data) return this;
    const isInteraction = this.isInteraction;
    const isWebhook = this.isWebhook;

    const content = this.makeContent();
    const tts = Boolean(this.options.tts);

    let nonce: string | number = SnowflakeUtil.generate();
    if (typeof this.options.nonce !== 'undefined') {
      nonce = this.options.nonce;
      // eslint-disable-next-line max-len
      if (typeof nonce === 'number' ? !Number.isInteger(nonce) : typeof nonce !== 'string') {
        throw new RangeError('MESSAGE_NONCE_TYPE');
      }
    }

    const components = this.options.components?.map(component => {
      const data = 'toJSON' in component && typeof component.toJSON === 'function' ? component.toJSON() : component;
      return BaseMessageComponent.create(data)!.toJSON();
    });

    let username;
    let avatarURL;
    let threadName;
    let appliedTags;
    if (isWebhook) {
      username = this.options.username ?? this.target.name;
      if (this.options.avatarURL) avatarURL = this.options.avatarURL;
      if (this.options.threadName) threadName = this.options.threadName;
      if (this.options.appliedTags) appliedTags = this.options.appliedTags;
    }

    let flags: number | undefined;
    if (this.options.flags != null) {
      flags = Number(new MessageFlags(this.options.flags).bitfield);
    }

    if (isInteraction && this.options.ephemeral) {
      flags = Number(flags ?? 0) | Number(MessageFlags.FLAGS.EPHEMERAL);
    }

    const allowedMentions: MessageMentionOptions | undefined =
      typeof this.options.allowedMentions === 'undefined'
        ? this.target.client.options.allowedMentions
        : this.options.allowedMentions;
    let allowed_mentions: APIAllowedMentions | undefined;
    if (allowedMentions) allowed_mentions = toAllowedMentions(allowedMentions);

    let message_reference;
    if (typeof this.options.reply === 'object') {
      const reference = this.options.reply.messageReference;
      const message_id = resolveTargetMessageId(this.target, reference);
      if (message_id) {
        message_reference = {
          message_id,
          type: MessageReferenceTypes.DEFAULT,
          fail_if_not_exists: this.options.reply.failIfNotExists ?? this.target.client.options.failIfNotExists,
        };
      }
    }

    if (typeof this.options.forward === 'object') {
      const reference = this.options.forward.message;
      const channel_id =
        (typeof reference === 'object' && 'channelId' in reference ? reference.channelId : undefined) ??
        this.target.client.channels.resolveId(this.options.forward.channel);
      const guild_id =
        (typeof reference === 'object' && 'guildId' in reference ? reference.guildId : undefined) ??
        this.target.client.guilds.resolveId(this.options.forward.guild);
      const message_id = resolveTargetMessageId(this.target, reference);
      if (message_id) {
        if (!channel_id) throw new DjsError('INVALID_TYPE', 'channelId', 'TextBasedChannelResolvable');
        message_reference = {
          type: MessageReferenceTypes.FORWARD,
          message_id,
          channel_id,
          guild_id: guild_id ?? undefined,
        };
      }
    }

    const attachments = this.options.files?.map((file, index) => ({
      id: index.toString(),
      description:
        typeof file === 'object' && file !== null && 'description' in file && typeof file.description === 'string'
          ? file.description
          : undefined,
    }));
    if (Array.isArray(this.options.attachments)) {
      this.options.attachments.push(...(attachments ?? []));
    } else {
      this.options.attachments = attachments;
    }

    const stickerIds = this.options.stickers?.map(sticker => (typeof sticker === 'object' ? sticker.id : sticker));
    const sticker_ids: [string] | [string, string] | [string, string, string] | undefined =
      stickerIds && stickerIds.length >= 3
        ? [stickerIds[0], stickerIds[1], stickerIds[2]]
        : stickerIds && stickerIds.length === 2
          ? [stickerIds[0], stickerIds[1]]
          : stickerIds && stickerIds.length === 1
            ? [stickerIds[0]]
            : undefined;

    let poll;
    if (this.options.poll) {
      poll = {
        question: {
          text: this.options.poll.question.text,
        },
        answers: this.options.poll.answers.map(answer => ({
          poll_media: { text: answer.text, emoji: Util.resolvePartialEmoji(answer.emoji) ?? undefined },
        })),
        duration: this.options.poll.duration,
        allow_multiselect: this.options.poll.allowMultiselect,
        layout_type:
          typeof this.options.poll.layoutType == 'number'
            ? this.options.poll.layoutType
            : this.options.poll.layoutType
              ? PollLayoutTypes[this.options.poll.layoutType]
              : undefined,
      };
    }

    this.data = {
      content,
      tts,
      nonce,
      embeds: this.options.embeds?.map(embed => {
        const data = 'toJSON' in embed && typeof embed.toJSON === 'function' ? embed.toJSON() : embed;
        return new MessageEmbed(data).toJSON();
      }),
      components,
      username,
      avatar_url: avatarURL,
      allowed_mentions:
        this.isMessage &&
        message_reference === undefined &&
        'author' in this.target &&
        this.target.author?.id !== this.target.client.user?.id
          ? undefined
          : allowed_mentions,
      flags,
      message_reference,
      attachments: this.options.attachments?.map(attachment => ({
        id: attachment.id,
        description: attachment.description ?? undefined,
      })),
      sticker_ids,
      thread_name: threadName,
      applied_tags: appliedTags,
      poll,
    };
    return this;
  }

  /**
   * Resolves files.
   * @returns {Promise<MessagePayload>}
   */
  async resolveFiles() {
    if (this.files) return this;

    this.files = await Promise.all(this.options.files?.map(file => MessagePayload.resolveFile(file)) ?? []);
    return this;
  }

  /**
   * Resolves a single file into an object sendable to the API.
   * @param {BufferResolvable|Stream|FileOptions|MessageAttachment} fileLike Something that could be resolved to a file
   * @returns {Promise<MessageFile>}
   */
  static async resolveFile(
    fileLike: BufferResolvable | Stream | FileOptions | MessageAttachment,
  ): Promise<HTTPAttachmentData> {
    let attachment: BufferResolvable | Stream;
    let name: string;

    const findName = (thing: BufferResolvable | Stream | FileOptions | MessageAttachment) => {
      if (typeof thing === 'string') {
        return Util.basename(thing);
      }

      if (typeof thing === 'object' && thing !== null && 'path' in thing && typeof thing.path === 'string') {
        return Util.basename(thing.path);
      }

      return 'file.jpg';
    };

    if (typeof fileLike === 'string' || fileLike instanceof Buffer) {
      attachment = fileLike;
      name = findName(fileLike);
    } else if (isStream(fileLike)) {
      attachment = fileLike;
      name = findName(fileLike);
    } else if ('attachment' in fileLike) {
      attachment = fileLike.attachment;
      name = fileLike.name ?? findName(fileLike);
    } else {
      throw new DjsError('INVALID_TYPE', 'fileLike', 'BufferResolvable|Stream|FileOptions|MessageAttachment');
    }

    const resource = await DataResolver.resolveFile(attachment);
    if (!resource) throw new DjsError('INVALID_TYPE', 'fileLike', 'BufferResolvable|Stream');
    const metadata = typeof fileLike === 'object' && fileLike !== null ? fileLike : {};
    const description = 'description' in metadata ? metadata.description : undefined;
    const duration = 'duration' in metadata ? metadata.duration : undefined;
    const waveform = 'waveform' in metadata ? metadata.waveform : undefined;
    return {
      attachment,
      name,
      file: resource,
      description: typeof description === 'string' ? description : undefined,
      duration_secs: typeof duration === 'number' ? duration : undefined,
      waveform: typeof waveform === 'string' ? waveform : undefined,
    };
  }

  /**
   * Creates a {@link MessagePayload} from user-level arguments.
   * @param {MessageTarget} target Target to send to
   * @param {string|MessageOptions|WebhookMessageOptions} options Options or content to use
   * @param {MessageOptions|WebhookMessageOptions} [extra={}] Extra options to add onto specified options
   * @returns {MessagePayload}
   */
  static create(
    target: MessagePayloadTarget,
    options: string | MessagePayloadOptions,
    extra: MessagePayloadOptions = {},
  ) {
    return new this(
      target,
      typeof options !== 'object' || options === null ? { content: options, ...extra } : { ...options, ...extra },
    );
  }
}

/**
 * A target for a message.
 * @typedef {TextBasedChannels|User|GuildMember|Webhook|WebhookClient|Interaction|InteractionWebhook|
 * Message|MessageManager} MessageTarget
 */

/**
 * @external APIMessage
 * @see {@link https://discord.com/developers/docs/resources/channel#message-object}
 */

export default MessagePayload;
export { MessagePayload };
