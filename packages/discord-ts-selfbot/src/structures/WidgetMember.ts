import Base from './Base';
import type { PresenceStatus, WidgetActivity } from '../../typings';
import type { RawWidgetMemberData } from '../../typings/rawDataTypes';

type RawWidgetMemberSource = RawWidgetMemberData & {
  deaf?: boolean;
  mute?: boolean;
  self_deaf?: boolean;
  self_mute?: boolean;
  suppress?: boolean;
  channel_id?: string;
};

/**
 * Represents a WidgetMember.
 * @extends {Base}
 */
class WidgetMember extends Base {
  declare id: string;
  declare username: string;
  declare discriminator: string;
  declare avatar: string | null;
  declare status: PresenceStatus;
  declare deaf: boolean | null;
  declare mute: boolean | null;
  declare selfDeaf: boolean | null;
  declare selfMute: boolean | null;
  declare suppress: boolean | null;
  declare channelId: string | null;
  declare avatarURL: string;
  declare activity: WidgetActivity | null;
  /**
   * Activity sent in a {@link WidgetMember}.
   * @typedef {Object} WidgetActivity
   * @property {string} name The name of the activity
   */

  constructor(client: import('../client/Client').default, data: RawWidgetMemberSource) {
    super(client);

    /**
     * The id of the user. It's an arbitrary number.
     * @type {string}
     */
    this.id = data.id;

    /**
     * The username of the member.
     * @type {string}
     */
    this.username = data.username;

    /**
     * The discriminator of the member.
     * @type {string}
     */
    this.discriminator = data.discriminator;

    /**
     * The avatar of the member.
     * @type {?string}
     */
    this.avatar = data.avatar;

    /**
     * The status of the member.
     * @type {PresenceStatus}
     */
    this.status = data.status;

    /**
     * If the member is server deafened
     * @type {?boolean}
     */
    this.deaf = data.deaf ?? null;

    /**
     * If the member is server muted
     * @type {?boolean}
     */
    this.mute = data.mute ?? null;

    /**
     * If the member is self deafened
     * @type {?boolean}
     */
    this.selfDeaf = data.self_deaf ?? null;

    /**
     * If the member is self muted
     * @type {?boolean}
     */
    this.selfMute = data.self_mute ?? null;

    /**
     * If the member is suppressed
     * @type {?boolean}
     */
    this.suppress = data.suppress ?? null;

    /**
     * The id of the voice channel the member is in, if any
     * @type {?Snowflake}
     */
    this.channelId = data.channel_id ?? null;

    /**
     * The avatar URL of the member.
     * @type {string}
     */
    this.avatarURL = data.avatar_url;

    /**
     * The activity of the member.
     * @type {?WidgetActivity}
     */
    this.activity = data.activity ?? null;
  }
}

export default WidgetMember;
export { WidgetMember };
