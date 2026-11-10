import type { Client } from "../../Client";
import type { WebSocketShard } from "../WebSocketShard";
import _ConstantsModule from "../../../util/Constants";

const { Events } = _ConstantsModule;

export default function handleResumed(
  client: Client,
  _packet: { d?: unknown },
  shard: WebSocketShard
) {
  const replayed = shard.sequence - shard.closeSequence;
  client.emit(Events.SHARD_RESUME, shard.id, replayed);
}
