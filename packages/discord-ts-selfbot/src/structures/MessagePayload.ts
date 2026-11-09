import { Buffer } from 'node:buffer';
import BaseMessageComponent from './BaseMessageComponent';
import MessageEmbed from './MessageEmbed';
import _errorsModule from '../errors';
const { RangeError, Error: DjsError } = _errorsModule;
import ActivityFlags from '../util/ActivityFlags';
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

/**
 * Represents a message to be sent to the API.
 */
class MessagePayload {
  [key: string]: any;
  /**
   * @param {MessageTarget} target The target for this message to be sent to
   * @param {MessageOptions|WebhookMessageOptions} options Options passed in from send
   */
  constructor(target: any, options: any = {}) {
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
  makeContent() {
    let content;
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

    let nonce = SnowflakeUtil.generate();
    if (typeof this.options.nonce !== 'undefined') {
      nonce = this.options.nonce;
      // eslint-disable-next-line max-len
      if (typeof nonce === 'number' ? !Number.isInteger(nonce) : typeof nonce !== 'string') {
        throw new RangeError('MESSAGE_NONCE_TYPE');
      }
    }

    const components = this.options.components?.map((c: any) => {
      const data = typeof c?.toJSON === 'function' ? c.toJSON() : c;
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

    let flags;
    if (this.options.flags != null) {
      flags = new MessageFlags(this.options.flags).bitfield;
    }

    if (isInteraction && this.options.ephemeral) {
      flags = ((flags ?? 0) as any) | (MessageFlags.FLAGS.EPHEMERAL as any);
    }

    let allowedMentions =
      typeof this.options.allowedMentions === 'undefined'
        ? this.target.client.options.allowedMentions
        : this.options.allowedMentions;

    if (allowedMentions) {
      allowedMentions = Util.cloneObject(allowedMentions);
      allowedMentions.replied_user = allowedMentions.repliedUser;
      delete allowedMentions.repliedUser;
    }

    let message_reference;
    if (typeof this.options.reply === 'object') {
      const reference = this.options.reply.messageReference;
      const message_id = this.isMessage ? (reference.id ?? reference) : this.target.messages.resolveId(reference);
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
      const channel_id = reference.channelId ?? this.target.client.channels.resolveId(this.options.forward.channel);
      const guild_id = reference.guildId ?? this.target.client.guilds.resolveId(this.options.forward.guild);
      const message_id = this.target.messages.resolveId(reference);
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

    const attachments = this.options.files?.map((file: any, index: any) => ({
      id: index.toString(),
      description: file.description,
    }));
    if (Array.isArray(this.options.attachments)) {
      this.options.attachments.push(...(attachments ?? []));
    } else {
      this.options.attachments = attachments;
    }

    // Activity
    let activity;
    if (
      this.options.activity instanceof Object &&
      typeof this.options.activity.partyId == 'string' &&
      this.options.activity.type
    ) {
      const type = ActivityFlags.resolve(this.options.activity.type);
      const sessionId = this.target.client.sessionId;
      const partyId = this.options.activity.partyId;
      activity = {
        type,
        party_id: partyId,
        session_id: sessionId,
      };
    }

    let poll;
    if (this.options.poll) {
      poll = {
        question: {
          text: this.options.poll.question.text,
        },
        answers: this.options.poll.answers.map((answer: any) => ({
          poll_media: { text: answer.text, emoji: Util.resolvePartialEmoji(answer.emoji) },
        })),
        duration: this.options.poll.duration,
        allow_multiselect: this.options.poll.allowMultiselect,
        layout_type:
          typeof this.options.poll.layoutType == 'number'
            ? this.options.poll.layoutType
            : PollLayoutTypes[this.options.poll.layoutType],
      };
    }

    this.data = {
      activity,
      content,
      tts,
      nonce,
      embeds: this.options.embeds?.map((embed: any) => {
        const data = typeof embed?.toJSON === 'function' ? embed.toJSON() : embed;
        return new MessageEmbed(data).toJSON();
      }),
      components,
      username,
      avatar_url: avatarURL,
      allowed_mentions:
        this.isMessage && message_reference === undefined && this.target?.author?.id !== this.target?.client?.user?.id
          ? undefined
          : allowedMentions,
      flags,
      message_reference,
      attachments: this.options.attachments,
      sticker_ids: this.options.stickers?.map((sticker: any) => sticker.id ?? sticker),
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

    this.files = await Promise.all(
      this.options.files?.map((file: any) => (this.constructor as any).resolveFile(file)) ?? [],
    );
    return this;
  }

  /**
   * Resolves a single file into an object sendable to the API.
   * @param {BufferResolvable|Stream|FileOptions|MessageAttachment} fileLike Something that could be resolved to a file
   * @returns {Promise<MessageFile>}
   */
  static async resolveFile(fileLike: any) {
    let attachment;
    let name;

    const findName = (thing: any) => {
      if (typeof thing === 'string') {
        return Util.basename(thing);
      }

      if (thing.path) {
        return Util.basename(thing.path);
      }

      return 'file.jpg';
    };

    const ownAttachment =
      typeof fileLike === 'string' || fileLike instanceof Buffer || typeof fileLike.pipe === 'function';
    if (ownAttachment) {
      attachment = fileLike;
      name = findName(attachment);
    } else {
      attachment = fileLike.attachment;
      name = fileLike.name ?? findName(attachment);
    }

    const resource = await DataResolver.resolveFile(attachment);
    return {
      attachment,
      name,
      file: resource,
      description: fileLike.description,
      duration_secs: fileLike.duration,
      waveform: fileLike.waveform,
    };
  }

  /**
   * Creates a {@link MessagePayload} from user-level arguments.
   * @param {MessageTarget} target Target to send to
   * @param {string|MessageOptions|WebhookMessageOptions} options Options or content to use
   * @param {MessageOptions|WebhookMessageOptions} [extra={}] Extra options to add onto specified options
   * @returns {MessagePayload}
   */
  static create(target: any, options: any, extra: any = {}) {
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
