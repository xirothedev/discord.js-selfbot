import CallState from '../../../structures/CallState';
import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
export default (client: any, packet: any) => {
  /**
   * Emitted whenever delete a call
   * @event Client#callDelete
   * @param {Call} call Call
   */
  client.emit(Events.CALL_DELETE, new CallState(client, packet.d));
};
