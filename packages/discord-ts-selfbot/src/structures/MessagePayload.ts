import { Buffer } from "node:buffer";
import type { Stream } from "node:stream";
import {
  AllowedMentionsTypes,
  MessageReferenceType,
} from "discord-api-types/v10";
import type { APIAllowedMentions } from "discord-api-types/v10";
import BaseMessageComponent from "./BaseMessageComponent";
import MessageEmbed from "./MessageEmbed";
import _errorsModule from "../errors";

const { RangeError, Error: DjsError } = _errorsModule;
import _ConstantsModule, { resolveEnumValue } from "../util/Constants";

const { PollLayoutTypes } = _ConstantsModule;
import DataResolver from "../util/DataResolver";
import MessageFlags from "../util/MessageFlags";
import SnowflakeUtil from "../util/SnowflakeUtil";
import Util from "../util/Util";
import Webhook from "./Webhook";
import WebhookClient from "../client/WebhookClient";
import User from "./User";
import _GuildMemberModule from "./GuildMember";

const { GuildMember } = _GuildMemberModule;
import _MessageModule from "./Message";

const { Message } = _MessageModule;
import MessageManager from "../managers/MessageManager";
import Interaction from "./Interaction";
import InteractionWebhook from "./InteractionWebhook";
import type {
  BitFieldResolvable,
  BufferResolvable,
  ChannelResolvable,
  GuildResolvable,
  HTTPAttachmentData,
  MessageFlagsString,
  MessageMentionOptions,
  MessageOptions,
  MessageResolvable,
  Snowflake,
} from "../../typings";
import type { RawMessagePayloadData } from "../../typings/rawDataTypes";
import type { Client } from "../client/Client";

type MessageReferenceLike =
  | MessageResolvable
  | { id: Snowflake; channelId?: Snowflake; guildId?: Snowflake | null };

export type MessagePayloadOptions = Omit<
  MessageOptions,
  "reply" | "forward" | "flags"
> & {
  reply?: { messageReference: MessageReferenceLike; failIfNotExists?: boolean };
  forward?: {
    message: MessageReferenceLike;
    channel?: ChannelResolvable;
    guild?: GuildResolvable;
  };
  flags?:
    | BitFieldResolvable<MessageFlagsString, number>
    | MessageOptions["flags"];
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
  name?: string | null;
  author?: User | null;
  id?: Snowflake;
}

function resolveTargetMessageId(
  target: MessagePayloadTarget,
  reference: MessageReferenceLike
): string | null {
  if (typeof reference === "object" && "id" in reference) {
    return reference.id;
  }
  if (target.messages) {
    return target.messages.resolveId(reference);
  }
  if (target instanceof MessageManager) {
    return target.resolveId(reference);
  }
  return null;
}

const ALLOWED_MENTION_TYPES: Record<string, AllowedMentionsTypes> = {
  everyone: AllowedMentionsTypes.Everyone,
  roles: AllowedMentionsTypes.Role,
  users: AllowedMentionsTypes.User,
};

function findFileName(thing: unknown) {
  if (typeof thing === "string") {
    return Util.basename(thing);
  }

  if (
    typeof thing === "object" &&
    thing !== null &&
    "path" in thing &&
    typeof thing.path === "string"
  ) {
    return Util.basename(thing.path);
  }

  return "file.jpg";
}

function isStream(value: unknown): value is Stream {
  return (
    typeof value === "object" &&
    value !== null &&
    "pipe" in value &&
    typeof value.pipe === "function"
  );
}

function toAllowedMentions(
  mentions: MessageMentionOptions
): APIAllowedMentions {
  return {
    parse: mentions.parse?.map((type) => ALLOWED_MENTION_TYPES[type]),
    replied_user: mentions.repliedUser,
    roles: mentions.roles,
    users: mentions.users,
  };
}

class MessagePayload {
  declare target: MessagePayloadTarget;
  declare options: MessagePayloadOptions;
  declare data: RawMessagePayloadData | null;
  declare files: HTTPAttachmentData[] | null;
  constructor(
    target: MessagePayloadTarget,
    options: MessagePayloadOptions = {}
  ) {
    this.target = target;

    this.options = options;

    this.data = null;

    this.files = null;
  }

  get isWebhook() {
    return (
      this.target instanceof Webhook || this.target instanceof WebhookClient
    );
  }

  get isUser() {
    return this.target instanceof User || this.target instanceof GuildMember;
  }

  get isMessage() {
    return this.target instanceof Message;
  }

  get isMessageManager() {
    return this.target instanceof MessageManager;
  }

  get isInteraction() {
    return (
      this.target instanceof Interaction ||
      this.target instanceof InteractionWebhook
    );
  }

