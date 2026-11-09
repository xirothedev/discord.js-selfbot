import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
export default (client: any, packet: any) => {
  const { old, updated } = client.actions.ChannelUpdate.handle(packet.d);
  if (old && updated) {
    /**
     * Emitted whenever a channel is updated - e.g. name change, topic change, channel type change.
     * @event Client#channelUpdate
     * @param {DMChannel|GuildChannel} oldChannel The channel before the update
     * @param {DMChannel|GuildChannel} newChannel The channel after the update
     */
    client.emit(Events.CHANNEL_UPDATE, old, updated);
  }
};
