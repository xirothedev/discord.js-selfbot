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
import BaseMessageComponent from './BaseMessageComponent';
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
import _ConstantsModule from '../util/Constants';
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
  MessageActionRowComponent,
  MessageActivity,
  MessageCall,
  MessageComponentCollectorOptions,
  MessageEditOptions,
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
  TopLevelComponent,
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

/**
 * Transforms an API authorizing integration owners map.
 * @param {Client} client The client
 * @param {Object} [data={}] The raw authorizing integration owners
 * @returns {Object}
 * @private
 */
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

/**
 * Transforms an API message interaction metadata object.
 * @param {Client} client The client
 * @param {Object} data The interaction metadata to transform
 * @returns {MessageInteractionMetadata}
 * @private
 */
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

/**
 * Transforms the resolved data received from the API.
 * @param {Object} supportingData Data to support the transformation
 * @param {Object} [data={}] The received resolved objects
 * @returns {CommandInteractionResolvedData}
 * @private
 */
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
      const user = ('user' in member ? member.user : undefined) ?? users?.[id];
      if (!user) continue;
      result.members.set(id, guild?.members._add({ user, ...member }) ?? member);
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

/**
 * Represents a message on Discord.
 * @extends {Base}
 */
class Message extends Base {
  declare activity: MessageActivity | null;
  declare applicationId: Snowflake | null;
  declare attachments: Collection<Snowflake, MessageAttachment>;
  declare author: User | null;
  declare channelId: Snowflake;
  declare components: TopLevelComponent[];
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

    /**
     * The id of the channel the message was sent in
     * @type {Snowflake}
     */
    this.channelId = data.channel_id;

    /**
     * The id of the guild the message was sent in, if any
     * @type {?Snowflake}
     */
    const guildId = 'guild_id' in data ? data.guild_id : undefined;
    const channelGuildId = this.channel && 'guild' in this.channel ? this.channel.guild?.id : undefined;
    this.guildId = guildId ?? channelGuildId ?? null;

