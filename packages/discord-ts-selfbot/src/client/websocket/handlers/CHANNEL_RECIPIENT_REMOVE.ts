import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';
import _ConstantsModule from '../../../util/Constants';

const { Events } = _ConstantsModule;
import GroupDMChannel from '../../../structures/GroupDMChannel';
import type { RawUserData } from '../../../../typings/rawDataTypes';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRecipientData(
  value: unknown
): value is { channel_id: string; user: RawUserData } {
  return (
    isRecord(value) &&
    typeof value.channel_id === 'string' &&
    isRecord(value.user) &&
    typeof value.user.id === 'string'
  );
}

export default function handleChannelRecipientRemove(
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) {
  if (!isRecipientData(packet.d)) {
    return;
  }
  const data = packet.d;
  const channel = client.channels.cache.get(data.channel_id);
  if (channel instanceof GroupDMChannel) {
    if (!channel._recipients) {
      channel._recipients = [];
    }
    channel._recipients = channel._recipients.filter(
      (user) => user.id !== data.user.id
    );
    client.emit(
      Events.CHANNEL_RECIPIENT_REMOVE,
      channel,
      client.users._add(data.user)
    );
  }
}
