import GuildChannel from './GuildChannel';
import { patchValue } from './Base';
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
  available_tags?: {
    id?: string;
    name?: string;
    moderated?: boolean;
    emoji?: unknown;
  }[];
  default_reaction_emoji?: {
    emoji_id?: string | null;
    emoji_name?: string | null;
  } | null;
  default_thread_rate_limit_per_user?: number | null;
  rate_limit_per_user?: number | null;
  default_auto_archive_duration?: ThreadAutoArchiveDuration | null;
  nsfw?: boolean;
  topic?: string | null;
  default_sort_order?: number | null;
};
import type { Guild } from './Guild';
import _ConstantsModule, { resolveEnumMember } from '../util/Constants';

const { SortOrderTypes } = _ConstantsModule;
import _UtilModule from '../util/Util';
import type { SortOrderTypes as SortOrderTypesType } from '../../typings/enums';
import type Client from '../client/Client';

const { transformAPIGuildForumTag, transformAPIGuildDefaultReaction } =
  _UtilModule;

class ThreadOnlyChannel extends GuildChannel {
  declare threads: GuildForumThreadManager;
  declare availableTags: ReturnType<typeof transformAPIGuildForumTag>[];
  declare defaultReactionEmoji: DefaultReactionEmoji | null;
  declare defaultThreadRateLimitPerUser: number | null;
  declare rateLimitPerUser: number | null;
  declare defaultAutoArchiveDuration: ThreadAutoArchiveDuration | null;
  declare nsfw: boolean;
  declare topic: string | null;
  declare defaultSortOrder: SortOrderTypesType | null;

  constructor(guild: Guild, data: RawGuildChannelData, client?: Client) {
    super(guild, data, client, false);

    this.threads = new GuildForumThreadManager(this);

    this._patch(data);
  }

  _patch(data: ThreadOnlyChannelPatch) {
    super._patch(data);
    this.availableTags =
      'available_tags' in data
        ? (data.available_tags ?? []).map((tag) =>
            transformAPIGuildForumTag(tag)
          )
        : (this.availableTags ?? []);

    if ('default_reaction_emoji' in data) {
      this.defaultReactionEmoji = data.default_reaction_emoji
        ? transformAPIGuildDefaultReaction(data.default_reaction_emoji)
        : null;
    } else {
      this.defaultReactionEmoji ??= null;
    }

    this.defaultThreadRateLimitPerUser = patchValue(
      data.default_thread_rate_limit_per_user,
      this.defaultThreadRateLimitPerUser
    );
    this.rateLimitPerUser = patchValue(
      data.rate_limit_per_user,
      this.rateLimitPerUser
    );
    this.defaultAutoArchiveDuration = patchValue(
      data.default_auto_archive_duration,
      this.defaultAutoArchiveDuration
    );
    this.nsfw = patchValue(data.nsfw, this.nsfw, false);
    this.topic = patchValue(data.topic, this.topic);
    this.defaultSortOrder =
      'default_sort_order' in data
        ? (resolveEnumMember(SortOrderTypes, data.default_sort_order) ?? null)
        : (this.defaultSortOrder ?? null);
  }

  setAvailableTags(availableTags: GuildForumTagData[], reason?: string) {
    return this.edit({ availableTags }, reason);
  }

  setDefaultReactionEmoji(
    defaultReactionEmoji: DefaultReactionEmoji | null,
    reason?: string
  ) {
    return this.edit(
      { defaultReactionEmoji: defaultReactionEmoji ?? undefined },
      reason
    );
  }

  setDefaultThreadRateLimitPerUser(
    defaultThreadRateLimitPerUser: number,
    reason?: string
  ) {
    return this.edit({ defaultThreadRateLimitPerUser }, reason);
  }

  setDefaultSortOrder(
    defaultSortOrder: SortOrderTypesType | null,
    reason?: string
  ) {
    return this.edit({ defaultSortOrder }, reason);
  }

  createInvite(options?: CreateInviteOptions) {
    return this.guild.invites.create(this.id, options);
  }

  fetchInvites(cache = true) {
    return this.guild.invites.fetch({ cache, channelId: this.id });
  }

  setDefaultAutoArchiveDuration(
    defaultAutoArchiveDuration: ThreadAutoArchiveDuration,
    reason?: string
  ) {
    return this.edit({ defaultAutoArchiveDuration }, reason);
  }

  setTopic(topic: string | null, reason?: string) {
    return this.edit({ topic }, reason);
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  createWebhook() {
    // Implemented by the subclass mixin.
  }
  fetchWebhooks() {
    // Implemented by the subclass mixin.
  }
  setNSFW() {
    // Implemented by the subclass mixin.
  }
  setRateLimitPerUser() {
    // Implemented by the subclass mixin.
  }
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
