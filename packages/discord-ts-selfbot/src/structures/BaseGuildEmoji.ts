import _EmojiModule from "./Emoji";

const { Emoji } = _EmojiModule;
import type { RawGuildEmojiData } from "../../typings/rawDataTypes";
import type { BaseGuildEmojiEntity } from "../types/entities/base-guild-emoji";
import type { PatchOf } from "../types/schema";
import type { Guild } from "./Guild";
import type { GuildPreview } from "./GuildPreview";
import type Client from "../client/Client";

class BaseGuildEmoji extends Emoji implements BaseGuildEmojiEntity {
  declare available: BaseGuildEmojiEntity["available"];
  declare guild: BaseGuildEmojiEntity["guild"];
  declare managed: BaseGuildEmojiEntity["managed"];
  declare requiresColons: BaseGuildEmojiEntity["requiresColons"];
  constructor(
    client: Client,
    data: RawGuildEmojiData,
    guild: Guild | GuildPreview
  ) {
    super(client, data);

    this.guild = guild;

    this.requiresColons = null;
    this.managed = null;
    this.available = null;

    this._patch(data);
  }

  _patch(data: PatchOf<"BaseGuildEmoji">) {
    if ("name" in data) {
      this.name = data.name ?? null;
    }

    if ("require_colons" in data) {
      this.requiresColons = data.require_colons ?? null;
    }

    if ("managed" in data) {
      this.managed = data.managed ?? null;
    }

    if ("available" in data) {
      this.available = data.available ?? null;
    }
  }
}

export default BaseGuildEmoji;
export { BaseGuildEmoji };
