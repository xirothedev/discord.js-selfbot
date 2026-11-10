import process from "node:process";
import Base from "./Base";
import SnowflakeUtil from "../util/SnowflakeUtil";
import type { RawEmojiData } from "../../typings/rawDataTypes";
import type { EmojiEntity } from "../types/entities/emoji";
import type Client from "../client/Client";

/**
 * @type {WeakSet<Emoji>}
 * @private
 * @internal
 */
const deletedEmojis = new WeakSet();
let deprecationEmittedForDeleted = false;

class Emoji extends Base implements EmojiEntity {
  declare animated: EmojiEntity["animated"];
  declare id: EmojiEntity["id"];
  declare name: EmojiEntity["name"];
  constructor(client: Client, emoji: RawEmojiData) {
    super(client);
    this.animated = "animated" in emoji ? (emoji.animated ?? null) : null;

    this.name = emoji.name ?? null;

    this.id = emoji.id ?? null;
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
        "Emoji#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.",
        "DeprecationWarning"
      );
    }

    return deletedEmojis.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        "Emoji#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.",
        "DeprecationWarning"
      );
    }

    if (value) {
      deletedEmojis.add(this);
    } else {
      deletedEmojis.delete(this);
    }
  }

  get identifier() {
    if (this.id) {
      return `${this.animated ? "a:" : ""}${this.name}:${this.id}`;
    }
    return encodeURIComponent(this.name ?? "");
  }

  get url() {
    return (
      this.id &&
      this.client.rest.cdn.Emoji(this.id, this.animated ? "gif" : "png")
    );
  }

  get createdTimestamp() {
    return this.id && SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return this.createdTimestamp ? new Date(this.createdTimestamp) : null;
  }

  toString() {
    return this.id
      ? `<${this.animated ? "a" : ""}:${this.name}:${this.id}>`
      : (this.name ?? "");
  }

  toJSON() {
    return super.toJSON({
      createdTimestamp: true,
      guild: "guildId",
      identifier: true,
      url: true,
    });
  }
}

export { Emoji, deletedEmojis };
export default { Emoji, deletedEmojis };
