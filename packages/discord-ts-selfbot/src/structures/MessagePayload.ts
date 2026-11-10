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
    parse: mentions.parse?.map((type) => {
      switch (type) {
        case "everyone":
          return AllowedMentionsTypes.Everyone;
        case "roles":
          return AllowedMentionsTypes.Role;
        case "users":
          return AllowedMentionsTypes.User;
      }
    }),
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

    let nonce: string | number = SnowflakeUtil.generate();
    if (this.options.nonce !== undefined) {
      nonce = this.options.nonce;
      // eslint-disable-next-line max-len
      if (
        typeof nonce === "number"
          ? !Number.isInteger(nonce)
          : typeof nonce !== "string"
      ) {
        throw new RangeError("MESSAGE_NONCE_TYPE");
      }
    }

    const components = this.options.components?.map((component) => {
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

    let username;
    let avatarURL;
    let threadName;
    let appliedTags;
    if (isWebhook) {
      username = this.options.username ?? this.target.name ?? undefined;
      if (this.options.avatarURL) {
        avatarURL = this.options.avatarURL;
      }
      if (this.options.threadName) {
        threadName = this.options.threadName;
      }
      if (this.options.appliedTags) {
        appliedTags = this.options.appliedTags;
      }
    }

    let flags: number | undefined;
    if (this.options.flags != null) {
      flags = Number(new MessageFlags(this.options.flags).bitfield);
    }

    if (isInteraction && this.options.ephemeral) {
      flags = Number(flags ?? 0) | Number(MessageFlags.FLAGS.EPHEMERAL);
    }

    const allowedMentions: MessageMentionOptions | undefined =
      this.options.allowedMentions === undefined
        ? this.target.client.options.allowedMentions
        : this.options.allowedMentions;
    let allowed_mentions: APIAllowedMentions | undefined;
    if (allowedMentions) {
      allowed_mentions = toAllowedMentions(allowedMentions);
    }

    let message_reference;
    if (typeof this.options.reply === "object") {
      const reference = this.options.reply.messageReference;
      const message_id = resolveTargetMessageId(this.target, reference);
      if (message_id) {
        message_reference = {
          fail_if_not_exists:
            this.options.reply.failIfNotExists ??
            this.target.client.options.failIfNotExists,
          message_id,
          type: MessageReferenceType.Default,
        };
      }
    }

    if (typeof this.options.forward === "object") {
      const reference = this.options.forward.message;
      const channel_id =
        (typeof reference === "object" && "channelId" in reference
          ? reference.channelId
          : undefined) ??
        this.target.client.channels.resolveId(this.options.forward.channel);
      const guild_id =
        (typeof reference === "object" && "guildId" in reference
          ? reference.guildId
          : undefined) ??
        this.target.client.guilds.resolveId(this.options.forward.guild);
      const message_id = resolveTargetMessageId(this.target, reference);
      if (message_id) {
        if (!channel_id) {
          throw new DjsError(
            "INVALID_TYPE",
            "channelId",
            "TextBasedChannelResolvable"
          );
        }
        message_reference = {
          channel_id,
          guild_id: guild_id ?? undefined,
          message_id,
          type: MessageReferenceType.Forward,
        };
      }
    }

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

    const stickerIds = this.options.stickers?.map((sticker) =>
      typeof sticker === "object" ? sticker.id : sticker
    );
    const sticker_ids:
      | [string]
      | [string, string]
      | [string, string, string]
      | undefined =
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
        allow_multiselect: this.options.poll.allowMultiselect,
        answers: this.options.poll.answers.map((answer) => ({
          poll_media: {
            text: answer.text,
            emoji: Util.resolvePartialEmoji(answer.emoji) ?? undefined,
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

    this.data = {
      allowed_mentions:
        this.isMessage &&
        message_reference === undefined &&
        "author" in this.target &&
        this.target.author?.id !== this.target.client.user?.id
          ? undefined
          : allowed_mentions,
      applied_tags: appliedTags,
      attachments: this.options.attachments?.map((attachment) => ({
        id: attachment.id,
        description: attachment.description ?? undefined,
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
      message_reference,
      nonce,
      poll,
      sticker_ids,
      thread_name: threadName,
      tts,
      username,
    };
    return this;
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

  static async resolveFile(fileLike: unknown): Promise<HTTPAttachmentData> {
    let attachment: BufferResolvable | Stream;
    let name: string;

    const findName = (thing: unknown) => {
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
    };

    if (typeof fileLike === "string" || fileLike instanceof Buffer) {
      attachment = fileLike;
      name = findName(fileLike);
    } else if (isStream(fileLike)) {
      attachment = fileLike;
      name = findName(fileLike);
    } else if (
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
      attachment = attachmentValue;
      name =
        "name" in fileLike && typeof fileLike.name === "string"
          ? fileLike.name
          : findName(fileLike);
    } else {
      throw new DjsError(
        "INVALID_TYPE",
        "fileLike",
        "BufferResolvable|Stream|FileOptions|MessageAttachment"
      );
    }

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
