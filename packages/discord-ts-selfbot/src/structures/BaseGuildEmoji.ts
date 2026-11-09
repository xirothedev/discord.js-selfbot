import _EmojiModule from './Emoji';
const { Emoji } = _EmojiModule;
import type { RawGuildEmojiData } from '../../typings/rawDataTypes';
import type { BaseGuildEmojiEntity } from '../types/entities/base-guild-emoji';
import type { PatchOf } from '../types/schema';
import type { Guild } from './Guild';
import type { GuildPreview } from './GuildPreview';

/**
 * Parent class for {@link GuildEmoji} and {@link GuildPreviewEmoji}.
 * @extends {Emoji}
 * @abstract
 */
class BaseGuildEmoji extends Emoji implements BaseGuildEmojiEntity {
  declare available: BaseGuildEmojiEntity['available'];
  declare guild: BaseGuildEmojiEntity['guild'];
  declare managed: BaseGuildEmojiEntity['managed'];
  declare requiresColons: BaseGuildEmojiEntity['requiresColons'];
  constructor(client: import('../client/Client').default, data: RawGuildEmojiData, guild: Guild | GuildPreview) {
    super(client, data);

    /**
     * The guild this emoji is a part of
     * @type {Guild|GuildPreview}
     */
    this.guild = guild;

    this.requiresColons = null;
    this.managed = null;
    this.available = null;

    this._patch(data);
  }

  _patch(data: PatchOf<'BaseGuildEmoji'>) {
    if ('name' in data) this.name = data.name ?? null;

    if ('require_colons' in data) {
      /**
       * Whether or not this emoji requires colons surrounding it
       * @type {?boolean}
       */
      this.requiresColons = data.require_colons ?? null;
    }

    if ('managed' in data) {
      /**
       * Whether this emoji is managed by an external service
       * @type {?boolean}
       */
      this.managed = data.managed ?? null;
    }

    if ('available' in data) {
      /**
       * Whether this emoji is available
       * @type {?boolean}
       */
      this.available = data.available ?? null;
    }
  }
}

export default BaseGuildEmoji;
export { BaseGuildEmoji };
