const CallState = require('../../../structures/CallState');
const { Events } = require('../../../util/Constants');
export = (client: any, packet: any) => {
  /**
   * Emitted whenever update a call
   * @event Client#callUpdate
   * @param {Call} call Call
   */
  client.emit(Events.CALL_UPDATE, new CallState(client, packet.d));
};
