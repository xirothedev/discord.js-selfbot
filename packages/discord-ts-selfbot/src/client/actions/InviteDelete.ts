import Action from './Action';
import GuildChannel from '../../structures/GuildChannel';
import type { GatewayInviteDeleteDispatchData } from 'discord-api-types/v10';
import Invite from '../../structures/Invite';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class InviteDeleteAction extends Action {
  handle(data: GatewayInviteDeleteDispatchData) {
    const client = this.client;
    const channel = client.channels.cache.get(data.channel_id);
    const guild = data.guild_id ? client.guilds.cache.get(data.guild_id) : undefined;
    if (!channel || !(channel instanceof GuildChannel) || !guild) return false;

    const inviteData = Object.assign(data, { channel, guild });
    const invite = new Invite(client, inviteData);
    guild.invites.cache.delete(invite.code);

    /**
     * Emitted when an invite is deleted.
     * <info> This event only triggers if the client has `MANAGE_GUILD` permissions for the guild,
     * or `MANAGE_CHANNELS` permissions for the channel.</info>
     * @event Client#inviteDelete
     * @param {Invite} invite The invite that was deleted
     */
    client.emit(Events.INVITE_DELETE, invite);
    return { invite };
  }
}

export default InviteDeleteAction;
export { InviteDeleteAction };
