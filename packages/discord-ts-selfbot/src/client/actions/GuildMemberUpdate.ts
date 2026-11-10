import Action from './Action';
import type { GatewayGuildMemberUpdateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Status, Events } = _ConstantsModule;

class GuildMemberUpdateAction extends Action {
  handle(data: GatewayGuildMemberUpdateDispatchData, shard: import('../websocket/WebSocketShard').WebSocketShard) {
    const { client } = this;
    if (data.user.username) {
      const user = client.users.cache.get(data.user.id);
      if (!user) {
        client.users._add(data.user);
      } else if (!user._equals(data.user)) {
        client.actions.UserUpdate.handle(data.user);
      }
    }

    const guild = client.guilds.cache.get(data.guild_id);
    if (guild) {
      const member = this.getMember({ user: data.user }, guild);
      if (member) {
        const old = member._update(data);
        /**
         * Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
         * @event Client#guildMemberUpdate
         * @param {GuildMember} oldMember The member before the update
         * @param {GuildMember} newMember The member after the update
         * @deprecated See {@link https://github.com/aiko-chan-ai/discord.js-selfbot-v13/issues/197 this issue} for more information.
         */
        if (shard.status === Status.READY && !member.equals(old)) client.emit(Events.GUILD_MEMBER_UPDATE, old, member);
      } else {
        const newMember = guild.members._add(data);
        /**
         * Emitted whenever a member becomes available.
         * @event Client#guildMemberAvailable
         * @param {GuildMember} member The member that became available
         */
        this.client.emit(Events.GUILD_MEMBER_AVAILABLE, newMember);
      }
    }
  }
}

export default GuildMemberUpdateAction;
export { GuildMemberUpdateAction };
