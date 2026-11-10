import Modal from '../../../structures/Modal';
import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';
export default (client: Client, packet: { d?: unknown }, _shard: WebSocketShard) => {
  /**
   * Emitted whenever client user receive interaction.showModal()
   * @event Client#interactionModalCreate
   * @param {Modal} modal The modal (extended)
   */
  client.emit(Events.INTERACTION_MODAL_CREATE, new Modal(packet.d, client));
};
