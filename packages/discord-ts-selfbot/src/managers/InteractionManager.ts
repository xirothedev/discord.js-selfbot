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

  _add(data: unknown, cache?: boolean): InteractionResponse | undefined;
  _add(
    data: unknown,
    cache?: boolean,
    options?: { id?: string; extras?: unknown[] }
  ): InteractionResponse;
  _add(
    data: Record<string, unknown>,
    cache = true,
    _options?: unknown
  ): InteractionResponse | undefined {
    const payload: Record<string, unknown> = {
      ...data,
      channelId: this.channel.id,
      guildId:
        "guild" in this.channel && this.channel.guild
          ? this.channel.guild.id
          : undefined,
    };
    if (!payload.id) {
      return;
    }
    return super._add(payload, cache);
  }
}

// `CachedManager#_add` takes `(data, cache, options)`. The overloads keep this
// manager assignable to its base.
export default InteractionManager;
export { InteractionManager };
