import { Collection } from '@discordjs/collection';
import Base from './Base';
import type { Snowflake } from 'discord-api-types/v10';
import type { Client } from '../client/Client';
import type { User } from './User';

interface CallStateData {
  channel_id: Snowflake;
  region?: string;
  ringing?: Snowflake[];
  voice_states?: unknown[];
}

/**
 * Represents a call
 * @extends {Base}
 */
class CallState extends Base {
  declare channelId: Snowflake;
  declare region: string;
  declare _ringing: Snowflake[];
  constructor(client: Client, data: CallStateData) {
    super(client);
    /**
     * The channel ID of the call
     * @type {Snowflake}
     */
    this.channelId = data.channel_id;

    this._ringing = [];

    this._patch(data);
  }

  _patch(data: Partial<CallStateData>) {
    if (typeof data.region === 'string') {
      /**
       * The region of the call
       * @type {string}
       */
      this.region = data.region;
    }
    if (Array.isArray(data.ringing)) {
      this._ringing = data.ringing;
    }
  }

  /**
   * The channel of the call
   * @type {?DMChannel|GroupDMChannel}
   */
  get channel() {
    return this.client.channels.cache.get(this.channelId);
  }

  /**
   * Sets the voice region of the call
   * @param {string} region Region of the call
   * @returns {Promise<void>}
   */
  setRTCRegion(region: string) {
    return this.client.api.channels(this.channelId).call.patch({ data: { region } });
  }

  /**
   * The list of user ID who is ringing
   * @type {Collection<Snowflake, User>}
   */
  get ringing(): Collection<Snowflake, User> {
    const users = new Collection<Snowflake, User>();
    for (const id of this._ringing) {
      const user = this.client.users.cache.get(id);
      if (user) users.set(id, user);
    }
    return users;
  }
}

export default CallState;
export { CallState };
