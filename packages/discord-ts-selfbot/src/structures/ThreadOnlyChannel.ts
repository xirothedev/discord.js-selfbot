import GuildChannel from './GuildChannel';
import TextBasedChannel from './interfaces/TextBasedChannel';
import GuildForumThreadManager from '../managers/GuildForumThreadManager';
import type {
  CreateInviteOptions,
  DefaultReactionEmoji,
  GuildForumTagData,
  ThreadAutoArchiveDuration,
} from '../../typings';
import type { RawGuildChannelData } from '../../typings/rawDataTypes';
import type { PatchOf } from '../types/schema';

type ThreadOnlyChannelPatch = PatchOf<'GuildChannel'> & {
  available_tags?: { id?: string; name?: string; moderated?: boolean; emoji?: unknown }[];
  default_reaction_emoji?: { emoji_id?: string | null; emoji_name?: string | null } | null;
  default_thread_rate_limit_per_user?: number | null;
  rate_limit_per_user?: number | null;
  default_auto_archive_duration?: ThreadAutoArchiveDuration | null;
  nsfw?: boolean;
  topic?: string | null;
  default_sort_order?: number | null;
};
import type { Guild } from './Guild';
import _ConstantsModule from '../util/Constants';
const { SortOrderTypes } = _ConstantsModule;
import _UtilModule from '../util/Util';
const { transformAPIGuildForumTag, transformAPIGuildDefaultReaction } = _UtilModule;

/**
 * @typedef {Object} GuildForumTagEmoji
 * @property {?Snowflake} id The id of a guild's custom emoji
 * @property {?string} name The unicode character of the emoji
 */

/**
 * @typedef {Object} GuildForumTag
 * @property {Snowflake} id The id of the tag
 * @property {string} name The name of the tag
 * @property {boolean} moderated Whether this tag can only be added to or removed from threads
 * by a member with the `ManageThreads` permission
 * @property {?GuildForumTagEmoji} emoji The emoji of this tag
 */

/**
 * @typedef {Object} GuildForumTagData
 * @property {Snowflake} [id] The id of the tag
 * @property {string} name The name of the tag
 * @property {boolean} [moderated] Whether this tag can only be added to or removed from threads
 * by a member with the `ManageThreads` permission
 * @property {?GuildForumTagEmoji} [emoji] The emoji of this tag
 */

/**
 * @typedef {Object} DefaultReactionEmoji
 * @property {?Snowflake} id The id of a guild's custom emoji
 * @property {?string} name The unicode character of the emoji
 */

/**
 * Represents a channel that only contains threads
 * @extends {GuildChannel}
 * @implements {TextBasedChannel}
 * @abstract
 */
class ThreadOnlyChannel extends GuildChannel {
  declare threads: GuildForumThreadManager;
  declare availableTags: ReturnType<typeof transformAPIGuildForumTag>[];
  declare defaultReactionEmoji: DefaultReactionEmoji | null;
  declare defaultThreadRateLimitPerUser: number | null;
  declare rateLimitPerUser: number | null;
  declare defaultAutoArchiveDuration: ThreadAutoArchiveDuration | null;
  declare nsfw: boolean;
  declare topic: string | null;
  declare defaultSortOrder: import('../../typings/enums').SortOrderTypes | null;

  constructor(guild: Guild, data: RawGuildChannelData, client?: import('../client/Client').default) {
    super(guild, data, client, false);

    /**
     * A manager of the threads belonging to this channel
     * @type {GuildForumThreadManager}
     */
    this.threads = new GuildForumThreadManager(this);

    this._patch(data);
  }

  _patch(data: ThreadOnlyChannelPatch) {
    super._patch(data);
    if ('available_tags' in data) {
      /**
       * The set of tags that can be used in this channel.
       * @type {GuildForumTag[]}
       */
      this.availableTags = (data.available_tags ?? []).map(tag => transformAPIGuildForumTag(tag));
    } else {
      this.availableTags ??= [];
    }

    if ('default_reaction_emoji' in data) {
      /**
       * The emoji to show in the add reaction button on a thread in a guild forum channel
       * @type {?DefaultReactionEmoji}
       */
      this.defaultReactionEmoji = data.default_reaction_emoji
        ? transformAPIGuildDefaultReaction(data.default_reaction_emoji)
        : null;
    } else {
      this.defaultReactionEmoji ??= null;
    }

    if ('default_thread_rate_limit_per_user' in data) {
      /**
       * The initial rate limit per user (slowmode) to set on newly created threads in a channel.
       * @type {?number}
       */
      this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user ?? null;
    } else {
      this.defaultThreadRateLimitPerUser ??= null;
    }

    if ('rate_limit_per_user' in data) {
      /**
       * The rate limit per user (slowmode) for this channel.
       * @type {?number}
       */
      this.rateLimitPerUser = data.rate_limit_per_user ?? null;
    } else {
      this.rateLimitPerUser ??= null;
    }

    if ('default_auto_archive_duration' in data) {
      /**
       * The default auto archive duration for newly created threads in this channel.
       * @type {?ThreadAutoArchiveDuration}
       */
      this.defaultAutoArchiveDuration = data.default_auto_archive_duration ?? null;
    } else {
      this.defaultAutoArchiveDuration ??= null;
    }

    if ('nsfw' in data) {
      /**
       * If this channel is considered NSFW.
       * @type {boolean}
       */
      this.nsfw = data.nsfw ?? false;
    } else {
      this.nsfw ??= false;
    }

    if ('topic' in data) {
      /**
       * The topic of this channel.
       * @type {?string}
       */
      this.topic = data.topic ?? null;
    }

    if ('default_sort_order' in data) {
      /**
       * The default sort order mode used to order posts
       * @type {?SortOrderType}
       */
      this.defaultSortOrder =
        typeof data.default_sort_order === 'number' ? SortOrderTypes[data.default_sort_order] : null;
    } else {
      this.defaultSortOrder ??= null;
    }
  }

