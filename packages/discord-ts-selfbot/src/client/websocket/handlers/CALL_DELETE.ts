const CallState = require('../../../structures/CallState');
const { Events } = require('../../../util/Constants');
export = (client: any, packet: any) => {
  /**
   * Emitted whenever delete a call
   * @event Client#callDelete
   * @param {Call} call Call
   */
  client.emit(Events.CALL_DELETE, new CallState(client, packet.d));
};
