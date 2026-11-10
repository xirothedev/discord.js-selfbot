import process from 'node:process';
import { Collection } from '@discordjs/collection';
import type {
  APIAuthorizingIntegrationOwnersMap,
  APIMessageInteractionMetadata,
  APIMessageSnapshotFields,
  APIInteractionDataResolved,
  APIInteractionDataResolvedChannel,
  APIInteractionDataResolvedGuildMember,
  APIMessage,
  APIRole,
  Snowflake,
} from 'discord-api-types/v10';
import Base from './Base';
import BaseMessageComponent, {
  type MessageComponentInstance,
  type TopLevelComponentSource,
} from './BaseMessageComponent';
import InteractionCollector from './InteractionCollector';
import MessageAttachment from './MessageAttachment';
import Embed from './MessageEmbed';
import Mentions from './MessageMentions';
import MessagePayload from './MessagePayload';
import _PollModule from './Poll';
const { Poll } = _PollModule;
import ReactionCollector from './ReactionCollector';
import type { ReactionCollectorSourceOptions } from './ReactionCollector';
import _StickerModule from './Sticker';
const { Sticker } = _StickerModule;
import Application from './interfaces/Application';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import ReactionManager from '../managers/ReactionManager';
import _ConstantsModule, { resolveEnumMember } from '../util/Constants';
const { InteractionTypes, MessageTypes, SystemMessageTypes, MessageComponentTypes, MessageReferenceTypes } =
  _ConstantsModule;
import MessageFlags from '../util/MessageFlags';
import Permissions from '../util/Permissions';
import SnowflakeUtil from '../util/SnowflakeUtil';
import Util from '../util/Util';
import type { Client } from '../client/Client';
import type { RawMessageData, RawPartialMessageData } from '../../typings/rawDataTypes';
import type {
  EmojiIdentifierResolvable,
  MessageActivity,
  MessageCall,
  MessageComponentCollectorOptions,
  MessageComponentInteraction,
  InteractionType,
  MessageReference,
  MessageReaction,
  MessageSelectMenu,
  MessageType,
  ReplyMessageOptions,
  RoleSubscriptionData,
  SharedClientTheme,
  StartThreadOptions,
  TextBasedChannelResolvable,
  AwaitMessageComponentOptions,
} from '../../typings';
import type { Guild } from './Guild';
import type { Modal } from './Modal';
import type { GuildMember } from './GuildMember';
import type { Role } from './Role';
import type User from './User';
import type { Channel } from './Channel';
import {
  isGuildBasedChannel,
  isNewsChannel,
  isTextBasedChannel,
  isThreadChannel,
  isThreadParentChannel,
  type TextBasedChannel,
} from '../types/channels';

/**
 * @type {WeakSet<Message>}
 * @private
 * @internal
 */
const deletedMessages = new WeakSet();
let deprecationEmittedForDeleted = false;

interface AuthorizingIntegrationOwners {
  [integrationType: number]: Snowflake | undefined;
  guildId: Snowflake | null;
  userId: Snowflake | null;
  readonly guild: Guild | null;
  readonly user: User | null;
  toJSON(): Record<string, Snowflake>;
}

export interface MessageInteraction {
  id: Snowflake;
  type: InteractionType;
  commandName: string;
  user: User;
}

interface MessageInteractionMetadata {
  id: Snowflake;
  type: InteractionType;
  user: User;
  authorizingIntegrationOwners: AuthorizingIntegrationOwners;
  originalResponseMessageId: Snowflake | null;
  interactedMessageId: Snowflake | null;
  triggeringInteractionMetadata: MessageInteractionMetadata | null;
}

function transformAuthorizingIntegrationOwners(
  client: Client,
  data: APIAuthorizingIntegrationOwnersMap = {},
): AuthorizingIntegrationOwners {
  return {
    ...data,
    guildId: data[0] ?? null,
    userId: data[1] ?? null,
    get guild() {
      return (this.guildId ? client.guilds.cache.get(this.guildId) : null) ?? null;
    },
    get user() {
      return (this.userId ? client.users.cache.get(this.userId) : null) ?? null;
    },
    toJSON() {
      const out: Record<string, Snowflake> = {};
      for (const [key, value] of Object.entries(data)) if (value !== undefined) out[key] = value;
      return out;
    },
  };
}

