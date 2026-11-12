import { setImmediate } from 'node:timers';
import PacketHandlers from './handlers';
import _ConstantsModule from '../../util/Constants';
import type Client from '../Client';
import type WebSocketShard from './WebSocketShard';
import type ActionsManager from '../actions/ActionsManager';

const { Events, Status, WSEvents } = _ConstantsModule;

export interface GatewayPacket {
  ['t']?: string;
  ['d']?: unknown;
  ['op']?: number;
  ['s']?: number;
}

type PacketHandler = (
  client: Client,
  packet: GatewayPacket,
  shard?: WebSocketShard
) => unknown;

interface ActionLike {
  handle: (data: unknown, shard?: WebSocketShard) => unknown;
}

const BEFORE_READY_WHITELIST = new Set<string>([
  WSEvents.READY,
  WSEvents.RESUMED,
  WSEvents.GUILD_CREATE,
  WSEvents.GUILD_DELETE,
  WSEvents.GUILD_MEMBERS_CHUNK,
  WSEvents.GUILD_MEMBER_ADD,
  WSEvents.GUILD_MEMBER_REMOVE,
]);

const ACTION_EVENT_TYPES = [
  'APPLICATION_COMMAND_PERMISSIONS_UPDATE',
  'AUTO_MODERATION_ACTION_EXECUTION',
  'AUTO_MODERATION_RULE_CREATE',
  'AUTO_MODERATION_RULE_DELETE',
  'AUTO_MODERATION_RULE_UPDATE',
  'CHANNEL_CREATE',
  'CHANNEL_DELETE',
  'CHANNEL_UPDATE',
  'GUILD_AUDIT_LOG_ENTRY_CREATE',
  'GUILD_BAN_ADD',
  'GUILD_BAN_REMOVE',
  'GUILD_CHANNELS_POSITION_UPDATE',
  'GUILD_DELETE',
  'GUILD_EMOJI_CREATE',
  'GUILD_EMOJI_DELETE',
  'GUILD_EMOJI_UPDATE',
  'GUILD_EMOJIS_UPDATE',
  'GUILD_INTEGRATIONS_UPDATE',
  'GUILD_MEMBER_REMOVE',
  'GUILD_MEMBER_UPDATE',
  'GUILD_ROLE_CREATE',
  'GUILD_ROLE_DELETE',
  'GUILD_ROLE_UPDATE',
  'GUILD_ROLES_POSITION_UPDATE',
  'GUILD_SCHEDULED_EVENT_CREATE',
  'GUILD_SCHEDULED_EVENT_DELETE',
  'GUILD_SCHEDULED_EVENT_UPDATE',
  'GUILD_SCHEDULED_EVENT_USER_ADD',
  'GUILD_SCHEDULED_EVENT_USER_REMOVE',
  'GUILD_STICKER_CREATE',
  'GUILD_STICKER_DELETE',
  'GUILD_STICKER_UPDATE',
  'GUILD_STICKERS_UPDATE',
  'GUILD_UPDATE',
  'INVITE_CREATE',
  'INVITE_DELETE',
  'MESSAGE_CREATE',
  'MESSAGE_DELETE',
  'MESSAGE_DELETE_BULK',
  'MESSAGE_POLL_VOTE_ADD',
  'MESSAGE_POLL_VOTE_REMOVE',
  'MESSAGE_REACTION_ADD',
  'MESSAGE_REACTION_REMOVE',
  'MESSAGE_REACTION_REMOVE_ALL',
  'MESSAGE_REACTION_REMOVE_EMOJI',
  'MESSAGE_UPDATE',
  'PRESENCE_UPDATE',
  'STAGE_INSTANCE_CREATE',
  'STAGE_INSTANCE_DELETE',
  'STAGE_INSTANCE_UPDATE',
  'THREAD_CREATE',
  'THREAD_DELETE',
  'THREAD_LIST_SYNC',
  'THREAD_MEMBER_UPDATE',
  'THREAD_MEMBERS_UPDATE',
  'TYPING_START',
  'USER_UPDATE',
  'VOICE_STATE_UPDATE',
  'WEBHOOKS_UPDATE',
] as const;

function toActionPropertyName(eventType: string): string {
  return eventType
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join('');
}

function isActionLike(value: unknown): value is ActionLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'handle' in value &&
    typeof (value as { handle?: unknown }).handle === 'function'
  );
}

export class GatewayDispatch {
  private readonly client: Client;
  private readonly packetQueue: {
    packet: GatewayPacket;
    shard?: WebSocketShard;
  }[] = [];
  private readonly registry = new Map<string, PacketHandler>();

  constructor(client: Client) {
    this.client = client;
  }

  registerDefaults(actions: ActionsManager): void {
    const handlers = PacketHandlers as Record<
      string,
      PacketHandler | undefined
    >;
    for (const [eventType, handler] of Object.entries(handlers)) {
      if (typeof handler === 'function') {
        this.registry.set(eventType, handler);
      }
    }

    for (const eventType of ACTION_EVENT_TYPES) {
      if (this.registry.has(eventType)) {
        continue;
      }
      const actionName = toActionPropertyName(eventType);
      const action = Reflect.get(actions, actionName);
      if (!isActionLike(action)) {
        continue;
      }
      this.registry.set(eventType, (_client, packet, shard) =>
        action.handle(packet.d, shard)
      );
    }
  }

  handle(packet?: GatewayPacket, shard?: WebSocketShard): boolean {
    const manager = this.client.ws;

    if (
      packet &&
      manager.status !== Status.READY &&
      !BEFORE_READY_WHITELIST.has(packet.t ?? '')
    ) {
      this.packetQueue.push({ packet, shard });
      return false;
    }

    if (this.packetQueue.length) {
      const item = this.packetQueue.shift();
      if (item) {
        setImmediate(() => {
          this.handle(item.packet, item.shard);
        }).unref();
      }
    }

    if (!packet) {
      return true;
    }

    const eventType = packet.t;
    if (eventType) {
      const handler = this.registry.get(eventType);
      if (handler) {
        handler(this.client, packet, shard);
        return true;
      }
    }

    this.client.emit(Events.UNHANDLED_PACKET, packet, shard);
    return true;
  }
}

export default GatewayDispatch;
