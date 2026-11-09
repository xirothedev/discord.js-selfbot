import CallState from '../../../structures/CallState';
import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
export default (client: any, packet: any) => {
  /**
   * Emitted whenever update a call
   * @event Client#callUpdate
   * @param {Call} call Call
   */
  client.emit(Events.CALL_UPDATE, new CallState(client, packet.d));
};