    this._patch(data);
  }

  _patch(data: MessagePatchData) {
    /**
     * The message's id
     * @type {Snowflake}
     */
    this.id = data.id;

    if ('position' in data) {
      /**
       * A generally increasing integer (there may be gaps or duplicates) that represents
       * the approximate position of the message in a thread.
       * @type {?number}
       */
      this.position = data.position ?? null;
    } else {
      this.position ??= null;
    }

    if ('role_subscription_data' in data && data.role_subscription_data) {
      /**
       * Role subscription data found on role subscription purchase messages.
       * @typedef {Object} RoleSubscriptionData
       * @property {Snowflake} roleSubscriptionListingId The id of the SKU and listing the user is subscribed to
       * @property {string} tierName The name of the tier the user is subscribed to
       * @property {number} totalMonthsSubscribed The total number of months the user has been subscribed for
       * @property {boolean} isRenewal Whether this notification is a renewal
       */

      /**
       * The data of the role subscription purchase or renewal.
       * <info>This is present on role subscription purchase messages.</info>
       * @type {?RoleSubscriptionData}
       */
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
      /**
       * Resolved data from auto-populated select menus.
       * @typedef {Object} CommandInteractionResolvedData
       */
      this.resolved = transformResolved(
        { client: this.client, guild: this.guild, channel: this.channel },
        data.resolved,
      );
    } else {
      this.resolved ??= null;
    }

    /**
     * The timestamp the message was sent at
     * @type {number}
     */
    this.createdTimestamp = this.id ? SnowflakeUtil.timestampFrom(this.id) : new Date(data.timestamp).getTime();

    if ('type' in data) {
      /**
       * The type of the message
       * @type {?MessageType}
       */
      this.type = MessageTypes[data.type];

      /**
       * Whether or not this message was sent by Discord, not actually a user (e.g. pin notifications)
       * @type {?boolean}
       */
      this.system = SystemMessageTypes.includes(this.type);
    } else {
      this.system ??= null;
      this.type ??= null;
    }

    if ('content' in data) {
      /**
       * The content of the message
       * @type {?string}
       */
      this.content = data.content;
    } else {
      this.content ??= null;
    }

    if ('author' in data) {
      /**
       * The author of the message
       * @type {?User}
       */
      this.author = this.client.users._add(data.author, !data.webhook_id);
    } else {
      this.author ??= null;
    }

    if ('pinned' in data) {
      /**
       * Whether or not this message is pinned
       * @type {?boolean}
       */
      this.pinned = Boolean(data.pinned);
    } else {
      this.pinned ??= null;
    }

    if ('tts' in data) {
      /**
       * Whether or not the message was Text-To-Speech
       * @type {?boolean}
       */
      this.tts = data.tts;
    } else {
      this.tts ??= null;
    }

    if ('nonce' in data) {
      /**
       * A random number or string used for checking message delivery
       * <warn>This is only received after the message was sent successfully, and
       * lost if re-fetched</warn>
       * @type {?string}
       */
      this.nonce = data.nonce ?? null;
    } else {
      this.nonce ??= null;
    }

    if ('embeds' in data) {
      /**
       * A list of embeds in the message - e.g. YouTube Player
       * @type {MessageEmbed[]}
       */
      this.embeds = data.embeds.map(e => new Embed(e, true));
    } else {
      this.embeds = this.embeds?.slice() ?? [];
    }

    /**
     * @typedef {MessageActionRow|ContainerComponent|FileComponent|MediaGalleryComponent|SectionComponent|SeparatorComponent|TextDisplayComponent} TopLevelComponent
     */

    if ('components' in data && data.components) {
      /**
       * An array of components in the message
       * @type {TopLevelComponent[]}
       */
      this.components = data.components.map(c => BaseMessageComponent.create(c, this.client));
    } else {
      this.components = this.components?.slice() ?? [];
    }

    if ('attachments' in data) {
      /**
       * A collection of attachments in the message - e.g. Pictures - mapped by their ids
       * @type {Collection<Snowflake, MessageAttachment>}
       */
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
      /**
       * A collection of stickers in the message
       * @type {Collection<Snowflake, Sticker>}
       */
      this.stickers = new Collection<Snowflake, InstanceType<typeof Sticker>>(
        (data.sticker_items ?? data.stickers)?.map(s => [s.id, new Sticker(this.client, s)]),
      );
    } else {
      this.stickers = new Collection<Snowflake, InstanceType<typeof Sticker>>(this.stickers);
    }

    // Discord sends null if the message has not been edited
    if (data.edited_timestamp) {
      /**
       * The timestamp the message was last edited at (if applicable)
       * @type {?number}
       */
      this.editedTimestamp = data.edited_timestamp ? Date.parse(data.edited_timestamp) : null;
    } else {
      this.editedTimestamp ??= null;
    }

    if ('reactions' in data) {
      /**
       * A manager of the reactions belonging to this message
       * @type {ReactionManager}
       */
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
      /**
       * All valid mentions that the message contains
       * @type {MessageMentions}
       */
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
      /**
       * The id of the webhook that sent the message, if applicable
       * @type {?Snowflake}
       */
      this.webhookId = data.webhook_id;
    } else {
      this.webhookId ??= null;
    }

    if ('poll' in data && data.poll) {
      /**
       * The poll that was sent with the message
       * @type {?Poll}
       */
      this.poll = new Poll(this.client, data.poll, this);
    } else {
      this.poll ??= null;
    }

    if ('application' in data) {
      /**
       * Supplemental application information for group activities
       * @type {?Application}
       */
      this.groupActivityApplication = new Application(this.client, data.application);
    } else {
      this.groupActivityApplication ??= null;
    }

    if ('application_id' in data) {
      /**
       * The id of the application of the interaction that sent this message, if any
       * @type {?Snowflake}
       */
      this.applicationId = data.application_id ?? null;
    } else {
      this.applicationId ??= null;
    }

    if ('activity' in data && data.activity) {
      /**
       * Group activity
       * @type {?MessageActivity}
       */
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
      /**
       * Flags that are applied to the message
       * @type {Readonly<MessageFlags>}
       */
      this.flags = new MessageFlags(data.flags).freeze();
    } else {
      this.flags = new MessageFlags(this.flags).freeze();
    }

    /**
     * Reference data sent in a message that contains ids identifying the referenced message.
     * This can be present in the following types of message:
     * * Crossposted messages (IS_CROSSPOST {@link MessageFlags.FLAGS message flag})
     * * CHANNEL_FOLLOW_ADD
     * * CHANNEL_PINNED_MESSAGE
     * * REPLY
     * * THREAD_STARTER_MESSAGE
     * @see {@link https://discord.com/developers/docs/resources/channel#message-types}
     * @typedef {Object} MessageReference
     * @property {Snowflake} channelId The channel's id the message was referenced
     * @property {?Snowflake} guildId The guild's id the message was referenced
     * @property {?Snowflake} messageId The message's id that was referenced
     * @property {MessageReferenceType} type The type of the message reference
     */

    if ('message_reference' in data && data.message_reference) {
      /**
       * Message reference data
       * @type {?MessageReference}
       */
      this.reference = {
        channelId: data.message_reference.channel_id,
        guildId: data.message_reference.guild_id,
        messageId: data.message_reference.message_id,
        type: MessageReferenceTypes[data.message_reference.type ?? 0],
      };
    } else {
      this.reference ??= null;
    }

    if ('referenced_message' in data && data.referenced_message) {
      this.channel?.messages._add({ guild_id: data.message_reference?.guild_id, ...data.referenced_message });
    }

    if ('interaction_metadata' in data && data.interaction_metadata) {
      /**
       * Partial data of the interaction that a message is a result of
       * @typedef {Object} MessageInteractionMetadata
       * @property {Snowflake} id The interaction's id
       * @property {InteractionType} type The type of the interaction
       * @property {User} user The user that invoked the interaction
       * @property {Object} authorizingIntegrationOwners
       * Mapping of integration types that the application was authorized for the related user or guild ids
       * @property {?Snowflake} originalResponseMessageId
       * Id of the original response message. Present only on follow-up messages
       * @property {?Snowflake} interactedMessageId
       * Id of the message that contained interactive component.
       * Present only on messages created from component interactions
       * @property {?MessageInteractionMetadata} triggeringInteractionMetadata
       * Metadata for the interaction that was used to open the modal. Present only on modal submit interactions
       */

      /**
       * Partial data of the interaction that this message is a result of
       * @type {?MessageInteractionMetadata}
       */
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
      /**
       * The message snapshots associated with the message reference
       * @type {Collection<Snowflake, Message>}
       */
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

    /**
     * A call associated with a message
     * @typedef {Object} MessageCall
     * @property {Readonly<?Date>} endedAt The time the call ended
     * @property {?number} endedTimestamp The timestamp the call ended
     * @property {Snowflake[]} participants The ids of the users that participated in the call
     */

    if ('call' in data && data.call) {
      /**
       * The call associated with the message
       * @type {?MessageCall}
       */
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

    /**
     * The shared client theme sent with this message
     * @typedef {Object} SharedClientTheme
     * @property {string[]} colors The hexadecimal-encoded colors of the theme (max of 5)
     * @property {number} gradientAngle The direction of the theme's colors (0-360)
     * @property {number} baseMix The intensity of the theme's colors (0-100)
     * @property {?BaseThemeType} [baseTheme] The mode of the theme
     */

    if ('shared_client_theme' in data && data.shared_client_theme) {
      /**
       * The shared client theme sent with this message
       * @type {?SharedClientTheme}
       */
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

  /**
   * The channel that the message was sent in
   * @type {TextBasedChannels}
   * @readonly
   */
  get channel(): TextBasedChannel | null {
    const channel = this.client.channels.cache.get(this.channelId);
    return channel && isTextBasedChannel(channel) ? channel : null;
  }

  /**
   * Whether or not this message is a partial
   * @type {boolean}
   * @readonly
   */
  get partial() {
    return typeof this.content !== 'string' || !this.author;
  }

  /**
   * Represents the author of the message as a guild member.
   * Only available if the message comes from a guild where the author is still a member
   * @type {?GuildMember}
   * @readonly
   */
  get member() {
    return this.guild?.members.resolve(this.author) ?? null;
  }

  /**
   * The time the message was sent at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The time the message was last edited at (if applicable)
   * @type {?Date}
   * @readonly
   */
  get editedAt() {
    return this.editedTimestamp ? new Date(this.editedTimestamp) : null;
  }

  /**
   * The guild the message was sent in (if in a guild channel)
   * @type {?Guild}
   * @readonly
   */
  get guild() {
    const channel = this.channel;
    return (
      (this.guildId ? this.client.guilds.cache.get(this.guildId) : null) ??
      (channel && isGuildBasedChannel(channel) ? channel.guild : null)
    );
  }

  /**
   * Whether this message has a thread associated with it
   * @type {boolean}
   * @readonly
   */
  get hasThread() {
    return this.flags.has(MessageFlags.FLAGS.HAS_THREAD);
  }

  /**
   * The thread started by this message
   * <info>This property is not suitable for checking whether a message has a thread,
   * use {@link Message#hasThread} instead.</info>
   * @type {?ThreadChannel}
   * @readonly
   */
  get thread() {
    const channel = this.channel;
    return channel && isThreadParentChannel(channel) ? (channel.threads.cache.get(this.id) ?? null) : null;
  }

  /**
   * The URL to jump to this message
   * @type {string}
   * @readonly
   */
  get url() {
    return `https://discord.com/channels/${this.guildId ?? '@me'}/${this.channelId}/${this.id}`;
  }

  /**
   * The message contents with all mentions replaced by the equivalent text.
   * If mentions cannot be resolved to a name, the relevant mention in the message content will not be converted.
   * @type {?string}
   * @readonly
   */
  get cleanContent() {
    // eslint-disable-next-line eqeqeq
    return this.content != null && this.channel ? Util.cleanContent(this.content, this.channel) : null;
  }

  /**
   * Creates a reaction collector.
   * @param {ReactionCollectorOptions} [options={}] Options to send to the collector
   * @returns {ReactionCollector}
   * @example
   * // Create a reaction collector
   * const filter = (reaction, user) => reaction.emoji.name === '👌' && user.id === 'someId';
   * const collector = message.createReactionCollector({ filter, time: 15_000 });
   * collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
   * collector.on('end', collected => console.log(`Collected ${collected.size} items`));
   */
  createReactionCollector(options: ReactionCollectorSourceOptions = {}) {
    return new ReactionCollector(this, options);
  }

  /**
   * An object containing the same properties as CollectorOptions, but a few more:
   * @typedef {ReactionCollectorOptions} AwaitReactionsOptions
   * @property {string[]} [errors] Stop/end reasons that cause the promise to reject
   */

  /**
   * Similar to createReactionCollector but in promise form.
   * Resolves with a collection of reactions that pass the specified filter.
   * @param {AwaitReactionsOptions} [options={}] Optional options to pass to the internal collector
   * @returns {Promise<Collection<string | Snowflake, MessageReaction>>}
   * @example
   * // Create a reaction collector
   * const filter = (reaction, user) => reaction.emoji.name === '👌' && user.id === 'someId'
   * message.awaitReactions({ filter, time: 15_000 })
   *   .then(collected => console.log(`Collected ${collected.size} reactions`))
   *   .catch(console.error);
   */
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

  /**
   * @typedef {CollectorOptions} MessageComponentCollectorOptions
   * @property {MessageComponentType} [componentType] The type of component to listen for
   * @property {number} [max] The maximum total amount of interactions to collect
   * @property {number} [maxComponents] The maximum number of components to collect
   * @property {number} [maxUsers] The maximum number of users to interact
   */

  /**
   * Creates a message component interaction collector.
   * @param {MessageComponentCollectorOptions} [options={}] Options to send to the collector
   * @returns {InteractionCollector}
   * @example
   * // Create a message component interaction collector
   * const filter = (interaction) => interaction.customId === 'button' && interaction.user.id === 'someId';
   * const collector = message.createMessageComponentCollector({ filter, time: 15_000 });
   * collector.on('collect', i => console.log(`Collected ${i.customId}`));
   * collector.on('end', collected => console.log(`Collected ${collected.size} items`));
   */
  createMessageComponentCollector(options: MessageComponentCollectorOptions<MessageComponentInteraction> = {}) {
    return new InteractionCollector(this.client, {
      ...options,
      interactionType: InteractionTypes.MESSAGE_COMPONENT,
      message: this,
    });
  }

  /**
   * An object containing the same properties as CollectorOptions, but a few more:
   * @typedef {Object} AwaitMessageComponentOptions
   * @property {CollectorFilter} [filter] The filter applied to this collector
   * @property {number} [time] Time to wait for an interaction before rejecting
   * @property {MessageComponentType} [componentType] The type of component interaction to collect
   * @property {number} [idle] Time to wait without another message component interaction before ending the collector
   * @property {boolean} [dispose] Whether to remove the message component interaction after collecting
   */

  /**
   * Collects a single component interaction that passes the filter.
   * The Promise will reject if the time expires.
   * @param {AwaitMessageComponentOptions} [options={}] Options to pass to the internal collector
   * @returns {Promise<MessageComponentInteraction>}
   * @example
   * // Collect a message component interaction
   * const filter = (interaction) => interaction.customId === 'button' && interaction.user.id === 'someId';
   * message.awaitMessageComponent({ filter, time: 15_000 })
   *   .then(interaction => console.log(`${interaction.customId} was clicked!`))
   *   .catch(console.error);
   */
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

  /**
   * Whether the message is editable by the client user
   * @type {boolean}
   * @readonly
   */
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

  /**
   * Whether the message is deletable by the client user
   * @type {boolean}
   * @readonly
   */
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

  /**
   * Whether the message is bulk deletable by the client user
   * @type {boolean}
   * @readonly
   * @example
   * // Filter for bulk deletable messages
   * channel.bulkDelete(messages.filter(message => message.bulkDeletable));
   */
  get bulkDeletable() {
    return false;
  }

  /**
   * Whether the message is pinnable by the client user
   * @type {boolean}
   * @readonly
   */
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

  /**
   * Fetches the Message this crosspost/reply/pin-add references, if available to the client
   * @returns {Promise<Message>}
   */
  async fetchReference() {
    if (!this.reference) throw new Error('MESSAGE_REFERENCE_MISSING');
    const { channelId, messageId } = this.reference;
    if (!messageId) throw new Error('MESSAGE_REFERENCE_MISSING');
    const channel = this.client.channels.resolve(channelId);
    if (!channel || !isTextBasedChannel(channel)) throw new Error('GUILD_CHANNEL_RESOLVE');
    const message = await channel.messages.fetch(messageId);
    return message;
  }

  /**
   * Whether the message is crosspostable by the client user
   * @type {boolean}
   * @readonly
   */
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

  /**
   * Options that can be passed into {@link Message#edit}.
   * @typedef {Object} MessageEditOptions
   * @property {?string} [content] Content to be edited
   * @property {MessageEmbed[]|APIEmbed[]} [embeds] Embeds to be added/edited
   * @property {MessageMentionOptions} [allowedMentions] Which mentions should be parsed from the message content
   * @property {MessageFlags} [flags] Which flags to set for the message. Only `SUPPRESS_EMBEDS` can be edited.
   * @property {MessageAttachment[]} [attachments] An array of attachments to keep,
   * all attachments will be kept if omitted
   * @property {FileOptions[]|BufferResolvable[]|MessageAttachment[]} [files] Files to add to the message
   * @property {MessageActionRow[]|MessageActionRowOptions[]} [components]
   * Action rows containing interactive components for the message (buttons, select menus)
   */

  /**
   * Edits the content of the message.
   * @param {string|MessagePayload|MessageEditOptions} options The options to provide
   * @returns {Promise<Message>}
   * @example
   * // Update the content of a message
   * message.edit('This is my new content!')
   *   .then(msg => console.log(`Updated the content of a message to ${msg.content}`))
   *   .catch(console.error);
   */
  async edit(options: string | MessageEditOptions | MessagePayload) {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    return this.channel.messages.edit(this, options);
  }

  /**
   * Publishes a message in an announcement channel to all channels following it.
   * @returns {Promise<Message>}
   * @example
   * // Crosspost a message
   * if (message.channel.type === 'GUILD_NEWS') {
   *   message.crosspost()
   *     .then(() => console.log('Crossposted message'))
   *     .catch(console.error);
   * }
   */
  async crosspost() {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    return this.channel.messages.crosspost(this.id);
  }

  /**
   * Pins this message to the channel's pinned messages.
   * @param {string} [reason] Reason for pinning
   * @returns {Promise<Message>}
   * @example
   * // Pin a message
   * message.pin()
   *   .then(console.log)
   *   .catch(console.error)
   */
  async pin(reason?: string) {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    await this.channel.messages.pin(this.id, reason);
    return this;
  }

  /**
   * Unpins this message from the channel's pinned messages.
   * @param {string} [reason] Reason for unpinning
   * @returns {Promise<Message>}
   * @example
   * // Unpin a message
   * message.unpin()
   *   .then(console.log)
   *   .catch(console.error)
   */
  async unpin(reason?: string) {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    await this.channel.messages.unpin(this.id, reason);
    return this;
  }

  /**
   * Adds a reaction to the message.
   * @param {EmojiIdentifierResolvable} emoji The emoji to react with
   * @param {boolean} [burst=false] Super Reactions
   * @returns {Promise<MessageReaction>}
   * @example
   * // React to a message with a unicode emoji
   * message.react('🤔')
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // React to a message with a custom emoji
   * message.react(message.guild.emojis.cache.get('123456789012345678'))
   *   .then(console.log)
   *   .catch(console.error);
   */
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

  /**
   * Deletes the message.
   * @returns {Promise<Message>}
   * @example
   * // Delete a message
   * message.delete()
   *   .then(msg => console.log(`Deleted message from ${msg.author.username}`))
   *   .catch(console.error);
   */
  async delete() {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    await this.channel.messages.delete(this.id);
    return this;
  }

  /**
   * Options provided when sending a message as an inline reply.
   * @typedef {BaseMessageOptions} ReplyMessageOptions
   * @property {boolean} [failIfNotExists=true] Whether to error if the referenced message
   * does not exist (creates a standard message in this case when false)
   * @property {StickerResolvable[]} [stickers=[]] Stickers to send in the message
   */

  /**
   * Send an inline reply to this message.
   * @param {string|MessagePayload|ReplyMessageOptions} options The options to provide
   * @returns {Promise<Message>}
   * @example
   * // Reply to a message
   * message.reply('This is a reply!')
   *   .then(() => console.log(`Replied to message "${message.content}"`))
   *   .catch(console.error);
   */
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

  /**
   * Forwards this message
   * @param {TextBasedChannelResolvable} channel The channel to forward this message to.
   * @returns {Promise<Message>}
   */
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

  /**
   * A number that is allowed to be the duration (in minutes) of inactivity after which a thread is automatically
   * archived. This can be:
   * * `60` (1 hour)
   * * `1440` (1 day)
   * * `4320` (3 days)
   * * `10080` (7 days)
   * * `'MAX'` (7 days)
   * <warn>This option is deprecated and will be removed in the next major version.</warn>
   * @typedef {number|string} ThreadAutoArchiveDuration
   */

  /**
   * Options for starting a thread on a message.
   * @typedef {Object} StartThreadOptions
   * @property {string} name The name of the new thread
   * @property {ThreadAutoArchiveDuration} [autoArchiveDuration=this.channel.defaultAutoArchiveDuration] The amount of
   * time (in minutes) after which the thread should automatically archive in case of no recent activity
   * @property {string} [reason] Reason for creating the thread
   * @property {number} [rateLimitPerUser] The rate limit per user (slowmode) for the thread in seconds
   */

  /**
   * Create a new public thread from this message
   * @see GuildTextThreadManager#create
   * @param {StartThreadOptions} [options] Options for starting a thread on this message
   * @returns {Promise<ThreadChannel>}
   */
  async startThread(options: StartThreadOptions) {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    const channel = this.channel;
    if (!isThreadParentChannel(channel)) {
      throw new Error('MESSAGE_THREAD_PARENT');
    }
    if (this.hasThread) throw new Error('MESSAGE_EXISTING_THREAD');
    return channel.threads.create({ ...options, startMessage: this });
  }

  /**
   * Submits a poll vote for the current user. Returns a 204 empty response on success.
   * @param  {...number[]} ids ID of the answer
   * @returns {Promise<void>}
   * @example
   * // Vote multi choices
   * message.vote(1,2);
   * // Remove vote
   * message.vote();
   */
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

  /**
   * Fetch this message.
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<Message>}
   */
  async fetch(force = true): Promise<Message> {
    if (!this.channel) throw new Error('CHANNEL_NOT_CACHED');
    return this.channel.messages.fetch(this.id, { force });
  }

  /**
   * Fetches the webhook used to create this message.
   * @returns {Promise<?Webhook>}
   */
  async fetchWebhook() {
    if (!this.webhookId) throw new Error('WEBHOOK_MESSAGE');
    if (this.webhookId === this.applicationId) throw new Error('WEBHOOK_APPLICATION');
    return this.client.fetchWebhook(this.webhookId);
  }

  /**
   * Suppresses or unsuppresses embeds on a message.
   * @param {boolean} [suppress=true] If the embeds should be suppressed or not
   * @returns {Promise<Message>}
   */
  suppressEmbeds(suppress: boolean = true) {
    const flags = new MessageFlags(this.flags.bitfield);

    if (suppress) {
      flags.add(MessageFlags.FLAGS.SUPPRESS_EMBEDS);
    } else {
      flags.remove(MessageFlags.FLAGS.SUPPRESS_EMBEDS);
    }

    return this.edit({ flags: Number(flags.bitfield) });
  }

  /**
   * Removes the attachments from this message.
   * @returns {Promise<Message>}
   */
  removeAttachments() {
    return this.edit({ attachments: [] });
  }

  /**
   * Resolves a component by a custom id.
   * @param {string} customId The custom id to resolve against
   * @returns {?MessageActionRowComponent}
   */
  resolveComponent(customId: string): MessageActionRowComponent | null {
    return (
      this.components
        .flatMap(BaseMessageComponent.extractInteractiveComponents)
        .find(
          (component: MessageActionRowComponent & { custom_id?: string }) =>
            (component.customId ?? component.custom_id) === customId,
        ) ?? null
    );
  }

  /**
   * Used mainly internally. Whether two messages are identical in properties. If you want to compare messages
   * without checking all the properties, use `message.id === message2.id`, which is much more efficient. This
   * method allows you to see if there are differences in content, embeds, attachments, nonce and tts properties.
   * @param {Message} message The message to compare it to
   * @param {APIMessage} rawData Raw data passed through the WebSocket about this message
   * @returns {boolean}
   */
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
      this.attachments.every((attachment: any) => message.attachments.has(attachment.id)) &&
      this.embeds.every((embed: any, index: any) => embed.equals(message.embeds[index]));

    if (equal && rawData) {
      equal =
        this.mentions.everyone === message.mentions.everyone &&
        this.createdTimestamp === new Date(rawData.timestamp).getTime() &&
        this.editedTimestamp === (rawData.edited_timestamp ? new Date(rawData.edited_timestamp).getTime() : null);
    }

    return equal;
  }

  /**
   * Whether this message is from a guild.
   * @returns {boolean}
   */
  inGuild() {
    return Boolean(this.guildId);
  }

  /**
   * When concatenated with a string, this automatically concatenates the message's content instead of the object.
   * @returns {string}
   * @example
   * // Logs: Message: This is a message!
   * console.log(`Message: ${message}`);
   */
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
  /**
   * Check data
   * @type {boolean}
   * @readonly
   */
  get isMessage() {
    return true;
  }

  /**
   * Click a specified button in the message based on the button's CustomID
   * @param {string} buttonid customId of the button to click
   *
   * To be compatible with Components V2, the following methods have been removed in this version:
   * - Clicking by coordinates (using ActionRow)
   * - Clicking the first button in the message
   *
   * Currently, only clicking by CustomID is supported.
   * @returns {Promise<Message|Modal>}
   */
  clickButton(buttonid: string) {
    const button = this.resolveComponent(buttonid);
    if (!button || button.type !== 'BUTTON') throw new TypeError('BUTTON_NOT_FOUND');
    if (button.disabled) throw new TypeError('BUTTON_CANNOT_CLICK');
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
        custom_id: button.customId,
      },
    };
    this.client.api.interactions.post({
      data,
    });
    return Util.createPromiseInteraction(this.client, nonce, 5_000, true, this);
  }

  /**
   * Select specific menu
   * @param {number|string} menu Target
   * @param {Array<UserResolvable | RoleResolvable | ChannelResolvable | string>} values Any value
   * @returns {Promise<Message|Modal>}
   */
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

  /**
   * Marks the message as unread.
   * @returns {Promise<void>}
   */
  markUnread(): Promise<void> {
    return this.client.api.channels[this.channelId].messages[this.id].ack.post({
      data: {
        manual: true,
        mention_count: 1,
      },
    });
  }

  /**
   * Marks the message as read.
   * @returns {Promise<void>}
   */
  markRead(): Promise<void> {
    return this.client.api.channels[this.channelId].messages[this.id].ack.post({
      data: {
        token: null,
      },
    });
  }

  /**
   * Report Message
   * @param {Array<number>} breadcrumbs Options for reporting
   * @param {Object} [elements={}] Metadata
   * @returns {Promise<{ report_id: Snowflake }>}
   * @example
   * // GET https://discord.com/api/v9/reporting/menu/message?variant=4
   * // Report Category
   * // - <hidden>MESSAGE_WELCOME (3)</hidden>
   * // - Something else (28)
   * // - Hacks, cheats, phishing or malicious links (72)
   * message.report([3, 28, 72]).then(console.log);
   * // { "report_id": "1199663489988440124" }
   */
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
