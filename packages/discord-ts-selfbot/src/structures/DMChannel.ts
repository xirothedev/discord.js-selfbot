import { Collection } from '@discordjs/collection';
import _ChannelModule from './Channel';

const { Channel } = _ChannelModule;
import TextBasedChannel from './interfaces/TextBasedChannel';
import MessageManager from '../managers/MessageManager';
import type { APIUser, Snowflake } from 'discord-api-types/v10';
import type { User } from './User';
import type { RawChannelData } from '../../typings/rawDataTypes';
import type { PatchOf } from '../types/schema';
import type { Client } from '../client/Client';
import type { Message } from './Message';

type DMChannelPatch = PatchOf<'Channel'> & {
  recipients?: APIUser[];
  last_message_id?: Snowflake | null;
  last_pin_timestamp?: string | null;
  is_message_request?: boolean;
  is_message_request_timestamp?: string | null;
};

interface VoiceAdapter {
  destroy: () => void;
  onVoiceServerUpdate: (payload: unknown) => void;
  onVoiceStateUpdate: (payload: unknown) => void;
}
import _ConstantsModule from '../util/Constants';
import type { SendOptions, SendResult } from '../types/channels';

const { Opcodes, Status } = _ConstantsModule;

class DMChannel extends Channel {
  declare messages: MessageManager;
  declare recipient: User;
  declare lastMessageId: Snowflake | null;
  declare lastPinTimestamp: number | null;
  declare messageRequest?: boolean;
  declare messageRequestTimestamp?: number | null;
  constructor(client: Client, data: RawChannelData) {
    super(client, data);

    // Override the channel type so partials have a known type
    this.type = 'DM';

    this.messages = new MessageManager(this);
  }

  _patch(data: DMChannelPatch) {
    super._patch(data);

    if (data.recipients) {
      this.recipient = this.client.users._add(data.recipients[0]);
    }

    if ('last_message_id' in data) {
      this.lastMessageId = data.last_message_id ?? null;
    }

    if ('last_pin_timestamp' in data) {
      this.lastPinTimestamp = data.last_pin_timestamp
        ? Date.parse(data.last_pin_timestamp)
        : null;
    } else {
      this.lastPinTimestamp ??= null;
    }

    if ('is_message_request' in data) {
      this.messageRequest = data.is_message_request;
    }

    if ('is_message_request_timestamp' in data) {
      this.messageRequestTimestamp = data.is_message_request_timestamp
        ? Date.parse(data.is_message_request_timestamp)
        : null;
    }
  }

  async acceptMessageRequest() {
    if (!this.messageRequest) {
      throw new Error(
        'NOT_MESSAGE_REQUEST: This channel is not a message request'
      );
    }
    const channelData = await this.client.api.channels[this.id].recipients[
      '@me'
    ].put({
      data: {
        consent_status: 2,
      },
    });
    this.messageRequest = false;
    return this.client.channels._add(channelData, null);
  }

  async cancelMessageRequest() {
    if (!this.messageRequest) {
      throw new Error(
        'NOT_MESSAGE_REQUEST: This channel is not a message request'
      );
    }
    await this.client.api.channels[this.id].recipients['@me'].delete();
    return this;
  }

  get partial() {
    return this.lastMessageId === undefined;
  }

  fetch(force = true) {
    return this.recipient.createDM(force);
  }

  toString() {
    return this.recipient.toString();
  }

  sync() {
    this.client.ws.broadcast({
      d: {
        channel_id: this.id,
      },
      op: Opcodes.DM_UPDATE,
    });
  }

  ring() {
    return this.client.api.channels(this.id, 'call', 'ring').post({
      data: {
        recipients: null,
      },
    });
  }

  get voiceUsers() {
    const coll = new Collection();
    for (const state of this.client.voiceStates.cache.values()) {
      if (state.channelId === this.id && state.user) {
        coll.set(state.id, state.user);
      }
    }
    return coll;
  }

  get shard() {
    return this.client.ws.shards.first();
  }

  get voiceAdapterCreator() {
    return (methods: VoiceAdapter) => {
      this.client.voice.adapters.set(this.id, methods);
      return {
        destroy: () => {
          this.client.voice.adapters.delete(this.id);
        },
        sendPayload: (data: unknown) => {
          const { shard } = this;
          if (!shard || shard.status !== Status.READY) {
            return false;
          }
          shard.send(data);
          return true;
        },
      };
    };
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  get lastMessage(): Message | null {
    return null;
  }
  get lastPinAt(): Date | null {
    return null;
  }
  declare send: (options: SendOptions) => SendResult;
  sendTyping() {
    // Implemented by the subclass mixin.
  }
  createMessageCollector() {
    // Implemented by the subclass mixin.
  }
  awaitMessages() {
    // Implemented by the subclass mixin.
  }
  // Doesn't work on DM channels; setRateLimitPerUser() {}
  // Doesn't work on DM channels; setNSFW() {}
}

TextBasedChannel.applyToClass(DMChannel, true, [
  'fetchWebhooks',
  'createWebhook',
  'setRateLimitPerUser',
  'setNSFW',
]);

export default DMChannel;
export { DMChannel };
