import type { Client } from "../../Client";
import type { WebSocketShard } from "../WebSocketShard";
import _ConstantsModule from "../../../util/Constants";

const { Events } = _ConstantsModule;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

interface ChannelPinsData {
  channel_id: string;
  last_pin_timestamp?: string | null;
}

function isChannelPinsData(value: unknown): value is ChannelPinsData {
  return isRecord(value) && typeof value.channel_id === "string";
}

export default function handleChannelPinsUpdate(
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) {
  if (!isChannelPinsData(packet.d)) {
    return;
  }
  const data = packet.d;
  const channel = client.channels.cache.get(data.channel_id);
  const timestamp =
    typeof data.last_pin_timestamp === "string"
      ? data.last_pin_timestamp
      : null;
  const time = timestamp ? new Date(timestamp).getTime() : null;
  if (channel && "lastPinTimestamp" in channel) {
    // Discord sends null for last_pin_timestamp if the last pinned message was removed
    channel.lastPinTimestamp = time;
    client.emit(Events.CHANNEL_PINS_UPDATE, channel, time);
  }
}