  /**
   * Sets the available tags for this forum channel
   * @param {GuildForumTagData[]} availableTags The tags to set as available in this channel
   * @param {string} [reason] Reason for changing the available tags
   * @returns {Promise<this>}
   */
  setAvailableTags(availableTags: GuildForumTagData[], reason?: string) {
    return this.edit({ availableTags }, reason);
  }

  /**
   * Sets the default reaction emoji for this channel
   * @param {?DefaultReactionEmoji} defaultReactionEmoji The emoji to set as the default reaction emoji
   * @param {string} [reason] Reason for changing the default reaction emoji
   * @returns {Promise<this>}
   */
  setDefaultReactionEmoji(defaultReactionEmoji: DefaultReactionEmoji | null, reason?: string) {
    return this.edit({ defaultReactionEmoji: defaultReactionEmoji ?? undefined }, reason);
  }

  /**
   * Sets the default rate limit per user (slowmode) for new threads in this channel
   * @param {number} defaultThreadRateLimitPerUser The rate limit to set on newly created threads in this channel
   * @param {string} [reason] Reason for changing the default rate limit
   * @returns {Promise<this>}
   */
  setDefaultThreadRateLimitPerUser(defaultThreadRateLimitPerUser: number, reason?: string) {
    return this.edit({ defaultThreadRateLimitPerUser }, reason);
  }

  /**
   * Sets the default sort order mode used to order posts
   * @param {?SortOrderType} defaultSortOrder The default sort order mode to set on this channel
   * @param {string} [reason] Reason for changing the default sort order
   * @returns {Promise<this>}
   */
  setDefaultSortOrder(defaultSortOrder: import('../../typings/enums').SortOrderTypes | null, reason?: string) {
    return this.edit({ defaultSortOrder }, reason);
  }

  /**
   * Creates an invite to this guild channel.
   * @param {CreateInviteOptions} [options={}] The options for creating the invite
   * @returns {Promise<Invite>}
   * @example
   * // Create an invite to a channel
   * channel.createInvite()
   *   .then(invite => console.log(`Created an invite with a code of ${invite.code}`))
   *   .catch(console.error);
   */
  createInvite(options?: CreateInviteOptions) {
    return this.guild.invites.create(this.id, options);
  }

  /**
   * Fetches a collection of invites to this guild channel.
   * Resolves with a collection mapping invites by their codes.
   * @param {boolean} [cache=true] Whether or not to cache the fetched invites
   * @returns {Promise<Collection<string, Invite>>}
   */
  fetchInvites(cache = true) {
    return this.guild.invites.fetch({ channelId: this.id, cache });
  }

  /**
   * Sets the default auto archive duration for all newly created threads in this channel.
   * @param {ThreadAutoArchiveDuration} defaultAutoArchiveDuration The new default auto archive duration
   * @param {string} [reason] Reason for changing the channel's default auto archive duration
   * @returns {Promise<this>}
   */
  setDefaultAutoArchiveDuration(defaultAutoArchiveDuration: ThreadAutoArchiveDuration, reason?: string) {
    return this.edit({ defaultAutoArchiveDuration }, reason);
  }

  /**
   * Sets a new topic for the guild channel.
   * @param {?string} topic The new topic for the guild channel
   * @param {string} [reason] Reason for changing the guild channel's topic
   * @returns {Promise<this>}
   * @example
   * // Set a new channel topic
   * channel.setTopic('needs more rate limiting')
   *   .then(newChannel => console.log(`Channel's new topic is ${newChannel.topic}`))
   *   .catch(console.error);
   */
  setTopic(topic: string | null, reason?: string) {
    return this.edit({ topic }, reason);
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  /* eslint-disable no-empty-function */
  createWebhook() {}
  fetchWebhooks() {}
  setNSFW() {}
  setRateLimitPerUser() {}
}

TextBasedChannel.applyToClass(ThreadOnlyChannel, true, [
  'send',
  'lastMessage',
  'lastPinAt',
  'bulkDelete',
  'sendTyping',
  'createMessageCollector',
  'awaitMessages',
  'createMessageComponentCollector',
  'awaitMessageComponent',
]);

export default ThreadOnlyChannel;
export { ThreadOnlyChannel };
