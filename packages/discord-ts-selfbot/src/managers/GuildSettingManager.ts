import BaseManager from './BaseManager';
import type { RawGuildSettingsData } from '../../typings';
import type { Guild } from '../structures/Guild';
/**
 * Manages API methods for users and stores their cache.
 * @extends {BaseManager}
 * @see {@link https://luna.gitlab.io/discord-unofficial-docs/user_settings.html}
 */
class GuildSettingManager extends BaseManager {
  #rawSetting: Partial<RawGuildSettingsData> = {};
  declare guildId: import('discord-api-types/v10').Snowflake;
  declare suppressEveryone?: boolean;
  declare suppressRoles?: boolean;
  declare muteScheduledEvents?: boolean;
  declare messageNotifications?: number;
  declare flags?: number;
  declare mobilePush?: boolean;
  declare muted?: boolean;
  declare muteConfig?: { endTime: Date; selectedTimeWindow: number } | null;
  declare hideMutedChannels?: boolean;
  declare channelOverrides?: object[];
  declare notifyHighlights?: number;
  declare version?: number;
  constructor(guild: Guild) {
    super(guild.client);
    /**
     * Guild Id
     * @type {?Snowflake}
     */
    this.guildId = guild.id;
  }

  /**
   * Raw data
   * @type {Object}
   */
  get raw() {
    return this.#rawSetting;
  }

  /**
   * Get the guild
   * @type {?Guild}
   * @readonly
   */
  get guild() {
    return this.client.guilds.cache.get(this.guildId);
  }

  /**
   * Patch data file
   * @private
   * @param {Object} data Raw Data to patch
   */
  _patch(data: Partial<RawGuildSettingsData> = {}) {
    this.#rawSetting = Object.assign(this.#rawSetting, data);
    this.client.emit('debug', `[SETTING > Guild ${this.guildId}] Sync setting`);
    if ('suppress_everyone' in data) {
      /**
       * Notification setting > Suppress `@everyone` and `@here`
       * @type {?boolean}
       */
      this.suppressEveryone = data.suppress_everyone;
    }
    if ('suppress_roles' in data) {
      /**
       * Notification setting > Suppress all role `@mention`
       * @type {?boolean}
       */
      this.suppressRoles = data.suppress_roles;
    }
    if ('mute_scheduled_events' in data) {
      /**
       * Notification setting > Mute new events
       * @type {?boolean}
       */
      this.muteScheduledEvents = data.mute_scheduled_events;
    }
    if ('message_notifications' in data) {
      /**
       * Notification setting > Message notifications
       * * `0`: All messages
       * * `1`: Only @mentions
       * * `2`: Nothing
       * @type {?number}
       */
      this.messageNotifications = data.message_notifications;
    }
    if ('flags' in data) {
      /**
       * Flags (unknown)
       * @type {?number}
       */
      this.flags = data.flags;
    }
    if ('mobile_push' in data) {
      /**
       * Notification setting > Mobile push notifications
       * @type {?boolean}
       */
      this.mobilePush = data.mobile_push;
    }
    if ('muted' in data) {
      /**
       * Mute server
       * @type {?boolean}
       */
      this.muted = data.muted;
    }
    if ('mute_config' in data && data.mute_config !== null) {
      /**
       * Mute config (muted = true)
       * * `muteConfig.endTime`: End time (Date)
       * * `muteConfig.selectedTimeWindow`: Selected time window (seconds) (number)
       * @type {?Object}
       */
      if (data.mute_config) {
        this.muteConfig = {
          endTime: new Date(data.mute_config.end_time),
          selectedTimeWindow: data.mute_config.selected_time_window,
        };
      }
    } else {
      this.muteConfig = null;
    }
    if ('hide_muted_channels' in data) {
      /**
       * Hide muted channels
       * @type {?boolean}
       */
      this.hideMutedChannels = data.hide_muted_channels;
    }
    if ('channel_overrides' in data) {
      /**
       * Channel overrides (unknown)
       * @type {?Array}
       */
      this.channelOverrides = data.channel_overrides ?? [];
    }
    if ('notify_highlights' in data) {
      /**
       * Notification setting > Suppress highlights
       * * `0`: ??? (unknown)
       * * `1`: Enable
       * * `2`: Disable
       * @type {?number}
       */
      this.notifyHighlights = data.notify_highlights;
    }
    if ('version' in data) {
      /**
       * Version (unknown)
       * @type {?number}
       */
      this.version = data.version;
    }
  }
  /**
   * Edit guild settings
   * @param {Object} data Data to edit
   * @returns {Promise<GuildSettingManager>}
   */
  async edit(data: Partial<RawGuildSettingsData>) {
    const data_ = await this.client.api.users('@me').guilds(this.guildId).settings.patch<RawGuildSettingsData>({
      data,
    });
    this._patch(data_);
    return this;
  }
}

export default GuildSettingManager;
export { GuildSettingManager };
