import GuildEmoji from './GuildEmoji';
import ReactionEmoji from './ReactionEmoji';
import ReactionUserManager from '../managers/ReactionUserManager';
import Util from '../util/Util';
import type { ReactionCountDetailsData } from '../../typings';
import type { RawMessageReactionData } from '../../typings/rawDataTypes';

export type RawMessageReactionSource = Omit<
  Partial<RawMessageReactionData>,
  'count'
> & {
  emoji: APIPartialEmoji;
  count?: number | null;
  me?: boolean;
  me_burst?: boolean;
};

interface RawMessageReactionPatch {
  burst_colors?: string[] | null;
  count?: number;
  count_details?: ReactionCountDetailsData;
}
import type { Message } from './Message';
import type { User } from './User';
import type { APIPartialEmoji } from 'discord-api-types/v10';
import type Client from '../client/Client';

function isReactionCountDetails(
  value: unknown
): value is ReactionCountDetailsData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'burst' in value &&
    typeof value.burst === 'number' &&
    'normal' in value &&
    typeof value.normal === 'number'
  );
}

class MessageReaction {
  declare client: Client;
  declare message: Message;
  declare me: boolean;
  declare meBurst: boolean;
  declare users: ReactionUserManager;
  declare _emoji: GuildEmoji | ReactionEmoji;
  declare burstColors: string[] | null;
  declare count: number;
  declare countDetails: ReactionCountDetailsData;

  constructor(
    client: Client,
    data: RawMessageReactionSource,
    message: Message
  ) {
    Object.defineProperty(this, 'client', { value: client });

    this.message = message;

    this.me = data.me ?? false;

    this.meBurst = Boolean(data.me_burst);

    this.users = new ReactionUserManager(
      this,
      this.me && client.user ? [client.user] : []
    );

    this._emoji = new ReactionEmoji(this, data.emoji);

    this.burstColors = null;

    this._patch({
      burst_colors: data.burst_colors,
      count: data.count ?? undefined,
      count_details:
        'count_details' in data && isReactionCountDetails(data.count_details)
          ? data.count_details
          : undefined,
    });
  }

  _patch(data: RawMessageReactionPatch) {
    if (data.burst_colors) {
      this.burstColors = data.burst_colors;
    }

    if (data.count !== undefined) {
      this.count ??= data.count;
    }

    const countDetails = data.count_details;
    if (countDetails) {
      this.countDetails = {
        burst: countDetails.burst,
        normal: countDetails.normal,
      };
    } else {
      this.countDetails ??= { burst: 0, normal: 0 };
    }
  }

  async remove() {
    await this.client.api
      .channels(this.message.channelId)
      .messages(this.message.id)
      .reactions(this._emoji.identifier)
      .delete();
    return this;
  }

  get emoji() {
    if (this._emoji instanceof GuildEmoji) {
      return this._emoji;
    }
    // Check to see if the emoji has become known to the client
    if (this._emoji.id) {
      const emojis = this.message.client.emojis.cache;
      if (emojis.has(this._emoji.id)) {
        const emoji = emojis.get(this._emoji.id);
        if (emoji) {
          this._emoji = emoji;
          return emoji;
        }
      }
    }
    return this._emoji;
  }

  get partial() {
    return this.count === null;
  }

  async fetch() {
    const message: Message = await this.message.fetch();
    const key = this.emoji.id ?? this.emoji.name;
    const existing =
      key === null ? undefined : message.reactions.cache.get(key);
    // The reaction won't get set when it has been completely removed
    if (existing) {
      this._patch({
        burst_colors: existing.burstColors,
        count: existing.count,
        count_details: existing.countDetails,
      });
    } else {
      this._patch({ count: 0 });
    }
    return this;
  }

  toJSON() {
    return Util.flatten(this, { emoji: 'emojiId', message: 'messageId' });
  }

  _add(user: User, burst = false) {
    if (this.partial) {
      return;
    }
    this.users.cache.set(user.id, user);
    if (
      !this.me ||
      user.id !== this.message.client.user?.id ||
      this.count === 0
    ) {
      this.count++;
      if (burst) {
        this.countDetails.burst++;
      } else {
        this.countDetails.normal++;
      }
    }
    if (user.id === this.message.client.user?.id) {
      if (burst) {
        this.meBurst = true;
      } else {
        this.me = true;
      }
    }
  }

  _remove(user: User, burst = false) {
    if (this.partial) {
      return;
    }
    this.users.cache.delete(user.id);
    if (!this.me || user.id !== this.message.client.user?.id) {
      this.count--;
      if (burst) {
        this.countDetails.burst--;
      } else {
        this.countDetails.normal--;
      }
    }
    if (user.id === this.message.client.user?.id) {
      if (burst) {
        this.meBurst = false;
      } else {
        this.me = false;
      }
    }
    if (this.count <= 0 && this.users.cache.size === 0) {
      const key = this.emoji.id ?? this.emoji.name;
      if (key !== null) {
        this.message.reactions.cache.delete(key);
      }
    }
  }
}

export default MessageReaction;
export { MessageReaction };
