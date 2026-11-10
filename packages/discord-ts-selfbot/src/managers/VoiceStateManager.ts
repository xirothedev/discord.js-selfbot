import CachedManager from "./CachedManager";
import VoiceState from "../structures/VoiceState";
import type { Guild } from "../structures/Guild";
import type { RawVoiceStateData } from "../../typings/rawDataTypes";
import type { BaseFetchOptions, GuildMemberResolvable } from "../../typings";
import type { Client } from "../client/Client";

class VoiceStateManager extends CachedManager<VoiceState> {
  declare guild: Guild | null;
  constructor(
    guild: Guild | { client: Client },
    iterable?: Iterable<VoiceState>
  ) {
    super(guild.client, VoiceState, iterable);

    this.guild = "id" in guild ? guild : null;
  }

  _add(data: RawVoiceStateData, cache = true): VoiceState {
    const existing = this.cache.get(data.user_id);
    if (existing) {
      return existing._patch(data);
    }

    const entry = new VoiceState(this.client, this.guild, data);
    if (cache) {
      this.cache.set(data.user_id, entry);
    }
    return entry;
  }

  async fetch(
    member: GuildMemberResolvable | "@me",
    { cache = true, force = false }: BaseFetchOptions = {}
  ) {
    if (!this.guild) {
      throw new Error("Guild is not defined");
    }
    const resolvedId =
      member === "@me" ? member : this.guild.members.resolveId(member);
    if (!resolvedId) {
      throw new Error("VOICE_STATE_RESOLVE_MEMBER");
    }
    const id = resolvedId === "@me" ? this.client.user!.id : resolvedId;
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) {
        return existing;
      }
    }
    const data: RawVoiceStateData = await this.client.api
      .guilds(this.guild.id)
      ["voice-states"][id].get();
    return this._add(data, cache);
  }
}

export default VoiceStateManager;
export { VoiceStateManager };