  makeContent(): string | undefined {
    let content: string | undefined;
    if (this.options.content === null) {
      content = "";
    } else if (this.options.content !== undefined) {
      content = Util.verifyString(
        this.options.content,
        RangeError,
        "MESSAGE_CONTENT_TYPE",
        false
      );
    }

    return content;
  }

  resolveData() {
    if (this.data) {
      return this;
    }
    const { isInteraction } = this;
    const { isWebhook } = this;

    const content = this.makeContent();
    const tts = Boolean(this.options.tts);
    const nonce = this.resolveNonce();
    const components = this.resolveComponents();
    const { appliedTags, avatarURL, threadName, username } =
      this.resolveWebhookFields(isWebhook);
    const flags = this.resolveFlags(isInteraction);
    const allowedMentions = this.resolveAllowedMentions();
    const allowed_mentions = allowedMentions
      ? toAllowedMentions(allowedMentions)
      : undefined;
    const messageReference = this.resolveMessageReference();
    this.applyAttachmentIds();
    const stickerIds = this.resolveStickerIds();
    const poll = this.resolvePoll();

    this.data = {
      allowed_mentions: this.shouldSuppressAllowedMentions(messageReference)
        ? undefined
        : allowed_mentions,
      applied_tags: appliedTags,
      attachments: this.options.attachments?.map((attachment) => ({
        description: attachment.description ?? undefined,
        id: attachment.id,
      })),
      avatar_url: avatarURL,
      components,
      content,
      embeds: this.options.embeds?.map((embed) => {
        const data =
          "toJSON" in embed && typeof embed.toJSON === "function"
            ? embed.toJSON()
            : embed;
        return new MessageEmbed(data).toJSON();
      }),
      flags,
      message_reference: messageReference,
      nonce,
      poll,
      sticker_ids: stickerIds,
      thread_name: threadName,
      tts,
      username,
    };
    return this;
  }

  private resolveMessageReference() {
    let messageReference;
    if (typeof this.options.reply === "object") {
      const reference = this.options.reply.messageReference;
      const messageId = resolveTargetMessageId(this.target, reference);
      if (messageId) {
        messageReference = {
          fail_if_not_exists:
            this.options.reply.failIfNotExists ??
            this.target.client.options.failIfNotExists,
          message_id: messageId,
          type: MessageReferenceType.Default,
        };
      }
    }

    if (typeof this.options.forward === "object") {
      const reference = this.options.forward.message;
      const channelId =
        (typeof reference === "object" && "channelId" in reference
          ? reference.channelId
          : undefined) ??
        this.target.client.channels.resolveId(this.options.forward.channel);
      const guildId =
        (typeof reference === "object" && "guildId" in reference
          ? reference.guildId
          : undefined) ??
        this.target.client.guilds.resolveId(this.options.forward.guild);
      const messageId = resolveTargetMessageId(this.target, reference);
      if (messageId) {
        if (!channelId) {
          throw new DjsError(
            "INVALID_TYPE",
            "channelId",
            "TextBasedChannelResolvable"
          );
        }
        messageReference = {
          channel_id: channelId,
          guild_id: guildId ?? undefined,
          message_id: messageId,
          type: MessageReferenceType.Forward,
        };
      }
    }

    return messageReference;
  }

  private applyAttachmentIds() {
    const attachments = this.options.files?.map((file, index) => ({
      description:
        typeof file === "object" &&
        file !== null &&
        "description" in file &&
        typeof file.description === "string"
          ? file.description
          : undefined,
      id: index.toString(),
    }));
    if (Array.isArray(this.options.attachments)) {
      this.options.attachments.push(...(attachments ?? []));
    } else {
      this.options.attachments = attachments;
    }
  }

  private resolveNonce() {
    const { nonce } = this.options;
    if (nonce === undefined) {
      return SnowflakeUtil.generate();
    }
    if (
      typeof nonce === "number"
        ? !Number.isInteger(nonce)
        : typeof nonce !== "string"
    ) {
      throw new RangeError("MESSAGE_NONCE_TYPE");
    }
    return nonce;
  }

  private resolveComponents() {
    return this.options.components?.map((component) => {
      const data =
        "toJSON" in component && typeof component.toJSON === "function"
          ? component.toJSON()
          : component;
      const created = BaseMessageComponent.create(data);
      if (!created || !BaseMessageComponent.isTopLevelComponent(created)) {
        throw new DjsError(
          "INVALID_TYPE: component is not a top-level component"
        );
      }
      return BaseMessageComponent.serializeTopLevelComponent(created);
    });
  }

  private resolveWebhookFields(isWebhook: boolean) {
    if (!isWebhook) {
      return {
        appliedTags: undefined,
        avatarURL: undefined,
        threadName: undefined,
        username: undefined,
      };
    }
    const { appliedTags, avatarURL, threadName, username } = this.options;
    return {
      appliedTags: appliedTags || undefined,
      avatarURL: avatarURL || undefined,
      threadName: threadName || undefined,
      username: username ?? this.target.name ?? undefined,
    };
  }

