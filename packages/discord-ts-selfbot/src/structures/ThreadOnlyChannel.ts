import GuildChannel from "./GuildChannel";
import TextBasedChannel from "./interfaces/TextBasedChannel";
import GuildForumThreadManager from "../managers/GuildForumThreadManager";
import type {
  CreateInviteOptions,
  DefaultReactionEmoji,
  GuildForumTagData,
  ThreadAutoArchiveDuration,
} from "../../typings";
import type { RawGuildChannelData } from "../../typings/rawDataTypes";
import type { PatchOf } from "../types/schema";

type ThreadOnlyChannelPatch = PatchOf<"GuildChannel"> & {
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
import type { Guild } from "./Guild";
import _ConstantsModule, { resolveEnumMember } from "../util/Constants";

const { SortOrderTypes } = _ConstantsModule;
import _UtilModule from "../util/Util";
import type { SortOrderTypes as SortOrderTypesType } from "../../typings/enums";
import type Client from "../client/Client";

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
    if ("available_tags" in data) {
      this.availableTags = (data.available_tags ?? []).map((tag) =>
        transformAPIGuildForumTag(tag)
      );
    } else {
      this.availableTags ??= [];
    }

    if ("default_reaction_emoji" in data) {
      this.defaultReactionEmoji = data.default_reaction_emoji
        ? transformAPIGuildDefaultReaction(data.default_reaction_emoji)
        : null;
    } else {
      this.defaultReactionEmoji ??= null;
    }

    if ("default_thread_rate_limit_per_user" in data) {
      this.defaultThreadRateLimitPerUser =
        data.default_thread_rate_limit_per_user ?? null;
    } else {
      this.defaultThreadRateLimitPerUser ??= null;
    }

    if ("rate_limit_per_user" in data) {
      this.rateLimitPerUser = data.rate_limit_per_user ?? null;
    } else {
      this.rateLimitPerUser ??= null;
    }

    if ("default_auto_archive_duration" in data) {
      this.defaultAutoArchiveDuration =
        data.default_auto_archive_duration ?? null;
    } else {
      this.defaultAutoArchiveDuration ??= null;
    }

    if ("nsfw" in data) {
      this.nsfw = data.nsfw ?? false;
    } else {
      this.nsfw ??= false;
    }

    if ("topic" in data) {
      this.topic = data.topic ?? null;
    }

    if ("default_sort_order" in data) {
      this.defaultSortOrder =
        resolveEnumMember(SortOrderTypes, data.default_sort_order) ?? null;
    } else {
      this.defaultSortOrder ??= null;
    }
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
  /* eslint-disable no-empty-function */
  createWebhook() {}
  fetchWebhooks() {}
  setNSFW() {}
  setRateLimitPerUser() {}
}

TextBasedChannel.applyToClass(ThreadOnlyChannel, true, [
  "send",
  "lastMessage",
  "lastPinAt",
  "bulkDelete",
  "sendTyping",
  "createMessageCollector",
  "awaitMessages",
  "createMessageComponentCollector",
  "awaitMessageComponent",
]);

export default ThreadOnlyChannel;
export { ThreadOnlyChannel };
