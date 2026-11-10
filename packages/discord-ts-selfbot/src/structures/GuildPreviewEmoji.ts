import BaseGuildEmoji from "./BaseGuildEmoji";
import type { Client } from "../client/Client";
import type { Guild } from "./Guild";
import type { GuildPreview } from "./GuildPreview";
import type { RawGuildEmojiData } from "../../typings/rawDataTypes";
import type { Snowflake } from "discord-api-types/v10";

class GuildPreviewEmoji extends BaseGuildEmoji {
  declare roles: Snowflake[];

  constructor(
    client: Client,
    data: RawGuildEmojiData & { roles?: Snowflake[] },
    guild: Guild | GuildPreview
  ) {
    super(client, data, guild);

    this.roles = data.roles ?? [];
  }
}

export default GuildPreviewEmoji;
export { GuildPreviewEmoji };
