import { Collection } from '@discordjs/collection';
import Base from './Base';
import WidgetMember from './WidgetMember';
import type { RawWidgetData } from '../../typings/rawDataTypes';
import type { WidgetChannel } from '../../typings';
import type { WidgetEntity } from '../types/entities/widget';
import type { PatchOf } from '../types/schema';

/**
 * Represents a Widget.
 * @extends {Base}
 */
class Widget extends Base implements WidgetEntity {
  declare id: WidgetEntity['id'];
  declare name: WidgetEntity['name'];
  declare instantInvite: WidgetEntity['instantInvite'];
  declare channels: WidgetEntity['channels'];
  declare members: WidgetEntity['members'];
  declare presenceCount: WidgetEntity['presenceCount'];

  constructor(client: import('../client/Client').default, data: RawWidgetData) {
    super(client);
    this._patch(data);
  }

  /**
   * Represents a channel in a Widget
   * @typedef {Object} WidgetChannel
   * @property {Snowflake} id Id of the channel
   * @property {string} name Name of the channel
   * @property {number} position Position of the channel
   */

  _patch(data: PatchOf<'Widget'>) {
    /**
     * The id of the guild.
     * @type {Snowflake}
     */
    if (data.id !== undefined) this.id = data.id;

    if (data.name !== undefined) {
      /**
       * The name of the guild.
       * @type {string}
       */
      this.name = data.name;
    }

    if (data.instant_invite !== undefined) {
      /**
       * The invite of the guild.
       * @type {?string}
       */
      this.instantInvite = data.instant_invite ?? undefined;
    }

    /**
     * The list of channels in the guild.
     * @type {Collection<Snowflake, WidgetChannel>}
     */
    this.channels = new Collection<string, WidgetChannel>();
    for (const channel of data.channels ?? []) {
      this.channels.set(channel.id, channel);
    }

    /**
     * The list of members in the guild.
     * These strings are just arbitrary numbers, they aren't Snowflakes.
     * @type {Collection<string, WidgetMember>}
     */
    this.members = new Collection<string, WidgetMember>();
    for (const member of data.members ?? []) {
      this.members.set(member.id, new WidgetMember(this.client, member));
    }

    if (data.presence_count !== undefined) {
      /**
       * The number of members online.
       * @type {number}
       */
      this.presenceCount = data.presence_count;
    }
  }

  /**
   * Update the Widget.
   * @returns {Promise<Widget>}
   */
  async fetch() {
    const data = await this.client.api.guilds(this.id, 'widget.json').get();
    this._patch(data);
    return this;
  }
}

export default Widget;
export { Widget };
