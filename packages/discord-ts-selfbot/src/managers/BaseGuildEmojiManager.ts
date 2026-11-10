import CachedManager from "./CachedManager";
import GuildEmoji from "../structures/GuildEmoji";
import ReactionEmoji from "../structures/ReactionEmoji";
import _UtilModule from "../util/Util";

const { parseEmoji } = _UtilModule;
import type { Client } from "../client/Client";

class BaseGuildEmojiManager extends CachedManager<GuildEmoji> {
  constructor(client: Client, iterable?: Iterable<GuildEmoji>) {
    super(client, GuildEmoji, iterable);
  }

  resolve(emoji: unknown): GuildEmoji | null {
    if (emoji instanceof ReactionEmoji) {
      return emoji.id ? (this.cache.get(emoji.id) ?? null) : null;
    }
    return super.resolve(emoji);
  }

  resolveId(emoji: unknown): string | null {
    if (emoji instanceof ReactionEmoji) {
      return emoji.id;
    }
    return super.resolveId(emoji);
  }

  resolveIdentifier(emoji: unknown): string | null {
    const emojiResolvable = this.resolve(emoji);
    if (emojiResolvable) {
      return emojiResolvable.identifier;
    }
    if (emoji instanceof ReactionEmoji) {
      return emoji.identifier;
    }
    if (typeof emoji === "string") {
      let value = emoji;
      const res = parseEmoji(value);
      if (res?.name.length) {
        value = `${res.animated ? "a:" : ""}${res.name}${res.id ? `:${res.id}` : ""}`;
      }
      if (!value.includes("%")) {
        return encodeURIComponent(value);
      }
      return value;
    }
    return null;
  }
}

export default BaseGuildEmojiManager;
export { BaseGuildEmojiManager };
