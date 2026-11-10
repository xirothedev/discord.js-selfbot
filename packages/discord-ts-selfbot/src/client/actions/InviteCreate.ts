import Action from './Action';
import GuildChannel from '../../structures/GuildChannel';
import type { GatewayInviteCreateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class InviteCreateAction extends Action {
  handle(data: GatewayInviteCreateDispatchData) {
    const { client } = this;
    const channel = client.channels.cache.get(data.channel_id);
    const guild = data.guild_id
      ? client.guilds.cache.get(data.guild_id)
      : undefined;
    if (!channel || !(channel instanceof GuildChannel) || !guild) {
      return false;
    }

    const inviteData = Object.assign(data, { channel, guild });
    const invite = guild.invites._add(inviteData);

    client.emit(Events.INVITE_CREATE, invite);
    return { invite };
  }
}

export default InviteCreateAction;
export { InviteCreateAction };
