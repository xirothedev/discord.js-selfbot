import BaseGuildEmoji from './BaseGuildEmoji';
import type { Client } from '../client/Client';
import type { Guild } from './Guild';
import type { GuildPreview } from './GuildPreview';
import type { RawGuildEmojiData } from '../../typings/rawDataTypes';
import type { Snowflake } from 'discord-api-types/v10';

/**
 * Represents an instance of an emoji belonging to a public guild obtained through Discord's preview endpoint.
 * @extends {BaseGuildEmoji}
 */
class GuildPreviewEmoji extends BaseGuildEmoji {
  declare roles: import('discord-api-types/v10').Snowflake[];
  /**
   * The public guild this emoji is part of
   * @type {GuildPreview}
   * @name GuildPreviewEmoji#guild
   */

  constructor(client: Client, data: RawGuildEmojiData & { roles?: Snowflake[] }, guild: Guild | GuildPreview) {
    super(client, data, guild);

    /**
     * The roles this emoji is active for
     * @type {Snowflake[]}
     */
    this.roles = data.roles ?? [];
  }
}

export default GuildPreviewEmoji;
export { GuildPreviewEmoji };
