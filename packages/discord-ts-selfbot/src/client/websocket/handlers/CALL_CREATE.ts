import CallState from '../../../structures/CallState';
import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
export default (client: any, packet: any) => {
  for (const voice of packet.d.voice_states) {
    client.actions.VoiceStateUpdate.handle(voice);
  }
  /**
   * Emitted whenever received a call
   * @event Client#callCreate
   * @param {CallState} call Call
   */
  client.emit(Events.CALL_CREATE, new CallState(client, packet.d));
};