function transformInteractionMetadata(client: Client, data: APIMessageInteractionMetadata): MessageInteractionMetadata {
  return {
    id: data.id,
    type: InteractionTypes[data.type],
    user: client.users._add(data.user),
    authorizingIntegrationOwners: transformAuthorizingIntegrationOwners(client, data.authorizing_integration_owners),
    originalResponseMessageId: data.original_response_message_id ?? null,
    interactedMessageId: 'interacted_message_id' in data ? (data.interacted_message_id ?? null) : null,
    triggeringInteractionMetadata:
      'triggering_interaction_metadata' in data && data.triggering_interaction_metadata
        ? transformInteractionMetadata(client, data.triggering_interaction_metadata)
        : null,
  };
}

type ResolvedMessageData = APIInteractionDataResolved & { messages?: Record<Snowflake, APIMessage> };

interface ResolvedData {
  users?: Collection<Snowflake, User>;
  members?: Collection<Snowflake, GuildMember | APIInteractionDataResolvedGuildMember>;
  roles?: Collection<Snowflake, Role | APIRole>;
  channels?: Collection<Snowflake, Channel | APIInteractionDataResolvedChannel>;
  messages?: Collection<Snowflake, Message | APIMessage>;
  attachments?: Collection<Snowflake, MessageAttachment>;
}

function transformResolved(
  { client, guild, channel }: { client: Client; guild: Guild | null; channel: Channel | null },
  { members, users, channels, roles, messages, attachments }: ResolvedMessageData = {},
): ResolvedData {
  const result: ResolvedData = {};

  if (members) {
    result.members = new Collection<Snowflake, GuildMember | APIInteractionDataResolvedGuildMember>();
    for (const [id, member] of Object.entries(members)) {
      const user = users?.[id];
      if (!user) continue;
      result.members.set(id, guild?.members._add({ ...member, user }) ?? member);
    }
  }

  if (users) {
    result.users = new Collection<Snowflake, User>();
    for (const user of Object.values(users)) {
      result.users.set(user.id, client.users._add(user));
    }
  }

  if (roles) {
    result.roles = new Collection<Snowflake, Role | APIRole>();
    for (const role of Object.values(roles)) {
      result.roles.set(role.id, guild?.roles._add(role) ?? role);
    }
  }

  if (channels) {
    result.channels = new Collection<Snowflake, Channel | APIInteractionDataResolvedChannel>();
    for (const apiChannel of Object.values(channels)) {
      result.channels.set(apiChannel.id, client.channels._add(apiChannel, guild) ?? apiChannel);
    }
  }

  if (messages) {
    result.messages = new Collection<Snowflake, Message | APIMessage>();
    for (const message of Object.values(messages)) {
      const added = channel && isTextBasedChannel(channel) ? channel.messages.cache.get(message.id) : null;
      result.messages.set(message.id, added instanceof Message ? added : new Message(client, message));
    }
  }

  if (attachments) {
    result.attachments = new Collection<Snowflake, MessageAttachment>();
    for (const attachment of Object.values(attachments)) {
      result.attachments.set(attachment.id, new MessageAttachment(attachment.url, attachment.filename, attachment));
    }
  }

  return result;
}

function isSelectMenu(component: { type: string }): component is MessageSelectMenu {
  return (
    component.type === 'STRING_SELECT' ||
    component.type === 'USER_SELECT' ||
    component.type === 'ROLE_SELECT' ||
    component.type === 'MENTIONABLE_SELECT' ||
    component.type === 'CHANNEL_SELECT'
  );
}

function resolveSelectValue(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string') return value.id;
  return null;
}

type MessagePatchData =
  | RawMessageData
  | RawPartialMessageData
  | (APIMessageSnapshotFields & { id: Snowflake; channel_id: Snowflake; guild_id?: Snowflake });

