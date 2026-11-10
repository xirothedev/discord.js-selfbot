import { Collection } from '@discordjs/collection';
import _ChannelModule from './Channel';
const { Channel } = _ChannelModule;
import TextBasedChannel from './interfaces/TextBasedChannel';
import MessageManager from '../managers/MessageManager';
import type { Snowflake } from 'discord-api-types/v10';
import type { User } from './User';
import type { RawChannelData } from '../../typings/rawDataTypes';
import type { PatchOf } from '../types/schema';
import type { Client } from '../client/Client';
import type { Message } from './Message';

type DMChannelPatch = PatchOf<'Channel'> & {
  recipients?: import('discord-api-types/v10').APIUser[];
  last_message_id?: Snowflake | null;
  last_pin_timestamp?: string | null;
  is_message_request?: boolean;
  is_message_request_timestamp?: string | null;
};

type VoiceAdapter = {
  destroy(): void;
  onVoiceServerUpdate(payload: unknown): void;
  onVoiceStateUpdate(payload: unknown): void;
};
import _ConstantsModule from '../util/Constants';
const { Opcodes, Status } = _ConstantsModule;

/**
 * Represents a direct message channel between two users.
 * @extends {Channel}
 * @implements {TextBasedChannel}
 */
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

    /**
     * A manager of the messages belonging to this channel
     * @type {MessageManager}
     */
    this.messages = new MessageManager(this);
  }

  _patch(data: DMChannelPatch) {
    super._patch(data);

    if (data.recipients) {
      /**
       * The recipient on the other end of the DM
       * @type {User}
       */
      this.recipient = this.client.users._add(data.recipients[0]);
    }

    if ('last_message_id' in data) {
      /**
       * The channel's last message id, if one was sent
       * @type {?Snowflake}
       */
      this.lastMessageId = data.last_message_id ?? null;
    }

    if ('last_pin_timestamp' in data) {
      /**
       * The timestamp when the last pinned message was pinned, if there was one
       * @type {?number}
       */
      this.lastPinTimestamp = data.last_pin_timestamp ? Date.parse(data.last_pin_timestamp) : null;
    } else {
      this.lastPinTimestamp ??= null;
    }

    if ('is_message_request' in data) {
      /**
       * Whether the channel is a message request
       * @type {?boolean}
       */
      this.messageRequest = data.is_message_request;
    }

    if ('is_message_request_timestamp' in data) {
      /**
       * The timestamp when the message request was created
       * @type {?number}
       */
      this.messageRequestTimestamp = data.is_message_request_timestamp
        ? Date.parse(data.is_message_request_timestamp)
        : null;
    }
  }

  /**
   * Accept this DMChannel.
   * @returns {Promise<DMChannel>}
   */
  async acceptMessageRequest() {
    if (!this.messageRequest) {
      throw new Error('NOT_MESSAGE_REQUEST: This channel is not a message request');
    }
    const c = await this.client.api.channels[this.id].recipients['@me'].put({
      data: {
        consent_status: 2,
      },
    });
    this.messageRequest = false;
    return this.client.channels._add(c, null);
  }

  /**
   * Cancel this DMChannel.
   * @returns {Promise<DMChannel>}
   */
  async cancelMessageRequest() {
    if (!this.messageRequest) {
      throw new Error('NOT_MESSAGE_REQUEST: This channel is not a message request');
    }
    await this.client.api.channels[this.id].recipients['@me'].delete();
    return this;
  }

  /**
   * Whether this DMChannel is a partial
   * @type {boolean}
   * @readonly
   */
  get partial() {
    return typeof this.lastMessageId === 'undefined';
  }

  /**
   * Fetch this DMChannel.
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<DMChannel>}
   */
  fetch(force = true) {
    return this.recipient.createDM(force);
  }

  /**
   * When concatenated with a string, this automatically returns the recipient's mention instead of the
   * DMChannel object.
   * @returns {string}
   * @example
   * // Logs: Hello from <@123456789012345678>!
   * console.log(`Hello from ${channel}!`);
   */
  toString() {
    return this.recipient.toString();
  }

  /**
   * Sync VoiceState of this DMChannel.
   * @returns {undefined}
   */
  sync() {
    this.client.ws.broadcast({
      op: Opcodes.DM_UPDATE,
      d: {
        channel_id: this.id,
      },
    });
  }

  /**
   * Ring the user's phone / PC (call)
   * @returns {Promise<void>}
   */
  ring() {
    return this.client.api.channels(this.id, 'call', 'ring').post({
      data: {
        recipients: null,
      },
    });
  }

  /**
   * The user in this voice-based channel
   * @type {Collection<Snowflake, User>}
   * @readonly
   */
  get voiceUsers() {
    const coll = new Collection();
    for (const state of this.client.voiceStates.cache.values()) {
      if (state.channelId === this.id && state.user) {
        coll.set(state.id, state.user);
      }
    }
    return coll;
  }

  /**
   * Get current shard
   * @type {WebSocketShard}
   * @readonly
   */
  get shard() {
    return this.client.ws.shards.first();
  }

  /**
   * The voice state adapter for this client that can be used with @discordjs/voice to play audio in DM / Group DM channels.
   * @type {?Function}
   * @readonly
   */
  get voiceAdapterCreator() {
    return (methods: VoiceAdapter) => {
      this.client.voice.adapters.set(this.id, methods);
      return {
        sendPayload: (data: unknown) => {
          if (!this.shard || this.shard.status !== Status.READY) return false;
          this.shard!.send(data);
          return true;
        },
        destroy: () => {
          this.client.voice.adapters.delete(this.id);
        },
      };
    };
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  /* eslint-disable no-empty-function */
  get lastMessage(): Message | null {
    return null;
  }
  get lastPinAt(): Date | null {
    return null;
  }
  declare send: (options: import('../types/channels').SendOptions) => import('../types/channels').SendResult;
  sendTyping() {}
  createMessageCollector() {}
  awaitMessages() {}
  // Doesn't work on DM channels; setRateLimitPerUser() {}
  // Doesn't work on DM channels; setNSFW() {}
}

TextBasedChannel.applyToClass(DMChannel, true, ['fetchWebhooks', 'createWebhook', 'setRateLimitPerUser', 'setNSFW']);

export default DMChannel;
export { DMChannel };
