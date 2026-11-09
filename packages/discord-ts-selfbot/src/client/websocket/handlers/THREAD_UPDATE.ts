import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
export default (client: any, packet: any) => {
  const { old, updated } = client.actions.ChannelUpdate.handle(packet.d);
  if (old && updated) {
    /**
     * Emitted whenever a thread is updated - e.g. name change, archive state change, locked state change.
     * @event Client#threadUpdate
     * @param {ThreadChannel} oldThread The thread before the update
     * @param {ThreadChannel} newThread The thread after the update
     */
    client.emit(Events.THREAD_UPDATE, old, updated);
  }
};