class Message extends Base {
  declare activity: MessageActivity | null;
  declare applicationId: Snowflake | null;
  declare attachments: Collection<Snowflake, MessageAttachment>;
  declare author: User | null;
  declare channelId: Snowflake;
  declare components: TopLevelComponentSource[];
  declare content: string | null;
  declare createdTimestamp: number;
  declare editedTimestamp: number | null;
  declare embeds: Embed[];
  declare groupActivityApplication: Application | null;
  declare guildId: Snowflake | null;
  declare id: Snowflake;
  declare interaction: MessageInteraction | null;
  declare interactionMetadata: MessageInteractionMetadata | null;
  declare mentions: Mentions;
  declare nonce: string | number | null;
  declare pinned: boolean | null;
  declare reactions: ReactionManager;
  declare stickers: Collection<Snowflake, InstanceType<typeof Sticker>>;
  declare position: number | null;
  declare roleSubscriptionData: RoleSubscriptionData | null;
  declare resolved: ResolvedData | null;
  declare system: boolean | null;
  declare tts: boolean | null;
  declare type: MessageType | null;
  declare webhookId: Snowflake | null;
  declare poll: InstanceType<typeof Poll> | null;
  declare call: MessageCall | null;
  declare sharedClientTheme: SharedClientTheme | null;
  declare flags: Readonly<MessageFlags>;
  declare reference: MessageReference | null;
  declare messageSnapshots: Collection<Snowflake, Message>;

  constructor(client: Client, data: MessagePatchData) {
    super(client);

    this.channelId = data.channel_id;

    const guildId = 'guild_id' in data ? data.guild_id : undefined;
    const channelGuildId = this.channel && 'guild' in this.channel ? this.channel.guild?.id : undefined;
    this.guildId = guildId ?? channelGuildId ?? null;

    this._patch(data);
  }

