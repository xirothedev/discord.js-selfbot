import CachedManager from "./CachedManager";
import InteractionResponse from "../structures/interfaces/InteractionResponses";
import type { TextBasedChannel } from "../types/channels";

class InteractionManager extends CachedManager<InteractionResponse> {
  declare channel: TextBasedChannel;
  constructor(
    channel: TextBasedChannel,
    iterable?: Iterable<InteractionResponse>
  ) {
    super(channel.client, InteractionResponse, iterable);

    this.channel = channel;
  }

  _add(data: Record<string, unknown>, cache = true, _options?: unknown) {
    data = {
      ...data,
      channelId: this.channel.id,
      guildId:
        "guild" in this.channel && this.channel.guild
          ? this.channel.guild.id
          : undefined,
    };
    if (!data.id) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return super._add(data, cache);
  }
}

// `CachedManager#_add` takes `(data, cache, options)`. The merged overloads
// keep this manager assignable to its base.
interface InteractionManager {
  _add(data: unknown, cache?: boolean): InteractionResponse | undefined;
  _add(
    data: unknown,
    cache?: boolean,
    options?: { id?: string; extras?: unknown[] }
  ): InteractionResponse;
}

export default InteractionManager;
export { InteractionManager };
