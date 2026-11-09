import Action from './Action';
import _GuildMemberModule from '../../structures/GuildMember';
const { deletedGuildMembers } = _GuildMemberModule;
import _ConstantsModule from '../../util/Constants';
const { Events, Status } = _ConstantsModule;

class GuildMemberRemoveAction extends Action {
  handle(data: any, shard: any) {
    const client = this.client;
    const guild = client.guilds.cache.get(data.guild_id);
    let member = null;
    if (guild) {
      member = this.getMember({ user: data.user }, guild);
      guild.memberCount--;
      if (member) {
        deletedGuildMembers.add(member);
        guild.members.cache.delete(member.id);
        /**
         * Emitted whenever a member leaves a guild, or is kicked.
         * @event Client#guildMemberRemove
         * @param {GuildMember} member The member that has left/been kicked from the guild
         * @deprecated See {@link https://github.com/aiko-chan-ai/discord.js-selfbot-v13/issues/197 this issue} for more information.
         */
        if (shard.status === Status.READY) client.emit(Events.GUILD_MEMBER_REMOVE, member);
      }
      guild.presences.cache.delete(data.user.id);
      guild.voiceStates.cache.delete(data.user.id);
    }
    return { guild, member };
  }
}

export default GuildMemberRemoveAction;
export { GuildMemberRemoveAction };