  _patch(data: MessagePatchData) {
    this.id = data.id;

    if ('position' in data) {
      this.position = data.position ?? null;
    } else {
      this.position ??= null;
    }

    if ('role_subscription_data' in data && data.role_subscription_data) {
      this.roleSubscriptionData = {
        roleSubscriptionListingId: data.role_subscription_data.role_subscription_listing_id,
        tierName: data.role_subscription_data.tier_name,
        totalMonthsSubscribed: data.role_subscription_data.total_months_subscribed,
        isRenewal: data.role_subscription_data.is_renewal,
      };
    } else {
      this.roleSubscriptionData ??= null;
    }

    if ('resolved' in data) {
      this.resolved = transformResolved(
        { client: this.client, guild: this.guild, channel: this.channel },
        data.resolved,
      );
    } else {
      this.resolved ??= null;
    }

    this.createdTimestamp = this.id ? SnowflakeUtil.timestampFrom(this.id) : new Date(data.timestamp).getTime();

    if ('type' in data) {
      this.type = MessageTypes[data.type] ?? null;

      this.system = this.type !== null && SystemMessageTypes.includes(this.type);
    } else {
      this.system ??= null;
      this.type ??= null;
    }

    if ('content' in data) {
      this.content = data.content;
    } else {
      this.content ??= null;
    }

    if ('author' in data) {
      this.author = this.client.users._add(data.author, !data.webhook_id);
    } else {
      this.author ??= null;
    }

    if ('pinned' in data) {
      this.pinned = Boolean(data.pinned);
    } else {
      this.pinned ??= null;
    }

    if ('tts' in data) {
      this.tts = data.tts;
    } else {
      this.tts ??= null;
    }

    if ('nonce' in data) {
      this.nonce = data.nonce ?? null;
    } else {
      this.nonce ??= null;
    }

    if ('embeds' in data) {
      this.embeds = data.embeds.map(e => new Embed(e, true));
    } else {
      this.embeds = this.embeds?.slice() ?? [];
    }

    if ('components' in data && data.components) {
      this.components = data.components
        .map(c => BaseMessageComponent.create(c, this.client))
        .filter((c): c is TopLevelComponentSource => BaseMessageComponent.isTopLevelComponent(c));
    } else {
      this.components = this.components?.slice() ?? [];
    }

    if ('attachments' in data) {
      this.attachments = new Collection<Snowflake, MessageAttachment>();
      if (data.attachments) {
        for (const attachment of data.attachments) {
          this.attachments.set(attachment.id, new MessageAttachment(attachment.url, attachment.filename, attachment));
        }
      }
    } else {
      this.attachments = new Collection(this.attachments);
    }

    if ('sticker_items' in data || 'stickers' in data) {
      this.stickers = new Collection<Snowflake, InstanceType<typeof Sticker>>(
        (data.sticker_items ?? data.stickers)?.map(s => [s.id, new Sticker(this.client, s)]),
      );
    } else {
      this.stickers = new Collection<Snowflake, InstanceType<typeof Sticker>>(this.stickers);
    }

    // Discord sends null if the message has not been edited
    if (data.edited_timestamp) {
      this.editedTimestamp = data.edited_timestamp ? Date.parse(data.edited_timestamp) : null;
    } else {
      this.editedTimestamp ??= null;
    }

    if ('reactions' in data) {
      this.reactions = new ReactionManager(this);
      if (data.reactions && data.reactions.length > 0) {
        for (const reaction of data.reactions) {
          this.reactions._add(reaction);
        }
      }
    } else {
      this.reactions ??= new ReactionManager(this);
    }

    const mentionEveryone = 'mention_everyone' in data ? data.mention_everyone : undefined;
    const mentionChannels = 'mention_channels' in data ? data.mention_channels : undefined;
    const referencedAuthor = 'referenced_message' in data ? data.referenced_message?.author : undefined;

    if (!this.mentions) {
      this.mentions = new Mentions(
        this,
        data.mentions,
        data.mention_roles,
        mentionEveryone,
        mentionChannels,
        referencedAuthor,
      );
    } else {
      this.mentions = new Mentions(
        this,
        data.mentions ?? this.mentions.users,
        data.mention_roles ?? this.mentions.roles,
        mentionEveryone ?? this.mentions.everyone,
        mentionChannels ?? this.mentions.crosspostedChannels,
        referencedAuthor ?? this.mentions.repliedUser,
      );
    }

    if ('webhook_id' in data && data.webhook_id !== undefined) {
      this.webhookId = data.webhook_id;
    } else {
      this.webhookId ??= null;
    }

    if ('poll' in data && data.poll) {
      this.poll = new Poll(this.client, data.poll, this);
    } else {
      this.poll ??= null;
    }

    if ('application' in data) {
      this.groupActivityApplication = new Application(this.client, data.application);
    } else {
      this.groupActivityApplication ??= null;
    }

    if ('application_id' in data) {
      this.applicationId = data.application_id ?? null;
    } else {
      this.applicationId ??= null;
    }

    if ('activity' in data && data.activity) {
      this.activity = {
        partyId: data.activity.party_id ?? '',
        type: data.activity.type,
      };
    } else {
      this.activity ??= null;
    }

    if ('thread' in data && data.thread) {
      this.client.channels._add(data.thread, this.guild);
    }

    if (this.member && 'member' in data && data.member) {
      this.member._patch(data.member);
    } else if ('member' in data && data.member && this.guild && this.author) {
      this.guild.members._add(Object.assign(data.member, { user: this.author }));
    }

    if ('flags' in data) {
      this.flags = new MessageFlags(data.flags).freeze();
    } else {
      this.flags = new MessageFlags(this.flags).freeze();
    }

    if ('message_reference' in data && data.message_reference) {
      this.reference = {
        channelId: data.message_reference.channel_id,
        guildId: data.message_reference.guild_id,
        messageId: data.message_reference.message_id,
        type:
          resolveEnumMember(MessageReferenceTypes, data.message_reference.type ?? 0) ?? MessageReferenceTypes.DEFAULT,
      };
    } else {
      this.reference ??= null;
    }

    if ('referenced_message' in data && data.referenced_message) {
      this.channel?.messages._add({ guild_id: data.message_reference?.guild_id, ...data.referenced_message });
    }

    if ('interaction_metadata' in data && data.interaction_metadata) {
      this.interactionMetadata = transformInteractionMetadata(this.client, data.interaction_metadata);
    } else {
      this.interactionMetadata ??= null;
    }

    /**
     * Partial data of the interaction that a message is a reply to
     * @typedef {Object} MessageInteraction
     * @property {Snowflake} id The interaction's id
     * @property {InteractionType} type The type of the interaction
     * @property {string} commandName The name of the interaction's application command,
     * as well as the subcommand and subcommand group, where applicable
     * @property {User} user The user that invoked the interaction
     * @deprecated Use {@link Message#interactionMetadata} instead.
     */

    if ('interaction' in data && data.interaction) {
      /**
       * Partial data of the interaction that this message is a reply to
       * @type {?MessageInteraction}
       * @deprecated Use {@link Message#interactionMetadata} instead.
       */
      const interaction: MessageInteraction = {
        id: data.interaction.id,
        type: InteractionTypes[data.interaction.type],
        commandName: data.interaction.name,
        user: this.client.users._add(data.interaction.user),
      };
      this.interaction = interaction;
    } else {
      this.interaction ??= null;
    }

    if ('message_snapshots' in data && data.message_snapshots && this.reference) {
      const reference = this.reference;
      this.messageSnapshots = data.message_snapshots.reduce((coll: Collection<Snowflake, Message>, snapshot) => {
        if (!reference.messageId) return coll;
        const snapshotId = reference.messageId;
        const channel = this.client.channels.cache.get(reference.channelId);
        const snapshotData: MessagePatchData = {
          ...snapshot.message,
          id: snapshotId,
          channel_id: reference.channelId,
          guild_id: reference.guildId ?? undefined,
        };

        return coll.set(
          snapshotId,
          channel && isTextBasedChannel(channel)
            ? channel.messages._add(snapshotData)
            : new Message(this.client, snapshotData),
        );
      }, new Collection<Snowflake, Message>());
    } else {
      this.messageSnapshots ??= new Collection<Snowflake, Message>();
    }

    if ('call' in data && data.call) {
      this.call = {
        endedTimestamp: data.call.ended_timestamp ? Date.parse(data.call.ended_timestamp) : null,
        participants: data.call.participants,
        get endedAt() {
          return this.endedTimestamp ? new Date(this.endedTimestamp) : null;
        },
      };
    } else {
      this.call ??= null;
    }

    if ('shared_client_theme' in data && data.shared_client_theme) {
      this.sharedClientTheme = {
        colors: data.shared_client_theme.colors,
        gradientAngle: data.shared_client_theme.gradient_angle,
        baseMix: data.shared_client_theme.base_mix,
      };

      if ('base_theme' in data.shared_client_theme) {
        this.sharedClientTheme.baseTheme = data.shared_client_theme.base_theme;
      }
    } else {
      this.sharedClientTheme ??= null;
    }
  }