  private resolveFlags(isInteraction: boolean) {
    let flags: number | undefined;
    if (this.options.flags !== undefined && this.options.flags !== null) {
      flags = Number(new MessageFlags(this.options.flags).bitfield);
    }

    if (isInteraction && this.options.ephemeral) {
      flags = Number(flags ?? 0) | Number(MessageFlags.FLAGS.EPHEMERAL);
    }
    return flags;
  }

  private resolveAllowedMentions() {
    return this.options.allowedMentions === undefined
      ? this.target.client.options.allowedMentions
      : this.options.allowedMentions;
  }

  private resolveStickerIds() {
    const stickerIds = this.options.stickers?.map((sticker) =>
      typeof sticker === "object" ? sticker.id : sticker
    );
    let result:
      | [string]
      | [string, string]
      | [string, string, string]
      | undefined;
    if (!stickerIds) {
      return;
    }
    if (stickerIds.length >= 3) {
      result = [stickerIds[0], stickerIds[1], stickerIds[2]];
    } else if (stickerIds.length === 2) {
      result = [stickerIds[0], stickerIds[1]];
    } else if (stickerIds.length === 1) {
      result = [stickerIds[0]];
    }
    return result;
  }

  private resolvePoll() {
    if (!this.options.poll) {
      return;
    }
    return {
      allow_multiselect: this.options.poll.allowMultiselect,
      answers: this.options.poll.answers.map((answer) => ({
        poll_media: {
          emoji: Util.resolvePartialEmoji(answer.emoji) ?? undefined,
          text: answer.text,
        },
      })),
      duration: this.options.poll.duration,
      layout_type: resolveEnumValue(
        PollLayoutTypes,
        this.options.poll.layoutType
      ),
      question: {
        text: this.options.poll.question.text,
      },
    };
  }

  private shouldSuppressAllowedMentions(messageReference: unknown) {
    return Boolean(
      this.isMessage &&
      messageReference === undefined &&
      "author" in this.target &&
      this.target.author?.id !== this.target.client.user?.id
    );
  }

  async resolveFiles() {
    if (this.files) {
      return this;
    }

    this.files = await Promise.all(
      this.options.files?.map((file) => MessagePayload.resolveFile(file)) ?? []
    );
    return this;
  }

  private static resolveFileInput(fileLike: unknown): {
    attachment: BufferResolvable | Stream;
    name: string;
  } {
    if (typeof fileLike === "string" || fileLike instanceof Buffer) {
      return { attachment: fileLike, name: findFileName(fileLike) };
    }
    if (isStream(fileLike)) {
      return { attachment: fileLike, name: findFileName(fileLike) };
    }
    if (
      typeof fileLike === "object" &&
      fileLike !== null &&
      "attachment" in fileLike
    ) {
      const attachmentValue = fileLike.attachment;
      if (
        typeof attachmentValue !== "string" &&
        !Buffer.isBuffer(attachmentValue) &&
        !isStream(attachmentValue)
      ) {
        throw new DjsError(
          "INVALID_TYPE",
          "fileLike",
          "BufferResolvable|Stream|FileOptions|MessageAttachment"
        );
      }
      return {
        attachment: attachmentValue,
        name:
          "name" in fileLike && typeof fileLike.name === "string"
            ? fileLike.name
            : findFileName(fileLike),
      };
    }
    throw new DjsError(
      "INVALID_TYPE",
      "fileLike",
      "BufferResolvable|Stream|FileOptions|MessageAttachment"
    );
  }

  static async resolveFile(fileLike: unknown): Promise<HTTPAttachmentData> {
    const { attachment, name } = MessagePayload.resolveFileInput(fileLike);

    const resource = await DataResolver.resolveFile(attachment);
    if (!resource) {
      throw new DjsError("INVALID_TYPE", "fileLike", "BufferResolvable|Stream");
    }
    const metadata =
      typeof fileLike === "object" && fileLike !== null ? fileLike : {};
    const description =
      "description" in metadata ? metadata.description : undefined;
    const duration = "duration" in metadata ? metadata.duration : undefined;
    const waveform = "waveform" in metadata ? metadata.waveform : undefined;
    return {
      attachment,
      description: typeof description === "string" ? description : undefined,
      duration_secs: typeof duration === "number" ? duration : undefined,
      file: resource,
      name,
      waveform: typeof waveform === "string" ? waveform : undefined,
    };
  }

  static create(
    target: MessagePayloadTarget,
    options: string | MessagePayloadOptions,
    extra: MessagePayloadOptions = {}
  ) {
    return new this(
      target,
      typeof options !== "object" || options === null
        ? { content: options, ...extra }
        : { ...options, ...extra }
    );
  }
}

export default MessagePayload;
export { MessagePayload };
