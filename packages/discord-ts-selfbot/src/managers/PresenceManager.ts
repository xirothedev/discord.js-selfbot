import CachedManager from "./CachedManager";
import _PresenceModule from "../structures/Presence";

const { Presence } = _PresenceModule;
import type { RawPresenceData } from "../../typings/rawDataTypes";
import type { GatewayGuildMembersChunkPresence } from "discord-api-types/v10";
import type { Client } from "../client/Client";
import type { Presence as PresenceType } from "../structures/Presence";

class PresenceManager extends CachedManager<PresenceType> {
  constructor(
    client: Client,
    iterable?: Iterable<InstanceType<typeof Presence>>
  ) {
    super(client, Presence, iterable);
  }

  _add(
    data: RawPresenceData | GatewayGuildMembersChunkPresence,
    cache = true
  ): InstanceType<typeof Presence> {
    return super._add(data, cache, { id: data.user.id });
  }

  resolve(presence: unknown): InstanceType<typeof Presence> | null {
    const presenceResolvable = super.resolve(presence);
    if (presenceResolvable) {
      return presenceResolvable;
    }
    const userId = this.client.users.resolveId(presence);
    return userId ? (this.cache.get(userId) ?? null) : null;
  }

  resolveId(presence: unknown): string | null {
    const presenceResolvable = super.resolveId(presence);
    if (presenceResolvable) {
      return presenceResolvable;
    }
    const userId = this.client.users.resolveId(presence);
    if (!userId) {
      return null;
    }
    return this.cache.has(userId) ? userId : null;
  }

  async fetch() {
    const data: { presences: RawPresenceData[] } =
      await this.client.api.presences.get();
    // https://docs.discord.food/resources/presence#endpoints
    for (const presence of data.presences) {
      this._add(presence, true);
    }
    return this.cache;
  }
}

export default PresenceManager;
export { PresenceManager };
