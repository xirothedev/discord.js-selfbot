import Modal from '../../../structures/Modal';
import _ConstantsModule from '../../../util/Constants';

const { Events } = _ConstantsModule;
import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';

export default function handleInteractionModalCreate(
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) {
  client.emit(Events.INTERACTION_MODAL_CREATE, new Modal(packet.d, client));
}