  /**
   * Whether or not the structure has been deleted
   * @type {boolean}
   * @deprecated This will be removed in the next major version, see https://github.com/discordjs/discord.js/issues/7091
   */
  get deleted() {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Message#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning',
      );
    }

    return deletedMessages.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Message#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning',
      );
    }

    if (value) deletedMessages.add(this);
    else deletedMessages.delete(this);
  }

  get channel(): TextBasedChannel | null {
    const channel = this.client.channels.cache.get(this.channelId);
    return channel && isTextBasedChannel(channel) ? channel : null;
  }

  get partial() {
    return typeof this.content !== 'string' || !this.author;
  }

  get member() {
    return this.guild?.members.resolve(this.author) ?? null;
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  get editedAt() {
    return this.editedTimestamp ? new Date(this.editedTimestamp) : null;
  }

  get guild() {
    const channel = this.channel;
    return (
      (this.guildId ? this.client.guilds.cache.get(this.guildId) : null) ??
      (channel && isGuildBasedChannel(channel) ? channel.guild : null)
    );
  }

  get hasThread() {
    return this.flags.has(MessageFlags.FLAGS.HAS_THREAD);
  }

  get thread() {
    const channel = this.channel;
    return channel && isThreadParentChannel(channel) ? (channel.threads.cache.get(this.id) ?? null) : null;
  }

  get url() {
    return `https://discord.com/channels/${this.guildId ?? '@me'}/${this.channelId}/${this.id}`;
  }

  get cleanContent() {
    // eslint-disable-next-line eqeqeq
    return this.content != null && this.channel ? Util.cleanContent(this.content, this.channel) : null;
  }

  createReactionCollector(options: ReactionCollectorSourceOptions = {}) {
    return new ReactionCollector(this, options);
  }

  awaitReactions(
    options: ReactionCollectorSourceOptions & { errors?: string[] } = {},
  ): Promise<Collection<Snowflake | string, MessageReaction>> {
    return new Promise((resolve, reject) => {
      const collector = this.createReactionCollector(options);
      collector.once('end', (reactions: Collection<Snowflake | string, MessageReaction>, reason: string) => {
        if (options.errors?.includes(reason)) reject(reactions);
        else resolve(reactions);
      });
    });
  }

  createMessageComponentCollector(options: MessageComponentCollectorOptions<MessageComponentInteraction> = {}) {
    return new InteractionCollector(this.client, {
      ...options,
      interactionType: InteractionTypes.MESSAGE_COMPONENT,
      message: this,
    });
  }

  awaitMessageComponent(
    options: AwaitMessageComponentOptions<MessageComponentInteraction> = {},
  ): Promise<MessageComponentInteraction> {
    const _options = { ...options, max: 1 };
    return new Promise((resolve, reject) => {
      const collector = this.createMessageComponentCollector(_options);
      collector.once('end', (interactions: Collection<Snowflake, MessageComponentInteraction>, reason: string) => {
        const interaction = interactions.first();
        if (interaction) resolve(interaction);
        else reject(new Error('INTERACTION_COLLECTOR_ERROR', reason));
      });
    });
  }

  get editable() {
    const channel = this.channel;
    const guildChannel = channel && isGuildBasedChannel(channel) ? channel : null;
    const precheck = Boolean(
      this.author?.id === this.client.user!.id &&
      !deletedMessages.has(this) &&
      (!this.guild || guildChannel?.viewable) &&
      this.reference?.type !== MessageReferenceTypes.FORWARD,
    );

    // Regardless of permissions thread messages cannot be edited if
    // the thread is archived or the thread is locked and the bot does not have permission to manage threads.
    if (channel && isThreadChannel(channel)) {
      if (channel.archived) return false;
      if (channel.locked) {
        const permissions = channel.permissionsFor(this.client.user!);
        if (!permissions?.has(Permissions.FLAGS.MANAGE_THREADS, true)) return false;
      }
    }

    return precheck;
  }

  get deletable() {
    if (deletedMessages.has(this)) {
      return false;
    }
    if (!this.guild) {
      return this.author?.id === this.client.user!.id;
    }
    // DMChannel does not have viewable property, so check viewable after proved that message is on a guild.
    const channel = this.channel;
    if (!channel || !isGuildBasedChannel(channel) || !channel.viewable) {
      return false;
    }

    const permissions = channel.permissionsFor(this.client.user!);
    if (!permissions) return false;
    // This flag allows deleting even if timed out
    if (permissions.has(Permissions.FLAGS.ADMINISTRATOR, false)) return true;

    const me = this.guild.members.me;
    const timedOut = me?.isCommunicationDisabled() ?? false;
    return Boolean(
      this.author?.id === this.client.user!.id ||
      (permissions.has(Permissions.FLAGS.MANAGE_MESSAGES, false) && !timedOut),
    );
  }

  get bulkDeletable() {
    return false;
  }

  get pinnable() {
    const { channel } = this;
    const guildChannel = channel && isGuildBasedChannel(channel) ? channel : null;
    return Boolean(
      !this.system &&
      !deletedMessages.has(this) &&
      (!this.guild ||
        (guildChannel?.viewable &&
          guildChannel?.permissionsFor(this.client.user!)?.has(Permissions.FLAGS.MANAGE_MESSAGES, false))),
    );
  }

  async fetchReference() {
    if (!this.reference) throw new Error('MESSAGE_REFERENCE_MISSING');
    const { channelId, messageId } = this.reference;
    if (!messageId) throw new Error('MESSAGE_REFERENCE_MISSING');
    const channel = this.client.channels.resolve(channelId);
    if (!channel || !isTextBasedChannel(channel)) throw new Error('GUILD_CHANNEL_RESOLVE');
    const message = await channel.messages.fetch(messageId);
    return message;
  }

  get crosspostable() {
    const bitfield =
      Number(Permissions.FLAGS.SEND_MESSAGES) |
      Number(this.author?.id === this.client.user!.id ? Permissions.defaultBit : Permissions.FLAGS.MANAGE_MESSAGES);
    const { channel } = this;
    return Boolean(
      channel &&
      isNewsChannel(channel) &&
      !this.flags.has(MessageFlags.FLAGS.CROSSPOSTED) &&
      this.reference?.type !== MessageReferenceTypes.FORWARD &&
      this.type === 'DEFAULT' &&
      !this.poll &&
      channel.viewable &&
      channel.permissionsFor(this.client.user!)?.has(bitfield, false) &&
      !deletedMessages.has(this),
    );
  }

  async edit(options: string | import('./MessagePayload').MessagePayloadOptions | MessagePayload) {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    return this.channel.messages.edit(this, options);
  }

  async crosspost() {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    return this.channel.messages.crosspost(this.id);
  }

  async pin(reason?: string) {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    await this.channel.messages.pin(this.id, reason);
    return this;
  }

  async unpin(reason?: string) {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    await this.channel.messages.unpin(this.id, reason);
    return this;
  }

  async react(emoji: EmojiIdentifierResolvable, burst = false) {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    await this.channel.messages.react(this.id, emoji, burst);

    const result = this.client.actions.MessageReactionAdd.handle(
      {
        [this.client.actions.injectedUser]: this.client.user,
        [this.client.actions.injectedChannel]: this.channel,
        [this.client.actions.injectedMessage]: this,
        emoji: Util.resolvePartialEmoji(emoji),
        me_burst: burst,
      },
      true,
    );
    return result ? result.reaction : null;
  }

  async delete() {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    await this.channel.messages.delete(this.id);
    return this;
  }

  async reply(options: string | MessagePayload | ReplyMessageOptions) {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    let data;

    if (options instanceof MessagePayload) {
      data = options;
    } else {
      data = MessagePayload.create(this, options, {
        reply: {
          messageReference: this,
          failIfNotExists:
            (typeof options === 'object' ? options.failIfNotExists : undefined) ?? this.client.options.failIfNotExists,
        },
      });
    }
    return this.channel.send(data);
  }

  forward(channel: TextBasedChannelResolvable) {
    const resolvedChannel = this.client.channels.resolve(channel);
    if (!resolvedChannel || !isTextBasedChannel(resolvedChannel)) {
      throw new Error('INVALID_TYPE', 'channel', 'TextBasedChannelResolvable');
    }
    return resolvedChannel.send({
      forward: {
        message: this.id,
        channel: this.channelId ?? undefined,
        guild: this.guildId ?? undefined,
      },
    });
  }

  async startThread(options: StartThreadOptions) {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    const channel = this.channel;
    if (!isThreadParentChannel(channel)) {
      throw new Error('MESSAGE_THREAD_PARENT');
    }
    if (this.hasThread) throw new Error('MESSAGE_EXISTING_THREAD');
    return channel.threads.create({ ...options, startMessage: this });
  }

  vote(...ids: number[]) {
    return this.client.api
      .channels(this.channelId)
      .polls(this.id)
      .answers['@me'].put({
        data: {
          answer_ids: ids.flat(1).map(value => value.toString()),
        },
      });
  }

  async fetch(force = true): Promise<Message> {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    return this.channel.messages.fetch(this.id, { force });
  }

  async fetchWebhook() {
    if (!this.webhookId) throw new Error('WEBHOOK_MESSAGE');
    if (this.webhookId === this.applicationId) throw new Error('WEBHOOK_APPLICATION');
    return this.client.fetchWebhook(this.webhookId);
  }

  suppressEmbeds(suppress: boolean = true) {
    const flags = new MessageFlags(this.flags.bitfield);

    if (suppress) {
      flags.add(MessageFlags.FLAGS.SUPPRESS_EMBEDS);
    } else {
      flags.remove(MessageFlags.FLAGS.SUPPRESS_EMBEDS);
    }

    return this.edit({ flags: Number(flags.bitfield) });
  }

  removeAttachments() {
    return this.edit({ attachments: [] });
  }

  resolveComponent(customId: string): MessageComponentInstance | null {
    return (
      this.components
        .flatMap(component => BaseMessageComponent.extractInteractiveComponents(component))
        .find(component => {
          if ('customId' in component && component.customId === customId) return true;
          return 'custom_id' in component && component.custom_id === customId;
        }) ?? null
    );
  }

  equals(message: Message, rawData?: RawMessageData | RawPartialMessageData) {
    if (!message) return false;
    const embedUpdate = !message.author && !message.attachments;
    if (embedUpdate) return this.id === message.id && this.embeds.length === message.embeds.length;

    let equal =
      this.id === message.id &&
      this.author?.id === message.author?.id &&
      this.content === message.content &&
      this.tts === message.tts &&
      this.nonce === message.nonce &&
      this.embeds.length === message.embeds.length &&
      this.attachments.size === message.attachments.size &&
      this.attachments.every(attachment => message.attachments.has(attachment.id)) &&
      this.embeds.every((embed, index) => embed.equals(message.embeds[index]));

    if (equal && rawData) {
      equal =
        this.mentions.everyone === message.mentions.everyone &&
        this.createdTimestamp === new Date(rawData.timestamp).getTime() &&
        this.editedTimestamp === (rawData.edited_timestamp ? new Date(rawData.edited_timestamp).getTime() : null);
    }

    return equal;
  }

  inGuild() {
    return Boolean(this.guildId);
  }

  toString(): string {
    return this.content ?? '';
  }

  toJSON() {
    return super.toJSON({
      channel: 'channelId',
      author: 'authorId',
      groupActivityApplication: 'groupActivityApplicationId',
      guild: 'guildId',
      cleanContent: true,
      member: false,
      reactions: false,
    });
  }

  // TypeScript
  get isMessage() {
    return true;
  }

  clickButton(buttonid: string) {
    const button = this.resolveComponent(buttonid);
    if (!button || button.type !== 'BUTTON') throw new TypeError('BUTTON_NOT_FOUND');
    if ('disabled' in button && button.disabled) throw new TypeError('BUTTON_CANNOT_CLICK');
    const nonce = SnowflakeUtil.generate();
    const data = {
      type: InteractionTypes.MESSAGE_COMPONENT,
      nonce,
      guild_id: this.guildId,
      channel_id: this.channelId,
      message_id: this.id,
      application_id: this.applicationId ?? this.author?.id,
      session_id: this.client.sessionId,
      message_flags: this.flags.bitfield,
      data: {
        component_type: MessageComponentTypes.BUTTON,
        custom_id: 'customId' in button ? button.customId : null,
      },
    };
    this.client.api.interactions.post({
      data,
    });
    return Util.createPromiseInteraction(this.client, nonce, 5_000, true, this);
  }

  selectMenu(menu: number | string, values: unknown[] = []): Promise<Message | Modal> {
    const components: Array<{ type: string; customId?: string | null; disabled?: boolean }> = [];
    for (const row of this.components) {
      if (!('components' in row)) continue;
      for (const component of row.components) {
        if ('type' in component && typeof component.type === 'string') {
          components.push({
            type: component.type,
            customId: 'customId' in component ? component.customId : undefined,
            disabled: 'disabled' in component ? component.disabled : undefined,
          });
        }
      }
    }
    const index = typeof menu === 'number' ? menu : /^[0-4]$/.test(menu) ? Number(menu) : undefined;
    let selectMenu: MessageSelectMenu | undefined;
    if (index !== undefined) {
      const component = components[index];
      if (component && isSelectMenu(component)) selectMenu = component;
    } else {
      selectMenu = components.find(
        (component): component is MessageSelectMenu =>
          isSelectMenu(component) && component.customId === menu && !component.disabled,
      );
    }
    if (!selectMenu) throw new RangeError('[SELECT_MENU_NOT_FOUND] The select menu could not be resolved');

    const minValues = selectMenu.minValues ?? 0;
    const maxValues = selectMenu.maxValues ?? 1;
    if (values.length < minValues) {
      throw new RangeError(`[SELECT_MENU_MIN_VALUES] The minimum number of values is ${minValues}`);
    }
    if (values.length > maxValues) {
      throw new RangeError(`[SELECT_MENU_MAX_VALUES] The maximum number of values is ${maxValues}`);
    }

    const resolvedValues = values
      .map(value => {
        if (selectMenu.type === 'STRING_SELECT') {
          const match = selectMenu.options.find(option => option.value === value || option.label === value);
          return match?.value ?? null;
        }
        return resolveSelectValue(value);
      })
      .filter((value): value is string => value !== null);

    const nonce = SnowflakeUtil.generate();
    const data = {
      type: InteractionTypes.MESSAGE_COMPONENT,
      guild_id: this.guildId,
      channel_id: this.channelId,
      message_id: this.id,
      application_id: this.applicationId ?? this.author?.id,
      session_id: this.client.sessionId,
      message_flags: this.flags.bitfield,
      data: {
        component_type: MessageComponentTypes[selectMenu.type],
        custom_id: selectMenu.customId,
        type: MessageComponentTypes[selectMenu.type],
        values: resolvedValues,
      },
      nonce,
    };
    this.client.api.interactions.post({
      data,
    });
    return Util.createPromiseInteraction(this.client, nonce, 5_000, true, this);
  }

  markUnread(): Promise<void> {
    return this.client.api.channels[this.channelId].messages[this.id].ack.post({
      data: {
        manual: true,
        mention_count: 1,
      },
    });
  }

  markRead(): Promise<void> {
    return this.client.api.channels[this.channelId].messages[this.id].ack.post({
      data: {
        token: null,
      },
    });
  }

  report(breadcrumbs: number[], elements: Record<string, unknown> = {}): Promise<{ report_id: string }> {
    return this.client.api.reporting.message.post({
      data: {
        version: '1.0',
        variant: '4',
        language: 'en',
        breadcrumbs,
        elements,
        channel_id: this.channelId,
        message_id: this.id,
        name: 'message',
      },
    });
  }
}

export { Message, deletedMessages };
export default { Message, deletedMessages };
