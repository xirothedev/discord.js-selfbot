import { setTimeout } from 'node:timers';
import Action from './Action';
import type { Client } from '../Client';
import type { GatewayGuildDeleteDispatchData } from 'discord-api-types/v10';
import _GuildModule from '../../structures/Guild';
import type { Guild } from '../../structures/Guild';
const { deletedGuilds } = _GuildModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildDeleteAction extends Action {
  declare deleted: Map<string, Guild>;

  constructor(client: Client) {
    super(client);
    this.deleted = new Map<string, InstanceType<typeof Guild>>();
  }

  handle(data: GatewayGuildDeleteDispatchData) {
    const client = this.client;

    let guild: Guild | null = client.guilds.cache.get(data.id) ?? null;
    if (guild) {
      if (data.unavailable) {
        // Guild is unavailable
        guild.available = false;

        /**
         * Emitted whenever a guild becomes unavailable, likely due to a server outage.
         * @event Client#guildUnavailable
         * @param {Guild} guild The guild that has become unavailable
         */
        client.emit(Events.GUILD_UNAVAILABLE, guild);

        // Stops the GuildDelete packet thinking a guild was actually deleted,
        // handles emitting of event itself
        return {
          guild: null,
        };
      }

      for (const channel of guild.channels.cache.values()) this.client.channels._remove(channel.id);
      client.voice.adapters.get(data.id)?.destroy();

      // Delete guild
      client.guilds.cache.delete(guild.id);
      deletedGuilds.add(guild);

      /**
       * Emitted whenever a guild kicks the client or the guild is deleted/left.
       * @event Client#guildDelete
       * @param {Guild} guild The guild that was deleted
       */
      client.emit(Events.GUILD_DELETE, guild);

      this.deleted.set(guild.id, guild);
      this.scheduleForDeletion(guild.id);
    } else {
      guild = this.deleted.get(data.id) ?? null;
    }

    return { guild };
  }

  scheduleForDeletion(id: string) {
    setTimeout(() => this.deleted.delete(id), this.client.options.restWsBridgeTimeout).unref();
  }
}

export default GuildDeleteAction;
export { GuildDeleteAction };
